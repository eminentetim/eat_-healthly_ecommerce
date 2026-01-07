// src/config/redis.js
const Redis = require('ioredis');
const logger = require('../utils/logger');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,     // Required for BullMQ
  enableReadyCheck: false,        // Recommended
  lazyConnect: false,             // Auto-connect on first use
  retryStrategy: (times) => {
    if (times > 20) return null;
    return Math.min(times * 500, 10000);
  },
});

redisClient.on('connect', () => logger.info('Redis connecting...'));
redisClient.on('ready', () => logger.info('Redis client ready'));
redisClient.on('error', (err) => logger.error('Redis error', { error: err.message }));
redisClient.on('close', () => logger.warn('Redis connection closed'));
redisClient.on('reconnecting', () => logger.info('Redis reconnecting...'));

const closeRedis = async () => {
  if (redisClient.status !== 'end') {
    await redisClient.quit();
    logger.info('Redis connection closed gracefully');
  }
};

module.exports = {
  redisClient,
  closeRedis,
  // Do NOT export connectRedis anymore
};