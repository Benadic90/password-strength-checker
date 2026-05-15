/**
 * @file breach.js
 * @description Optional Have I Been Pwned breach checker using the
 *              k-anonymity model. Sends only the first 5 SHA-1 hash chars.
 *
 * @author      Benadic Manger
 * @version     1.0.0
 * @date        2026-05-15
 */

/* ============================================================
   SECTION: Constants
   API endpoint configuration for the pwned passwords range API.
   ============================================================ */

// Base endpoint for k-anonymity range queries.
const HIBP_RANGE_API_URL = 'https://api.pwnedpasswords.com/range/';

/* ============================================================
   SECTION: Helper Functions
   Utilities for hashing and parsing the API response safely.
   ============================================================ */

/**
 * Converts an ArrayBuffer into an uppercase hexadecimal string.
 *
 * @param   {ArrayBuffer} buffer - Binary buffer returned by digest.
 * @returns {string}             - Uppercase hex string representation.
 */
function bufferToHex(buffer) {
  // Convert bytes into two-character hex fragments.
  const byteArray = Array.from(new Uint8Array(buffer));
  return byteArray.map((byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Produces a SHA-1 hash for a plain-text password.
 *
 * @param   {string} password - Plain password string.
 * @returns {Promise<string>} - SHA-1 hash in uppercase hex form.
 */
async function sha1Hash(password) {
  // Use the Web Crypto API for hashing in the browser and modern Node.
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const digest = await globalThis.crypto.subtle.digest('SHA-1', data);
  return bufferToHex(digest);
}

/**
 * Parses the range API text response and finds the matching hash suffix.
 *
 * @param   {string} suffix       - The SHA-1 hash suffix to match.
 * @param   {string} responseText - Raw API response text.
 * @returns {number}              - Breach count (0 when not found).
 */
function parseBreachCountFromRangeResponse(suffix, responseText) {
  // Split the response by line, then parse each "HASH_SUFFIX:COUNT" record.
  const lines = responseText.split('\n');

  // Iterate line by line to find an exact suffix match.
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;

    const [hashSuffix, countText] = line.split(':');
    if (hashSuffix === suffix) {
      const count = Number.parseInt(countText, 10);
      return Number.isFinite(count) ? count : 0;
    }
  }

  return 0;
}

/* ============================================================
   SECTION: Main Breach Check
   Performs k-anonymity query without sending the full password.
   ============================================================ */

/**
 * Checks whether a password appears in known breach datasets.
 *
 * @param   {string} password - Plain password from user input.
 * @returns {Promise<Object>} - Breach result object.
 */
async function checkPasswordBreach(password) {
  // Return early for empty password input.
  if (!password || password.length === 0) {
    return {
      breached: false,
      count: 0,
      error: null
    };
  }

  try {
    // Compute SHA-1 hash and split into range prefix + suffix.
    const fullHash = await sha1Hash(password);
    const prefix = fullHash.slice(0, 5);
    const suffix = fullHash.slice(5);

    // Request only the prefix range from the API.
    const response = await fetch(`${HIBP_RANGE_API_URL}${prefix}`, {
      headers: {
        'Add-Padding': 'true'
      }
    });

    // Throw descriptive error for non-success responses.
    if (!response.ok) {
      throw new Error(`Breach check failed with status ${response.status}.`);
    }

    // Parse response text to find suffix count.
    const responseText = await response.text();
    const count = parseBreachCountFromRangeResponse(suffix, responseText);

    return {
      breached: count > 0,
      count,
      error: null
    };
  } catch (error) {
    // Keep app stable by returning a structured error instead of throwing.
    return {
      breached: false,
      count: 0,
      error: error instanceof Error ? error.message : 'Unknown breach check error.'
    };
  }
}

/* ============================================================
   SECTION: Exports
   Browser global + CommonJS export for testability.
   ============================================================ */

// Expose breach checker for browser scripts.
if (typeof window !== 'undefined') {
  window.PasswordBreach = {
    checkPasswordBreach,
    sha1Hash,
    parseBreachCountFromRangeResponse
  };
}

// Expose breach checker for Node.js tests.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkPasswordBreach,
    sha1Hash,
    parseBreachCountFromRangeResponse
  };
}
