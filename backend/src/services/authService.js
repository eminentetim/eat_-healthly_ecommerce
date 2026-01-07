// src/services/authService.js
const { User, Role } = require('../models/User');
const logger = require('../utils/logger');
const { hashPassword } = require('../utils/hashPassword');

const initializeAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@organicmarketplace.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'SecureAdminPass2026!';

  try {
    const existing = await User.findOne({ email: adminEmail, role: Role.ADMIN });
    if (existing) {
      logger.info('Admin already exists');
      return;
    }

    const hashed = await hashPassword(adminPassword);

    await User.create({
      email: adminEmail,
      phone_number: process.env.ADMIN_PHONE || '08000000000',
      password: hashed,
      first_name: 'System',
      last_name: 'Admin',
      role: Role.ADMIN,
      is_verified: true,
      country: 'Nigeria',
    });

    logger.info('Default Admin created');
  } catch (error) {
    logger.error('Admin init failed', { error: error.message });
  }
};

module.exports = { initializeAdmin };