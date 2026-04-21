window.App.ready(function initLoginPage() {
  window.App.initPage('login', 'Login | Mix Shope');

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const feedbackContainer = document.querySelector('[data-login-feedback]');

  if (!form || !emailInput || !passwordInput) {
    return;
  }

  form.addEventListener('submit', function handleLoginSubmit(event) {
    event.preventDefault();

    if (!window.App.validation) {
      return;
    }

    window.App.validation.clearAllErrors(form);
    clearFeedback();

    const emailError = window.App.validation.validateEmail(emailInput.value);
    const passwordError = window.App.validation.validatePassword(passwordInput.value);

    if (emailError) {
      window.App.validation.showFieldError(emailInput, emailError);
    }

    if (passwordError) {
      window.App.validation.showFieldError(passwordInput, passwordError);
    }

    if (emailError || passwordError) {
      return;
    }

    showSuccessMessage('Form looks good. Login submission will be added next.');
  });

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
});
