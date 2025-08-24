const express = require('express');
const router = express.Router();
const {
  googleAuth,
  getProfile,
  logout
} = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

// Google authentication endpoint
router.post('/google', googleAuth);

// Protected route example
router.get('/profile', authenticateUser, getProfile);

// Logout endpoint
router.post('/logout', authenticateUser, logout);

module.exports = router;