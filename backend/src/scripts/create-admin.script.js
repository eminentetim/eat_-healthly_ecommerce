require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const logger = require('../common/utils/logger');
const User = require('../infrastructure/database/mongodb/models/User.model');

const createAdmin = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);

    const adminEmail = 'admin@organicmarketplace.com';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      logger.info('Admin user already exists');
      process.exit(0);
    }

    const admin = new User({
      email: adminEmail,
      role: 'admin',
      isActive: true,
      isApproved: true,
      profile: { fullName: 'Platform Administrator' },
    });

    // In production, generate a strong password and send via secure channel
    const tempPassword = 'Admin@2025!Secure';
    admin.password = await bcrypt.hash(tempPassword, 12);

    await admin.save();

    logger.info('Admin user created successfully');
    logger.info(`Email: ${adminEmail}`);
    logger.info(`Temporary Password: ${tempPassword}`);
    logger.warn('CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN');

    process.exit(0);
  } catch (err) {
    logger.error('Failed to create admin:', err);
    process.exit(1);
  }
};

createAdmin();