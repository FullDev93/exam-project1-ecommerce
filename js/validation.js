window.App = window.App || {};

function validateRequired(value, fieldName) {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }

  return null;
}

function validateEmail(email) {
  if (!email || !email.trim()) {
    return 'Email is required';
  }

  if (!email.includes('@')) {
    return 'Please enter a valid email';
  }

  if (!email.trim().endsWith('@stud.noroff.no')) {
    return 'Email must be a @stud.noroff.no address';
  }

  return null;
}

function validatePassword(password) {
  if (!password || !password.trim()) {
    return 'Password is required';
  }

  if (password.trim().length < 8) {
    return 'Password must be at least 8 characters';
  }

  return null;
}

function validateName(name) {
  if (!name || !name.trim()) {
    return 'Name is required';
  }

  const namePattern = /^[A-Za-z0-9_]+$/;

  if (!namePattern.test(name.trim())) {
    return 'Name can only use a-z, A-Z, 0-9, and _';
  }

  return null;
}

function showFieldError(inputElement, message) {
  if (!inputElement || !message) {
    return;
  }

  clearFieldError(inputElement);

  inputElement.classList.add('input-error');

  const errorElement = document.createElement('span');
  errorElement.className = 'error-text';
  errorElement.textContent = message;

  inputElement.insertAdjacentElement('afterend', errorElement);
}

function clearFieldError(inputElement) {
  if (!inputElement) {
    return;
  }

  inputElement.classList.remove('input-error');

  const nextElement = inputElement.nextElementSibling;

  if (nextElement && nextElement.classList.contains('error-text')) {
    nextElement.remove();
  }
}

function clearAllErrors(formElement) {
  if (!formElement) {
    return;
  }

  const inputsWithErrors = formElement.querySelectorAll('.input-error');

  inputsWithErrors.forEach((input) => {
    clearFieldError(input);
  });
}

window.App.validation = {
  validateRequired,
  validateEmail,
  validatePassword,
  validateName,
  showFieldError,
  clearFieldError,
  clearAllErrors,
};
