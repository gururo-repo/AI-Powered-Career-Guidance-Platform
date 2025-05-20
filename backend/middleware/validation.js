import { check, body, param, validationResult } from 'express-validator';

// Register validation
export const validateRegister = [
  check('name')
    .trim()
    .not().isEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),

  check('email')
    .trim()
    .not().isEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  check('password')
    .exists().withMessage('Password is required')
    .notEmpty().withMessage('Password cannot be empty')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Za-z])(?=.*\d).*$/)
    .withMessage('Password must contain at least one letter and one number')
    .trim(),

  check('phone')
    .optional()
    .isMobilePhone().withMessage('Please provide a valid phone number')
];

// Login validation
export const validateLogin = [
  check('email')
    .trim()
    .not().isEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),

  check('password')
    .not().isEmpty().withMessage('Password is required')
];

// Profile update validation
export const validateProfileUpdate = [
  check('industry')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Industry must be between 2 and 100 characters'),

  check('subIndustry')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Sub-industry must be between 2 and 100 characters'),

  check('experience')
    .optional()
    .isInt({ min: 0, max: 50 }).withMessage('Experience must be between 0 and 50 years'),

  check('skills')
    .optional()
    .isArray().withMessage('Skills must be an array')
    .custom(skills => {
      if (Array.isArray(skills)) {
        return skills.every(skill => typeof skill === 'string' && skill.trim().length > 0);
      }
      return true;
    }).withMessage('Each skill must be a non-empty string'),

  check('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters')
];

// Phone verification validation

// Email verification validation

// Password reset validation
export const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required')
    .isString()
    .withMessage('Reset token must be a string')
    .isLength({ min: 32 })
    .withMessage('Invalid reset token format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,])[A-Za-z\d@$!%*?&.,]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// Validation middleware for email
export const validateEmail = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
];

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// OAuth validation
export const validateOAuth = [
  check('access_token')
    .not().isEmpty().withMessage('Access token is required')
];

