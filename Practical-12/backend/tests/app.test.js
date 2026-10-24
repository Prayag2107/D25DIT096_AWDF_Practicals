const request = require('supertest');
const app = require('../app');

describe('Practical 12 - Automated API Test Suite (CI/CD)', () => {
    describe('Public Health & Information Endpoints', () => {
        test('GET /api/health should return 200 OK and health status', async () => {
            const response = await request(app).get('/api/health');

            // Deliberately incorrect assertion for CI failure demonstration (Practical 12 Step 9)
            expect(response.statusCode).toBe(999);
            expect(response.headers['content-type']).toMatch(/json/);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('timestamp');
        });

        test('GET / should return 200 OK and API metadata', async () => {
            const response = await request(app).get('/');

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('endpoints');
            expect(response.body.endpoints).toHaveProperty('health', '/api/health');
        });
    });

    describe('Task API Authentication & Security', () => {
        test('GET /api/tasks rejects unauthenticated requests with 401 Unauthorized', async () => {
            const response = await request(app).get('/api/tasks');

            expect(response.statusCode).toBe(401);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/Access denied/i);
        });

        test('GET /api/tasks rejects malformed or invalid token with 401 Unauthorized', async () => {
            const response = await request(app)
                .get('/api/tasks')
                .set('Authorization', 'Bearer invalid_signature_token_abc123');

            expect(response.statusCode).toBe(401);
            expect(response.body).toHaveProperty('success', false);
            expect(response.body.message).toMatch(/Invalid or malformed token/i);
        });
    });

    describe('Route Handling & Error Middleware', () => {
        test('GET /api/unknown-route returns 404 Not Found', async () => {
            const response = await request(app).get('/api/unknown-endpoint-404');

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('success', false);
        });
    });
});
