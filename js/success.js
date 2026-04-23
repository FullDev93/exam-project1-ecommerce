window.App.ready(function initSuccessPage() {
  window.App.initPage('success', 'Success | Mix Shope');

  const storage =
    window.App.storage && typeof window.App.storage === 'object' ? window.App.storage : null;
  const ui = window.App.ui && typeof window.App.ui === 'object' ? window.App.ui : null;
  const orderNumberWrapper = document.querySelector('[data-success-order-number]');
  const orderNumberElement = document.querySelector('[data-order-number]');

  if (storage && typeof storage.clearCart === 'function') {
    storage.clearCart();
  }

  if (ui && typeof ui.updateCartBadge === 'function') {
    ui.updateCartBadge();
  }

  if (orderNumberWrapper && orderNumberElement) {
    orderNumberElement.textContent = createOrderNumber();
    orderNumberWrapper.hidden = false;
  }

  function createOrderNumber() {
    const randomNumber = Math.floor(10000 + Math.random() * 90000);

    return `MS-${randomNumber}`;
  }
});
