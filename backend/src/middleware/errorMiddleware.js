const { Prisma } = require('@prisma/client');
const { ApiError } = require('../utils/apiError');

const errorHandler = (error, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      ...(isProduction ? {} : { details: error.details }),
    });
  }

  // Handle unique constraint violations without leaking schema info
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return res.status(409).json({
      message: 'A record with that value already exists.',
    });
  }

  // Handle temporary database connection issues gracefully
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    ['P1001', 'P1002', 'P2024'].includes(error.code)
  ) {
    console.error(`Database temporarily unavailable (${error.code})`);
    return res.status(503).json({
      message: 'The store database is temporarily unavailable. Please try again in a moment.',
    });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON payload provided.' });
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Image size must be 10MB or smaller.' });
  }

  if (error.code === 'INVALID_IMAGE_TYPE') {
    return res.status(400).json({ message: 'Only genuine JPG, PNG, and WebP images are allowed.' });
  }

  // Unexpected internal server error: log securely on server, hide internal details from client
  console.error('Unhandled Server Error:', error.message || error);
  return res.status(500).json({
    message: isProduction ? 'An unexpected error occurred. Please try again later.' : error.message,
  });
};

module.exports = { errorHandler };
