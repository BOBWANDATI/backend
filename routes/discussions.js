// routes/discussions.js
const express = require('express');
const router = express.Router();
const {
  createDiscussion,
  addMessage,
  getAllDiscussions,
  getDiscussionById
} = require('../controllers/discussionController');

// Routes
router.post('/create', createDiscussion);
router.post('/:id/message', addMessage);
router.get('/', getAllDiscussions);
router.get('/:id', getDiscussionById);

module.exports = router;
