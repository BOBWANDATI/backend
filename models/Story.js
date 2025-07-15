import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, default: 'Anonymous' },
  location: { type: String },
  date: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  verified: { type: Boolean, default: false }
});

export default mongoose.model('Story', storySchema);
