import { loadCatalog } from "../shared/catalog";
import { renderProductGrid, renderProductSkeleton } from "../shared/product-grid";
import { addCartItem } from "../shared/storage";
import { renderShell } from "../shared/shell";
import { showToast } from "../shared/notifications";
import { initPageMotion } from "../shared/motion";
import { initHomeSplash } from "../shared/home-splash";
import { getMockProductPhoto } from "../shared/constants";
import { escapeHtml, formatCategoryLabel, formatPrice, isSafeImageUrl } from "../shared/format";

const heroToneClasses = ["hero-slide--essentials", "hero-slide--support", "hero-slide--night"];

const categoryPitchByName = {
  Calcinhas: "Modelos de calcinhas com conforto premium, toque macio e acabamento elegante para o dia a dia."
};

function getHeroPitch(product) {
  const categoryPitch = categoryPitchByName[product.category];
  if (categoryPitch) {
    return categoryPitch;
  }

  return "Calcinha em destaque no catálogo, com retirada em loja e entrega apenas sob combinacao previa.";
}

function buildHeroSlideMarkup(product, index) {
  const toneClass = heroToneClasses[index % heroToneClasses.length];
  const displayCategory = formatCategoryLabel(product.category);
  const detailsHref = product.id ? `/product.html?id=${encodeURIComponent(product.id)}` : "/products.html";
  const price = Number(product.price || 0);
  const oldPrice = Number(product.oldPrice || 0);
  const hasDiscount = oldPrice > price;
  const discountPercent = hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

  const ratingValue = Number(product.rating || 4.8);
  const ratingText = Number.isFinite(ratingValue) ? ratingValue.toFixed(1).replace(".", ",") : "4,8";

  const badgeText = String(product.badge || "").trim() || "Destaque da loja";
  const eyebrowText = hasDiscount
    ? `${discountPercent}% OFF em ${displayCategory}`
    : `Destaque em ${displayCategory}`;

  const productCategoryLink = `/products.html?category=${encodeURIComponent(product.category)}`;
  const fallbackHeroImage = getMockProductPhoto(index + 3);
  const imageSource = isSafeImageUrl(product.image) ? product.image : fallbackHeroImage;
  const mediaMarkup = `<img src="${escapeHtml(imageSource)}" alt="${escapeHtml(product.title)}" loading="${
    index === 0 ? "eager" : "lazy"
  }" decoding="async" data-fallback-src="${escapeHtml(fallbackHeroImage)}" />`;

  const oldPriceMarkup = hasDiscount
    ? `<span class="hero-media-old-price">de ${formatPrice(oldPrice)}</span>`
    : "";

  const priceLabel = hasDiscount ? "Preço promocional" : "Preço especial";

  return `
    <article class="hero-slide ${toneClass} ${index === 0 ? "is-active" : ""}" data-carousel-slide>
      <a class="hero-slide-media" href="${detailsHref}" aria-label="Ver detalhes de ${escapeHtml(product.title)}">
        ${mediaMarkup}
        <span class="hero-media-chip">${escapeHtml(badgeText)}</span>
        <div class="hero-media-price">
          <span class="hero-media-price-label">${priceLabel}</span>
          <div class="hero-media-price-row">
            ${oldPriceMarkup}
            <strong>${formatPrice(price)}</strong>
          </div>
        </div>
      </a>
      <div class="hero-slide-content">
        <p class="eyebrow">${escapeHtml(eyebrowText)}</p>
        <h2>${escapeHtml(product.title)}</h2>
        <p>${escapeHtml(getHeroPitch(product))}</p>
        <div class="hero-slide-meta">
          <span>Avaliação ${escapeHtml(ratingText)}</span>
          <span>Retirada na loja</span>
          <span>Entrega com combinacao</span>
        </div>
        <div class="hero-cta-row">
          <a class="btn-primary" href="${productCategoryLink}">Comprar ${escapeHtml(displayCategory)}</a>
          <a class="btn-ghost" href="/products.html">Ver vitrine completa</a>
        </div>
      </div>
    </article>
  `;
}

function attachHeroImageFallback(trackElement) {
  const imageElements = Array.from(trackElement.querySelectorAll(".hero-slide-media img"));

  imageElements.forEach((imageElement, index) => {
    const fallbackSrc = String(imageElement.dataset.fallbackSrc || "").trim() || getMockProductPhoto(index + 6);
    let triedFallback = false;

    imageElement.addEventListener("error", () => {
      if (!triedFallback && fallbackSrc) {
        triedFallback = true;
        imageElement.src = fallbackSrc;
        return;
      }

      imageElement.classList.add("is-hidden");

      const mediaElement = imageElement.closest(".hero-slide-media");
      if (mediaElement && !mediaElement.querySelector(".hero-media-fallback")) {
        mediaElement.insertAdjacentHTML(
          "afterbegin",
          `<div class="hero-media-fallback"><span>Destaque da loja</span></div>`
        );
      }
    });
  });
}

