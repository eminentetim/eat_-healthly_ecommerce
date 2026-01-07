// src/jobs/queue.js
const { Queue } = require('bullmq');
const { redisClient } = require('../config/redis');

const emailQueue = new Queue('email', {
  connection: redisClient.duplicate(), // Dedicated connection
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: true,
    removeOnFail: 10,
  },
});

const notificationQueue = new Queue('notification', {
  connection: redisClient.duplicate(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'fixed', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: false,
  },
});

module.exports = {
  emailQueue,
  notificationQueue,
};