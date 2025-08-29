const jwt = require('jsonwebtoken');

const generateTokens = (payload) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m', // Access token expires in 15 minutes
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d', // Refresh token expires in 7 days
  });

  return { accessToken, refreshToken };
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

const verifyAccessToken = (token) => {
  return verifyToken(token, process.env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return verifyToken(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
};
