const express = require('express');
const app = express();
const PORT = 5000;

// ─── In-Memory Data Store ────────────────────────────────────────────
let tasks = [];
let nextId = 1;

// ─── Built-in Middleware ─────────────────────────────────────────────
app.use(express.json());

// ─── 1. Request Logging Middleware (Global) ──────────────────────────
// Logs HTTP method, URL, and timestamp for every incoming request.
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ─── 2. Content-Type Validation Middleware (Supplementary) ───────────
// Rejects POST/PUT requests that don't have Content-Type: application/json.
const requireJson = (req, res, next) => {
    if ((req.method === 'POST' || req.method === 'PUT') &&
        !req.is('application/json')) {
        return res.status(415).json({
            error: 'Unsupported Media Type',
            message: 'Content-Type must be application/json'
        });
    }
    next();
};
app.use(requireJson);

// ─── 3. Route-Specific Middleware: Validate Task ID Format ───────────
// Ensures :id is a positive integer before reaching the controller.
const validateTaskId = (req, res, next) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'Bad Request',
            message: `Invalid task ID "${req.params.id}". ID must be a positive integer.`
        });
    }
    req.taskId = id; // attach parsed id for convenience
    next();
};

// ─── CRUD Routes ─────────────────────────────────────────────────────

// GET /tasks — Retrieve all tasks
app.get('/tasks', (req, res) => {
    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
    });
});

// POST /tasks — Create a new task
app.post('/tasks', (req, res) => {
    const { title, description, completed } = req.body;

    if (!title) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Title is required'
        });
    }

    const newTask = {
        id: nextId++,
        title,
        description: description || '',
        completed: completed || false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: newTask
    });
});

// PUT /tasks/:id — Update an existing task
app.put('/tasks/:id', validateTaskId, (req, res) => {
    const task = tasks.find(t => t.id === req.taskId);

    if (!task) {
        return res.status(404).json({
            error: 'Not Found',
            message: `Task with ID ${req.taskId} not found`
        });
    }

    const { title, description, completed } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task
    });
});

// DELETE /tasks/:id — Delete a task
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
        message: 'Task deleted successfully',
        data: deleted
    });
});

// ─── 4. 404 Handler for Undefined Routes (Supplementary) ────────────
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.url} does not exist`
    });
});

// ─── 5. Global Error Handling Middleware (MUST be last) ──────────────
// Has 4 parameters (err, req, res, next) so Express recognises it
// as an error handler. Defined last so it catches errors from all
// preceding middleware and routes.
app.use((err, req, res, next) => {
    console.error('ERROR:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong'
        // Stack trace is intentionally NOT sent to the client
    });
});

// ─── Start Server ────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
