import express from "express";
import {
  createExam,
  getAllExams,
  getExamById,
  submitExam,
  getUserExamHistory,
} from "../controllers/examController.js";

const router = express.Router();

router.post("/create", createExam);
router.get("/", getAllExams);
router.get("/:id", getExamById);
router.post("/:id/submit", submitExam);
router.get("/user/:userId/history", getUserExamHistory);

export default router;