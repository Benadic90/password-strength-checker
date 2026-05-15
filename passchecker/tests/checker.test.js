/**
 * @file checker.test.js
 * @description Unit tests for the password strength evaluator.
 *              Run with: node tests/checker.test.js
 *
 * @author      Benadic Manger
 * @version     1.0.0
 * @date        2026-05-15
 */

// Import the function to test from the checker module.
const { evaluatePasswordStrength } = require('../js/checker');

/* ============================================================
   SECTION: Test 1
   Very short password should remain weak.
   ============================================================ */

// Evaluate a clearly weak password.
const weakResult = evaluatePasswordStrength('aa');
console.assert(weakResult.label === 'Weak', 'Test 1 Failed: very short password should be Weak.');
console.log('Test 1 Passed: very short password is Weak.');

/* ============================================================
   SECTION: Test 2
   Strong mixed password should be very strong.
   ============================================================ */

// Evaluate a high-entropy password with mixed character types.
const veryStrongResult = evaluatePasswordStrength('G7#kRmP2@xLqW!');
console.assert(veryStrongResult.label === 'Very Strong', 'Test 2 Failed: strong password should be Very Strong.');
console.log('Test 2 Passed: strong password is Very Strong.');

/* ============================================================
   SECTION: Test 3
   Common password should score low due to penalties.
   ============================================================ */

// Evaluate a common weak password.
const commonResult = evaluatePasswordStrength('password');
console.assert(commonResult.score <= 1, 'Test 3 Failed: common password should score very low.');
console.log('Test 3 Passed: common password scored very low.');

/* ============================================================
   SECTION: Test 4
   Repeated characters should trigger noRepeats criterion failure.
   ============================================================ */

// Evaluate repeated-character pattern.
const repeatResult = evaluatePasswordStrength('AAA111!!!aaa');
console.assert(repeatResult.criteria.noRepeats === false, 'Test 4 Failed: repeated characters were not detected.');
console.log('Test 4 Passed: repeated characters detected correctly.');

console.log('All checker tests completed.');
