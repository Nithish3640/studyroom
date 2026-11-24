import express from "express";

const app = express();

app.get("/hello", (req, res) => {
    res.send("Hello from my first server!");
});

app.get("/api/rooms", (req, res) =>{
    res.json([
        { id: 1, name: "DSA Study Group" },
        { id:2, name: "React Practice"},
    ]);
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});