require('dotenv').config();

const appConfig = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  url: process.env.APP_URL || 'http://localhost:5000',
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000), // 15 minutes
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  },
};

module.exports = appConfig;