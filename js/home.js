window.App.ready(function initHomePage() {
  document.body.dataset.page = 'home';
  window.App.ui.setPageTitle('Home | Mix Shope');

  var placeholderImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%236b7280' font-family='Arial' font-size='32'%3EProduct%3C/text%3E%3C/svg%3E";
  var productGrid = document.getElementById('product-grid');

  if (!productGrid) {
    return;
  }

  var carouselSlides = document.querySelector('.carousel-slides');
  var prevBtn = document.querySelector('.carousel-btn.prev');
  var nextBtn = document.querySelector('.carousel-btn.next');

  window.App.ui.showLoader(productGrid);

  window.App.api
    .getProducts()
    .then(function (products) {
      var items = Array.isArray(products) ? products.filter(isRenderableProduct).slice(0, 12) : [];

      window.App.ui.hideLoader(productGrid);
      productGrid.innerHTML = '';

      if (items.length === 0) {
        window.App.ui.showError(productGrid, 'No products available right now.');
        return;
      }

      items.forEach(function (product) {
        var title = getProductTitle(product);
        var price = getProductPrice(product);
        var discountedPrice = getProductDiscountedPrice(product);
        var card = document.createElement('a');
        card.className = 'product-card';
        card.href = './product/index.html?id=' + encodeURIComponent(product.id);

        var img = document.createElement('img');
        img.src = getProductImageUrl(product);
        img.alt = getProductImageAlt(product, title);
        img.loading = 'lazy';

        var imageWrapper = document.createElement('div');
        imageWrapper.className = 'product-image-wrapper';
        imageWrapper.appendChild(img);

        var titleEl = document.createElement('h3');
        titleEl.className = 'product-title';
        titleEl.textContent = title;

        var hasDiscount =
          typeof discountedPrice === 'number' &&
          typeof price === 'number' &&
          discountedPrice < price;

        var currentPriceEl = document.createElement('span');
        currentPriceEl.className = 'price-current';
        currentPriceEl.textContent = '$' + (hasDiscount ? discountedPrice : price).toFixed(2);

        var priceWrapper = document.createElement('div');
        priceWrapper.className = 'product-price-wrapper';
        priceWrapper.appendChild(currentPriceEl);

        if (hasDiscount) {
          var oldPriceEl = document.createElement('span');
          oldPriceEl.className = 'price-old';
          oldPriceEl.textContent = '$' + price.toFixed(2);
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

      if (carouselSlides && items.length > 0) {
        buildCarousel(items.slice(0, 3));
      }
    })
    .catch(function () {
      window.App.ui.hideLoader(productGrid);
      productGrid.innerHTML = '';
      window.App.ui.showError(productGrid, 'Failed to load products. Please try again later.');
    });

  function buildCarousel(carouselItems) {
    carouselSlides.innerHTML = '';

    carouselItems.forEach(function (product, index) {
      var imageUrl = getProductImageUrl(product);
      var rawDesc = typeof product.description === 'string' ? product.description : '';
      var shortDesc = rawDesc.length > 120 ? rawDesc.slice(0, 120).trimEnd() + '\u2026' : rawDesc;
      var price = getProductPrice(product);
      if (!shortDesc && typeof price === 'number') {
        shortDesc = '$' + price.toFixed(2);
      }

      var slide = document.createElement('article');
      slide.className = 'carousel-slide' + (index === 0 ? ' is-active' : '');
      if (index !== 0) {
        slide.setAttribute('aria-hidden', 'true');
      }
      slide.style.setProperty('--slide-image', 'url(' + imageUrl + ')');

      var content = document.createElement('div');
      content.className = 'carousel-content';

      var heading = document.createElement('h2');
      heading.textContent = getProductTitle(product);

      var desc = document.createElement('p');
      desc.textContent = shortDesc;

      var viewBtn = document.createElement('a');
      viewBtn.href = './product/index.html?id=' + encodeURIComponent(product.id);
      viewBtn.className = 'btn-primary carousel-view-btn';
      viewBtn.textContent = 'View Product';

      content.appendChild(heading);
      content.appendChild(desc);
      content.appendChild(viewBtn);
      slide.appendChild(content);
      carouselSlides.appendChild(slide);
    });

    initCarouselControls();
  }

  function initCarouselControls() {
    var currentIndex = 0;
    var slides = carouselSlides.querySelectorAll('.carousel-slide');
    var dots = Array.from(document.querySelectorAll('.indicator'));

    if (slides.length === 0) {
      return;
    }

    if (prevBtn) {
      prevBtn.hidden = slides.length <= 1;
    }

    if (nextBtn) {
      nextBtn.hidden = slides.length <= 1;
    }

    dots.forEach(function setInitialIndicatorState(dot, index) {
      dot.hidden = index >= slides.length;

      if (index === currentIndex && index < slides.length) {
        dot.classList.add('active');
        dot.setAttribute('aria-current', 'true');
        return;
      }

      dot.classList.remove('active');
      dot.removeAttribute('aria-current');
    });

    function goTo(index) {
      if (slides.length === 0) {
        return;
      }

      slides[currentIndex].classList.remove('is-active');
      slides[currentIndex].setAttribute('aria-hidden', 'true');

      if (dots[currentIndex]) {
        dots[currentIndex].classList.remove('active');
        dots[currentIndex].removeAttribute('aria-current');
      }

      currentIndex = (index + slides.length) % slides.length;

      slides[currentIndex].classList.add('is-active');
      slides[currentIndex].removeAttribute('aria-hidden');

      if (dots[currentIndex]) {
        dots[currentIndex].classList.add('active');
        dots[currentIndex].setAttribute('aria-current', 'true');
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goTo(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goTo(currentIndex + 1);
      });
    }

    dots.slice(0, slides.length).forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goTo(i);
      });
    });
  }

  function getProductTitle(product) {
    return typeof product?.title === 'string' && product.title.trim()
      ? product.title.trim()
      : 'Product';
  }

  function getProductImageAlt(product, title) {
    if (product?.image && typeof product.image.alt === 'string' && product.image.alt.trim()) {
      return product.image.alt.trim();
    }

    return title ? title + ' product image' : 'Product image';
  }

  function isRenderableProduct(product) {
    return Boolean(product && product.id && typeof getProductPrice(product) === 'number');
  }

  function getProductImageUrl(product) {
    if (product?.image && typeof product.image.url === 'string' && product.image.url.trim()) {
      return product.image.url.trim();
    }

    if (typeof product?.image === 'string' && product.image.trim()) {
      return product.image.trim();
    }

    return placeholderImage;
  }

  function getProductPrice(product) {
    return toNumber(product?.price);
  }

  function getProductDiscountedPrice(product) {
    return toNumber(product?.discountedPrice);
  }

  function toNumber(value) {
    var parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : null;
  }
});
