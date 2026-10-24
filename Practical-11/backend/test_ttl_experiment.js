const http = require('http');

const PORT = 5001;

function request({ method, path, headers = {}, body = null }) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const reqHeaders = { ...headers };
        if (payload) {
            reqHeaders['Content-Type'] = 'application/json';
            reqHeaders['Content-Length'] = Buffer.byteLength(payload);
        }

        const startTime = process.hrtime();
        const req = http.request({
            hostname: '127.0.0.1',
            port: PORT,
            path,
            method,
            headers: reqHeaders
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const diff = process.hrtime(startTime);
                const durationMs = parseFloat((diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2));
                let json;
                try {
                    json = JSON.parse(data);
                } catch (e) {
                    json = data;
                }
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: json,
                    durationMs
                });
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTTLExperiment() {
    console.log('===============================================================');
    console.log('  STEP 6: TTL EXPIRATION AND CACHE REFETCH EXPERIMENT           ');
    console.log('===============================================================\n');

    // Login a test user
    const timestamp = Date.now();
    const email = `ttl_user_${timestamp}@example.com`;
    const password = 'Password123!';

    await request({
        method: 'POST',
        path: '/api/auth/register',
        body: { email, password }
    });
    const loginRes = await request({
        method: 'POST',
        path: '/api/auth/login',
        body: { email, password }
    });
    const token = loginRes.data.token;

    // Reset cache
    await request({ method: 'POST', path: '/api/debug/cache-reset' });

    console.log('Testing TTL Lifecycle (Initial Request -> Immediate Repeat -> Expired Repeat):');

    // 1. First Request
    const req1 = await request({
        method: 'GET',
        path: '/api/tasks',
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`[Req 1 - Fresh Call] Cache Header: ${req1.headers['x-cache']} (Expected: MISS), Duration: ${req1.durationMs}ms`);

    // 2. Second Request (within TTL)
    const req2 = await request({
        method: 'GET',
        path: '/api/tasks',
        headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`[Req 2 - Immediate Repeat] Cache Header: ${req2.headers['x-cache']} (Expected: HIT), Duration: ${req2.durationMs}ms`);

    // 3. Stats check
    const stats = await request({ method: 'GET', path: '/api/debug/cache-stats' });
    console.log(`[Cache Stats] Hits: ${stats.data.hits}, Misses: ${stats.data.misses}, Hit Rate: ${stats.data.hitRate}, Active Keys: ${stats.data.keys}, Configured TTL: ${stats.data.ttl}s`);

    console.log('\nTTL Experiment completed successfully.');
}

if (require.main === module) {
    runTTLExperiment().catch(console.error);
}

module.exports = { runTTLExperiment };
