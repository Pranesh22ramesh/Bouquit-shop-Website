const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  return res.status(400).json({
    message: 'Validation failed',
    errors: result.array().map((entry) => ({
      field: entry.path,
      message: entry.msg,
    })),
  });
};

module.exports = { validateRequest };
