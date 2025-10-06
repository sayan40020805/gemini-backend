import axios from 'axios';

const apiKey = 'AIzaSyALpSJXroC94nSWhoDdXz286WJ1hNfCP5U';

async function testApiKey() {
  try {
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    console.log('✅ API key is valid');
    console.log('Available models:', response.data.models.map(m => m.name));
  } catch (error) {
    console.log('❌ API key is invalid or restricted');
    if (error.response) {
      console.log('Error:', error.response.data.error.message);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testApiKey();
