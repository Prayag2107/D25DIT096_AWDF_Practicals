/**
 * 404 Not Found Handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `API endpoint not found: ${req.method} ${req.originalUrl}`
    });
};

/**
 * Centralized Error Handling Middleware
 * Catches all unhandled synchronous and asynchronous errors forwarded via next(err)
 */
const errorHandler = (err, req, res, next) => {
    console.error('Unhandled Application Error:', err);

    // Mongoose bad ObjectId error
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Resource not found with invalid ID: ${err.value}`
        });
    }

    // Mongoose duplicate key error (code 11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(409).json({
            success: false,
            message: `Duplicate entry: '${field}' already exists.`
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        return res.status(400).json({
            success: false,
            message: `Validation Error: ${message}`
        });
    }

    // Determine status code
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.statusCode || 500);

    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 && process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : (err.message || 'Internal Server Error')
    });
};

module.exports = {
    notFoundHandler,
    errorHandler
};
