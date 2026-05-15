const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' });

async function testKeys() {
  const keys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean);
  
  if (keys.length === 0) {
    console.log('No keys found in .env');
    return;
  }

  for (let i = 0; i < keys.length; i++) {
    console.log(`Testing Key ${i + 1}: ${keys[i].substring(0, 10)}...`);
    try {
      const genAI = new GoogleGenerativeAI(keys[i]);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('Hi');
      const response = await result.response;
      console.log(`✅ Key ${i + 1} is WORKING. Response: ${response.text().substring(0, 20)}...`);
    } catch (err) {
      console.log(`❌ Key ${i + 1} FAILED: ${err.message}`);
    }
  }
}

testKeys();
