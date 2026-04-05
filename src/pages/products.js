import { getCategoryList, loadCatalog } from "../shared/catalog";
import { renderProductGrid, renderProductSkeleton } from "../shared/product-grid";
import { addCartItem } from "../shared/storage";
import { renderShell } from "../shared/shell";
import { showToast } from "../shared/notifications";
import { escapeHtml, formatCategoryLabel } from "../shared/format";
import { initPageMotion } from "../shared/motion";

const urlParams = new URLSearchParams(window.location.search);
const categoryFromUrl = urlParams.get("category");

const productsState = {
  allProducts: [],
  selectedCategory: "Todas",
  pendingCategory: String(categoryFromUrl || "").trim(),
  searchTerm: "",
  sortBy: "destaques",
  priceRange: "todas",
  badgeFilter: "todos",
  currentPage: 1,
  pageSize: 8,
  catalogStatusNote: ""
};

renderShell("products");
initPageMotion();

const statusElement = document.querySelector("#products-status");
const productGridElement = document.querySelector("#products-grid");
const categoryChipsElement = document.querySelector("#products-category-chips");
const searchInputElement = document.querySelector("#products-search");
const sortSelectElement = document.querySelector("#products-sort");
const priceRangeSelectElement = document.querySelector("#products-price-range");
const badgeFilterSelectElement = document.querySelector("#products-badge-filter");
const previousButtonElement = document.querySelector("#products-prev");
const nextButtonElement = document.querySelector("#products-next");
const pageLabelElement = document.querySelector("#products-page-label");

function initCustomSelectDropdown(selectElement) {
  if (!selectElement) {
    return;
  }

  const selectWrapElement = selectElement.parentElement;
  if (!selectWrapElement || selectWrapElement.querySelector(".products-custom-dropdown")) {
    return;
  }

  const labelElement = selectWrapElement.querySelector(`label[for="${selectElement.id}"]`);
  const labelText = labelElement?.textContent?.trim() || "Selecionar opção";

  const dropdownElement = document.createElement("div");
  dropdownElement.className = "products-custom-dropdown";

  const triggerButtonElement = document.createElement("button");
  triggerButtonElement.type = "button";
  triggerButtonElement.className = "products-custom-trigger";
  triggerButtonElement.setAttribute("aria-haspopup", "listbox");
  triggerButtonElement.setAttribute("aria-expanded", "false");
  triggerButtonElement.setAttribute("aria-label", labelText);

  const triggerLabelElement = document.createElement("span");
  triggerLabelElement.className = "products-custom-trigger-label";
  triggerButtonElement.append(triggerLabelElement);

  const panelElement = document.createElement("div");
  panelElement.className = "products-custom-panel";
  panelElement.hidden = true;

  const listElement = document.createElement("ul");
  listElement.className = "products-custom-list";
  listElement.setAttribute("role", "listbox");
  panelElement.append(listElement);

  const optionButtonElements = [];

  const closeDropdown = () => {
    if (!dropdownElement.classList.contains("is-open")) {
      return;
    }

    dropdownElement.classList.remove("is-open");
    panelElement.hidden = true;
    triggerButtonElement.setAttribute("aria-expanded", "false");
  };

  const openDropdown = () => {
    if (dropdownElement.classList.contains("is-open")) {
      return;
    }

    dropdownElement.classList.add("is-open");
    panelElement.hidden = false;
    triggerButtonElement.setAttribute("aria-expanded", "true");
  };

  const syncFromSelect = () => {
    const selectedValue = selectElement.value;
    const selectedOption = Array.from(selectElement.options).find((option) => option.value === selectedValue);

    triggerLabelElement.textContent = selectedOption?.textContent?.trim() || labelText;

    optionButtonElements.forEach(({ value, buttonElement }) => {
      const isActive = value === selectedValue;
      buttonElement.classList.toggle("is-active", isActive);
      buttonElement.setAttribute("aria-selected", String(isActive));
    });
  };

  const selectValue = (value) => {
    if (selectElement.value !== value) {
      selectElement.value = value;
      selectElement.dispatchEvent(new Event("change", { bubbles: true }));
    }

    syncFromSelect();
    closeDropdown();
    triggerButtonElement.focus();
  };

  Array.from(selectElement.options).forEach((option) => {
    const optionItemElement = document.createElement("li");

    const optionButtonElement = document.createElement("button");
    optionButtonElement.type = "button";
    optionButtonElement.className = "products-custom-option";
    optionButtonElement.textContent = option.textContent;
    optionButtonElement.dataset.value = option.value;
    optionButtonElement.setAttribute("role", "option");
    optionButtonElement.setAttribute("aria-selected", "false");

    optionButtonElement.addEventListener("click", () => {
      selectValue(option.value);
    });

    optionItemElement.append(optionButtonElement);
    listElement.append(optionItemElement);

    optionButtonElements.push({
      value: option.value,
      buttonElement: optionButtonElement
    });
  });

  triggerButtonElement.addEventListener("click", () => {
    if (dropdownElement.classList.contains("is-open")) {
      closeDropdown();
      return;
    }

    openDropdown();

    const activeOption = optionButtonElements.find((item) => item.buttonElement.classList.contains("is-active"));
    activeOption?.buttonElement.focus();
  });

  triggerButtonElement.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    openDropdown();

    const activeOption = optionButtonElements.find((item) => item.buttonElement.classList.contains("is-active"));
    activeOption?.buttonElement.focus();
  });

  listElement.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDropdown();
      triggerButtonElement.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (dropdownElement.contains(event.target)) {
      return;
    }

    closeDropdown();
  });

  labelElement?.addEventListener("click", (event) => {
    event.preventDefault();
    triggerButtonElement.focus();
    openDropdown();
  });

  selectElement.classList.add("products-native-hidden");
  selectElement.tabIndex = -1;
  selectElement.setAttribute("aria-hidden", "true");

  selectElement.insertAdjacentElement("afterend", dropdownElement);
  dropdownElement.append(triggerButtonElement, panelElement);

  selectElement.addEventListener("change", syncFromSelect);
  syncFromSelect();
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function matchCategory(rawCategory, selectedCategory) {
  const target = normalizeText(selectedCategory);
  const currentRaw = normalizeText(rawCategory);
  const currentLabel = normalizeText(formatCategoryLabel(rawCategory));

  return currentRaw === target || currentLabel === target;
}

