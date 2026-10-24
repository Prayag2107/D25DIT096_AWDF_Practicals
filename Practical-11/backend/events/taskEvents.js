const EventEmitter = require('node:events');

/**
 * TaskEvents
 * Custom event emitter class extending Node.js built-in EventEmitter.
 * A single shared instance is exported across the entire application (Singleton Pattern).
 */
class TaskEvents extends EventEmitter {}

// Create a single shared instance
const taskEvents = new TaskEvents();

// Set appropriate max listeners limit to prevent false positive leak warnings
taskEvents.setMaxListeners(20);

module.exports = taskEvents;
