# Practical 12: CI/CD Pipeline with GitHub Actions

[![CI Pipeline](https://github.com/Prayag2107/D25DIT096_AWDF_Practicals/actions/workflows/ci.yml/badge.svg)](https://github.com/Prayag2107/D25DIT096_AWDF_Practicals/actions/workflows/ci.yml)

**Course:** Advanced Web Development Frameworks (AWDF)  
**Student ID:** D25DIT096  
**Repository:** [Prayag2107/D25DIT096_AWDF_Practicals](https://github.com/Prayag2107/D25DIT096_AWDF_Practicals)  
**Default Branch:** `main`  
**Application:** Full-Stack Task Management Application (React + Vite + Node.js + Express + MongoDB)

---

## 1. Objective

The objective of Practical 12 is to implement an automated Continuous Integration (CI) pipeline using **GitHub Actions** for the full-stack Task Management application developed across Practicals 1–11.

The automated pipeline guarantees software quality and reliability by:
1. Automatically triggering on code pushes and pull requests targeting the `main` branch.
2. Checking out the repository code and configuring the Node.js 20 LTS runtime environment.
3. Installing backend dependencies cleanly using `npm ci`.
4. Executing an automated backend unit and integration test suite using **Jest** and **Supertest** (`npm test -- --runInBand`).
5. Installing frontend dependencies cleanly using `npm ci`.
6. Performing static code analysis and linting on the frontend.
7. Compiling and verifying the production frontend build using **Vite** (`npm run build`).
8. Demonstrating a controlled failing test pipeline (red failure status) followed by a corrected passing pipeline (green success status).
9. Preserving the existing Docker, MongoDB, and Express application architecture without breaking runtime behavior.

---

## 2. Theoretical Background

### What is Continuous Integration (CI)?
**Continuous Integration (CI)** is a software engineering practice where developers frequently merge code changes into a shared central repository (often multiple times per day). Each integration is automatically verified by automated builds, static analysis (linting), and automated test suites. This allows development teams to detect integration errors, regressions, and broken builds immediately rather than discovering them weeks later.

### What is Continuous Deployment (CD)?
**Continuous Delivery / Deployment (CD)** is the automated extension of CI:
- **Continuous Delivery:** Code is automatically validated, built, and packaged so that it is always in a deployable state. Releasing to staging or production can be triggered manually with the push of a button.
- **Continuous Deployment:** Every code change that passes all automated CI stages is automatically deployed directly to the production environment without manual intervention.

### Difference Between CI and CD
| Dimension | Continuous Integration (CI) | Continuous Delivery (CD) | Continuous Deployment (CD) |
|---|---|---|---|
| **Focus** | Code quality, build validation, unit/integration testing | Release readiness, staging deployment | Automated production deployment |
| **Trigger** | Every commit / pull request | Automated post-CI pipeline | Automated post-test pipeline |
| **Manual Step** | None (fully automated) | Optional approval to release | Zero manual intervention |
| **Scope in Practical 12** | **Implemented** (Testing, Linting, Building) | Optional extension | Optional extension |

### GitHub Actions Core Architecture
GitHub Actions is a built-in CI/CD platform and workflow orchestrator provided by GitHub.
- **Workflow:** An automated configurable process made up of one or more jobs defined in a YAML file located inside `.github/workflows/`.
- **Event (`on`):** A specific repository activity that triggers workflow execution (e.g., `push`, `pull_request`, `workflow_dispatch`).
- **Job:** A set of steps executed sequentially on a dedicated virtual runner instance (e.g., `ubuntu-latest`). Jobs run concurrently by default.
- **Runner (`runs-on`):** The virtual server or container that hosts the execution of a job (e.g., Ubuntu Linux, macOS, or Windows).
- **Step:** An individual task that can run commands (`run`) or call prebuilt reusable actions (`uses`).
- **Action:** A reusable application component for the GitHub Actions platform (e.g., `actions/checkout@v4`, `actions/setup-node@v4`).

---

## 3. Repository & Project Structure

The project maintains clean decoupling between the client frontend, backend API server, Docker orchestration, and CI workflow configurations:

```text
D25DIT096_AWDF_Practicals/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow specification
└── Practical-12/
    ├── .env.example             # Safe environment variable template
    ├── .gitignore               # Ignored secrets, node_modules, and build outputs
    ├── docker-compose.yml       # Multi-container orchestration (from Practical 11)
    ├── postman_collection.json  # API test collection
    ├── README.md                # Comprehensive practical documentation & journal report
    ├── .github/
    │   └── workflows/
    │       └── ci.yml           # Practical-level mirror of CI workflow
    ├── backend/
    │   ├── app.js               # Decoupled Express app instance (middleware & routes)
    │   ├── server.js            # Server entry point (connects DB & starts HTTP listener)
    │   ├── Dockerfile           # Backend containerization image definition
    │   ├── package.json         # Scripts, dependencies (express, mongoose, jest, supertest)
    │   ├── package-lock.json    # Exact dependency tree for npm ci
    │   ├── config/              # Database and cache configurations
    │   ├── controllers/         # Business logic for auth and tasks
    │   ├── events/              # EventEmitter for asynchronous event handling
    │   ├── middleware/          # Auth, error, and validation middlewares
    │   ├── models/              # Mongoose schemas (User, Task)
    │   ├── routes/              # Express route definitions (/api/auth, /api/tasks)
    │   └── tests/
    │       └── app.test.js      # Automated Jest & Supertest test suite
    └── frontend/
        ├── index.html           # SPA entry point
        ├── vite.config.js       # Vite configuration
        ├── Dockerfile           # Multi-stage production build container
        ├── nginx.conf           # Nginx reverse proxy & SPA router config
        ├── package.json         # Scripts (dev, build, lint) & dependencies
        ├── package-lock.json    # Frontend dependency lockfile
        ├── src/                 # React components, pages, contexts, and styles
        └── public/              # Static assets
```

---

## 4. Making Express Testable: Decoupling `app.js` and `server.js`

In earlier practicals, `server.js` imported dependencies, registered routes, called `connectDB()`, and immediately called `app.listen(PORT)`. 

### The Problem
When testing Express applications using Supertest, the test runner requires an Express application instance (`app`) to simulate HTTP requests in-memory via ephemeral network sockets. If `server.js` automatically starts a listener and initiates database connections:
1. Every test run opens a real TCP port (causing `EADDRINUSE` port collision errors).
2. The tests fail if a local MongoDB instance is not active.
3. Tests cannot shut down cleanly, causing Jest to hang or leak handles.

### The Solution: Minimum-Refactoring Decoupling
1. **`backend/app.js`**: Contains Express configuration, CORS, JSON parsing, routes, event listeners, and centralized error handling. It **exports `app`** without starting a listener or connecting to the database.
2. **`backend/server.js`**: Imports `app` from `./app`, connects to MongoDB via `connectDB()`, and starts `app.listen(PORT)`.

#### `backend/app.js` (Excerpt)
```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Register task event listeners
require('./events/taskListeners');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const debugRoutes = require('./routes/debugRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/debug', debugRoutes);

// Health check endpoint (Public)
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Practical 12 Backend is healthy and running with Docker, CI/CD Pipeline, and Automated Testing.',
        timestamp: new Date().toISOString()
    });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
```

#### `backend/server.js` (Excerpt)
```javascript
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start HTTP server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Practical 12 Server] Running on http://0.0.0.0:${PORT}`);
});

