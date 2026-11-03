const crypto = require('crypto');
const { Prisma } = require('@prisma/client');
const { ApiError } = require('../utils/apiError');

/**
 * Production-grade Centralized Error Handling Middleware.
 * - Prevents all information leakage (stack traces, internal paths, raw DB queries).
 * - Maps database errors and authentication failures to safe, semantic HTTP status codes.
 * - Logs full diagnostics and stack traces server-side with unique correlation IDs.
 */
const errorHandler = (error, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const errorId = crypto.randomUUID().slice(0, 8);

  // 1. Handled Operational Errors (ApiError)
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
      ...(isProduction ? {} : { details: error.details }),
    });
  }

  // 2. Prisma Database Specific Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation (e.g. duplicate email)
    if (error.code === 'P2002') {
      return res.status(409).json({
        message: 'A record with that unique detail already exists.',
      });
    }

    // Record to update/delete does not exist
    if (error.code === 'P2025') {
      return res.status(404).json({
        message: 'The requested resource was not found.',
      });
    }

    // Foreign key constraint failure
    if (error.code === 'P2003') {
      return res.status(400).json({
        message: 'Invalid reference to a related resource.',
      });
    }

    // Database connection / pool exhaustion / timeout
    if (['P1001', 'P1002', 'P1017', 'P2024'].includes(error.code)) {
      console.error(`[DB_UNAVAILABLE][${errorId}] Connection issue (${error.code}) from ${req.ip}`);
      return res.status(503).json({
        message: 'The database is temporarily unavailable. Please try again shortly.',
        errorId,
      });
    }
  }

  // 3. JWT Token Verification Errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid or malformed authentication token. Please log in again.',
    });
  }
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Your session has expired. Please log in again.',
    });
  }

  // 4. Payload and File Upload Errors
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'Invalid JSON request payload provided.',
    });
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'File size must be 10MB or smaller.',
    });
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      message: 'Too many files uploaded in a single request.',
    });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      message: 'Unexpected file field provided in upload request.',
    });
  }

  if (error.code === 'INVALID_IMAGE_TYPE') {
    return res.status(400).json({
      message: 'Only genuine JPG, PNG, and WebP images are allowed.',
    });
  }

  // 5. CORS Rejection
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      message: 'Origin not allowed by CORS policy.',
    });
  }

  // 6. Unhandled Internal Server Errors
  // Log full stack trace and request context on server only
  console.error(
    `[SERVER_ERROR][${errorId}] ${req.method} ${req.originalUrl} | IP: ${req.ip} | Error:`,
    error.stack || error
  );

  return res.status(500).json({
    message: isProduction
      ? 'An unexpected error occurred. Please try again later.'
      : (error.message || 'Internal server error'),
    errorId,
  });
};

module.exports = { errorHandler };
