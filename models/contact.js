// models/contact.js
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  category: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  newsletter: { type: Boolean, default: false }
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model('Message', contactSchema);

export default Message;
