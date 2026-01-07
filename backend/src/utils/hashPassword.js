// src/utils/hashPassword.js
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

/**
 * Hash a password securely
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare plain password with hash
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = async (password, hash) => {
  if (!password || !hash) return false;
  return await bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword,
};