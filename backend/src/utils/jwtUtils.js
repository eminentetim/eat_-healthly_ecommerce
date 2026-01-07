// src/utils/jwtUtils.js
const jwt = require('jsonwebtoken');
const ApiError = require('./apiError');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');


if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required in environment variables');
}

/**
 * Sign JWT token
 * @param {object} payload
 * @param {string} expiresIn
 * @returns {string}
 */
const signToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
    algorithm: 'HS256',
  });
};

/**
 * Verify JWT token
 * @param {string} token
 * @returns {object}
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      throw ApiError.Unauthorized('Invalid token');
    }
    if (err.name === 'TokenExpiredError') {
      throw ApiError.Unauthorized('Token expired');
    }
    throw ApiError.Unauthorized('Token verification failed');
  }
};

module.exports = {
  signToken,
  verifyToken,
};