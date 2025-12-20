const JWTService = require('./jwt.service');
const User = require('../database/mongodb/models/User.model');
const logger = require('../../common/utils/logger');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const decoded = JWTService.verify(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }

  try {
    const user = await User.findById(decoded.sub).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not active or not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    logger.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
};

module.exports = { protect, authorize };