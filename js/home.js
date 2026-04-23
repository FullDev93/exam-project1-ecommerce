window.App.ready(function initHomePage() {
  document.body.dataset.page = 'home';
  window.App.ui.setPageTitle('Home | Mix Shope');

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
      var items = Array.isArray(products) ? products.slice(0, 12) : [];

      window.App.ui.hideLoader(productGrid);
      productGrid.innerHTML = '';

      items.forEach(function (product) {
        var title = getProductTitle(product);
        var card = document.createElement('a');
        card.className = 'product-card';
        card.href = './product/index.html?id=' + product.id;

        var img = document.createElement('img');
        img.src = product.image && product.image.url ? product.image.url : '';
        img.alt = getProductImageAlt(product, title);
        img.loading = 'lazy';

        var imageWrapper = document.createElement('div');
        imageWrapper.className = 'product-image-wrapper';
        imageWrapper.appendChild(img);

        var titleEl = document.createElement('h3');
        titleEl.className = 'product-title';
        titleEl.textContent = title;

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

      // --- Carousel (Issue #12) ---
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
      var imageUrl = product.image && product.image.url ? product.image.url : '';
      var rawDesc = typeof product.description === 'string' ? product.description : '';
      var shortDesc = rawDesc.length > 120 ? rawDesc.slice(0, 120).trimEnd() + '\u2026' : rawDesc;
      if (!shortDesc && typeof product.price === 'number') {
        shortDesc = '$' + product.price.toFixed(2);
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
      heading.textContent = product.title;

      var desc = document.createElement('p');
      desc.textContent = shortDesc;

      var viewBtn = document.createElement('a');
      viewBtn.href = '/product/index.html?id=' + product.id;
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
    var dots = document.querySelectorAll('.indicator');

    dots.forEach(function setInitialIndicatorState(dot, index) {
      if (index === currentIndex) {
        dot.setAttribute('aria-current', 'true');
        return;
      }

      dot.removeAttribute('aria-current');
    });

    function goTo(index) {
      slides[currentIndex].classList.remove('is-active');
      slides[currentIndex].setAttribute('aria-hidden', 'true');
      dots[currentIndex].classList.remove('active');
      dots[currentIndex].removeAttribute('aria-current');

      currentIndex = (index + slides.length) % slides.length;

      slides[currentIndex].classList.add('is-active');
      slides[currentIndex].removeAttribute('aria-hidden');
      dots[currentIndex].classList.add('active');
      dots[currentIndex].setAttribute('aria-current', 'true');
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

    dots.forEach(function (dot, i) {
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
});
