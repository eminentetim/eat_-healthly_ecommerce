require('dotenv').config();

const apiKey = process.env.RESEND_API_KEY;

if (process.env.NODE_ENV === 'production' && !apiKey) {
  console.error('FATAL ERROR: RESEND_API_KEY is required in production');
  process.exit(1);
}

const resendConfig = {
  apiKey: apiKey || null, // Allow null in dev for testing
  fromEmail: process.env.FROM_EMAIL || 'no-reply@yourdomain.com',
  otp: {
    subject: 'Your Verification Code',
    expiresInMinutes: Math.floor(Number(process.env.OTP_EXPIRES_IN || 300) / 60),
  },
};

module.exports = resendConfig;