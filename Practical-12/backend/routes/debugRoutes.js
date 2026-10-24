const express = require('express');
const router = express.Router();
const {
    getCacheStats,
    resetCache,
    setCacheEnabled
} = require('../utils/cacheHelpers');

/**
 * GET /api/debug/cache-stats
 * Returns current cache hits, misses, hit rate, and active key count
 */
router.get('/cache-stats', (req, res) => {
    const stats = getCacheStats();
    res.status(200).json({
        success: true,
        ...stats
    });
});

/**
 * POST /api/debug/cache-reset
 * Development utility: flushes in-memory cache and resets hit/miss counters
 */
router.post('/cache-reset', (req, res) => {
    const result = resetCache();
    res.status(200).json(result);
});

/**
 * POST /api/debug/cache-toggle
 * Development utility: dynamically enable or disable caching without restarting the server
 * Body: { "enabled": true | false }
 */
router.post('/cache-toggle', (req, res) => {
    const { enabled } = req.body;
    if (typeof enabled !== 'boolean') {
        return res.status(400).json({
            success: false,
            message: 'Body parameter "enabled" must be a boolean (true or false)'
        });
    }

    const state = setCacheEnabled(enabled);
    res.status(200).json({
        success: true,
        message: `In-memory caching is now ${state ? 'ENABLED' : 'DISABLED'}`,
        cachingEnabled: state
    });
});

module.exports = router;
