import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testGeminiQuestionGenerator() {
  try {
    const prompt = "Generate 5 multiple choice questions on JavaScript. Each question should have 4 options (A, B, C, D) with one correct answer. Return the response in JSON format with this structure: {\"questions\": [{\"question\": \"question text\", \"options\": [\"option1\", \"option2\", \"option3\", \"option4\"], \"correctAnswer\": \"A\", \"explanation\": \"brief explanation\"}]}";

    console.log(`Testing Gemini API with prompt: ${prompt.substring(0, 100)}...`);

    const res = await axios.post(
      `${API_BASE}/gemini/ask`,
      { prompt },
      { timeout: 30000 }
    );

    console.log('\n✅ Gemini API request succeeded');
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(res.data, null, 2));

    // Check if the response contains generated questions
    if (res.data.message && res.data.message.includes('questions')) {
      console.log('✅ Question generator appears to be working correctly');
    } else {
      console.log('⚠️ Response received but may not be in expected format');
    }

    process.exit(0);
  } catch (err) {
    console.error('\n❌ Gemini API request failed');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Body:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
    process.exit(1);
  }
}

testGeminiQuestionGenerator();
