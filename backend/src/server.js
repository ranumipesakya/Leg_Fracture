const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const { connectDatabase } = require('./config/db');
const Account = require('./models/account');
const Exercise = require('./models/exercise');
const ScanResult = require('./models/scanResult');
const { runStartupBootstrap, syncExercisesFromFile } = require('./services/bootstrap');

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const mlPredictUrl = process.env.ML_PREDICT_URL || 'http://127.0.0.1:5001/predict';
const jwtSecret = process.env.JWT_SECRET || 'secret123';

// In-memory store for guest upload limits (resets on server restart)
const guestUploads = new Map();

function getGeminiApiKeys() {
  const keys = [];
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
  if (process.env.GEMINI_API_KEY_2) keys.push(process.env.GEMINI_API_KEY_2);
  return keys;
}

function getGenerativeModel(apiKey) {
  if (!apiKey) {
    const keys = getGeminiApiKeys();
    if (keys.length === 0) return null;
    apiKey = keys[0];
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const genAI = new GoogleGenerativeAI(apiKey);
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

  while (normalized.length > 0 && normalized[0].role !== 'user') {
    normalized.shift();
  }

  return normalized;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateCredentials(email, password) {
  if (!email || !password) {
    return 'Email and password are required';
  }

  if (String(password).length < 6) {
    return 'Password must contain at least 6 characters';
  }

  return null;
}

function signAccountToken(account) {
  const normalizedRole = account.role === 'user' ? 'patient' : account.role;
  return jwt.sign(
    {
      id: account._id,
      email: account.email,
      role: normalizedRole,
    },
    jwtSecret,
    { expiresIn: normalizedRole === 'admin' ? '1d' : '7d' }
  );
}

function sanitizeAccount(account) {
  return {
    id: account._id,
    email: account.email,
    fullName: account.fullName,
    dob: account.dob,
    nic: account.nic,
    profileImage: account.profileImage,
    role: account.role === 'user' ? 'patient' : account.role,
  };
}

function resolveLoginRoleFilter(role) {
  if (role === 'patient') {
    return { $in: ['patient', 'user'] };
  }
  return role;
}

async function registerForRole(req, res, role) {
  try {
    const { email, password, fullName, dob, nic } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const validationError = validateCredentials(normalizedEmail, password);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const existing = await Account.findOne({ email: normalizedEmail, role });
    if (existing) {
      return res.status(400).json({ error: `${role} already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const account = await Account.create({
      email: normalizedEmail,
      password: hashedPassword,
      fullName,
      dob,
      nic,
      role,
    });

    return res.json({
      message: `${role} registered successfully`,
      account: sanitizeAccount(account),
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to register' });
  }
}

async function loginForRole(req, res, role) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const account = await Account.findOne({
      email: normalizedEmail,
      role: resolveLoginRoleFilter(role),
    });
    if (!account) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = signAccountToken(account);
    return res.json({
      token,
      email: account.email,
      role: account.role,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authorization token is required' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.auth = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.auth?.role !== role) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
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

app.get('/api/admin/dashboard', requireAuth, requireRole('admin'), (req, res) => {
  res.json({ 
    message: 'Welcome to the Admin Dashboard API', 
    user: req.auth,
    status: 'success'
  });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  const account = await Account.findById(req.auth.id).select('-password');
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  return res.json(sanitizeAccount(account));
});

app.post('/api/auth/patient/register', (req, res) => registerForRole(req, res, 'patient'));
app.post('/api/auth/patient/login', (req, res) => loginForRole(req, res, 'patient'));
app.post('/api/auth/user/register', (req, res) => registerForRole(req, res, 'patient'));
app.post('/api/auth/user/login', (req, res) => loginForRole(req, res, 'patient'));
app.post('/api/auth/admin/register', (req, res) => registerForRole(req, res, 'admin'));
app.post('/api/auth/admin/login', (req, res) => loginForRole(req, res, 'admin'));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, dob, role } = req.body;
    const assignedRole = role === 'admin' ? 'admin' : 'user';
    const normalizedEmail = normalizeEmail(email);
    const validationError = validateCredentials(normalizedEmail, password);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const existing = await Account.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: `Account already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const account = await Account.create({
      email: normalizedEmail,
      password: hashedPassword,
      fullName,
      dob,
      role: assignedRole,
    });

    return res.json({
      message: `Account registered successfully`,
      account: sanitizeAccount(account),
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to register' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const account = await Account.findOne({ email: normalizedEmail });
    if (!account) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = signAccountToken(account);
    return res.json({
      token,
      email: account.email,
      role: account.role === 'patient' ? 'user' : account.role,
      fullName: account.fullName,
      dob: account.dob,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

app.put('/api/auth/profile', requireAuth, async (req, res) => {
  try {
    const { fullName, dob, nic, profileImage } = req.body;
    const updateData = { fullName, dob, nic };
    if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }
    const account = await Account.findByIdAndUpdate(
      req.auth.id,
      updateData,
      { new: true }
    );
    if (!account) return res.status(404).json({ error: 'Account not found' });
    res.json(sanitizeAccount(account));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.post('/api/auth/reset-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const account = await Account.findById(req.auth.id);
    if (!account) return res.status(404).json({ error: 'Account not found' });

    const isMatch = await bcrypt.compare(currentPassword, account.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    account.password = hashedPassword;
    await account.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

app.get('/api/exercises', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    const data = await Exercise.find(filter).sort({ id: 1 });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load exercises' });
  }
});

app.get('/api/exercises/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid exercise id' });
    }

    const exercise = await Exercise.findOne({ id });
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    return res.json(exercise);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load exercise' });
  }
});

app.post('/api/exercises', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const newExercise = new Exercise(req.body);
    await newExercise.save();
    return res.status(201).json(newExercise);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'Exercise id already exists' });
    }
    return res.status(500).json({ error: 'Failed to save exercise' });
  }
});

app.put('/api/exercises/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid exercise id' });
    }

    const updated = await Exercise.findOneAndUpdate({ id }, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ error: 'Exercise not found' });
    }
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update exercise' });
  }
});

