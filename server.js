import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
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
const CLIENT_URL = process.env.CLIENT_URL;

// ✅ CORS (ONLY ONE CONFIG — CLEAN)
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true
  },
  transports: ['websocket']
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🚫 Client disconnected:', socket.id);
  });
});

// Email
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

// ✅ CONNECT DB (DO NOT BLOCK SERVER)
import connectDB from './config/db.js';
connectDB();

// ✅ START SERVER (ALWAYS RUN)
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 API: https://backend-m6u3.onrender.com`);
});
