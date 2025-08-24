const { OAuth2Client } = require('google-auth-library');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// In-memory store for users (in production, use a database)
const users = new Map();

// Google authentication controller
const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: id, email, name, picture } = payload;

    // Check if user exists, if not create a new user
    let user = users.get(id);
    if (!user) {
      user = { id, email, name, picture };
      users.set(id, user);
    }

    // Store user in session
    req.session.user = user;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(401).json({ 
      success: false, 
      error: 'Invalid Google token' 
    });
  }
};

// Get user profile controller
const getProfile = (req, res) => {
  res.json({
    success: true,
    user: req.session.user
  });
};

// Logout controller
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        error: 'Could not log out' 
      });
    }
    
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
};

module.exports = {
  googleAuth,
  getProfile,
  logout
};