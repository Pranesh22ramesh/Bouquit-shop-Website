const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

/**
 * Global general rate limiter for all incoming requests.
 */
const globalLimiter = rateLimit({
  windowMs: env.rateLimit.globalWindowMs,
  max: env.rateLimit.globalMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP. Please slow down and try again later.',
  },
});

/**
 * Moderate rate limiter for public browse endpoints (products, categories, gallery, reviews, content).
 */
const publicLimiter = rateLimit({
  windowMs: env.rateLimit.publicWindowMs,
  max: env.rateLimit.publicMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many browsing requests. Please try again in a few moments.',
  },
});

/**
 * Looser rate limiter for authenticated user actions (cart, profile, wishlist, orders).
 * Keys on authenticated user ID if available, otherwise falls back to client IP.
 */
const authenticatedLimiter = rateLimit({
  windowMs: env.rateLimit.userWindowMs,
  max: env.rateLimit.userMax,
  keyGenerator: (req) => (req.user && req.user.id ? `user_${req.user.id}` : req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'User action rate limit reached. Please wait a moment before trying again.',
  },
});

/**
 * Strict limiter for sensitive authentication endpoints (login, forgot-password)
 * Prevents automated credential stuffing by IP address.
 */
const authLimiter = rateLimit({
  windowMs: env.rateLimit.authWindowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

/**
 * Limiter for new account creation to prevent automated bot spam.
 */
const signupLimiter = rateLimit({
  windowMs: env.rateLimit.signupWindowMs,
  max: env.rateLimit.signupMax,
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
  windowMs: env.rateLimit.uploadWindowMs,
  max: env.rateLimit.uploadMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Upload rate limit reached. Please wait a few moments before uploading more files.',
  },
});

// =========================================================================
// Per-Account Tracking & Exponential Backoff Engine
// =========================================================================

// In-memory tracking stores for failed attempts
// Map structure: key => { count: number, firstAttemptAt: number, lastAttemptAt: number, blockedUntil: number }
const accountAttempts = new Map();
const ipAttempts = new Map();

// Periodic cleanup every 10 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  const windowMs = env.rateLimit.authWindowMs;

  for (const [key, record] of accountAttempts.entries()) {
    if (now - record.lastAttemptAt > windowMs) {
      accountAttempts.delete(key);
    }
  }

  for (const [key, record] of ipAttempts.entries()) {
    if (now - record.lastAttemptAt > windowMs) {
      ipAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

/**
 * Middleware: Per-Account Rate Limiting & Exponential Backoff.
 * Applied before login to enforce progressive backoff delays and per-account thresholds.
 */
const authAccountAndBackoffLimiter = async (req, res, next) => {
  const email = (req.body?.email || '').trim().toLowerCase();
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = env.rateLimit.authWindowMs;
  const maxAttemptsPerAccount = env.rateLimit.authMax;

  // 1. Check Per-Account lockout threshold
  if (email) {
    const acctRecord = accountAttempts.get(email);
    if (acctRecord) {
      // If outside window, reset
      if (now - acctRecord.firstAttemptAt > windowMs) {
        accountAttempts.delete(email);
      } else if (acctRecord.count >= maxAttemptsPerAccount) {
        const retryAfterSeconds = Math.ceil((acctRecord.firstAttemptAt + windowMs - now) / 1000);
        res.setHeader('Retry-After', retryAfterSeconds);
        return res.status(429).json({
          message: `Too many failed attempts for this account. Please wait ${Math.ceil(retryAfterSeconds / 60)} minute(s) before trying again or reset your password.`,
          retryAfter: retryAfterSeconds,
        });
      }
    }
  }

  // 2. Exponential Backoff Check (based on combined IP / Account failures)
  const acctFailures = email ? (accountAttempts.get(email)?.count || 0) : 0;
  const ipFailures = ipAttempts.get(ip)?.count || 0;
  const consecutiveFailures = Math.max(acctFailures, ipFailures);

  // If 3 or more consecutive failures, enforce exponential backoff delay
  if (consecutiveFailures >= 3) {
    // 3 failures: 1.5s, 4 failures: 3s, 5 failures: 6s, 6+ failures: 12s (capped at 20s)
    const backoffExponent = Math.min(consecutiveFailures - 2, 4);
    const delayMs = Math.min(1500 * Math.pow(2, backoffExponent - 1), 20000);

    // Enforce sleep delay to throttle automated credential stuffers
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  next();
};

/**
 * Record a failed authentication attempt to increment backoff counter.
 */
const recordFailedAuth = (email, ip) => {
  const now = Date.now();
  const normEmail = (email || '').trim().toLowerCase();

  if (normEmail) {
    const acct = accountAttempts.get(normEmail) || {
      count: 0,
      firstAttemptAt: now,
      lastAttemptAt: now,
    };
    acct.count += 1;
    acct.lastAttemptAt = now;
    accountAttempts.set(normEmail, acct);
  }

  if (ip) {
    const ipRec = ipAttempts.get(ip) || {
      count: 0,
      firstAttemptAt: now,
      lastAttemptAt: now,
    };
    ipRec.count += 1;
    ipRec.lastAttemptAt = now;
    ipAttempts.set(ip, ipRec);
  }
};

/**
 * Clear failed attempts upon successful authentication.
 */
const recordSuccessfulAuth = (email, ip) => {
  const normEmail = (email || '').trim().toLowerCase();
  if (normEmail) accountAttempts.delete(normEmail);
  if (ip) ipAttempts.delete(ip);
};

module.exports = {
  globalLimiter,
  publicLimiter,
  authenticatedLimiter,
  authLimiter,
  signupLimiter,
  uploadLimiter,
  authAccountAndBackoffLimiter,
  recordFailedAuth,
  recordSuccessfulAuth,
};
