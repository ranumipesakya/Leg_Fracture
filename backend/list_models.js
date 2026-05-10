const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
dotenv.config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There isn't a direct listModels in the client SDK usually, 
    // but we can try to initialize one and see if it fails on a simple request.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hi");
    console.log("SUCCESS with gemini-1.5-flash:", result.response.text());
  } catch (error) {
    console.error("FAILED with gemini-1.5-flash:", error.message);
    
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent("Hi");
      console.log("SUCCESS with gemini-pro:", result.response.text());
    } catch (error2) {
      console.error("FAILED with gemini-pro:", error2.message);
    }
  }
}

listModels();
