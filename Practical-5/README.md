# Practical 5: Express Middleware Implementation & RESTful Integration

## 📌 Overview
This practical demonstrates the design, implementation, and integration of various types of **Express middleware** in a Node.js REST API, coupled with a React frontend for task management.

## 🚀 Middleware Architecture
The server implements 5 distinct middleware layers:

1. **Global Request Logging Middleware**:
   - Logs timestamp, HTTP method, and requested URL for every incoming request.
   - Example: `[2026-10-21T16:00:00.000Z] GET /tasks`

2. **Content-Type Validation Middleware (Supplementary)**:
   - Verifies that `POST` and `PUT` requests carry `Content-Type: application/json`.
   - Returns HTTP `415 Unsupported Media Type` when invalid.

3. **Route-Specific Middleware (`validateTaskId`)**:
   - Validates that `:id` URL parameters are positive integers before reaching controller logic.
   - Returns HTTP `400 Bad Request` with descriptive error details for invalid IDs.

4. **404 Catch-All Middleware**:
   - Catches unhandled routes and returns standard JSON 404 responses.

5. **Global Error Handling Middleware**:
   - 4-argument error handler (`(err, req, res, next)`) defined as the final middleware.
   - Logs server errors safely and prevents stack trace leakage to clients with HTTP `500 Internal Server Error`.

---

## 🛠️ API Endpoints

| Method | Endpoint | Description | Middleware Applied |
| :--- | :--- | :--- | :--- |
| `GET` | `/tasks` | Retrieve all tasks | Global logger |
| `POST` | `/tasks` | Create a new task | Global logger, JSON validation |
| `PUT` | `/tasks/:id` | Update task details | Global logger, JSON validation, ID validation |
| `DELETE` | `/tasks/:id` | Delete task | Global logger, ID validation |

---

## 💻 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Server
```bash
npm run server
```
Server runs at `http://localhost:5000`.

### 3. Start Frontend Dev Server
```bash
npm run dev
```
Runs at `http://localhost:5173` with proxy configuration forwarding `/tasks` to port `5000`.
