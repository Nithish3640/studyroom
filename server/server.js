import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/home", (req, res) => {
  res.send("Hello from my first server");
});

app.get("/api/rooms", (req, res) => {
  res.json([
    { id: 1, name: "DSA Study Group"},
    { id: 2, name: "React Practice" }
  ])
})

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});