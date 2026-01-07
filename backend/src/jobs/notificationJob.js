// src/jobs/notificationJob.js
const { notificationQueue } = require('./queue');
const logger = require('../utils/logger');

const addNotificationJob = async (userId, title, body, data = {}) => {
  try {
    await notificationQueue.add('send-in-app', {
      userId,
      title,
      body,
      data,
      timestamp: new Date().toISOString(),
    });
    logger.info('In-app notification job added', { userId, title });
  } catch (error) {
    logger.error('Failed to add notification job', { error: error.message });
  }
};

module.exports = { addNotificationJob };