function resolveCategorySelection(input, categories) {
  const target = normalizeText(input);
  if (!target) {
    return "Todas";
  }

  const found = categories.find((category) => {
    return matchCategory(category, target);
  });

  return found || "Todas";
}

function getDiscountPercent(product) {
  const currentPrice = Number(product.price || 0);
  const oldPrice = Number(product.oldPrice || 0);
  if (oldPrice <= currentPrice || oldPrice <= 0) {
    return 0;
  }

  return ((oldPrice - currentPrice) / oldPrice) * 100;
}

function getPriceRangeLabel(value) {
  const labels = {
    "ate-99": "Até R$ 99",
    "100-199": "R$ 100 a R$ 199",
    "200-299": "R$ 200 a R$ 299",
    "300-plus": "Acima de R$ 300"
  };

  return labels[value] || "";
}

function getBadgeFilterLabel(value) {
  const labels = {
    promocao: "Promoções",
    novo: "Novidades",
    "mais-vendido": "Mais vendidos"
  };

  return labels[value] || "";
}

function getActiveFilterLabels() {
  const labels = [];

  if (productsState.selectedCategory !== "Todas") {
    labels.push(formatCategoryLabel(productsState.selectedCategory));
  }

  const priceLabel = getPriceRangeLabel(productsState.priceRange);
  if (priceLabel) {
    labels.push(priceLabel);
  }

  const badgeLabel = getBadgeFilterLabel(productsState.badgeFilter);
  if (badgeLabel) {
    labels.push(badgeLabel);
  }

  return labels;
}

function applySearchAndFilters(products) {
  let filtered = [...products];

  if (productsState.selectedCategory !== "Todas") {
    filtered = filtered.filter((product) => {
      return matchCategory(product.category, productsState.selectedCategory);
    });
  }

  if (productsState.searchTerm) {
    const term = normalizeText(productsState.searchTerm);
    filtered = filtered.filter((product) => {
      const title = normalizeText(product.title);
      const category = normalizeText(formatCategoryLabel(product.category));
      const badge = normalizeText(product.badge);

      return (
        title.includes(term) ||
        category.includes(term) ||
        badge.includes(term)
      );
    });
  }

  if (productsState.priceRange === "ate-99") {
    filtered = filtered.filter((product) => Number(product.price || 0) <= 99);
  }

  if (productsState.priceRange === "100-199") {
    filtered = filtered.filter((product) => {
      const price = Number(product.price || 0);
      return price >= 100 && price <= 199.99;
    });
  }

  if (productsState.priceRange === "200-299") {
    filtered = filtered.filter((product) => {
      const price = Number(product.price || 0);
      return price >= 200 && price <= 299.99;
    });
  }

  if (productsState.priceRange === "300-plus") {
    filtered = filtered.filter((product) => Number(product.price || 0) >= 300);
  }

  if (productsState.badgeFilter === "promocao") {
    filtered = filtered.filter((product) => Number(product.oldPrice || 0) > Number(product.price || 0));
  }

  if (productsState.badgeFilter === "novo") {
    filtered = filtered.filter((product) => normalizeText(product.badge).includes("novo"));
  }

  if (productsState.badgeFilter === "mais-vendido") {
    filtered = filtered.filter((product) => {
      return normalizeText(product.badge).includes("mais vendido");
    });
  }

  if (productsState.sortBy === "menor-preco") {
    filtered.sort((a, b) => a.price - b.price);
  }

  if (productsState.sortBy === "maior-preco") {
    filtered.sort((a, b) => b.price - a.price);
  }

  if (productsState.sortBy === "avaliacao") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  if (productsState.sortBy === "novidades") {
    filtered.sort((a, b) => {
      const aScore = normalizeText(a.badge).includes("novo") ? 1 : 0;
      const bScore = normalizeText(b.badge).includes("novo") ? 1 : 0;
      return bScore - aScore;
    });
  }

  if (productsState.sortBy === "maior-desconto") {
    filtered.sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a));
  }

  if (productsState.sortBy === "nome-az") {
    filtered.sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "pt-BR"));
  }

  if (productsState.sortBy === "nome-za") {
    filtered.sort((a, b) => String(b.title || "").localeCompare(String(a.title || ""), "pt-BR"));
  }

  return filtered;
}

