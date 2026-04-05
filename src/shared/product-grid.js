import { categoryGradients } from "./constants";
import { escapeHtml, formatCategoryLabel, formatPrice } from "./format";

function fallbackGradient(category) {
  return categoryGradients[category] || "linear-gradient(135deg, #7c644a 0%, #2a2221 100%)";
}

export function renderProductSkeleton(container, count = 6) {
  container.innerHTML = new Array(count)
    .fill("")
    .map(
      () => `
        <article class="product-card loading-card">
          <div class="loading-block"></div>
          <div class="product-content">
            <div class="loading-line short"></div>
            <div class="loading-line"></div>
            <div class="loading-line medium"></div>
          </div>
        </article>
      `
    )
    .join("");
}

export function renderProductGrid(params) {
  const {
    container,
    products,
    onAddToCart,
    emptyTitle = "Nenhum produto encontrado",
    emptyDescription = "Ajuste os filtros e tente novamente."
  } = params;

  if (!products.length) {
    container.innerHTML = `
      <article class="empty-card">
        <h3>${escapeHtml(emptyTitle)}</h3>
        <p>${escapeHtml(emptyDescription)}</p>
      </article>
    `;
    return;
  }

  const openProductDetails = (productId) => {
    const encodedId = encodeURIComponent(productId);
    try {
      window.sessionStorage.setItem("dudas:route-transition", "1");
    } catch {
      // Ignore session storage errors.
    }
    window.location.href = `/product.html?id=${encodedId}`;
  };

  container.innerHTML = products
    .map((product, index) => {
      const encodedProductId = encodeURIComponent(product.id);
      const displayCategory = formatCategoryLabel(product.category);
      const imageMarkup = product.image
        ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" loading="lazy" />`
        : `<div class="image-fallback" style="background:${fallbackGradient(product.category)}"><span>${escapeHtml(displayCategory)}</span></div>`;

      const oldPriceMarkup =
        product.oldPrice > product.price
          ? `<span class="old-price">${formatPrice(product.oldPrice)}</span>`
          : "";

      const badgeMarkup = product.badge
        ? `<p class="badge">${escapeHtml(product.badge)}</p>`
        : "";

      return `
        <article
          class="product-card"
          style="--delay:${index * 70}ms"
          data-open-product-id="${encodedProductId}"
          tabindex="0"
          role="link"
          aria-label="Ver detalhes de ${escapeHtml(product.title)}"
        >
          <div class="product-media">
            ${imageMarkup}
          </div>
          <div class="product-content">
            <p class="category">${escapeHtml(displayCategory)}</p>
            <h3>${escapeHtml(product.title)}</h3>
            <p class="rating">Nota ${product.rating.toFixed(1)}</p>
            ${badgeMarkup}
            <div class="product-footer">
              <div class="price-stack">
                <p>${formatPrice(product.price)}</p>
                ${oldPriceMarkup}
              </div>
              <button data-add-product-id="${encodedProductId}" type="button" class="buy-btn">Adicionar</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  container.querySelectorAll("button[data-add-product-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = decodeURIComponent(button.dataset.addProductId || "");
      if (!productId) {
        return;
      }
      onAddToCart(productId);
    });
  });

  container.querySelectorAll("article[data-open-product-id]").forEach((cardElement) => {
    cardElement.addEventListener("click", (event) => {
      if (event.target.closest("button, a, input, select, textarea")) {
        return;
      }

      const productId = decodeURIComponent(cardElement.dataset.openProductId || "");
      if (!productId) {
        return;
      }

      openProductDetails(productId);
    });

    cardElement.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }

      event.preventDefault();

      const productId = decodeURIComponent(cardElement.dataset.openProductId || "");
      if (!productId) {
        return;
      }

      openProductDetails(productId);
    });
  });
}
