import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  role: {
    type: String,
    enum: ['super', 'admin'],
    required: true
  },
  department: {
    type: String,
    enum: ['Security', 'Health', 'Peace', 'Disaster', 'Other'], // You can expand this list
    default: 'Other'
  },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Prevent model overwrite in dev
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

export default Admin;
