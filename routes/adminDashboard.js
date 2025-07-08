const express = require('express');
const router = express.Router();

const Report = require('../models/Report');
const Dialogue = require('../models/Dialogue');
const Story = require('../models/Story');
const Message = require('../models/Message');

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const reports = await Report.find();
    const dialogues = await Dialogue.find();
    const stories = await Story.find();
    const messages = await Message.find();

    res.json({
      reports,
      dialogues,
      stories,
      messages
    });
  } catch (err) {
    console.error('Dashboard fetch failed:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
