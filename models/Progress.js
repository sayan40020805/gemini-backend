import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: String, // or mongoose.Schema.Types.ObjectId if linked to a Course model
      required: true,
    },
    completedLectures: [String], // store lecture IDs or titles
  },
  { timestamps: true }
);

const Progress = mongoose.model("Progress", progressSchema);
export default Progress;
