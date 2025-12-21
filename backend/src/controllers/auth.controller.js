const AuthService = require('../application/services/auth.service');
const {
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
} = require('../infrastructure/security/validation.schemas');
const AppError = require('../common/errors/AppError');
const logger = require('../common/utils/logger');

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false });
  if (error) {
    throw new AppError(error.details.map(d => d.message).join(', '), 400);
  }
  return value;
};

const signupCustomer = async (req, res) => {
  const data = validate(signupCustomerSchema, req.body);
  const user = await AuthService.signupCustomer(data);
  res.status(201).json({
    message: 'Customer registered. Please verify OTP.',
    user: { id: user._id, email: user.email },
  });
};

const signupVendor = async (req, res) => {
  const data = validate(signupVendorSchema, req.body);
  const user = await AuthService.signupVendor(data);
  res.status(201).json({
    message: 'Vendor registered. Awaiting admin approval after OTP verification.',
    user: { id: user._id, email: user.email },
  });
};

const verifyOTP = async (req, res) => {
  const data = validate(verifyOTPSchema, req.body);
  const user = await AuthService.verifyOTP(data);
  const tokens = await AuthService.generateTokens(user);
  res.status(200).json({
    message: 'OTP verified successfully',
    user: { id: user._id, email: user.email, role: user.role },
    ...tokens,
  });
};

const resendOTP = async (req, res) => {
  const data = validate(resendOTPSchema, req.body);
  await AuthService.resendOTP(data);
  res.status(200).json({ message: 'OTP resent successfully' });
};

const login = async (req, res) => {
  const data = validate(loginSchema, req.body);
  const user = await AuthService.login(data);
  const tokens = await AuthService.generateTokens(user);
  res.status(200).json({
    message: 'Login successful',
    user: { id: user._id, email: user.email, role: user.role },
    ...tokens,
  });
};

const forgotPassword = async (req, res) => {
  const data = validate(forgotPasswordSchema, req.body);
  await AuthService.forgotPassword(data);
  res.status(200).json({ message: 'Reset OTP sent' });
};

const resetPassword = async (req, res) => {
  const data = validate(resetPasswordSchema, req.body);
  await AuthService.resetPassword(data);
  res.status(200).json({ message: 'Password reset successfully' });
};

const refresh = async (req, res) => {
  const data = validate(refreshSchema, req.body);
  const tokens = await AuthService.refreshToken(data);
  res.status(200).json(tokens);
};

const logout = async (req, res) => {
  const data = validate(logoutSchema, req.body);
  await AuthService.logout(data);
  res.status(200).json({ message: 'Logged out successfully' });
};

const updateProfile = async (req, res) => {
  const data = validate(updateProfileSchema, req.body);
  const user = await AuthService.updateProfile(req.user._id, data);
  res.status(200).json({
    message: 'Profile updated successfully',
    user,
  });
};

module.exports = {
  signupCustomer,
  signupVendor,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  refresh,
  logout,
  updateProfile,
};