require('dotenv').config();

const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  otpPrefix: 'otp:',
  // Future: session, cache, rate-limit prefixes
};

module.exports = redisConfig;