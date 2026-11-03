const rateLimit = require('express-rate-limit');

/**
 * Strict limiter for sensitive authentication endpoints (login, forgot-password)
 * Prevents brute force credential stuffing attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

/**
 * Limiter for new account creation to prevent automated bot spam.
 */
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 signups per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many accounts created from this IP. Please try again later.',
  },
});

/**
 * Limiter for file uploads to prevent resource exhaustion / DoS.
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 uploads per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Upload rate limit reached. Please wait a few moments before uploading more files.',
  },
});

module.exports = {
  authLimiter,
  signupLimiter,
  uploadLimiter,
};
