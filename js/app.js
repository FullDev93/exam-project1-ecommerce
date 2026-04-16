window.App = window.App || {};

document.addEventListener('DOMContentLoaded', function onAppReady() {
  if (window.App.ui && typeof window.App.ui.updateNavbar === 'function') {
    window.App.ui.updateNavbar();
  }
});
