// src/middleware/auth.js
const { verifyToken } = require('../utils/jwtUtils');
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

/**
 * Protect routes - Verify JWT access token
 */
const auth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw ApiError.Unauthorized('Access denied. No token provided.');
    }

    const payload = verifyToken(token);

    // Attach user info to request
    req.user = {
      sub: payload.sub,     // user ID
      role: payload.role,
    };

    next();
  } catch (error) {
    logger.warn('Authentication failed', { error: error.message, ip: req.ip });
    next(error instanceof ApiError ? error : ApiError.Unauthorized('Invalid token'));
  }
};

module.exports = { auth };