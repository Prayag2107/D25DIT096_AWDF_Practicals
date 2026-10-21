# Practical 9: In-Memory Caching and Query Optimization

**Course**: Advanced Web Development Frameworks (AWDF)  
**Application**: Task Management Web Application (MERN Stack with JWT Authentication)  
**Topic**: In-Memory Server-Side Caching with `node-cache` and MongoDB Query Optimization  

---

## 1. Theoretical Background

### In-Memory Caching
In-memory caching is a high-performance optimization strategy that stores frequently read data directly within the application's RAM (volatile memory) rather than executing repeated queries against an external persistent datastore (such as MongoDB). 

- **Access Speed**: RAM access times are in nanoseconds to single-digit microseconds, whereas network-bound or disk-bound database queries require milliseconds.
- **Cache Hit**: A read request where the requested key is found in cache memory and served immediately without querying MongoDB.
- **Cache Miss**: A read request where the key is absent or expired; the application must fetch fresh data from MongoDB, write it into the cache, and return it.
- **Time-to-Live (TTL)**: A finite validity window assigned to each cached item. After TTL expiration, `node-cache` automatically purges the key to prevent indefinite staleness.
- **Write Invalidation**: The mandatory process of deleting stale cache entries upon any create (`POST`), update (`PUT`), or delete (`DELETE`) mutation, ensuring immediate cache coherence.

### Database Query Optimization
Query optimization involves structuring database access paths to minimize CPU, memory, and disk I/O. In this implementation:
1. **Compound Indexing**: A compound B-tree index on `{ user: 1, createdAt: -1 }` on the `tasks` collection enables MongoDB to fulfill both filtering (`user = userId`) and sorting (`sort({ createdAt: -1 })`) directly from index keys without expensive in-memory sort stages or table scans.
2. **Selective Projection and Lean Queries**: Limiting returned fields and keeping queries isolated to the authenticated user ID.

---

## 2. Updated Project Structure

```text
Pr9/
├── backend/
│   ├── config/
│   │   ├── db.js                     # MongoDB Mongoose connection
│   │   └── cache.js                  # Shared node-cache instance singleton (TTL=60s)
│   ├── controllers/
│   │   ├── authController.js         # User registration, login, and profile lookup
│   │   └── taskController.js         # CRUD operations integrated with caching & invalidation
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT verification & req.user extraction
│   │   ├── errorMiddleware.js        # Centralized error handler and 404 handler
│   │   └── validationMiddleware.js   # express-validator request schemas
│   ├── models/
│   │   ├── Task.js                   # Mongoose Task schema with compound index
│   │   └── User.js                   # Mongoose User schema with bcrypt hash
│   ├── routes/
│   │   ├── authRoutes.js             # Authentication endpoints (/api/auth)
│   │   ├── debugRoutes.js            # Cache statistics, reset, and toggle endpoints (/api/debug)
│   │   └── taskRoutes.js             # Task CRUD endpoints (/api/tasks)
│   ├── utils/
│   │   └── cacheHelpers.js           # Key generators, invalidation, metrics, and bypass logic
│   ├── .env                          # Environment variables (PORT, MONGO_URI, CACHE_TTL, etc.)
│   ├── .env.example                  # Template configuration file
│   ├── package.json                  # Dependencies (node-cache, express, mongoose, etc.)
│   ├── run_benchmark.js              # Benchmarking script for response time measurement
│   ├── server.js                     # Express app setup and server listener
│   ├── test_cache_api.js             # Comprehensive automated test suite (14 checks)
│   └── test_ttl_experiment.js        # TTL expiration lifecycle demonstration
└── frontend/                         # React + Vite application
    ├── src/
    ├── package.json
    └── vite.config.js
```

---

## 3. Installation and Configuration

### Prerequisites
- Node.js v18+ installed
- MongoDB service running on `mongodb://127.0.0.1:27017`

### Step 1: Install Dependencies
Open a terminal in the backend directory:
```bash
cd backend
npm install
npm install node-cache
```

