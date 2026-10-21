require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const debugRoutes = require('./routes/debugRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Response Time Middleware: tracks elapsed time in milliseconds for benchmarking
app.use((req, res, next) => {
    const start = process.hrtime();
    res.on('finish', () => {
        const diff = process.hrtime(start);
        const elapsedMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
        // Note: Headers cannot be set after finish, but we log or inspect if needed
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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Practical 9 Backend is healthy and running with in-memory caching.',
        caching: {
            enabled: process.env.ENABLE_CACHE !== 'false',
            defaultTTL: parseInt(process.env.CACHE_TTL, 10) || 60
        },
        timestamp: new Date().toISOString()
    });
});

// 404 Not Found handler for undefined routes
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

// Start HTTP server only if not already required by test runner
let server = null;
if (process.env.NODE_ENV !== 'test') {
    server = app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
