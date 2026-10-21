const Task = require('../models/Task');
const cache = require('../config/cache');
const {
    recordHit,
    recordMiss,
    isCacheEnabled,
    getUserTaskListKey,
    getUserSingleTaskKey,
    invalidateUserTaskCache
} = require('../utils/cacheHelpers');

/**
 * GET /api/tasks
 * Retrieve all tasks belonging to the authenticated user with in-memory caching
 */
const getTasks = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const cacheKey = getUserTaskListKey(userId);

        // Step 1: Check cache if caching is active
        if (isCacheEnabled(req) && cache.has(cacheKey)) {
            const cachedData = cache.get(cacheKey);
            if (cachedData !== undefined) {
                recordHit();
                res.setHeader('X-Cache', 'HIT');
                return res.status(200).json(cachedData);
            }
        }

        // Step 2: Cache MISS -> Query MongoDB
        recordMiss();

        // Enforce user isolation: only fetch tasks owned by req.user.id
        const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });

        const responsePayload = {
            success: true,
            count: tasks.length,
            data: tasks
        };

        // Step 3: Store in cache with configured TTL (default 60 seconds)
        if (isCacheEnabled(req)) {
            const ttl = parseInt(process.env.CACHE_TTL, 10) || 60;
            cache.set(cacheKey, responsePayload, ttl);
        }

        res.setHeader('X-Cache', 'MISS');
        res.status(200).json(responsePayload);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/tasks/:id
 * Retrieve a single task by ID with in-memory caching
 */
const getTaskById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const taskId = req.params.id;
        const cacheKey = getUserSingleTaskKey(userId, taskId);

        // Step 1: Check cache if caching is active
        if (isCacheEnabled(req) && cache.has(cacheKey)) {
            const cachedData = cache.get(cacheKey);
            if (cachedData !== undefined) {
                recordHit();
                res.setHeader('X-Cache', 'HIT');
                return res.status(200).json(cachedData);
            }
        }

        // Step 2: Cache MISS -> Query MongoDB with ownership check
        recordMiss();
        const task = await Task.findOne({
            _id: taskId,
            user: userId
        });

        if (!task) {
            // Do NOT cache 404 responses
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        const responsePayload = {
            success: true,
            data: task
        };

        // Step 3: Cache only successfully retrieved tasks
        if (isCacheEnabled(req)) {
            const ttl = parseInt(process.env.CACHE_TTL, 10) || 60;
            cache.set(cacheKey, responsePayload, ttl);
        }

        res.setHeader('X-Cache', 'MISS');
        res.status(200).json(responsePayload);
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/tasks
 * Create a new task assigned to the authenticated user and invalidate cache
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

        // Invalidate authenticated user's task-list cache after successful creation
        invalidateUserTaskCache(req.user.id);

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
 * Update an existing task belonging to the authenticated user and invalidate cache
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

        // Invalidate both user's task list cache and the single-task cache after successful update
        invalidateUserTaskCache(req.user.id, req.params.id);

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
 * Delete a task belonging to the authenticated user and invalidate cache
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

        // Invalidate both user's task list cache and the single-task cache after successful deletion
        invalidateUserTaskCache(req.user.id, req.params.id);

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
