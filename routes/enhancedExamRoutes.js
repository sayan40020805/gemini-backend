import express from "express";
import {
  generateExam,
  submitAndScoreExam,
  getAvailableSubjects,
  getUserExamHistory
} from "../controllers/enhancedExamController.js";

const router = express.Router();

// Enhanced exam routes with Gemini integration
router.post("/generate", generateExam);
router.post("/submit-and-score", submitAndScoreExam);
router.get("/subjects", getAvailableSubjects);
router.get("/user/:userId/history", getUserExamHistory);

export default router;