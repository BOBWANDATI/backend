import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';

// Routes
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import discussionRoutes from './routes/discussionRoutes.js';
import mpesaRoutes from './routes/mpesaRoutes.js';
import peacebotRoutes from './routes/peacebot.js';
import adminRoutes from './routes/adminRoutes.js';
import storyRoutes from './routes/storyRoutes.js';

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// App setup
const app = express();
const server = http.createServer(app);

// ENV
const CLIENT_URL = process.env.CLIENT_URL || "*";

// 🔥 CLEAN CORS (IMPORTANT FOR SOCKET + API)
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/ai/peacebot', peacebotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stories', storyRoutes);

// 🔥 SOCKET.IO (FIXED - IMPORTANT)
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'] // 🔥 FIX for 400 error
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🚫 Client disconnected:', socket.id);
  });
});

// 🔥 EMAIL
export const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD
  }
});

mailTransporter.verify((error) => {
  if (error) {
    console.error('❌ Email Error:', error);
  } else {
    console.log('📬 Email ready');
  }
});

// 🔥 DATABASE CONNECTION
import connectDB from './config/db.js';

connectDB()
  .then(() => console.log('🟢 MongoDB connected'))
  .catch((err) => {
    console.error('🔴 MongoDB error:', err);
    process.exit(1);
  });

// 🔥 GLOBAL ERROR HANDLER (IMPORTANT FOR 500 ERRORS)
app.use((err, req, res, next) => {
  console.error('❌ SERVER ERROR:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 🔥 START SERVER
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 API: https://backend-m6u3.onrender.com`);
});