app.delete('/api/exercises/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'Invalid exercise id' });
    }

    const deleted = await Exercise.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete exercise' });
  }
});

app.post('/api/exercises/sync', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const result = await syncExercisesFromFile();
    return res.json({
      message: 'Exercises synchronized successfully',
      ...result,
    });
  } catch (error) {
    console.error('Exercise sync error:', error);
    return res.status(500).json({ error: 'Failed to sync exercises' });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, context } = req.body;
    const safeHistory = sanitizeHistory(history);
    console.log('Received chat request:', {
      message,
      historyLength: history?.length,
      safeHistoryLength: safeHistory.length,
    });

    const apiKeys = getGeminiApiKeys();
    if (apiKeys.length === 0) {
      console.error('GEMINI_API_KEY is missing in .env file');
      return res.status(500).json({ error: 'Gemini API key is not configured' });
    }

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

    let lastError = null;

    for (let i = 0; i < apiKeys.length; i++) {
      try {
        const model = getGenerativeModel(apiKeys[i]);
        const chat = model.startChat({
          history: safeHistory,
          generationConfig: {
            maxOutputTokens: 500,
          },
        });

        const result = await chat.sendMessage(`${systemPrompt}\n\nUser Question: ${message}`);
        const response = await result.response;
        const text = response.text();
        console.log(`Gemini response successful (key ${i + 1})`);
        return res.json({ text });
      } catch (keyError) {
        const errMsg = String(keyError?.message || '').toLowerCase();
        console.warn(`Gemini key ${i + 1} failed: ${keyError?.message}`);
        lastError = keyError;

        // If the error is retryable (quota, auth, rate limit), try the next key
        const isRetryable = errMsg.includes('quota') || errMsg.includes('429') || errMsg.includes('api key') || errMsg.includes('permission denied') || errMsg.includes('403') || errMsg.includes('resource has been exhausted');
        if (isRetryable && i < apiKeys.length - 1) {
          console.log(`Switching to Gemini key ${i + 2}...`);
          continue;
        }
        // If not retryable or no more keys, break out
        break;
      }
    }

    // All keys failed — format the error
    const details = lastError?.message || 'Unknown AI error';
    const lowered = String(details).toLowerCase();
    let clientError = 'Failed to get response from AI';

    if (lowered.includes('quota') || lowered.includes('429 too many requests') || lowered.includes('resource has been exhausted')) {
      clientError = 'All Gemini API keys exhausted their quota. Please try again later.';
    } else if (lowered.includes('model') && lowered.includes('not found')) {
      clientError = 'Configured Gemini model is unavailable. Update GEMINI_MODEL in backend/.env.';
    } else if (
      lowered.includes('api key') ||
      lowered.includes('permission denied') ||
      lowered.includes('403')
    ) {
      clientError = 'All Gemini API keys are invalid or lack permission.';
    }

    console.error('Chat error details:', JSON.stringify(lastError, Object.getOwnPropertyNames(lastError), 2));
    return res.status(500).json({ error: clientError, details });
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Failed to get response from AI', details: error?.message });
  }
});

