import { loadCatalog } from "../shared/catalog";
import { addCartItem } from "../shared/storage";
import { escapeHtml, formatCategoryLabel, formatPrice } from "../shared/format";
import { renderShell } from "../shared/shell";
import { showToast } from "../shared/notifications";
import { initPageMotion } from "../shared/motion";
import { getMockProductPhoto } from "../shared/constants";

const FALLBACK_IMAGE = getMockProductPhoto(0);

const categoryDescriptionByName = {
  Calcinhas: "Calcinha pensada para combinar conforto, ajuste seguro e acabamento premium no dia a dia."
};

const statusElement = document.querySelector("#product-status");
const productLayoutElement = document.querySelector("#product-layout");
const productEmptyElement = document.querySelector("#product-empty");
const productDetailsElement = document.querySelector("#product-details");
const imageElement = document.querySelector("#product-image");
const categoryElement = document.querySelector("#product-category");
const nameElement = document.querySelector("#product-name");
const priceElement = document.querySelector("#product-price");
const oldPriceElement = document.querySelector("#product-old-price");
const descriptionElement = document.querySelector("#product-description");
const ratingElement = document.querySelector("#product-rating");
const badgeElement = document.querySelector("#product-badge");
const skuElement = document.querySelector("#product-sku");
const availabilityElement = document.querySelector("#product-availability");
const sizesElement = document.querySelector("#product-sizes");
const sizeHelpElement = document.querySelector("#product-size-help");
const colorsElement = document.querySelector("#product-colors");
const colorHelpElement = document.querySelector("#product-color-help");
const longDescriptionElement = document.querySelector("#product-long-description");
const materialElement = document.querySelector("#product-material");
const careListElement = document.querySelector("#product-care-list");
const formElement = document.querySelector("#product-form");
const quantityElement = document.querySelector("#product-qty");
const quantityIncreaseButtonElement = document.querySelector('[data-qty-step="increase"]');
const quantityDecreaseButtonElement = document.querySelector('[data-qty-step="decrease"]');
const addButtonElement = document.querySelector("#product-form .btn-add");

const sizeOptionsByCategory = {
  Calcinhas: ["P", "M", "G", "GG"],
  Acessorios: ["Unico"]
};

const colorOptionsByCategory = {
  Calcinhas: ["Preto", "Branco", "Rosa", "Nude", "Vinho"],
  Acessorios: ["Dourado", "Prata"]
};

const colorHexByName = {
  Preto: "#1f2024",
  Branco: "#f2ebe1",
  Nude: "#d7b29a",
  Vinho: "#6f2338",
  Rosa: "#d48ba5",
  Chocolate: "#6a4a34",
  "Azul-marinho": "#1f2f57",
  Dourado: "#c89a4c",
  Prata: "#babec7"
};

const categoryMaterialByName = {
  Calcinhas: "Microfibra com toque suave e ajuste confortavel.",
  Acessorios: "Materiais selecionados com acabamento resistente."
};

const categoryLongDescriptionByName = {
  Calcinhas:
    "Modelagem anatomica com elastico macio, ideal para rotinas longas e para manter conforto ao longo de todo o dia.",
  Acessorios:
    "Acessorio complementar para finalizar o look com praticidade e identidade visual sofisticada."
};

const defaultCareList = [
  "Lavar a mao com agua fria.",
  "Não utilizar alvejante.",
  "Secar a sombra em superficie plana.",
  "Não passar ferro diretamente sobre a renda."
];

let selectedSize = "";
let selectedColor = "";
let currentStock = 0;

function getMaxQuantity() {
  if (!quantityElement) {
    return 1;
  }

  const max = Number(quantityElement.max || 20);
  if (!Number.isFinite(max) || max <= 0) {
    return 1;
  }

  return Math.floor(max);
}

function clampQuantity(value) {
  const max = getMaxQuantity();
  const parsed = Math.floor(Number(value));
  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.min(max, Math.max(1, parsed));
}

