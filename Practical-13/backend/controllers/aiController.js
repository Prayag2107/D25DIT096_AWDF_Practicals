const aiService = require('../services/aiService');

/**
 * AI Controller
 * Practical 13 - AI API Integration
 */

/**
 * Generate AI-powered task description
 * POST /api/ai/generate-description
 */
const generateDescription = async (req, res) => {
    try {
        const { title } = req.body || {};

        // 1. Validation: title must be present and a non-empty string
        if (typeof title !== 'string' || !title.trim()) {
            return res.status(400).json({
                success: false,
                fallback: false,
                message: 'Task title is required and must be a non-empty string.'
            });
        }

        const trimmedTitle = title.trim();

        // 2. Validation: title length constraint (max 200 chars)
        if (trimmedTitle.length > 200) {
            return res.status(400).json({
                success: false,
                fallback: false,
                message: 'Task title is too long (maximum 200 characters).'
            });
        }

        // 3. Request description from AI service
        const result = await aiService.generateTaskDescription(trimmedTitle);

        // 4. Return successful generated description
        return res.status(200).json({
            description: result.description,
            fallback: false,
            message: result.message || 'AI description generated successfully.'
        });
    } catch (error) {
        // Safe diagnostic logging: never log API keys or raw user auth tokens
        const errorCode = error.code || 'UNKNOWN_ERROR';
        console.warn(`[AI Controller Graceful Degradation] Code: ${errorCode} | Reason: ${error.message}`);

        const httpStatus = error.status || 503;

        // Graceful fallback response conforming to Practical 13 specification
        return res.status(httpStatus).json({
            description: '',
            fallback: true,
            message: 'AI suggestions are temporarily unavailable. Please enter your description manually.'
        });
    }
};

/**
 * Health check / status for AI service integration
 * GET /api/ai/status
 */
const getAiStatus = (req, res) => {
    const configured = aiService.isConfigured();
    res.status(200).json({
        service: 'OpenAI Task Generator',
        configured,
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        timeoutMs: Number(process.env.AI_TIMEOUT_MS) || 15000,
        rateLimit: '1 request / task / minute'
    });
};

module.exports = {
    generateDescription,
    getAiStatus
};
