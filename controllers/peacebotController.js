// controllers/peacebotController.js
import { handlePeaceBotQuery } from '../services/peacebotService.js';

export const callPeaceBot = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ text: '❌ Invalid prompt provided.' });
  }

  try {
    const aiText = await handlePeaceBotQuery(prompt);

    if (!aiText || typeof aiText !== 'string') {
      throw new Error('PeaceBot returned an empty or invalid response.');
    }

    res.status(200).json({ text: aiText });
  } catch (error) {
    console.error('❌ PeaceBot Error:', error.message || error);
    res.status(500).json({
      text: '⚠️ PeaceBot is currently unavailable.',
      error: error.message || 'Unknown error',
    });
  }
};
