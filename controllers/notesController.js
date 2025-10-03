import Note from "../models/Note.js";
import fs from "fs";
import path from "path";

// POST /api/notes/save
export const saveNote = async (req, res) => {
  try {
    const { subject, topic, department, semester } = req.body;

    if (!subject || !topic || !department || !semester || !req.file) {
      return res.status(400).json({ error: "Missing required fields or file" });
    }

    // Check if file is PDF
    if (req.file.mimetype !== 'application/pdf') {
      fs.unlinkSync(req.file.path); // Delete the uploaded file
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      fs.unlinkSync(req.file.path);
      return res.status(413).json({ error: "File size exceeds 10MB limit" });
    }

    // Create notes directory if it doesn't exist
    const notesDir = path.join('uploads', 'notes');
    if (!fs.existsSync(notesDir)) {
      fs.mkdirSync(notesDir, { recursive: true });
    }

    // Generate unique filename
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = path.join(notesDir, fileName);

    // Move file to notes directory
    fs.renameSync(req.file.path, filePath);

    const note = new Note({
      userId: req.user.id,
      subject,
      topic,
      department,
      semester,
      noteLink: `/uploads/notes/${fileName}`,
      fileName: req.file.originalname,
    });

    await note.save();
    res.status(201).json({ message: "Note saved successfully", note });
  } catch (err) {
    console.error("Save note error:", err.message);
    res.status(500).json({ error: "Failed to save note" });
  }
};

// GET /api/notes?department=CSE&semester=4&subject=Math
export const getNotes = async (req, res) => {
  try {
    const { department, semester, subject } = req.query;
    const filter = { userId: req.user.id };

    if (department) filter.department = department;
    if (semester) filter.semester = parseInt(semester);
    if (subject) filter.subject = subject;

    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    console.error("Fetch notes error:", err.message);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};
