const crypto = require('crypto');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { env } = require('../config/env');

const ipKey = (req) => ipKeyGenerator(req.ip || req.socket?.remoteAddress || 'unknown', env.rateLimit.ipv6Subnet);
const fixedLimiter = (windowMs, limit, message, options = {}) => rateLimit({
  windowMs, limit, standardHeaders: 'draft-8', legacyHeaders: false,
  ...(options.keyGenerator ? {} : { ipv6Subnet: env.rateLimit.ipv6Subnet }), message: { message }, ...options,
});

// A generous perimeter limit. Authentication uses only the progressive limiter below.
const globalLimiter = fixedLimiter(env.rateLimit.globalWindowMs, env.rateLimit.globalMax,
  'Too many requests. Please slow down and try again later.', {
    skip: (req) => /^\/api\/auth(?:\/|$)/i.test(req.path),
  });
const publicLimiter = fixedLimiter(env.rateLimit.publicWindowMs, env.rateLimit.publicMax,
  'Too many browsing requests. Please try again in a few moments.');
const authenticatedLimiter = fixedLimiter(env.rateLimit.userWindowMs, env.rateLimit.userMax,
  'User action rate limit reached. Please wait before trying again.', {
    keyGenerator: (req) => req.user ? `user:${req.user.id}` : ipKey(req),
  });
const uploadLimiter = fixedLimiter(env.rateLimit.uploadWindowMs, env.rateLimit.uploadMax,
  'Upload rate limit reached. Please wait before uploading more files.');

// Single-process storage. Multiple replicas must use a shared store/edge limiter.
// Admission is synchronous, before any database or password hashing work: concurrent
// requests cannot race past the threshold. All attempts count, irrespective of whether
// the account exists or authentication succeeds. Success never clears an IP's budget.
const createBackoffStore = ({ windowMs, baseMs, maxMs, maxEntries, now = Date.now }) => {
  const records = new Map();
  let nextSweep = 0;
  const admit = (key, threshold) => {
    const time = now();
    if (time >= nextSweep) {
      for (const [entry, record] of records) {
        if (time >= record.expiresAt && time >= record.blockedUntil) records.delete(entry);
      }
      nextSweep = time + Math.min(windowMs, maxMs);
    }
    let record = records.get(key);
    if (record && time >= record.expiresAt && time >= record.blockedUntil) {
      records.delete(key);
      record = undefined;
    }
    if (record?.blockedUntil > time) return { allowed: false, retryMs: record.blockedUntil - time };
    if (!record) {
      // Never evict active counters to accommodate an attack using new identities.
      if (records.size >= maxEntries) return { allowed: false, retryMs: maxMs, capacity: true };
      record = { count: 0, blockedUntil: 0, expiresAt: 0 };
      records.set(key, record);
    }
    record.count += 1;
    record.expiresAt = time + windowMs;
    if (record.count >= threshold) {
      const delay = Math.min(baseMs * (2 ** Math.min(record.count - threshold, 30)), maxMs);
      record.blockedUntil = time + delay;
    }
    return { allowed: true };
  };
  return { admit };
};

const storeOptions = {
  windowMs: env.rateLimit.authWindowMs,
  baseMs: env.rateLimit.authBackoffBaseMs,
  maxMs: env.rateLimit.authBackoffMaxMs,
  maxEntries: env.rateLimit.authAttemptMapMaxEntries,
};
const ips = createBackoffStore(storeOptions);
const accounts = createBackoffStore(storeOptions);
const respondOrNext = (decision, res, next) => {
  if (decision.allowed) return next();
  const retryAfter = Math.max(1, Math.ceil(decision.retryMs / 1000));
  res.setHeader('Retry-After', retryAfter);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(decision.capacity ? 503 : 429).json({
    message: 'Too many authentication attempts. Please wait before trying again.', retryAfter,
  });
};

// Run before validation so malformed requests consume the IP budget as well.
const authIpLimiter = (req, res, next) => respondOrNext(
  ips.admit(ipKey(req), env.rateLimit.authIpAttemptMax), res, next
);

// Run after validation/canonicalization. Scope is explicit, independent of URL case,
// aliases or trailing slashes; login and admin/login deliberately share a scope.
const authAccountLimiter = (scope, identity, threshold = env.rateLimit.authAccountAttemptMax) => (req, res, next) => {
  let value;
  try { value = identity(req); } catch (error) { return next(error); }
  if (!value) return next();
  const key = crypto.createHmac('sha256', env.jwtAccessSecret)
    .update(`${scope}:${value}`).digest('hex');
  return respondOrNext(accounts.admit(key, threshold), res, next);
};

module.exports = { globalLimiter, publicLimiter, authenticatedLimiter, uploadLimiter,
  authIpLimiter, authAccountLimiter, createBackoffStore };
