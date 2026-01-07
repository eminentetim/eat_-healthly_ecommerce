// src/utils/apiError.js
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational; // Trusted error (e.g., validation) vs unexpected
    this.name = this.constructor.name;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Common factory methods
  static BadRequest(message = 'Bad Request') {
    return new ApiError(400, message);
  }

  static Unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static Forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static NotFound(message = 'Resource Not Found') {
    return new ApiError(404, message);
  }

  static Conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  static UnprocessableEntity(message = 'Unprocessable Entity') {
    return new ApiError(422, message);
  }

  static TooManyRequests(message = 'Too Many Requests') {
    return new ApiError(429, message);
  }

  static Internal(message = 'Internal Server Error') {
    return new ApiError(500, message, false);
  }
}

module.exports = ApiError;