require('dotenv').config();

const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 32) {
  console.error('FATAL ERROR: JWT_SECRET is not set or too weak (minimum 32 characters)');
  process.exit(1);
}

const jwtConfig = {
  secret,
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookie: {
    expiresInDays: Number(process.env.JWT_COOKIE_EXPIRES_IN || 7),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
};

module.exports = jwtConfig;