const crypto = require('crypto');
const config = require('../../config');
const { redisClient } = require('../../infrastructure/cache/redis.client');
const logger = require('../../common/utils/logger');

class OTPService {
  static generateOTP() {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < config.otp.length; i++) {
      otp += digits[Math.floor(crypto.randomInt(0, digits.length))];
    }
    return otp;
  }

  static async storeOTP(email, otp) {
    const key = `otp:${email.toLowerCase()}`;
    await redisClient.setEx(key, config.otp.expiresIn, otp);
    logger.info(`OTP stored for ${email} (expires in ${config.otp.expiresIn}s)`);
  }

  static async verifyOTP(email, otp) {
    const key = `otp:${email.toLowerCase()}`;
    const storedOTP = await redisClient.get(key);
    
    if (!storedOTP) {
      return { valid: false, message: 'OTP expired or not found' };
    }

    if (storedOTP !== otp) {
      return { valid: false, message: 'Invalid OTP' };
    }

    // Delete OTP after successful verification
    await redisClient.del(key);
    return { valid: true, message: 'OTP verified successfully' };
  }
}

module.exports = OTPService;