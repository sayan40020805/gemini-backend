import express from "express";
import {
  saveCourse,
  getUserCourses,
  deleteCourse,
} from "../controllers/courseController.js";
import { getEnhancedCourses } from "../controllers/enhancedCourseController.js";

const router = express.Router();

// POST: Save a new course
router.post("/save", saveCourse);

// GET: Fetch all courses for a user
router.get("/user/:userId", getUserCourses);

// GET: Fetch all courses (for free courses page)
router.get("/", getEnhancedCourses);

// DELETE: Delete a course by ID
router.delete("/:id", deleteCourse);

export default router;