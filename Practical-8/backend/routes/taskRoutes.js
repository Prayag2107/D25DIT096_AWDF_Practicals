const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const {
    createTaskValidationRules,
    updateTaskValidationRules
} = require('../middleware/validationMiddleware');

// All task routes require a valid JWT token
router.use(authMiddleware);

// GET /api/tasks - Retrieve all tasks for the logged in user
router.get('/', getTasks);

// POST /api/tasks - Create a task
router.post('/', createTaskValidationRules, createTask);

// GET /api/tasks/:id - Retrieve a specific task by ID
router.get('/:id', getTaskById);

// PUT /api/tasks/:id - Update a task
router.put('/:id', updateTaskValidationRules, updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', deleteTask);

module.exports = router;
