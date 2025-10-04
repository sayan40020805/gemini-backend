import axios from 'axios';

// Test script for /api/gemini/ask (now using Deepseek API)
// Usage:
//   API_BASE=http://localhost:5000 node test-deepseek.js
// If API_BASE isn't set it defaults to http://localhost:5000/api

const API_BASE = process.env.API_BASE || 'http://localhost:5000/api';

const prompt = process.env.PROMPT || "Write a friendly one-line greeting that includes the phrase 'Hello from Deepseek' and say what you can do.";

const timeoutMs = 20000;

async function testDeepseek() {
  try {
    console.log(`Posting to ${API_BASE}/gemini/ask with prompt:\n${prompt}\n`);
    const res = await axios.post(
      `${API_BASE}/gemini/ask`,
      { prompt },
      { timeout: timeoutMs }
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

testDeepseek();
