const mongoose = require('mongoose');

let isConnected = false;

// Attach event listeners once
if (process.env.NODE_ENV !== 'test') {
  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log(`[Database] MongoDB connection established successfully (${mongoose.connection.host})`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('[Database] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[Database] MongoDB disconnected. Attempting reconnection...');
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log('[Database] MongoDB reconnected successfully.');
  });
}

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('\n❌ [Database Config Error]: MONGODB_URI is not defined in server/.env!');
    console.error('👉 Please specify a valid MongoDB connection string, for example:');
    console.error('   Local:  mongodb://localhost:27017/foodbridge');
    console.error('   Atlas:  mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/foodbridge?retryWrites=true&w=majority\n');
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: process.env.NODE_ENV !== 'production',
    });
    return conn;
  } catch (error) {
    console.error('\n❌ [Database Connection Failed]:', error.message);

    if (uri.startsWith('mongodb+srv://')) {
      console.error('\n💡 [MongoDB Atlas Checklist]:');
      console.error('  1. Verify your Atlas IP Access List (whitelist 0.0.0.0/0 for anywhere access during development).');
      console.error('  2. Verify your Database User username & password in Atlas Security > Database Access.');
      console.error('  3. If your password has special characters (@, :, /, #), encode them with encodeURIComponent().');
      console.error('  4. Ensure your cluster is active and not paused.\n');
    }

    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