app.post('/api/predict', upload.single('image'), async (req, res) => {
  try {
    // Check authentication
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], jwtSecret);
        userId = decoded.id;
      } catch (e) { /* ignore invalid token */ }
    }

    // Server-side limit for guest users (IP-based)
    if (!userId) {
      const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const currentCount = guestUploads.get(clientIp) || 0;
      if (currentCount >= 3) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(403).json({ 
          error: 'Free upload limit reached (3 scans). Please register or login to continue.' 
        });
      }
      guestUploads.set(clientIp, currentCount + 1);
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const form = new FormData();
    form.append('image', fs.createReadStream(req.file.path));

    const predictionResponse = await axios.post(mlPredictUrl, form, {
      headers: form.getHeaders(),
    });

    fs.unlinkSync(req.file.path);

    const predictionData = predictionResponse.data;

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

    // Save scan result to database for analytics
    try {
      // Extract userId from token if present
      let userId = null;
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const decoded = jwt.verify(authHeader.split(' ')[1], jwtSecret);
          userId = decoded.id;
        } catch (e) { /* ignore invalid token */ }
      }

      let resultLabel = 'Unknown';
      const rawPrediction = predictionData.fracture_prediction || predictionData.prediction || predictionData.result || predictionData.label || '';
      
      if (typeof rawPrediction === 'string') {
        const lowerPred = rawPrediction.toLowerCase();
        if (lowerPred.includes('not fractured') || lowerPred.includes('no fracture')) {
          resultLabel = 'Not Fractured';
        } else if (lowerPred.includes('fracture')) {
          resultLabel = 'Fractured';
        } else if (lowerPred.includes('not an x-ray')) {
          resultLabel = 'Not an X-ray';
        } else if (lowerPred.includes('not a leg x-ray')) {
          resultLabel = 'Not a leg X-ray';
        } else {
          resultLabel = rawPrediction; // fallback
        }
      }

      let confidence = null;
      if (predictionData.fracture_confidence !== undefined && predictionData.fracture_confidence !== null) {
        confidence = predictionData.fracture_confidence;
      } else if (predictionData.confidence !== undefined && predictionData.confidence !== null) {
        confidence = predictionData.confidence;
      }
      
      console.log(`Saving scan result: Label=${resultLabel}, User=${userId}`);

      await ScanResult.create({
        userId,
        result: resultLabel,
        confidence,
        filename: req.file?.originalname || 'unknown',
      });
    } catch (saveErr) {
      console.warn('Failed to save scan result for analytics:', saveErr.message);
    }

    return res.json({
      prediction: predictionData,
      aiContext,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error('Prediction error:', error.response?.data || error.message);

    return res.status(500).json({
      error: 'Prediction failed',
      details: error.response?.data || error.message,
    });
  }
});

