// src/jobs/processor.js
const { Worker } = require('bullmq');
const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');

const startQueueProcessor = () => {
  // Email Worker
  new Worker('email', async (job) => {
    const { to, subject, template, data } = job.data;
    await emailService.sendTemplatedEmail(to, subject, template, data);
  }, {
    connection: redisClient.duplicate(),
    concurrency: 10,
  }).on('failed', (job, err) => {
    logger.error(`Email job ${job.id} failed`, { error: err.message });
  });

  // Notification Worker
  new Worker('notification', async (job) => {
    const { userId, title, body, data } = job.data;
    await notificationService.createInAppNotification(userId, title, body, data);
  }, {
    connection: redisClient.duplicate(),
    concurrency: 20,
  }).on('failed', (job, err) => {
    logger.error(`Notification job ${job.id} failed`, { error: err.message });
  });

  logger.info('Background job workers started');
};

module.exports = { startQueueProcessor };