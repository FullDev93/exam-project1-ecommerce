window.App.ready(function initHomePage() {
  document.body.dataset.page = 'home';
  window.App.ui.setPageTitle('Home | Mix Shope');

  var productGrid = document.getElementById('product-grid');

  if (!productGrid) {
    return;
  }

  window.App.ui.showLoader(productGrid);

  window.App.api
    .getProducts()
    .then(function (products) {
      var items = Array.isArray(products) ? products.slice(0, 12) : [];

      window.App.ui.hideLoader(productGrid);
      productGrid.innerHTML = '';

      items.forEach(function (product) {
        var card = document.createElement('article');
        card.className = 'product-card';

        var img = document.createElement('img');
        img.src = product.image && product.image.url ? product.image.url : '';
        img.alt = product.image && product.image.alt ? product.image.alt : product.title;

        var imageWrapper = document.createElement('div');
        imageWrapper.className = 'product-image-wrapper';
        imageWrapper.appendChild(img);

        var titleEl = document.createElement('h3');
        titleEl.className = 'product-title';
        titleEl.textContent = product.title;

        var hasDiscount =
          typeof product.discountedPrice === 'number' &&
          typeof product.price === 'number' &&
          product.discountedPrice < product.price;

        var currentPriceEl = document.createElement('span');
        currentPriceEl.className = 'price-current';
        currentPriceEl.textContent =
          '$' + (hasDiscount ? product.discountedPrice : product.price).toFixed(2);

        var priceWrapper = document.createElement('div');
        priceWrapper.className = 'product-price-wrapper';
        priceWrapper.appendChild(currentPriceEl);

        if (hasDiscount) {
          var oldPriceEl = document.createElement('span');
          oldPriceEl.className = 'price-old';
          oldPriceEl.textContent = '$' + product.price.toFixed(2);
          priceWrapper.appendChild(oldPriceEl);
        }

        var productInfo = document.createElement('div');
        productInfo.className = 'product-info';
        productInfo.appendChild(titleEl);
        productInfo.appendChild(priceWrapper);

        card.appendChild(imageWrapper);
        card.appendChild(productInfo);
        productGrid.appendChild(card);
      });
    })
    .catch(function () {
      window.App.ui.hideLoader(productGrid);
      productGrid.innerHTML = '';
      window.App.ui.showError(productGrid, 'Failed to load products. Please try again later.');
    });
});
