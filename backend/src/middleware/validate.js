// src/middleware/validate.js
const ApiError = require('../utils/apiError');

/**
 * Validate request body/query/params using Joi schema
 * @param {Joi.Schema} schema
 * @param {string} source - 'body' | 'query' | 'params'
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      errors: { label: 'key', wrap: { label: false } },
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join(', ');
      throw ApiError.BadRequest(`Validation error: ${errorMessages}`);
    }

    // Replace original data with sanitized value
    req[source] = value;
    next();
  };
};

module.exports = { validate };