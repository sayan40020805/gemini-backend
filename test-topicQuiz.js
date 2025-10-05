import axios from 'axios';

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

const userId = process.env.USER_ID || "507f1f77bcf86cd799439011"; // Example MongoDB ObjectId
const topic = process.env.TOPIC || "Physics";
const difficulty = process.env.DIFFICULTY || "medium";

async function testSaveTopicQuizResult() {
  try {
    const quizData = {
      userId,
      topic,
      difficulty,
      totalQuestions: 5,
      correctAnswers: 4,
      percentage: 80,
      answers: [
        { questionIndex: 0, selectedAnswer: 0, correctAnswer: 0 },
        { questionIndex: 1, selectedAnswer: 1, correctAnswer: 1 },
        { questionIndex: 2, selectedAnswer: 2, correctAnswer: 2 },
        { questionIndex: 3, selectedAnswer: 3, correctAnswer: 3 },
        { questionIndex: 4, selectedAnswer: 0, correctAnswer: 1 }
      ]
    };

    console.log(`Posting to ${API_BASE}/topic-quiz/save-result`);
    console.log('Data:', JSON.stringify(quizData, null, 2));

    const res = await axios.post(
      `${API_BASE}/topic-quiz/save-result`,
      quizData,
      { timeout: 30000 }
    );

    console.log('\n✅ Save result request succeeded');
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(res.data, null, 2));

    // Now test fetching history
    await testGetTopicQuizHistory();

  } catch (err) {
    console.error('\n❌ Save result request failed');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Body:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
}

async function testGetTopicQuizHistory() {
  try {
    console.log(`\nGetting from ${API_BASE}/topic-quiz/user/${userId}/history`);

    const res = await axios.get(
      `${API_BASE}/topic-quiz/user/${userId}/history`,
      { timeout: 30000 }
    );

    console.log('\n✅ Get history request succeeded');
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(res.data, null, 2));
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Get history request failed');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Body:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
}

testSaveTopicQuizResult();
