import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  videoId: {
    type: String,
    required: true,
  },
  channelTitle: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model already exists to prevent OverwriteModelError
const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
export default Course;