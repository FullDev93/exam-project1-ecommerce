window.App = window.App || {};

window.App.api = {
  async get(path) {
    return fetch(path);
  }
};
