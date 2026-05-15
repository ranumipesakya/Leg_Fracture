const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function cleanupDB() {
  const mongoUri = process.env.MONGO_URI;
  try {
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;
    
    const collectionsToDrop = ['sensorreadings', 'users', 'alerts'];
    
    console.log('Starting cleanup...');
    
    for (const colName of collectionsToDrop) {
      const collections = await db.listCollections({ name: colName }).toArray();
      if (collections.length > 0) {
        await db.dropCollection(colName);
        console.log(`Dropped collection: ${colName}`);
      } else {
        console.log(`Collection not found (already clean): ${colName}`);
      }
    }

    console.log('\nCleanup complete. Remaining collections:');
    const remaining = await db.listCollections().toArray();
    remaining.forEach(c => console.log(`- ${c.name}`));

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error during cleanup:', err);
  }
}

cleanupDB();
