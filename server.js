// ✅ Load environment variables first!
import dotenv from 'dotenv';
dotenv.config(); // ⬅️ MUST be at the top

// ✅ Core Imports
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import nodemailer from 'nodemailer';

// ✅ Route Imports
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import discussionRoutes from './routes/discussionRoutes.js';
import mpesaRoutes from './routes/mpesaRoutes.js';
import peacebotRoutes from './routes/peacebot.js';
import adminRoutes from './routes/adminRoutes.js';

// ✅ Setup Express App + HTTP Server
const app = express();
const server = http.createServer(app);

// ✅ CORS Options (used for both Express and Socket.IO)
  const corsOptions = {
  origin: process.env.CLIENT_URL || '*', // should be CLIENT_BASE_URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

  // Vercel frontend URL or allow all
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};

// ✅ Setup Socket.IO with shared CORS
const io = new Server(server, { cors: corsOptions });
app.set('io', io);

// ✅ Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join('uploads')));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/ai/peacebot', peacebotRoutes);
app.use('/api/admin', adminRoutes);

// ✅ Socket Events
io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🚫 Client disconnected:', socket.id);
  });
});

// ✅ Email Transport Setup (Gmail)
export const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ✅ Optional: Test email config
mailTransporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email Transport Error:', error);
  } else {
    console.log('📬 Email transporter is ready to send messages.');
  }
});

// ✅ MongoDB Connection & Server Launch
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'peace_building',
})
.then(() => {
  console.log('✅ MongoDB connected');
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);

  });
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
}); 
