const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '../.env' });

async function listModels() {
  const keys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY_2].filter(Boolean);
  
  for (let i = 0; i < keys.length; i++) {
    console.log(`\n--- Listing Models for Key ${i + 1} ---`);
    try {
      // In the newer versions, listing models is done via the client
      // But the @google/generative-ai package is mainly for content generation.
      // To list models, one usually uses the Google AI SDK or REST.
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keys[i]}`);
      const data = await response.json();
      if (data.models) {
        console.log("Models found:");
        data.models.forEach(m => console.log(`- ${m.name}`));
      } else {
        console.log("No models field in response:", JSON.stringify(data));
      }
    } catch (e) {
      console.log("Fetch failed: " + e.message);
    }
  }
}

listModels();
