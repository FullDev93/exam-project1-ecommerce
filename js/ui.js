window.App = window.App || {};
window.App.ui = window.App.ui || {};

const LOADER_SELECTOR = '[data-ui-loader]';
const MESSAGE_SELECTOR = '.error-message, .success-message';
const SUBDIRECTORY_PAGES = ['account', 'cart', 'checkout', 'product', 'success'];

function getStorage() {
  return window.App.storage && typeof window.App.storage === 'object' ? window.App.storage : null;
}

function normalizeCount(value) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return 0;
  }

  return Math.floor(parsedValue);
}

function getUserDisplayName(user) {
  const name = typeof user?.name === 'string' ? user.name.trim() : '';

  return name || 'Account';
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
    existingBadge.setAttribute('aria-hidden', 'true');
    return existingBadge;
  }

  const cartLink = getCartLink();

  if (!cartLink) {
    return null;
  }

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.setAttribute('data-cart-count', '');
  badge.setAttribute('aria-hidden', 'true');
  badge.hidden = true;
  cartLink.appendChild(badge);

  return badge;
}

// Collect the shared navbar elements once so visibility updates stay predictable.
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

// Keep logout redirects working from both root pages and nested pages.
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

  window.App.ui.clearMessages(container);

  const success = document.createElement('div');
  success.className = 'success-message';
  success.setAttribute('role', 'status');
  success.textContent = String(message || 'Success.');
  container.appendChild(success);

  return success;
};

window.App.ui.setPageTitle = function setPageTitle(title) {
  if (typeof title !== 'string') {
    return document.title;
  }

  const normalizedTitle = title.trim();

  if (normalizedTitle) {
    document.title = normalizedTitle;
  }

  return document.title;
};

window.App.ui.updateCartBadge = function updateCartBadge() {
  const storage = getStorage();
  const badge = getCartBadge();
  const cartLink = getCartLink();

  if (!badge) {
    return;
  }

  const rawCount =
    storage && typeof storage.getCartCount === 'function' ? storage.getCartCount() : 0;
  const count = normalizeCount(rawCount);

  badge.textContent = count > 0 ? String(count) : '0';
  badge.hidden = count <= 0;

  if (cartLink) {
    cartLink.setAttribute(
      'aria-label',
      count > 0 ? `Cart, ${count} item${count === 1 ? '' : 's'}` : 'Cart',
    );
  }
};

window.App.ui.updateNavbar = function updateNavbar() {
  const storage = getStorage();
  const user = storage && typeof storage.getUser === 'function' ? storage.getUser() : null;
  const isLoggedIn =
    storage && typeof storage.isLoggedIn === 'function' ? storage.isLoggedIn() : Boolean(user);
  const displayName = getUserDisplayName(user);

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
    username.textContent = isLoggedIn ? displayName : '';
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
