const app = require('./app');
const config = require('./config');
const logger = require('./common/utils/logger');
const connectDB = require('./infrastructure/database/mongodb/connection');
const { connectRedis } = require('./infrastructure/cache/redis.client');

const startServer = async () => {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Server running in ${config.env} mode on port ${config.port}`);
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (err) => {
      logger.error('Unhandled Rejection:', err);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();