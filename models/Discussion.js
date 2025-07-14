// models/Discussion.js
import mongoose from 'mongoose';

// ✅ Message Subdocument Schema
const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, required: true },
  time: { type: Date, required: true } // ✅ stored as actual Date object
});

// ✅ Discussion Schema
const discussionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  category: { type: String, required: true },
  participants: { type: Number, default: 1 },
  messages: [messageSchema] // ✅ Embedded messages array
}, { timestamps: true });

// ✅ Prevent model overwrite (e.g., in hot reload dev)
const Discussion = mongoose.models.Discussion || mongoose.model('Discussion', discussionSchema);

export default Discussion;
