const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key');

const generateTopicQuiz = async (req, res) => {
  try {
    const { topic, questionCount } = req.body;
    
    if (!topic || !questionCount) {
      return res.status(400).json({ error: 'Topic and question count are required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Generate ${questionCount} multiple choice questions about ${topic}. 
    Each question should have:
    - A clear question
    - 4 options (A, B, C, D)
    - The correct answer (0-3)
    - A brief explanation
    
    Format as valid JSON array:
    [{
      "question": "question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0,
      "explanation": "explanation text"
    }]
    
    Make questions appropriate for learning and understanding.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    let questions;
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(text);
      }
    } catch (parseError) {
      // Fallback: create sample questions if parsing fails
      questions = generateSampleQuestions(topic, questionCount);
    }
    
    // Calculate timing (2 minutes per question)
    const timePerQuestion = 2; // minutes
    const totalTime = questionCount * timePerQuestion;
    
    res.json({
      success: true,
      topic,
      questions,
      totalQuestions: questionCount,
      totalTime,
      timePerQuestion
    });

  } catch (error) {
    console.error('Error generating quiz:', error);
    // Return sample questions as fallback
    const questions = generateSampleQuestions(req.body.topic, req.body.questionCount);
    res.json({
      success: true,
      topic: req.body.topic,
      questions,
      totalQuestions: req.body.questionCount,
      totalTime: req.body.questionCount * 2,
      timePerQuestion: 2
    });
  }
};

// Fallback function to generate sample questions
function generateSampleQuestions(topic, count) {
  const sampleQuestions = [
    {
      question: `What is the basic concept of ${topic}?`,
      options: ["Definition A", "Definition B", "Definition C", "Definition D"],
      correctAnswer: 0,
      explanation: `This is the fundamental concept of ${topic}.`
    },
    {
      question: `Which of the following is most important in ${topic}?`,
      options: ["Concept A", "Concept B", "Concept C", "Concept D"],
      correctAnswer: 1,
      explanation: `This concept is crucial for understanding ${topic}.`
    },
    {
      question: `How does ${topic} work in practice?`,
      options: ["Method A", "Method B", "Method C", "Method D"],
      correctAnswer: 2,
      explanation: `This method demonstrates practical application of ${topic}.`
    }
  ];
  
  // Return requested number of questions
  const questions = [];
  for (let i = 0; i < count; i++) {
    questions.push({
      ...sampleQuestions[i % sampleQuestions.length],
      question: sampleQuestions[i % sampleQuestions.length].question.replace(`${topic}`, topic)
    });
  }
  return questions;
}

module.exports = {
  generateTopicQuiz
};