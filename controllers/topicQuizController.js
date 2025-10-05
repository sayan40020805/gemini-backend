import TopicQuizResult from '../models/TopicQuizResult.js';

const saveTopicQuizResult = async (req, res) => {
  try {
    const { userId, topic, difficulty, totalQuestions, correctAnswers, percentage, answers } = req.body;

    if (!userId || !topic || !difficulty || totalQuestions === undefined || correctAnswers === undefined || percentage === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, topic, difficulty, totalQuestions, correctAnswers, percentage'
      });
    }

    const newResult = new TopicQuizResult({
      userId,
      topic,
      difficulty,
      totalQuestions,
      correctAnswers,
      percentage,
      answers: answers || []
    });

    await newResult.save();

    res.json({
      success: true,
      message: 'Quiz result saved successfully',
      resultId: newResult._id
    });

  } catch (error) {
    console.error('Error saving topic quiz result:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save quiz result'
    });
  }
};

const getTopicQuizHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const results = await TopicQuizResult.find({ userId })
      .sort({ date: -1 })
      .select('topic difficulty totalQuestions correctAnswers percentage date');

    res.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Error fetching topic quiz history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quiz history'
    });
  }
};

export { saveTopicQuizResult, getTopicQuizHistory };
