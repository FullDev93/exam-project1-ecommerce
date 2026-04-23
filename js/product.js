window.App.ready(function initProductPage() {
  window.App.initPage('product', 'Mix Shope | Product');

  const productId = new URLSearchParams(window.location.search).get('id');
  const productContent = document.querySelector('[data-product-content]');
  const loadingState = document.querySelector('[data-loading-state]');
  const errorState = document.querySelector('[data-error-state]');
  const errorMessage = document.querySelector('[data-error-message]');
  const addToCartButton = document.querySelector('[data-add-to-cart-button]');
  const shareButton = document.querySelector('[data-share-button]');
  const loginRequiredMessage = document.querySelector('[data-login-required-message]');
  const actionFeedback = document.querySelector('[data-product-action-feedback]');
  let currentProduct = null;
  let addToCartResetTimer = null;

  const productElements = {
    title: document.querySelector('[data-product-title]'),
    image: document.querySelector('[data-product-image]'),
    badge: document.querySelector('[data-product-badge]'),
    priceCurrent: document.querySelector('[data-product-price-current]'),
    priceOriginal: document.querySelector('[data-product-price-original]'),
    priceDiscount: document.querySelector('[data-product-price-discount]'),
    description: document.querySelector('[data-product-description]'),
    tags: document.querySelector('[data-product-tags]'),
    rating: document.querySelector('[data-product-rating]'),
    ratingStars: document.querySelector('[data-product-rating-stars]'),
    ratingValue: document.querySelector('[data-product-rating-value]'),
    ratingCount: document.querySelector('[data-product-rating-count]'),
    reviews: document.querySelector('[data-product-reviews]'),
  };

  if (!productContent || !loadingState || !errorState || !errorMessage) {
    return;
  }

  bindActionEvents();

  if (!productId || !productId.trim()) {
    showErrorState('Product not found.');
    return;
  }

  showLoadingState();

  loadProduct(productId.trim());

  async function loadProduct(id) {
    if (!window.App.api || typeof window.App.api.getProductById !== 'function') {
      showErrorState('Failed to load product. Please try again.');
      return;
    }

    try {
      const product = await window.App.api.getProductById(id);

      if (!isValidProduct(product)) {
        showErrorState('Product not found.');
        return;
      }

      renderProduct(product);
      document.title = `${product.title} | Mix Shope`;
      showContentState();
    } catch (error) {
      const message = getErrorMessage(error);
      showErrorState(message);
    }
  }

  function showLoadingState() {
    currentProduct = null;
    productContent.hidden = true;
    errorState.hidden = true;
    loadingState.hidden = false;
    clearActionFeedback();
  }

  function showContentState() {
    loadingState.hidden = true;
    errorState.hidden = true;
    productContent.hidden = false;
    updateActionVisibility();
  }

  function showErrorState(message) {
    loadingState.hidden = true;
    productContent.hidden = true;
    errorState.hidden = false;
    errorMessage.textContent = message;
    clearActionFeedback();
  }

  function renderProduct(product) {
    currentProduct = product;

    const price = toNumber(product.price);
    const discountedPrice = toNumber(product.discountedPrice);
    const hasDiscount =
      typeof discountedPrice === 'number' && typeof price === 'number' && discountedPrice < price;
    const image = getProductImage(product);
    const imageAlt = getProductImageAlt(product);
    const tags = Array.isArray(product.tags) ? product.tags.filter(isNonEmptyString) : [];
    const reviews = Array.isArray(product.reviews) ? product.reviews : [];
    const rating = getRatingValue(product, reviews);

    productElements.title.textContent = product.title;
    productElements.image.src = image;
    productElements.image.alt = imageAlt;

    if (productElements.badge) {
      productElements.badge.hidden = tags.length === 0;
      if (tags.length > 0) {
        productElements.badge.textContent = tags[0];
      }
    }

    productElements.priceCurrent.textContent = formatCurrency(
      hasDiscount ? discountedPrice : price,
    );
    productElements.priceOriginal.textContent = hasDiscount ? formatCurrency(price) : '';
    productElements.priceOriginal.hidden = !hasDiscount;

    productElements.priceDiscount.textContent = hasDiscount
      ? `Save ${getSavingsPercentage(price, discountedPrice)}%`
      : '';
    productElements.priceDiscount.hidden = !hasDiscount;

    productElements.description.textContent = getDescription(product);

    renderTags(tags);
    renderRating(rating, reviews.length);
    renderReviews(reviews);
  }

  function bindActionEvents() {
    if (shareButton) {
      shareButton.addEventListener('click', handleShareClick);
    }

    if (addToCartButton) {
      addToCartButton.addEventListener('click', handleAddToCartClick);
    }
  }

  function updateActionVisibility() {
    const isLoggedIn =
      window.App.storage && typeof window.App.storage.isLoggedIn === 'function'
        ? window.App.storage.isLoggedIn()
        : false;

    if (addToCartButton) {
      addToCartButton.hidden = !isLoggedIn;
    }

    if (loginRequiredMessage) {
      loginRequiredMessage.hidden = isLoggedIn;
    }
  }

  async function handleShareClick() {
    clearActionFeedback();

    try {
      if (navigator.share) {
        await navigator.share({
          title: currentProduct?.title || document.title,
          text: currentProduct?.title || 'Check out this product.',
          url: window.location.href,
        });
        showActionSuccess('Product link shared!');
        return;
      }

      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        throw new Error('Clipboard is unavailable');
      }

      await navigator.clipboard.writeText(window.location.href);
      showActionSuccess('Link copied!');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      showActionError('Unable to copy the link.');
    }
  }

  function handleAddToCartClick() {
    clearActionFeedback();

    const isLoggedIn =
      window.App.storage && typeof window.App.storage.isLoggedIn === 'function'
        ? window.App.storage.isLoggedIn()
        : false;

    if (!isLoggedIn) {
      updateActionVisibility();
      showActionError('Please log in to add items to your cart.');
      return;
    }

    if (
      !currentProduct ||
      !window.App.storage ||
      typeof window.App.storage.addToCart !== 'function'
    ) {
      showActionError('Unable to add this product right now.');
      return;
    }

    const cartItem = {
      id: currentProduct.id,
      title: currentProduct.title,
      price: currentProduct.price,
      discountedPrice: currentProduct.discountedPrice,
      image: currentProduct.image?.url || currentProduct.image || '',
    };

    const updatedCart = window.App.storage.addToCart(cartItem);

    if (!Array.isArray(updatedCart)) {
      showActionError('Unable to add this product right now.');
      return;
    }

    if (window.App.ui && typeof window.App.ui.updateCartBadge === 'function') {
      window.App.ui.updateCartBadge();
    }

    showActionSuccess('Added to cart!');
    showAddedButtonState();
  }

  function showAddedButtonState() {
    if (!addToCartButton) {
      return;
    }

    if (addToCartResetTimer) {
      clearTimeout(addToCartResetTimer);
    }

    addToCartButton.textContent = 'Added ✓';

    addToCartResetTimer = window.setTimeout(function resetButtonLabel() {
      addToCartButton.textContent = 'Add to Cart';
      addToCartResetTimer = null;
    }, 1600);
  }

  function showActionSuccess(message) {
    if (window.App.ui && typeof window.App.ui.showSuccess === 'function') {
      window.App.ui.showSuccess(actionFeedback, message);
      return;
    }

    if (actionFeedback instanceof Element) {
      actionFeedback.textContent = message;
    }
  }

  function showActionError(message) {
    if (window.App.ui && typeof window.App.ui.showError === 'function') {
      window.App.ui.showError(actionFeedback, message);
      return;
    }

    if (actionFeedback instanceof Element) {
      actionFeedback.textContent = message;
    }
  }

  function clearActionFeedback() {
    if (window.App.ui && typeof window.App.ui.clearMessages === 'function') {
      window.App.ui.clearMessages(actionFeedback);
      return;
    }

    if (actionFeedback instanceof Element) {
      actionFeedback.textContent = '';
    }
  }

  function renderTags(tags) {
    productElements.tags.innerHTML = '';

    if (tags.length === 0) {
      productElements.tags.hidden = true;
      return;
    }

    productElements.tags.hidden = false;

    tags.forEach(function createTag(tag) {
      const tagElement = document.createElement('span');
      tagElement.className = 'product-tag';
      tagElement.textContent = tag;
      productElements.tags.appendChild(tagElement);
    });
  }

  function renderRating(rating, reviewCount) {
    const safeRating = typeof rating === 'number' ? Math.max(0, Math.min(5, rating)) : 0;
    const roundedRating = Math.round(safeRating);

    productElements.ratingStars.innerHTML = '';

    for (let index = 0; index < 5; index += 1) {
      const star = document.createElement('span');
      star.className = index < roundedRating ? 'star filled' : 'star';
      star.textContent = '★';
      productElements.ratingStars.appendChild(star);
    }

    productElements.rating.setAttribute('role', 'img');
    productElements.rating.setAttribute(
      'aria-label',
      `Rated ${safeRating.toFixed(1)} out of 5 stars`,
    );
    productElements.ratingValue.textContent = `${safeRating.toFixed(1)} rating`;
    productElements.ratingCount.textContent =
      reviewCount === 1 ? '1 review' : `${reviewCount} reviews`;
  }

  function renderReviews(reviews) {
    productElements.reviews.innerHTML = '';

    if (reviews.length === 0) {
      const emptyReview = document.createElement('article');
      emptyReview.className = 'review-item';

      const emptyText = document.createElement('p');
      emptyText.className = 'review-comment';
      emptyText.textContent = 'No reviews yet.';

      emptyReview.appendChild(emptyText);
      productElements.reviews.appendChild(emptyReview);
      return;
    }

    reviews.forEach(function createReview(review) {
      const reviewItem = document.createElement('article');
      reviewItem.className = 'review-item';

      const reviewHeader = document.createElement('div');
      reviewHeader.className = 'review-header';

      const username = document.createElement('span');
      username.className = 'review-username';
      username.textContent = isNonEmptyString(review?.username) ? review.username : 'Anonymous';

      const reviewStars = document.createElement('div');
      reviewStars.className = 'review-stars';
      reviewStars.setAttribute('role', 'img');

      const reviewRating = normalizeRating(review?.rating);
      reviewStars.setAttribute('aria-label', `${reviewRating} out of 5 stars`);

      for (let index = 0; index < 5; index += 1) {
        const star = document.createElement('span');
        star.className = index < reviewRating ? 'star filled' : 'star';
        star.textContent = '★';
        reviewStars.appendChild(star);
      }

      const comment = document.createElement('p');
      comment.className = 'review-comment';
      comment.textContent = isNonEmptyString(review?.description)
        ? review.description
        : 'No review details provided.';

      reviewHeader.appendChild(username);
      reviewHeader.appendChild(reviewStars);
      reviewItem.appendChild(reviewHeader);
      reviewItem.appendChild(comment);
      productElements.reviews.appendChild(reviewItem);
    });
  }

  function isValidProduct(product) {
    return Boolean(
      product && isNonEmptyString(product.title) && typeof toNumber(product.price) === 'number',
    );
  }

  function getProductImage(product) {
    if (isNonEmptyString(product?.image)) {
      return product.image;
    }

    if (isNonEmptyString(product?.image?.url)) {
      return product.image.url;
    }

    if (Array.isArray(product?.images) && product.images.length > 0) {
      const firstImage = product.images[0];

      if (isNonEmptyString(firstImage)) {
        return firstImage;
      }

      if (isNonEmptyString(firstImage?.url)) {
        return firstImage.url;
      }
    }

    return 'https://via.placeholder.com/900x900?text=Product';
  }

  function getProductImageAlt(product) {
    if (isNonEmptyString(product?.image?.alt)) {
      return product.image.alt;
    }

    if (Array.isArray(product?.images) && product.images.length > 0) {
      const firstImage = product.images[0];

      if (isNonEmptyString(firstImage?.alt)) {
        return firstImage.alt;
      }
    }

    return isNonEmptyString(product?.title) ? `${product.title} product image` : 'Product image';
  }

  function getDescription(product) {
    return isNonEmptyString(product?.description)
      ? product.description
      : 'No description available for this product.';
  }

  function getRatingValue(product, reviews) {
    const directRating = toNumber(product.rating);

    if (typeof directRating === 'number') {
      return directRating;
    }

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return 0;
    }

    const ratingTotal = reviews.reduce(function sumRatings(total, review) {
      const value = toNumber(review?.rating);
      return total + (typeof value === 'number' ? value : 0);
    }, 0);

    return ratingTotal / reviews.length;
  }

  function normalizeRating(value) {
    const rating = toNumber(value);

    if (typeof rating !== 'number') {
      return 0;
    }

    return Math.max(0, Math.min(5, Math.round(rating)));
  }

  function getSavingsPercentage(price, discountedPrice) {
    if (typeof price !== 'number' || typeof discountedPrice !== 'number' || price <= 0) {
      return 0;
    }

    return Math.round(((price - discountedPrice) / price) * 100);
  }

  function formatCurrency(value) {
    const amount = typeof value === 'number' ? value : 0;
    return `$${amount.toFixed(2)}`;
  }

  function toNumber(value) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  function getErrorMessage(error) {
    const message = error instanceof Error ? error.message : '';

    if (/not found|required/i.test(message)) {
      return 'Product not found.';
    }

    return 'Failed to load product. Please try again.';
  }
});
