// ══════════════════════════════════════════
//   config/database.js - MongoDB Connection
// ══════════════════════════════════════════

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4,
});

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Connection events
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Connection to MongoDB lost. Reconnecting....');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Error:', err);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.error('💡 Check: Is mongodb_variable ok? Is mongodb IP- whitelisted in Atlas?');
    process.exit(1);   // Server band kar do agar DB connect na ho
  }
};

module.exports = connectDB;
