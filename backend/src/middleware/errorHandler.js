// src/middleware/errorHandler.js
const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');
const { NODE_ENV } = process.env;

const errorHandler = (err, req, res, next) => {
  let error = err;

  // === Handle known Mongoose errors ===
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors)
      .map(e => e.message)
      .join('; ');
    error = ApiError.BadRequest(`Validation error: ${messages}`);
  }

  // === Handle duplicate key (MongoDB E11000) ===
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    error = ApiError.Conflict(`${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`);
  }

  // === Handle CastError (invalid ObjectId) ===
  if (err.name === 'CastError') {
    error = ApiError.BadRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // === Handle JWT errors ===
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.Unauthorized('Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    error = ApiError.Unauthorized('Token expired');
  }

  // === If it's already our custom ApiError, use it directly ===
  if (!(error instanceof ApiError)) {
    // Unexpected error → mark as non-operational
    error = ApiError.Internal('An unexpected error occurred');
    error.originalError = err; // Keep reference for logging
  }

  // === Log appropriately ===
  if (error.isOperational) {
    // Trusted error — safe to expose message
    logger.warn('Operational error', {
      message: error.message,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?.sub || 'unauthenticated',
    });
  } else {
    // Unexpected error — log full stack
    logger.error('Unexpected error', {
      message: error.message,
      stack: error.stack || err.originalError?.stack,
      originalError: error.originalError?.message,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?.sub || 'unauthenticated',
    });
  }

  // === Final response ===
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message,
    // Only include stack trace in development
    ...(NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = errorHandler;