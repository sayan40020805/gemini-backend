const generateTopicQuiz = async (req, res) => {
  try {
    const { topic, questionCount } = req.body;

    if (!topic || !questionCount) {
      return res.status(400).json({ error: 'Topic and question count are required' });
    }

    // Since quiz generation is moved to frontend, use fallback sample questions
    const questions = generateSampleQuestions(topic, questionCount);

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