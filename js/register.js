window.App.ready(function initRegisterPage() {
  window.App.initPage('register', 'Register | Mix Shope');

  const form = document.getElementById('register-form');
  const nameInput = document.getElementById('register-name');
  const emailInput = document.getElementById('register-email');
  const passwordInput = document.getElementById('register-password');
  const feedbackContainer = document.querySelector('[data-register-feedback]');

  if (!form || !nameInput || !emailInput || !passwordInput) {
    return;
  }

  form.addEventListener('submit', function handleRegisterSubmit(event) {
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

    showSuccessMessage('Form looks good. Registration submission will be added next.');
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
