import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
  },
  answers: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

// Check if the model already exists to prevent OverwriteModelError
const Submission = mongoose.models.Submission || mongoose.model("Submission", submissionSchema);
export default Submission;