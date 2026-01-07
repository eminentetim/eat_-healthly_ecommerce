// src/middleware/roleGuard.js
const ApiError = require('../utils/apiError');
const { Role } = require('../models/User');

/**
 * Restrict route to specific roles
 * @param {...string} allowedRoles
 */
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw ApiError.Forbidden('You do not have permission to access this resource');
    }

    next();
  };
};

// Convenience exports
module.exports = {
  roleGuard,
  adminOnly: roleGuard(Role.ADMIN),
  vendorOnly: roleGuard(Role.VENDOR),
  customerOnly: roleGuard(Role.CUSTOMER),
  adminOrVendor: roleGuard(Role.ADMIN, Role.VENDOR),
};