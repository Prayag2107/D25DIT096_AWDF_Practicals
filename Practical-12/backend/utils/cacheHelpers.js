const cache = require('../config/cache');

// In-memory counters for cache hit/miss statistics
let stats = {
    hits: 0,
    misses: 0
};

// Global toggle for benchmarking (overridden by process.env.ENABLE_CACHE)
let cacheEnabledRuntime = process.env.ENABLE_CACHE !== 'false';

/**
 * Record a cache hit event
 */
function recordHit() {
    stats.hits++;
}

/**
 * Record a cache miss event
 */
function recordMiss() {
    stats.misses++;
}

/**
 * Check if caching is currently active
 * Supports global runtime toggle, env var, and request header bypass
 */
function isCacheEnabled(req) {
    if (!cacheEnabledRuntime) return false;
    if (process.env.ENABLE_CACHE === 'false') return false;

    // Allow selective cache bypass for testing via header
    if (req && req.headers && (req.headers['x-bypass-cache'] === 'true' || req.headers['x-no-cache'] === 'true')) {
        return false;
    }
    return true;
}

/**
 * Set runtime cache enabled flag (useful for testing before/after response times without restart)
 */
function setCacheEnabled(enabled) {
    cacheEnabledRuntime = Boolean(enabled);
    return cacheEnabledRuntime;
}

/**
 * Generate a user-isolated cache key for the task list
 * Prevents cross-tenant data leakage between authenticated users
 * @param {string} userId - Authenticated user ID
 * @returns {string} e.g. "tasks:user:64f1..."
 */
function getUserTaskListKey(userId) {
    return `tasks:user:${userId}`;
}

/**
 * Generate a user-isolated cache key for a single task
 * Prevents cross-tenant data leakage between authenticated users
 * @param {string} userId - Authenticated user ID
 * @param {string} taskId - Target task ID
 * @returns {string} e.g. "task:64f1...:64f2..."
 */
function getUserSingleTaskKey(userId, taskId) {
    return `task:${userId}:${taskId}`;
}

/**
 * Invalidate user task list and optional single task cache
 * Called strictly after successful write operations (POST, PUT, DELETE)
 * @param {string} userId - Authenticated user ID
 * @param {string} [taskId] - Optional single task ID
 */
function invalidateUserTaskCache(userId, taskId = null) {
    if (!userId) return;

    // Invalidate user's collection cache
    const listKey = getUserTaskListKey(userId);
    cache.del(listKey);

    // If a specific task was modified, invalidate its individual cache entry as well
    if (taskId) {
        const singleKey = getUserSingleTaskKey(userId, taskId);
        cache.del(singleKey);
    }
}

/**
 * Retrieve current cache performance statistics
 * Safely computes hit rate even when no requests have occurred
 */
function getCacheStats() {
    const total = stats.hits + stats.misses;
    const hitRate = total === 0 ? '0.00%' : `${((stats.hits / total) * 100).toFixed(2)}%`;

    return {
        hits: stats.hits,
        misses: stats.misses,
        totalRequests: total,
        hitRate,
        keys: cache.keys().length,
        cachedKeys: process.env.NODE_ENV !== 'production' ? cache.keys() : undefined,
        ttl: parseInt(process.env.CACHE_TTL, 10) || 60,
        cachingEnabled: cacheEnabledRuntime && process.env.ENABLE_CACHE !== 'false'
    };
}

/**
 * Reset cache stats and flush all cached keys (for testing & measurement runs)
 */
function resetCache() {
    cache.flushAll();
    stats.hits = 0;
    stats.misses = 0;
    return {
        success: true,
        message: 'Cache flushed and statistics reset successfully'
    };
}

module.exports = {
    recordHit,
    recordMiss,
    isCacheEnabled,
    setCacheEnabled,
    getUserTaskListKey,
    getUserSingleTaskKey,
    invalidateUserTaskCache,
    getCacheStats,
    resetCache
};
