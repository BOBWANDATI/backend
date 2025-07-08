// controllers/authController.js

import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';

const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL || 'http://localhost:5174';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// ✅ Register Admin or Super Admin
export const register = async (req, res) => {
  try {
    const { username, password, email, role } = req.body;

    // 🛑 Check for duplicate username
    if (await Admin.findOne({ username })) {
      return res.status(400).json({ msg: 'Username already taken.' });
    }

    // ✅ Super Admin logic
    let approved = false;
    if (role === 'super') {
      const superCount = await Admin.countDocuments({ role: 'super' });
      if (superCount >= 2) {
        return res.status(400).json({ msg: 'Only 2 Super Admins allowed.' });
      }
      approved = true;
    }

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

    const newAdmin = new Admin({ username, email, password: hashedPassword, role, approved });
    await newAdmin.save();

    // ✉️ Send approval email if Admin
    if (role === 'admin') {
      const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: '2d' });
      const approvalLink = `${BACKEND_URL}/api/auth/approve/${token}`;

      const superAdmins = await Admin.find({ role: 'super', approved: true });

      const emailHTML = `
        <h3>🛂 New Admin Approval Needed</h3>
        <p>Username: <strong>${newAdmin.username}</strong></p>
        <a href="${approvalLink}" style="padding:10px 20px;background:#007BFF;color:white;text-decoration:none;border-radius:5px;">
          Approve Admin
        </a>
      `;

      for (const superAdmin of superAdmins) {
        await sendEmail(superAdmin.email, '🛂 Admin Approval Request', emailHTML);
      }
    }

    return res.status(201).json({
      msg: approved
        ? '✅ Super Admin registered and auto-approved.'
        : '✅ Admin registered — awaiting Super Admin approval.'
    });

  } catch (err) {
    console.error('❌ Registration error:', err);
    return res.status(500).json({ msg: 'Server error during registration.' });
  }
};

// ✅ Approve Admin Account via Email Link
export const approveAdmin = async (req, res) => {
  try {
    const { token } = req.params;
    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).send('<h3>❌ Admin not found.</h3>');
    if (admin.approved) return res.status(400).send('<h3>⚠️ Admin is already approved.</h3>');

    admin.approved = true;
    await admin.save();

    const loginLink = `${CLIENT_BASE_URL}/login`;
    const approvedMsg = `
      <h3>✅ Your Admin Account Has Been Approved!</h3>
      <p>Hi ${admin.username},</p>
      <a href="${loginLink}" style="padding:10px 20px;background:#4CAF50;color:#fff;text-decoration:none;border-radius:5px;">
        Log In Now
      </a>
    `;

    await sendEmail(admin.email, '✅ Admin Account Approved', approvedMsg);

    return res.send('<h2>✅ Admin approved and notified successfully.</h2>');

  } catch (err) {
    console.error('❌ Approval error:', err);
    return res.status(400).send('<h3>❌ Invalid or expired approval token.</h3>');
  }
};

// ✅ Login Admin or Super Admin
export const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const admin = await Admin.findOne({ username, role });
    if (!admin) return res.status(400).json({ msg: 'Invalid credentials.' });
    if (!admin.approved) return res.status(403).json({ msg: '⏳ Account is pending approval.' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials.' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.json({ token, admin });

  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({ msg: 'Server error during login.' });
  }
};
