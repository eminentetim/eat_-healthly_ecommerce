const ms = require('ms');
const dayjs = require('dayjs');
const config = require('../../config');
const AppError = require('../../common/errors/AppError');
const User = require('../../infrastructure/database/mongodb/models/User.model');
const OTPService = require('./otp.service');
const EmailService = require('./email.service');
const JWTService = require('../../infrastructure/security/jwt.service');
const { redisClient } = require('../../infrastructure/cache/redis.client');
const { Role, Status } = require('../../common/constants');
const logger = require('../../common/utils/logger');
const crypto = require('crypto');

class AuthService {
  static async signupCustomer(data) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const user = new User({
      ...data,
      role: Role.CUSTOMER,
      full_name: `${data.first_name} ${data.last_name}`,
      country: data.country || Country.NIGERIA,
      is_verified: false,
      password_confirm: data.password_confirm, // Triggers validation
    });

    await user.save();
    await this.sendVerificationOTP(user, 'verify');

    return user;
  }

  static async signupVendor(data) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const user = new User({
      ...data,
      role: Role.VENDOR,
      full_name: `${data.first_name} ${data.last_name}`,
      status: Status.PENDING,
      is_verified: false,
      password_confirm: data.password_confirm,
    });

    await user.save();
    await this.sendVerificationOTP(user, 'verify');

    return user;
  }

  static async sendVerificationOTP(user, type = 'verify') {
    const code = OTPService.generateOTP();
    user.verify_token = {
      code,
      user_id: user._id,
      expire_at: dayjs().add(config.otp.expiresIn, 'seconds').toDate(),
    };
    await user.save();

    const emailResult = await EmailService.sendOTP(user.email, code, type);
    if (!emailResult.success) {
      throw new AppError('Failed to send OTP', 500);
    }
  }

  static async verifyOTP({ email, code }) {
    const user = await User.findOne({ email }).select('+verify_token');
    if (!user || !user.verify_token || user.verify_token.code !== code || user.verify_token.expire_at < new Date()) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    user.is_verified = true;
    user.verify_token = null;
    await user.save();

    return user;
  }

  static async resendOTP({ email }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (user.is_verified) {
      throw new AppError('User already verified', 400);
    }

    await this.sendVerificationOTP(user, 'verify');
  }

  static async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }
    if (!user.is_verified) {
      throw new AppError('Please verify your email first', 403);
    }
    if (user.is_account_suspended || user.is_deleted) {
      throw new AppError('Account suspended or deleted', 403);
    }

    return user;
  }

  static async generateTokens(user) {
    const accessToken = JWTService.sign(user);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshExpiresInSeconds = ms(config.jwt.refreshExpiresIn) / 1000;

    await redisClient.set(`refresh:${refreshToken}`, user._id.toString(), 'EX', refreshExpiresInSeconds);

    return { accessToken, refreshToken };
  }

  static async forgotPassword({ email }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (!user.is_verified) {
      throw new AppError('Please verify your email first', 403);
    }

    await this.sendVerificationOTP(user, 'reset');
  }

  static async resetPassword({ email, code, password, password_confirm }) {
    const user = await User.findOne({ email }).select('+verify_token +password');
    if (!user || !user.verify_token || user.verify_token.code !== code || user.verify_token.expire_at < new Date()) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    user.password = password;
    user.password_confirm = password_confirm; // Triggers validation
    user.verify_token = null;
    await user.save();
  }

  static async refreshToken({ refreshToken }) {
    const userId = await redisClient.get(`refresh:${refreshToken}`);
    if (!userId) {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const newAccessToken = JWTService.sign(user);
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const refreshExpiresInSeconds = ms(config.jwt.refreshExpiresIn) / 1000;

    await redisClient.del(`refresh:${refreshToken}`);
    await redisClient.set(`refresh:${newRefreshToken}`, user._id.toString(), 'EX', refreshExpiresInSeconds);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  static async logout({ refreshToken }) {
    await redisClient.del(`refresh:${refreshToken}`);
  }

  static async updateProfile(userId, data) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update only allowed fields
    Object.keys(data).forEach(key => {
      if (key === 'full_name') return; // Derived
      if (key === 'billing_address' || key === 'notifications') {
        user[key] = data[key];
      } else {
        user[key] = data[key] !== undefined ? data[key] : user[key];
      }
    });

    if (data.first_name || data.last_name) {
      user.full_name = `${data.first_name || user.first_name} ${data.last_name || user.last_name}`;
    }

    await user.save();
    return user;
  }
}

module.exports = AuthService;