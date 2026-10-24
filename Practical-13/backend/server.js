require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start HTTP server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Practical 13 Server] Running on http://0.0.0.0:${PORT}`);
});

module.exports = server;
