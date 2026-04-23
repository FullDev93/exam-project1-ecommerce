window.App = window.App || {};

window.App.ready = function ready(callback) {
  if (typeof callback !== 'function') {
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
    return;
  }

  callback();
};

// Share the common page title and page-name setup across simple page scripts.
window.App.initPage = function initPage(pageName, pageTitle) {
  if (typeof pageName === 'string' && pageName.trim()) {
    document.body.dataset.page = pageName.trim();
  }

  if (window.App.ui && typeof window.App.ui.setPageTitle === 'function') {
    window.App.ui.setPageTitle(pageTitle);
  }
};

document.addEventListener('DOMContentLoaded', function onAppReady() {
  const ui = window.App.ui;

  if (!ui || typeof ui !== 'object') {
    return;
  }

  if (typeof ui.updateNavbar === 'function') {
    ui.updateNavbar();
  } else if (typeof ui.updateCartBadge === 'function') {
    ui.updateCartBadge();
  }
});
