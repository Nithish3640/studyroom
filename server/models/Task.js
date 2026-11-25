import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
        title: { type: String, required: true, trim: true },
        status: { type: String, enum: ["todo", "doing", "done"], default: "todo" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

export default mongoose.model("Task", taskSchema);