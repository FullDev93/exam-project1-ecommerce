window.App.ready(function initRegisterPage() {
  window.App.initPage('register', 'Register | Mix Shope');

  const form = document.getElementById('register-form');
  const nameInput = document.getElementById('register-name');
  const emailInput = document.getElementById('register-email');
  const passwordInput = document.getElementById('register-password');
  const feedbackContainer = document.querySelector('[data-register-feedback]');
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;
  const defaultSubmitText = submitButton ? submitButton.textContent : 'Create Account';
  let redirectTimer = null;

  if (!form || !nameInput || !emailInput || !passwordInput || !submitButton) {
    return;
  }

  form.addEventListener('submit', async function handleRegisterSubmit(event) {
    event.preventDefault();

    if (!window.App.validation) {
      return;
    }

    window.App.validation.clearAllErrors(form);
    clearFeedback();

    const nameError = window.App.validation.validateName(nameInput.value);
    const emailError = window.App.validation.validateEmail(emailInput.value);
    const passwordError = window.App.validation.validatePassword(passwordInput.value);

    if (nameError) {
      window.App.validation.showFieldError(nameInput, nameError);
    }

    if (emailError) {
      window.App.validation.showFieldError(emailInput, emailError);
    }

    if (passwordError) {
      window.App.validation.showFieldError(passwordInput, passwordError);
    }

    if (nameError || emailError || passwordError) {
      return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    setSubmittingState(true);

    try {
      const api = await getApiHelpers();

      if (!api || typeof api.registerUser !== 'function') {
        throw new Error('Unable to create account. Please try again.');
      }

      await api.registerUser(name, email, password);

      showSuccessMessage('Account created! Redirecting to login...');
      scheduleRedirect();
    } catch (error) {
      showErrorMessage(getApiErrorMessage(error));
    } finally {
      setSubmittingState(false);
    }
  });

  async function getApiHelpers() {
    if (window.App.api && typeof window.App.api.registerUser === 'function') {
      return window.App.api;
    }

    try {
      const apiModule = await import('../js/api.js');

      if (window.App.api && typeof window.App.api.registerUser === 'function') {
        return window.App.api;
      }

      return apiModule;
    } catch {
      return null;
    }
  }

  function scheduleRedirect() {
    if (redirectTimer) {
      window.clearTimeout(redirectTimer);
    }

    redirectTimer = window.setTimeout(function redirectToLogin() {
      window.location.href = '../account/login.html';
    }, 1500);
  }

  function setSubmittingState(isSubmitting) {
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? 'Creating account...' : defaultSubmitText;
  }

  function showSuccessMessage(message) {
    if (!(feedbackContainer instanceof Element)) {
      return;
    }

    if (window.App.ui && typeof window.App.ui.showSuccess === 'function') {
      window.App.ui.showSuccess(feedbackContainer, message);
      return;
    }

    feedbackContainer.textContent = message;
  }

  function showErrorMessage(message) {
    if (!(feedbackContainer instanceof Element)) {
      return;
    }

    if (window.App.ui && typeof window.App.ui.showError === 'function') {
      window.App.ui.showError(feedbackContainer, message);
      return;
    }

    feedbackContainer.textContent = message;
  }

  function clearFeedback() {
    if (!(feedbackContainer instanceof Element)) {
      return;
    }

    if (window.App.ui && typeof window.App.ui.clearMessages === 'function') {
      window.App.ui.clearMessages(feedbackContainer);
      return;
    }

    feedbackContainer.textContent = '';
  }

  function getApiErrorMessage(error) {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return 'Unable to create account. Please try again.';
  }
});
