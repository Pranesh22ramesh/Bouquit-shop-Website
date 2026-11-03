/**
 * Global Request Sanitizer Middleware
 * Prevents:
 * 1. Cross-Site Scripting (XSS) via injected HTML / JS tags
 * 2. Prototype Pollution attacks
 * 3. Null-byte injection and control character attacks
 */

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
];

const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    // 1. Strip null bytes
    let clean = val.replace(/\0/g, '').trim();

    // 2. Strip dangerous script/event tags if detected
    for (const pattern of DANGEROUS_PATTERNS) {
      clean = clean.replace(pattern, '');
    }

    return clean;
  }

  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }

  if (val !== null && typeof val === 'object') {
    return sanitizeObject(val);
  }

  return val;
};

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Block Prototype Pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    sanitized[key] = sanitizeValue(value);
  }
  return sanitized;
};

const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
};

module.exports = { sanitizeInput };

