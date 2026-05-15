const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

async function inspectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI not found');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    const admin = mongoose.connection.db.admin();
    
    // List databases
    const dbs = await admin.listDatabases();
    console.log('\n--- Databases ---');
    dbs.databases.forEach(db => console.log(`- ${db.name}`));

    // Check current database collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n--- Collections in "${mongoose.connection.db.databaseName}" ---`);
    collections.forEach(col => console.log(`- ${col.name}`));

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

inspectDB();
