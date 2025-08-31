import express from "express";
import {
  updateProgress,
  getUserProgress,
} from "../controllers/progressController.js";

const router = express.Router();

router.post("/update", updateProgress);
router.get("/:userId/:courseId", getUserProgress);

export default router;