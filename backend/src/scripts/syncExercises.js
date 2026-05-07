const dotenv = require('dotenv');

const { connectDatabase } = require('../config/db');
const { syncExercisesFromFile } = require('../services/bootstrap');

dotenv.config();

async function run() {
  try {
    await connectDatabase();
    const result = await syncExercisesFromFile();
    console.log('Exercises synchronized:', result);
    process.exit(0);
  } catch (error) {
    console.error('Failed to sync exercises:', error);
    process.exit(1);
  }
}

run();
