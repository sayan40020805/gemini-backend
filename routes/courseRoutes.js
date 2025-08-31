import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
} from "../controllers/courseController.js";

const router = express.Router();

// POST: Create a new course
router.post("/create", createCourse);

// GET: Fetch all courses
router.get("/", getAllCourses);

// GET: Fetch single course by ID
router.get("/:id", getCourseById);

export default router;
