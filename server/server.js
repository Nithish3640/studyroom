import "dotenv/config";
import { protect } from "./middleware/auth.js";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Room from "./models/Room.js";
import User from "./models/User.js";

const app = express();
app.use(cors());
app.use(express.json());

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
})

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  res.status(201).json({ _id: user._id, name: user.name, email: user.email });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(5000, () => {
      console.log("Server is running on port 5000");  
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed:", err.message);
  });