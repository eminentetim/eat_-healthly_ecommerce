// src/controllers/authController.js
const { User, Role } = require('../models/User');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const { generateOtp } = require('../utils/generateOtp');
const { signToken, verifyToken } = require('../utils/jwtUtils');
const { comparePassword } = require('../utils/hashPassword');
const logger = require('../utils/logger');
const { redisClient } = require('../config/redis');
const { sendOtpEmail } = require('../services/emailService');
const { emitInAppNotification } = require('../events/notificationEvents');
const { UserEvents } = require('../events/userEvents');
const { uploadImage, deleteImage } = require('../services/uploadService');
const fs = require('fs').promises;

const OTP_EXPIRY = 5 * 60;

// Helper to send OTP
const sendOtp = async (email, purpose = 'verification') => {
  const otp = generateOtp(6);
  const key = `otp:${purpose}:${email.toLowerCase()}`;
  await redisClient.setEx(key, OTP_EXPIRY, otp);
  await sendOtpEmail(email, otp, purpose);
};

// 1. Signup
const signup = async (req, res, next) => {
  try {
    const { email, phone_number, password, role = Role.CUSTOMER } = req.body;

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone_number }],
    });
    if (existing) return next(ApiError.Conflict('Email or phone already registered'));

    const user = await User.create({
      email: email.toLowerCase(),
      phone_number,
      password,
      role,
      is_verified: false,
    });

    await sendOtp(email, 'verification');
    UserEvents.emitUserRegistered(user);

    res.status(201).json(
      new ApiResponse.success('Account created. Please verify your email with OTP.', {
        user_id: user._id,
        email: user.email,
        role: user.role,
      })
    );
  } catch (err) {
    next(err);
  }
};

// 2. Verify OTP
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const key = `otp:verification:${email.toLowerCase()}`;
    const stored = await redisClient.get(key);

    if (!stored || stored !== otp) {
      return next(ApiError.BadRequest('Invalid or expired OTP'));
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return next(ApiError.NotFound('User not found'));
    if (user.is_verified) return next(ApiError.BadRequest('Email already verified'));

    user.is_verified = true;
    await user.save();
    await redisClient.del(key);

    UserEvents.emitUserVerified(user);

    const accessToken = signToken({ sub: user._id, role: user.role });
    const refreshToken = signToken(
      { sub: user._id, type: 'refresh', ver: user.refresh_token_version },
      '30d'
    );
    await redisClient.setEx(`refresh:${user._id}`, 30 * 24 * 3600, refreshToken);

    emitInAppNotification(user._id, 'Email Verified ✓', 'You can now complete your profile.');

    res.json(
      new ApiResponse.success('Email verified successfully. You can now complete your profile.', {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          is_verified: true,
        },
      })
    );
  } catch (err) {
    next(err);
  }
};

// 3. Complete Profile (Protected)
const completeProfile = async (req, res, next) => {
  try {
    const userId = req.user.sub;
    const profileData = req.body;

    const user = await User.findById(userId);
    if (!user) return next(ApiError.NotFound('User not found'));
    if (!user.is_verified) return next(ApiError.Forbidden('You must verify your email first'));
    if (user.first_name || user.last_name) {
      return next(ApiError.BadRequest('Profile already completed'));
    }

    if (user.role === Role.VENDOR) {
      user.status = 'pending';
    }

    Object.assign(user, profileData);
    await user.save();

    UserEvents.emitUserProfileCompleted(user);
    emitInAppNotification(
      user._id,
      'Profile Completed 🎉',
      `Welcome to Organic Marketplace, ${user.first_name}!`
    );

    res.json(
      new ApiResponse.success('Profile completed successfully', {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          full_name: user.full_name,
          profile_completed: true,
        },
      })
    );
  } catch (err) {
    next(err);
  }
};

// 4. Resend OTP
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.is_verified) {
      return next(ApiError.BadRequest('Cannot resend OTP'));
    }

    await sendOtp(email, 'verification');
    res.json(new ApiResponse.success('OTP resent successfully'));
  } catch (err) {
    next(err);
  }
};

