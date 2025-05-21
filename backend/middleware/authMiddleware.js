import jwt from "jsonwebtoken";
import User from "../models/Users.js";
import logger from "../utils/logger.js";
import rateLimit from "express-rate-limit";
import Tokens from 'csrf';

// Rate limiting configuration
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per window
  message: "Too many login attempts, please try again after 15 minutes"
});

export const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // increased from 3 to 10 attempts per hour
  message: "Too many password reset attempts, please try again after an hour",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// CSRF protection
const tokens = new Tokens();

export const csrfProtection = async (req, res, next) => {
  // Skip CSRF check for non-mutating methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const secret = req.session?.csrfSecret || tokens.secretSync();
  const token = req.headers['x-csrf-token'];

  if (!token) {
    return res.status(403).json({ message: 'CSRF token missing' });
  }

  try {
    if (tokens.verify(secret, token)) {
      next();
    } else {
      res.status(403).json({ message: 'Invalid CSRF token' });
    }
  } catch (error) {
    res.status(403).json({ message: 'CSRF validation failed' });
  }
};

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user with this ID
    const user = await User.findById(decoded.id).select('-password');

    // If no user found
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request
    req.user = user;

    // Log authenticated request
    logger.info(`Authenticated request: ${req.method} ${req.originalUrl}`, {
      userId: user._id,
      method: req.method,
      path: req.originalUrl
    });

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Optional: Check if email is verified
export const emailVerifiedMiddleware = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      message: 'Email not verified. Please verify your email before proceeding.'
    });
  }
  next();
};

// Optional: Check if profile is complete
export const profileCompleteMiddleware = (req, res, next) => {
  if (!req.user.isProfileComplete) {
    return res.status(403).json({
      message: 'Profile not complete. Please complete your profile before proceeding.'
    });
  }
  next();
};