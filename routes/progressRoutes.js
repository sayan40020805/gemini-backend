import express from "express";
import {
  updateProgress,
  getProgress,
} from "../controllers/progressController.js";

const router = express.Router();

router.post("/update", updateProgress);
router.get("/:userId/:courseId", getProgress);

export default router;