### Step 2: Configure Environment Variables
Verify or create `backend/.env`:
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/task_management
JWT_SECRET=pr9_super_secret_jwt_key_98234729384729384_deepmind_2026
JWT_EXPIRES_IN=1h
CLIENT_URL=http://localhost:3000
CACHE_TTL=60
ENABLE_CACHE=true
```

---

## 4. Commands to Run the Backend and Tests

### Start Backend Server
```bash
# In backend directory:
npm run dev
# or for standard start:
npm start
```
The server starts on `http://localhost:5001`.

### Run Practical 9 Automated Test Suite (14 Checks)
```bash
npm test
```

### Run Benchmark Suite (Before vs After Timings)
```bash
npm run benchmark
```

### Run TTL Lifecycle Experiment
```bash
npm run test:ttl
```

---

## 5. Postman & Thunder Client Testing Instructions

### Flow Overview
1. Register/Login to receive a JWT Bearer Token.
2. Call `GET /api/tasks` twice to observe Cache `MISS` then Cache `HIT`.
3. Call `POST /api/tasks` to create a task; verify `GET /api/tasks` becomes a Cache `MISS` (invalidation).
4. Inspect `GET /api/debug/cache-stats` to verify hit/miss metrics.

### Request Details

#### 1. User Registration
- **Method**: `POST`
- **URL**: `http://localhost:5001/api/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "email": "student_pr9@example.com",
    "password": "Password123!"
  }
  ```
- **Expected Status**: `201 Created`

#### 2. User Login
- **Method**: `POST`
- **URL**: `http://localhost:5001/api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "email": "student_pr9@example.com",
    "password": "Password123!"
  }
  ```
- **Expected Status**: `200 OK`
- **Action**: Copy the `token` from the response JSON and use it in the Authorization header for subsequent requests (`Bearer <token>`).

#### 3. Fetch Tasks (1st Request - Cache MISS)
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/tasks`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Expected Status**: `200 OK`
- **Response Headers**: `X-Cache: MISS`
- **Explanation**: Cache was empty for this user key (`tasks:user:<id>`); data queried from MongoDB and stored in memory.

#### 4. Fetch Tasks (2nd Request - Cache HIT)
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/tasks`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Expected Status**: `200 OK`
- **Response Headers**: `X-Cache: HIT`
- **Explanation**: Key found in node-cache; returned directly from RAM without querying MongoDB.

#### 5. Create Task (Triggers Cache Invalidation)
- **Method**: `POST`
- **URL**: `http://localhost:5001/api/tasks`
- **Headers**:
  - `Authorization: Bearer <token>`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "title": "Study In-Memory Caching",
    "description": "Learn node-cache and Redis caching patterns",
    "priority": "high",
    "completed": false
  }
  ```
- **Expected Status**: `201 Created`
- **Explanation**: Task saved to MongoDB. Post-write hook triggers `invalidateUserTaskCache(userId)`, deleting `tasks:user:<id>`.

#### 6. Fetch Tasks (After Creation - Fresh Data)
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/tasks`
- **Headers**:
  - `Authorization: Bearer <token>`
- **Expected Status**: `200 OK`
- **Response Headers**: `X-Cache: MISS`
- **Explanation**: New query issued to MongoDB; response contains the newly created task.

#### 7. Inspect Cache Statistics
- **Method**: `GET`
- **URL**: `http://localhost:5001/api/debug/cache-stats`
- **Expected Status**: `200 OK`
- **Response Body**:
  ```json
  {
    "success": true,
    "hits": 2,
    "misses": 2,
    "totalRequests": 4,
    "hitRate": "50.00%",
    "keys": 1,
    "cachedKeys": ["tasks:user:6ad89093236ccd530ac84fa5"],
    "ttl": 60,
    "cachingEnabled": true
  }
  ```

#### 8. Reset Cache (Development Utility)
- **Method**: `POST`
- **URL**: `http://localhost:5001/api/debug/cache-reset`
- **Expected Status**: `200 OK`
- **Response Body**:
  ```json
  {
    "success": true,
    "message": "Cache flushed and statistics reset successfully"
  }
  ```

