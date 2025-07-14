// routes/storyRoutes.js
import express from 'express';
import {
  createStory,
  getStories,
  getUnverifiedStories,
  verifyStory
} from '../controllers/storyController.js';

const router = express.Router();

// 🌍 GET all verified stories (for frontend users)
router.get('/', getStories);

// 📝 POST new story
router.post('/', createStory);

// 🔍 GET unverified stories (for admin panel if needed)
router.get('/unverified', getUnverifiedStories);

// ✅ PUT to verify a story (for admin to approve story)
router.put('/:id/verify', verifyStory);

export default router;
