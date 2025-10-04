import express from "express";
import {
  generateExam,
  submitAndScoreExam
} from "../controllers/enhancedExamController.js";

const router = express.Router();

// Enhanced exam routes with Gemini integration
router.post("/generate", generateExam);
router.post("/submit-and-score", submitAndScoreExam);

export default router;
