const { OAuth2Client } = require('google-auth-library');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');

// Initialize Google OAuth client
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/api/auth/google/callback'
);

// In-memory store for users and refresh tokens (in production, use a database)
const users = new Map();
const refreshTokens = new Set();
const userGoogleTokens = new Map(); // Store Google tokens for Gmail API access

// Generate Google OAuth URL
const getGoogleAuthUrl = (req, res) => {
  try {
    const authUrl = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'],
      prompt: 'consent',
      state: 'secure_random_state', // Add CSRF protection in production
    });

    res.redirect(authUrl);
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate authentication URL' 
    });
  }
};

// Handle Google OAuth callback
const googleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}?error=authorization_failed`);
    }

    // Exchange authorization code for tokens
    const { tokens } = await googleClient.getToken(code);
    
    // Verify the ID token and get user info
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // Store Google tokens for Gmail API access
    userGoogleTokens.set(googleId, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expiry_date
    });

    // Check if user exists, if not create a new user
    let user = users.get(googleId);
    if (!user) {
      user = { 
        id: googleId, 
        email, 
        name, 
        picture,
        createdAt: new Date().toISOString()
      };
      users.set(googleId, user);
    } else {
      // Update user info in case it changed
      user.name = name;
      user.picture = picture;
      user.lastLogin = new Date().toISOString();
    }

    // Generate JWT tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const { accessToken, refreshToken } = generateTokens(tokenPayload);
    
    // Store refresh token
    refreshTokens.add(refreshToken);

    // Set secure HTTP-only cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Check if this is an extension auth request
    const isExtension = req.query.state === 'extension_auth';
    
    if (isExtension) {
      // For extension auth, redirect to dashboard with a special parameter
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?auth=extension_success`);
    } else {
      // Redirect to frontend success page
      res.redirect(`${process.env.FRONTEND_URL}/dashboard?auth=success`);
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}?error=authentication_failed`);
  }
};

// Get current user profile
const getProfile = (req, res) => {
  try {
    const user = users.get(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile',
    });
  }
};

// Refresh access token
const refreshAccessToken = (req, res) => {
  try {
    let refreshToken;
    
    console.log('Refresh request received');
    console.log('Cookies:', req.cookies);
    console.log('Body:', req.body);
    
    // Get refresh token from cookies or body
    if (req.cookies && req.cookies.refreshToken) {
      refreshToken = req.cookies.refreshToken;
      console.log('Found refresh token in cookies');
    } else if (req.body && req.body.refreshToken) {
      refreshToken = req.body.refreshToken;
      console.log('Found refresh token in body');
    }

    if (!refreshToken) {
      console.log('No refresh token found');
      return res.status(401).json({
        success: false,
        error: 'Refresh token not found',
      });
    }

    // Check if refresh token exists in our store
    if (!refreshTokens.has(refreshToken)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Generate new access token
    const tokenPayload = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(tokenPayload);
    
    // Remove old refresh token and add new one
    refreshTokens.delete(refreshToken);
    refreshTokens.add(newRefreshToken);

    // Set new cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      error: 'Failed to refresh token',
    });
  }
};

// Get Gmail access token for extension
const getGmailToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const googleTokens = userGoogleTokens.get(userId);
    
    if (!googleTokens) {
      return res.status(401).json({
        success: false,
        error: 'Gmail access not authorized. Please sign in again.',
      });
    }

    // Check if token is expired and refresh if needed
    if (googleTokens.expires_at && Date.now() >= googleTokens.expires_at) {
      if (googleTokens.refresh_token) {
        try {
          googleClient.setCredentials({
            refresh_token: googleTokens.refresh_token
          });
          
          const { credentials } = await googleClient.refreshAccessToken();
          
          // Update stored tokens
          userGoogleTokens.set(userId, {
            access_token: credentials.access_token,
            refresh_token: credentials.refresh_token || googleTokens.refresh_token,
            expires_at: credentials.expiry_date
          });
          
          return res.json({
            success: true,
            accessToken: credentials.access_token,
          });
        } catch (refreshError) {
          console.error('Failed to refresh Gmail token:', refreshError);
          return res.status(401).json({
            success: false,
            error: 'Failed to refresh Gmail access. Please sign in again.',
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          error: 'Gmail access expired. Please sign in again.',
        });
      }
    }

    res.json({
      success: true,
      accessToken: googleTokens.access_token,
    });
  } catch (error) {
    console.error('Error getting Gmail token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Gmail access token',
    });
  }
};

// Logout user
const logout = (req, res) => {
  try {
    const userId = req.user.id;
    
    // Remove refresh token from store if it exists
    if (req.cookies && req.cookies.refreshToken) {
      refreshTokens.delete(req.cookies.refreshToken);
    }

    // Remove Google tokens
    if (userId) {
      userGoogleTokens.delete(userId);
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout',
    });
  }
};

// Extension authentication endpoint - provides JWT token for extension
const getExtensionAuth = (req, res) => {
  try {
    const user = users.get(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Generate a JWT token for the extension (not httpOnly)
    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const { accessToken } = generateTokens(tokenPayload);

    res.json({
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error('Error getting extension auth:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get extension authentication',
    });
  }
};

module.exports = {
  getGoogleAuthUrl,
  googleCallback,
  getProfile,
  refreshAccessToken,
  getGmailToken,
  getExtensionAuth,
  logout,
};
