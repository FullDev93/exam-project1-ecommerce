window.App = window.App || {};

const STORAGE_KEYS = Object.freeze({
  token: 'authToken',
  user: 'user',
  apiKey: 'apiKey',
  cart: 'cart',
});

function readRaw(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function removeRaw(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function parseJson(value, fallback = null) {
  if (value === null) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readJson(key, fallback = null) {
  return parseJson(readRaw(key), fallback);
}

function writeJson(key, value) {
  try {
    return writeRaw(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeId(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function toNumber(value, fallback = 0) {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function toOptionalNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function normalizeQuantity(quantity = 1) {
  const parsedQuantity = Math.floor(Number(quantity));

  return parsedQuantity > 0 ? parsedQuantity : 1;
}

function getProductImage(product) {
  if (typeof product?.image === 'string') {
    return product.image;
  }

  if (typeof product?.image?.url === 'string') {
    return product.image.url;
  }

  if (Array.isArray(product?.images) && product.images.length > 0) {
    const firstImage = product.images[0];

    if (typeof firstImage === 'string') {
      return firstImage;
    }

    if (typeof firstImage?.url === 'string') {
      return firstImage.url;
    }
  }

  return '';
}

function normalizeCartItem(product, quantity = 1) {
  if (!isObject(product)) {
    return null;
  }

  const id = normalizeId(product.id);

  if (!id) {
    return null;
  }

  return {
    id,
    title: typeof product.title === 'string' ? product.title : '',
    price: toNumber(product.price, 0),
    discountedPrice: toOptionalNumber(product.discountedPrice),
    image: getProductImage(product),
    quantity: normalizeQuantity(quantity),
  };
}

function sanitizeCart(cart) {
  if (!Array.isArray(cart)) {
    return [];
  }

  return cart.reduce((items, item) => {
    const normalizedItem = normalizeCartItem(item, item?.quantity);

    if (normalizedItem) {
      items.push(normalizedItem);
    }

    return items;
  }, []);
}

function readStoredString(key) {
  const value = readRaw(key);

  if (typeof value !== 'string') {
    return null;
  }

  const parsedValue = parseJson(value, value);

  if (typeof parsedValue !== 'string') {
    return null;
  }

  const trimmedValue = parsedValue.trim();

  return trimmedValue || null;
}

function saveStoredString(key, value) {
  const normalizedValue = typeof value === 'string' ? value.trim() : '';

  if (!normalizedValue) {
    removeRaw(key);
    return null;
  }

  writeJson(key, normalizedValue);

  return normalizedValue;
}

const storage = {
  keys: STORAGE_KEYS,

  get(key, fallback = null) {
    return readJson(key, fallback);
  },

  set(key, value) {
    return writeJson(key, value);
  },

  remove(key) {
    return removeRaw(key);
  },

  saveToken(token) {
    return saveStoredString(STORAGE_KEYS.token, token);
  },

  getToken() {
    return readStoredString(STORAGE_KEYS.token);
  },

  removeToken() {
    return removeRaw(STORAGE_KEYS.token);
  },

  saveUser(user) {
    if (!isObject(user)) {
      return null;
    }

    writeJson(STORAGE_KEYS.user, user);

    return user;
  },

  getUser() {
    const user = readJson(STORAGE_KEYS.user, null);

    return isObject(user) ? user : null;
  },

  removeUser() {
    return removeRaw(STORAGE_KEYS.user);
  },

  saveApiKey(key) {
    return saveStoredString(STORAGE_KEYS.apiKey, key);
  },

  getApiKey() {
    return readStoredString(STORAGE_KEYS.apiKey);
  },

  isLoggedIn() {
    return Boolean(storage.getToken());
  },

  logout() {
    storage.removeToken();
    storage.removeUser();
    removeRaw(STORAGE_KEYS.apiKey);
  },

  getCart() {
    return sanitizeCart(readJson(STORAGE_KEYS.cart, []));
  },

  saveCart(cart) {
    if (!Array.isArray(cart)) {
      return storage.getCart();
    }

    const nextCart = sanitizeCart(cart);
    writeJson(STORAGE_KEYS.cart, nextCart);

    return nextCart;
  },

  addToCart(product) {
    const cartItem = normalizeCartItem(product);
    const cart = storage.getCart();

    if (!cartItem) {
      return cart;
    }

    const existingItem = cart.find((item) => item.id === cartItem.id);

    if (existingItem) {
      existingItem.title = cartItem.title;
      existingItem.price = cartItem.price;
      existingItem.discountedPrice = cartItem.discountedPrice;
      existingItem.image = cartItem.image;
      existingItem.quantity += 1;
    } else {
      cart.push(cartItem);
    }

    return storage.saveCart(cart);
  },

  removeFromCart(productId) {
    const id = normalizeId(productId);

    if (!id) {
      return storage.getCart();
    }

    return storage.saveCart(storage.getCart().filter((item) => item.id !== id));
  },

  updateQuantity(productId, quantity) {
    const id = normalizeId(productId);
    const parsedQuantity = Number(quantity);
    const cart = storage.getCart();

    if (!id || !Number.isFinite(parsedQuantity)) {
      return cart;
    }

    if (parsedQuantity <= 0) {
      return storage.removeFromCart(id);
    }

    const nextCart = cart.map((item) => {
      if (item.id !== id) {
        return item;
      }

      return {
        ...item,
        quantity: normalizeQuantity(parsedQuantity),
      };
    });

    return storage.saveCart(nextCart);
  },

  clearCart() {
    removeRaw(STORAGE_KEYS.cart);
    return [];
  },

  getCartCount() {
    return storage.getCart().reduce((count, item) => count + item.quantity, 0);
  },

  getCartTotal() {
    const total = storage.getCart().reduce((sum, item) => {
      const unitPrice = item.discountedPrice ?? item.price;

      return sum + unitPrice * item.quantity;
    }, 0);

    return Number(total.toFixed(2));
  },
};

window.App.storage = storage;
