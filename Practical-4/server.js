const express = require('express');
const app = express();
const PORT = 5000;

let tasks = [
  { id: 1, title: 'Learn Node.js',      description: 'Study core modules and async patterns', completed: false },
  { id: 2, title: 'Build REST API',     description: 'Create Express CRUD endpoints',         completed: false },
  { id: 3, title: 'Test with Postman',  description: 'Verify all HTTP methods and status codes', completed: false }
];
let nextId = 4;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  if ((req.method === 'POST' || req.method === 'PUT') &&
      !req.is('application/json')) {
    return res.status(415).json({
      error: 'Unsupported Media Type',
      message: 'Content-Type must be application/json'
    });
  }
  next();
});

function validateTaskId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: 'Bad Request',
      message: `Invalid task ID "${req.params.id}". ID must be a positive integer.`
    });
  }
  req.taskId = id;          // attach parsed id for the controller
  next();
}

// ══════════════════════════════════════════════
//  ROUTES
// ══════════════════════════════════════════════

// GET /  –  API Welcome / Info
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Task Manager API',
    endpoints: {
      'GET    /tasks':      'Retrieve all tasks',
      'GET    /tasks/:id':  'Retrieve a single task',
      'POST   /tasks':      'Create a new task',
      'PUT    /tasks/:id':  'Update an existing task',
      'DELETE /tasks/:id':  'Delete a task'
    }
  });
});

// GET /tasks  –  Retrieve all tasks  →  200
app.get('/tasks', (req, res) => {
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// GET /tasks/:id  –  Retrieve a single task  →  200 / 404
app.get('/tasks/:id', validateTaskId, (req, res) => {
  const task = tasks.find(t => t.id === req.taskId);
  if (!task) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${req.taskId} not found`
    });
  }
  res.status(200).json({ success: true, data: task });
});

// POST /tasks  –  Create a new task  →  201
app.post('/tasks', (req, res) => {
  const { title, description } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Field "title" is required and must be a non-empty string'
    });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: (description && typeof description === 'string') ? description.trim() : '',
    completed: false
  };

  tasks.push(newTask);
  res.status(201).json({ success: true, data: newTask });
});

// PUT /tasks/:id  –  Update an existing task  →  200 / 404
app.put('/tasks/:id', validateTaskId, (req, res) => {
  const index = tasks.findIndex(t => t.id === req.taskId);
  if (index === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${req.taskId} not found`
    });
  }

  const { title, description, completed } = req.body;

  if (title !== undefined)       tasks[index].title       = String(title).trim();
  if (description !== undefined) tasks[index].description = String(description).trim();
  if (completed !== undefined)   tasks[index].completed   = Boolean(completed);

  res.status(200).json({ success: true, data: tasks[index] });
});

// DELETE /tasks/:id  –  Remove a task  →  200 / 404
app.delete('/tasks/:id', validateTaskId, (req, res) => {
  const index = tasks.findIndex(t => t.id === req.taskId);
  if (index === -1) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Task with ID ${req.taskId} not found`
    });
  }

  const deleted = tasks.splice(index, 1)[0];
  res.status(200).json({
    success: true,
    message: `Task with ID ${req.taskId} deleted`,
    data: deleted
  });
});

// ──────────────────────────────────────────────
// Supplementary – 404 handler for undefined routes
// Must come AFTER all valid route definitions.
// ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} does not exist`
  });
});

// ──────────────────────────────────────────────
// Global Error Handling Middleware (MUST be last)
// Express identifies this as an error handler
// because it has 4 parameters (err, req, res, next).
//
// Why last? – Express forwards errors via next(err).
// If this middleware were registered earlier, routes
// defined after it would bypass the handler entirely.
//
// We never send err.stack to the client because it
// can expose file paths, library versions, and other
// internals that aid attackers.
// ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('──── Unhandled Error ────');
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  });
});

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Task Manager API running → http://localhost:${PORT}`);
});