function syncQuantityControls() {
  if (!quantityElement) {
    return;
  }

  const quantity = clampQuantity(quantityElement.value || 1);
  const max = getMaxQuantity();
  quantityElement.value = String(quantity);

  const isUnavailable = currentStock <= 0;
  quantityElement.disabled = isUnavailable;

  if (quantityDecreaseButtonElement) {
    quantityDecreaseButtonElement.disabled = isUnavailable || quantity <= 1;
  }

  if (quantityIncreaseButtonElement) {
    quantityIncreaseButtonElement.disabled = isUnavailable || quantity >= max;
  }
}

function stepQuantity(delta) {
  if (!quantityElement) {
    return;
  }

  const current = clampQuantity(quantityElement.value || 1);
  quantityElement.value = String(clampQuantity(current + delta));
  syncQuantityControls();
}

function getRequestedProductId() {
  return (new URLSearchParams(window.location.search).get("id") || "").trim();
}

function setStatus(message) {
  if (!statusElement) {
    return;
  }

  statusElement.hidden = false;
  statusElement.textContent = message;
}

function showNotFoundState(message) {
  setStatus(message);
  if (productLayoutElement) {
    productLayoutElement.hidden = true;
  }
  if (productDetailsElement) {
    productDetailsElement.hidden = true;
  }
  if (productEmptyElement) {
    productEmptyElement.hidden = false;
  }
}

function showProductState() {
  if (statusElement) {
    statusElement.hidden = true;
  }
  if (productLayoutElement) {
    productLayoutElement.hidden = false;
  }
  if (productDetailsElement) {
    productDetailsElement.hidden = false;
  }
  if (productEmptyElement) {
    productEmptyElement.hidden = true;
  }
}

function getDescription(product) {
  if (typeof product.description === "string" && product.description.trim()) {
    return product.description.trim();
  }

  const categoryDescription = categoryDescriptionByName[product.category];
  if (categoryDescription) {
    return categoryDescription;
  }

  return "Peça selecionada no catálogo com qualidade premium e compra segura.";
}

function getLongDescription(product) {
  if (typeof product.longDescription === "string" && product.longDescription.trim()) {
    return product.longDescription.trim();
  }

  const categoryText = categoryLongDescriptionByName[product.category];
  if (categoryText) {
    return categoryText;
  }

  return "Produto desenvolvido para entregar conforto, bom ajuste e acabamento premium em diferentes ocasioes de uso.";
}

function getMaterial(product) {
  if (typeof product.material === "string" && product.material.trim()) {
    return product.material.trim();
  }

  const byCategory = categoryMaterialByName[product.category];
  if (byCategory) {
    return byCategory;
  }

  return "Composição selecionada para durabilidade, toque suave e boa respiração da pele.";
}

function getCareList(product) {
  if (Array.isArray(product.care) && product.care.length) {
    return product.care
      .map((item) => String(item || "").trim())
      .filter(Boolean)
      .slice(0, 6);
  }

  if (typeof product.care === "string" && product.care.trim()) {
    return product.care
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 6);
  }

  return defaultCareList;
}

function getColorDot(value) {
  const byName = colorHexByName[value];
  if (byName) {
    return byName;
  }

  const normalized = String(value || "").trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized)) {
    return normalized;
  }

  return "#b49a7b";
}

function getColorOptions(product) {
  if (Array.isArray(product.colors) && product.colors.length) {
    const list = product.colors
      .map((item) => String(item || "").trim())
      .filter(Boolean);

    if (list.length) {
      return list;
    }
  }

  if (typeof product.colors === "string" && product.colors.trim()) {
    const list = product.colors
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (list.length) {
      return list;
    }
  }

  return colorOptionsByCategory[product.category] || ["Preto", "Branco"];
}

function getStockFallback(product) {
  const seedSource = String(product.id || product.title || "produto");
  let hash = 0;

  for (let index = 0; index < seedSource.length; index += 1) {
    hash = (hash << 5) - hash + seedSource.charCodeAt(index);
    hash |= 0;
  }

  return 6 + (Math.abs(hash) % 15);
}

function getStockValue(product) {
  const rawStock = product?.stock;
  if (rawStock !== null && rawStock !== undefined && rawStock !== "") {
    const stockNumber = Number(rawStock);
    if (Number.isFinite(stockNumber) && stockNumber >= 0) {
      return Math.floor(stockNumber);
    }
  }

  return getStockFallback(product);
}

