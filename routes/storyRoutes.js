import express from 'express';
import Story from '../models/Story.js';
const router = express.Router();

// POST new story
router.post('/', async (req, res) => {
  try {
    const story = await Story.create(req.body);
    res.status(201).json(story);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create story', message: err.message });
  }
});

// GET all verified stories
router.get('/', async (req, res) => {
  try {
    const stories = await Story.find({ status: 'verified' }).sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
});

export default router;
