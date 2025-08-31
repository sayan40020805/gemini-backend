import mongoose from "mongoose";

const enhancedQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    required: true
  }
});

const enhancedExamSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    questionCount: {
      type: Number,
      required: true,
      min: 1,
      max: 50
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    questions: [enhancedQuestionSchema],
    isGenerated: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const EnhancedExam = mongoose.models.EnhancedExam || mongoose.model("EnhancedExam", enhancedExamSchema);
export default EnhancedExam;