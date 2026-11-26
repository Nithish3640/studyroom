import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    { 
        room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, unique: true},
        content: { type: String, default: "" },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User "},
    },
    { timeStamps: true }
);

export default mongoose.model("Note", noteSchema);