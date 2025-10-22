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
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';

// ✅ Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Route Imports
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import discussionRoutes from './routes/discussionRoutes.js';
import mpesaRoutes from './routes/mpesaRoutes.js';
import peacebotRoutes from './routes/peacebot.js';
import adminRoutes from './routes/adminRoutes.js';
import storyRoutes from './routes/storyRoutes.js';

// ✅ Setup Express App + HTTP Server
const app = express();
const server = http.createServer(app);

// ✅ CORS Options
const corsOptions = {
  origin: process.env.CLIENT_URL || '*', // Use frontend URL (e.g. https://amanilinkhub.vercel.app)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
};

// ✅ Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Ensure /uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('📁 Created uploads folder at:', uploadsPath);
}

// ✅ Serve uploaded images publicly
app.use('/uploads', express.static(uploadsPath));
console.log(`📸 Serving static images from: ${uploadsPath}`);

// ✅ Setup Socket.IO with CORS
const io = new Server(server, { cors: corsOptions });
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

// ✅ Socket Events
io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🚫 Client disconnected:', socket.id);
  });
});

// ✅ Email Transport (Gmail)
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

// ✅ Test email config
mailTransporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email Transport Error:', error);
  } else {
    console.log('📬 Email transporter is ready to send messages.');
  }
});

// ✅ Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'peace_building'
})
.then(() => {
  console.log('✅ MongoDB connected');
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Static uploads available at: https://backend-m6u3.onrender.com/uploads/<filename>`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err.message);
});