function getPaginatedProducts(filteredProducts) {
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsState.pageSize));
  if (productsState.currentPage > totalPages) {
    productsState.currentPage = totalPages;
  }

  const start = (productsState.currentPage - 1) * productsState.pageSize;
  const end = start + productsState.pageSize;

  return {
    totalPages,
    pageItems: filteredProducts.slice(start, end)
  };
}

function renderCategoryChips() {
  const categories = getCategoryList(productsState.allProducts);
  productsState.selectedCategory = resolveCategorySelection(productsState.selectedCategory, categories);

  categoryChipsElement.innerHTML = categories
    .map((category) => {
      const activeClass = matchCategory(category, productsState.selectedCategory) ? "active" : "";
      return `<button class="chip ${activeClass}" type="button" data-category="${encodeURIComponent(category)}">${escapeHtml(formatCategoryLabel(category))}</button>`;
    })
    .join("");
}

function renderProductsPage() {
  const filteredProducts = applySearchAndFilters(productsState.allProducts);
  const { totalPages, pageItems } = getPaginatedProducts(filteredProducts);

  renderProductGrid({
    container: productGridElement,
    products: pageItems,
    onAddToCart: (productId) => {
      addCartItem(productId, 1);
      showToast("Produto adicionado ao carrinho.", {
        actionLabel: "Ir para o carrinho",
        actionHref: "/cart.html"
      });
    },
    emptyTitle: "Nenhum produto encontrado",
    emptyDescription: "Tente outro filtro, busca ou categoria."
  });

  pageLabelElement.textContent = `Página ${productsState.currentPage} de ${totalPages}`;
  previousButtonElement.disabled = productsState.currentPage <= 1;
  nextButtonElement.disabled = productsState.currentPage >= totalPages;

  const activeFilters = getActiveFilterLabels();
  const filtersSuffix = activeFilters.length ? ` Filtros: ${activeFilters.join(" · ")}.` : "";
  const catalogNote = productsState.catalogStatusNote ? ` ${productsState.catalogStatusNote}` : "";
  statusElement.textContent = `${filteredProducts.length} produto(s) encontrados.${filtersSuffix}${catalogNote}`;
}

function applyCatalogStatus(catalogResult) {
  if (catalogResult.source === "firestore") {
    productsState.catalogStatusNote = "Itens atualizados do catálogo.";
  }

  if (catalogResult.source === "fallback-empty") {
    productsState.catalogStatusNote = "Mostrando seleção disponível no momento.";
  }

  if (catalogResult.source === "fallback-error") {
    productsState.catalogStatusNote = "Conexão instável, exibindo itens disponíveis.";
  }
}

async function refreshCatalog() {
  const catalogResult = await loadCatalog({ maxItems: 120, includeFallback: true });
  productsState.allProducts = catalogResult.products;

  if (productsState.pendingCategory) {
    productsState.selectedCategory = productsState.pendingCategory;
    productsState.pendingCategory = "";
  }

  applyCatalogStatus(catalogResult);
  renderCategoryChips();
  renderProductsPage();
}

categoryChipsElement.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) {
    return;
  }

  productsState.selectedCategory = decodeURIComponent(button.dataset.category || "Todas");
  productsState.currentPage = 1;
  renderCategoryChips();
  renderProductsPage();
});

searchInputElement.addEventListener("input", () => {
  productsState.searchTerm = searchInputElement.value.trim();
  productsState.currentPage = 1;
  renderProductsPage();
});

sortSelectElement.addEventListener("change", () => {
  productsState.sortBy = sortSelectElement.value;
  productsState.currentPage = 1;
  renderProductsPage();
});

priceRangeSelectElement?.addEventListener("change", () => {
  productsState.priceRange = priceRangeSelectElement.value;
  productsState.currentPage = 1;
  renderProductsPage();
});

badgeFilterSelectElement?.addEventListener("change", () => {
  productsState.badgeFilter = badgeFilterSelectElement.value;
  productsState.currentPage = 1;
  renderProductsPage();
});

previousButtonElement.addEventListener("click", () => {
  if (previousButtonElement.disabled) {
    return;
  }

  productsState.currentPage = Math.max(1, productsState.currentPage - 1);
  renderProductsPage();
});

nextButtonElement.addEventListener("click", () => {
  if (nextButtonElement.disabled) {
    return;
  }

  productsState.currentPage += 1;
  renderProductsPage();
});

renderProductSkeleton(productGridElement, 8);
initCustomSelectDropdown(sortSelectElement);
initCustomSelectDropdown(priceRangeSelectElement);
initCustomSelectDropdown(badgeFilterSelectElement);
await refreshCatalog();
