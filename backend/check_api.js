const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

async function checkModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await axios.get(url);
    console.log('Available Models:');
    response.data.models.forEach(m => {
      console.log(`- ${m.name} (${m.displayName})`);
    });
  } catch (error) {
    console.error('Failed to list models:', error.response?.data || error.message);
  }
}

checkModels();
