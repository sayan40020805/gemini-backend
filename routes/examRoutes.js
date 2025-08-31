import express from "express";
import {
  createExam,
  getAllExams,
  getExamById,
  submitExam,
} from "../controllers/examController.js";

const router = express.Router();

router.post("/create", createExam);
router.get("/", getAllExams);
router.get("/:id", getExamById);
router.post("/:id/submit", submitExam);

export default router;
