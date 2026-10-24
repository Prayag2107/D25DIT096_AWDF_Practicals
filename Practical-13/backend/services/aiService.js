const OpenAI = require('openai');

/**
 * Reusable OpenAI Client Service
 * Practical 13 - AI API Integration
 */

// Environment configuration
const getApiKey = () => process.env.OPENAI_API_KEY || '';
const getModel = () => process.env.OPENAI_MODEL || 'gpt-4o-mini';
const getTimeout = () => Number(process.env.AI_TIMEOUT_MS) || 15000;

// Singleton client instance holder
let clientInstance = null;

/**
 * Checks whether a valid, non-placeholder OpenAI API key is configured.
 * @returns {boolean}
 */
const isConfigured = () => {
    const key = getApiKey().trim();
    if (!key) return false;
    // Check for common placeholders
    if (key === 'your_actual_api_key' || key === 'your_openai_api_key_here' || key === 'your_api_key_here') {
        return false;
    }
    return true;
};

/**
 * Returns or initializes the OpenAI SDK client instance.
 * @returns {OpenAI}
 */
const getClient = () => {
    if (!clientInstance) {
        clientInstance = new OpenAI({
            apiKey: getApiKey(),
            timeout: getTimeout(),
            maxRetries: 1
        });
    }
    return clientInstance;
};

/**
 * Reset client instance (useful for testing or key updates)
 */
const resetClient = () => {
    clientInstance = null;
};

/**
 * Overrides client instance (useful for unit tests and mocks)
 * @param {object} mockClient 
 */
const setClient = (mockClient) => {
    clientInstance = mockClient;
};

/**
 * Generate a task description based on task title using OpenAI Chat Completions.
 * 
 * @param {string} title - The task title supplied by the user
 * @returns {Promise<{description: string, fallback: boolean, message: string}>}
 */
const generateTaskDescription = async (title) => {
    if (!isConfigured()) {
        const error = new Error('OpenAI API key is not configured or contains placeholder values.');
        error.code = 'AI_NOT_CONFIGURED';
        error.status = 503;
        throw error;
    }

    const client = getClient();
    const model = getModel();

    // Standardized prompt conforming to Practical 13 specification
    const systemPrompt = 
        'Write a clear, concise task description based on the supplied task title. ' +
        'Describe the intended work and expected outcome. ' +
        'Do not invent deadlines, personal information, or unsupported requirements. ' +
        'Return only the description.';

    try {
        const completion = await client.chat.completions.create({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: title }
            ],
            max_tokens: 150,
            temperature: 0.7
        });

        // Safely extract generated content
        const choice = completion.choices && completion.choices[0];
        const content = choice && choice.message && choice.message.content 
            ? choice.message.content.trim() 
            : '';

        if (!content) {
            const error = new Error('AI provider returned an empty or malformed completion.');
            error.code = 'EMPTY_RESPONSE';
            error.status = 502;
            throw error;
        }

        return {
            description: content,
            fallback: false,
            message: 'AI description generated successfully.'
        };
    } catch (error) {
        // Classify OpenAI SDK errors without exposing credentials or internal traces
        if (error.code === 'AI_NOT_CONFIGURED' || error.code === 'EMPTY_RESPONSE') {
            throw error;
        }

        const classifiedError = new Error(error.message || 'AI service failure');
        classifiedError.originalError = error.name;

        if (error instanceof OpenAI.AuthenticationError || error.status === 401) {
            classifiedError.message = 'AI authentication failed. Invalid API credentials.';
            classifiedError.code = 'AUTHENTICATION_ERROR';
            classifiedError.status = 503;
        } else if (error instanceof OpenAI.RateLimitError || error.status === 429) {
            classifiedError.message = 'AI provider rate limit reached. Please try again shortly.';
            classifiedError.code = 'PROVIDER_RATE_LIMIT';
            classifiedError.status = 503;
        } else if (error instanceof OpenAI.APIConnectionTimeoutError || error.name === 'APIConnectionTimeoutError') {
            classifiedError.message = 'AI request timed out.';
            classifiedError.code = 'TIMEOUT';
            classifiedError.status = 504;
        } else if (error instanceof OpenAI.APIConnectionError || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            classifiedError.message = 'Unable to connect to AI provider network.';
            classifiedError.code = 'NETWORK_ERROR';
            classifiedError.status = 502;
        } else {
            classifiedError.message = 'AI service encountered an unexpected error.';
            classifiedError.code = 'PROVIDER_ERROR';
            classifiedError.status = 503;
        }

        throw classifiedError;
    }
};

module.exports = {
    getClient,
    setClient,
    resetClient,
    isConfigured,
    generateTaskDescription
};
