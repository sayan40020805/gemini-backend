import EnhancedExam from "../models/EnhancedExam.js";
import EnhancedSubmission from "../models/EnhancedSubmission.js";
import User from "../models/User.js";
// POST /api/enhanced-exams/generate
export const generateExam = async (req, res) => {
  try {
    const { subject, questionCount, difficulty = "medium" } = req.body;

    if (!subject || !questionCount) {
      return res.status(400).json({
        success: false,
        error: "Subject and question count are required"
      });
    }

    if (questionCount < 1 || questionCount > 50) {
      return res.status(400).json({
        success: false,
        error: "Question count must be between 1 and 50"
      });
    }

    // Since exam generation is moved to frontend, just return an error or placeholder
    return res.status(400).json({
      success: false,
      error: "Exam generation is now handled on the frontend. This endpoint is disabled."
    });
  } catch (err) {
    console.error("Generate exam error:", err.message);
    res.status(500).json({
      success: false,
      error: `Failed to generate exam: ${err.message}`
    });
  }
};

// GET /api/enhanced-exams/subjects
export const getAvailableSubjects = (req, res) => {
  // Return a list of common subjects as suggestions
  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "History",
    "Geography",
    "English",
    "Economics",
    "Political Science"
  ];
  res.status(200).json({ success: true, subjects });
};

// POST /api/enhanced-exams/submit-and-score
export const submitAndScoreExam = async (req, res) => {
  try {
    const { userId, examId, answers } = req.body;

    if (!userId || !examId || !answers) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    const exam = await EnhancedExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: "Exam not found"
      });
    }

    // Score the exam
    let score = 0;
    const results = [];

    exam.questions.forEach((question) => {
      const userAnswerObj = answers.find(a => a.questionId === question._id.toString());
      const userAnswer = userAnswerObj ? userAnswerObj.answer : null;
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) score++;
      results.push({
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });
    });

    const totalQuestions = exam.questions.length;
    const percentage = (score / totalQuestions) * 100;

    // Save submission
    const submission = new EnhancedSubmission({
      userId,
      examId,
      answers,
      score,
      results,
      submittedAt: new Date()
    });

    await submission.save();

    // Automatically add to user's marks
    const user = await User.findById(userId);
    if (user) {
      user.marks.push({
        examName: exam.title,
        marks: score,
        totalMarks: totalQuestions,
        percentage,
        date: new Date()
      });
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: "Exam submitted and scored successfully",
      score,
      totalQuestions,
      percentage,
      results
    });
  } catch (err) {
    console.error("Submit and score exam error:", err.message);
    res.status(500).json({
      success: false,
      error: `Failed to submit and score exam: ${err.message}`
    });
  }
};

// GET /api/enhanced-exams/user/:userId/history
export const getUserExamHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const submissions = await EnhancedSubmission.find({ userId })
      .populate('examId', 'title subject difficulty')
      .sort({ submittedAt: -1 });

    const formattedSubmissions = submissions.map(sub => ({
      examName: sub.examId?.title || 'Enhanced Exam',
      subject: sub.examId?.subject || 'General',
      difficulty: sub.examId?.difficulty || 'medium',
      score: sub.score,
      totalQuestions: sub.results.length,
      percentage: sub.results.length > 0 ? (sub.score / sub.results.length) * 100 : 0,
      date: sub.submittedAt,
      type: 'enhanced',
      results: sub.results
    }));

    res.status(200).json({
      success: true,
      submissions: formattedSubmissions
    });
  } catch (err) {
    console.error("Get user enhanced exam history error:", err.message);
    res.status(500).json({
      success: false,
      error: `Failed to fetch enhanced exam history: ${err.message}`
    });
  }
};
