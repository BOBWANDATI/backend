// services/peacebotService.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const handlePeaceBotQuery = async (prompt) => {
  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        model: 'command-r-plus-08-2024', // ✅ Updated model
        message: prompt,                  // ✅ Still valid for chat endpoint
        temperature: 0.7,                 // Balance between creative and focused
        max_tokens: 300,                  // Optional limit for length of response
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // ✅ Safely extract the text from Cohere's response
    const aiText =
      response?.data?.text ||
      response?.data?.message ||
      response?.data?.reply ||
      '🤖 PeaceBot has no answer right now.';

    return aiText.trim();
  } catch (err) {
    console.error('❌ Cohere API error:', err.response?.data || err.message);
    return '⚠️ PeaceBot is currently offline.';
  }
};
