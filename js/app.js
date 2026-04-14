window.App = window.App || {};

window.App.ready = function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
    return;
  }

  callback();
};

function initializeNavbarState() {
  const ui = window.App.ui;

  if (!ui) {
    return false;
  }

  if (typeof ui.updateNavbar === 'function') {
    ui.updateNavbar();
  }

  if (typeof ui.updateCartBadge === 'function') {
    ui.updateCartBadge();
  }

  return true;
}

window.App.ready(function onAppReady() {
  if (!initializeNavbarState()) {
    window.addEventListener('load', initializeNavbarState, { once: true });
  }
});