function getAvailabilityLabel(stockValue) {
  if (stockValue <= 0) {
    return "Indisponível";
  }

  if (stockValue <= 3) {
    return `Últimas unidades (${stockValue})`;
  }

  return `Disponivel para retirada em loja (${stockValue} unidades)`;
}

function getSizeOptions(product) {
  if (Array.isArray(product.sizes) && product.sizes.length) {
    const list = product.sizes
      .map((item) => String(item || "").trim())
      .filter(Boolean);

    if (list.length) {
      return list;
    }
  }

  if (typeof product.sizes === "string" && product.sizes.trim()) {
    const list = product.sizes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (list.length) {
      return list;
    }
  }

  return sizeOptionsByCategory[product.category] || ["P", "M", "G", "GG"];
}

function setSelectedSize(nextSize) {
  selectedSize = String(nextSize || "").trim();

  if (!sizesElement) {
    return;
  }

  sizesElement.querySelectorAll("button[data-size]").forEach((button) => {
    const buttonSize = decodeURIComponent(button.dataset.size || "");
    const active = buttonSize === selectedSize;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  if (sizeHelpElement) {
    sizeHelpElement.textContent = selectedSize
      ? `Tamanho selecionado: ${selectedSize}`
      : "Selecione um tamanho para continuar.";
  }
}

function renderSizes(product) {
  if (!sizesElement) {
    return;
  }

  const options = getSizeOptions(product);
  selectedSize = options[0] || "";

  sizesElement.innerHTML = options
    .map((size, index) => {
      const safeSize = String(size).trim();
      const encodedSize = encodeURIComponent(safeSize);
      const selected = index === 0;
      return `<button type="button" class="size-chip ${selected ? "active" : ""}" data-size="${encodedSize}" role="option" aria-selected="${selected}">${escapeHtml(safeSize)}</button>`;
    })
    .join("");

  sizesElement.querySelectorAll("button[data-size]").forEach((button) => {
    button.addEventListener("click", () => {
      setSelectedSize(decodeURIComponent(button.dataset.size || ""));
    });
  });

  setSelectedSize(selectedSize);
}

function setSelectedColor(nextColor) {
  selectedColor = String(nextColor || "").trim();

  if (!colorsElement) {
    return;
  }

  colorsElement.querySelectorAll("button[data-color]").forEach((button) => {
    const buttonColor = decodeURIComponent(button.dataset.color || "");
    const active = buttonColor === selectedColor;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });

  if (colorHelpElement) {
    colorHelpElement.textContent = selectedColor
      ? `Cor selecionada: ${selectedColor}`
      : "Selecione uma cor para continuar.";
  }
}

function renderColors(product) {
  if (!colorsElement) {
    return;
  }

  const options = getColorOptions(product);
  selectedColor = options[0] || "";

  colorsElement.innerHTML = options
    .map((color, index) => {
      const safeColor = String(color).trim();
      const encodedColor = encodeURIComponent(safeColor);
      const selected = index === 0;
      const dot = getColorDot(safeColor);

      return `<button type="button" class="color-chip ${selected ? "active" : ""}" data-color="${encodedColor}" role="option" aria-selected="${selected}"><span class="color-chip-dot" style="--dot-color:${dot}"></span><span>${escapeHtml(safeColor)}</span></button>`;
    })
    .join("");

  colorsElement.querySelectorAll("button[data-color]").forEach((button) => {
    button.addEventListener("click", () => {
      setSelectedColor(decodeURIComponent(button.dataset.color || ""));
    });
  });

  setSelectedColor(selectedColor);
}

function renderCare(product) {
  if (!careListElement) {
    return;
  }

  const items = getCareList(product);
  careListElement.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
}

function renderProduct(product) {
  if (imageElement) {
    imageElement.onerror = () => {
      imageElement.onerror = null;
      imageElement.src = FALLBACK_IMAGE;
    };
    imageElement.src = product.image || FALLBACK_IMAGE;
    imageElement.alt = `Imagem do produto ${product.title}`;
  }

  if (categoryElement) {
    categoryElement.textContent = formatCategoryLabel(product.category || "Calcinhas");
  }

  if (nameElement) {
    nameElement.textContent = product.title || "Produto";
  }

  if (priceElement) {
    priceElement.textContent = formatPrice(Number(product.price) || 0);
  }

  if (oldPriceElement) {
    const oldPrice = Number(product.oldPrice || 0);
    const currentPrice = Number(product.price || 0);
    const hasOldPrice = oldPrice > currentPrice;
    oldPriceElement.hidden = !hasOldPrice;
    oldPriceElement.textContent = hasOldPrice ? `de ${formatPrice(oldPrice)}` : "";
  }

  if (descriptionElement) {
    descriptionElement.textContent = getDescription(product);
  }

  if (longDescriptionElement) {
    longDescriptionElement.textContent = getLongDescription(product);
  }

  if (materialElement) {
    materialElement.textContent = getMaterial(product);
  }

  if (ratingElement) {
    const rating = Number(product.rating);
    ratingElement.textContent = Number.isFinite(rating) ? `${rating.toFixed(1).replace(".", ",")} / 5` : "4,8 / 5";
  }

  if (badgeElement) {
    badgeElement.textContent = String(product.badge || "Seleção especial da loja");
  }

  if (skuElement) {
    const skuRaw = String(product.id || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    skuElement.textContent = skuRaw ? `DL-${skuRaw.slice(0, 8)}` : "DL-0000";
  }

  if (availabilityElement) {
    currentStock = getStockValue(product);
    availabilityElement.textContent = getAvailabilityLabel(currentStock);
  }

  if (quantityElement) {
    const maxByStock = currentStock > 0 ? Math.min(20, currentStock) : 1;
    quantityElement.max = String(maxByStock);
    quantityElement.value = String(clampQuantity(quantityElement.value || 1));
  }

  if (addButtonElement) {
    addButtonElement.disabled = currentStock <= 0;
    addButtonElement.textContent = currentStock <= 0 ? "Produto indisponível" : "Adicionar ao carrinho";
  }

  syncQuantityControls();

  renderSizes(product);
  renderColors(product);
  renderCare(product);

  if (product.title) {
    document.title = `${product.title} | Duda's Lingerie`;
  }
}

function setupActions(product) {
  if (!formElement || !quantityElement) {
    return;
  }

  quantityIncreaseButtonElement?.addEventListener("click", () => {
    stepQuantity(1);
  });

  quantityDecreaseButtonElement?.addEventListener("click", () => {
    stepQuantity(-1);
  });

  quantityElement.addEventListener("input", () => {
    syncQuantityControls();
  });

  quantityElement.addEventListener("blur", () => {
    syncQuantityControls();
  });

  formElement.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!selectedSize) {
      showToast("Selecione um tamanho antes de adicionar ao carrinho.");
      return;
    }

    if (!selectedColor) {
      showToast("Selecione uma cor antes de adicionar ao carrinho.");
      return;
    }

    if (currentStock <= 0) {
      showToast("Este produto está sem estoque no momento.");
      return;
    }

    const quantity = Math.min(20, currentStock, Math.max(1, Math.floor(Number(quantityElement.value) || 1)));
    quantityElement.value = String(quantity);
    syncQuantityControls();
    addCartItem(product.id, quantity);
    showToast(`${quantity} item(ns) de ${product.title} tam. ${selectedSize}, cor ${selectedColor} adicionado(s) ao carrinho.`, {
      actionLabel: "Ir para o carrinho",
      actionHref: "/cart.html"
    });
  });
}

async function initProductPage() {
  renderShell("products");
  initPageMotion();

  const productId = getRequestedProductId();
  if (!productId) {
    showNotFoundState("Produto inválido ou não informado.");
    return;
  }

  try {
    const catalogResult = await loadCatalog({ maxItems: 120, includeFallback: true });
    const product = catalogResult.products.find((item) => String(item.id) === productId);

    if (!product) {
      showNotFoundState("Produto não encontrado no catálogo atual.");
      return;
    }

    renderProduct(product);
    setupActions(product);
    showProductState();
  } catch (error) {
    console.error("Falha ao carregar detalhes do produto", error);
    showNotFoundState("Não foi possível carregar este produto agora.");
  }
}

initProductPage();
