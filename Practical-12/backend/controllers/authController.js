const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email is already registered. Please log in or use another email.'
            });
        }

        // Hash password with 10 salt rounds
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create and save user
        const newUser = await User.create({
            email,
            password: hashedPassword
        });

        // Return 201 Created with safe user details (exclude password)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                email: newUser.email,
                createdAt: newUser.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Log in an existing user and issue a JWT
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Look up user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Compare entered password with stored hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT
        const secret = process.env.JWT_SECRET || 'pr7_super_secret_jwt_key_98234729384729384_deepmind_2026';
        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

        const token = jwt.sign(
            { id: user._id },
            secret,
            { expiresIn }
        );

        // Return token and safe user details
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get current authenticated user details
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
    try {
        // Authenticated user ID comes from verified JWT in authMiddleware
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe
};
