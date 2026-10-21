const { body, validationResult } = require('express-validator');

/**
 * Common handler to inspect validation results and return HTTP 400 on error
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorList = errors.array();
        return res.status(400).json({
            success: false,
            message: errorList[0].msg,
            errors: errorList.map(err => ({
                field: err.path || err.param,
                message: err.msg
            }))
        });
    }
    next();
};

/**
 * Validation rules for user registration:
 * - Valid email format, trimmed and normalized
 * - Password required with minimum 6 characters
 */
const registerValidationRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validate
];

/**
 * Validation rules for user login:
 * - Valid email and password presence
 */
const loginValidationRules = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required'),
    validate
];

/**
 * Validation rules for task creation:
 * - title: required, non-empty string, max 100 characters
 * - description: optional string
 * - priority: optional, must be 'low', 'medium', or 'high'
 * - completed: optional boolean
 */
const createTaskValidationRules = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required and cannot be empty')
        .isString().withMessage('Title must be a string')
        .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
    body('description')
        .optional()
        .isString().withMessage('Description must be a string')
        .trim(),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high']).withMessage("Priority must be 'low', 'medium', or 'high'"),
    body('completed')
        .optional()
        .isBoolean().withMessage('Completed must be a boolean value'),
    validate
];

/**
 * Validation rules for task update:
 * - Disallow modifying protected fields: user, userId, _id, id
 * - Validate title, description, priority, completed if provided
 */
const updateTaskValidationRules = [
    body(['user', 'userId', '_id', 'id'])
        .not().exists().withMessage('Modifying protected fields (user, userId, _id) is not allowed'),
    body('title')
        .optional()
        .trim()
        .notEmpty().withMessage('Title cannot be empty')
        .isString().withMessage('Title must be a string')
        .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
    body('description')
        .optional()
        .isString().withMessage('Description must be a string')
        .trim(),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high']).withMessage("Priority must be 'low', 'medium', or 'high'"),
    body('completed')
        .optional()
        .isBoolean().withMessage('Completed must be a boolean value'),
    validate
];

module.exports = {
    validate,
    registerValidationRules,
    loginValidationRules,
    createTaskValidationRules,
    updateTaskValidationRules
};
