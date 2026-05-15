const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function sampleDB() {
  const mongoUri = process.env.MONGO_URI;
  try {
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const colInfo of collections) {
      const col = db.collection(colInfo.name);
      const count = await col.countDocuments();
      console.log(`\nCollection: ${colInfo.name} (${count} documents)`);
      
      if (['sensorreadings', 'users', 'alerts'].includes(colInfo.name)) {
        const sample = await col.findOne();
        console.log('Sample Document:', JSON.stringify(sample, null, 2));
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

sampleDB();