// Admin Analytics endpoint (all system data)
app.get('/api/analytics', requireAuth, async (req, res) => {
  try {
    // Check admin role
    const account = await Account.findById(req.auth.id);
    if (!account || account.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const totalScans = await ScanResult.countDocuments();
    const fractured = await ScanResult.countDocuments({ result: 'Fractured' });
    const notFractured = await ScanResult.countDocuments({ result: 'Not Fractured' });
    const notXray = await ScanResult.countDocuments({ result: 'Not an X-ray' });
    const notLeg = await ScanResult.countDocuments({ result: 'Not a leg X-ray' });
    const totalUsers = await Account.countDocuments({ role: 'patient' });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Monthly uploads (last 12 months)
    const monthlyUploads = await ScanResult.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);
    const monthlyData = monthlyUploads.map((m) => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      uploads: m.count,
    }));

    // Daily usage (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyUsage = await ScanResult.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);
    const dailyData = dailyUsage.map((d) => ({
      date: `${monthNames[d._id.month - 1]} ${d._id.day}`,
      scans: d.count,
    }));

    const avgConfidence = await ScanResult.aggregate([
      { $match: { confidence: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$confidence' } } },
    ]);

    const recentScans = await ScanResult.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('result confidence createdAt filename');

    return res.json({
      totalScans, fractured, notFractured, notXray, notLeg, totalUsers,
      avgConfidence: avgConfidence[0]?.avg || 0,
      monthlyData, dailyData, recentScans,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// User-specific analytics endpoint
app.get('/api/analytics/me', requireAuth, async (req, res) => {
  try {
    const userId = req.auth.id;
    const filter = { userId };

    const totalScans = await ScanResult.countDocuments(filter);
    const fractured = await ScanResult.countDocuments({ ...filter, result: 'Fractured' });
    const notFractured = await ScanResult.countDocuments({ ...filter, result: 'Not Fractured' });
    const notXray = await ScanResult.countDocuments({ ...filter, result: 'Not an X-ray' });
    const notLeg = await ScanResult.countDocuments({ ...filter, result: 'Not a leg X-ray' });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const monthlyUploads = await ScanResult.aggregate([
      { 
        $match: { 
          userId: mongoose.Types.ObjectId.isValid(userId) 
            ? new mongoose.Types.ObjectId(userId) 
            : null 
        } 
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);
    const monthlyData = monthlyUploads.map((m) => ({
      month: `${monthNames[m._id.month - 1]} ${m._id.year}`,
      uploads: m.count,
    }));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyUsage = await ScanResult.aggregate([
      { 
        $match: { 
          userId: mongoose.Types.ObjectId.isValid(userId) 
            ? new mongoose.Types.ObjectId(userId) 
            : null, 
          createdAt: { $gte: thirtyDaysAgo } 
        } 
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);
    const dailyData = dailyUsage.map((d) => ({
      date: `${monthNames[d._id.month - 1]} ${d._id.day}`,
      scans: d.count,
    }));

    const avgConfidence = await ScanResult.aggregate([
      { 
        $match: { 
          userId: mongoose.Types.ObjectId.isValid(userId) 
            ? new mongoose.Types.ObjectId(userId) 
            : null, 
          confidence: { $ne: null } 
        } 
      },
      { $group: { _id: null, avg: { $avg: '$confidence' } } },
    ]);

    const recentScans = await ScanResult.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('result confidence createdAt filename');

    return res.json({
      totalScans, fractured, notFractured, notXray, notLeg,
      avgConfidence: avgConfidence[0]?.avg || 0,
      monthlyData, dailyData, recentScans,
    });
  } catch (error) {
    console.error('User analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
});

// Admin: Get all registered users
app.get('/api/admin/users', requireAuth, async (req, res) => {
  try {
    const account = await Account.findById(req.auth.id);
    if (!account || account.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = await Account.find({ role: 'patient' })
      .select('fullName email nic role dob createdAt')
      .sort({ createdAt: -1 });

    return res.json(users);
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

async function startServer() {
  await connectDatabase();
  const bootstrapResult = await runStartupBootstrap();
  console.log('Startup bootstrap:', bootstrapResult);

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
