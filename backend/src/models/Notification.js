// src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['order', 'wallet', 'system', 'promotion', 'vendor'],
      default: 'system',
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound index for efficient queries
notificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });
notificationSchema.index({ user_id: 1, is_deleted: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;