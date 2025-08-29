const { verifyAccessToken } = require('../utils/jwt');

const authenticateUser = (req, res, next) => {
  try {
    let token;
    
    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'Access token not found' 
      });
    }

    // Verify the token
    const decoded = verifyAccessToken(token);
    req.user = decoded; // Add user info to request object
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired access token' 
    });
  }
};

module.exports = { authenticateUser };