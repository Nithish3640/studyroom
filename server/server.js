import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/home", (req, res) => {
  res.send("Hello from my first server");
});

let rooms = [
  { id: 1, name: "DSA Study Group"},
  { id: 2, name: "React Practice" },
];

app.get("/api/rooms", (req, res) => {
  res.json(rooms);
});

app.post("/api/rooms", (req, res) => {
  const newRoom = { id: Date.now(), name: req.body.name};
  rooms.push(newRoom);
  res.status(201).json(newRoom);
})

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});