function renderHeroProductCarousel(products) {
  const carouselElement = document.querySelector("#home-hero-carousel");
  if (!carouselElement) {
    return;
  }

  const trackElement = carouselElement.querySelector("[data-carousel-track]");
  const dotsContainerElement = carouselElement.querySelector("[data-carousel-dots]");
  if (!trackElement || !dotsContainerElement) {
    return;
  }

  const heroProducts = products.slice(0, 3);
  if (!heroProducts.length) {
    return;
  }

  trackElement.innerHTML = heroProducts
    .map((product, index) => buildHeroSlideMarkup(product, index))
    .join("");

  attachHeroImageFallback(trackElement);

  dotsContainerElement.innerHTML = heroProducts
    .map((_, index) => {
      const selected = index === 0;
      return `<button type="button" class="${selected ? "is-active" : ""}" data-slide-to="${index}" aria-label="Banner ${
        index + 1
      }" aria-selected="${selected}"></button>`;
    })
    .join("");
}

function setupHeroCarousel() {
  const carouselElement = document.querySelector("#home-hero-carousel");
  if (!carouselElement) {
    return;
  }

  const controlsElement = carouselElement.querySelector(".hero-carousel-controls");
  const trackElement = carouselElement.querySelector("[data-carousel-track]");
  const slideElements = Array.from(carouselElement.querySelectorAll("[data-carousel-slide]"));
  const dotElements = Array.from(carouselElement.querySelectorAll("[data-slide-to]"));
  const previousButtonElement = carouselElement.querySelector("[data-carousel-prev]");
  const nextButtonElement = carouselElement.querySelector("[data-carousel-next]");

  if (!trackElement || !slideElements.length) {
    return;
  }

  if (slideElements.length <= 1) {
    controlsElement?.classList.add("is-hidden");
    return;
  }

  controlsElement?.classList.remove("is-hidden");

  trackElement.style.setProperty("--slide-count", String(slideElements.length));

  let activeSlideIndex = 0;
  let autoRotateIntervalId;
  let autoRotateResumeTimeoutId;
  const autoRotateDelay = 3600;
  const reducedMotion =
    !document.body.classList.contains("force-motion") &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const syncSlideState = () => {
    trackElement.style.setProperty("--active-index", String(activeSlideIndex));

    slideElements.forEach((slideElement, index) => {
      slideElement.classList.toggle("is-active", index === activeSlideIndex);
    });

    dotElements.forEach((dotElement, index) => {
      const isActive = index === activeSlideIndex;
      dotElement.classList.toggle("is-active", isActive);
      dotElement.setAttribute("aria-selected", String(isActive));
    });
  };

  const stopAutoRotate = () => {
    if (autoRotateResumeTimeoutId) {
      window.clearTimeout(autoRotateResumeTimeoutId);
      autoRotateResumeTimeoutId = undefined;
    }

    if (autoRotateIntervalId) {
      window.clearInterval(autoRotateIntervalId);
      autoRotateIntervalId = undefined;
    }
  };

  const startAutoRotate = () => {
    stopAutoRotate();
    if (reducedMotion) {
      return;
    }

    autoRotateIntervalId = window.setInterval(() => {
      activeSlideIndex = (activeSlideIndex + 1) % slideElements.length;
      syncSlideState();
    }, autoRotateDelay);
  };

  const restartAutoRotateWithDelay = () => {
    stopAutoRotate();
    autoRotateResumeTimeoutId = window.setTimeout(() => {
      startAutoRotate();
    }, 1800);
  };

  const goToSlide = (index) => {
    activeSlideIndex = (index + slideElements.length) % slideElements.length;
    syncSlideState();
    restartAutoRotateWithDelay();
  };

  previousButtonElement?.addEventListener("click", () => {
    goToSlide(activeSlideIndex - 1);
  });

  nextButtonElement?.addEventListener("click", () => {
    goToSlide(activeSlideIndex + 1);
  });

  dotElements.forEach((dotElement) => {
    dotElement.addEventListener("click", () => {
      const targetIndex = Number(dotElement.dataset.slideTo);
      if (!Number.isFinite(targetIndex)) {
        return;
      }

      goToSlide(targetIndex);
    });
  });

  carouselElement.addEventListener("focusin", stopAutoRotate);
  carouselElement.addEventListener("focusout", startAutoRotate);

  let touchStartX = 0;
  carouselElement.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0]?.clientX || 0;
      stopAutoRotate();
    },
    { passive: true }
  );

  carouselElement.addEventListener(
    "touchend",
    (event) => {
      const touchEndX = event.changedTouches[0]?.clientX || 0;
      const deltaX = touchEndX - touchStartX;

      if (Math.abs(deltaX) > 45) {
        goToSlide(deltaX < 0 ? activeSlideIndex + 1 : activeSlideIndex - 1);
        return;
      }

      startAutoRotate();
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoRotate();
      return;
    }

    startAutoRotate();
  });

  syncSlideState();
  startAutoRotate();
}

