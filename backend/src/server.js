const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });

function getGenerativeModel() {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: modelName });
}

function sanitizeHistory(rawHistory) {
  if (!Array.isArray(rawHistory)) {
    return [];
  }

  const normalized = rawHistory
    .filter(
      (item) =>
        item &&
        (item.role === 'user' || item.role === 'model') &&
        Array.isArray(item.parts) &&
        item.parts.length > 0
    )
    .map((item) => ({
      role: item.role,
      parts: item.parts
        .filter((part) => part && typeof part.text === 'string' && part.text.trim())
        .map((part) => ({ text: part.text.trim() })),
    }))
    .filter((item) => item.parts.length > 0);

  // Gemini requires the first history item to be "user".
  while (normalized.length > 0 && normalized[0].role !== 'user') {
    normalized.shift();
  }

  return normalized;
}

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));

app.get('/', (req, res) => {
  res.send('API is running');
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Chatbot endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, context } = req.body;
    const safeHistory = sanitizeHistory(history);
    console.log('Received chat request:', {
      message,
      historyLength: history?.length,
      safeHistoryLength: safeHistory.length,
    });
    
    const model = getGenerativeModel();
    if (!model) {
      console.error('GEMINI_API_KEY is missing in .env file');
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }

    const chat = model.startChat({
      history: safeHistory,
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const systemPrompt = `You are BoneScan Assistant, an expert AI specialized in orthopedic radiology and fracture recovery. 
    ${context ? `Current Context: ${JSON.stringify(context)}` : ''}
    
    Guidelines:
    1. Provide clear, empathetic, and professional advice about bone fractures and recovery.
    2. ALWAYS include a disclaimer that you are an AI assistant and not a replacement for medical diagnosis.
    3. Keep responses concise and focused on the user's health.
    4. If explaining a scan result, use simple terms but remain clinically accurate.
    5. Encourage the user to consult a doctor if a fracture is suspected.
    5a. If the result indicates "Fractured" (or likely fracture), explicitly advise immediate in-person medical evaluation and clearly tell the user to meet a doctor/orthopedic specialist as soon as possible.
    6. If the user asks what this website/app does, explain clearly:
       - This app is specifically for leg X-ray screening only.
       - Users can upload an X-ray image for AI-based screening.
       - The system checks whether the image is an X-ray, whether it is a leg X-ray, and whether fracture signs are present.
       - If the image is not a leg X-ray, clearly tell the user that only leg X-rays are supported in this app.
       - The chatbot helps users understand prediction results and gives general recovery guidance.
       - This app provides educational support and not a final medical diagnosis.
    7. If the user asks to move/navigate/open a page (Upload, Dashboard, Physiotherapy), respond as if page navigation support is available in the app. Do not say "I cannot move you".
    8. If the user asks about physiotherapy options/page, list these exact 3 programs:
       - Post-Surgery Recovery (Lower Leg Rehabilitation): Gentle exercises for after fracture repair, ACL reconstruction, or other lower leg surgeries. 6 exercises.
       - After a Fall (Injury Rehabilitation): Rehabilitation exercises for injuries sustained from falls or accidents. 5 exercises.
       - General Leg Pain (Chronic Care): Exercises for chronic pain, muscle strain, or general discomfort. 4 exercises.`;

    const result = await chat.sendMessage(`${systemPrompt}\n\nUser Question: ${message}`);
    const response = await result.response;
    const text = response.text();
    console.log('Gemini response successful');
    res.json({ text });
  } catch (error) {
    const details = error?.message || 'Unknown AI error';
    const lowered = String(details).toLowerCase();
    let clientError = 'Failed to get response from AI';

    if (lowered.includes('quota') || lowered.includes('429 too many requests')) {
      clientError = 'Gemini quota exceeded. Check billing/quota in Google AI Studio or try again later.';
    } else if (lowered.includes('model') && lowered.includes('not found')) {
      clientError = 'Configured Gemini model is unavailable. Update GEMINI_MODEL in backend/.env.';
    } else if (lowered.includes('api key') || lowered.includes('permission denied') || lowered.includes('403')) {
      clientError = 'Gemini API key is invalid or lacks permission.';
    }

    console.error('Chat error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    res.status(500).json({ error: clientError, details });
  }
});

app.post('/api/predict', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const form = new FormData();
    form.append('image', fs.createReadStream(req.file.path));

    const predictionResponse = await axios.post('http://127.0.0.1:5001/predict', form, {
      headers: form.getHeaders(),
    });

    fs.unlinkSync(req.file.path);

    const predictionData = predictionResponse.data;

    // Generate AI context based on prediction
    let aiContext = null;
    try {
      const model = getGenerativeModel();
      if (!model) {
        throw new Error('Gemini API key is not configured');
      }
      const prompt = `Based on the following fracture prediction data, provide a concise, medically relevant summary that can be used as context for a chatbot. Focus on the key findings and their implications for a user.
      Prediction data: ${JSON.stringify(predictionData)}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      aiContext = response.text();
    } catch (aiError) {
      console.warn('Failed to generate AI context:', aiError.message);
      aiContext = 'Could not generate AI context for this prediction.';
    }

    res.json({
      prediction: predictionData,
      aiContext: aiContext,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error(
      'Prediction error:',
      error.response?.data || error.message
    );

    res.status(500).json({
      error: 'Prediction failed',
      details: error.response?.data || error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
