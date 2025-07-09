// models/Discussion.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, required: true },
  time: { type: Date, required: true } // ⬅️ Fix: store as Date
});

const discussionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  participants: { type: Number, default: 1 },
  messages: [messageSchema]
}, { timestamps: true });

const Discussion = mongoose.models.Discussion || mongoose.model('Discussion', discussionSchema);

export default Discussion;
