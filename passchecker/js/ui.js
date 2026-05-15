/**
 * @file ui.js
 * @description Handles all DOM interactions and UI state updates.
 *              Bridges checker, generator, and breach logic to the interface.
 *
 * @author      Benadic Manger
 * @version     1.0.0
 * @date        2026-05-15
 */

/* ============================================================
   SECTION: Constants
   Human-readable labels for each criteria key.
   ============================================================ */

// Friendly labels displayed next to pass/fail markers.
const CRITERIA_LABELS = {
  hasMinLength: 'At least 8 characters',
  hasIdealLength: '12 or more characters',
  hasUppercase: 'Contains uppercase letter (A-Z)',
  hasLowercase: 'Contains lowercase letter (a-z)',
  hasNumber: 'Contains at least one number (0-9)',
  hasSpecialChar: 'Contains special character (!@#...)',
  notCommon: 'Avoids common patterns (password, 123456, qwerty)',
  noRepeats: 'No 3+ repeated characters in a row'
};

/* ============================================================
   SECTION: UI Update Functions
   Each function updates a specific UI area.
   ============================================================ */

/**
 * Updates the strength meter bar and label in the DOM.
 *
 * @param {number} score - Strength score (0-5).
 * @param {string} label - Strength label text.
 * @param {string} color - Hex color used for strength visuals.
 */
function updateStrengthMeter(score, label, color) {
  // Select the progress bar and label elements.
  const bar = document.getElementById('strength-bar');
  const labelElement = document.getElementById('strength-label');
  const meterTrack = document.querySelector('.meter-track');

  // Convert score to percent width.
  const percent = (score / 5) * 100;

  // Apply dynamic width + color to the bar.
  bar.style.width = `${percent}%`;
  bar.style.backgroundColor = color;

  // Keep ARIA value in sync for assistive technologies.
  if (meterTrack) {
    meterTrack.setAttribute('aria-valuenow', String(percent));
  }

  // Apply label text and matching color.
  labelElement.textContent = label;
  labelElement.style.color = color;
}

/**
 * Renders criteria checks with pass/fail markers.
 *
 * @param {Object} criteria - Criteria result map from checker.js.
 */
function renderCriteriaList(criteria) {
  // Select criteria list container.
  const container = document.getElementById('criteria-list');

  // Clear old criteria rows before re-render.
  container.innerHTML = '';

  // Render each criterion as one list row.
  Object.entries(criteria).forEach(([key, passed]) => {
    const row = document.createElement('li');

    // Build row contents with explicit pass/fail text for accessibility.
    row.innerHTML = `
      <span class="criteria-icon" aria-hidden="true">${passed ? '✅' : '❌'}</span>
      <span class="${passed ? 'pass' : 'fail'}">${CRITERIA_LABELS[key]}</span>
    `;

    container.appendChild(row);
  });
}

/**
 * Renders feedback tips returned by checker.js.
 *
 * @param {string[]} feedback - Ordered list of feedback messages.
 */
function renderFeedback(feedback) {
  // Select feedback list container.
  const container = document.getElementById('feedback-list');

  // Reset previous tips.
  container.innerHTML = '';

  // Add each feedback string as a list item.
  feedback.forEach((tip) => {
    const row = document.createElement('li');
    row.textContent = tip;
    container.appendChild(row);
  });
}

/**
 * Toggles password input visibility and updates button state.
 *
 * @param   {HTMLInputElement} inputElement  - Password input element.
 * @param   {HTMLButtonElement} buttonElement - Toggle button element.
 * @returns {boolean}                        - True when password is visible.
 */
function togglePasswordVisibility(inputElement, buttonElement) {
  // Determine current visibility from input type.
  const currentlyHidden = inputElement.type === 'password';

  // Flip input type between password and text.
  inputElement.type = currentlyHidden ? 'text' : 'password';

  // Resolve icon and label nodes inside the toggle button.
  const iconElement = document.getElementById('visibility-icon');
  const textElement = document.getElementById('visibility-text');

  // Update button state for clarity and accessibility.
  buttonElement.setAttribute('aria-pressed', currentlyHidden ? 'true' : 'false');
  buttonElement.setAttribute('aria-label', currentlyHidden ? 'Hide password' : 'Show password');

  // Update visual label text without removing the icon node.
  if (textElement) {
    textElement.textContent = currentlyHidden ? 'Hide' : 'Show';
  }

  // Swap eye icon based on visibility state.
  if (iconElement) {
    iconElement.src = currentlyHidden ? 'assets/icons/eye-closed.svg' : 'assets/icons/eye-open.svg';
  }

  return currentlyHidden;
}

/**
 * Updates breach check status message text and color.
 *
 * @param {Object} result - Breach result with breached/count/error fields.
 */
function updateBreachStatus(result) {
  // Select the breach status message element.
  const status = document.getElementById('breach-status');

  // Handle API/network errors first.
  if (result.error) {
    status.textContent = `Breach check unavailable: ${result.error}`;
    status.style.color = '#b32d00';
    return;
  }

  // Show warning when breached.
  if (result.breached) {
    status.textContent = `Warning: this password appears in breaches ${result.count} time(s).`;
    status.style.color = '#b32d00';
    return;
  }

  // Show safe informational state when no match is found.
  status.textContent = 'No breach match found in the queried range data.';
  status.style.color = '#1f7a3b';
}

/**
 * Writes text to clipboard with a fallback message when unsupported.
 *
 * @param   {string} text - String to copy.
 * @returns {Promise<boolean>} - True when copy succeeds.
 */
async function copyTextToClipboard(text) {
  // Guard against unsupported Clipboard API.
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    return false;
  }

  // Attempt copy and report success/failure.
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    return false;
  }
}

/* ============================================================
   SECTION: Exports
   Browser global export for use in main.js.
   ============================================================ */

// Expose UI helper methods to the browser runtime.
if (typeof window !== 'undefined') {
  window.PasswordUI = {
    updateStrengthMeter,
    renderCriteriaList,
    renderFeedback,
    togglePasswordVisibility,
    updateBreachStatus,
    copyTextToClipboard
  };
}
