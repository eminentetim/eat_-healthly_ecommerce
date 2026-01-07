// src/events/notificationEvents.js
const eventEmitter = require('./eventEmitter');

const NotificationEvents = {
  SEND_IN_APP: 'notification:send_in_app',
  SEND_EMAIL: 'notification:send_email',
};

const emitNotification = (type, payload) => {
  eventEmitter.emit(type, payload);
};

module.exports = {
  NotificationEvents,
  emitInAppNotification: (userId, title, body, data = {}) =>
    emitNotification(NotificationEvents.SEND_IN_APP, { userId, title, body, data }),
  emitEmailNotification: (to, subject, template, data) =>
    emitNotification(NotificationEvents.SEND_EMAIL, { to, subject, template, data }),
};