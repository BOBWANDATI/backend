import mongoose from 'mongoose';

const connectDB = async () => {
  const dbURI = process.env.MONGO_URI;

  if (!dbURI) {
    console.error('❌ MONGO_URI is not defined in environment variables');
    return;
  }

  try {
    const conn = await mongoose.connect(dbURI, {
      dbName: 'peace_building'
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  }
};

export default connectDB;
