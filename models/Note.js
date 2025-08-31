import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    noteLink: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Check if the model already exists to prevent OverwriteModelError
const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);
export default Note;