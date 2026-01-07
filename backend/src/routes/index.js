// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import v1 routes
const authRoutes = require('./v1/authRoutes');
//const adminRoutes = require('./v1/adminRoutes');
// Add other v1 routes here as you create them
// const userRoutes = require('./v1/userRoutes');
// const productRoutes = require('./v1/productRoutes');
// const orderRoutes = require('./v1/orderRoutes');
// etc.

// Mount all v1 routes under /api/v1
router.use('/auth', authRoutes);
//router.use('/admin', adminRoutes);
// router.use('/users', userRoutes);
// router.use('/products', productRoutes);
// etc.

// Optional: API root info
// router.get('/', (req, res) => {
//   res.json({
//     message: 'Welcome to Organic Marketplace API v1',
//     version: '1.0.0',
//     docs: '/api-docs',
//     health: '/api/v1/health',
//   });
// });

module.exports = router;