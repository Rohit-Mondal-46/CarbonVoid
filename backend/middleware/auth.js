// Authentication middleware
const authenticateUser = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  
  return res.status(401).json({ error: 'Authentication required' });
};

module.exports = {
  authenticateUser
};