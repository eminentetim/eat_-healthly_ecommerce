// src/validators/authValidator.js
const Joi = require('joi');
const { Role } = require('../config/constants');
const { evaluatePasswordStrength } = require('../utils/passwordStrength');

const passwordComplexity = (value, helpers) => {
  const userInputs = [
    helpers.state.ancestors[0]?.email || '',
    helpers.state.ancestors[0]?.first_name || '',
    helpers.state.ancestors[0]?.last_name || '',
    helpers.state.ancestors[0]?.phone_number || '',
  ].map(s => s.toLowerCase());

  const strength = evaluatePasswordStrength(value, userInputs);

  if (!strength.valid) {
    return helpers.message(`Password too weak: ${strength.feedback}`);
  }

  return value;
};

module.exports = {
  signup: Joi.object({
    email: Joi.string().email().required(),
    phone_number: Joi.string().pattern(/^[+]?[0-9]{10,15}$/).required(),
    password: Joi.string()
      .min(8)
      .custom(passwordComplexity, 'strong password validation')
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
      }),
    password_confirm: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Passwords do not match',
      }),
    role: Joi.string().valid(Role.CUSTOMER, Role.VENDOR).default(Role.CUSTOMER),
  }),

  completeProfile: Joi.object({
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    state: Joi.string().optional(),
    country: Joi.string().default('Nigeria'),
    note: Joi.string().allow('').optional(),
    store_name: Joi.string().min(3).max(100).when('$role', {
      is: Role.VENDOR,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    address: Joi.string().min(10).when('$role', {
      is: Role.VENDOR,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    city: Joi.string().when('$role', {
      is: Role.VENDOR,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    business_type: Joi.string()
      .valid('individual business', 'registered business')
      .optional(),
    description: Joi.string().max(500).optional(),
    store_image: Joi.string().uri().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^[0-9]{6}$/).required(),
    password: Joi.string()
      .min(8)
      .custom(passwordComplexity, 'strong password validation')
      .required(),
    password_confirm: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({ 'any.only': 'Passwords do not match' }),
  }),

  // ... other validators


  // 2. Verify OTP only
  verifyOtp: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^[0-9]{6}$/).required().messages({
      'string.length': 'OTP must be 6 digits',
      'string.pattern.base': 'OTP must contain only digits',
    }),
  }),

  
  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),


  refreshToken: Joi.object({
    refresh_token: Joi.string().required(),
  }),
};