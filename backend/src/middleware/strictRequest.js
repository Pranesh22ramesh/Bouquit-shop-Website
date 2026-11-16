const isPlainObject = (value) => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const strictRequest = ({ body = [], query = [], params = [], nestedBody = {}, bodyStrings = false } = {}) => (req, res, next) => {
  const invalid = [];
  const check = (value, allowed, source, nested = {}) => {
    if (value === undefined) return;
    if (!isPlainObject(value)) {
      invalid.push(source);
      return;
    }
    const allowedSet = new Set(allowed);
    for (const key of Object.keys(value)) {
      if (!allowedSet.has(key)) {
        invalid.push(`${source}.${key}`);
        continue;
      }
      if (['query', 'params'].includes(source) && typeof value[key] !== 'string') invalid.push(`${source}.${key}`);
      if (source === 'body' && bodyStrings && typeof value[key] !== 'string') invalid.push(`body.${key}`);
      if (nested[key]) {
        const child = value[key];
        if (!isPlainObject(child)) {
          invalid.push(`${source}.${key}`);
        } else {
          for (const childKey of Object.keys(child)) {
            if (!nested[key].includes(childKey)) invalid.push(`${source}.${key}.${childKey}`);
          }
        }
      }
    }
  };

  check(req.body, body, 'body', nestedBody);
  check(req.query, query, 'query');
  check(req.params, params, 'params');

  if (invalid.length) {
    return res.status(400).json({
      message: 'Request contains unsupported or incorrectly typed fields.',
      errors: [...new Set(invalid)].map((field) => ({ field, message: 'Unexpected field or invalid shape' })),
    });
  }
  return next();
};

module.exports = { strictRequest };
