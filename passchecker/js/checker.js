/**
 * @file checker.js
 * @description Core password strength evaluation logic.
 *              Analyzes password input against multiple security criteria
 *              and returns a structured result with score and feedback.
 *
 * @author      Benadic Manger
 * @version     1.0.0
 * @date        2026-05-15
 */

/* ============================================================
   SECTION: Constants
   Centralized constants for scoring logic and weak-pattern checks.
   ============================================================ */

// Minimum acceptable password length.
const MIN_LENGTH = 8;

// Ideal password length for stronger security.
const IDEAL_LENGTH = 12;

// Score cap used by meter calculations and label mapping.
const MAX_SCORE = 5;

// Dictionary of commonly used weak passwords and common pattern fragments.
const COMMON_PATTERNS = [
  'password',
  '123456',
  '123456789',
  'qwerty',
  'abc123',
  'password1',
  'iloveyou',
  'admin',
  'welcome',
  'monkey',
  'letmein',
  '000000',
  '111111'
];

/* ============================================================
   SECTION: Helper Functions
   Small reusable functions for cleaner core evaluation logic.
   ============================================================ */

/**
 * Checks whether a password contains common weak patterns.
 *
 * @param   {string} password - Raw password string from user input.
 * @returns {boolean}         - True if a common weak pattern is found.
 */
function hasCommonPattern(password) {
  // Normalize once so pattern checks are case-insensitive.
  const normalizedPassword = password.toLowerCase();

  // Return true as soon as any known weak pattern is included.
  return COMMON_PATTERNS.some((pattern) => normalizedPassword.includes(pattern));
}

/**
 * Converts a score into a user-facing label and color.
 *
 * @param   {number} score - Strength score from 0 to 5.
 * @returns {Object}       - Label and color pair for UI rendering.
 */
function mapScoreToStrength(score) {
  // Explicit thresholds keep mapping predictable and easy to adjust.
  if (score <= 0) return { label: 'Weak', color: '#e74c3c' };
  if (score === 1) return { label: 'Fair', color: '#e67e22' };
  if (score === 2) return { label: 'Good', color: '#f1c40f' };
  if (score <= 4) return { label: 'Strong', color: '#2ecc71' };
  return { label: 'Very Strong', color: '#27ae60' };
}

/* ============================================================
   SECTION: Main Evaluator
   Called on every keystroke to evaluate the current password.
   ============================================================ */

/**
 * Evaluates the strength of a given password.
 *
 * @param   {string} password - The password string entered by the user.
 * @returns {Object} result   - An object containing:
 *                              - score {number}    : 0-5 strength score
 *                              - label {string}    : Weak | Fair | Good | Strong | Very Strong
 *                              - color {string}    : Hex color for strength meter
 *                              - feedback {Array}  : List of improvement suggestions
 *                              - criteria {Object} : Boolean map of each passed criterion
 */
function evaluatePasswordStrength(password) {
  /* ------------------------------------------------------------
     BLOCK: Initialize default result for empty/invalid input
     ------------------------------------------------------------ */

  const result = {
    score: 0,
    label: 'Weak',
    color: '#e74c3c',
    criteria: {
      hasMinLength: false,
      hasIdealLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false,
      notCommon: true,
      noRepeats: true
    },
    feedback: []
  };

  // Guard clause for empty input keeps UI state stable.
  if (!password || password.length === 0) {
    result.feedback.push('Use at least 8 characters to start building a stronger password.');
    return result;
  }

  /* ------------------------------------------------------------
     BLOCK: Criteria checks
     Each check updates the criteria map used by UI + feedback.
     ------------------------------------------------------------ */

  // Length checks.
  result.criteria.hasMinLength = password.length >= MIN_LENGTH;
  result.criteria.hasIdealLength = password.length >= IDEAL_LENGTH;

  // Character variety checks.
  result.criteria.hasUppercase = /[A-Z]/.test(password);
  result.criteria.hasLowercase = /[a-z]/.test(password);
  result.criteria.hasNumber = /\d/.test(password);
  result.criteria.hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/.test(password);

  // Pattern safety checks.
  result.criteria.notCommon = !hasCommonPattern(password);
  result.criteria.noRepeats = !/(.)\1{2,}/.test(password);

  /* ------------------------------------------------------------
     BLOCK: Score calculation
     Positive checks add points; risk checks apply penalties.
     ------------------------------------------------------------ */

  // +1 when minimum length is satisfied.
  if (result.criteria.hasMinLength) result.score += 1;

  // +1 for ideal length target (12+).
  if (result.criteria.hasIdealLength) result.score += 1;

  // +1 for mixed case (both uppercase + lowercase).
  if (result.criteria.hasUppercase && result.criteria.hasLowercase) result.score += 1;

  // +1 for including a number.
  if (result.criteria.hasNumber) result.score += 1;

  // +1 for including a symbol.
  if (result.criteria.hasSpecialChar) result.score += 1;

  // -2 penalty for common weak patterns.
  if (!result.criteria.notCommon) result.score = Math.max(0, result.score - 2);

  // -1 penalty for repeated characters (aaa / 111).
  if (!result.criteria.noRepeats) result.score = Math.max(0, result.score - 1);

  // Final clamp to keep the score within UI-safe bounds.
  result.score = Math.min(MAX_SCORE, Math.max(0, result.score));

  /* ------------------------------------------------------------
     BLOCK: Label + color mapping
     ------------------------------------------------------------ */

  const mappedStrength = mapScoreToStrength(result.score);
  result.label = mappedStrength.label;
  result.color = mappedStrength.color;

  /* ------------------------------------------------------------
     BLOCK: Actionable feedback
     ------------------------------------------------------------ */

  if (!result.criteria.hasMinLength) result.feedback.push('Use at least 8 characters.');
  if (!result.criteria.hasIdealLength) result.feedback.push('Aim for 12 or more characters for better security.');
  if (!result.criteria.hasUppercase) result.feedback.push('Add at least one uppercase letter (A-Z).');
  if (!result.criteria.hasLowercase) result.feedback.push('Add at least one lowercase letter (a-z).');
  if (!result.criteria.hasNumber) result.feedback.push('Include at least one number (0-9).');
  if (!result.criteria.hasSpecialChar) result.feedback.push('Add a special character like !@#$%^&*.');
  if (!result.criteria.notCommon) result.feedback.push('Avoid common patterns such as password, 123456, or qwerty.');
  if (!result.criteria.noRepeats) result.feedback.push('Avoid repeating the same character three or more times in a row.');

  // Positive reinforcement when all checks are clear.
  if (result.feedback.length === 0) {
    result.feedback.push('Great job. This password meets all current strength checks.');
  }

  return result;
}

/* ============================================================
   SECTION: Exports
   Browser global + CommonJS export for tests.
   ============================================================ */

// Expose the evaluator for browser scripts.
if (typeof window !== 'undefined') {
  window.PasswordChecker = {
    evaluatePasswordStrength,
    MIN_LENGTH,
    IDEAL_LENGTH,
    MAX_SCORE
  };
}

// Expose the evaluator for Node.js tests.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    evaluatePasswordStrength,
    MIN_LENGTH,
    IDEAL_LENGTH,
    MAX_SCORE
  };
}
