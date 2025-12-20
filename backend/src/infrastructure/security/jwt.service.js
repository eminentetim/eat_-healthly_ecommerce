const jwt = require('jsonwebtoken');
const config = require('../../config');
const logger = require('../../common/utils/logger');

class JWTService {
  static sign(user) {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  static verify(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (err) {
      logger.warn('JWT verification failed:', err.message);
      return null;
    }
  }
}

module.exports = JWTService;