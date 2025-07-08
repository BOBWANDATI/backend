// routes/authRoutes.js
import express from 'express';
import { register, login, approveAdmin } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/approve/:token', approveAdmin);

export default router;