function initFeaturedRail(container) {
  if (!container || container.dataset.dragRailReady === "1") {
    return;
  }

  container.dataset.dragRailReady = "1";

  let isDragging = false;
  let activePointerId = null;
  let startX = 0;
  let startScrollLeft = 0;
  let movedEnough = false;
  let suppressClick = false;
  let recentPointerX = 0;
  let recentPointerTime = 0;
  let pointerVelocityX = 0;
  let inertiaVelocityX = 0;
  let inertiaFrameId = 0;
  let inertiaLastFrameTime = 0;
  const autoScrollSpeedPxPerSecond = 20;
  const autoScrollPauseAfterInteractionMs = 1700;
  let autoScrollDirection = 1;
  let autoScrollFrameId = 0;
  let autoScrollLastFrameTime = 0;
  let autoScrollPausedUntil = 0;
  let autoScrollVirtualLeft = 0;

  const pauseAutoScroll = (durationMs = autoScrollPauseAfterInteractionMs) => {
    autoScrollPausedUntil = window.performance.now() + durationMs;
  };

  const startAutoScroll = () => {
    if (autoScrollFrameId) {
      return;
    }

    autoScrollVirtualLeft = container.scrollLeft;

    const tick = (timestamp) => {
      const elapsedMs = autoScrollLastFrameTime ? Math.min(timestamp - autoScrollLastFrameTime, 34) : 16;
      autoScrollLastFrameTime = timestamp;

      const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
      const isPaused = timestamp < autoScrollPausedUntil;

      if (maxScrollLeft > 0 && !document.hidden && !isDragging && !inertiaFrameId && !isPaused) {
        const delta = (autoScrollSpeedPxPerSecond * elapsedMs) / 1000;
        const nextScrollLeft = autoScrollVirtualLeft + autoScrollDirection * delta;
        const clampedScrollLeft = Math.max(0, Math.min(maxScrollLeft, nextScrollLeft));
        autoScrollVirtualLeft = clampedScrollLeft;
        container.scrollLeft = clampedScrollLeft;

        const atStart = clampedScrollLeft <= 0.5;
        const atEnd = maxScrollLeft - clampedScrollLeft <= 0.5;
        if (atStart || atEnd) {
          autoScrollDirection *= -1;
        }
      } else {
        autoScrollVirtualLeft = container.scrollLeft;
      }

      autoScrollFrameId = window.requestAnimationFrame(tick);
    };

    autoScrollFrameId = window.requestAnimationFrame(tick);
  };

  const stopInertia = () => {
    if (inertiaFrameId) {
      window.cancelAnimationFrame(inertiaFrameId);
    }

    inertiaFrameId = 0;
    inertiaLastFrameTime = 0;
    inertiaVelocityX = 0;
  };

  const startInertia = (initialVelocityX) => {
    stopInertia();
    inertiaVelocityX = initialVelocityX;

    const tick = (timestamp) => {
      if (!inertiaLastFrameTime) {
        inertiaLastFrameTime = timestamp;
      }

      const elapsedMs = Math.min(timestamp - inertiaLastFrameTime, 34);
      inertiaLastFrameTime = timestamp;

      const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
      if (maxScrollLeft <= 0 || Math.abs(inertiaVelocityX) < 0.02) {
        stopInertia();
        return;
      }

      const nextScrollLeft = container.scrollLeft - inertiaVelocityX * elapsedMs;
      const clampedScrollLeft = Math.max(0, Math.min(maxScrollLeft, nextScrollLeft));
      container.scrollLeft = clampedScrollLeft;

      const reachedEdge = clampedScrollLeft === 0 || clampedScrollLeft === maxScrollLeft;
      if (reachedEdge) {
        inertiaVelocityX *= 0.42;
      } else {
        inertiaVelocityX *= Math.exp(-0.0042 * elapsedMs);
      }

      if (Math.abs(inertiaVelocityX) < 0.02) {
        stopInertia();
        return;
      }

      inertiaFrameId = window.requestAnimationFrame(tick);
    };

    inertiaFrameId = window.requestAnimationFrame(tick);
  };

  const endDrag = (event) => {
    if (!isDragging) {
      return;
    }

    if (
      event &&
      Number.isFinite(event.pointerId) &&
      Number.isFinite(activePointerId) &&
      event.pointerId !== activePointerId
    ) {
      return;
    }

    const pointerId = activePointerId;

    isDragging = false;
    activePointerId = null;
    container.classList.remove("is-dragging");

    if (
      event?.type !== "lostpointercapture" &&
      Number.isFinite(pointerId) &&
      container.hasPointerCapture?.(pointerId)
    ) {
      container.releasePointerCapture(pointerId);
    }

    if (movedEnough && Math.abs(pointerVelocityX) >= 0.14) {
      const cappedVelocity = Math.max(-2.6, Math.min(2.6, pointerVelocityX));
      startInertia(cappedVelocity);
    }

    pauseAutoScroll(movedEnough ? 420 : 180);

    if (movedEnough) {
      suppressClick = true;
      window.setTimeout(() => {
        suppressClick = false;
      }, 0);
    }

    movedEnough = false;
    pointerVelocityX = 0;
  };

  container.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary) {
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("button, a, input, select, textarea")) {
      return;
    }

    pauseAutoScroll();
    stopInertia();
    isDragging = true;
    activePointerId = event.pointerId;
    startX = event.clientX;
    startScrollLeft = container.scrollLeft;
    recentPointerX = event.clientX;
    recentPointerTime = window.performance.now();
    pointerVelocityX = 0;
    movedEnough = false;
    container.classList.add("is-dragging");

    if (Number.isFinite(activePointerId)) {
      try {
        container.setPointerCapture(activePointerId);
      } catch {
        // Ignore capture failures and keep drag via bubbling events.
      }
    }
  });

  container.addEventListener("pointermove", (event) => {
    if (!isDragging || event.pointerId !== activePointerId) {
      return;
    }

    const deltaX = event.clientX - startX;
    if (Math.abs(deltaX) > 3) {
      movedEnough = true;
    }

    const now = window.performance.now();
    const elapsedMs = Math.max(now - recentPointerTime, 1);
    const movedX = event.clientX - recentPointerX;
    const currentVelocity = movedX / elapsedMs;
    pointerVelocityX = pointerVelocityX * 0.62 + currentVelocity * 0.38;
    recentPointerX = event.clientX;
    recentPointerTime = now;

    container.scrollLeft = startScrollLeft - deltaX * 1.08;
    event.preventDefault();
  });

  container.addEventListener("pointerup", endDrag);
  container.addEventListener("pointercancel", endDrag);
  container.addEventListener("lostpointercapture", endDrag);

  container.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });

  container.querySelectorAll("img").forEach((imageElement) => {
    imageElement.draggable = false;
  });

  container.addEventListener("click", (event) => {
    if (!suppressClick) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }, true);

  document.addEventListener("visibilitychange", () => {
    autoScrollLastFrameTime = 0;
    if (!document.hidden) {
      pauseAutoScroll(140);
    }
  });

  startAutoScroll();
}

