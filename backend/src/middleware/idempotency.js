// src/middleware/idempotency.js
const redisClient = require('../config/redis').redisClient;
const ApiError = require('../utils/apiError');
const { getIdempotencyKey, createStorageKey } = require('../utils/idempotency');

/**
 * Ensure financial operations (wallet, orders, withdrawals) are idempotent
 */
const idempotency = (options = {}) => {
  return async (req, res, next) => {
    if (req.method !== 'POST') return next();

    let idempotencyKey;
    try {
      idempotencyKey = getIdempotencyKey(req);
    } catch (err) {
      return next(err);
    }

    const userId = req.user?.sub || 'anonymous';
    const route = req.route.path;
    const storageKey = createStorageKey(idempotencyKey, userId, route);

    const existing = await redisClient.get(storageKey);

    if (existing) {
      // Already processed - return cached response
      const cached = JSON.parse(existing);
      return res.status(cached.status).json(cached.response);
    }

    // Store response on successful completion
    const originalJson = res.json;
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redisClient.setEx(
          storageKey,
          24 * 60 * 60, // 24 hours
          JSON.stringify({ status: res.statusCode, response: body })
        );
      }
      return originalJson.call(this, body);
    };

    req.idempotencyKey = idempotencyKey;
    next();
  };
};

module.exports = idempotency;