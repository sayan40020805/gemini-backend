import Exam from "../models/Exam.js";
import Submission from "../models/Submission.js";

// POST /api/exams/create
export const createExam = async (req, res) => {
  try {
    const { title, department, semester, questions } = req.body;

    if (
      !title ||
      !department ||
      !semester ||
      !questions ||
      questions.length === 0
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const exam = new Exam({
      title,
      department,
      semester,
      questions,
    });

    await exam.save();
    res.status(201).json({ message: "Exam created successfully", exam });
  } catch (err) {
    console.error("Create exam error:", err.message);
    res.status(500).json({ error: "Failed to create exam" });
  }
};

// GET /api/exams?department=CSE&semester=4
export const getExams = async (req, res) => {
  try {
    const { department, semester } = req.query;
    const filter = {};

    if (department) filter.department = department;
    if (semester) filter.semester = semester;

    const exams = await Exam.find(filter).sort({ createdAt: -1 });
    res.status(200).json(exams);
  } catch (err) {
    console.error("Fetch exams error:", err.message);
    res.status(500).json({ error: "Failed to fetch exams" });
  }
};

// POST /api/exams/submit
export const submitExam = async (req, res) => {
  try {
    const { userId, examId, answers } = req.body;

    if (!userId || !examId || !answers) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const submission = new Submission({
      userId,
      examId,
      answers,
    });

    await submission.save();
    res.status(201).json({ message: "Submission successful", submission });
  } catch (err) {
    console.error("Submit exam error:", err.message);
    res.status(500).json({ error: "Failed to submit exam" });
  }
};
