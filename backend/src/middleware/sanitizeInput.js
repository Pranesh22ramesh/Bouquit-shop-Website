const UNSAFE_TEXT = /(?:<\s*\/?\s*(?:script|iframe|object|embed)\b|javascript\s*:|<[^>]+\bon[a-z]+\s*=)/i;
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

const inspectValue = (value, path, invalid, depth = 0) => {
  if (invalid.length >= 20) return;
  if (depth > 12) { invalid.push(path); return; }
  if (typeof value === 'string') {
    // Passwords are opaque credentials, never rendered as markup.
    if (!/\.(?:password|confirmPassword)$/.test(path) && UNSAFE_TEXT.test(value)) invalid.push(path);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectValue(item, `${path}[${index}]`, invalid, depth + 1));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (FORBIDDEN_KEYS.has(key)) invalid.push(`${path}.${key}`);
      inspectValue(child, `${path}.${key}`, invalid, depth + 1);
    }
  }
};

// Reject unsafe input in place instead of silently rewriting it before validation.
const sanitizeInput = (req, res, next) => {
  const invalid = [];
  inspectValue(req.body, 'body', invalid);
  inspectValue(req.query, 'query', invalid);
  inspectValue(req.params, 'params', invalid);
  if (invalid.length) {
    return res.status(400).json({
      message: 'Request contains invalid input.',
      errors: [...new Set(invalid)].map((field) => ({ field, message: 'Unsupported value' })),
    });
  }
  return next();
};

module.exports = { sanitizeInput };
