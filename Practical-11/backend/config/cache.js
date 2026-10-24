const NodeCache = require('node-cache');

// Configurable default TTL from environment variable, defaulting to 60 seconds
const defaultTTL = parseInt(process.env.CACHE_TTL, 10) || 60;

/**
 * Shared in-memory cache instance (Singleton pattern)
 * - stdTTL: default Time-To-Live in seconds for all stored keys
 * - checkperiod: period in seconds for automatic deletion check of expired keys
 * - useClones: deep clone objects on get/set to prevent mutation of cached data
 */
const cache = new NodeCache({
    stdTTL: defaultTTL,
    checkperiod: 120,
    useClones: true
});

module.exports = cache;
