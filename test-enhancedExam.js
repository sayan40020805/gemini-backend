import axios from 'axios';

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

const subject = process.env.SUBJECT || "Mathematics";
const questionCount = parseInt(process.env.QUESTION_COUNT) || 5;
const difficulty = process.env.DIFFICULTY || "medium";

async function testEnhancedExam() {
  try {
    console.log(`Posting to ${API_BASE}/enhanced-exams/generate with subject: ${subject}, questionCount: ${questionCount}, difficulty: ${difficulty}`);
    const res = await axios.post(
      `${API_BASE}/enhanced-exams/generate`,
      { subject, questionCount, difficulty },
      { timeout: 30000 }
    );
    console.log('\n✅ Request succeeded');
    console.log('Status:', res.status);
    console.log('Body:', JSON.stringify(res.data, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Request failed');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Body:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
}

testEnhancedExam();
