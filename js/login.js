window.App.ready(function initLoginPage() {
  window.App.initPage('login', 'Login | Mix Shope');

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const feedbackContainer = document.querySelector('[data-login-feedback]');
  const submitButton = form ? form.querySelector('button[type="submit"]') : null;
  const defaultSubmitText = submitButton ? submitButton.textContent : 'Log In';
  let redirectTimer = null;

  if (!form || !emailInput || !passwordInput || !submitButton) {
    return;
  }

  form.addEventListener('submit', async function handleLoginSubmit(event) {
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

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    let didPersistAuth = false;

    setSubmittingState(true);

    try {
      const api = await getApiHelpers();

      if (!api || typeof api.loginUser !== 'function' || typeof api.createApiKey !== 'function') {
        throw new Error('Unable to log in. Please try again.');
      }

      const user = await api.loginUser(email, password);
      const accessToken = getAccessToken(user);

      if (!accessToken) {
        throw new Error('Unable to log in. Please try again.');
      }

      if (!window.App.storage) {
        throw new Error('Unable to log in. Please try again.');
      }

      window.App.storage.saveToken(accessToken);
      window.App.storage.saveUser(user);
      didPersistAuth = true;

      const apiKeyResponse = await api.createApiKey(accessToken);
      const apiKey = getApiKeyValue(apiKeyResponse);

      if (!apiKey) {
        throw new Error('Unable to finish login. Please try again.');
      }

      window.App.storage.saveApiKey(apiKey);

      if (window.App.ui && typeof window.App.ui.updateNavbar === 'function') {
        window.App.ui.updateNavbar();
      }

      if (window.App.ui && typeof window.App.ui.updateCartBadge === 'function') {
        window.App.ui.updateCartBadge();
      }

      showSuccessMessage('Welcome back!');
      scheduleRedirect();
    } catch (error) {
      if (didPersistAuth) {
        rollbackAuthState();
      }

      showErrorMessage(getApiErrorMessage(error));
    } finally {
      setSubmittingState(false);
    }
  });

  async function getApiHelpers() {
    if (
      window.App.api &&
      typeof window.App.api.loginUser === 'function' &&
      typeof window.App.api.createApiKey === 'function'
    ) {
      return window.App.api;
    }

    try {
      const apiModule = await import('../js/api.js');

      if (
        window.App.api &&
        typeof window.App.api.loginUser === 'function' &&
        typeof window.App.api.createApiKey === 'function'
      ) {
        return window.App.api;
      }

      return apiModule;
    } catch {
      return null;
    }
  }

  function getAccessToken(user) {
    return typeof user?.accessToken === 'string' && user.accessToken.trim()
      ? user.accessToken.trim()
      : '';
  }

  function getApiKeyValue(apiKeyResponse) {
    if (typeof apiKeyResponse === 'string' && apiKeyResponse.trim()) {
      return apiKeyResponse.trim();
    }

    if (typeof apiKeyResponse?.key === 'string' && apiKeyResponse.key.trim()) {
      return apiKeyResponse.key.trim();
    }

    return '';
  }

  function rollbackAuthState() {
    if (!window.App.storage) {
      return;
    }

    if (typeof window.App.storage.logout === 'function') {
      window.App.storage.logout();
    }

    if (window.App.ui && typeof window.App.ui.updateNavbar === 'function') {
      window.App.ui.updateNavbar();
    }
  }

  function scheduleRedirect() {
    if (redirectTimer) {
      window.clearTimeout(redirectTimer);
    }

    redirectTimer = window.setTimeout(function redirectToHome() {
      window.location.href = '../index.html';
    }, 1200);
  }

  function setSubmittingState(isSubmitting) {
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? 'Logging in...' : defaultSubmitText;
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

    return 'Unable to log in. Please try again.';
  }
});
