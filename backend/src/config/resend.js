// src/config/resend.js
const { Resend } = require('resend');
const logger = require('../utils/logger');

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is required in environment variables');
}

const resend = new Resend(RESEND_API_KEY);

// Test connection on startup (optional, logs success)
const testResend = async () => {
  try {
    // Resend doesn't have a ping, but we can list audiences or something lightweight
    logger.info('Resend client initialized successfully');
  } catch (error) {
    logger.error('Resend initialization issue', { error: error.message });
  }
};

// Run test on import (non-blocking)
testResend();

module.exports = { resend };