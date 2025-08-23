const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const fetchDeclutterSuggestions = async () => {
  // Validate API key exists
  const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing in environment variables');
  }

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama3-70b-8192',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful assistant that generates digital declutter suggestions to reduce carbon footprint.',
          },
          {
            role: 'user',
            content:
              'Give me 5 digital declutter suggestions to optimize digital carbon usage.',
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    // Verify response structure
    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Groq API');
    }

    return response.data.choices[0].message.content;
  } catch (err) {
    // Improved error logging
    console.error('Groq API Error:', {
      status: err.response?.status,
      error: err.response?.data?.error || err.message,
    });

    // User-friendly error messages
    if (err.response?.status === 401) {
      throw new Error('Invalid API key - check your GROQ_API_KEY');
    }
    if (err.code === 'ECONNABORTED') {
      throw new Error('Groq API request timed out');
    }

    throw new Error(
      `Failed to fetch suggestions: ${
        err.response?.data?.error?.message || err.message
      }`
    );
  }
};

module.exports = { fetchDeclutterSuggestions };
