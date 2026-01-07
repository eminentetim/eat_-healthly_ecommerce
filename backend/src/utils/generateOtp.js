// src/utils/generateOtp.js
const crypto = require('crypto');

/**
 * Generate a secure numeric OTP
 * @param {number} length - OTP length (default: 6)
 * @returns {string} Numeric OTP
 */
const generateOtp = (length = 6) => {
  if (length < 4 || length > 10) {
    throw new Error('OTP length must be between 4 and 10 digits');
  }

  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;

  // Use crypto for secure randomness
  const randomBytes = crypto.randomBytes(4);
  const randomValue = randomBytes.readUInt32BE(0);

  const otp = (randomValue % (max - min + 1)) + min;
  return otp.toString().padStart(length, '0');
};

module.exports = { generateOtp };