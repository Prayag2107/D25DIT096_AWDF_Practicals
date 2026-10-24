/**
 * benchmark_sync_vs_async.js
 * Practical 10 - Step 10: Compare Synchronous vs Event-Driven Asynchronous Processing
 * Measures actual HTTP response times for Approach A (Synchronous Blocking) vs Approach B (Event-Driven Asynchronous).
 */

require('dotenv').config();
const http = require('http');

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}`;

// High-precision HTTP request wrapper measuring wall-clock latency
function timedRequest(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const postData = body ? JSON.stringify(body) : null;

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const start = process.hrtime.bigint();

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                const end = process.hrtime.bigint();
                const durationMs = Number(end - start) / 1e6; // Convert nanoseconds to milliseconds

                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                resolve({
                    status: res.statusCode,
                    durationMs: parseFloat(durationMs.toFixed(2)),
                    body: parsed
                });
            });
        });

        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runBenchmark() {
    console.log('========================================================================');
    console.log('  PRACTICAL 10 BENCHMARK: SYNCHRONOUS VS EVENT-DRIVEN ASYNCHRONOUS');
    console.log('========================================================================\n');

    // 1. Authenticate a test user
    const email = `benchmark_user_${Date.now()}@example.com`;
    const password = 'Password123!';
    await timedRequest('POST', '/api/auth/register', { email, password });
    const loginRes = await timedRequest('POST', '/api/auth/login', { email, password });
    const token = loginRes.body.token;

    console.log(`Authenticated test user: ${email}\n`);

    const RUNS = 3;
    const syncTimes = [];
    const asyncTimes = [];

    // --- Approach A: Synchronous Request Handling ---
    console.log('------------------------------------------------------------------------');
    console.log('  Approach A: Synchronous Request Handling (Blocks for Notification)');
    console.log('------------------------------------------------------------------------');
    for (let i = 1; i <= RUNS; i++) {
        process.stdout.write(`  Run ${i}... `);
        const res = await timedRequest('POST', '/api/tasks/sync-demo', {
            title: `Sync Task Run ${i}`,
            description: 'Synchronous blocking test run',
            priority: 'medium'
        }, token);

        syncTimes.push(res.durationMs);
        console.log(`Response time: ${res.durationMs.toFixed(2)} ms (Status: ${res.status})`);
        await sleep(300); // brief pause between requests
    }

    console.log('\n------------------------------------------------------------------------');
    console.log('  Approach B: Event-Driven Asynchronous (Non-Blocking HTTP Response)');
    console.log('------------------------------------------------------------------------');
    for (let i = 1; i <= RUNS; i++) {
        process.stdout.write(`  Run ${i}... `);
        const res = await timedRequest('POST', '/api/tasks', {
            title: `Async Event Task Run ${i}`,
            description: 'Asynchronous event-driven test run',
            priority: 'medium'
        }, token);

        asyncTimes.push(res.durationMs);
        console.log(`Response time: ${res.durationMs.toFixed(2)} ms (Status: ${res.status})`);
        await sleep(300);
    }

    // Wait for trailing background notification handlers to finish cleanly
    console.log('\nAllowing trailing background notification handlers to finish (~2.5s)...');
    await sleep(2500);

    // Calculate averages and reduction
    const syncAvg = syncTimes.reduce((a, b) => a + b, 0) / RUNS;
    const asyncAvg = asyncTimes.reduce((a, b) => a + b, 0) / RUNS;
    const percentageReduction = ((syncAvg - asyncAvg) / syncAvg) * 100;

    console.log('\n========================================================================');
    console.log('  FINAL PERFORMANCE COMPARISON TABLE');
    console.log('========================================================================\n');

    console.log('| Test | Synchronous Time (ms) | Event-Driven Time (ms) | Speedup Factor |');
    console.log('| :--- | :-------------------: | :--------------------: | :------------: |');
    for (let i = 0; i < RUNS; i++) {
        const speedup = (syncTimes[i] / asyncTimes[i]).toFixed(1);
        console.log(`| Test ${i + 1} | ${syncTimes[i].toFixed(2)} ms | ${asyncTimes[i].toFixed(2)} ms | ${speedup}x faster |`);
    }
    console.log('| :--- | :--- | :--- | :--- |');
    console.log(`| **Average** | **${syncAvg.toFixed(2)} ms** | **${asyncAvg.toFixed(2)} ms** | **${(syncAvg / asyncAvg).toFixed(1)}x faster** |`);
    console.log(`\n  Percentage Latency Reduction: ${percentageReduction.toFixed(2)}%\n`);
    console.log('========================================================================\n');

    return {
        syncTimes,
        asyncTimes,
        syncAvg: parseFloat(syncAvg.toFixed(2)),
        asyncAvg: parseFloat(asyncAvg.toFixed(2)),
        percentageReduction: parseFloat(percentageReduction.toFixed(2))
    };
}

if (require.main === module) {
    runBenchmark().catch(err => {
        console.error('Benchmark failed:', err);
        process.exit(1);
    });
}

module.exports = { runBenchmark };
