// src/utils/passwordStrength.js
const zxcvbn = require('zxcvbn');

/**
 * Evaluate password strength using zxcvbn
 * @param {string} password
 * @param {string[]} userInputs - Optional: [email, first_name, last_name, etc.]
 * @returns {object}
 */
const evaluatePasswordStrength = (password, userInputs = []) => {
  if (!password) {
    return {
      score: 0,
      feedback: 'Password is required',
      crack_time: 'instant',
      valid: false,
    };
  }

  const result = zxcvbn(password, userInputs);

  const score = result.score; // 0-4
  const crackTime = result.crack_times_display.offline_slow_hashing_1e4_per_second;

  let feedback = '';
  let valid = true;

  if (score < 3) {
    valid = false;
    if (result.feedback.warning) {
      feedback = result.feedback.warning;
    }
    if (result.feedback.suggestions.length > 0) {
      feedback += ' ' + result.feedback.suggestions.join(' ');
    }
  } else {
    feedback = 'Strong password';
  }

  return {
    score, // 0-4
    feedback,
    crack_time: crackTime,
    valid,
    warning: result.feedback.warning || null,
    suggestions: result.feedback.suggestions,
  };
};

/**
 * Helper: Throw error if password too weak (score < 3)
 */
const requireStrongPassword = (password, userInputs = []) => {
  const strength = evaluatePasswordStrength(password, userInputs);
  if (!strength.valid) {
    throw new (require('../utils/apiError').BadRequest)(
      `Weak password: ${strength.feedback}`
    );
  }
  return strength;
};

module.exports = {
  evaluatePasswordStrength,
  requireStrongPassword,
};