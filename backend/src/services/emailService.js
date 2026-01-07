// src/services/emailService.js
const { resend } = require('../config/resend');
const logger = require('../utils/logger');
const ApiError = require('../utils/apiError');

/**
 * Send raw email (for custom use)
 */
const sendEmail = async (to, subject, html, text = null) => {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Organic Marketplace <noreply@organicmarketplace.com>',
      to: [to],
      subject,
      html,
      text,
    });

    logger.info('Email sent successfully via Resend', { emailId: data.id, to, subject });
    return data;
  } catch (error) {
    logger.error('Failed to send email', {
      to,
      subject,
      error: error.message,
      response: error.response?.body,
    });
    throw ApiError.Internal('Failed to send email');
  }
};

/**
 * Send OTP email (high priority)
 */
const sendOtpEmail = async (to, otp, purpose = 'verification') => {
  const subject =
    purpose === 'password_reset'
      ? 'Reset Your Password - Organic Marketplace'
      : 'Verify Your Email - Organic Marketplace';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2e7d32;">Organic Marketplace</h2>
      <p>Hello,</p>
      <p>Your one-time verification code is:</p>
      <h1 style="font-size: 32px; letter-spacing: 8px; text-align: center; color: #2e7d32; background: #f1f8e9; padding: 20px; border-radius: 8px;">
        ${otp}
      </h1>
      <p>This code expires in <strong>5 minutes</strong>.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #666;">&copy; 2026 Organic Marketplace. All rights reserved.</p>
    </div>
  `;

  await sendEmail(to, subject, html);
};

/**
 * Send templated transactional email
 * Templates: order_confirmation, order_status_update, wallet_credit, withdrawal_approved, etc.
 */
const sendTemplatedEmail = async (to, subject, templateName, data = {}) => {
  const templates = {
    order_confirmation: {
      subject: `Order Confirmed - #${data.order?.order_number || 'XXXX'}`,
      getHtml: () => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #2e7d32;">Thank You for Your Order!</h2>
          <p>Your order <strong>#${data.order.order_number}</strong> has been confirmed.</p>
          <p>Total: <strong>₦${data.order.total_amount.toLocaleString()}</strong></p>
          <p>We’ll notify you when it ships.</p>
          <a href="${process.env.CLIENT_URL}/orders/${data.order._id}" 
             style="display: inline-block; padding: 12px 24px; background: #2e7d32; color: white; text-decoration: none; border-radius: 6px;">
            View Order
          </a>
        </div>
      `,
    },

    order_status_update: {
      subject: `Order Update - #${data.order?.order_number}`,
      getHtml: () => `
        <div style="font-family: Arial, sans-serif;">
          <h2>Order Status Updated</h2>
          <p>Your order <strong>#${data.order.order_number}</strong> is now <strong>${data.order.status}</strong>.</p>
          <a href="${process.env.CLIENT_URL}/orders/${data.order._id}">Track Order</a>
        </div>
      `,
    },

    wallet_credit: {
      subject: 'Wallet Credited Successfully',
      getHtml: () => `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #2e7d32;">Wallet Updated</h2>
          <p>₦${data.transaction.amount.toLocaleString()} has been credited to your wallet.</p>
          <p>Balance: ₦${data.transaction.new_balance?.toLocaleString() || 'N/A'}</p>
          <p>Reason: ${data.transaction.description || 'Order earnings'}</p>
        </div>
      `,
    },

    withdrawal_approved: {
      subject: 'Withdrawal Approved & Processed',
      getHtml: () => `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #2e7d32;">Withdrawal Successful</h2>
          <p>₦${data.transaction.amount.toLocaleString()} has been sent to your bank account.</p>
          <p>Reference: ${data.transaction.reference}</p>
          <p>Thank you for selling on Organic Marketplace!</p>
        </div>
      `,
    },

    vendor_approved: {
      subject: 'Your Vendor Account Has Been Approved!',
      getHtml: () => `
        <div style="font-family: Arial, sans-serif;">
          <h2 style="color: #2e7d32;">Welcome to Organic Marketplace!</h2>
          <p>Congratulations! Your vendor account has been approved.</p>
          <p>You can now start listing products and selling.</p>
          <a href="${process.env.CLIENT_URL}/vendor/dashboard" 
             style="background: #2e7d32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
            Go to Dashboard
          </a>
        </div>
      `,
    },
  };

  const template = templates[templateName];
  if (!template) {
    throw new Error(`Email template "${templateName}" not found`);
  }

  const finalSubject = typeof template.subject === 'function' ? template.subject() : template.subject;
  const html = typeof template.getHtml === 'function' ? template.getHtml() : template.getHtml;

  await sendEmail(to, finalSubject, html);
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendTemplatedEmail,
};