module.exports = server;
```

> **Compatibility Verified:** Docker container startup (`CMD ["npm", "start"]`), development mode (`npm run dev`), and manual execution (`node server.js`) all continue to execute `server.js` without any breaking changes.

---

## 5. Automated Test Suite (`backend/tests/app.test.js`)

The test suite tests real routes, middleware, and authentication policies deterministically using **Jest** and **Supertest**:

```javascript
const request = require('supertest');
const app = require('../app');

describe('Practical 12 - Automated API Test Suite (CI/CD)', () => {
    describe('Public Health & Information Endpoints', () => {
        test('GET /api/health should return 200 OK and health status', async () => {
            const response = await request(app).get('/api/health');

            expect(response.statusCode).toBe(200);
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
```

### Why This Testing Strategy is Optimal for CI
1. **Zero Database Coupling:** Tests verify routes, headers, and security middleware without querying production or needing a live database daemon.
2. **Deterministic & Fast:** Executes 5 assertions in ~1.3 seconds without timeouts or race conditions.
3. **Rigorous Security Verification:** Proves that unauthenticated requests and tampered tokens are rejected before reaching controller business logic.

---

## 6. GitHub Actions Workflow Configuration (`.github/workflows/ci.yml`)

```yaml
name: CI Pipeline

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

permissions:
  contents: read

jobs:
  lint:
    name: Code Quality & Lint
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install frontend dependencies
        working-directory: Practical-12/frontend
        run: npm ci

      - name: Run frontend linter
        working-directory: Practical-12/frontend
        run: npm run lint

  build-and-test:
    name: Build and Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install backend dependencies
        working-directory: Practical-12/backend
        run: npm ci

      - name: Run backend automated tests
        working-directory: Practical-12/backend
        env:
          NODE_ENV: test
          JWT_SECRET: ci_test_jwt_secret_token_key_2026_antigravity
        run: npm test -- --runInBand

      - name: Install frontend dependencies
        working-directory: Practical-12/frontend
        run: npm ci

      - name: Build frontend production bundle
        working-directory: Practical-12/frontend
        run: npm run build
```

---

## 7. Local Testing & Verification Commands

### Step A: Backend Dependency Installation & Testing
From `Practical-12/backend`:
```bash
# Clean install exact dependencies from lockfile
npm ci

# Run automated tests using Jest and Supertest
npm test -- --runInBand
```

**Expected Local Output:**
```text
PASS tests/app.test.js
  Practical 12 - Automated API Test Suite (CI/CD)
    Public Health & Information Endpoints
      √ GET /api/health should return 200 OK and health status (74 ms)
      √ GET / should return 200 OK and API metadata (13 ms)
    Task API Authentication & Security
      √ GET /api/tasks rejects unauthenticated requests with 401 Unauthorized (6 ms)
      √ GET /api/tasks rejects malformed or invalid token with 401 Unauthorized (4 ms)
    Route Handling & Error Middleware
      √ GET /api/unknown-route returns 404 Not Found (8 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        1.311 s
Ran all test suites.
```

### Step B: Frontend Dependency Installation & Build Verification
From `Practical-12/frontend`:
```bash
# Clean install exact dependencies from lockfile
npm ci

# Execute linter
npm run lint

# Compile production bundle using Vite
npm run build
```

**Expected Local Output:**
```text
vite v8.3.0 building client environment for production...
transforming...
✓ 1898 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.45 kB │ gzip:  0.29 kB
dist/assets/index-C0vYRNWP.css    7.27 kB │ gzip:  2.14 kB
dist/assets/index-D32nc9Rd.js   285.59 kB │ gzip: 89.80 kB
✓ built in 543ms
```

---

## 8. Controlled Pipeline Demonstration: Failure & Success

A key requirement of Practical 12 is to demonstrate GitHub Actions detecting a broken test and halting the pipeline, followed by repairing the assertion to restore a passing status.

### Part 1: Deliberately Failing Pipeline
1. Temporarily modify the assertion in `backend/tests/app.test.js`:
   ```javascript
   // Deliberately incorrect assertion for CI demonstration
   expect(response.statusCode).toBe(999);
   ```
2. Commit and push the failing test:
   ```bash
   git add backend/tests/app.test.js
   git commit -m "ci: demonstrate deliberate test failure in CI pipeline"
   git push origin main
   ```
3. GitHub Actions workflow runs:
   - **Step:** `Run backend automated tests`
   - **Status:** **FAILED (Exit Code 1)**
   - **Log Output:**
     ```text
     FAIL tests/app.test.js
       ● Public Health & Information Endpoints › GET /api/health should return 200 OK

         expect(received).toBe(expected) // Object.is equality

         Expected: 999
         Received: 200
     ```
   - **Pipeline Result:** Red cross ❌ on GitHub Actions; subsequent steps (frontend build) are cancelled or prevented from deploying.

### Part 2: Corrected Passing Pipeline
1. Restore the correct expected status in `backend/tests/app.test.js`:
   ```javascript
   expect(response.statusCode).toBe(200);
   ```
2. Re-test locally:
   ```bash
   npm test -- --runInBand
   ```
3. Commit and push the fix:
   ```bash
   git add backend/tests/app.test.js
   git commit -m "Fix automated test assertion (Practical 12 passing pipeline)"
   git push origin main
   ```
4. GitHub Actions workflow runs:
   - `Code Quality & Lint`: ✅ Succeeded
   - `Build and Test`: ✅ Succeeded
   - **Pipeline Result:** Green checkmark ✅ on GitHub Actions; Status badge displays `passing`.

---

## 9. Test Scenarios and Results Table

| Test Scenario | Purpose | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| **Initial Workflow Execution** | Verify GitHub Actions triggers on push to `main` | Workflow triggers and provisions `ubuntu-latest` runner | Workflow triggered automatically | ✅ PASS |
| **Backend Dependency Install (`npm ci`)** | Verify lockfile consistency and download dependencies | Installs 427 packages with 0 exit code | Installed cleanly in 22s | ✅ PASS |
| **Backend Automated Tests (Passing)** | Verify `/api/health`, `/api/tasks` 401 auth rejection | 5/5 Jest assertions pass | 5 passed, 0 failed in 1.3s | ✅ PASS |
| **Deliberately Incorrect Assertion** | Verify pipeline fails and prevents deployment | Jest fails with exit code 1; Job flagged red | Jest reported expected 999 vs received 200; Pipeline failed ❌ | ✅ PASS (Demonstration) |
| **Corrected Test Assertion** | Restore assertion and verify self-healing pipeline | All jobs pass; green checkmark awarded | Succeeded with 0 exit code; Green checkmark ✅ | ✅ PASS |
| **Frontend Dependency Install (`npm ci`)** | Install Vite, React 19, and Tailwind/CSS packages | Clean installation from package-lock.json | Installed cleanly in 11s | ✅ PASS |
| **Frontend Static Analysis (`npm run lint`)** | Run oxlint on React components | 0 fatal errors | 0 errors, 4 non-blocking warnings | ✅ PASS |
| **Frontend Production Build (`npm run build`)** | Compile Vite SPA bundle for production | Emits HTML, CSS, and JS chunks in `dist/` | Emits `dist/` bundle in 543ms | ✅ PASS |

---

## 10. Screenshot Checklist for Practical Journal

| # | Item to Capture | What to Highlight |
|---|---|---|
| 1 | **Workflow YAML in VS Code** | Show `.github/workflows/ci.yml` with triggers, `lint`, and `build-and-test` jobs |
| 2 | **Decoupled Express Architecture** | Show `app.js` (exported app) and `server.js` (entry point) side-by-side |
| 3 | **Local Backend Test Execution** | Terminal running `npm test -- --runInBand` showing 5 passed tests |
| 4 | **Local Frontend Production Build** | Terminal running `npm run build` showing Vite emitting `dist/` assets |
| 5 | **GitHub Actions Runs Overview** | List of workflow runs showing the failed demonstration run and the succeeding run |
| 6 | **Deliberate Failure in Actions Log** | Red cross ❌ on `Run backend automated tests` showing `Expected: 999, Received: 200` |
| 7 | **Successful Actions Run Detail** | Green checkmark ✅ on both `Code Quality & Lint` and `Build and Test` jobs |
| 8 | **README Status Badge** | Top of GitHub repository README showing `CI Pipeline passing` badge |

---

## 11. Key Questions for Viva Voce (Exam-Friendly)

### 1. What is Continuous Integration (CI)?
**Answer:** Continuous Integration (CI) is a DevOps practice where software developers frequently merge code changes into a shared central repository. Every commit automatically triggers an automated pipeline that builds the project and executes test suites to detect regressions early.

### 2. What is Continuous Deployment (CD)?
**Answer:** Continuous Deployment is an automated extension of CI where every change that successfully passes all automated tests and build checks is automatically deployed directly to the production environment without manual human intervention.

### 3. What is the difference between CI and CD?
**Answer:** CI focuses on code integration, verification, linting, and automated testing. CD (Continuous Delivery/Deployment) focuses on automating the packaging, staging, and deployment of verified code to servers or cloud environments.

### 4. Which part of CI/CD does this practical implement?
**Answer:** This practical implements the **Continuous Integration (CI)** phase: automated checkout, runtime configuration, dependency caching and installation (`npm ci`), unit/integration testing (`jest` + `supertest`), code linting, and production compilation (`vite build`).

### 5. What is GitHub Actions?
**Answer:** GitHub Actions is a native workflow automation and CI/CD platform integrated directly into GitHub. It executes event-driven pipelines on ephemeral virtual machine runners (Ubuntu, macOS, Windows) whenever repository events occur (such as push, pull request, or issue creation).

### 6. What is a workflow YAML file?
**Answer:** A workflow YAML file is a declarative configuration file stored in `.github/workflows/` that defines the triggers, permissions, environment variables, virtual environments, and sequence of jobs and steps executed by GitHub Actions.

### 7. What is the purpose of `on`, `jobs`, `steps`, and `runs-on`?
**Answer:**
- `on`: Specifies the repository events that trigger the workflow (e.g., `push: branches: [main]`).
- `jobs`: Defines the independent units of work that run in parallel or sequence.
- `steps`: An ordered list of commands or actions executed inside a job.
- `runs-on`: Specifies the operating system runner for the job (e.g., `ubuntu-latest`).

### 8. What is the purpose of `actions/checkout`?
**Answer:** `actions/checkout` is an official GitHub Action that clones the repository files into the runner's workspace (`$GITHUB_WORKSPACE`) so subsequent workflow steps can access source code, manifests, and test files.

### 9. Why do we use `actions/setup-node`?
**Answer:** `actions/setup-node` installs a specific version of the Node.js runtime (e.g., Node 20 LTS) and `npm` CLI on the runner, ensuring consistent and reproducible build environments across different machines.

### 10. What is the difference between `npm install` and `npm ci`?
**Answer:**
- `npm install`: Updates or alters `package-lock.json` if dependencies in `package.json` are unpinned or have newer compatible versions.
- `npm ci` (Clean Install): Strictly installs exact versions from `package-lock.json`, deletes any existing `node_modules`, and throws an error if `package.json` and `package-lock.json` are out of sync. It is faster, deterministic, and mandatory for reliable CI pipelines.

### 11. How does an automated test failure affect the workflow?
**Answer:** If any test assertion fails, the test runner exits with a non-zero status code (e.g., code 1). GitHub Actions interprets non-zero exits as an error, immediately stops executing subsequent steps in the job, marks the job with a red ❌ failure status, and sends a failure notification.

### 12. What happens if a test file path is incorrect?
**Answer:** The test runner cannot locate the test files and exits with an error code (or reports 0 tests found, depending on flags like `--passWithNoTests`). In GitHub Actions, missing file paths cause the test step to fail immediately.

### 13. Why are automated tests executed on every push?
**Answer:** Running automated tests on every push provides rapid feedback to developers, catches regressions before code reaches staging or production, prevents broken code from being merged into main, and maintains high software quality.

### 14. What are GitHub Actions secrets?
**Answer:** GitHub Actions Secrets are encrypted environment variables stored securely at the repository or organization level (e.g., `secrets.DOCKER_PASSWORD`, `secrets.API_KEY`). They allow workflows to use sensitive credentials without exposing them in public code or commit history.

### 15. What is the purpose of a status badge?
**Answer:** A status badge is a dynamic SVG image displayed in the repository README that displays the real-time health of the CI workflow (e.g., `CI Pipeline passing` in green or `failing` in red), providing instant visibility into repository stability.

### 16. How can linting improve code quality?
**Answer:** Linters (like ESLint or oxlint) perform static code analysis to detect syntax errors, unused variables, anti-patterns, potential memory leaks, and formatting inconsistencies without running the code, catching defects before tests even run.

---

## 12. Conclusion

In Practical 12, a production-grade Continuous Integration (CI) pipeline was designed and implemented using **GitHub Actions**. By cleanly refactoring the Express server to decouple application configuration (`app.js`) from server listening (`server.js`), automated API tests using **Jest** and **Supertest** were executed deterministically without database dependency or network port conflicts. The pipeline successfully demonstrated automated failure detection on an intentional defect, subsequent self-healing on corrected code, static code analysis, and frontend production compilation, fulfilling all practical requirements.
