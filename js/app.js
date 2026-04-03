window.App = window.App || {};

window.App.ready = function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
    return;
  }

  callback();
};
