import EnhancedExam from "../models/EnhancedExam.js";
import EnhancedSubmission from "../models/EnhancedSubmission.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Check if GEMINI_API_KEY is available
let genAI;
let model;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
} else {
  console.warn("⚠️  GEMINI_API_KEY is not configured. Enhanced exam generation will be disabled.");
}

// Available subjects
const SUBJECTS = {
  MATH: "Mathematics",
  SCIENCE: "Science",
  ENGLISH: "English",
  PHYSICS: "Physics",
  CHEMISTRY: "Chemistry",
  BIOLOGY: "Biology",
  COMPUTER: "Computer Science",
  HISTORY: "History",
  GEOGRAPHY: "Geography"
};

// POST /api/enhanced-exams/generate
export const generateExam = async (req, res) => {
  try {
    const { subject, questionCount, difficulty = "medium" } = req.body;

    // Check if GEMINI_API_KEY is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        success: false,
        error: "GEMINI_API_KEY is not configured. Please check your environment variables." 
      });
    }

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

    // Validate subject
    if (!SUBJECTS[subject]) {
      return res.status(400).json({ 
        success: false,
        error: `Invalid subject: ${subject}. Valid subjects are: ${Object.keys(SUBJECTS).join(', ')}` 
      });
    }

    const prompt = `Generate ${questionCount} multiple choice questions for ${SUBJECTS[subject]} at ${difficulty} difficulty level. 
    Each question should have 4 options (A, B, C, D) with one correct answer.
    Return the response in JSON format with this structure:
    {
      "questions": [
        {
          "question": "question text",
          "options": ["option1", "option2", "option3", "option4"],
          "correctAnswer": "A/B/C/D",
          "explanation": "brief explanation"
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean and parse the response
    let examData;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format from Gemini");
      }
      
      examData = JSON.parse(jsonMatch[0]);
      
      if (!examData.questions || !Array.isArray(examData.questions)) {
        throw new Error("Invalid questions format");
      }
      
      // Validate each question has required fields
      examData.questions.forEach((q, index) => {
        if (!q.question || !q.options || !q.correctAnswer || !q.explanation) {
          throw new Error(`Question ${index + 1} is missing required fields`);
        }
      });
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return res.status(500).json({ 
        success: false,
        error: `Failed to parse exam data: ${parseError.message}` 
      });
    }
    
    // Create enhanced exam in database
    const exam = new EnhancedExam({
      title: `${SUBJECTS[subject]} Exam - ${questionCount} Questions`,
      subject: subject,
      questionCount: questionCount,
      difficulty: difficulty,
      questions: examData.questions,
      isGenerated: true
    });

    await exam.save();
    
    res.status(201).json({
      success: true,
      message: "Exam generated successfully",
      exam: {
        id: exam._id,
        title: exam.title,
        questions: exam.questions,
        subject: exam.subject,
        questionCount: exam.questionCount
      }
    });
  } catch (err) {
    console.error("Generate exam error:", err.message);
    res.status(500).json({ 
      success: false,
      error: `Failed to generate exam: ${err.message}` 
    });
  }
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

    let correctAnswers = 0;
    const results = [];
    const formattedAnswers = [];

    exam.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) correctAnswers++;
      
      results.push({
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      });

      // Format answers to match Submission schema
      formattedAnswers.push({
        questionId: question._id || index.toString(),
        answer: userAnswer
      });
    });

    const score = (correctAnswers / exam.questions.length) * 100;
    
    const submission = new EnhancedSubmission({
      userId,
      examId,
      answers: formattedAnswers,
      score,
      results,
      submittedAt: new Date()
    });

    await submission.save();

    res.status(201).json({
      success: true,
      message: "Exam submitted successfully",
      score: Math.round(score),
      correctAnswers,
      totalQuestions: exam.questions.length,
      results
    });
  } catch (err) {
    console.error("Submit and score exam error:", err.message);
    res.status(500).json({ 
      success: false,
      error: `Failed to submit exam: ${err.message}` 
    });
  }
};

// GET /api/enhanced-exams/subjects
export const getAvailableSubjects = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      subjects: Object.entries(SUBJECTS).map(([key, value]) => ({
        key,
        name: value
      }))
    });
  } catch (err) {
    console.error("Get subjects error:", err.message);
    res.status(500).json({ 
      success: false,
      error: `Failed to fetch subjects: ${err.message}` 
    });
  }
};

// GET /api/enhanced-exams/user/:userId/history
export const getUserExamHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const submissions = await EnhancedSubmission.find({ userId })
      .populate('examId', 'title subject questionCount')
      .sort({ submittedAt: -1 });

    // Format the submissions to match dashboard expectations
    const formattedSubmissions = submissions.map(sub => ({
      examName: sub.examId?.title || 'Enhanced Exam',
      marks: Math.round(sub.score),
      totalMarks: 100,
      percentage: Math.round(sub.score),
      date: sub.submittedAt,
      subject: sub.examId?.subject || 'General',
      type: 'enhanced',
      score: sub.score,
      correctAnswers: sub.results?.filter(r => r.isCorrect).length || 0,
      totalQuestions: sub.results?.length || 0
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