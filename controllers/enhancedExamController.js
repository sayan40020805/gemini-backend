import EnhancedExam from "../models/EnhancedExam.js";
import EnhancedSubmission from "../models/EnhancedSubmission.js";
import User from "../models/User.js";
import OpenAI from "openai";

// POST /api/enhanced-exams/generate
export const generateExam = async (req, res) => {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error("DEEPSEEK_API_KEY is not configured.");
      return res.status(500).json({
        success: false,
        error: "The API key for the AI service is not configured on the server."
      });
    }

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

    const prompt = `Generate ${questionCount} multiple choice questions for the subject "${subject}" at ${difficulty} difficulty level.
    Each question should have 4 options (A, B, C, D) with one correct answer.
    Return the response in JSON format with this structure:
    {
      "questions": [
        {
          "question": "question text",
          "options": ["option1", "option2", "option3", "option4"],
          "correctAnswer": "A",
          "explanation": "brief explanation"
        }
      ]
    }`;

    const client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.deepseek.com",
    });

    console.log("Sending prompt to Deepseek:", prompt);

    const completion = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content;

    console.log("Deepseek raw response:", text);

    // Parse Gemini response
    let examData;
    try {
      let cleanedText = text.trim();

      // Remove markdown code block markers if present
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');

      console.log("Cleaned text:", cleanedText);

      // Try to find JSON object with regex
      let jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Try alternative: look for content between first { and last }
        const startIndex = cleanedText.indexOf('{');
        const endIndex = cleanedText.lastIndexOf('}');
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          const jsonString = cleanedText.substring(startIndex, endIndex + 1);
          console.log("Alternative JSON extraction:", jsonString);
          examData = JSON.parse(jsonString);
        } else {
          console.error("No JSON object found in response");
          throw new Error("Invalid response format from Gemini");
        }
      } else {
        console.log("JSON match:", jsonMatch[0]);
        examData = JSON.parse(jsonMatch[0]);
      }

      if (!examData.questions || !Array.isArray(examData.questions)) {
        throw new Error("Invalid questions format");
      }

      const validAnswers = ['A', 'B', 'C', 'D'];
      examData.questions.forEach((q, index) => {
        if (!q.question || !q.options || !q.correctAnswer || !q.explanation) {
          throw new Error(`Question ${index + 1} is missing required fields`);
        }
        if (!validAnswers.includes(q.correctAnswer)) {
          throw new Error(`Question ${index + 1} has invalid correctAnswer: ${q.correctAnswer}`);
        }
        if (q.options.length !== 4) {
          throw new Error(`Question ${index + 1} must have exactly 4 options`);
        }
      });
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Raw Gemini response:", text);
      return res.status(500).json({
        success: false,
        error: `Failed to parse exam data: ${parseError.message}. Raw response: ${text.substring(0, 500)}...`
      });
    }

    // Save exam
    const exam = new EnhancedExam({
      title: `${subject} Exam - ${questionCount} Questions`,
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
      // Fallback to mock exam generation when API fails
      console.log("🔄 Falling back to mock exam generation due to API error");

      const mockQuestions = [
        {
          question: `What is the basic concept of ${subject}?`,
          options: ["Definition A", "Definition B", "Definition C", "Definition D"],
          correctAnswer: "A",
          explanation: `This is the fundamental concept of ${subject}.`
        },
        {
          question: `Which of the following is most important in ${subject}?`,
          options: ["Concept A", "Concept B", "Concept C", "Concept D"],
          correctAnswer: "B",
          explanation: `This concept is crucial for understanding ${subject}.`
        },
        {
          question: `How does ${subject} work in practice?`,
          options: ["Method A", "Method B", "Method C", "Method D"],
          correctAnswer: "C",
          explanation: `This method demonstrates practical application of ${subject}.`
        }
      ];

      // Generate requested number of questions (repeat if needed)
      const questions = [];
      for (let i = 0; i < questionCount; i++) {
        questions.push(mockQuestions[i % mockQuestions.length]);
      }

      const exam = new EnhancedExam({
        title: `${subject} Exam - ${questionCount} Questions (Mock)`,
        subject: subject,
        questionCount: questionCount,
        difficulty: difficulty,
        questions: questions,
        isGenerated: true
      });

      await exam.save();

      res.status(201).json({
        success: true,
        message: "Exam generated successfully (using mock data)",
        exam: {
          id: exam._id,
          title: exam.title,
          questions: exam.questions,
          subject: exam.subject,
          questionCount: exam.questionCount
        }
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
