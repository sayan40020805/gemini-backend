import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  addMarks,
  deleteMarks,
  getUserDashboard,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/signup", register); // Add signup endpoint that maps to register
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/marks", protect, addMarks);
router.delete("/marks/:markId", protect, deleteMarks);
router.get("/dashboard", protect, getUserDashboard);

export default router;
