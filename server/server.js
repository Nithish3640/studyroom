import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import express from "express";
import "dotenv/config";
import cors from "cors";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { protect } from "./middleware/auth.js";
import Room from "./models/Room.js";
import Task from "./models/Task.js";
import Note from "./models/Note.js";
import { askGemini } from "./services/gemini.js";
import authRoutes from "./routes/auth.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173" }
});

io.use((socket, next) => {
  try {
    const decoded = jwt.verify(socket.handshake.auth.token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch(err) {
    next(new Error("Not authorized"));
  }
})

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("join-room", async (roomId) => {
    try {
      const room = await Room.findOne({ _id: roomId, members: socket.userId });
      if (!room) return;
      socket.join(roomId);
      } catch(err) {
        console.log("join-room failed:", err.message);
    }
  });
  socket.on("disconnect", () => console.log("A user left:", socket.id));
})

app.get("/home", (req, res) => {
  res.send("Hello from my first server");
});

app.get("/api/rooms", protect, async (req, res) => {
  const rooms = await Room.find({ members: req.userId });
  res.json(rooms);
});

app.post("/api/rooms", protect, async (req, res) => {
  const joinCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  const newRoom = await Room.create({ 
    name: req.body.name, 
    joinCode,
    owner: req.userId,
    members: [req.userId],
  });
  res.status(201).json(newRoom);
});

app.post("/api/rooms/join", protect, async (req, res) => {
  const joinCode = req.body.joinCode?.toUpperCase();

  if (!joinCode) {
    return res.status(400).json({ message: "Join code is required" });
  }

  const room = await Room.findOneAndUpdate(
    { joinCode },
    { $addToSet: { members: req.userId } },
    { new: true }
  );

  if (!room) {
    return res.status(404).json({ message: "No room with that code"});
  }

  res.json(room);
});

app.post("/api/rooms/:roomId/tasks", protect, async (req, res) => {
  const room = await Room.findOne({ _id: req.params.roomId, members: req.userId});

  if (!room) {
    return res.status(403).json({ message: "You are not a member of this room" });
  }

  if (!req.body.title) {
    return res.status(400).json({ message: "Title is required" });
  }

  const task = await Task.create({
    room: room._id,
    title: req.body.title,
    createdBy: req.userId,
  });
  
  io.to(req.params.roomId).emit("task:created", task); 

  res.status(201).json(task);
});

app.get("/api/rooms/:roomId/tasks", protect, async (req, res) => {
  const room = await Room.findOne({ _id: req.params.roomId, members: req.userId });
  if (!room) {
    return res.status(403).json({ message: "You are not a member of this room" });
  }

  const tasks = await Task.find({ room: room._id }).sort({ createdAt: 1 });
  res.json(tasks);
});

app.patch("/api/tasks/:taskId", protect, async (req, res) => {
  const { status } = req.body;

  if (!["todo", "doing", "done"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const task = await Task.findById(req.params.taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  const room = await Room.findOne({ _id: task.room, members: req.userId });
  if (!room) {
    return res.status(403).json({ message: "You are not a member of this room" });
  }

  task.status = status;
  await task.save();

  io.to(task.room.toString()).emit("task:updated", task);

  res.json(task);
});

app.get("/api/rooms/:roomId/note", protect, async (req, res) => {
  const room = await Room.findOne({ _id: req.params.roomId, members: req.userId });
  if (!room) {
    return res.status(403).json({ message: "You are not a member of this room" });
  }

  const note = await Note.findOne({ room: room._id });
  res.json(note || { content: "" });
});

app.put("/api/rooms/:roomId/note", protect, async (req, res) => {
  const room = await Room.findOne({ _id: req.params.roomId, members: req.userId });
  if (!room) {
    return res.status(403).json({ message: "You are not a member of this room" });
  }

  const note = await Note.findOneAndUpdate(
    { room: room._id },
    { content: req.body.content ?? "", updatedBy: req.userId },
    { new: true, upsert: true }
  );

  io.to(req.params.roomId).emit("note:updated", note);
  res.json(note);
});

app.post("/api/rooms/:roomId/summarize", protect, async (req, res) => {
  const room = await Room.findOne({ _id: req.params.roomId, members: req.userId });
  if (!room) {
    return res.status(403).json({ message: "You are not a member of this room" });
  }

  const note = await Note.findOne({ room: room._id });
  if (!note || !note.content.trim()) {
    return res.status(400).json({ message: "Write some notes first" });
  }

  try {
    console.log("NOTE CONTENT:", note.content);
    const summary = await askGemini(
      `Summarize these study notes in 5 short bullet points:\n\n${note.content}`
    );
    res.json({ summary });
  } catch (err) {
    res.status(503).json({ message: "AI is busy, try again in a moment" });
  }
});

app.post("/api/rooms/:roomId/generate-tasks", protect, async (req, res) => {
  const room = await Room.findOne({ _id: req.params.roomId, members: req.userId });
  if (!room) {
    return res.status(403).json({ message: "You are not a member of this room" });
  }

  const note = await Note.findOne({ room : room._id });
  if (!note || !note.content.trim()) {
    return res.status(400).json({ message: "Write some notes first" });
  }

  try{
    const reply = await askGemini(
      `Read these study notes and write 3 to 5 short study tasks. ` +
      `Reply with one task per line. No numbers, no bullets, no extra text.\n\n${note.content}`
    );
  
    const titles = reply
    .split("\n")
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 5);

    if (titles.length === 0) {
      return res.status(502).json({ message: "AI returned no tasks, try again" });
    }

    const tasks = await Task.insertMany(
      titles.map((title) => ({
        room: room._id,
        title,
        createdBy: req.userId,
      }))
    );
  
    tasks.forEach((task) => {
      io.to(req.params.roomId).emit("task:created", task);
    });
  
    res.status(201).json(tasks);
  } catch (err) {
      res.status(503).json({ message: "AI is busy, try again in a moment" });
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(5000, () => {
      console.log("Server is running on port 5000");  
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed:", err.message);
  });