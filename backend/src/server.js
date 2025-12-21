const app = require('./app');
const config = require('./config');
const logger = require('./common/utils/logger');
const connectDB = require('./infrastructure/database/mongodb/connection');
const { connectRedis } = require('./infrastructure/cache/redis.client');
const { PORT, NODE_ENV } = require('./config');

require("dotenv").config();

const startServer = async () => {
  try {
    // Connect to databases
    await connectDB();
    await connectRedis();

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Server running in ${config.env} mode on port ${config.port}`);
       logger.info(`📊 Health check: http://localhost:${PORT}/api/v1/health`);
      if (NODE_ENV === 'development') {
        logger.info(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
      }
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