/**
 * Global Error Handler Middleware
 * Centralized error handling for all routes
 */

const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

const errorHandler = (err, req, res, next) => {
  // Log error
  console.error('❌ Error:', err);

  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_ERROR;
  let message = err.message || ERROR_MESSAGES.INTERNAL_ERROR;
  let details = err.details || null;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    details = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT;
    message = `Duplicate field: ${Object.keys(err.keyValue)[0]}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Invalid token';
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = 'Token expired';
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `File upload error: ${err.message}`;
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString(),
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler,
};
