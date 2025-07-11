import express from 'express';
import {
  createDiscussion,
  getAllDiscussions,
  getDiscussionById,
  addMessage,
  deleteDiscussion // ✅ Good: This is correctly imported
} from '../controllers/discussionController.js';

const router = express.Router();

// 📌 Create a new discussion
router.post('/create', createDiscussion);

// 📌 Get all discussions
router.get('/', getAllDiscussions);

// 📌 Get a single discussion by ID
router.get('/:id', getDiscussionById);

// 📌 Add a message to a discussion
router.post('/:id/messages', addMessage);

// ✅ 📌 Delete a discussion
router.delete('/:id', deleteDiscussion); // ✅ This is the required line

export default router;
