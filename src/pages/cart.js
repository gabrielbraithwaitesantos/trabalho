import { buildProductMap, loadCatalog } from "../shared/catalog";
import {
  getStoredCart,
  setCartItemQuantity,
  removeCartItem,
  clearCart,
  addCartItem
} from "../shared/storage";
import { formatPrice, escapeHtml } from "../shared/format";
import { renderShell } from "../shared/shell";
import { showToast } from "../shared/notifications";
import { initPageMotion } from "../shared/motion";

const shippingLabel = "Retirada na loja";

renderShell("cart");
initPageMotion();

const statusElement = document.querySelector("#cart-status");
const cartItemsListElement = document.querySelector("#cart-items-list");
const subtotalElement = document.querySelector("#cart-subtotal");
const shippingElement = document.querySelector("#cart-shipping");
const totalElement = document.querySelector("#cart-total");
const checkoutButtonElement = document.querySelector("#checkout-button");

function getCartLines(productMap) {
  const cart = getStoredCart();
  const lines = [];

  Object.entries(cart).forEach(([productId, quantity]) => {
    const product = productMap.get(productId);
    if (!product) {
      return;
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return;
    }

    lines.push({
      product,
      quantity: Math.floor(qty),
      lineTotal: product.price * qty
    });
  });

  return lines;
}

function renderCart(lines) {
  if (!lines.length) {
    cartItemsListElement.innerHTML = `
      <article class="empty-card">
        <h3>Seu carrinho está vazio</h3>
        <p>Escolha produtos na página de catálogo para continuar.</p>
        <p><a href="/products.html">Ir para produtos</a></p>
      </article>
    `;

    subtotalElement.textContent = formatPrice(0);
    shippingElement.textContent = shippingLabel;
    totalElement.textContent = formatPrice(0);
    checkoutButtonElement.disabled = true;
    statusElement.textContent = "Nenhum item no carrinho.";
    return;
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const total = subtotal;

  subtotalElement.textContent = formatPrice(subtotal);
  shippingElement.textContent = shippingLabel;
  totalElement.textContent = formatPrice(total);
  checkoutButtonElement.disabled = false;
  statusElement.textContent = `${lines.length} item(ns) no pedido.`;

  cartItemsListElement.innerHTML = lines
    .map((line) => {
      const encodedId = encodeURIComponent(line.product.id);
      return `
        <article class="cart-line" data-line-id="${encodedId}">
          <div class="cart-line-info">
            <p class="cart-line-title">${escapeHtml(line.product.title)}</p>
            <p class="cart-line-meta">${escapeHtml(line.product.category)}</p>
            <p class="cart-line-total">${formatPrice(line.lineTotal)}</p>
          </div>
          <div class="cart-line-controls">
            <button type="button" data-action="decrease" data-product-id="${encodedId}">-</button>
            <span>${line.quantity}</span>
            <button type="button" data-action="increase" data-product-id="${encodedId}">+</button>
            <button type="button" data-action="remove" data-product-id="${encodedId}">Remover</button>
          </div>
        </article>
      `;
    })
    .join("");
}

const catalogResult = await loadCatalog({ maxItems: 80 });
const productMap = buildProductMap(catalogResult.products);

if (catalogResult.source === "firestore") {
  statusElement.textContent = "Seu carrinho está pronto para revisão.";
}
if (catalogResult.source === "fallback-empty") {
  statusElement.textContent = "Estamos atualizando o catálogo. Confira os itens antes de finalizar.";
}
if (catalogResult.source === "fallback-error") {
  statusElement.textContent = "Conexão instável. Revise o pedido antes de finalizar.";
}

renderCart(getCartLines(productMap));

cartItemsListElement.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const productId = decodeURIComponent(button.dataset.productId || "");
  if (!productId) {
    return;
  }

  const action = button.dataset.action;
  const cart = getStoredCart();
  const currentQty = Number(cart[productId] || 0);

  if (action === "increase") {
    addCartItem(productId, 1);
  }

  if (action === "decrease") {
    setCartItemQuantity(productId, currentQty - 1);
  }

  if (action === "remove") {
    removeCartItem(productId);
  }

  renderCart(getCartLines(productMap));
});

checkoutButtonElement.addEventListener("click", () => {
  const lines = getCartLines(productMap);
  if (!lines.length) {
    showToast("Adicione produtos antes de finalizar.");
    return;
  }

  clearCart();
  renderCart(getCartLines(productMap));
  showToast("Pedido iniciado. Retirada em loja; entrega apenas com combinacao previa.");
});
