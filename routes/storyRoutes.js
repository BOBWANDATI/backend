import express from 'express';
import {
  createStory,
  getStories,
  getUnverifiedStories,
  getAllStories,
  verifyStory,
  deleteStory
} from '../controllers/storyController.js';

const router = express.Router();

// 🌍 GET all verified stories (for public/frontend users)
router.get('/', getStories);

// 📝 POST new story
router.post('/', createStory);

// 🔍 GET unverified stories (admin panel)
router.get('/unverified', getUnverifiedStories);

// 🧑‍💼 GET all stories (verified + unverified) — for admin
router.get('/all', getAllStories);

// ✅ VERIFY a story
router.put('/:id/verify', verifyStory);

// 🗑️ DELETE a story
router.delete('/:id', deleteStory);

export default router;
