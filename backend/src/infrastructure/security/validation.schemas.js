const Joi = require('joi');

const signupBase = {
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  password_confirm: Joi.string().valid(Joi.ref('password')).required(),
  phone_number: Joi.string().min(10).max(15).required(),
  country: Joi.string().optional(),
  state: Joi.string().optional(), 
  gender: Joi.string().optional(),
  note: Joi.string().optional(),
  image_url: Joi.string().uri().optional(),
};

const signupCustomerSchema = Joi.object(signupBase);

const signupVendorSchema = Joi.object({
  ...signupBase,
  address: Joi.string().required(),
  state: Joi.string().required(),
  city: Joi.string().required(),
  store_name: Joi.string().min(3).required(),
  store_image: Joi.string().uri().optional(),
  business_type: Joi.string().valid('individual business', 'registered business').optional(),
  description: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const verifyOTPSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(),
});

const resendOTPSchema = Joi.object({
  email: Joi.string().email().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  code: Joi.string().length(6).required(),
  password: Joi.string().min(8).required(),
  password_confirm: Joi.string().valid(Joi.ref('password')).required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const logoutSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  first_name: Joi.string().min(2).max(50).optional(),
  last_name: Joi.string().min(2).max(50).optional(),
  phone_number: Joi.string().min(10).max(15).optional(),
  gender: Joi.string().optional(),
  note: Joi.string().optional(),
  image_url: Joi.string().uri().optional(),
  country: Joi.string().optional(),
  state: Joi.string().optional(),
  city: Joi.string().optional(),
  address: Joi.string().optional(),
  store_name: Joi.string().min(3).optional(),
  store_image: Joi.string().uri().optional(),
  business_type: Joi.string().valid('individual business', 'registered business').optional(),
  description: Joi.string().optional(),
  billing_address: Joi.array().items(Joi.object()).optional(),
  notifications: Joi.array().items(Joi.object({
    type: Joi.string().valid('email', 'push').required(),
    is_enabled: Joi.boolean().required(),
  })).optional(),
}).min(1); // At least one field to update

module.exports = {
  signupCustomerSchema,
  signupVendorSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshSchema,
  logoutSchema,
  updateProfileSchema,
};