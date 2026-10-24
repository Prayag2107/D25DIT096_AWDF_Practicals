const mongoose = require('mongoose');

/**
 * Connect to MongoDB using environment-configured URI or local fallback.
 * Inside Docker Compose, process.env.MONGO_URI will resolve to:
 *   mongodb://mongodb:27017/task_management
 */
const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/task_management';

    // Mask sensitive credentials if any are present in the connection string
    const sanitizedURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');

    try {
        const conn = await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
        });
        console.log(`[Database] MongoDB connected successfully to: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error(`[Database Error] Failed to connect to MongoDB at: ${sanitizedURI}`);
        console.error(`[Database Error] Details: ${error.message}`);
        console.error('[Database Error] Ensure MongoDB container/service is running and accessible.');
        process.exit(1);
    }
};

module.exports = connectDB;
