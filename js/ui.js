window.App = window.App || {};

window.App.ui = window.App.ui || {};

(function initializeUi(App) {
  const LOADER_SELECTOR = '[data-ui-loader]';
  const MESSAGE_SELECTOR = '.error-message, .success-message';
  const NAVBAR_SUBDIRECTORIES = ['account', 'cart', 'checkout', 'product', 'success'];

  function ensureUiStyles() {
    if (document.getElementById('app-ui-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'app-ui-styles';
    style.textContent = `
      .loader[data-ui-loader] {
        width: 2rem;
        height: 2rem;
        border: 3px solid rgba(15, 23, 42, 0.15);
        border-top-color: #0f172a;
        border-radius: 50%;
        animation: app-ui-spin 0.8s linear infinite;
        margin: 0.75rem auto;
      }

      .error-message,
      .success-message {
        margin-top: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 0.75rem;
        border: 1px solid transparent;
        font-size: 0.95rem;
        line-height: 1.4;
      }

      .error-message {
        color: #991b1b;
        background: #fee2e2;
        border-color: #fecaca;
      }

      .success-message {
        color: #166534;
        background: #dcfce7;
        border-color: #bbf7d0;
      }

      .nav-logged-in {
        display: inline-flex;
        align-items: center;
        gap: 0.75rem;
      }

      [data-nav-logout] {
        min-height: 2.5rem;
        padding: 0.65rem 1rem;
        border: 0;
        border-radius: 999px;
        background: #0f172a;
        color: #ffffff;
        cursor: pointer;
        font: inherit;
      }

      [data-cart-count] {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 1.25rem;
        height: 1.25rem;
        margin-left: 0.4rem;
        padding: 0 0.35rem;
        border-radius: 999px;
        background: #0f172a;
        color: #ffffff;
        font-size: 0.75rem;
        font-weight: 700;
        line-height: 1;
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
    return App.storage && typeof App.storage === 'object' ? App.storage : null;
  }

  function setVisibility(element, isVisible) {
    if (!element) {
      return;
    }

    if (isVisible) {
      element.hidden = false;
      element.setAttribute('aria-hidden', 'false');
      element.style.removeProperty('display');
      return;
    }

    element.hidden = true;
    element.setAttribute('aria-hidden', 'true');
    element.style.display = 'none';
  }

  function toArray(elements) {
    return [...new Set(elements.filter(Boolean))];
  }

  function getSiteNav() {
    return document.querySelector('.site-nav');
  }

  function getCartLink(nav) {
    if (!nav) {
      return null;
    }

    return (
      nav.querySelector('a.nav-cart') ||
      nav.querySelector('a[href$="/cart/index.html"]') ||
      nav.querySelector('a[href*="cart/index.html"]') ||
      null
    );
  }

  function ensureCartBadge(nav) {
    const existingBadge = document.querySelector('[data-cart-count]');

    if (existingBadge) {
      return existingBadge;
    }

    const cartLink = getCartLink(nav);

    if (!cartLink) {
      return null;
    }

    cartLink.classList.add('nav-cart');

    const badge = document.createElement('span');
    badge.setAttribute('data-cart-count', '');
    badge.setAttribute('aria-live', 'polite');
    badge.hidden = true;
    badge.style.display = 'none';
    cartLink.appendChild(badge);

    return badge;
  }

  function ensureFallbackLoggedInState(nav) {
    if (!nav) {
      return {};
    }

    let loggedInGroup = document.querySelector('.nav-logged-in');
    let username = document.querySelector('[data-nav-username]');
    let logoutButton = document.querySelector('[data-nav-logout]');

    if (!loggedInGroup && !username && !logoutButton) {
      loggedInGroup = document.createElement('span');
      loggedInGroup.className = 'nav-logged-in';
      loggedInGroup.hidden = true;
      loggedInGroup.setAttribute('aria-hidden', 'true');
      loggedInGroup.style.display = 'none';

      username = document.createElement('span');
      username.setAttribute('data-nav-username', '');

      logoutButton = document.createElement('button');
      logoutButton.type = 'button';
      logoutButton.textContent = 'Logout';
      logoutButton.setAttribute('data-nav-logout', '');

      loggedInGroup.appendChild(username);
      loggedInGroup.appendChild(logoutButton);
      nav.appendChild(loggedInGroup);

      return { loggedInGroup, username, logoutButton };
    }

    if (!loggedInGroup && (username || logoutButton)) {
      loggedInGroup = document.createElement('span');
      loggedInGroup.className = 'nav-logged-in';
      loggedInGroup.hidden = true;
      loggedInGroup.setAttribute('aria-hidden', 'true');
      loggedInGroup.style.display = 'none';

      if (username) {
        loggedInGroup.appendChild(username);
      }

      if (logoutButton) {
        loggedInGroup.appendChild(logoutButton);
      }

      nav.appendChild(loggedInGroup);
    }

    if (loggedInGroup && !username) {
      username = document.createElement('span');
      username.setAttribute('data-nav-username', '');
      loggedInGroup.insertBefore(username, loggedInGroup.firstChild);
    }

    if (loggedInGroup && !logoutButton) {
      logoutButton = document.createElement('button');
      logoutButton.type = 'button';
      logoutButton.textContent = 'Logout';
      logoutButton.setAttribute('data-nav-logout', '');
      loggedInGroup.appendChild(logoutButton);
    }

    return { loggedInGroup, username, logoutButton };
  }

  function getNavbarStateElements() {
    const nav = getSiteNav();

    if (!nav) {
      return {
        nav: null,
        loggedOutElements: [],
        loggedInElements: [],
        username: null,
        logoutButton: null,
        cartBadge: null,
      };
    }

    const fallbackState = ensureFallbackLoggedInState(nav);
    const loginLink =
      document.querySelector('[data-nav-login]') || nav.querySelector('a[href*="login.html"]');
    const registerLink = nav.querySelector('a[href*="register.html"]');
    const loggedOutGroup = document.querySelector('.nav-logged-out');
    const loggedInGroup =
      document.querySelector('.nav-logged-in') || fallbackState.loggedInGroup || null;
    const username =
      document.querySelector('[data-nav-username]') || fallbackState.username || null;
    const logoutButton =
      document.querySelector('[data-nav-logout]') || fallbackState.logoutButton || null;
    const cartBadge = ensureCartBadge(nav);

    return {
      nav,
      loggedOutElements: toArray([loggedOutGroup, loginLink, registerLink]),
      loggedInElements: toArray([loggedInGroup, username, logoutButton]),
      username,
      logoutButton,
      cartBadge,
    };
  }

  function getHomeUrl() {
    const siteLogo = document.querySelector('.site-logo[href]');

    if (siteLogo?.href) {
      return siteLogo.href;
    }

    const pathname = window.location.pathname || '';
    const isSubdirectoryPage = NAVBAR_SUBDIRECTORIES.some((segment) =>
      pathname.includes(`/${segment}/`),
    );

    return new URL(isSubdirectoryPage ? '../index.html' : './index.html', window.location.href)
      .href;
  }

  function bindLogoutHandler(button) {
    if (!button || button.dataset.uiLogoutBound === 'true') {
      return;
    }

    button.addEventListener('click', App.ui.handleLogout);
    button.dataset.uiLogoutBound = 'true';
  }

  Object.assign(App.ui, {
    setPageTitle(title) {
      document.title = title;
    },

    showLoader(container) {
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
    },

    hideLoader(container) {
      if (!(container instanceof Element)) {
        return;
      }

      const loader = container.querySelector(LOADER_SELECTOR);

      if (loader) {
        loader.remove();
      }
    },

    showError(container, message) {
      if (!(container instanceof Element)) {
        return null;
      }

      ensureUiStyles();
      App.ui.clearMessages(container);

      const error = document.createElement('div');
      error.className = 'error-message';
      error.setAttribute('role', 'alert');
      error.textContent = String(message || 'Something went wrong.');
      container.appendChild(error);

      return error;
    },

    showSuccess(container, message) {
      if (!(container instanceof Element)) {
        return null;
      }

      ensureUiStyles();
      App.ui.clearMessages(container);

      const success = document.createElement('div');
      success.className = 'success-message';
      success.setAttribute('role', 'status');
      success.textContent = String(message || 'Success.');
      container.appendChild(success);

      return success;
    },

    clearMessages(container) {
      if (!(container instanceof Element)) {
        return;
      }

      container.querySelectorAll(MESSAGE_SELECTOR).forEach((message) => {
        message.remove();
      });
    },

    updateCartBadge() {
      const storage = getStorage();
      const count =
        storage && typeof storage.getCartCount === 'function' ? storage.getCartCount() : 0;
      const { nav, cartBadge } = getNavbarStateElements();

      if (!nav || !cartBadge) {
        return;
      }

      cartBadge.textContent = String(count);
      setVisibility(cartBadge, count > 0);
    },

    updateNavbar() {
      ensureUiStyles();

      const storage = getStorage();
      const isLoggedIn =
        storage && typeof storage.isLoggedIn === 'function' ? storage.isLoggedIn() : false;
      const user = storage && typeof storage.getUser === 'function' ? storage.getUser() : null;
      const navbarState = getNavbarStateElements();

      if (!navbarState.nav) {
        return;
      }

      navbarState.loggedOutElements.forEach((element) => {
        if (element === navbarState.logoutButton) {
          return;
        }

        setVisibility(element, !isLoggedIn);
      });

      navbarState.loggedInElements.forEach((element) => {
        setVisibility(element, isLoggedIn);
      });

      if (navbarState.username) {
        navbarState.username.textContent = isLoggedIn ? user?.name || 'Account' : '';
      }

      bindLogoutHandler(navbarState.logoutButton);
      App.ui.updateCartBadge();
    },

    handleLogout(event) {
      if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
      }

      const storage = getStorage();

      if (storage && typeof storage.logout === 'function') {
        storage.logout();
      }

      App.ui.updateNavbar();
      window.location.href = getHomeUrl();
    },
  });
})(window.App);