renderShell("home");
initHomeSplash();
initPageMotion();

const statusElement = document.querySelector("#home-catalog-status");
const productGridElement = document.querySelector("#home-product-grid");

renderProductSkeleton(productGridElement, 4);
const catalogResult = await loadCatalog({ maxItems: 30, includeFallback: true });
const heroProducts = catalogResult.products.slice(0, 3);
renderHeroProductCarousel(heroProducts);
setupHeroCarousel();
const featuredProducts = catalogResult.products.slice(0, 12);
const railHint = featuredProducts.length > 4 ? " Arraste para o lado para ver mais." : "";

if (catalogResult.source === "firestore") {
  statusElement.textContent = `Selecionamos peças da coleção para facilitar sua escolha.${railHint}`;
}

if (catalogResult.source === "fallback-empty") {
  statusElement.textContent = `Estamos atualizando o catálogo. Estes são os destaques do momento.${railHint}`;
}

if (catalogResult.source === "fallback-error") {
  statusElement.textContent = `Catálogo em sincronização. Mostrando seleção recomendada para você.${railHint}`;
}

renderProductGrid({
  container: productGridElement,
  products: featuredProducts,
  onAddToCart: (productId) => {
    addCartItem(productId, 1);
    showToast("Produto adicionado ao carrinho.", {
      actionLabel: "Ir para o carrinho",
      actionHref: "/cart.html"
    });
  },
  emptyTitle: "Sem produtos em destaque",
  emptyDescription: "Adicione documentos na coleção products para aparecer aqui."
});

initFeaturedRail(productGridElement);
