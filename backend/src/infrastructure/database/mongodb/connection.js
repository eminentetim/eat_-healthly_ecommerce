const mongoose = require('mongoose');
const config = require('../../../config');
const logger = require('../../../common/utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`${signal} received. Closing MongoDB connection...`);
      mongoose.connection.close(() => {
        logger.info('MongoDB connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  } catch (err) {
    logger.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;