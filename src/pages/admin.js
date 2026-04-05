import { createCatalogProduct, loadCatalog } from "../shared/catalog";
import { escapeHtml, formatCategoryLabel, formatPrice } from "../shared/format";
import { initPageMotion } from "../shared/motion";
import { showToast } from "../shared/notifications";
import { renderShell, updateShellHeaderState } from "../shared/shell";
import { getAuthSnapshot, waitForAuthReady } from "../shared/auth";

renderShell("admin");
initPageMotion();

const guardTitleElement = document.querySelector("#admin-guard-title");
const guardDescriptionElement = document.querySelector("#admin-guard-description");
const loginLinkElement = document.querySelector("#admin-login-link");
const productsLinkElement = document.querySelector("#admin-products-link");
const formSectionElement = document.querySelector("#admin-form-section");
const latestSectionElement = document.querySelector("#admin-latest-section");
const formElement = document.querySelector("#admin-product-form");
const formFeedbackElement = document.querySelector("#admin-form-feedback");
const submitButtonElement = document.querySelector("#admin-product-submit");
const latestStatusElement = document.querySelector("#admin-latest-status");
const latestGridElement = document.querySelector("#admin-latest-grid");

const adminState = {
  submitting: false
};

function setSubmitting(submitting) {
  adminState.submitting = submitting;
  submitButtonElement.disabled = submitting;
  submitButtonElement.textContent = submitting ? "Salvando produto..." : "Adicionar produto";
}

function parseProductDraft(formData) {
  return {
    title: String(formData.get("title") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    price: Number(formData.get("price") || 0),
    oldPrice: Number(formData.get("oldPrice") || 0),
    rating: Number(formData.get("rating") || 0),
    badge: String(formData.get("badge") || "").trim(),
    image: String(formData.get("image") || "").trim(),
    stock: Number(formData.get("stock") || 0),
    colors: String(formData.get("colors") || "").trim()
  };
}

function getColorsPreview(product) {
  if (Array.isArray(product.colors) && product.colors.length) {
    return product.colors.join(", ");
  }

  if (typeof product.colors === "string" && product.colors.trim()) {
    return product.colors
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ");
  }

  return "Padrão por categoria";
}

function getStockPreview(product) {
  const stock = Number(product.stock);
  if (Number.isFinite(stock) && stock >= 0) {
    return `${Math.floor(stock)} unidade(s)`;
  }

  return "Não definido";
}

function renderLatestProducts(products) {
  if (!products.length) {
    latestGridElement.innerHTML = "";
    latestStatusElement.textContent = "Ainda não existem produtos para mostrar.";
    return;
  }

  latestGridElement.innerHTML = products
    .slice(0, 6)
    .map((product) => {
      return `
        <article class="admin-latest-card">
          <h3>${escapeHtml(product.title)}</h3>
          <p>${escapeHtml(formatCategoryLabel(product.category))}</p>
          <p>Estoque: ${escapeHtml(getStockPreview(product))}</p>
          <p>Cores: ${escapeHtml(getColorsPreview(product))}</p>
          <strong>${formatPrice(product.price)}</strong>
        </article>
      `;
    })
    .join("");
}

async function refreshLatestProducts() {
  latestStatusElement.textContent = "Carregando produtos recentes...";

  const catalogResult = await loadCatalog({ maxItems: 20 });

  if (catalogResult.source === "firestore") {
    latestStatusElement.textContent = "Últimos produtos cadastrados na loja.";
  }

  if (catalogResult.source === "fallback-empty") {
    latestStatusElement.textContent = "Sem produtos no Firestore ainda. Mostrando fallback local.";
  }

  if (catalogResult.source === "fallback-error") {
    latestStatusElement.textContent = "Conexão instável. Mostrando catálogo local temporário.";
  }

  renderLatestProducts(catalogResult.products);
}

async function syncAccessState() {
  await waitForAuthReady();
  updateShellHeaderState();

  const { user, isAdmin } = getAuthSnapshot();

  if (!user) {
    guardTitleElement.textContent = "Login necessário para acessar o painel admin.";
    guardDescriptionElement.textContent =
      "Entre com sua conta e, se ela tiver permissão admin, o formulário será liberado automaticamente.";

    loginLinkElement.classList.remove("is-hidden");
    productsLinkElement.classList.remove("is-hidden");
    formSectionElement.classList.add("is-hidden");
    latestSectionElement.classList.add("is-hidden");
    return false;
  }

  if (!isAdmin) {
    guardTitleElement.textContent = "Conta sem permissão administrativa.";
    guardDescriptionElement.textContent =
      `Sua conta está conectada, mas sem acesso de admin. UID: ${user.uid}.`;

    loginLinkElement.classList.add("is-hidden");
    productsLinkElement.classList.remove("is-hidden");
    formSectionElement.classList.add("is-hidden");
    latestSectionElement.classList.add("is-hidden");
    return false;
  }

  guardTitleElement.textContent = "Acesso administrativo ativo.";
  guardDescriptionElement.textContent =
    "Cadastre novos produtos aqui. Esta área aparece apenas para contas admin.";

  loginLinkElement.classList.add("is-hidden");
  productsLinkElement.classList.add("is-hidden");
  formSectionElement.classList.remove("is-hidden");
  latestSectionElement.classList.remove("is-hidden");
  return true;
}

formElement.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (adminState.submitting) {
    return;
  }

  await waitForAuthReady();
  const { isAdmin } = getAuthSnapshot();
  if (!isAdmin) {
    showToast("Apenas contas admin podem cadastrar produtos.");
    return;
  }

  const formData = new FormData(formElement);
  const draft = parseProductDraft(formData);

  setSubmitting(true);

  try {
    await createCatalogProduct(draft);
    formFeedbackElement.textContent = "Produto cadastrado com sucesso no Firestore.";
    showToast("Produto adicionado ao catálogo.");
    formElement.reset();
    await refreshLatestProducts();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível cadastrar o produto.";
    formFeedbackElement.textContent = message;
  } finally {
    setSubmitting(false);
  }
});

window.addEventListener("user:updated", async () => {
  const hasAccess = await syncAccessState();
  if (hasAccess) {
    await refreshLatestProducts();
  }
});

const hasAccess = await syncAccessState();
if (hasAccess) {
  await refreshLatestProducts();
}
