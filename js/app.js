window.App = window.App || {};

document.addEventListener('DOMContentLoaded', function onAppReady() {
  const ui = window.App.ui;

  if (!ui || typeof ui !== 'object') {
    return;
  }

  if (typeof ui.updateNavbar === 'function') {
    ui.updateNavbar();
  }

  if (typeof ui.updateCartBadge === 'function') {
    ui.updateCartBadge();
  }
});
