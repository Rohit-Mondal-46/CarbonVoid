const greenBotChain = require('../chains/greenBotChain'); // Ensure this path is correct
const asyncHandler = require('../utils/asyncHandler');     // Ensure this path is correct

const handleChat = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    // Call the greenBotChain to get the response
    const result = await greenBotChain.call({ input: message });

    console.log('Result from GreenBot:', result);

    // Example of saving to MongoDB (optional, remove if not needed)
    // const chat = new Chat({ message, reply: result.response });
    // await chat.save();

    return res.json({ reply: result.response });
  } catch (err) {
    console.error('ChatController Error:', err);
    return res.status(500).json({
      error: 'GreenBot failed to respond.',
      details: err.message || err.toString()
    });
  }
});

module.exports = { handleChat };
