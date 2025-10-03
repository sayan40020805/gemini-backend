import express from "express";
import { saveNote, getNotes } from "../controllers/notesController.js";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: 'uploads/temp/' });

router.post("/save", protect, upload.single('pdf'), saveNote);
router.get("/", protect, getNotes);

export default router;
