// src/listeners/notificationListener.js
const eventEmitter = require('../events/eventEmitter');
const { NotificationEvents } = require('../events/notificationEvents');
const { addNotificationJob } = require('../jobs/notificationJob');

eventEmitter.on(NotificationEvents.SEND_IN_APP, async ({ userId, title, body, data }) => {
  await addNotificationJob(userId, title, body, data);
});