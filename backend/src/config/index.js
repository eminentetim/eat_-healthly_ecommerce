// src/config/index.js
const { connectDB, close: closeDB } = require('./database');
const { connectRedis, closeRedis, redisClient } = require('./redis');
const { resend } = require('./resend');
const { generalLimiter, authLimiter, otpLimiter } = require('./rateLimiter');
const { PORT, NODE_ENV, Role, Status, Country } = require('./constants');

module.exports = {
  connectDB,
  closeDB,
  connectRedis,
  closeRedis,
  redisClient,
  resend,
  generalLimiter,
  authLimiter,
  otpLimiter,
  PORT,
  NODE_ENV,
  Role,
  Status,
  Country,
};