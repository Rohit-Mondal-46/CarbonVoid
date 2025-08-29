const express = require('express');
const router = express.Router();
const {
  getGoogleAuthUrl,
  googleCallback,
  getProfile,
  refreshAccessToken,
  getGmailToken,
  getExtensionAuth,
  logout
} = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');

// Google OAuth endpoints
router.get('/google', getGoogleAuthUrl);
router.get('/google/callback', googleCallback);

// Extension auth bridge - redirect to the frontend bridge page
router.get('/extension-auth-bridge', (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/extension-auth.html`);
});

// Protected routes
router.get('/me', authenticateUser, getProfile);
router.get('/extension-auth', authenticateUser, getExtensionAuth);
router.get('/gmail-token', authenticateUser, getGmailToken);
router.post('/refresh', refreshAccessToken);
router.post('/logout', authenticateUser, logout);

module.exports = router;