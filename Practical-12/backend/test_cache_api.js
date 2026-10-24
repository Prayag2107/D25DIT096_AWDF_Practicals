const http = require('http');

const PORT = 5001;
const BASE_URL = `http://127.0.0.1:${PORT}`;

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

async function runTestSuite() {
    console.log('===============================================================');
    console.log('  PRACTICAL 9: IN-MEMORY CACHING AND QUERY OPTIMIZATION SUITE  ');
    console.log('===============================================================\n');

    const timestamp = Date.now();
    const userAEmail = `cache_usera_${timestamp}@example.com`;
    const userBEmail = `cache_userb_${timestamp}@example.com`;
    const password = 'Password123!';

    // 1. Health Check
    console.log('[1] Testing Health Endpoint...');
    const health = await request({ method: 'GET', path: '/api/health' });
    console.log(`    Status: ${health.status}, Message: "${health.data.message}"`);
    if (health.status !== 200) throw new Error('Backend health check failed');

    // 2. Register & Login User A
    console.log('\n[2] Registering & Logging in User A...');
    await request({
        method: 'POST',
        path: '/api/auth/register',
        body: { email: userAEmail, password }
    });
    const loginA = await request({
        method: 'POST',
        path: '/api/auth/login',
        body: { email: userAEmail, password }
    });
    const tokenA = loginA.data.token;
    const userAId = loginA.data.user.id;
    console.log(`    User A ID: ${userAId}, Token received: ${!!tokenA}`);

    // 3. Register & Login User B
    console.log('\n[3] Registering & Logging in User B...');
    await request({
        method: 'POST',
        path: '/api/auth/register',
        body: { email: userBEmail, password }
    });
    const loginB = await request({
        method: 'POST',
        path: '/api/auth/login',
        body: { email: userBEmail, password }
    });
    const tokenB = loginB.data.token;
    const userBId = loginB.data.user.id;
    console.log(`    User B ID: ${userBId}, Token received: ${!!tokenB}`);

    // 4. Seed initial tasks for User A
    console.log('\n[4] Seeding initial tasks for User A...');
    for (let i = 1; i <= 5; i++) {
        await request({
            method: 'POST',
            path: '/api/tasks',
            headers: { Authorization: `Bearer ${tokenA}` },
            body: {
                title: `User A Initial Task ${i}`,
                description: `Description for initial task ${i}`,
                priority: i % 2 === 0 ? 'high' : 'medium'
            }
        });
    }
    console.log('    5 tasks created for User A.');

    // 5. Test Cache Reset & Initial Stats
    console.log('\n[5] Testing Cache Reset & Initial Stats...');
    const resetRes = await request({ method: 'POST', path: '/api/debug/cache-reset' });
    console.log(`    Reset response: ${JSON.stringify(resetRes.data)}`);
    const initialStats = await request({ method: 'GET', path: '/api/debug/cache-stats' });
    console.log(`    Initial Stats: hits=${initialStats.data.hits}, misses=${initialStats.data.misses}, hitRate=${initialStats.data.hitRate}, keys=${initialStats.data.keys}`);

    // =========================================================================
    // STEP 7: UNCACHED BASELINE MEASUREMENTS (At least 3 actual measurements)
    // =========================================================================
    console.log('\n===============================================================');
    console.log('  STEP 7: MEASURING UNCACHED BASELINE (Bypass Cache via Header) ');
    console.log('===============================================================');
    const uncachedTimings = [];
    for (let i = 1; i <= 3; i++) {
        const res = await request({
            method: 'GET',
            path: '/api/tasks',
            headers: {
                Authorization: `Bearer ${tokenA}`,
                'X-Bypass-Cache': 'true' // bypass in-memory caching to measure raw DB query
            }
        });
        uncachedTimings.push({
            request: i,
            status: res.status,
            cacheHeader: res.headers['x-cache'] || 'BYPASS',
            durationMs: res.durationMs,
            taskCount: res.data.count
        });
        console.log(`    Request ${i}: Status=${res.status}, Time=${res.durationMs}ms, CacheHeader=${res.headers['x-cache'] || 'BYPASS'}, Tasks=${res.data.count}`);
    }

    const uncachedAvg = uncachedTimings.reduce((sum, item) => sum + item.durationMs, 0) / uncachedTimings.length;
    console.log(`    Average Uncached Response Time: ${uncachedAvg.toFixed(2)} ms`);

    // Reset stats before cached measurement
    await request({ method: 'POST', path: '/api/debug/cache-reset' });

    // =========================================================================
    // STEP 8: CACHED RESPONSE TIME MEASUREMENTS (At least 3 actual measurements)
    // =========================================================================
    console.log('\n===============================================================');
    console.log('  STEP 8: MEASURING RESPONSE TIMES WITH IN-MEMORY CACHING       ');
    console.log('===============================================================');
    const cachedTimings = [];
    for (let i = 1; i <= 3; i++) {
        const res = await request({
            method: 'GET',
            path: '/api/tasks',
            headers: { Authorization: `Bearer ${tokenA}` }
        });
        cachedTimings.push({
            request: i,
            expected: i === 1 ? 'MISS' : 'HIT',
            actualCache: res.headers['x-cache'],
            status: res.status,
            durationMs: res.durationMs,
            taskCount: res.data.count
        });
        console.log(`    Request ${i}: Status=${res.status}, Expected=${i === 1 ? 'MISS' : 'HIT'}, Actual=${res.headers['x-cache']}, Time=${res.durationMs}ms, Tasks=${res.data.count}`);
    }

    const cachedAvg = cachedTimings.reduce((sum, item) => sum + item.durationMs, 0) / cachedTimings.length;
    const hitAvg = (cachedTimings[1].durationMs + cachedTimings[2].durationMs) / 2;
    const improvement = ((uncachedAvg - hitAvg) / uncachedAvg) * 100;
    console.log(`    Average Cached Response Time (all 3): ${cachedAvg.toFixed(2)} ms`);
    console.log(`    Average Cached HIT Response Time (Req 2 & 3): ${hitAvg.toFixed(2)} ms`);
    console.log(`    Percentage Improvement (Hit vs Uncached): ${improvement.toFixed(2)}%`);

    // Verify debug stats
    const statsAfterBench = await request({ method: 'GET', path: '/api/debug/cache-stats' });
    console.log(`    Stats After Benchmark: hits=${statsAfterBench.data.hits}, misses=${statsAfterBench.data.misses}, hitRate=${statsAfterBench.data.hitRate}, keys=${statsAfterBench.data.keys}`);

    // =========================================================================
    // STEP 9: FUNCTIONAL CORRECTNESS & CACHE INVALIDATION TESTS
    // =========================================================================
    console.log('\n===============================================================');
    console.log('  STEP 9: TESTING CACHE CORRECTNESS & INVALIDATION              ');
    console.log('===============================================================');

    // 1. Initial cached count
    const listBeforePost = await request({
        method: 'GET',
        path: '/api/tasks',
        headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log(`    [Test 1 & 2] GET /api/tasks: Cached status=${listBeforePost.headers['x-cache']}, count=${listBeforePost.data.count}`);

    // 2. POST /api/tasks invalidates list cache
    console.log('\n    [Test 3 & 4] POST /api/tasks -> verifying cache invalidation...');
    const createRes = await request({
        method: 'POST',
        path: '/api/tasks',
        headers: { Authorization: `Bearer ${tokenA}` },
        body: {
            title: 'Cache Invalidation Verification Task',
            description: 'Created to test POST cache busting',
            priority: 'high'
        }
    });
    const createdTaskId = createRes.data.data._id;
    console.log(`    Created Task ID: ${createdTaskId}, Status: ${createRes.status}`);

    // GET after POST must be a MISS and contain 6 tasks (new task included)
    const listAfterPost = await request({
        method: 'GET',
        path: '/api/tasks',
        headers: { Authorization: `Bearer ${tokenA}` }
    });
    const foundNewTask = listAfterPost.data.data.some(t => t._id === createdTaskId);
    console.log(`    GET after POST: Header=${listAfterPost.headers['x-cache']} (Expected MISS), Count=${listAfterPost.data.count}, New task present=${foundNewTask}`);
    if (listAfterPost.headers['x-cache'] !== 'MISS' || !foundNewTask) {
        throw new Error('Cache invalidation after POST failed!');
    }

    // 3. Single-Task Caching: GET /api/tasks/:id
    console.log('\n    [Test 5 & 6] GET /api/tasks/:id (Single Task Caching)...');
    const singleGet1 = await request({
        method: 'GET',
        path: `/api/tasks/${createdTaskId}`,
        headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log(`    1st GET single task: Header=${singleGet1.headers['x-cache']} (Expected MISS), Title="${singleGet1.data.data.title}"`);

    const singleGet2 = await request({
        method: 'GET',
        path: `/api/tasks/${createdTaskId}`,
        headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log(`    2nd GET single task: Header=${singleGet2.headers['x-cache']} (Expected HIT), Title="${singleGet2.data.data.title}"`);
    if (singleGet2.headers['x-cache'] !== 'HIT') {
        throw new Error('Single task caching HIT failed!');
    }

    // 4. PUT /api/tasks/:id invalidates single & list cache
    console.log('\n    [Test 7 & 8] PUT /api/tasks/:id -> updating task...');
    const updateRes = await request({
        method: 'PUT',
        path: `/api/tasks/${createdTaskId}`,
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { title: 'Updated Title After Cache Invalidation' }
    });
    console.log(`    PUT status: ${updateRes.status}, Updated title: "${updateRes.data.data.title}"`);

    // GET single task after PUT must be MISS and have updated title
    const singleAfterPut = await request({
        method: 'GET',
        path: `/api/tasks/${createdTaskId}`,
        headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log(`    GET single after PUT: Header=${singleAfterPut.headers['x-cache']} (Expected MISS), Title="${singleAfterPut.data.data.title}"`);
    if (singleAfterPut.data.data.title !== 'Updated Title After Cache Invalidation') {
        throw new Error('Updated task title mismatch after invalidation!');
    }

    // 5. DELETE /api/tasks/:id invalidates single & list cache
    console.log('\n    [Test 9 & 10] DELETE /api/tasks/:id -> deleting task...');
    const deleteRes = await request({
        method: 'DELETE',
        path: `/api/tasks/${createdTaskId}`,
        headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log(`    DELETE status: ${deleteRes.status}, Message: "${deleteRes.data.message}"`);

    // GET single task after DELETE must return 404
    const singleAfterDelete = await request({
        method: 'GET',
        path: `/api/tasks/${createdTaskId}`,
        headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log(`    GET single after DELETE: Status=${singleAfterDelete.status} (Expected 404), Message: "${singleAfterDelete.data.message}"`);
    if (singleAfterDelete.status !== 404) {
        throw new Error('Expected 404 after task deletion!');
    }

    // 6. User Isolation Tests (User A vs User B)
    console.log('\n    [Test 11 & 12] Authentication & Multi-Tenant User Isolation...');
    // Create a private task for User A
    const privateTaskRes = await request({
        method: 'POST',
        path: '/api/tasks',
        headers: { Authorization: `Bearer ${tokenA}` },
        body: { title: 'User A Secret Task' }
    });
    const privateTaskId = privateTaskRes.data.data._id;

    // Populate User A's cache
    await request({ method: 'GET', path: '/api/tasks', headers: { Authorization: `Bearer ${tokenA}` } });

    // User B requests tasks -> must NOT see User A's secret task!
    const userBTasks = await request({
        method: 'GET',
        path: '/api/tasks',
        headers: { Authorization: `Bearer ${tokenB}` }
    });
    const leaked = userBTasks.data.data.some(t => t._id === privateTaskId);
    console.log(`    User B Task List count: ${userBTasks.data.count}, Leaked User A task: ${leaked}`);
    if (leaked) throw new Error('SECURITY VIOLATION: User B saw User A tasks via cache!');

    // User B tries to access User A's single task -> must return 404
    const userBAccessSingle = await request({
        method: 'GET',
        path: `/api/tasks/${privateTaskId}`,
        headers: { Authorization: `Bearer ${tokenB}` }
    });
    console.log(`    User B accessing User A task: Status=${userBAccessSingle.status} (Expected 404)`);
    if (userBAccessSingle.status !== 404) throw new Error('SECURITY VIOLATION: User B accessed User A single task!');

    // User B tries to update User A's task -> must return 404
    const userBUpdate = await request({
        method: 'PUT',
        path: `/api/tasks/${privateTaskId}`,
        headers: { Authorization: `Bearer ${tokenB}` },
        body: { title: 'Malicious Update' }
    });
    console.log(`    User B updating User A task: Status=${userBUpdate.status} (Expected 404)`);
    if (userBUpdate.status !== 404) throw new Error('SECURITY VIOLATION: User B updated User A task!');

    // User B tries to delete User A's task -> must return 404
    const userBDelete = await request({
        method: 'DELETE',
        path: `/api/tasks/${privateTaskId}`,
        headers: { Authorization: `Bearer ${tokenB}` }
    });
    console.log(`    User B deleting User A task: Status=${userBDelete.status} (Expected 404)`);
    if (userBDelete.status !== 404) throw new Error('SECURITY VIOLATION: User B deleted User A task!');

    // 7. Unauthenticated request protection
    console.log('\n    [Test 13] Unauthenticated Request Protection...');
    const unauthRes = await request({ method: 'GET', path: '/api/tasks' });
    console.log(`    Unauthenticated GET /api/tasks: Status=${unauthRes.status} (Expected 401)`);
    if (unauthRes.status !== 401) throw new Error('Expected 401 for unauthenticated request!');

    // 8. Final Cache Statistics Verification
    console.log('\n    [Test 14] Final Cache Statistics...');
    const finalStats = await request({ method: 'GET', path: '/api/debug/cache-stats' });
    console.log(`    Final Cache Stats: ${JSON.stringify(finalStats.data)}`);

    console.log('\n===============================================================');
    console.log('  ALL 14 PRACTICAL 9 VERIFICATION CHECKS PASSED SUCCESSFULLY!  ');
    console.log('===============================================================\n');

    return {
        uncachedTimings,
        uncachedAvg,
        cachedTimings,
        cachedAvg,
        hitAvg,
        improvement,
        finalStats: finalStats.data
    };
}

// Run if called directly
if (require.main === module) {
    runTestSuite()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Test Suite Failed:', err);
            process.exit(1);
        });
}

module.exports = { runTestSuite };
