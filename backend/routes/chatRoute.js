const express = require('express');
const { handleChat } = require('../controllers/chatController'); // Ensure this path is correct

const router = express.Router();

// Define the /chat POST route to handle user input
router.post('/chat', handleChat);

module.exports = router;
