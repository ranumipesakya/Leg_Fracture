const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' });

async function listModels() {
  const keys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean);
  
  for (let i = 0; i < keys.length; i++) {
    console.log(`\n--- Models for Key ${i + 1} ---`);
    try {
      const genAI = new GoogleGenerativeAI(keys[i]);
      const result = await genAI.getGenerativeModel({ model: "gemini-pro" }).generateContent("Hi");
      console.log("gemini-pro check: OK");
    } catch (e) {
      console.log("gemini-pro check: FAILED - " + e.message);
    }

    try {
        // There is no listModels in the main export sometimes depending on version
        // But we can try to see what's happening.
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  }
}

listModels();
