const { body, param, cookie } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const authService = require('../services/authService');
const { refreshCookieOptions } = require('../utils/cookies');
const { env } = require('../config/env');

// Strict input validation schemas
const signupValidators = [
  body('fullName')
    .isString().withMessage('Full name must be text').bail()
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 70 }).withMessage('Full name must be between 2 and 70 characters')
    .matches(/^[\p{L}\p{M}\s.'-]+$/u).withMessage('Full name contains invalid characters'),
  body('email')
    .isString().withMessage('Email address must be text').bail()
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 }).withMessage('Email address is too long'),
  body('phoneNumber')
    .isString().withMessage('Phone number must be text').bail()
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Enter a valid phone number (10 to 15 digits)'),
  body('password')
    .isString().withMessage('Password must be a string')
    .bail().custom((value) => Buffer.byteLength(value, 'utf8') <= 72).withMessage('Password must not exceed 72 UTF-8 bytes')
    .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters'),
  body('confirmPassword')
    .isString().withMessage('Password confirmation must be text').bail()
    .isLength({ min: 8, max: 100 })
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

const loginValidators = [
  body('email')
    .isString().withMessage('Email address must be text').bail()
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 }).withMessage('Email address is too long'),
  body('password')
    .isString().withMessage('Password must be a string')
    .bail().custom((value) => Buffer.byteLength(value, 'utf8') <= 72).withMessage('Password must not exceed 72 UTF-8 bytes')
    .notEmpty().withMessage('Password is required')
    .isLength({ max: 100 }).withMessage('Password exceeds maximum length'),
];

const forgotPasswordValidators = [
  body('email')
    .isString().withMessage('Email address must be text').bail()
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Enter a valid email address')
    .normalizeEmail()
    .isLength({ max: 100 }).withMessage('Email address is too long'),
];

const resetValidators = [
  param('token')
    .isString().withMessage('Reset token is required')
    .trim()
    .notEmpty().withMessage('Reset token is required')
    .matches(/^[A-Za-z0-9._-]+$/).withMessage('Invalid reset token format')
    .isLength({ min: 16, max: 4096 }).withMessage('Invalid reset token format'),
  body('password')
    .isString().withMessage('Password must be a string')
    .bail().custom((value) => Buffer.byteLength(value, 'utf8') <= 72).withMessage('Password must not exceed 72 UTF-8 bytes')
    .isLength({ min: 8, max: 100 }).withMessage('Password must be between 8 and 100 characters'),
  body('confirmPassword')
    .optional()
    .isString().withMessage('Password confirmation must be text').bail()
    .isLength({ min: 8, max: 100 })
    .custom((value, { req }) => !value || value === req.body.password)
    .withMessage('Passwords do not match'),
];

const sendSession = (res, session) => {
  res.cookie(env.refreshCookieName, session.refreshToken, refreshCookieOptions);
  res.json({
    token: session.token,
    user: session.user,
  });
};

const signup = asyncHandler(async (req, res) => {
  const session = await authService.signup(req.body);
  sendSession(res.status(201), session);
});

const login = asyncHandler(async (req, res) => {
  const session = await authService.login(req.body);
  sendSession(res, session);
});

const adminLogin = asyncHandler(async (req, res) => {
  const session = await authService.login({ ...req.body, adminOnly: true });
  sendSession(res, session);
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  res.json(user);
});

const refresh = asyncHandler(async (req, res) => {
  const session = await authService.refreshSession(req.cookies[env.refreshCookieName]);
  sendSession(res, session);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies[env.refreshCookieName]);
  res.clearCookie(env.refreshCookieName, refreshCookieOptions);
  res.json({ message: 'Logged out successfully' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const token = await authService.beginPasswordReset(req.body.email);
  const response = {
    message: 'If that email exists, a password reset link has been processed.',
  };

  if (token && env.nodeEnv !== 'production') {
    response.resetUrl = `${env.frontendUrl}/reset-password/${token}`;
  }

  res.json(response);
});

const resetPassword = asyncHandler(async (req, res) => {
  const session = await authService.resetPassword({ token: req.params.token, password: req.body.password });
  sendSession(res, session);
});

const cookieValidators = [cookie(env.refreshCookieName).optional().isString().bail()
  .isLength({ min: 16, max: 4096 }).matches(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
  .withMessage('Invalid session cookie')];

module.exports = {
  cookieValidators,
  adminLogin,
  forgotPassword,
  forgotPasswordValidators,
  login,
  loginValidators,
  logout,
  me,
  refresh,
  resetPassword,
  resetValidators,
  signup,
  signupValidators,
};
