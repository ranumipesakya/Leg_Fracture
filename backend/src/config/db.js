const mongoose = require('mongoose');

async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is missing in backend/.env');
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (error) {
    const authFailed =
      error?.code === 8000 ||
      String(error?.message || '').toLowerCase().includes('bad auth');

    if (authFailed) {
      console.error(
        'MongoDB auth failed. Check MONGO_URI username/password and URL-encode special chars in password.'
      );
    }

    throw error;
  }
}

module.exports = { connectDatabase };
