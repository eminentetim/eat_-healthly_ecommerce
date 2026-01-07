// src/server.js
const http = require('http');
const app = require('./app');
const logger = require('./utils/logger');

const { connectDB } = require('./config/database');
const { connectRedis, closeRedis } = require('./config/redis');
const { startQueueProcessor } = require('./jobs/processor');
const { PORT, NODE_ENV } = require('./config/constants');
const authService = require('./services/authService');


require('dotenv').config();

// === Initialize Event Listeners ===
// These must be required AFTER DB & Redis connections are established
// and BEFORE the server starts listening
const initializeListeners = () => {
  require('./listeners/emailListener');
  require('./listeners/notificationListener');
  require('./listeners/orderStatusListener');
  require('./listeners/walletListener');

  logger.info('All event listeners initialized');
};

// Create HTTP server
const server = http.createServer(app);

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    try {
      await connectDB.close();
      logger.info('MongoDB connection closed.');

    //   await closeRedis();
    //   logger.info('Redis connection closed.');

      logger.info('Background job workers stopping...');
      logger.info('Server shut down gracefully.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during graceful shutdown', { error: err.message });
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Force shutdown triggered after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
  });
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', {
    reason: reason instanceof Error ? reason.message : reason,
  });
  gracefulShutdown('unhandledRejection');
});

// Start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('MongoDB connected successfully');

    // Connect to Redis
    // await connectRedis();
    // logger.info('Redis connected successfully');

    // Start background job processors
    startQueueProcessor();
    logger.info('Background job processor started');

    // Initialize default Admin
    await authService.initializeAdmin();
    logger.info('Default Admin account ensured');

    // Initialize all event listeners
    initializeListeners();

    // Start HTTP server
    server.listen(PORT, () => {
      logger.info('Organic Marketplace Backend Running');
      logger.info(`Port: ${PORT}`);
      logger.info(`Environment: ${NODE_ENV}`);
      logger.info(`Health Check: http://localhost:${PORT}/api/v1/health`);

      if (NODE_ENV !== 'production') {
        logger.info(`Swagger UI: http://localhost:${PORT}/api-docs`);
        logger.info(`OpenAPI Spec: http://localhost:${PORT}/api-docs.json`);
      }
    });
  } catch (error) {
    logger.error('Failed to start server:', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// Start the application
startServer();





