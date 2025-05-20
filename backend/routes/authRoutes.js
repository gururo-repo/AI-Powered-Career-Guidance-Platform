import express from 'express';
import {
  login,
  register,
  googleAuth,
  facebookAuth,
  verifyEmail,
  forgotPassword,
  googleTokenExchange,
  resetPassword,
  resendEmailVerification
} from '../controllers/authController.js';
import {
  validateLogin,
  validateRegister,
  validateEmail,
  validatePasswordReset,
  validateOAuth,
  handleValidationErrors
} from '../middleware/validation.js';
import { resetLimiter } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/google', validateOAuth, handleValidationErrors, googleAuth);
router.post('/google-token', googleTokenExchange);
router.post('/facebook', validateOAuth, handleValidationErrors, facebookAuth);
router.get('/verify-email/:token', verifyEmail);

// Password reset routes - apply rate limiting to prevent abuse
router.post('/forgot-password', resetLimiter, validateEmail, handleValidationErrors, forgotPassword);
router.post('/reset-password', resetLimiter, validatePasswordReset, handleValidationErrors, resetPassword);

router.post('/resend-verification', validateEmail, handleValidationErrors, resendEmailVerification);

// Add a route to validate reset tokens (for frontend validation)
router.get('/validate-reset-token/:token', (req, res) => {
  // This endpoint just returns 200 if the token format is valid
  // Actual token validation happens in resetPassword
  if (req.params.token && req.params.token.length >= 32) {
    return res.status(200).json({ valid: true });
  }
  res.status(400).json({ valid: false });
});

export default router;