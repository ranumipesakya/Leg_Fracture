const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

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

app.post('/api/predict', (req, res) => {
  const { fileName = '', mimeType = '', fileData = '' } = req.body || {};

  if (!fileData || typeof fileData !== 'string') {
    return res.status(400).json({
      ok: false,
      error: 'Missing fileData',
    });
  }

  // Temporary server-side prediction logic until real ML model is connected.
  // Keeps response deterministic for the same input.
  const seedText = `${fileName}|${mimeType}|${fileData.slice(0, 500)}`;
  let hash = 0;
  for (let i = 0; i < seedText.length; i += 1) {
    hash = (hash * 31 + seedText.charCodeAt(i)) % 1000003;
  }

  const score = (hash % 1000) / 1000; // 0.000 - 0.999
  const label = score >= 0.5 ? 'Fracture' : 'No Fracture';
  const confidence =
    label === 'Fracture'
      ? Number((0.5 + score / 2).toFixed(3))
      : Number((0.5 + (1 - score) / 2).toFixed(3));

  return res.json({
    ok: true,
    label,
    confidence,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
