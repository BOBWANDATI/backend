// === adminModel.js ===
import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, enum: ['super', 'admin'], required: true },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Use the correct model name and schema
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

export default Admin;
