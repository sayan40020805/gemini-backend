import EnhancedExam from "../models/EnhancedExam.js";
import EnhancedSubmission from "../models/EnhancedSubmission.js";
import User from "../models/User.js";
import OpenAI from "openai";

// POST /api/enhanced-exams/generate
export const generateExam = async (req, res) => {
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

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("API key not configured");
    }

    const prompt = "Generate " + questionCount + " multiple choice questions for the subject \"" + subject + "\" at " + difficulty + " difficulty level.\n" +
      "Each question should have 4 options (A, B, C, D) with one correct answer.\n" +
      "Return the response in JSON format with this structure:\n" +
      "{\n" +
      "  \"questions\": [\n" +
      "    {\n" +
      "      \"question\": \"question text\",\n" +
      "      \"options\": [\"option1\", \"option2\", \"option3\", \"option4\"],\n" +
      "      \"correctAnswer\": \"A\",\n" +
      "      \"explanation\": \"brief explanation\"\n" +
      "    }\n" +
      "  ]\n" +
      "}";

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
          throw new Error("Question " + (index + 1) + " is missing required fields");
        }
        if (!validAnswers.includes(q.correctAnswer)) {
          throw new Error("Question " + (index + 1) + " has invalid correctAnswer: " + q.correctAnswer);
        }
        if (q.options.length !== 4) {
          throw new Error("Question " + (index + 1) + " must have exactly 4 options");
        }
      });
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Raw Gemini response:", text);
      return res.status(500).json({
        success: false,
        error: "Failed to parse exam data: " + parseError.message + ". Raw response: " + text.substring(0, 500) + "..."
      });
    }

    // Save exam
    const exam = new EnhancedExam({
      title: subject + " Exam - " + questionCount + " Questions",
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
    // Fallback to mock exam generation when API fails or API key missing
    console.log("🔄 Falling back to mock exam generation due to API error");

    const mockQuestions = [
      {
        question: "What is the basic concept of " + subject + "?",
        options: ["The fundamental principle", "An advanced technique", "A historical event", "A specific example"],
        correctAnswer: "A",
        explanation: "This is the fundamental concept of " + subject + "."
      },
      {
        question: "Which of the following is most important in " + subject + "?",
        options: ["Core theory", "Practical application", "Historical context", "Future developments"],
        correctAnswer: "B",
        explanation: "This concept is crucial for understanding " + subject + "."
      },
      {
        question: "How does " + subject + " work in practice?",
        options: ["Through complex algorithms", "Via systematic processes", "Using traditional methods", "With modern technology"],
        correctAnswer: "C",
        explanation: "This method demonstrates practical application of " + subject + "."
      }
    ];

    // Generate requested number of questions (repeat if needed)
    const questions = [];
    for (let i = 0; i < questionCount; i++) {
      questions.push(mockQuestions[i % mockQuestions.length]);
    }

    const exam = new EnhancedExam({
      title: subject + " Exam - " + questionCount + " Questions (Mock)",
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

// POST /api/enhanced-exams/submit-and-score
export const submitAndScoreExam = async (req, res) => {
  try {
    const { userId, examId, answers } = req.body;

    if (!userId || !examId || !answers) {
      return res.status(400).json({
        success: false,
        error: "userId, examId, and answers are required"
      });
    }

    // Find the exam
    const exam = await EnhancedExam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: "Exam not found"
      });
    }

    let score = 0;
    const results = exam.questions.map((question, index) => {
      const userAnswerObj = answers.find(a => a.questionId === question._id.toString());
      const userAnswer = userAnswerObj ? userAnswerObj.answer : null;
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) score++;
      return {
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation
      };
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
      error: "Failed to submit and score exam: " + err.message
    });
  }
};
