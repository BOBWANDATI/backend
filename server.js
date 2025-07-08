// server.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';

// Route imports
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import reportRoutes from './routes/reportRoutes.js'; // ✅ FIXED HERE
import discussionRoutes from './routes/discussionRoutes.js';
import mpesaRoutes from './routes/mpesaRoutes.js';
import peacebotRoutes from './routes/peacebot.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join('uploads')));

app.use(cors({
  origin: 'https://amanilinkhub.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// ✅ Route Middlewares
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/report', reportRoutes); // ✅ This is your backend's report route
app.use('/api/discussions', discussionRoutes);
app.use('/api/mpesa', mpesaRoutes);
app.use('/api/ai/peacebot', peacebotRoutes);
app.use('/api/admin', adminRoutes);

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('✅ Peace Building Backend is running!');
});

// ✅ Socket.io events
io.on('connection', (socket) => {
  console.log('⚡ Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🚫 Client disconnected:', socket.id);
  });
});

// ✅ Database + server boot
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'peace_building'
})
.then(() => {
  console.log('✅ MongoDB connected');

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
});
