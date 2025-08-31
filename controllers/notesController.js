import Note from "../models/Note.js";

// POST /api/notes/save
export const saveNote = async (req, res) => {
  try {
    const { topic, department, semester, content } = req.body;

    if (!topic || !department || !semester || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const note = new Note({
      topic,
      department,
      semester,
      content,
    });

    await note.save();
    res.status(201).json({ message: "Note saved successfully", note });
  } catch (err) {
    console.error("Save note error:", err.message);
    res.status(500).json({ error: "Failed to save note" });
  }
};

// GET /api/notes?department=CSE&semester=4
export const getNotes = async (req, res) => {
  try {
    const { department, semester } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (semester) filter.semester = semester;

    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    console.error("Fetch notes error:", err.message);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};