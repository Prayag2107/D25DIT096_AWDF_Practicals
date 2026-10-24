const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const aiService = require('../services/aiService');
const { resetRateLimits } = require('../middleware/aiRateLimit');

describe('Practical 13 - AI API Integration Test Suite', () => {
    const JWT_SECRET = process.env.JWT_SECRET || 'pr11_super_secret_jwt_key_98234729384729384_container_2026';
    const mockUserId = '64e8b92ef1c9b2a7d8e4f100';
    let validToken;

    beforeAll(() => {
        validToken = jwt.sign({ id: mockUserId, email: 'student@example.com' }, JWT_SECRET, { expiresIn: '1h' });
    });

    beforeEach(() => {
        resetRateLimits();
        aiService.resetClient();
    });

    afterAll(() => {
        aiService.resetClient();
        resetRateLimits();
    });

    describe('Test A: Successful Generation', () => {
        test('POST /api/ai/generate-description generates description when OpenAI returns content', async () => {
            // Mock OpenAI client
            const mockClient = {
                chat: {
                    completions: {
                        create: jest.fn().mockResolvedValue({
                            choices: [
                                {
                                    message: {
                                        content: 'Complete the database normalization, ER diagrams, and SQL queries according to assignment rubrics.'
                                    }
                                }
                            ]
                        })
                    }
                }
            };
            aiService.setClient(mockClient);

            // Temporarily set a real-looking key for this test
            const originalKey = process.env.OPENAI_API_KEY;
            process.env.OPENAI_API_KEY = 'sk-proj-test123456789abcdefghijklmnopqrstuvwxyz';

            const response = await request(app)
                .post('/api/ai/generate-description')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: 'Complete the database assignment' });

            process.env.OPENAI_API_KEY = originalKey;

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('description');
            expect(response.body.description).toContain('database');
            expect(response.body.fallback).toBe(false);
            expect(response.body.message).toBe('AI description generated successfully.');
            // Ensure no API key or internal raw credentials are in the response
            expect(JSON.stringify(response.body)).not.toContain('sk-');
        });
    });

    describe('Test B: Missing or Malformed Title (HTTP 400)', () => {
        test('returns 400 Bad Request when title is empty string', async () => {
            const response = await request(app)
                .post('/api/ai/generate-description')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: '' });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/title is required/i);
        });

        test('returns 400 Bad Request when title contains only whitespace', async () => {
            const response = await request(app)
                .post('/api/ai/generate-description')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: '     ' });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('returns 400 Bad Request when title exceeds 200 characters', async () => {
            const longTitle = 'A'.repeat(201);
            const response = await request(app)
                .post('/api/ai/generate-description')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: longTitle });

            expect(response.statusCode).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/too long/i);
        });
    });

    describe('Test C: Missing Authentication (HTTP 401)', () => {
        test('rejects request without Authorization header', async () => {
            const response = await request(app)
                .post('/api/ai/generate-description')
                .send({ title: 'A valid task title' });

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(/access denied/i);
        });

        test('rejects request with invalid Authorization Bearer token', async () => {
            const response = await request(app)
                .post('/api/ai/generate-description')
                .set('Authorization', 'Bearer invalid_signature_token')
                .send({ title: 'A valid task title' });

            expect(response.statusCode).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('Test D: Missing or Invalid API Key (Graceful Degradation)', () => {
        test('returns 503 fallback when OPENAI_API_KEY is placeholder or unset', async () => {
            const originalKey = process.env.OPENAI_API_KEY;
            process.env.OPENAI_API_KEY = 'your_actual_api_key';

            const response = await request(app)
                .post('/api/ai/generate-description')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: 'Task with unconfigured AI' });

            process.env.OPENAI_API_KEY = originalKey;

            expect(response.statusCode).toBe(503);
            expect(response.body.fallback).toBe(true);
            expect(response.body.description).toBe('');
            expect(response.body.message).toMatch(/temporarily unavailable/i);
        });
    });

    describe('Test E: Rate Limiting (HTTP 429)', () => {
        test('permits first request and blocks second request for same task within 60 seconds', async () => {
            const mockClient = {
                chat: {
                    completions: {
                        create: jest.fn().mockResolvedValue({
                            choices: [{ message: { content: 'Task description 1' } }]
                        })
                    }
                }
            };
            aiService.setClient(mockClient);

            const originalKey = process.env.OPENAI_API_KEY;
            process.env.OPENAI_API_KEY = 'sk-proj-test123456789abcdef';

            const taskTitle = 'Implement Rate Limiting Feature';

            // First request: should succeed (HTTP 200)
            const res1 = await request(app)
                .post('/api/ai/generate-description')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: taskTitle });

            expect(res1.statusCode).toBe(200);

            // Second request for SAME user & task immediately after: should be rate limited (HTTP 429)
            const res2 = await request(app)
                .post('/api/ai/generate-description')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: taskTitle });

            process.env.OPENAI_API_KEY = originalKey;

            expect(res2.statusCode).toBe(429);
            expect(res2.body.success).toBe(false);
            expect(res2.body.message).toMatch(/Rate limit exceeded/i);
            expect(res2.body).toHaveProperty('retryAfter');
            expect(res2.headers['retry-after']).toBeDefined();
        });

        test('allows request for a DIFFERENT task title without triggering rate limit', async () => {
            const mockClient = {
                chat: {
                    completions: {
                        create: jest.fn().mockResolvedValue({
                            choices: [{ message: { content: 'Different task description' } }]
                        })
                    }
                }
            };
            aiService.setClient(mockClient);

            const originalKey = process.env.OPENAI_API_KEY;
            process.env.OPENAI_API_KEY = 'sk-proj-test123456789abcdef';

            const res1 = await request(app)
                .post('/api/ai/generate-description')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: 'First Distinct Task' });
            expect(res1.statusCode).toBe(200);

            const res2 = await request(app)
                .post('/api/ai/generate-description')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: 'Second Distinct Task' });
            expect(res2.statusCode).toBe(200);

            process.env.OPENAI_API_KEY = originalKey;
        });
    });

    describe('Test F: Timeout or Provider Service Failure', () => {
        test('gracefully degrades on OpenAI timeout without crashing server', async () => {
            const timeoutError = new Error('Connection timeout');
            timeoutError.name = 'APIConnectionTimeoutError';

            const mockClient = {
                chat: {
                    completions: {
                        create: jest.fn().mockRejectedValue(timeoutError)
                    }
                }
            };
            aiService.setClient(mockClient);

            const originalKey = process.env.OPENAI_API_KEY;
            process.env.OPENAI_API_KEY = 'sk-proj-test123456789abcdef';

            const response = await request(app)
                .post('/api/ai/generate-description')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: 'Task experiencing timeout' });

            process.env.OPENAI_API_KEY = originalKey;

            expect(response.statusCode).toBe(504);
            expect(response.body.fallback).toBe(true);
            expect(response.body.description).toBe('');
            expect(response.body.message).toMatch(/temporarily unavailable/i);
        });

        test('gracefully degrades on OpenAI 500 internal error', async () => {
            const serverError = new Error('OpenAI service is down');
            serverError.status = 500;

            const mockClient = {
                chat: {
                    completions: {
                        create: jest.fn().mockRejectedValue(serverError)
                    }
                }
            };
            aiService.setClient(mockClient);

            const originalKey = process.env.OPENAI_API_KEY;
            process.env.OPENAI_API_KEY = 'sk-proj-test123456789abcdef';

            const response = await request(app)
                .post('/api/ai/generate-description')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ title: 'Task with upstream failure' });

            process.env.OPENAI_API_KEY = originalKey;

            expect(response.statusCode).toBe(503);
            expect(response.body.fallback).toBe(true);
            expect(response.body.message).toMatch(/temporarily unavailable/i);
        });
    });

    describe('AI Public Metadata & Health Endpoints', () => {
        test('GET /api/ai/status returns provider metadata without secret keys', async () => {
            const response = await request(app).get('/api/ai/status');

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('service', 'OpenAI Task Generator');
            expect(response.body).toHaveProperty('configured');
            expect(response.body).toHaveProperty('model');
            expect(response.body).toHaveProperty('rateLimit');
            expect(JSON.stringify(response.body)).not.toContain('sk-');
        });

        test('GET /api/health includes ai configuration status', async () => {
            const response = await request(app).get('/api/health');

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('ai');
            expect(response.body.ai).toHaveProperty('configured');
            expect(response.body.ai).toHaveProperty('model');
        });
    });
});
