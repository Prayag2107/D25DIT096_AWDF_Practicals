# Practical 4: RESTful API Development with Node.js and Express

## Description
This project implements a complete RESTful Task Management API using **Node.js** and **Express**. It demonstrates standard CRUD operations, custom middleware architecture (request logging, media type validation, route-specific parameter validation), centralized error handling, and robust HTTP status code compliance.

---

## Key Features & Architecture

### 1. Middleware Pipeline
- **Request Body Parsing (`express.json()`)**: Built-in middleware to parse incoming JSON payloads into `req.body`.
- **Request Logger Middleware**: Application-level middleware logging HTTP method, requested URL, and timestamp (`[ISO] METHOD URL`).
- **Media Type Validation Middleware**: Intercepts `POST` and `PUT` requests to ensure `Content-Type: application/json` is supplied, responding with `415 Unsupported Media Type` if missing or incorrect.
- **Route Parameter Validation Middleware (`validateTaskId`)**: Validates `:id` parameter to ensure it is a positive integer before hitting controller logic, returning `400 Bad Request` if malformed.
- **404 Route Handler**: Intercepts any request to undefined endpoints and responds with `404 Not Found`.
- **Global Error Handling Middleware**: A centralized 4-parameter error handler (`(err, req, res, next)`) that logs server-side stack traces while safely returning `500 Internal Server Error` without leaking sensitive server internals to clients.

---

## REST Endpoints Specification

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | API Information and Welcome Guide | `200 OK` |
| `GET` | `/tasks` | Retrieve list of all tasks | `200 OK` |
| `GET` | `/tasks/:id` | Retrieve a single task by ID | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `POST` | `/tasks` | Create a new task (requires JSON body) | `201 Created` / `400 Bad Request` / `415 Unsupported Media` |
| `PUT` | `/tasks/:id` | Update an existing task | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/tasks/:id` | Delete a task by ID | `200 OK` / `400 Bad Request` / `404 Not Found` |

---

## HTTP Status Codes Implemented
- `200 OK` – Successful GET, PUT, or DELETE request.
- `201 Created` – Successful task creation via POST.
- `400 Bad Request` – Invalid task ID format (non-integer) or missing required fields.
- `404 Not Found` – Task ID does not exist or requested endpoint does not exist.
- `415 Unsupported Media Type` – POST or PUT request sent without `Content-Type: application/json`.
- `500 Internal Server Error` – Centralized error handler catches unhandled exceptions.

---

## Project Structure
```text
Practical-4/
├── .gitignore          # Ignores node_modules, logs, and IDE files
├── package.json        # Project metadata and dependencies
├── package-lock.json   # Deterministic dependency tree
├── server.js           # Express API server and middleware pipeline
├── test-api.js         # Automated end-to-end HTTP test suite
└── README.md           # Project documentation and specifications
```

---

## Setup & Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the API Server**:
   ```bash
   npm start
   ```
   Server will run on `http://localhost:5000`.

3. **Run Automated Test Suite**:
   In a separate terminal (while server is running):
   ```bash
   npm test
   ```
   Or directly execute:
   ```bash
   node test-api.js
   ```
