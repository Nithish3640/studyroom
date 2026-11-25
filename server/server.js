import "dotenv/config";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import Room from "./models/Room.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/home", (req, res) => {
  res.send("Hello from my first server");
});

app.get("/api/rooms", async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
});

app.post("/api/rooms", async (req, res) => {
  const newRoom = await Room.create({ name: req.body.name });
  res.status(201).json(newRoom);
})

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