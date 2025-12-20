const User = require('../../infrastructure/database/mongodb/models/User.model');
const OTPService = require('../../application/services/otp.service');
const EmailService = require('../../application/services/email.service');
const JWTService = require('../../infrastructure/security/jwt.service');
const logger = require('../../common/utils/logger');

const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create inactive user
      user = new User({ email: email.toLowerCase(), isActive: false });
      await user.save();
    }

    if (user.isActive) {
      return res.status(400).json({ message: 'User already verified' });
    }

    const otp = OTPService.generateOTP();
    await OTPService.storeOTP(email, otp);
    const emailResult = await EmailService.sendOTP(email, otp);

    if (!emailResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    logger.error('Send OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const { valid, message } = await OTPService.verifyOTP(email, otp);
    if (!valid) {
      return res.status(400).json({ message });
    }

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isActive: true },
      { new: true }
    );

    const token = JWTService.sign(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    logger.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { sendOTP, verifyOTP };