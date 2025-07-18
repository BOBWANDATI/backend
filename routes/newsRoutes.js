import express from 'express';
import { getAllNewsPublic, submitNews } from '../controllers/newsController.js';

const router = express.Router();

// ✅ Public: Get all news (used by VerifiedNews.jsx)
router.get('/', getAllNewsPublic);

// ✅ Public: Submit a new news article (used in form)
router.post('/', submitNews);

export default router;
