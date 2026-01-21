// services/peacebotService.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const handlePeaceBotQuery = async (prompt) => {
  if (!process.env.COHERE_API_KEY) {
    throw new Error('COHERE_API_KEY is missing in environment variables');
  }

  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/chat',
      {
        model: 'command-r-plus-08-2024',
        message: prompt,
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiText = response?.data?.text;

    if (!aiText || typeof aiText !== 'string') {
      throw new Error('Cohere returned an empty response');
    }

    return aiText.trim();
  } catch (error) {
    console.error(
      '❌ PeaceBot Cohere Error:',
      error.response?.data || error.message
    );
    throw error; // IMPORTANT: let controller handle it
  }
};
