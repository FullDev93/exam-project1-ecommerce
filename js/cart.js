window.App.ready(function initCartPage() {
  window.App.initPage('cart', 'Cart | Mix Shope');

  const cartItemsContainer = document.querySelector('[data-cart-items]');
  const cartContent = document.querySelector('[data-cart-content]');
  const cartSummary = document.querySelector('[data-cart-summary]');
  const cartEmpty = document.querySelector('[data-cart-empty]');
  const cartTotal = document.querySelector('[data-cart-total]');
  const clearCartButton = document.querySelector('[data-clear-cart]');

  if (!cartItemsContainer || !cartContent || !cartSummary || !cartEmpty || !cartTotal) {
    return;
  }

  cartItemsContainer.addEventListener('click', handleItemAction);

  if (clearCartButton) {
    clearCartButton.addEventListener('click', handleClearCart);
  }

  renderCart();

  function getStorage() {
    return window.App.storage && typeof window.App.storage === 'object' ? window.App.storage : null;
  }

  function getCart() {
    const storage = getStorage();

    if (!storage || typeof storage.getCart !== 'function') {
      return [];
    }

    const cart = storage.getCart();

    return Array.isArray(cart) ? cart : [];
  }

  function getUnitPrice(item) {
    const hasDiscountedPrice =
      item?.discountedPrice !== null &&
      item?.discountedPrice !== undefined &&
      item?.discountedPrice !== '';

    if (hasDiscountedPrice) {
      const discountedPrice = Number(item.discountedPrice);

      if (Number.isFinite(discountedPrice)) {
        return discountedPrice;
      }
    }

    const price = Number(item?.price);

    return Number.isFinite(price) ? price : 0;
  }

  function getTotalPrice(cart) {
    const storage = getStorage();

    if (storage && typeof storage.getCartTotal === 'function') {
      const total = Number(storage.getCartTotal());

      if (Number.isFinite(total)) {
        return total;
      }
    }

    return cart.reduce(function sumCartTotal(total, item) {
      return total + getUnitPrice(item) * getQuantity(item?.quantity);
    }, 0);
  }

  function getQuantity(value) {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      return 1;
    }

    return Math.floor(parsedValue);
  }

  function formatCurrency(value) {
    const amount = Number(value);
    const safeAmount = Number.isFinite(amount) ? amount : 0;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(safeAmount);
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, function replaceCharacter(character) {
      return (
        {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }[character] || character
      );
    });
  }

  function getItemImage(item) {
    const image = typeof item?.image === 'string' ? item.image.trim() : '';

    return image || 'https://via.placeholder.com/120x120?text=Product';
  }

  function getItemImageAlt(item, title) {
    const imageAlt = typeof item?.imageAlt === 'string' ? item.imageAlt.trim() : '';

    if (imageAlt) {
      return imageAlt;
    }

    return title ? `${title} product image` : 'Product image';
  }

  function getItemTitle(item) {
    const title = typeof item?.title === 'string' ? item.title.trim() : '';

    return title || 'Product';
  }

  function toggleState(hasItems) {
    cartContent.hidden = !hasItems;
    cartSummary.hidden = !hasItems;
    cartEmpty.hidden = hasItems;
  }

  function renderCart() {
    const cart = getCart();
    const hasItems = cart.length > 0;

    toggleState(hasItems);

    if (!hasItems) {
      cartItemsContainer.innerHTML = '';
      cartTotal.textContent = formatCurrency(0);
      updateCartBadge();
      return;
    }

    cartItemsContainer.innerHTML = cart
      .map(function renderCartItem(item) {
        const itemId = String(item?.id ?? '').trim();
        const quantity = getQuantity(item?.quantity);
        const unitPrice = getUnitPrice(item);
        const lineTotal = unitPrice * quantity;
        const title = getItemTitle(item);

        return `
          <article class="cart-item" data-cart-item role="listitem">
            <img
              class="cart-item-image"
              src="${escapeHtml(getItemImage(item))}"
              alt="${escapeHtml(getItemImageAlt(item, title))}"
              loading="lazy"
            />

            <div class="cart-item-details">
              <h3 class="cart-item-title">${escapeHtml(title)}</h3>
              <p class="cart-item-price">Unit price: ${formatCurrency(unitPrice)}</p>
            </div>

            <div class="cart-item-quantity" role="group" aria-label="Quantity controls for ${escapeHtml(title)}">
              <button
                type="button"
                class="cart-quantity-button"
                data-cart-action="decrease"
                data-item-id="${escapeHtml(itemId)}"
                aria-label="Decrease quantity for ${escapeHtml(title)}"
              >
                -
              </button>
              <span class="cart-quantity-value" aria-live="polite" aria-atomic="true">${quantity}</span>
              <button
                type="button"
                class="cart-quantity-button"
                data-cart-action="increase"
                data-item-id="${escapeHtml(itemId)}"
                aria-label="Increase quantity for ${escapeHtml(title)}"
              >
                +
              </button>
            </div>

            <p class="cart-item-line-total">${formatCurrency(lineTotal)}</p>

            <button
              type="button"
              class="btn-secondary cart-remove-button"
              data-cart-action="remove"
              data-item-id="${escapeHtml(itemId)}"
              aria-label="Remove ${escapeHtml(title)} from cart"
            >
              Remove
            </button>
          </article>
        `;
      })
      .join('');

    cartTotal.textContent = formatCurrency(getTotalPrice(cart));
    updateCartBadge();
  }

  function handleItemAction(event) {
    const actionButton = event.target.closest('[data-cart-action]');

    if (!actionButton) {
      return;
    }

    const storage = getStorage();
    const itemId = String(actionButton.dataset.itemId || '').trim();
    const action = actionButton.dataset.cartAction;

    if (!storage || !itemId) {
      return;
    }

    const cart = getCart();
    const cartItem = cart.find(function findCartItem(item) {
      return String(item?.id ?? '').trim() === itemId;
    });

    if (!cartItem) {
      return;
    }

    const currentQuantity = getQuantity(cartItem.quantity);

    if (action === 'increase' && typeof storage.updateQuantity === 'function') {
      storage.updateQuantity(itemId, currentQuantity + 1);
    }

    if (action === 'decrease') {
      if (currentQuantity > 1 && typeof storage.updateQuantity === 'function') {
        storage.updateQuantity(itemId, currentQuantity - 1);
      } else if (typeof storage.removeFromCart === 'function') {
        storage.removeFromCart(itemId);
      }
    }

    if (action === 'remove' && typeof storage.removeFromCart === 'function') {
      storage.removeFromCart(itemId);
    }

    renderCart();
  }

  function handleClearCart() {
    const storage = getStorage();

    if (storage && typeof storage.clearCart === 'function') {
      storage.clearCart();
    }

    renderCart();
  }

  function updateCartBadge() {
    if (window.App.ui && typeof window.App.ui.updateCartBadge === 'function') {
      window.App.ui.updateCartBadge();
    }
  }
});
