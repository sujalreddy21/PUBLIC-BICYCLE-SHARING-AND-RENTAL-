const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log(`Attempting to connect to configured MongoDB at ${uri}...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000
      });
      console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
      return;
    } catch (err) {
      console.warn(`Could not connect to external MongoDB: ${err.message}. Initializing embedded MongoDB engine...`);
    }
  }

  try {
    console.log('Starting in-memory MongoDB instance for self-contained operation...');
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'pbs_db'
      }
    });
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`In-Memory MongoDB Connected successfully: ${memoryUri}`);
  } catch (err) {
    console.error('Fatal: Failed to connect to any MongoDB instance:', err.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };
