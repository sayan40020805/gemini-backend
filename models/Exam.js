import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String,
});

const examSchema = new mongoose.Schema(
  {
    title: {
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
    course: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    duration: {
      type: Number,
      required: true,
      default: 60,
    },
    questions: [questionSchema],
  },
  { timestamps: true }
);

// Check if the model already exists to prevent OverwriteModelError
const Exam = mongoose.models.Exam || mongoose.model("Exam", examSchema);
export default Exam;