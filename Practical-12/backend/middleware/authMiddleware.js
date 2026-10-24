const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check if authorization header exists and starts with 'Bearer '
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided or invalid header format.'
            });
        }

        // Extract token
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Token missing.'
            });
        }

        // Verify token against secret
        const secret = process.env.JWT_SECRET || 'pr7_super_secret_jwt_key_98234729384729384_deepmind_2026';
        const decoded = jwt.verify(token, secret);

        // Attach decoded payload to request (contains user id)
        // Never rely on client-supplied body IDs
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please log in again.'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid or malformed token.'
        });
    }
};

module.exports = authMiddleware;
