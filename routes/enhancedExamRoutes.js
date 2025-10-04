import express from "express";
import {
  generateExam,
  submitAndScoreExam
} from "../controllers/enhancedExamController.js";

const router = express.Router();

// Enhanced exam routes with Gemini integration
router.post("/generate", generateExam);
router.post("/submit-and-score", submitAndScoreExam);

// GET /api/enhanced-exams/subjects
router.get("/subjects", (req, res) => {
  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "History",
    "Geography",
    "English Literature",
    "Economics",
    "Psychology"
  ];
  res.json({ subjects });
});

export default router;
