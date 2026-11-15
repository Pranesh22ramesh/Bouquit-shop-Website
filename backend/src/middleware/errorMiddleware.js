const crypto = require('crypto');
const { Prisma } = require('@prisma/client');
const { ApiError } = require('../utils/apiError');
const { env } = require('../config/env');

/**
 * Production-grade Centralized Error Handling Middleware.
 * - Prevents all information leakage (stack traces, internal paths, raw DB queries).
 * - Maps database errors and authentication failures to safe, semantic HTTP status codes.
 * - Logs full diagnostics and stack traces server-side with unique correlation IDs.
 */
const errorHandler = (error, req, res, next) => {
  const errorId = crypto.randomUUID().slice(0, 8);

  // 1. Handled Operational Errors (ApiError)
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  // 2. Prisma Database Specific Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`[DATABASE_ERROR][${errorId}] ${req.method} ${req.baseUrl}${req.route?.path || '/unknown'} | IP: ${req.ip} |`, error.stack || error);
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
      console.error(`[DB_UNAVAILABLE][${errorId}] ${req.method} ${req.baseUrl}${req.route?.path || '/unknown'} | IP: ${req.ip} |`, error.stack || error);
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
      message: `File size must be ${Math.ceil(env.upload.maxFileBytes / (1024 * 1024))}MB or smaller.`,
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

  if (['LIMIT_FIELD_COUNT', 'LIMIT_PART_COUNT'].includes(error.code)) {
    return res.status(400).json({ message: 'Too many form fields in a single request.' });
  }

  if (error.code === 'LIMIT_FIELD_VALUE') {
    return res.status(413).json({ message: 'A form field is too large.' });
  }

  if (error.code === 'INVALID_IMAGE_TYPE') {
    return res.status(400).json({
      message: 'Only genuine JPG, PNG, and WebP images are allowed.',
    });
  }

  if (error.code === 'INVALID_IMAGE_CONTENT') {
    return res.status(400).json({ message: 'Uploaded file is not a valid supported image.' });
  }

  if (error.status === 413 || error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request payload is too large.' });
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
    `[SERVER_ERROR][${errorId}] ${req.method} ${req.baseUrl}${req.route?.path || '/unknown'} | IP: ${req.ip} | Error:`,
    error.stack || error
  );

  return res.status(500).json({
    message: 'An unexpected error occurred. Please try again later.',
    errorId,
  });
};

module.exports = { errorHandler };
