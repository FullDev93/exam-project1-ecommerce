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
  inputElement.setAttribute('aria-invalid', 'true');

  const errorElement = document.createElement('span');
  errorElement.className = 'error-text';
  errorElement.id = getFieldErrorId(inputElement);
  errorElement.setAttribute('role', 'alert');
  errorElement.dataset.errorFor = getFieldErrorKey(inputElement);
  errorElement.textContent = message;

  const formGroup = inputElement.closest('.form-group');
  const helperText = formGroup ? formGroup.querySelector('small') : null;

  if (helperText) {
    helperText.insertAdjacentElement('afterend', errorElement);
  } else {
    inputElement.insertAdjacentElement('afterend', errorElement);
  }

  addDescribedById(inputElement, errorElement.id);
}

function clearFieldError(inputElement) {
  if (!inputElement) {
    return;
  }

  inputElement.classList.remove('input-error');
  inputElement.removeAttribute('aria-invalid');

  const formGroup = inputElement.closest('.form-group');
  const errorSelector = `.error-text[data-error-for="${getFieldErrorKey(inputElement)}"]`;
  const errorElement = formGroup ? formGroup.querySelector(errorSelector) : null;

  if (errorElement) {
    removeDescribedById(inputElement, errorElement.id);
    errorElement.remove();
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

function getFieldErrorKey(inputElement) {
  if (inputElement.id) {
    return inputElement.id;
  }

  if (inputElement.name) {
    return inputElement.name;
  }

  return 'field';
}

function getFieldErrorId(inputElement) {
  return `${getFieldErrorKey(inputElement)}-error`;
}

function addDescribedById(inputElement, id) {
  if (!id) {
    return;
  }

  const describedBy = (inputElement.getAttribute('aria-describedby') || '')
    .split(/\s+/)
    .filter(Boolean);

  if (!describedBy.includes(id)) {
    describedBy.push(id);
    inputElement.setAttribute('aria-describedby', describedBy.join(' '));
  }
}

function removeDescribedById(inputElement, id) {
  if (!id) {
    return;
  }

  const describedBy = (inputElement.getAttribute('aria-describedby') || '')
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => token !== id);

  if (describedBy.length === 0) {
    inputElement.removeAttribute('aria-describedby');
    return;
  }

  inputElement.setAttribute('aria-describedby', describedBy.join(' '));
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
