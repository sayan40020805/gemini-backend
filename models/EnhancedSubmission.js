import mongoose from "mongoose";

const enhancedSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EnhancedExam",
    required: true,
  },
  answers: [
    {
      questionId: {
        type: String,
        required: true,
      },
      answer: {
        type: String,
        required: true,
      },
    },
  ],
  score: {
    type: Number,
    required: true,
  },
  results: [
    {
      question: String,
      userAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean,
      explanation: String
    }
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const EnhancedSubmission = mongoose.models.EnhancedSubmission || mongoose.model("EnhancedSubmission", enhancedSubmissionSchema);
export default EnhancedSubmission;