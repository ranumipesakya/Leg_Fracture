const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' });

async function testKeys() {
  const keys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean);
  const modelName = 'gemini-2.5-flash';
  
  for (let i = 0; i < keys.length; i++) {
    console.log(`Testing Key ${i + 1} with ${modelName}...`);
    try {
      const genAI = new GoogleGenerativeAI(keys[i]);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('Hi');
      const response = await result.response;
      console.log(`✅ Key ${i + 1} works!`);
    } catch (err) {
      console.log(`❌ Key ${i + 1} failed: ${err.message}`);
    }
  }
}

testKeys();
