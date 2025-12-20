require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  appUrl: process.env.APP_URL,

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/organic_marketplace',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieExpiresIn: Number(process.env.JWT_COOKIE_EXPIRES_IN || 7),
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'no-reply@yourdomain.com',
  },

  otp: {
    length: Number(process.env.OTP_LENGTH || 6),
    expiresIn: Number(process.env.OTP_EXPIRES_IN || 300), // seconds
  },

  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  },
};

// Basic validation for critical secrets
if (!config.jwt.secret || config.jwt.secret.length < 32) {
  console.error('⚠️  JWT_SECRET must be set and at least 32 characters long');
  process.exit(1);
}

if (config.env !== 'production' && !config.resend.apiKey) {
  console.warn('⚠️  RESEND_API_KEY not set – emails will fail in production');
}

module.exports = config;