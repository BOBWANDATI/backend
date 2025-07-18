import Admin from '../models/Admin.js';
import Discussion from '../models/Discussion.js';
import Story from '../models/Story.js';
import Incident from '../models/Incident.js';
import News from '../models/News.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { mailTransporter } from '../server.js';

const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL || 'https://your-frontend.vercel.app';
const BACKEND_URL = process.env.BACKEND_URL || 'https://backend-m6u3.onrender.com';

const formatDepartment = (value) => {
  if (!value) return 'Other';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

// ✅ Register Admin or Super Admin
export const register = async (req, res) => {
  try {
    const { username, password, email, role, department } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ msg: 'Please provide username, email, password, and role.' });
    }

    const normalizedRole = role.toLowerCase();
    if (normalizedRole === 'admin' && !department) {
      return res.status(400).json({ msg: 'Department is required for Admin role.' });
    }

    const existingAdmin = await Admin.findOne({ username });
    if (existingAdmin) {
      return res.status(400).json({ msg: 'Username already taken.' });
    }

    let approved = false;
    if (normalizedRole === 'super') {
      const superCount = await Admin.countDocuments({ role: 'super' });
      if (superCount >= 2) {
        return res.status(400).json({ msg: 'Only 2 Super Admins allowed.' });
      }
      approved = true;
    }

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const formattedDepartment = normalizedRole === 'admin' ? formatDepartment(department) : undefined;

    const newAdmin = new Admin({
      username,
      email,
      password: hashedPassword,
      role: normalizedRole,
      approved,
      department: formattedDepartment
    });

    await newAdmin.save();

    if (normalizedRole === 'admin') {
      const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET, { expiresIn: '2d' });
      const approvalLink = `${BACKEND_URL}/api/auth/approve/${token}`;

      const superAdmins = await Admin.find({ role: 'super', approved: true });

      const emailHTML = `
        <h3>🛂 New Admin Approval Needed</h3>
        <p>Username: <strong>${newAdmin.username}</strong></p>
        <p>Department: <strong>${newAdmin.department}</strong></p>
        <a href="${approvalLink}" style="padding:10px 20px;background:#007BFF;color:white;text-decoration:none;border-radius:5px;">
          Approve Admin
        </a>
      `;

      for (const superAdmin of superAdmins) {
        await mailTransporter.sendMail({
          from: `"AmaniLink Hub" <${process.env.EMAIL_SENDER}>`,
          to: superAdmin.email,
          subject: '🛂 Admin Approval Request',
          html: emailHTML
        });
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

// ✅ Approve Admin via Email
export const approveAdmin = async (req, res) => {
  try {
    const { token } = req.params;
    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).send('<h3>❌ Admin not found.</h3>');
    if (admin.approved) return res.status(400).send('<h3>⚠️ Admin is already approved.</h3>');

    admin.approved = true;
    await admin.save();

    const loginLink = `${CLIENT_BASE_URL}/admin`;

    const approvedMsg = `
      <div style="font-family:Arial,sans-serif;">
        <h2 style="color:#4CAF50;">✅ Your Admin Account Has Been Approved!</h2>
        <p>Hello <strong>${admin.username}</strong>,</p>
        <p>Your account on <strong>AmaniLink Hub</strong> has been successfully approved. You can now log in.</p>
        <p>
          <a href="${loginLink}" style="display:inline-block;margin-top:10px;padding:10px 20px;background:#007BFF;color:#fff;text-decoration:none;border-radius:5px;">
            🔐 Log In Now
          </a>
        </p>
        <p style="margin-top:20px;">Thank you for joining us.</p>
      </div>
    `;

    await mailTransporter.sendMail({
      from: `"AmaniLink Hub" <${process.env.EMAIL_SENDER}>`,
      to: admin.email,
      subject: '✅ Your Admin Account is Approved',
      html: approvedMsg
    });

    return res.send(`
      <h2>✅ Admin approved and notified successfully.</h2>
      <p><a href="${loginLink}">Click here to log in</a></p>
    `);

  } catch (err) {
    console.error('❌ Approval error:', err);
    return res.status(400).send('<h3>❌ Invalid or expired approval token.</h3>');
  }
};

// ✅ Login
export const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ msg: 'Please provide username, password, and role.' });
    }

    const normalizedRole = role.toLowerCase();
    const admin = await Admin.findOne({ username, role: normalizedRole });

    if (!admin) return res.status(400).json({ msg: 'Invalid credentials.' });
    if (!admin.approved) return res.status(403).json({ msg: '⏳ Account is pending approval.' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials.' });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      token,
      admin: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        department: admin.department,
        approved: admin.approved
      }
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    return res.status(500).json({ msg: 'Server error during login.' });
  }
};

// ✅ Data Management Controllers
export const getAllDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find().sort({ createdAt: -1 });
    res.json(discussions);
  } catch (err) {
    console.error('❌ Fetch discussions error:', err);
    res.status(500).json({ msg: 'Server error fetching discussions.' });
  }
};

export const getAllStories = async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    console.error('❌ Fetch stories error:', err);
    res.status(500).json({ msg: 'Server error fetching stories.' });
  }
};

export const updateStoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Story.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ msg: 'Story not found' });

    res.json(updated);
  } catch (err) {
    console.error('❌ Update story status error:', err);
    res.status(500).json({ msg: 'Failed to update story status' });
  }
};

export const getAllIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 });
    res.json(incidents);
  } catch (err) {
    console.error('❌ Fetch incidents error:', err);
    res.status(500).json({ msg: 'Server error fetching incidents.' });
  }
};

export const updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const incident = await Incident.findByIdAndUpdate(id, { status }, { new: true });
    if (!incident) return res.status(404).json({ msg: 'Incident not found' });

    res.json(incident);
  } catch (err) {
    console.error('❌ Update status error:', err);
    res.status(500).json({ msg: 'Failed to update status' });
  }
};

// ✅ Delete Routes
export const deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Incident.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ msg: 'Incident not found' });

    res.json({ msg: 'Incident deleted' });
  } catch (err) {
    console.error('❌ Delete incident error:', err);
    res.status(500).json({ msg: 'Failed to delete incident' });
  }
};

export const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Discussion.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ msg: 'Discussion not found' });

    res.json({ msg: 'Discussion deleted' });
  } catch (err) {
    console.error('❌ Delete discussion error:', err);
    res.status(500).json({ msg: 'Failed to delete discussion' });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Story.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ msg: 'Story not found' });

    res.json({ msg: 'Story deleted' });
  } catch (err) {
    console.error('❌ Delete story error:', err);
    res.status(500).json({ msg: 'Failed to delete story' });
  }
};

// ✅ News Routes
export const getAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    console.error('❌ Fetch news error:', err);
    res.status(500).json({ msg: 'Server error fetching news.' });
  }
};

export const updateNewsStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status' });
    }

    const updated = await News.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ msg: 'News not found' });

    res.json(updated);
  } catch (err) {
    console.error('❌ Update news status error:', err);
    res.status(500).json({ msg: 'Failed to update news status' });
  }
};

export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await News.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ msg: 'News not found' });

    res.json({ msg: 'News deleted' });
  } catch (err) {
    console.error('❌ Delete news error:', err);
    res.status(500).json({ msg: 'Failed to delete news' });
  }
};
