window.App.ready(function initCheckoutPage() {
  window.App.initPage('checkout', 'Checkout | Mix Shope');

  const form = document.querySelector('[data-checkout-form]');
  const checkoutContent = document.querySelector('[data-checkout-content]');
  const emptyState = document.querySelector('[data-checkout-empty]');
  const itemsContainer = document.querySelector('[data-checkout-items]');
  const totalElement = document.querySelector('[data-checkout-total]');
  const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
  const cardFields = document.querySelector('[data-card-fields]');
  const submitButton = document.querySelector('[data-complete-purchase]');

  if (
    !form ||
    !checkoutContent ||
    !emptyState ||
    !itemsContainer ||
    !totalElement ||
    !submitButton
  ) {
    return;
  }

  paymentOptions.forEach(function bindPaymentOption(option) {
    option.addEventListener('change', updatePaymentFieldsVisibility);
  });

  form.addEventListener('submit', handleSubmit);

  renderCheckout();
  updatePaymentFieldsVisibility();

  function getStorage() {
    return window.App.storage && typeof window.App.storage === 'object' ? window.App.storage : null;
  }

  function getValidation() {
    return window.App.validation && typeof window.App.validation === 'object'
      ? window.App.validation
      : null;
  }

  function getCart() {
    const storage = getStorage();

    if (!storage || typeof storage.getCart !== 'function') {
      return [];
    }

    const cart = storage.getCart();

    return Array.isArray(cart) ? cart : [];
  }

  function getQuantity(value) {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      return 1;
    }

    return Math.floor(parsedValue);
  }

  function getUnitPrice(item) {
    const hasDiscountedPrice =
      item?.discountedPrice !== null &&
      item?.discountedPrice !== undefined &&
      item?.discountedPrice !== '';

    if (hasDiscountedPrice) {
      const discountedPrice = Number(item.discountedPrice);

      if (Number.isFinite(discountedPrice)) {
        return discountedPrice;
      }
    }

    const price = Number(item?.price);

    return Number.isFinite(price) ? price : 0;
  }

  function getCartTotal(cart) {
    const storage = getStorage();

    if (storage && typeof storage.getCartTotal === 'function') {
      const total = Number(storage.getCartTotal());

      if (Number.isFinite(total)) {
        return total;
      }
    }

    return cart.reduce(function sumCartTotal(total, item) {
      return total + getUnitPrice(item) * getQuantity(item?.quantity);
    }, 0);
  }

  function formatCurrency(value) {
    const amount = Number(value);
    const safeAmount = Number.isFinite(amount) ? amount : 0;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(safeAmount);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, function replaceCharacter(character) {
      return (
        {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }[character] || character
      );
    });
  }

  function getItemTitle(item) {
    const title = typeof item?.title === 'string' ? item.title.trim() : '';

    return title || 'Product';
  }

  function toggleEmptyState(isEmpty) {
    checkoutContent.hidden = isEmpty;
    emptyState.hidden = !isEmpty;
  }

  function renderCheckout() {
    const cart = getCart();

    if (cart.length === 0) {
      itemsContainer.innerHTML = '';
      totalElement.textContent = formatCurrency(0);
      toggleEmptyState(true);
      submitButton.disabled = true;
      return;
    }

    toggleEmptyState(false);
    submitButton.disabled = false;
    itemsContainer.innerHTML = cart
      .map(function renderItem(item) {
        const quantity = getQuantity(item?.quantity);
        const unitPrice = getUnitPrice(item);
        const lineTotal = unitPrice * quantity;

        return `
          <article class="checkout-summary-item">
            <div class="checkout-summary-item-main">
              <h3 class="checkout-summary-item-title">${escapeHtml(getItemTitle(item))}</h3>
              <p class="checkout-summary-item-meta">Quantity: ${quantity}</p>
            </div>
            <p class="checkout-summary-item-total">${formatCurrency(lineTotal)}</p>
          </article>
        `;
      })
      .join('');

    totalElement.textContent = formatCurrency(getCartTotal(cart));
  }

  function updatePaymentFieldsVisibility() {
    if (!cardFields) {
      return;
    }

    const selectedOption = form.querySelector('input[name="paymentMethod"]:checked');
    const showCardFields = selectedOption ? selectedOption.value === 'credit-card' : false;

    cardFields.hidden = !showCardFields;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validation = getValidation();
    const cart = getCart();

    if (validation && typeof validation.clearAllErrors === 'function') {
      validation.clearAllErrors(form);
    }

    if (cart.length === 0) {
      toggleEmptyState(true);
      return;
    }

    const fields = [
      { input: form.elements.fullName, label: 'Full Name' },
      { input: form.elements.streetAddress, label: 'Street Address' },
      { input: form.elements.city, label: 'City' },
      { input: form.elements.postalCode, label: 'Postal / ZIP Code' },
      { input: form.elements.country, label: 'Country' },
    ];

    let hasErrors = false;

    fields.forEach(function validateField(field) {
      const value = typeof field.input?.value === 'string' ? field.input.value : '';
      const error =
        validation && typeof validation.validateRequired === 'function'
          ? validation.validateRequired(value, field.label)
          : !value.trim()
            ? `${field.label} is required`
            : null;

      if (error && validation && typeof validation.showFieldError === 'function') {
        validation.showFieldError(field.input, error);
        hasErrors = true;
        return;
      }

      if (error) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      return;
    }

    completePurchase();
  }

  function completePurchase() {
    const storage = getStorage();

    submitButton.disabled = true;
    submitButton.textContent = 'Completing Purchase...';

    if (storage && typeof storage.clearCart === 'function') {
      storage.clearCart();
    }

    if (window.App.ui && typeof window.App.ui.updateCartBadge === 'function') {
      window.App.ui.updateCartBadge();
    }

    window.location.href = '../success/index.html';
  }
});
