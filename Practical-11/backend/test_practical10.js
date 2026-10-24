/**
 * test_practical10.js
 * Comprehensive integration testing script for Practical 10:
 * Asynchronous Processing with Event-Driven Architecture.
 */

require('dotenv').config();
const http = require('http');

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://localhost:${PORT}`;

// Helper: HTTP request wrapper
function request(method, path, body = null, token = null) {
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

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                let parsed = null;
                try {
                    parsed = JSON.parse(data);
                } catch {
                    parsed = data;
                }
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
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

async function runTests() {
    console.log('================================================================');
    console.log('  PRACTICAL 10: EVENT-DRIVEN ARCHITECTURE TEST SUITE');
    console.log('================================================================\n');

    let passed = 0;
    let failed = 0;

    function assert(condition, message) {
        if (condition) {
            console.log(`  [PASS] ${message}`);
            passed++;
        } else {
            console.error(`  [FAIL] ${message}`);
            failed++;
        }
    }

    try {
        // Step 0: Health Check
        console.log('--- Step 0: Checking API Health ---');
        const healthRes = await request('GET', '/api/health');
        assert(healthRes.status === 200, `Health check returned 200 OK (got ${healthRes.status})`);
        assert(healthRes.body.events && healthRes.body.events.system === 'Node.js EventEmitter', 'Health check confirms Node.js EventEmitter active');

        // Setup User Accounts for Auth & Isolation tests
        console.log('\n--- Setup: Registering & Authenticating Users ---');
        const user1Email = `p10_user1_${Date.now()}@example.com`;
        const user2Email = `p10_user2_${Date.now()}@example.com`;
        const password = 'Password123!';

        const reg1 = await request('POST', '/api/auth/register', { email: user1Email, password });
        assert(reg1.status === 201, `Registered user 1: ${user1Email}`);
        const login1 = await request('POST', '/api/auth/login', { email: user1Email, password });
        assert(login1.status === 200, `Logged in user 1`);
        const token1 = login1.body.token;
        const user1Id = login1.body.user.id;

        const reg2 = await request('POST', '/api/auth/register', { email: user2Email, password });
        assert(reg2.status === 201, `Registered user 2: ${user2Email}`);
        const login2 = await request('POST', '/api/auth/login', { email: user2Email, password });
        assert(login2.status === 200, `Logged in user 2`);
        const token2 = login2.body.token;

        // Test A: Create Task (POST /api/tasks) - Async Event-driven
        console.log('\n--- Test A: Create Task with Asynchronous Event Processing ---');
        const createStart = Date.now();
        const createRes = await request('POST', '/api/tasks', {
            title: 'Complete Practical 10',
            description: 'Test asynchronous event processing with Node.js EventEmitter',
            priority: 'high'
        }, token1);
        const createDuration = Date.now() - createStart;

        assert(createRes.status === 201, `HTTP 201 Created received (got ${createRes.status})`);
        assert(createRes.body.success === true, 'Response contains success: true');
        assert(createRes.body.data && createRes.body.data.title === 'Complete Practical 10', 'Task data returned in response');
        assert(createDuration < 1000, `API responded immediately in ${createDuration}ms (< 1000ms), NOT blocking for 2000ms notification delay`);

        const createdTaskId = createRes.body.data._id;

        // Test B: Delete Task (DELETE /api/tasks/:id) - Async Event-driven
        console.log('\n--- Test B: Delete Task with Supplementary task-deleted Event ---');
        const deleteStart = Date.now();
        const deleteRes = await request('DELETE', `/api/tasks/${createdTaskId}`, null, token1);
        const deleteDuration = Date.now() - deleteStart;

        assert(deleteRes.status === 200, `HTTP 200 OK received on task deletion (got ${deleteRes.status})`);
        assert(deleteRes.body.success === true, 'Deletion returned success: true');
        assert(deleteDuration < 500, `Task deleted and API responded in ${deleteDuration}ms without blocking`);

        // Test C: Verify Failure Scenarios
        console.log('\n--- Test C: Failure Scenarios & Edge Cases ---');

        // C.1: Missing required field (title)
        const missingTitleRes = await request('POST', '/api/tasks', {
            description: 'No title task'
        }, token1);
        assert(missingTitleRes.status === 400, `Missing title rejected with HTTP 400 (got ${missingTitleRes.status})`);

        // C.2: Request without JWT token
        const noTokenRes = await request('POST', '/api/tasks', {
            title: 'Unauthorized Task'
        });
        assert(noTokenRes.status === 401, `Unauthenticated request rejected with HTTP 401 (got ${noTokenRes.status})`);

        // C.3: Delete non-existent task
        const nonExistentId = '660000000000000000000000';
        const deleteNonExistentRes = await request('DELETE', `/api/tasks/${nonExistentId}`, null, token1);
        assert(deleteNonExistentRes.status === 404, `Deleting non-existent task returned HTTP 404 (got ${deleteNonExistentRes.status})`);

        // C.4: Delete another user's task (Cross-tenant ownership check)
        const user2TaskRes = await request('POST', '/api/tasks', {
            title: 'User 2 Secret Task',
            description: 'Private'
        }, token2);
        const user2TaskId = user2TaskRes.body.data._id;

        const crossUserDeleteRes = await request('DELETE', `/api/tasks/${user2TaskId}`, null, token1);
        assert(crossUserDeleteRes.status === 404, `User 1 cannot delete User 2's task (returned HTTP 404)`);

        // C.5: Notification Handler Error Simulation
        console.log('\n--- Test C.5: Notification Handler Error Handling Simulation ---');
        const errorSimRes = await request('POST', '/api/tasks', {
            title: 'TRIGGER_NOTIFICATION_ERROR',
            description: 'Trigger intentional background listener error to verify server resilience'
        }, token1);
        assert(errorSimRes.status === 201, `API still responds HTTP 201 to client despite background failure (got ${errorSimRes.status})`);
        assert(errorSimRes.body.success === true, 'Task creation confirmed in DB despite background notification failure');

        // Allow background timers to finish
        console.log('\nWaiting 2.5s for background notification timers to settle...');
        await sleep(2500);

        // Verify task still exists in DB
        const getSimTask = await request('GET', `/api/tasks/${errorSimRes.body.data._id}`, null, token1);
        assert(getSimTask.status === 200, 'Task persisted in database even though notification handler failed');

        // Test D: Cache Invalidation Check
        console.log('\n--- Test D: Cache Invalidation Preserved ---');
        // Fetch tasks -> cache miss -> sets cache
        const list1 = await request('GET', '/api/tasks', null, token1);
        assert(list1.headers['x-cache'] === 'MISS', `First fetch: X-Cache: MISS (count: ${list1.body.count})`);

        // Fetch tasks again -> cache hit
        const list2 = await request('GET', '/api/tasks', null, token1);
        assert(list2.headers['x-cache'] === 'HIT', 'Second fetch: X-Cache: HIT');

        // Create new task -> should invalidate cache
        await request('POST', '/api/tasks', { title: 'Cache Invalidation Probe' }, token1);

        // Fetch again -> should be MISS because cache was invalidated
        const list3 = await request('GET', '/api/tasks', null, token1);
        assert(list3.headers['x-cache'] === 'MISS', 'Fetch after creation: X-Cache: MISS (Cache was correctly invalidated!)');

        console.log('\n================================================================');
        console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
        console.log('================================================================\n');

        if (failed > 0) {
            process.exit(1);
        }
    } catch (err) {
        console.error('Fatal error during test run:', err);
        process.exit(1);
    }
}

// Allow standalone execution
if (require.main === module) {
    runTests();
}

module.exports = { runTests };
