// ✅ Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

// ✅ Core Imports
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';

// ✅ Fix __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Routes
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import discussionRoutes from './routes/discussionRoutes.js';
import mpesaRoutes from './routes/mpesaRoutes.js';
import peacebotRoutes from './routes/peacebot.js';
import adminRoutes from './routes/adminRoutes.js';
import storyRoutes from './routes/storyRoutes.js';

// ✅ App + Server
const app = express();
const server = http.createServer(app);

// ✅ FRONTEND URL (VERY IMPORTANT)
const CLIENT_URL = process.env.CLIENT_URL || "https://amanilinkhub.vercel.app";

// ✅ CORS CONFIG (STRICT + CORRECT)
const corsOptions = {
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// ✅ Middleware (ORDER MATTERS)
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ✅ FIXES PREFLIGHT
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Uploads folder
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('📁 Created uploads folder at:', uploadsPath);
}

// ✅ Static files
app.use('/uploads', express.static(uploadsPath));
console.log(`📸 Serving static images from: ${uploadsPath}`);

// ✅ SOCKET.IO (FIXED CONFIG)
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling'] // ✅ IMPORTANT
});

app.set('io', io);
export { io };

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/ai/peacebot', peacebotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stories', storyRoutes);

// ✅ Socket events
io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🚫 Client disconnected:', socket.id);
  });
});

// ✅ Email (Gmail)
export const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD
  }
});

mailTransporter.verify((error) => {
  if (error) {
    console.error('❌ Email Transport Error:', error);
  } else {
    console.log('📬 Email transporter ready');
  }
});

// ✅ MongoDB + Server Start
mongoose.connect(process.env.MONGO_URI, {
  dbName: 'peace_building'
})
.then(() => {
  console.log('✅ MongoDB connected');

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 API: https://backend-m6u3.onrender.com`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
});
