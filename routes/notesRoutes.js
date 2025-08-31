import express from "express";
import { saveNote, getNotes } from "../controllers/notesController.js";

const router = express.Router();

router.post("/save", saveNote);
router.get("/", getNotes);

export default router;