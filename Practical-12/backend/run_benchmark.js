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

async function benchmark() {
    const timestamp = Date.now();
    const email = `bench_${timestamp}@example.com`;
    const password = 'Password123!';

    // Register & Login
    await request({ method: 'POST', path: '/api/auth/register', body: { email, password } });
    const login = await request({ method: 'POST', path: '/api/auth/login', body: { email, password } });
    const token = login.data.token;

    // Seed 15 realistic tasks
    for (let i = 1; i <= 15; i++) {
        await request({
            method: 'POST',
            path: '/api/tasks',
            headers: { Authorization: `Bearer ${token}` },
            body: {
                title: `Task item #${i}: Implement optimization pattern`,
                description: `Detailed description for benchmark task #${i} with priority and status.`,
                priority: i % 3 === 0 ? 'high' : (i % 2 === 0 ? 'medium' : 'low'),
                completed: i % 4 === 0
            }
        });
    }

    // Flush cache
    await request({ method: 'POST', path: '/api/debug/cache-reset' });

    console.log('--- UNCACHED RUNS (Bypassing cache to query MongoDB directly) ---');
    const uncached = [];
    for (let i = 1; i <= 3; i++) {
        const r = await request({
            method: 'GET',
            path: '/api/tasks',
            headers: { Authorization: `Bearer ${token}`, 'X-Bypass-Cache': 'true' }
        });
        uncached.push(r.durationMs);
        console.log(`Uncached Request ${i}: Status=${r.status}, Time=${r.durationMs} ms, Header=${r.headers['x-cache']}`);
    }
    const uncachedAvg = uncached.reduce((a, b) => a + b, 0) / uncached.length;
    console.log(`Uncached Average: ${uncachedAvg.toFixed(2)} ms`);

    // Reset stats for clean cached test
    await request({ method: 'POST', path: '/api/debug/cache-reset' });

    console.log('\n--- CACHED RUNS (In-memory node-cache) ---');
    const cached = [];
    for (let i = 1; i <= 3; i++) {
        const r = await request({
            method: 'GET',
            path: '/api/tasks',
            headers: { Authorization: `Bearer ${token}` }
        });
        cached.push({ time: r.durationMs, cacheHeader: r.headers['x-cache'], status: r.status });
        console.log(`Cached Request ${i}: Status=${r.status}, Time=${r.durationMs} ms, Header=${r.headers['x-cache']}`);
    }
    const cachedAvg = cached.reduce((a, b) => a + b.time, 0) / cached.length;
    const hitAvg = (cached[1].time + cached[2].time) / 2;
    const pctImprovement = ((uncachedAvg - hitAvg) / uncachedAvg) * 100;

    console.log(`Cached Overall Average: ${cachedAvg.toFixed(2)} ms`);
    console.log(`Cached HIT Average (Req 2 & 3): ${hitAvg.toFixed(2)} ms`);
    console.log(`Percentage Improvement: ${pctImprovement.toFixed(2)} %`);

    const stats = await request({ method: 'GET', path: '/api/debug/cache-stats' });
    console.log(`Cache Stats: ${JSON.stringify(stats.data)}`);
}

benchmark().catch(console.error);
