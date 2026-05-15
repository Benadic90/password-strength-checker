/**
 * @file generator.js
 * @description Generates cryptographically random strong passwords
 *              based on user-selected options (length and character sets).
 *
 * @author      Benadic Manger
 * @version     1.0.0
 * @date        2026-05-15
 */

/* ============================================================
   SECTION: Constants
   Character pools for each configurable character category.
   ============================================================ */

// Character sets used for password generation.
const CHAR_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// Safe defaults for generation options.
const DEFAULT_OPTIONS = {
  length: 16,
  useLowercase: true,
  useUppercase: true,
  useNumbers: true,
  useSymbols: true
};

/* ============================================================
   SECTION: Helper Functions
   Small utilities to keep generatePassword easy to read.
   ============================================================ */

/**
 * Returns cryptographically secure random values.
 *
 * @param   {number} count - Number of random uint32 values to generate.
 * @returns {Uint32Array}  - Secure random values.
 */
function getSecureRandomValues(count) {
  // Browser and modern Node both expose Web Crypto via globalThis.crypto.
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
    const values = new Uint32Array(count);
    globalThis.crypto.getRandomValues(values);
    return values;
  }

  // Node fallback for environments without Web Crypto.
  if (typeof require !== 'function') {
    throw new Error('Secure random generation is not available in this runtime.');
  }

  const nodeCrypto = require('crypto');
  const randomBytes = nodeCrypto.randomBytes(count * 4);
  const values = new Uint32Array(count);

  // Convert byte buffer to uint32 array values.
  for (let index = 0; index < count; index += 1) {
    values[index] = randomBytes.readUInt32LE(index * 4);
  }

  return values;
}

/**
 * Picks one random character from a given character set.
 *
 * @param   {string} set - Character set to choose from.
 * @returns {string}     - Single random character.
 */
function pickRandomCharacter(set) {
  // Securely map one random integer into the set range.
  const randomValue = getSecureRandomValues(1)[0];
  return set[randomValue % set.length];
}

/**
 * Shuffles characters using a secure Fisher-Yates algorithm.
 *
 * @param   {string[]} chars - Mutable array of characters.
 * @returns {string[]}       - Shuffled character array.
 */
function secureShuffle(chars) {
  // Generate random values once for deterministic loop cost.
  const randomValues = getSecureRandomValues(chars.length);

  // Fisher-Yates shuffle from end to start.
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = randomValues[index] % (index + 1);
    const temp = chars[index];
    chars[index] = chars[swapIndex];
    chars[swapIndex] = temp;
  }

  return chars;
}

/* ============================================================
   SECTION: Main Generator
   Builds a strong random password from selected options.
   ============================================================ */

/**
 * Generates a random strong password based on specified options.
 *
 * @param   {Object}  options              - Generation configuration.
 * @param   {number}  options.length       - Desired password length (default: 16).
 * @param   {boolean} options.useLowercase - Include lowercase letters (default: true).
 * @param   {boolean} options.useUppercase - Include uppercase letters (default: true).
 * @param   {boolean} options.useNumbers   - Include numbers (default: true).
 * @param   {boolean} options.useSymbols   - Include symbols (default: true).
 * @returns {string} generatedPassword     - Randomly generated password string.
 */
function generatePassword(options = {}) {
  /* ------------------------------------------------------------
     BLOCK: Normalize and validate options
     ------------------------------------------------------------ */

  // Merge user options over defaults.
  const settings = {
    ...DEFAULT_OPTIONS,
    ...options
  };

  // Normalize length to integer and enforce safe lower bound.
  const length = Number.isFinite(settings.length) ? Math.floor(settings.length) : DEFAULT_OPTIONS.length;
  if (length < 4) {
    throw new Error('Password length must be at least 4 characters.');
  }

  /* ------------------------------------------------------------
     BLOCK: Build enabled character sets
     ------------------------------------------------------------ */

  const enabledSets = [];

  // Add sets that the user enabled.
  if (settings.useLowercase) enabledSets.push(CHAR_SETS.lowercase);
  if (settings.useUppercase) enabledSets.push(CHAR_SETS.uppercase);
  if (settings.useNumbers) enabledSets.push(CHAR_SETS.numbers);
  if (settings.useSymbols) enabledSets.push(CHAR_SETS.symbols);

  // Guard clause to avoid generating from an empty pool.
  if (enabledSets.length === 0) {
    throw new Error('At least one character set must be enabled.');
  }

  // Ensure requested length can include one character from each selected set.
  if (length < enabledSets.length) {
    throw new Error('Password length is too short for the selected character sets.');
  }

  /* ------------------------------------------------------------
     BLOCK: Guarantee at least one character per enabled set
     ------------------------------------------------------------ */

  const passwordChars = [];

  // Seed password with one required character from each selected set.
  enabledSets.forEach((set) => {
    passwordChars.push(pickRandomCharacter(set));
  });

  /* ------------------------------------------------------------
     BLOCK: Fill remaining length from combined pool
     ------------------------------------------------------------ */

  // Create full pool from all enabled sets.
  const fullPool = enabledSets.join('');

  // Generate secure random values for remaining characters.
  const remainingLength = length - passwordChars.length;
  const randomValues = getSecureRandomValues(remainingLength);

  // Append additional random characters from combined pool.
  for (let index = 0; index < remainingLength; index += 1) {
    const poolIndex = randomValues[index] % fullPool.length;
    passwordChars.push(fullPool[poolIndex]);
  }

  /* ------------------------------------------------------------
     BLOCK: Shuffle for unpredictability and return final string
     ------------------------------------------------------------ */

  const shuffledChars = secureShuffle(passwordChars);
  return shuffledChars.join('');
}

/* ============================================================
   SECTION: Exports
   Browser global + CommonJS export for tests.
   ============================================================ */

// Expose generator for browser scripts.
if (typeof window !== 'undefined') {
  window.PasswordGenerator = {
    generatePassword,
    CHAR_SETS,
    DEFAULT_OPTIONS
  };
}

// Expose generator for Node.js tests.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generatePassword,
    CHAR_SETS,
    DEFAULT_OPTIONS
  };
}