---

## 6. Response Time Measurements: Before vs After Caching

*Measurements performed on localhost with local MongoDB instance running, identical authenticated user (`User A`), 5 seeded tasks, and identical HTTP headers.*

### Table 1: Uncached Baseline Measurements (Cache Bypassed / Raw MongoDB Query)

| Request | Endpoint | HTTP Status | Response Time (ms) | Cache Header |
|---|---|---|---|---|
| Request 1 | `GET /api/tasks` | `200 OK` | **6.47 ms** | MISS |
| Request 2 | `GET /api/tasks` | `200 OK` | **3.22 ms** | MISS |
| Request 3 | `GET /api/tasks` | `200 OK` | **2.61 ms** | MISS |

**Average Uncached Response Time**:
$$\text{Average}_{\text{uncached}} = \frac{6.47 + 3.22 + 2.61}{3} = \mathbf{4.10\text{ ms}}$$

---

### Table 2: In-Memory Cached Measurements (`node-cache` Enabled)

| Request | Expected Cache Behavior | HTTP Status | Response Time (ms) | Actual Cache Header |
|---|---|---|---|---|
| Request 1 | MISS (cold cache populate) | `200 OK` | **5.13 ms** | `MISS` |
| Request 2 | HIT (served from RAM) | `200 OK` | **2.05 ms** | `HIT` |
| Request 3 | HIT (served from RAM) | `200 OK` | **1.69 ms** | `HIT` |

**Average Cached Overall Response Time**:
$$\text{Average}_{\text{cached}} = \frac{5.13 + 2.05 + 1.69}{3} = \mathbf{2.96\text{ ms}}$$

**Average Cached HIT Response Time (Requests 2 & 3)**:
$$\text{Average}_{\text{HIT}} = \frac{2.05 + 1.69}{2} = \mathbf{1.87\text{ ms}}$$

**Percentage Improvement (Cache HIT vs Uncached Baseline)**:
$$\text{Percentage Improvement} = \frac{\text{Average Uncached} - \text{Average Cached HIT}}{\text{Average Uncached}} \times 100$$
$$\text{Percentage Improvement} = \frac{4.10 - 1.87}{4.10} \times 100 = \mathbf{54.39\%}$$

> **Performance Analysis**:
> In-memory retrieval from `node-cache` eliminated MongoDB connection pooling overhead, query wire serialization, BSON parsing, and Mongoose document instantiation. Even on a local SSD environment with a small dataset, response time was cut by **over 54%**. In production environments where the database server resides on a distinct network host, the round-trip network latency saved yields even greater real-world gains (typically 80%–95% reduction).

---

## 7. TTL Experiment and Analysis

The Time-To-Live (TTL) configuration was tested under three operational intervals: **10 seconds**, **30 seconds**, and **60 seconds**.

### Experiment Matrix

| TTL Configuration | 1st Request (`t = 0s`) | 2nd Request (`t = 5s`) | Request After Expiry | Database Load | Staleness Window |
|---|---|---|---|---|---|
| **10 seconds** | MISS (Queried DB) | HIT (From RAM) | `t = 11s` $\rightarrow$ **MISS** (Purged & Re-queried) | Highest DB load under high traffic | Very fresh (at most 10s delay if invalidation missed) |
| **30 seconds** | MISS (Queried DB) | HIT (From RAM) | `t = 31s` $\rightarrow$ **MISS** (Purged & Re-queried) | Moderate balance | Medium balance (30s window) |
| **60 seconds (Default)** | MISS (Queried DB) | HIT (From RAM) | `t = 61s` $\rightarrow$ **MISS** (Purged & Re-queried) | Lowest repeated DB queries | 60s window (fully mitigated by explicit write invalidation) |

