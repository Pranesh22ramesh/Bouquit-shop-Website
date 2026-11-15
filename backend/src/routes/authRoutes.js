const express = require('express');
const { validateRequest } = require('../middleware/validateRequest');
const { strictRequest } = require('../middleware/strictRequest');
const { protect } = require('../middleware/authMiddleware');
const {
  authLimiter,
  signupLimiter,
  authAccountAndBackoffLimiter,
  authenticatedLimiter,
} = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');

const router = express.Router();

// Public auth endpoints with strict rate limiting & exponential backoff
router.post(
  '/signup',
  signupLimiter,
  authAccountAndBackoffLimiter,
  strictRequest({ body: ['fullName', 'email', 'phoneNumber', 'password', 'confirmPassword'] }),
  authController.signupValidators,
  validateRequest,
  authController.signup
);

router.post(
  '/login',
  authLimiter,
  authAccountAndBackoffLimiter,
  strictRequest({ body: ['email', 'password'] }),
  authController.loginValidators,
  validateRequest,
  authController.login
);

router.post(
  '/admin/login',
  authLimiter,
  authAccountAndBackoffLimiter,
  strictRequest({ body: ['email', 'password'] }),
  authController.loginValidators,
  validateRequest,
  authController.adminLogin
);

router.post('/refresh', authLimiter, strictRequest(), authController.refresh);
router.post('/logout', authLimiter, strictRequest(), authController.logout);
router.get('/me', strictRequest(), protect, authenticatedLimiter, authController.me);

router.post(
  '/forgotpassword',
  authLimiter,
  authAccountAndBackoffLimiter,
  strictRequest({ body: ['email'] }),
  authController.forgotPasswordValidators,
  validateRequest,
  authController.forgotPassword
);

router.put(
  '/resetpassword/:token',
  authLimiter,
  authAccountAndBackoffLimiter,
  strictRequest({ body: ['password', 'confirmPassword'], params: ['token'] }),
  authController.resetValidators,
  validateRequest,
  authController.resetPassword
);

module.exports = router;
