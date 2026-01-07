// src/listeners/emailListener.js
const eventEmitter = require('../events/eventEmitter');
const { NotificationEvents } = require('../events/notificationEvents');
const { addEmailJob } = require('../jobs/emailJob');

eventEmitter.on(NotificationEvents.SEND_EMAIL, async ({ to, subject, template, data }) => {
  await addEmailJob(to, subject, template, data);
});