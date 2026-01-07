// src/jobs/emailJob.js
const { emailQueue } = require('./queue');
const logger = require('../utils/logger');

const addEmailJob = async (to, subject, template, data = {}) => {
  try {
    await emailQueue.add('send-email', {
      to,
      subject,
      template,
      data,
    }, {
      priority: template.includes('OTP') ? 1 : 3, // OTP highest priority
    });
    logger.info('Email job added to queue', { to, subject });
  } catch (error) {
    logger.error('Failed to add email job', { error: error.message });
    throw error;
  }
};

module.exports = { addEmailJob };