const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Account = require('../models/account');
const Exercise = require('../models/exercise');

const EXERCISES_FILE = path.join(__dirname, '..', 'exercises.json');

function normalizeExercise(item) {
  return {
    id: Number(item.id),
    title: String(item.title || '').trim(),
    duration: String(item.duration || '').trim(),
    sets: String(item.sets || '').trim(),
    reps: String(item.reps || '').trim(),
    imageUrl: String(item.imageUrl || '').trim(),
    videoUrl: String(item.videoUrl || '').trim(),
    category: String(item.category || '').trim(),
    instructions: Array.isArray(item.instructions)
      ? item.instructions.map((v) => String(v || '').trim()).filter(Boolean)
      : [],
    benefits: Array.isArray(item.benefits)
      ? item.benefits.map((v) => String(v || '').trim()).filter(Boolean)
      : [],
    precautions: Array.isArray(item.precautions)
      ? item.precautions.map((v) => String(v || '').trim()).filter(Boolean)
      : [],
  };
}

function loadExercisesFromFile() {
  if (!fs.existsSync(EXERCISES_FILE)) {
    throw new Error(`Exercises file not found: ${EXERCISES_FILE}`);
  }

  const raw = fs.readFileSync(EXERCISES_FILE, 'utf8');
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error('exercises.json must be an array');
  }

  return parsed.map(normalizeExercise);
}

async function syncExercisesFromFile() {
  const exercises = loadExercisesFromFile();

  if (exercises.length === 0) {
    return { total: 0, upserted: 0, modified: 0 };
  }

  const bulkOps = exercises.map((exercise) => ({
    updateOne: {
      filter: { id: exercise.id },
      update: { $set: exercise },
      upsert: true,
    },
  }));

  const result = await Exercise.bulkWrite(bulkOps, { ordered: false });

  return {
    total: exercises.length,
    upserted: result.upsertedCount || 0,
    modified: result.modifiedCount || 0,
  };
}

async function migrateLegacyCollection(collectionName, role) {
  const collectionExists = await mongoose.connection.db
    .listCollections({ name: collectionName })
    .hasNext();

  if (!collectionExists) {
    return { scanned: 0, migrated: 0 };
  }

  const docs = await mongoose.connection.collection(collectionName).find({}).toArray();
  let migrated = 0;

  for (const doc of docs) {
    if (!doc?.email || !doc?.password) {
      continue;
    }

    const email = String(doc.email).trim().toLowerCase();
    if (!email) {
      continue;
    }

    const upsertResult = await Account.updateOne(
      { email, role },
      { $setOnInsert: { email, password: doc.password, role } },
      { upsert: true }
    );

    if (upsertResult.upsertedCount > 0) {
      migrated += 1;
    }
  }

  return { scanned: docs.length, migrated };
}

async function migrateLegacyAccounts() {
  const userResult = await migrateLegacyCollection('users', 'patient');
  const adminResult = await migrateLegacyCollection('admins', 'admin');
  const normalizedResult = await Account.updateMany(
    { role: 'user' },
    { $set: { role: 'patient' } }
  );

  return {
    userResult,
    adminResult,
    normalizedUsers: normalizedResult.modifiedCount || 0,
  };
}

async function ensureDefaultAdmin() {
  const email = process.env.DEFAULT_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.DEFAULT_ADMIN_PASSWORD?.trim();

  if (!email || !password) {
    return { created: false, skipped: true };
  }

  const existing = await Account.findOne({ email, role: 'admin' });
  if (existing) {
    return { created: false, skipped: true };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await Account.create({ email, password: hashedPassword, role: 'admin' });
  return { created: true, skipped: false };
}

async function runStartupBootstrap() {
  const migration = await migrateLegacyAccounts();
  const exercises = await syncExercisesFromFile();
  const defaultAdmin = await ensureDefaultAdmin();

  return { migration, exercises, defaultAdmin };
}

module.exports = {
  syncExercisesFromFile,
  runStartupBootstrap,
};
