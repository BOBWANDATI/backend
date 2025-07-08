// config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  const dbURI = process.env.MONGO_URI || 'mongodb://localhost:27017/peacebuilding_db';

  try {
    const conn = await mongoose.connect(dbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`✅ MongoDB connected successfully at: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
