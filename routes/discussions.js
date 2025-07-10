// routes/discussionRoutes.js
import express from 'express';
import Discussion from '../models/Discussion.js'; // ✅ Your Mongoose model
import {
  getAllDiscussions,
  getDiscussionById,
  addMessage
} from '../controllers/discussionController.js'; // ✅ Your existing controller functions

const router = express.Router();

// ✅ Create a new discussion
router.post('/create', async (req, res) => {
  try {
    const { title, location, category } = req.body;

    if (!title || !location || !category) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const newDiscussion = new Discussion({
      title,
      location,
      category,
      participants: 1
    });

    await newDiscussion.save();

    return res.status(201).json(newDiscussion);
  } catch (error) {
    console.error('❌ Error creating discussion:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ✅ Add a message to a discussion
router.post('/:id/message', addMessage);

// ✅ Get all discussions
router.get('/', getAllDiscussions);

// ✅ Get a specific discussion by ID
router.get('/:id', getDiscussionById);

export default router;