// 5. Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.password || !user.is_verified || user.is_account_suspended) {
      return next(ApiError.Unauthorized('Invalid credentials or account not active'));
    }

    const match = await comparePassword(password, user.password);
    if (!match) return next(ApiError.Unauthorized('Invalid credentials'));

    const accessToken = signToken({ sub: user._id, role: user.role });
    const refreshToken = signToken(
      { sub: user._id, type: 'refresh', ver: user.refresh_token_version },
      '30d'
    );
    await redisClient.setEx(`refresh:${user._id}`, 30 * 24 * 3600, refreshToken);

    emitInAppNotification(user._id, 'Login Successful', 'You logged in from a new device.');

    res.json(
      new ApiResponse.success('Login successful', {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: { id: user._id, email: user.email, role: user.role },
      })
    );
  } catch (err) {
    next(err);
  }
};

// 6. Forgot Password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) await sendOtp(email, 'password_reset');

    res.json(new ApiResponse.success('If email exists, reset OTP has been sent'));
  } catch (err) {
    next(err);
  }
};

// 7. Reset Password
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    const key = `otp:password_reset:${email.toLowerCase()}`;
    const stored = await redisClient.get(key);
    if (!stored || stored !== otp) return next(ApiError.BadRequest('Invalid or expired OTP'));

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return next(ApiError.NotFound('User not found'));

    user.password = password;
    user.refresh_token_version += 1;
    await user.save();

    await redisClient.del(key);
    await redisClient.del(`refresh:${user._id}`);

    // Note: emitEmailNotification imported if needed
    // emitEmailNotification(email, 'Password Reset Successful', 'password_reset_success');

    res.json(new ApiResponse.success('Password reset successfully'));
  } catch (err) {
    next(err);
  }
};

// 8. Refresh Token
const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    let payload;
    try {
      payload = verifyToken(refresh_token);
    } catch {
      return next(ApiError.Unauthorized('Invalid refresh token'));
    }

    if (payload.type !== 'refresh') return next(ApiError.Unauthorized());

    const stored = await redisClient.get(`refresh:${payload.sub}`);
    if (stored !== refresh_token) return next(ApiError.Unauthorized('Token revoked'));

    const user = await User.findById(payload.sub);
    if (!user || user.refresh_token_version !== payload.ver) {
      return next(ApiError.Unauthorized('Token invalidated'));
    }

    const newAccess = signToken({ sub: user._id, role: user.role });
    const newRefresh = signToken(
      { sub: user._id, type: 'refresh', ver: user.refresh_token_version },
      '30d'
    );
    await redisClient.setEx(`refresh:${user._id}`, 30 * 24 * 3600, newRefresh);

    res.json(new ApiResponse.success('Tokens refreshed', { access_token: newAccess, refresh_token: newRefresh }));
  } catch (err) {
    next(err);
  }
};

// 9. Logout
const logout = async (req, res, next) => {
  try {
    await redisClient.del(`refresh:${req.user.sub}`);
    res.json(new ApiResponse.success('Logged out successfully'));
  } catch (err) {
    next(err);
  }
};

// 10. Update Profile Picture
const updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) return next(ApiError.BadRequest('No image file provided'));

    const user = await User.findById(req.user.sub);
    if (!user) return next(ApiError.NotFound('User not found'));

    const result = await uploadImage(req.file.path, {
      folder: 'profiles',
      public_id: `profile_${user._id}`,
    });

    if (user.cloudinary_public_id) {
      await deleteImage(user.cloudinary_public_id).catch(() => {});
    }

    user.image_url = result.url;
    user.cloudinary_public_id = result.public_id;
    await user.save();

    await fs.unlink(req.file.path);

    res.json(
      new ApiResponse.success('Profile picture updated successfully', {
        image_url: result.url,
        thumbnail: result.url.replace('/upload/', '/upload/c_fill,w_200,h_200/'),
      })
    );
  } catch (err) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    next(err);
  }
};

module.exports = {
  signup,
  verifyOtp,
  completeProfile,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  updateProfilePicture,
};