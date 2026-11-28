import { Router } from "express";
import crypto from "crypto";
import { protect } from "../middleware/auth.js";
import Room from "../models/Room.js";

const router = Router();

router.get("/", protect, async (req, res) => {
    const rooms = await Room.find({ members: req.userId });
    res.json(rooms);
  });

router.post("/", protect, async (req, res) => {
  const joinCode = crypto.randomBytes(3).toString("hex").toUpperCase();
  const newRoom = await Room.create({ 
    name: req.body.name, 
    joinCode,
    owner: req.userId,
    members: [req.userId],
  });
  res.status(201).json(newRoom);
});

router.post("/join", protect, async (req, res) => {
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

export default router;