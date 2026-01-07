// src/services/notificationService.js
const Notification = require('../models/Notification');
const logger = require('../utils/logger');
const ApiError = require('../utils/apiError');

/**
 * Create and save in-app notification
 */
const createInAppNotification = async (userId, title, body, data = {}, type = 'system') => {
  try {
    const notification = new Notification({
      user_id: userId,
      title,
      body,
      type,
      data,
    });

    await notification.save();
    logger.info('In-app notification created', { userId, title });

    return notification;
  } catch (error) {
    logger.error('Failed to create in-app notification', {
      userId,
      title,
      error: error.message,
    });
    // Do not throw — notifications are non-critical
    return null;
  }
};

/**
 * Get user's notifications (paginated)
 */
const getUserNotifications = async (userId, { page = 1, limit = 20, unreadOnly = false }) => {
  const filter = {
    user_id: userId,
    is_deleted: false,
  };

  if (unreadOnly) {
    filter.is_read = false;
  }

  const notifications = await Notification.find(filter)
    .sort({ created_at: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Notification.countDocuments(filter);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      has_more: page * limit < total,
    },
  };
};

/**
 * Mark notification as read
 */
const markAsRead = async (userId, notificationId) => {
  const result = await Notification.updateOne(
    { _id: notificationId, user_id: userId, is_deleted: false },
    { is_read: true }
  );

  if (result.modifiedCount === 0) {
    throw ApiError.NotFound('Notification not found or already read');
  }

  return { success: true };
};

/**
 * Mark all as read
 */
const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { user_id: userId, is_read: false, is_deleted: false },
    { is_read: true }
  );

  return { success: true };
};

/**
 * Soft delete notification
 */
const deleteNotification = async (userId, notificationId) => {
  const result = await Notification.updateOne(
    { _id: notificationId, user_id: userId },
    { is_deleted: true }
  );

  if (result.modifiedCount === 0) {
    throw ApiError.NotFound('Notification not found');
  }

  return { success: true };
};

module.exports = {
  createInAppNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};