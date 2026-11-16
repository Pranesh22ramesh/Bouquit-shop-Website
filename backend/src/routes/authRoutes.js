const express = require('express');
const { validateRequest } = require('../middleware/validateRequest');
const { strictRequest } = require('../middleware/strictRequest');
const { protect } = require('../middleware/authMiddleware');
const {
  authIpLimiter,
  authAccountLimiter,
  authenticatedLimiter,
} = require('../middleware/rateLimiter');
const authController = require('../controllers/authController');
const { env } = require('../config/env');
const { verifyRefreshToken, verifyResetToken } = require('../utils/token');

const router = express.Router();
const emailIdentity = (req) => req.body.email;
const refreshIdentity = (req) => req.cookies[env.refreshCookieName]
  ? verifyRefreshToken(req.cookies[env.refreshCookieName]).sub : null;

// Public auth endpoints with strict rate limiting & exponential backoff
router.post(
  '/signup',
  authIpLimiter,
  strictRequest({ body: ['fullName', 'email', 'phoneNumber', 'password', 'confirmPassword'] }),
  authController.signupValidators,
  validateRequest,
  authAccountLimiter('signup', emailIdentity, env.rateLimit.signupAccountAttemptMax),
  authController.signup
);

router.post(
  '/login',
  authIpLimiter,
  strictRequest({ body: ['email', 'password'] }),
  authController.loginValidators,
  validateRequest,
  authAccountLimiter('login', emailIdentity),
  authController.login
);

router.post(
  '/admin/login',
  authIpLimiter,
  strictRequest({ body: ['email', 'password'] }),
  authController.loginValidators,
  validateRequest,
  authAccountLimiter('login', emailIdentity),
  authController.adminLogin
);

router.post('/refresh', authIpLimiter, strictRequest(), authController.cookieValidators, validateRequest,
  authAccountLimiter('refresh', refreshIdentity), authController.refresh);
router.post('/logout', authIpLimiter, strictRequest(), authController.cookieValidators, validateRequest, authController.logout);
router.get('/me', strictRequest(), protect, authenticatedLimiter, authController.me);

router.post(
  '/forgotpassword',
  authIpLimiter,
  strictRequest({ body: ['email'] }),
  authController.forgotPasswordValidators,
  validateRequest,
  authAccountLimiter('password-reset-request', emailIdentity),
  authController.forgotPassword
);

router.put(
  '/resetpassword/:token',
  authIpLimiter,
  strictRequest({ body: ['password', 'confirmPassword'], params: ['token'] }),
  authController.resetValidators,
  validateRequest,
  authAccountLimiter('password-reset', (req) => verifyResetToken(req.params.token).sub),
  authController.resetPassword
);

module.exports = router;