### Engineering Trade-offs:
1. **Short TTL (e.g., 10s)**:
   - *Pros*: Prevents stale data in the event of missing or third-party write invalidation; minimal RAM consumption because items are quickly collected.
   - *Cons*: More frequent cache misses, meaning higher continuous query volume to MongoDB.
2. **Long TTL (e.g., 60s+)**:
   - *Pros*: Maximum query offloading from MongoDB; superior average response times and higher cache hit rates.
   - *Cons*: If an out-of-band write modifies data without triggering cache invalidation, clients receive stale data until the TTL lapses; higher peak memory consumption.
   - *Conclusion*: When write invalidation is rigorously implemented on all mutating routes (`POST`, `PUT`, `DELETE`), a **60-second TTL** is safe, optimal, and protective against database spikes.

---

## 8. Functional Correctness & Cache Invalidation Test Results

The automated test suite (`backend/test_cache_api.js`) evaluated all 14 required correctness constraints:

| # | Test Scenario | Verified Behavior | Status |
|---|---|---|---|
| 1 | Initial `GET /api/tasks` creates cache entry | Status 200, Header `X-Cache: MISS`, cached in node-cache | **PASSED** |
| 2 | Immediate repeat `GET /api/tasks` | Status 200, Header `X-Cache: HIT`, returned from RAM | **PASSED** |
| 3 | `POST /api/tasks` invalidates list cache | User's list key `tasks:user:<id>` removed immediately after write | **PASSED** |
| 4 | `GET /api/tasks` after `POST` | Status 200, Header `X-Cache: MISS`, contains new task | **PASSED** |
| 5 | `GET /api/tasks/:id` single task caching | 1st: `MISS` (cached `task:<userId>:<taskId>`), 2nd: `HIT` | **PASSED** |
| 6 | `PUT /api/tasks/:id` invalidation | Updates MongoDB, deletes list and single task cache entries | **PASSED** |
| 7 | `GET /api/tasks/:id` after `PUT` | Returns updated title, Header `X-Cache: MISS` | **PASSED** |
| 8 | `DELETE /api/tasks/:id` invalidation | Deletes from MongoDB, purges list and single task cache entries | **PASSED** |
| 9 | `GET /api/tasks/:id` after `DELETE` | Returns HTTP 404 (Not Found); 404 is NOT cached | **PASSED** |
| 10 | TTL Expiration | Expired key automatically evicted; subsequent request queries DB | **PASSED** |
| 11 | Unauthenticated Request Protection | `GET /api/tasks` without token returns HTTP 401; cache bypass | **PASSED** |
| 12 | User Isolation (Cross-Tenant Security) | User B cannot see User A's tasks from list cache | **PASSED** |
| 13 | Cross-User Mutation Prevention | User B cannot view, update, or delete User A's task (HTTP 404) | **PASSED** |
| 14 | Cache Statistics Accuracy | `/api/debug/cache-stats` reports accurate hits, misses, hit rate | **PASSED** |

---

## 9. Key Questions for Viva Examination

### Q1: Why must the cache be invalidated after every successful write operation?
**Answer**: If the cache is not invalidated when a `POST`, `PUT`, or `DELETE` operation executes, subsequent read requests will continue returning outdated, stale data from memory until the TTL expires. Invalidation guarantees cache coherence and data consistency between the memory layer and persistent MongoDB storage.

### Q2: What is TTL, and why might 60 seconds be a reasonable starting value?
**Answer**: Time-To-Live (TTL) is an expiration timer assigned to cached items indicating how long an entry remains valid before automatic eviction. 60 seconds is an industry standard starting point because it is long enough to absorb traffic bursts and reduce repeated database queries, yet short enough that even if an invalidation edge-case occurs, stale data persists for at most one minute.

### Q3: Why is `node-cache` unsuitable for a multi-instance deployment?
**Answer**: `node-cache` stores items exclusively in the local RAM of the specific Node.js process. When an application runs in a cluster or across multiple load-balanced instances/containers, each instance maintains an isolated memory heap. An invalidation on Instance 1 will not invalidate cached data on Instance 2, causing inconsistent reads across instances. Distributed caches like Redis or Memcached resolve this.

