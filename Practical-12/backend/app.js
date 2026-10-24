require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Register task event listeners exactly once upon app initialization
require('./events/taskListeners');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const debugRoutes = require('./routes/debugRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Response Time Middleware: tracks elapsed time in milliseconds for benchmarking
app.use((req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const diff = process.hrtime(start);
        const elapsedMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
        // Elapsed time available if needed
    });
    // Set start time property on request for direct access if needed
    req._startTime = Date.now();
    next();
});

// CORS Configuration
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:5174',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Express JSON body parser
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // backward-compatible alias

app.use('/api/tasks', taskRoutes);
app.use('/tasks', taskRoutes); // backward-compatible alias

app.use('/api/debug', debugRoutes);
app.use('/debug', debugRoutes); // backward-compatible alias

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Practical 12 Backend API is running.',
        version: '1.0.0',
        service: 'Task Management API',
        endpoints: {
            auth: '/api/auth',
            tasks: '/api/tasks',
            health: '/api/health'
        }
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Practical 12 Backend is healthy and running with Docker, CI/CD Pipeline, and Automated Testing.',
        caching: {
            enabled: process.env.ENABLE_CACHE !== 'false',
            defaultTTL: parseInt(process.env.CACHE_TTL, 10) || 60
        },
        events: {
            system: 'Node.js EventEmitter',
            notificationDelayMs: parseInt(process.env.NOTIFICATION_DELAY_MS, 10) || 2000
        },
        ci: {
            provider: 'GitHub Actions',
            testedWith: ['jest', 'supertest']
        },
        timestamp: new Date().toISOString()
    });
});
app.get('/health', (req, res) => res.redirect('/api/health'));

// 404 Not Found handler for undefined routes
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
