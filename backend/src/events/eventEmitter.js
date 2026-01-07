// src/events/eventEmitter.js
const EventEmitter = require('events');

class AppEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Increase if many listeners
  }
}

// Singleton instance
const eventEmitter = new AppEventEmitter();

module.exports = eventEmitter;