import express from "express";
import { uploadNote, getNotes } from "../controllers/notesController.js";

const router = express.Router();

router.post("/upload", uploadNote);
router.get("/", getNotes);

export default router;
