import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['reconciliation', 'healing', 'community'], default: 'reconciliation' },
  content: { type: String, required: true },
  author: String,
  location: String,
  imageUrl: String,
  videoUrl: String,
  status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Story', storySchema);
