const express = require('express');
const Task = require('../models/Task');
const router = express.Router();

// GET all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', errors: error });
    }
});

// POST new task
router.post('/', async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json({ success: true, message: 'Task created successfully', data: task });
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
        } else {
            res.status(500).json({ success: false, message: 'Server Error', errors: error });
        }
    }
});

// GET task by ID
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', errors: error });
    }
});

// PUT update task
router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.json({ success: true, message: 'Task updated successfully', data: task });
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
        } else {
            res.status(500).json({ success: false, message: 'Server Error', errors: error });
        }
    }
});

// DELETE task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.json({ success: true, message: 'Task deleted successfully', data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', errors: error });
    }
});

module.exports = router;
