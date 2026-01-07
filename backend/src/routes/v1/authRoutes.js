// src/routes/v1/authRoutes.js
const express = require('express');
const router = express.Router();

const authController = require('../../controllers/authController');
const { validate } = require('../../middleware/validate');
const authValidator = require('../../validators/authValidator');
const { auth } = require('../../middleware/auth');
const { authLimiter, otpLimiter } = require('../../config/rateLimiter');

// ← ADD THIS LINE
const { uploadSingleImage, uploadMultipleImages } = require('../../middleware/upload');

// Example routes (add upload middleware where needed)
router.post('/signup', authLimiter, validate(authValidator.signup), authController.signup);
router.post('/verify-otp', otpLimiter, validate(authValidator.verifyOtp), authController.verifyOtp);
router.post('/complete-profile', auth, validate(authValidator.completeProfile), authController.completeProfile);

// Example: Profile picture upload (you can add this route later)
router.patch(
  '/me/profile-picture',
  auth,
  uploadSingleImage('image'), // 'image' is the field name in form-data
  authController.updateProfilePicture // create this handler later
);

router.post('/login', authLimiter, validate(authValidator.login), authController.login);
router.post('/forgot-password', otpLimiter, validate(authValidator.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidator.resetPassword), authController.resetPassword);
router.post('/refresh-token', validate(authValidator.refreshToken), authController.refreshToken);
router.post('/logout', auth, authController.logout);

module.exports = router;