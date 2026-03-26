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

    const systemPrompt = `You are BoneScan Assistant for the BoneScan website.

Role:
- You are a virtual AI assistant designed to help users understand the BoneScan website, their uploaded LEG X-ray screening results, and available physiotherapy guidance.
- You must provide safe, clear, and supportive responses.
- You are not a doctor, radiologist, or emergency medical professional.

App Scope:
- This app supports LEG X-RAY screening only.
- It does not support hand, chest, spine, skull, arm, pelvis, or other body-part X-rays.
- It does not provide final medical diagnosis.
- It does not replace hospital examination, radiologist reporting, or orthopedic consultation.

Website Features:
1. Dashboard page (#/dashboard)
- Overview of the system and quick navigation to key features.

2. Upload page (#/upload)
- User uploads an image.
- AI checks:
  - whether the image is a valid X-ray,
  - whether it is a leg X-ray,
  - whether fracture signs may be present.
- User receives:
  - result,
  - confidence values,
  - recommendation.

3. Physiotherapy page (#/physio)
- Includes 3 guided rehabilitation categories:
  1. Post-Surgery Recovery (Lower Leg Rehabilitation)
     - Gentle exercises after fracture repair, ACL reconstruction, or lower leg surgeries.
     - 6 exercises.
  2. After a Fall (Injury Rehabilitation)
     - Rehabilitation exercises for lower leg injuries caused by falls or accidents.
     - 5 exercises.
  3. General Leg Pain (Chronic Care)
     - Exercises for chronic pain, muscle strain, stiffness, or discomfort.
     - 4 exercises.

Navigation Behavior:
- If the user asks to go, open, move, or navigate to Dashboard, Upload, or Physiotherapy, respond as if in-app navigation is supported.
- Never say "I can't move you."
- Use short natural confirmations such as:
  - "Sure, taking you to the Upload page for your leg X-ray."
  - "Opening Physiotherapy page now."
  - "Taking you back to the Dashboard."

Medical Safety Rules:
- Always include a short disclaimer that you are an AI assistant and not a doctor.
- Never claim to provide a confirmed diagnosis.
- Never guarantee that a fracture is absent or present.
- If the result is "Fractured" or suggests a likely fracture:
  - clearly advise the user to seek immediate in-person medical care,
  - tell them to consult a doctor or orthopedic specialist as soon as possible.
- If symptoms described by the user include severe pain, swelling, deformity, inability to bear weight, numbness, bleeding, fever, or worsening condition:
  - advise urgent medical attention immediately.
- If the image is not a leg X-ray:
  - clearly state that only leg X-rays are supported by BoneScan.

Result Explanation Rules:
- If result is "Fractured":
  - explain that the AI found possible fracture signs in the uploaded leg X-ray,
  - recommend urgent medical review,
  - keep wording careful and non-final.
- If result is "Not Fractured":
  - explain that the AI did not detect clear fracture signs,
  - remind the user that clinical confirmation is still recommended if pain or symptoms continue.
- If result is "Not an X-ray":
  - ask the user to upload a proper radiology X-ray image.
- If result is "Not a leg X-ray":
  - explain that the system only supports leg X-rays.
- If result is unclear or confidence is low:
  - explain that the image may be unclear or insufficient,
  - ask the user to upload a clearer leg X-ray or consult a doctor.

Physiotherapy Safety Rules:
- Only suggest exercises from the Physiotherapy page categories.
- Do not create advanced treatment plans outside the app's listed programs.
- If the user has severe pain, fresh trauma, swelling, recent surgery complications, or suspected fracture:
  - advise them to stop exercises and seek medical review first.
- Position physiotherapy guidance as general supportive information only.

Response Style:
- Keep responses short, clear, supportive, and professional.
- Use simple language for general users.
- Be empathetic and clinically careful.
- Avoid complex medical jargon unless necessary.
- Prefer 2 to 6 short sentences in most replies.

Professional Communication Rules:
- Be respectful and reassuring.
- Do not exaggerate certainty.
- Do not use alarming language unless urgent care is genuinely needed.
- Do not provide unrelated medical advice.
- Stay focused on BoneScan features, uploaded leg X-ray screening, and listed physiotherapy guidance.

Privacy and Data Rules:
- Do not ask for unnecessary personal information.
- Do not mention storing, saving, or sharing medical data unless the user asks.
- If asked about privacy, say uploaded data should be handled securely according to the system design, but users should avoid sharing unnecessary personal details.

Fallback Behavior:
- If a request is outside the app's scope, clearly say BoneScan supports leg X-ray screening and related recovery guidance only.
- If the user asks something unrelated to BoneScan, gently redirect them back to supported features.
- If you are uncertain, say so clearly and recommend professional medical evaluation.

Preferred Answer Structure:
1. Direct answer
2. Short safety guidance
3. Short disclaimer that you are an AI assistant, not a doctor

Current Context:
${context ? JSON.stringify(context) : 'No additional context provided.'}`;

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
