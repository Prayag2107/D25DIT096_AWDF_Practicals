const taskEvents = require('./taskEvents');

// Configurable artificial delay for demonstration (defaults to 2000ms as per practical requirements)
const NOTIFICATION_DELAY_MS = parseInt(process.env.NOTIFICATION_DELAY_MS, 10) || 2000;

/**
 * Non-blocking delay utility using setTimeout wrapped in a Promise.
 * Does not block the Node.js event loop like a busy-wait loop would.
 * @param {number} ms - Milliseconds to pause execution
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Register all application event listeners exactly once.
 */
function initTaskListeners() {
    // Prevent duplicate listener registration across multiple imports or hot-reloads
    if (global.__taskListenersInitialized) {
        return;
    }
    global.__taskListenersInitialized = true;

    /**
     * Listener: 'task-created'
     * Asynchronously handles notification logging after a new task has been saved in MongoDB.
     */
    taskEvents.on('task-created', async (data) => {
        try {
            // Guard clause: handle missing or malformed event payload safely
            if (!data || !data.taskId || !data.userId || !data.title) {
                throw new Error('Malformed task-created event payload: missing required fields (taskId, userId, title).');
            }

            // Testing hook: allow simulating background notification failure without crashing server
            if (data.simulateError || data.title === 'TRIGGER_NOTIFICATION_ERROR') {
                throw new Error('Simulated notification dispatch failure (e.g. SMTP / webhook connection failure).');
            }

            const startTime = new Date().toISOString();
            console.log(`[Notification] Processing started at: ${startTime}`);
            console.log(`[Notification] Task "${data.title}" created.`);
            console.log(`[Notification] Assigned user: ${data.userId}`);

            // Non-blocking asynchronous delay (simulating email / push notification processing)
            await delay(NOTIFICATION_DELAY_MS);

            const endTime = new Date().toISOString();
            console.log(`[Notification] Processing completed at: ${endTime}`);
        } catch (err) {
            // Report asynchronously caught error via the shared event emitter error channel
            taskEvents.emit('error', err, 'task-created');
        }
    });

    /**
     * Listener: 'task-deleted'
     * Asynchronously handles notification logging after a task has been deleted from MongoDB.
     */
    taskEvents.on('task-deleted', async (data) => {
        try {
            // Guard clause: handle missing or malformed payload safely
            if (!data || !data.taskId || !data.userId) {
                throw new Error('Malformed task-deleted event payload: missing required fields (taskId, userId).');
            }

            console.log(`[Notification] Task "${data.title || 'Untitled'}" was deleted.`);
            console.log(`[Notification] Assigned user: ${data.userId}`);
            console.log(`[Notification] Deletion event processed at: ${new Date().toISOString()}`);
        } catch (err) {
            taskEvents.emit('error', err, 'task-deleted');
        }
    });

    /**
     * Listener: 'error'
     * Centralized error logger for events emitted by the taskEvents emitter.
     * Prevents uncaught EventEmitter error exceptions from crashing the Node.js process.
     */
    taskEvents.on('error', (error, eventName = 'unspecified') => {
        console.error(
            `[Event Error] ${new Date().toISOString()} [Event: ${eventName}] ${error.message}`
        );
    });

    console.log('[Events] Task event listeners successfully registered.');
}

// Automatically initialize listeners upon requiring this module
initTaskListeners();

module.exports = {
    initTaskListeners,
    NOTIFICATION_DELAY_MS,
    delay
};
