const express = require('express');
const {
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
} = require('../controllers/auth.controller');
const { protect } = require('../infrastructure/security/auth.middleware');

const router = express.Router();

router.post('/customer/signup', signupCustomer);
router.post('/vendor/signup', signupVendor);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password', resetPassword);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.patch('/profile', protect, updateProfile);

module.exports = router;