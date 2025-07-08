// routes/peacebot.js
import express from 'express';
import { handlePeaceBotQuery } from '../services/peacebotService.js';

const router = express.Router();

// POST /api/ai/peacebot
router.post('/', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ text: '❌ Invalid prompt provided.' });
  }

  try {
    const reply = await handlePeaceBotQuery(prompt);
    res.status(200).json({ text: reply });
  } catch (error) {
    console.error('❌ PeaceBot error:', error.message);
    res.status(500).json({ text: '⚠️ PeaceBot failed to respond.' });
  }
});

export default router;
