// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const logger = require('./utils/logger');
const apiResponse = require('./utils/apiResponse');
const apiError = require('./utils/apiError');
const errorHandler = require('./middleware/errorHandler');

const rateLimiter = require('./config/rateLimiter'); 
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');

// Import all v1 routes (centralized in routes/v1/index.js)
const v1Routes = require('./routes/index');

require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
    },
  },
}));

// Enable CORS with secure defaults (adjust origin in production)
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Compress responses
app.use(compression());

// Parse JSON bodies (with limit to prevent DoS)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Structured HTTP request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));


// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json(
    apiResponse.success('OK', {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  );
});

// API base route
app.get('/api/v1', (req, res) => {
  res.status(200).json(
    apiResponse.success('Welcome to Organic Marketplace API v1', {
      docs: '/api-docs',
      health: '/api/v1/health',
    })
  );
});



 app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });
// Mount all v1 routes under /api/v1
app.use('/api/v1', v1Routes);

// Handle 404 - Route not found
app.use((req, res, next) => {
  throw new apiError.NotFound(`Route ${req.originalUrl} not found`);
});

// Global error handling middleware (last)
app.use(errorHandler);

module.exports = app;