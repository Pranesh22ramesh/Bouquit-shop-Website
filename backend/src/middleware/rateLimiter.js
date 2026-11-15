const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

const message = (text) => ({ message: text });

const globalLimiter = rateLimit({
  windowMs: env.rateLimit.globalWindowMs,
  max: env.rateLimit.globalMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('Too many requests. Please slow down and try again later.'),
});

const publicLimiter = rateLimit({
  windowMs: env.rateLimit.publicWindowMs,
  max: env.rateLimit.publicMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('Too many browsing requests. Please try again in a few moments.'),
});

// This middleware must run after protect so the key is the verified user ID.
const authenticatedLimiter = rateLimit({
  windowMs: env.rateLimit.userWindowMs,
  max: env.rateLimit.userMax,
  keyGenerator: (req) => `user:${req.user?.id || req.ip}`,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('User action rate limit reached. Please wait before trying again.'),
});

const authLimiter = rateLimit({
  windowMs: env.rateLimit.authWindowMs,
  max: env.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('Too many authentication requests. Please try again later.'),
});

const signupLimiter = rateLimit({
  windowMs: env.rateLimit.signupWindowMs,
  max: env.rateLimit.signupMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('Too many accounts created from this IP. Please try again later.'),
});

const uploadLimiter = rateLimit({
  windowMs: env.rateLimit.uploadWindowMs,
  max: env.rateLimit.uploadMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('Upload rate limit reached. Please wait before uploading more files.'),
});

// Process-local attempt state. In multi-instance deployments, use a shared rate-limit
// store so account backoff is consistent across instances.
const accountAttempts = new Map();
const ipAttempts = new Map();
const maxEntries = env.rateLimit.authAttemptMapMaxEntries;
const attemptWindowMs = env.rateLimit.authWindowMs;

const accountKey = (email, scope) => crypto
  .createHmac('sha256', env.jwtAccessSecret)
  .update(`${scope}:${String(email).trim().toLowerCase()}`)
  .digest('hex');

const authScope = (req) => {
  if (req.path.endsWith('/login')) return 'login';
  if (req.path === '/signup') return 'signup';
  if (req.path === '/forgotpassword') return 'password-reset-request';
  if (req.path.startsWith('/resetpassword/')) return 'password-reset';
  return 'auth';
};

const requestIdentity = (req) => {
  if (typeof req.body?.email === 'string') return req.body.email;
  if (typeof req.params?.token === 'string') return req.params.token;
  if (typeof req.cookies?.[env.refreshCookieName] === 'string') return req.cookies[env.refreshCookieName];
  return '';
};

const getActiveRecord = (store, key, now) => {
  const record = store.get(key);
  if (!record) return null;
  if (now - record.lastAttemptAt >= attemptWindowMs) {
    store.delete(key);
    return null;
  }
  return record;
};

const pruneStore = (store, now) => {
  for (const [key, record] of store) {
    if (now - record.lastAttemptAt >= attemptWindowMs) store.delete(key);
  }
  while (store.size >= maxEntries) {
    const oldestKey = store.keys().next().value;
    if (oldestKey === undefined) break;
    store.delete(oldestKey);
  }
};

const authAccountAndBackoffLimiter = (req, res, next) => {
  const identity = requestIdentity(req);
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const scope = authScope(req);
  const now = Date.now();
  const records = [
    identity ? getActiveRecord(accountAttempts, accountKey(identity, scope), now) : null,
    getActiveRecord(ipAttempts, `${scope}:${ip}`, now),
  ].filter(Boolean);
  const blockedUntil = Math.max(0, ...records.map((record) => record.blockedUntil || 0));

  if (blockedUntil > now) {
    const retryAfter = Math.max(1, Math.ceil((blockedUntil - now) / 1000));
    res.setHeader('Retry-After', retryAfter);
    return res.status(429).json({ message: 'Unable to sign in right now. Please try again later.', retryAfter });
  }

  return next();
};

const recordFailure = (store, key, threshold, now) => {
  if (!key) return;
  let record = getActiveRecord(store, key, now);
  if (!record) {
    pruneStore(store, now);
    record = { count: 0, firstAttemptAt: now, lastAttemptAt: now, blockedUntil: 0 };
  }
  record.count += 1;
  record.lastAttemptAt = now;
  if (record.count >= threshold) {
    const exponent = Math.min(record.count - threshold, 30);
    const delay = Math.min(env.rateLimit.authBackoffBaseMs * (2 ** exponent), env.rateLimit.authBackoffMaxMs);
    record.blockedUntil = Math.max(record.blockedUntil, now + delay);
  }
  store.set(key, record);
};

const recordAuthAttempt = (identity, ip, scope = 'login') => {
  const now = Date.now();
  const normalizedIdentity = typeof identity === 'string' ? identity.trim().toLowerCase() : '';
  if (normalizedIdentity) {
    recordFailure(accountAttempts, accountKey(normalizedIdentity, scope), env.rateLimit.authAccountFailureMax, now);
  }
  recordFailure(ipAttempts, `${scope}:${ip || 'unknown'}`, env.rateLimit.authIpFailureMax, now);
};

const recordFailedAuth = (identity, ip, scope = 'login') => recordAuthAttempt(identity, ip, scope);

const recordSuccessfulAuth = (identity, ip, scope = 'login') => {
  const normalizedIdentity = typeof identity === 'string' ? identity.trim().toLowerCase() : '';
  if (normalizedIdentity) accountAttempts.delete(accountKey(normalizedIdentity, scope));
  if (ip) ipAttempts.delete(`${scope}:${ip}`);
};

const cleanupTimer = setInterval(() => {
  const now = Date.now();
  pruneStore(accountAttempts, now);
  pruneStore(ipAttempts, now);
}, Math.min(attemptWindowMs, 10 * 60 * 1000));
cleanupTimer.unref();

module.exports = {
  globalLimiter,
  publicLimiter,
  authenticatedLimiter,
  authLimiter,
  signupLimiter,
  uploadLimiter,
  authAccountAndBackoffLimiter,
  recordFailedAuth,
  recordAuthAttempt,
  recordSuccessfulAuth,
};
