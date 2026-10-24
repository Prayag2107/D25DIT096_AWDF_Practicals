const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');
const { aiRateLimit } = require('../middleware/aiRateLimit');

/**
 * Public status endpoint for AI service configuration
 * GET /api/ai/status
 */
router.get('/status', aiController.getAiStatus);

/**
 * Generate AI task description based on task title
 * POST /api/ai/generate-description
 * Protected by JWT authentication and per-task rate limiter
 */
router.post(
    '/generate-description',
    authMiddleware,
    aiRateLimit,
    aiController.generateDescription
);

module.exports = router;
