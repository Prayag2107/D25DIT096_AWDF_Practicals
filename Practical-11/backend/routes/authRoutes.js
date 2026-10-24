const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const {
    registerValidationRules,
    loginValidationRules
} = require('../middleware/validationMiddleware');

// Public authentication routes (no JWT required)
router.post('/register', registerValidationRules, register);
router.post('/login', loginValidationRules, login);

// Protected route to inspect current authenticated user
router.get('/me', authMiddleware, getMe);

module.exports = router;
