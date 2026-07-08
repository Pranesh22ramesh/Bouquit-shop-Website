const { body } = require('express-validator');
const { asyncHandler } = require('../utils/asyncHandler');
const authService = require('../services/authService');
const { refreshCookieOptions } = require('../utils/cookies');
const { env } = require('../config/env');

const signupValidators = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required').isLength({ min: 10, max: 20 }).withMessage('Enter a valid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match'),
];

const loginValidators = [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

const resetValidators = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('confirmPassword').optional().custom((value, { req }) => !value || value === req.body.password).withMessage('Passwords do not match'),
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
    message: 'If that email exists, a reset link has been generated',
  };

  if (token && env.nodeEnv !== 'production') {
    response.resetUrl = `${env.frontendUrl}/reset-password/${token}`;
  }

  res.json(response);
});

const resetPassword = asyncHandler(async (req, res) => {
  const session = await authService.resetPassword({
    token: req.params.token,
    password: req.body.password,
  });
  sendSession(res, session);
});

module.exports = {
  adminLogin,
  forgotPassword,
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
