// src/config/rateLimiter.js
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { redisClient } = require('./redis');
const ApiError = require('../utils/apiError');

// Import type if using TypeScript (optional in JS)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Note: 'limit' is the new name in recent versions (replaces 'max')
  standardHeaders: 'draft-7', // Use draft-7 or true
  legacyHeaders: false,
  store: new RedisStore({
    // Correct way for ioredis
    sendCommand: (...args) => redisClient.call(...args),
  }),
  handler: () => {
    throw ApiError.TooManyRequests('Too many requests, please try again later.');
  },
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  handler: () => {
    throw ApiError.TooManyRequests('Too many login attempts. Please try again later.');
  },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  handler: () => {
    throw ApiError.TooManyRequests('Too many OTP requests. Please slow down.');
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  otpLimiter,
};