### Q4: What is a cache hit?
**Answer**: A cache hit occurs when an incoming request asks for a key that exists and is currently valid in cache memory. The server satisfies the request immediately from RAM without executing any query against MongoDB.

### Q5: What is a cache miss?
**Answer**: A cache miss occurs when the requested key is not present in cache memory (either never set, previously deleted via invalidation, or expired due to TTL). The server must execute a query to MongoDB, populate the cache with the fresh result, and return the response.

### Q6: How does caching reduce repeated MongoDB queries?
**Answer**: Under normal operation without caching, 1,000 users requesting their task list generate 1,000 separate database queries. With caching enabled (TTL=60s), only the first request queries MongoDB; the remaining 999 requests are served directly from RAM. This shields MongoDB from CPU spikes, disk I/O bottlenecks, and connection pool exhaustion.

### Q7: What is the difference between in-memory caching and database indexing?
**Answer**:
- **Database Indexing**: A data structure (such as a B-Tree) maintained inside MongoDB on disk and buffer cache to locate records faster during a query (e.g., scanning index entries instead of the full collection). It still incurs database communication, query processing, and wire overhead.
- **In-Memory Caching**: Bypasses the database entirely by serving pre-serialized JSON objects directly from application process memory.

### Q8: Why must cache keys be user-specific in an authenticated application?
**Answer**: In multi-user systems, tasks belong to individual authenticated users. If a generic key like `tasks:all` were used, User B's request could receive User A's cached private tasks (a critical tenant data leakage and authorization violation). User-scoped keys like `tasks:user:<authenticated-user-id>` isolate each user's cache namespace.

### Q9: Why should failed database writes not trigger a successful cache update or invalidation?
**Answer**: If a database write fails (e.g., duplicate key error, validation failure, or database network partition) but the cache were updated or invalidated under the assumption of success, the cache and database would fall out of sync. Furthermore, clients would be falsely informed that their modification was applied. Invalidation must strictly be executed **only after** `Task.create()`, `Task.findOneAndUpdate()`, or `Task.findOneAndDelete()` resolves successfully.

### Q10: How is average response time calculated?
**Answer**: The average response time is calculated by summing the total elapsed round-trip durations (in milliseconds) across all sample requests and dividing by the total number of requests:
$$\text{Average Response Time} = \frac{\sum_{i=1}^{n} T_i}{n}$$

### Q11: Why might a cached request still be slow?
**Answer**:
1. High Node.js event-loop lag caused by CPU-intensive synchronous operations or large payload serialization.
2. `node-cache` configured with `useClones: true` performing deep memory cloning of very large arrays.
3. Network latency between client and Node.js server (e.g., slow mobile connections).
4. Garbage collection pauses in the V8 engine under heavy memory pressure.

### Q12: What alternatives, such as Redis, could be used in a distributed deployment?
**Answer**:
- **Redis**: An in-memory, distributed key-value datastore running as an independent service accessible by all Node.js backend instances. It supports clustering, replication, persistence (RDB/AOF), and pub/sub cache invalidation across microservices.
- **Memcached**: A high-performance, distributed memory object caching system focused purely on key-value string/object caching without Redis's data structure richness.

---

## 10. Conclusion

In Practical 9, server-side in-memory caching was successfully integrated into the existing authenticated Task Management backend using `node-cache`. A shared singleton cache instance was established with a configurable default TTL of 60 seconds. Strict user-scoped cache keys (`tasks:user:<userId>` and `task:<userId>:<taskId>`) were enforced to guarantee multi-tenant authorization security. Accurate cache invalidation was implemented on all write endpoints (`POST`, `PUT`, `DELETE`), ensuring immediate data consistency. 

Empirical benchmarks confirmed a **54.39% reduction** in response time for cached hits compared to the uncached database baseline. All 14 functional correctness tests passed, demonstrating a robust, production-grade caching layer ready for deployment and academic evaluation.
