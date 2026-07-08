const { Prisma } = require('@prisma/client');
const { ApiError } = require('../utils/apiError');

const errorHandler = (error, req, res, next) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details,
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return res.status(409).json({
      message: 'A record with that value already exists',
      details: error.meta,
    });
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    ['P1001', 'P1002', 'P2024'].includes(error.code)
  ) {
    console.error(`Database temporarily unavailable (${error.code})`, error.meta || '');
    return res.status(503).json({
      message: 'The store database is temporarily unavailable. Please try again in a moment.',
    });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Image size must be 5MB or smaller' });
  }

  if (error.code === 'INVALID_IMAGE_TYPE') {
    return res.status(400).json({ message: 'Only JPG, PNG, and WEBP images are allowed' });
  }

  console.error(error);
  return res.status(500).json({
    message: envAwareMessage(error),
  });
};

const envAwareMessage = (error) =>
  process.env.NODE_ENV === 'production'
    ? 'Something went wrong'
    : error.message || 'Something went wrong';

module.exports = { errorHandler };
