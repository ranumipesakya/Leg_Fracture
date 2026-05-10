const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

async function testChat() {
  try {
    const response = await axios.post('http://localhost:5000/api/chat', {
      message: 'Hello, are you there?',
      history: []
    });
    console.log('SUCCESS:', response.data.text);
  } catch (error) {
    console.error('ERROR:', error.response?.data || error.message);
  }
}

testChat();
