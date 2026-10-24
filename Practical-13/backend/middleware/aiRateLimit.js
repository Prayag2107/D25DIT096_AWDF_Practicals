/**
 * Per-User Per-Task Rate Limiting Middleware
 * Practical 13 - AI API Integration
 * 
 * Enforces a policy of 1 AI generation request per task per minute (60 seconds)
 * keyed by (User ID + normalized Task Title).
 * 
 * Note for production / multi-instance setups:
 * An in-memory Map is optimal for single-process lab environments. For distributed
 * or multi-container horizontal scaling, a distributed Redis-based limiter (e.g.,
 * redis key with EXPIRE 60) should be utilized.
 */

// In-memory store: Map<string, number> where value is the timestamp of last request
const requestHistory = new Map();

// Configurable window in milliseconds (default: 60 seconds)
const WINDOW_MS = 60 * 1000;

/**
 * Lazy cleanup of expired entries to keep memory bounded without background timers
 */
const pruneExpiredEntries = (now) => {
    if (requestHistory.size > 50) {
        for (const [key, timestamp] of requestHistory.entries()) {
            if (now - timestamp > WINDOW_MS) {
                requestHistory.delete(key);
            }
        }
    }
};

/**
 * Middleware enforcing 1 request per task per minute per authenticated user.
 */
const aiRateLimit = (req, res, next) => {
    // Requires authenticated user (from authMiddleware)
    const userId = req.user && req.user.id ? req.user.id : req.ip;
    
    // Normalize task title
    const rawTitle = req.body && req.body.title ? String(req.body.title) : '';
    const normalizedTitle = rawTitle.trim().toLowerCase();

    // If title is missing, let the controller handle validation (HTTP 400)
    if (!normalizedTitle) {
        return next();
    }

    const now = Date.now();
    pruneExpiredEntries(now);

    const rateKey = `${userId}:${normalizedTitle}`;
    const lastRequestTime = requestHistory.get(rateKey);

    if (lastRequestTime && (now - lastRequestTime) < WINDOW_MS) {
        const remainingMs = WINDOW_MS - (now - lastRequestTime);
        const retryAfterSeconds = Math.ceil(remainingMs / 1000);

        res.set('Retry-After', String(retryAfterSeconds));
        return res.status(429).json({
            success: false,
            fallback: false,
            message: `Rate limit exceeded. Please wait ${retryAfterSeconds} second${retryAfterSeconds === 1 ? '' : 's'} before generating another description for this task.`,
            retryAfter: retryAfterSeconds
        });
    }

    // Record request timestamp
    requestHistory.set(rateKey, now);
    next();
};

/**
 * Helper to manually clear rate limit store (useful for automated testing)
 */
const resetRateLimits = () => {
    requestHistory.clear();
};

module.exports = {
    aiRateLimit,
    resetRateLimits,
    WINDOW_MS
};
