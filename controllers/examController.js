import Exam from "../models/Exam.js";
import Submission from "../models/Submission.js";
import User from "../models/User.js";

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

export const getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }
    res.status(200).json(exam);
  } catch (err) {
    console.error("Get exam by ID error:", err.message);
    res.status(500).json({ error: "Failed to fetch exam" });
  }
};

// GET /api/exams?department=CSE&semester=4
export const getAllExams = async (req, res) => {
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

    // Get exam details for marks entry
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const submission = new Submission({
      userId,
      examId,
      answers,
    });

    await submission.save();

    // Automatically add to user's marks (placeholder for traditional exams)
    const user = await User.findById(userId);
    if (user) {
      user.marks.push({
        examName: exam.title,
        marks: 0, // Will be updated when graded
        totalMarks: 100, // Default total marks
        percentage: 0, // Will be updated when graded
        date: new Date()
      });
      await user.save();
    }

    res.status(201).json({
      message: "Submission successful",
      submission,
      note: "Exam submitted successfully. Results will be available after grading."
    });
  } catch (err) {
    console.error("Submit exam error:", err.message);
    res.status(500).json({ error: "Failed to submit exam" });
  }
};

// GET /api/exams/user/:userId/history
export const getUserExamHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const submissions = await Submission.find({ userId })
      .populate('examId', 'title department semester')
      .sort({ submittedAt: -1 });

    // Format the submissions to match dashboard expectations
    const formattedSubmissions = submissions.map(sub => ({
      examName: sub.examId?.title || 'Traditional Exam',
      marks: 0, // Traditional exams don't have automatic scoring
      totalMarks: 100,
      percentage: 0,
      date: sub.submittedAt,
      subject: sub.examId?.department || 'General',
      type: 'traditional',
      score: 0,
      correctAnswers: 0,
      totalQuestions: 0
    }));

    res.status(200).json({
      success: true,
      submissions: formattedSubmissions
    });
  } catch (err) {
    console.error("Get user exam history error:", err.message);
    res.status(500).json({ 
      success: false,
      error: `Failed to fetch exam history: ${err.message}` 
    });
  }
};