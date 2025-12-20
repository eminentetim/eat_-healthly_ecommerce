const { Resend } = require('resend');
const config = require('../../config');
const logger = require('../../common/utils/logger');

const resend = new Resend(config.resend.apiKey);

class EmailService {
  static async sendOTP(email, otp) {
    try {
      const { data, error } = await resend.emails.send({
        from: config.resend.fromEmail,
        to: [email],
        subject: 'Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #2e7d32;">Verify Your Email</h2>
            <p>Your verification code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 8px; color: #2e7d32;">${otp}</h1>
            <p>This code will expire in <strong>${Math.floor(config.otp.expiresIn / 60)} minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });

      if (error) {
        logger.error('Resend error:', error);
        return { success: false, error };
      }

      logger.info(`OTP email sent to ${email}`);
      return { success: true, data };
    } catch (err) {
      logger.error('Failed to send email:', err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = EmailService;