/**
 * @file main.js
 * @description Application entry point. Initializes event listeners,
 *              connects modules, and coordinates real-time UI updates.
 *
 * @author      Benadic Manger
 * @version     1.0.0
 * @date        2026-05-15
 */

/* ============================================================
   SECTION: Bootstrapping
   Initializes app once DOM is fully available.
   ============================================================ */

/**
 * Initializes the Password Strength Checker application.
 *
 * @returns {void}
 */
function initializePasswordCheckerApp() {
  // Resolve dependencies from global module namespaces.
  const checker = window.PasswordChecker;
  const generator = window.PasswordGenerator;
  const ui = window.PasswordUI;
  const breach = window.PasswordBreach;

  /* ------------------------------------------------------------
     BLOCK: Cache DOM references used across listeners
     ------------------------------------------------------------ */

  const passwordInput = document.getElementById('password-input');
  const visibilityToggleButton = document.getElementById('toggle-visibility');
  const generateButton = document.getElementById('generate-password');
  const copyButton = document.getElementById('copy-password');
  const lengthInput = document.getElementById('generator-length');
  const lengthValue = document.getElementById('generator-length-value');
  const uppercaseOption = document.getElementById('option-uppercase');
  const numbersOption = document.getElementById('option-numbers');
  const symbolsOption = document.getElementById('option-symbols');
  const breachCheckButton = document.getElementById('check-breach');

  /* ------------------------------------------------------------
     BLOCK: Shared rendering routine for password evaluation
     ------------------------------------------------------------ */

  /**
   * Evaluates current password and refreshes strength UI sections.
   *
   * @returns {void}
   */
  function evaluateAndRenderCurrentPassword() {
    // Evaluate latest input value using checker module.
    const evaluation = checker.evaluatePasswordStrength(passwordInput.value);

    // Refresh meter, criteria list, and feedback list.
    ui.updateStrengthMeter(evaluation.score, evaluation.label, evaluation.color);
    ui.renderCriteriaList(evaluation.criteria);
    ui.renderFeedback(evaluation.feedback);
  }

  /* ------------------------------------------------------------
     BLOCK: Input listeners for real-time updates
     ------------------------------------------------------------ */

  // Evaluate password on every keystroke.
  passwordInput.addEventListener('input', evaluateAndRenderCurrentPassword);

  // Toggle password visibility on button click.
  visibilityToggleButton.addEventListener('click', () => {
    ui.togglePasswordVisibility(passwordInput, visibilityToggleButton);
  });

  /* ------------------------------------------------------------
     BLOCK: Generator controls and actions
     ------------------------------------------------------------ */

  // Keep displayed length value synchronized with range slider.
  lengthInput.addEventListener('input', () => {
    lengthValue.textContent = String(lengthInput.value);
  });

  // Generate password from current option settings.
  generateButton.addEventListener('click', () => {
    const options = {
      length: Number.parseInt(lengthInput.value, 10),
      useUppercase: uppercaseOption.checked,
      useNumbers: numbersOption.checked,
      useSymbols: symbolsOption.checked
    };

    try {
      // Generate and inject password into input.
      const generatedPassword = generator.generatePassword(options);
      passwordInput.value = generatedPassword;

      // Re-run evaluator so UI reflects the new password.
      evaluateAndRenderCurrentPassword();
    } catch (error) {
      // Show fallback browser alert for invalid option combinations.
      alert(error.message);
    }
  });

  // Copy current password to clipboard.
  copyButton.addEventListener('click', async () => {
    const copied = await ui.copyTextToClipboard(passwordInput.value);

    // Provide immediate button text feedback.
    copyButton.textContent = copied ? 'Copied' : 'Copy failed';

    // Revert button label after a short delay.
    setTimeout(() => {
      copyButton.textContent = 'Copy';
    }, 1200);
  });

  /* ------------------------------------------------------------
     BLOCK: Optional breach check integration
     ------------------------------------------------------------ */

  // Check current password against HIBP k-anonymity API.
  breachCheckButton.addEventListener('click', async () => {
    const breachStatus = document.getElementById('breach-status');

    if (!passwordInput.value) {
      window.PasswordUI.updateBreachStatus({
        breached: false,
        count: 0,
        error: 'Enter a password before running breach check.'
      });
      return;
    }

    // Show temporary status while query is running.
    breachStatus.textContent = 'Checking breach database...';
    breachStatus.style.color = '#58656d';

    // Run breach check and update status text.
    const breachResult = await breach.checkPasswordBreach(passwordInput.value);
    window.PasswordUI.updateBreachStatus(breachResult);
  });

  /* ------------------------------------------------------------
     BLOCK: Initial render
     ------------------------------------------------------------ */

  evaluateAndRenderCurrentPassword();
}

// Initialize app once HTML has loaded.
document.addEventListener('DOMContentLoaded', initializePasswordCheckerApp);
