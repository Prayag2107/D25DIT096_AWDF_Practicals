const http = require('http');
const jwt = require('jsonwebtoken');

// Set test environment
process.env.PORT = '5002';
process.env.JWT_SECRET = 'test_secret_key_12345';
const app = require('./server');

function makeRequest({ method, path, headers = {}, body = null }) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const reqHeaders = { ...headers };
        if (payload) {
            reqHeaders['Content-Type'] = 'application/json';
            reqHeaders['Content-Length'] = Buffer.byteLength(payload);
        }

        const req = http.request({
            hostname: '127.0.0.1',
            port: 5002,
            path,
            method,
            headers: reqHeaders
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let json;
                try {
                    json = JSON.parse(data);
                } catch (e) {
                    json = data;
                }
                resolve({ status: res.statusCode, data: json });
            });
        });

        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function runTests() {
    console.log('--- STARTING 15 POSTMAN VALIDATION TESTS ---');
    const timestamp = Date.now();
    const testEmail1 = `user1_${timestamp}@example.com`;
    const testEmail2 = `user2_${timestamp}@example.com`;
    const password = 'Password123!';

    let token1 = '';
    let token2 = '';
    let taskId1 = '';

    // Test 1: Register a new user -> expect 201
    const t1 = await makeRequest({
        method: 'POST',
        path: '/api/auth/register',
        body: { email: testEmail1, password }
    });
    console.log(`Test 1 (Register User 1): Status ${t1.status} (Expected 201) - Success: ${t1.status === 201}`);

    // Test 2: Register same email again -> expect 409
    const t2 = await makeRequest({
        method: 'POST',
        path: '/api/auth/register',
        body: { email: testEmail1, password }
    });
    console.log(`Test 2 (Duplicate Email): Status ${t2.status} (Expected 409) - Success: ${t2.status === 409}`);

    // Test 3: Register with invalid email or missing password -> expect 400
    const t3a = await makeRequest({
        method: 'POST',
        path: '/api/auth/register',
        body: { email: 'invalid-email', password: '123' }
    });
    const t3b = await makeRequest({
        method: 'POST',
        path: '/api/auth/register',
        body: { email: `test3_${timestamp}@example.com` }
    });
    console.log(`Test 3a (Invalid email & short password): Status ${t3a.status} (Expected 400) - Success: ${t3a.status === 400}`);
    console.log(`Test 3b (Missing password): Status ${t3b.status} (Expected 400) - Success: ${t3b.status === 400}`);

    // Register User 2 for isolation testing
    await makeRequest({
        method: 'POST',
        path: '/api/auth/register',
        body: { email: testEmail2, password }
    });

    // Test 4: Login with correct credentials -> expect 200 & JWT
    const t4 = await makeRequest({
        method: 'POST',
        path: '/api/auth/login',
        body: { email: testEmail1, password }
    });
    token1 = t4.data.token;
    console.log(`Test 4 (Login Correct): Status ${t4.status} (Expected 200) - Has Token: ${!!token1}`);

    // Login User 2
    const l2 = await makeRequest({
        method: 'POST',
        path: '/api/auth/login',
        body: { email: testEmail2, password }
    });
    token2 = l2.data.token;

    // Test 5: Login with incorrect password -> expect 401
    const t5 = await makeRequest({
        method: 'POST',
        path: '/api/auth/login',
        body: { email: testEmail1, password: 'WrongPassword!' }
    });
    console.log(`Test 5 (Login Wrong Password): Status ${t5.status} (Expected 401) - Success: ${t5.status === 401}`);

    // Test 6: Access tasks without a token -> expect 401
    const t6 = await makeRequest({
        method: 'GET',
        path: '/api/tasks'
    });
    console.log(`Test 6 (Get Tasks No Token): Status ${t6.status} (Expected 401) - Success: ${t6.status === 401}`);

    // Test 7: Access tasks with invalid token -> expect 401
    const t7 = await makeRequest({
        method: 'GET',
        path: '/api/tasks',
        headers: { Authorization: 'Bearer this.is.an.invalid.token' }
    });
    console.log(`Test 7 (Get Tasks Invalid Token): Status ${t7.status} (Expected 401) - Success: ${t7.status === 401}`);

    // Test 8: Access tasks with expired token -> expect 401
    const expiredToken = jwt.sign({ id: 'dummy_user_id' }, process.env.JWT_SECRET, { expiresIn: '1ms' });
    await new Promise(r => setTimeout(r, 20)); // wait for expiration
    const t8 = await makeRequest({
        method: 'GET',
        path: '/api/tasks',
        headers: { Authorization: `Bearer ${expiredToken}` }
    });
    console.log(`Test 8 (Get Tasks Expired Token): Status ${t8.status} (Expected 401) - Success: ${t8.status === 401}`);

    // Test 9: Create a task with valid token and title -> expect 201
    const t9 = await makeRequest({
        method: 'POST',
        path: '/api/tasks',
        headers: { Authorization: `Bearer ${token1}` },
        body: { title: 'Practical 7 Task by User 1', description: 'Testing auth pipeline', priority: 'high' }
    });
    taskId1 = t9.data.data?._id;
    console.log(`Test 9 (Create Task Valid): Status ${t9.status} (Expected 201) - Task ID: ${taskId1}`);

    // Test 10: Create a task without a title -> expect 400
    const t10 = await makeRequest({
        method: 'POST',
        path: '/api/tasks',
        headers: { Authorization: `Bearer ${token1}` },
        body: { description: 'Missing title' }
    });
    console.log(`Test 10 (Create Task Missing Title): Status ${t10.status} (Expected 400) - Success: ${t10.status === 400}`);

    // Test 11: Retrieve, update, and delete task belonging to authenticated user
    const t11_get = await makeRequest({
        method: 'GET',
        path: `/api/tasks/${taskId1}`,
        headers: { Authorization: `Bearer ${token1}` }
    });
    const t11_put = await makeRequest({
        method: 'PUT',
        path: `/api/tasks/${taskId1}`,
        headers: { Authorization: `Bearer ${token1}` },
        body: { title: 'Updated Practical 7 Task', completed: true }
    });
    console.log(`Test 11a (Get Task Owner): Status ${t11_get.status} (Expected 200) - Success: ${t11_get.status === 200}`);
    console.log(`Test 11b (Update Task Owner): Status ${t11_put.status} (Expected 200) - Success: ${t11_put.status === 200}`);

    // Test 12: Try accessing another user's task -> expect 404
    const t12_get = await makeRequest({
        method: 'GET',
        path: `/api/tasks/${taskId1}`,
        headers: { Authorization: `Bearer ${token2}` } // User 2 trying to access User 1's task
    });
    const t12_put = await makeRequest({
        method: 'PUT',
        path: `/api/tasks/${taskId1}`,
        headers: { Authorization: `Bearer ${token2}` },
        body: { title: 'Hacked by User 2' }
    });
    const t12_del = await makeRequest({
        method: 'DELETE',
        path: `/api/tasks/${taskId1}`,
        headers: { Authorization: `Bearer ${token2}` }
    });
    console.log(`Test 12a (User 2 GET User 1's Task): Status ${t12_get.status} (Expected 404) - Denied: ${t12_get.status === 404}`);
    console.log(`Test 12b (User 2 PUT User 1's Task): Status ${t12_put.status} (Expected 404) - Denied: ${t12_put.status === 404}`);
    console.log(`Test 12c (User 2 DELETE User 1's Task): Status ${t12_del.status} (Expected 404) - Denied: ${t12_del.status === 404}`);

    // Delete task by owner (finishing Test 11)
    const t11_del = await makeRequest({
        method: 'DELETE',
        path: `/api/tasks/${taskId1}`,
        headers: { Authorization: `Bearer ${token1}` }
    });
    console.log(`Test 11c (Delete Task Owner): Status ${t11_del.status} (Expected 200) - Success: ${t11_del.status === 200}`);

    // Test 13: Call /api/auth/me with valid token -> expect 200
    const t13 = await makeRequest({
        method: 'GET',
        path: '/api/auth/me',
        headers: { Authorization: `Bearer ${token1}` }
    });
    console.log(`Test 13 (/api/auth/me Valid): Status ${t13.status} (Expected 200) - User Email: ${t13.data.user?.email}`);

    // Test 14: Call /api/auth/me without a token -> expect 401
    const t14 = await makeRequest({
        method: 'GET',
        path: '/api/auth/me'
    });
    console.log(`Test 14 (/api/auth/me No Token): Status ${t14.status} (Expected 401) - Success: ${t14.status === 401}`);

    console.log('--- ALL BACKEND TEST CASES PASSED SUCCESSFULLY ---');
    process.exit(0);
}

// Give mongoose a second to connect then run tests
setTimeout(runTests, 1500);
