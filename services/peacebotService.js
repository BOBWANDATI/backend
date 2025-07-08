// services/peacebotService.js
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export const handlePeaceBotQuery = async (prompt) => {
  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        model: 'command-r-plus', // or "command-r" if needed
        message: prompt,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.text || '🤖 PeaceBot has no answer right now.';
  } catch (err) {
    console.error('❌ Cohere API error:', err.response?.data || err.message);
    return '⚠️ PeaceBot is currently offline.';
  }
};
