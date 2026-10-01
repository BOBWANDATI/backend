```javascript
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

// Database
import connectDB from './config/db.js';

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

// --------------------------------------------------
// PATH SETUP
// --------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// APP SETUP
// --------------------------------------------------

const app = express();
const server = http.createServer(app);

// --------------------------------------------------
// ENVIRONMENT VARIABLES
// --------------------------------------------------

const PORT = process.env.PORT || 5000;

const CLIENT_URL = process.env.CLIENT_URL || '*';

// --------------------------------------------------
// CORS
// --------------------------------------------------

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// --------------------------------------------------
// BODY PARSING
// --------------------------------------------------

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Peace Building API is running',
    database: 'MongoDB',
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is healthy',
    database: 'MongoDB',
    status: 'online',
  });
});

// --------------------------------------------------
// UPLOADS
// --------------------------------------------------

const uploadsPath = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath));

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

app.use('/api/auth', authRoutes);

app.use('/api/contact', contactRoutes);

app.use('/api/news', newsRoutes);

app.use('/api/report', reportRoutes);

app.use('/api/discussions', discussionRoutes);

app.use('/api/mpesa', mpesaRoutes);

app.use('/api/ai/peacebot', peacebotRoutes);

app.use('/api/admin', adminRoutes);

app.use('/api/stories', storyRoutes);

// --------------------------------------------------
// SOCKET.IO
// --------------------------------------------------

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },

  transports: ['websocket', 'polling'],
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    console.log(
      `🚫 Client disconnected: ${socket.id} | Reason: ${reason}`
    );
  });
});

// --------------------------------------------------
// EMAIL
// --------------------------------------------------

export const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

mailTransporter.verify((error) => {
  if (error) {
    console.error('❌ Email service error:', error.message);
  } else {
    console.log('📬 Email service ready');
  }
});

// --------------------------------------------------
// 404 HANDLER
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// --------------------------------------------------
// GLOBAL ERROR HANDLER
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error('❌ SERVER ERROR:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// --------------------------------------------------
// START SERVER AFTER DATABASE CONNECTION
// --------------------------------------------------

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, '0.0.0.0', () => {
      console.log('==========================================');
      console.log('🚀 Peace Building API is running');
      console.log(`📡 Port: ${PORT}`);
      console.log(`🌍 Client URL: ${CLIENT_URL}`);
      console.log('🟢 MongoDB: Connected');
      console.log('🔌 Socket.IO: Enabled');
      console.log('📧 Email: Enabled');
      console.log('==========================================');
    });
  } catch (error) {
    console.error('==========================================');
    console.error('❌ SERVER STARTUP FAILED');
    console.error(`❌ ${error.message}`);
    console.error('==========================================');

    process.exit(1);
  }
};

startServer();
```
