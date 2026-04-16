window.App = window.App || {};
window.App.ui = window.App.ui || {};

const LOADER_SELECTOR = '[data-ui-loader]';
const MESSAGE_SELECTOR = '.error-message, .success-message';
const SUBDIRECTORY_PAGES = ['account', 'cart', 'checkout', 'product', 'success'];
const UI_STYLE_ID = 'app-ui-styles';

function ensureUiStyles() {
  if (document.getElementById(UI_STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = UI_STYLE_ID;
  style.textContent = `
    .loader[data-ui-loader] {
      width: 2rem;
      height: 2rem;
      border: 3px solid rgba(15, 23, 42, 0.15);
      border-top-color: #0f172a;
      border-radius: 999px;
      animation: app-ui-spin 0.8s linear infinite;
      margin-top: 0.75rem;
    }

    .error-message,
    .success-message {
      margin-top: 0.75rem;
      padding: 0.75rem 1rem;
      border: 1px solid transparent;
      border-radius: 0.75rem;
      font-size: 0.95rem;
      line-height: 1.4;
    }

    .error-message {
      color: #991b1b;
      background-color: #fee2e2;
      border-color: #fecaca;
    }

    .success-message {
      color: #166534;
      background-color: #dcfce7;
      border-color: #bbf7d0;
    }

    .nav-logged-in {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-cart {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .badge[data-cart-count] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.25rem;
      height: 1.25rem;
      padding: 0 0.35rem;
      border-radius: 999px;
      background-color: #0f172a;
      color: #ffffff;
      font-size: 0.75rem;
      font-weight: 700;
      line-height: 1;
    }

    [data-nav-logout] {
      min-height: 2.25rem;
      padding: 0.55rem 0.9rem;
      border: 0;
      border-radius: 999px;
      background-color: #0f172a;
      color: #ffffff;
      cursor: pointer;
      font: inherit;
    }

    @keyframes app-ui-spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  document.head.appendChild(style);
}

function getStorage() {
  return window.App.storage && typeof window.App.storage === 'object' ? window.App.storage : null;
}

function setVisibility(element, isVisible) {
  if (!(element instanceof Element)) {
    return;
  }

  element.hidden = !isVisible;
}

function getSiteNav() {
  return document.querySelector('.site-nav');
}

function getCartLink() {
  const nav = getSiteNav();

  if (!nav) {
    return null;
  }

  return nav.querySelector('.nav-cart') || nav.querySelector('a[href*="cart/index.html"]');
}

function getCartBadge() {
  const existingBadge = document.querySelector('[data-cart-count]');

  if (existingBadge) {
    return existingBadge;
  }

  const cartLink = getCartLink();

  if (!cartLink) {
    return null;
  }

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.setAttribute('data-cart-count', '');
  badge.setAttribute('aria-live', 'polite');
  badge.hidden = true;
  cartLink.appendChild(badge);

  return badge;
}

function getNavbarElements(nav) {
  if (!nav) {
    return {
      loggedOutGroup: null,
      loggedInGroup: null,
      loginLink: null,
      registerLink: null,
      username: null,
      logoutButton: null,
      cartLink: null,
      cartBadge: null,
    };
  }

  const loggedOutGroup = nav.querySelector('.nav-logged-out');
  const loggedInGroup = nav.querySelector('.nav-logged-in');
  const loginLink =
    nav.querySelector('[data-nav-login]') || nav.querySelector('a[href*="login.html"]');
  const registerLink = loggedOutGroup
    ? loggedOutGroup.querySelector('a[href*="register.html"]')
    : nav.querySelector('a[href*="register.html"]');
  const username = nav.querySelector('[data-nav-username]');
  const logoutButton = nav.querySelector('[data-nav-logout]');
  const cartLink = getCartLink();
  const cartBadge = getCartBadge();

  return {
    loggedOutGroup,
    loggedInGroup,
    loginLink,
    registerLink,
    username,
    logoutButton,
    cartLink,
    cartBadge,
  };
}

function getHomeUrl() {
  const logoLink = document.querySelector('.site-logo[href]');

  if (logoLink) {
    return logoLink.getAttribute('href');
  }

  const path = window.location.pathname || '';
  const isSubdirectoryPage = SUBDIRECTORY_PAGES.some((page) => path.includes(`/${page}/`));

  return isSubdirectoryPage ? '../index.html' : './index.html';
}

window.App.ui.showLoader = function showLoader(container) {
  if (!(container instanceof Element)) {
    return null;
  }

  ensureUiStyles();

  const existingLoader = container.querySelector(LOADER_SELECTOR);

  if (existingLoader) {
    return existingLoader;
  }

  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.setAttribute('data-ui-loader', '');
  loader.setAttribute('aria-hidden', 'true');
  container.appendChild(loader);

  return loader;
};

window.App.ui.hideLoader = function hideLoader(container) {
  if (!(container instanceof Element)) {
    return;
  }

  const loader = container.querySelector(LOADER_SELECTOR);

  if (loader) {
    loader.remove();
  }
};

window.App.ui.clearMessages = function clearMessages(container) {
  if (!(container instanceof Element)) {
    return;
  }

  container.querySelectorAll(MESSAGE_SELECTOR).forEach((message) => {
    message.remove();
  });
};

window.App.ui.showError = function showError(container, message) {
  if (!(container instanceof Element)) {
    return null;
  }

  ensureUiStyles();

  window.App.ui.clearMessages(container);

  const error = document.createElement('div');
  error.className = 'error-message';
  error.setAttribute('role', 'alert');
  error.textContent = String(message || 'Something went wrong.');
  container.appendChild(error);

  return error;
};

window.App.ui.showSuccess = function showSuccess(container, message) {
  if (!(container instanceof Element)) {
    return null;
  }

  ensureUiStyles();

  window.App.ui.clearMessages(container);

  const success = document.createElement('div');
  success.className = 'success-message';
  success.setAttribute('role', 'status');
  success.textContent = String(message || 'Success.');
  container.appendChild(success);

  return success;
};

window.App.ui.updateCartBadge = function updateCartBadge() {
  ensureUiStyles();

  const storage = getStorage();
  const badge = getCartBadge();

  if (!badge) {
    return;
  }

  const count = storage && typeof storage.getCartCount === 'function' ? storage.getCartCount() : 0;

  badge.textContent = String(count);
  badge.hidden = count <= 0;
};

window.App.ui.updateNavbar = function updateNavbar() {
  ensureUiStyles();

  const storage = getStorage();
  const isLoggedIn =
    storage && typeof storage.isLoggedIn === 'function' ? storage.isLoggedIn() : false;
  const user = storage && typeof storage.getUser === 'function' ? storage.getUser() : null;

  const nav = getSiteNav();

  if (!nav) {
    window.App.ui.updateCartBadge();
    return;
  }

  const {
    loggedOutGroup,
    loggedInGroup,
    loginLink,
    registerLink,
    username,
    logoutButton,
    cartLink,
  } = getNavbarElements(nav);

  if (loggedOutGroup) {
    setVisibility(loggedOutGroup, !isLoggedIn);
  } else {
    setVisibility(loginLink, !isLoggedIn);
    setVisibility(registerLink, !isLoggedIn);
  }

  if (loggedInGroup) {
    setVisibility(loggedInGroup, isLoggedIn);
  } else {
    setVisibility(username, isLoggedIn);
    setVisibility(logoutButton, isLoggedIn);

    if (cartLink && cartLink.classList.contains('nav-cart')) {
      setVisibility(cartLink, isLoggedIn);
    }
  }

  if (username) {
    username.textContent = isLoggedIn ? user?.name || 'Account' : '';
  }

  if (logoutButton && logoutButton.dataset.uiLogoutBound !== 'true') {
    logoutButton.addEventListener('click', window.App.ui.handleLogout);
    logoutButton.dataset.uiLogoutBound = 'true';
  }

  window.App.ui.updateCartBadge();
};

window.App.ui.handleLogout = function handleLogout(event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }

  const storage = getStorage();

  if (storage && typeof storage.logout === 'function') {
    storage.logout();
  }

  window.App.ui.updateNavbar();
  window.location.href = getHomeUrl();
};
