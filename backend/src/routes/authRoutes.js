const express = require('express');
const { validateRequest } = require('../middleware/validateRequest');
const { protect } = require('../middleware/authMiddleware');
const {
  authLimiter,
  signupLimiter,
  authAccountAndBackoffLimiter,
} = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');

const router = express.Router();

// Public auth endpoints with strict rate limiting & exponential backoff
router.post(
  '/signup',
  signupLimiter,
  authController.signupValidators,
  validateRequest,
  authController.signup
);

router.post(
  '/login',
  authLimiter,
  authAccountAndBackoffLimiter,
  authController.loginValidators,
  validateRequest,
  authController.login
);

router.post(
  '/admin/login',
  authLimiter,
  authAccountAndBackoffLimiter,
  authController.loginValidators,
  validateRequest,
  authController.adminLogin
);

router.post('/refresh', authLimiter, authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);

router.post(
  '/forgotpassword',
  authLimiter,
  authController.forgotPasswordValidators,
  validateRequest,
  authController.forgotPassword
);

router.put(
  '/resetpassword/:token',
  authLimiter,
  authController.resetValidators,
  validateRequest,
  authController.resetPassword
);

module.exports = router;
