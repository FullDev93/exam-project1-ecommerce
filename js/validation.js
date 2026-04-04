window.App = window.App || {};

window.App.validation = {
  required(value) {
    return String(value || '').trim().length > 0;
  },
};
