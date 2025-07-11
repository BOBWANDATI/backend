import express from 'express';
import {
  createDiscussion,
  getAllDiscussions,
  getDiscussionById,
  addMessage,
  deleteDiscussion
} from '../controllers/discussionController.js';

const router = express.Router();

// ✅ Create a new discussion
router.post('/create', createDiscussion);

// ✅ Add a message to a discussion
router.post('/:id/messages', addMessage);

// ✅ Get all discussions
router.get('/', getAllDiscussions);

// ✅ Get a specific discussion by ID
router.get('/:id', getDiscussionById);

// ✅ Delete a discussion
router.delete('/:id', deleteDiscussion);

export default router;
