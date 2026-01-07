// src/events/userEvents.js
const eventEmitter = require('./eventEmitter');

const UserEvents = {
  REGISTERED: 'user:registered',
  PROFILE_COMPLETED: 'user:profile_completed',
  VERIFIED: 'user:verified',
  SUSPENDED: 'user:suspended',
  DELETED: 'user:deleted',
};

const emitUserEvent = (event, user) => {
  eventEmitter.emit(event, { user });
};

module.exports = {
  UserEvents,
  emitUserRegistered: (user) => emitUserEvent(UserEvents.REGISTERED, user),
  emitUserProfileCompleted: (user) => emitUserEvent(UserEvents.PROFILE_COMPLETED, user),
  emitUserVerified: (user) => emitUserEvent(UserEvents.VERIFIED, user),
  emitUserSuspended: (user) => emitUserEvent(UserEvents.SUSPENDED, user),
  emitUserDeleted: (user) => emitUserEvent(UserEvents.DELETED, user),
};