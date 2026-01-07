// src/utils/idempotency.js
const ApiError = require('./apiError');

/**
 * Validate and extract idempotency key from headers
 * @param {object} req
 * @returns {string}
 */
const getIdempotencyKey = (req) => {
  const key = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];

  if (!key || typeof key !== 'string' || key.trim().length === 0) {
    throw ApiError.BadRequest('Idempotency-Key header is required for this operation');
  }

  if (key.length > 255) {
    throw ApiError.BadRequest('Idempotency-Key must be 255 characters or less');
  }

  return key.trim();
};

/**
 * Create a unique storage key for Redis
 * @param {string} key
 * @param {string} userId
 * @param {string} route
 * @returns {string}
 */
const createStorageKey = (key, userId, route) => {
  return `idempotency:${route}:${userId}:${key}`;
};

module.exports = {
  getIdempotencyKey,
  createStorageKey,
};