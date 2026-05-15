/**
 * @file generator.test.js
 * @description Unit tests for the password generator utility.
 *              Run with: node tests/generator.test.js
 *
 * @author      Benadic Manger
 * @version     1.0.0
 * @date        2026-05-15
 */

// Import generator function and character sets from module.
const { generatePassword } = require('../js/generator');

/* ============================================================
   SECTION: Test 1
   Generated password should respect requested length.
   ============================================================ */

// Generate password with specific length.
const generated16 = generatePassword({ length: 16 });
console.assert(generated16.length === 16, 'Test 1 Failed: generated password length should be 16.');
console.log('Test 1 Passed: generated password length is 16.');

/* ============================================================
   SECTION: Test 2
   Generated password should include enabled sets.
   ============================================================ */

// Generate password requiring uppercase, numbers, and symbols.
const generatedComplex = generatePassword({
  length: 20,
  useUppercase: true,
  useNumbers: true,
  useSymbols: true
});

console.assert(/[A-Z]/.test(generatedComplex), 'Test 2 Failed: password missing uppercase letter.');
console.assert(/\d/.test(generatedComplex), 'Test 2 Failed: password missing number.');
console.assert(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(generatedComplex), 'Test 2 Failed: password missing symbol.');
console.log('Test 2 Passed: enabled sets are present.');

/* ============================================================
   SECTION: Test 3
   Disabled sets should not appear in output.
   ============================================================ */

// Generate lowercase-only password.
const lowercaseOnly = generatePassword({
  length: 18,
  useLowercase: true,
  useUppercase: false,
  useNumbers: false,
  useSymbols: false
});

console.assert(/^[a-z]+$/.test(lowercaseOnly), 'Test 3 Failed: lowercase-only password contains disallowed characters.');
console.log('Test 3 Passed: disabled sets are excluded.');

/* ============================================================
   SECTION: Test 4
   Invalid options should throw descriptive errors.
   ============================================================ */

let threwForNoSets = false;
try {
  generatePassword({
    length: 12,
    useLowercase: false,
    useUppercase: false,
    useNumbers: false,
    useSymbols: false
  });
} catch (error) {
  threwForNoSets = true;
}

console.assert(threwForNoSets, 'Test 4 Failed: should throw when all character sets are disabled.');
console.log('Test 4 Passed: invalid options throw as expected.');

console.log('All generator tests completed.');
