const Task = require('../models/Task');

/**
 * GET /api/tasks
 * Retrieve all tasks belonging to the authenticated user
 */
const getTasks = async (req, res, next) => {
    try {
        // Enforce user isolation: only fetch tasks owned by req.user.id
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/tasks/:id
 * Retrieve a single task by ID (must belong to authenticated user)
 */
const getTaskById = async (req, res, next) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/tasks
 * Create a new task assigned to the authenticated user
 */
const createTask = async (req, res, next) => {
    try {
        const { title, description, priority, completed } = req.body;

        const task = await Task.create({
            title,
            description,
            priority: priority || 'medium',
            completed: completed || false,
            user: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/tasks/:id
 * Update an existing task belonging to the authenticated user
 */
const updateTask = async (req, res, next) => {
    try {
        const updateData = { ...req.body };
        // Ensure user cannot change owner or ID
        delete updateData.user;
        delete updateData.userId;
        delete updateData._id;

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            updateData,
            { returnDocument: 'after', runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task updated successfully',
            data: task
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/tasks/:id
 * Delete a task belonging to the authenticated user
 */
const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully',
            data: task
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask
};
