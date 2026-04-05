import { mountBrandAssets } from "./brand";
import { getCartItemCount } from "./storage";
import { getAuthSnapshot, signOutCurrentUser, waitForAuthReady } from "./auth";
import { showToast } from "./notifications";

function linkClass(isActive) {
  return isActive ? "shell-nav-link active" : "shell-nav-link";
}

function initTopLineTicker() {
  const topLineElement = document.querySelector(".shell-top-line");
  if (!topLineElement || topLineElement.dataset.tickerReady === "1") {
    return;
  }

  const baseMessage = topLineElement.textContent.trim();
  const messages = [
    baseMessage,
    "Retirada rapida em loja no Centro",
    "Compra segura com atendimento personalizado",
    "Novidades no catálogo toda semana",
    "Entrega somente com combinacao previa na loja",
    "Pagamento rápido com confirmação imediata"
  ].filter(Boolean);

  const uniqueMessages = Array.from(new Set(messages));
  const itemSeparator = '<span class="shell-top-line-sep">•</span>';
  const messageMarkup = uniqueMessages
    .map((message) => `<span class="shell-top-line-item">${message}</span>`)
    .join(itemSeparator);

  topLineElement.dataset.tickerReady = "1";
  topLineElement.setAttribute("aria-label", uniqueMessages.join(" | "));
  topLineElement.innerHTML = `
    <div class="shell-top-line-viewport" aria-hidden="true">
      <div class="shell-top-line-track">
        ${messageMarkup}
        ${itemSeparator}
        ${messageMarkup}
      </div>
    </div>
  `;
}

function renderHeader(activePage) {
  const header = document.querySelector("#site-header");
  if (!header) {
    return;
  }

  const existingHeaderMain = header.querySelector(".shell-header-main");
  if (existingHeaderMain) {
    const activeHrefByPage = {
      home: "/index.html",
      products: "/products.html",
      cart: "/cart.html",
      login: "/login.html",
      admin: "/admin.html"
    };

    const activeHref = activeHrefByPage[activePage];
    if (activeHref) {
      header.querySelectorAll(".shell-nav-link").forEach((link) => {
        link.classList.remove("active");
      });
      header.querySelector(`.shell-nav-link[href="${activeHref}"]`)?.classList.add("active");
    }

    return;
  }

  header.innerHTML = `
    <div class="shell-header-main page-container">
      <a href="/index.html" class="shell-brand" aria-label="Duda's Lingerie">
        <img data-brand-logo class="shell-brand-logo is-hidden" alt="Logo Duda's Lingerie" />
        <div data-logo-fallback class="shell-brand-fallback">
          <p>Duda's</p>
          <p>Lingerie</p>
        </div>
      </a>

      <nav class="shell-nav" aria-label="Navegação principal">
        <a class="${linkClass(activePage === "home")}" href="/index.html">Início</a>
        <a class="${linkClass(activePage === "products")}" href="/products.html">Produtos</a>
        <a id="shell-admin-link" class="${linkClass(activePage === "admin")} is-hidden" href="/admin.html">Admin</a>
        <a class="${linkClass(activePage === "cart")}" href="/cart.html">Carrinho</a>
        <a class="${linkClass(activePage === "login")}" href="/login.html">Conta</a>
      </nav>

      <div class="shell-actions">
        <a id="shell-account-link" class="shell-action-link" href="/login.html">Entrar</a>
        <button id="shell-logout-button" class="shell-logout-button is-hidden" type="button">Sair</button>
        <a class="shell-action-link shell-cart-link" href="/cart.html">
          Carrinho <span id="shell-cart-count" class="shell-cart-count">0</span>
        </a>
      </div>
    </div>
  `;
}

function renderFooter() {
  const footer = document.querySelector("#site-footer");
  if (!footer) {
    return;
  }

  footer.innerHTML = `
    <div class="page-container shell-footer-main">
      <div>
        <h3>Duda's Lingerie</h3>
        <p>Moda íntima premium com atendimento personalizado.</p>
      </div>
      <div>
        <p>Lojas físicas</p>
        <p>Rua Voluntários da Pátria, 66 - Centro, Curitiba</p>
        <p>Rua João Negrão, 309 - Centro, Curitiba</p>
      </div>
      <div>
        <p>Atendimento e retirada</p>
        <p>Seg. a Sex., 9h às 19h</p>
        <p>Sábados, 9h às 17h</p>
        <p>Retirada em loja. Entrega apenas com combinacao previa.</p>
        <p>Links rápidos</p>
        <p><a href="/products.html">Catálogo</a> | <a href="/cart.html">Carrinho</a></p>
      </div>
    </div>
  `;
}

async function refreshHeaderIndicators() {
  const cartCountElement = document.querySelector("#shell-cart-count");
  const accountLinkElement = document.querySelector("#shell-account-link");
  const logoutButtonElement = document.querySelector("#shell-logout-button");
  const adminLinkElement = document.querySelector("#shell-admin-link");

  if (cartCountElement) {
    cartCountElement.textContent = String(getCartItemCount());
  }

  if (accountLinkElement && logoutButtonElement) {
    await waitForAuthReady();
    const { user, isAdmin } = getAuthSnapshot();

    if (!user) {
      accountLinkElement.textContent = "Entrar";
      logoutButtonElement.classList.add("is-hidden");
      adminLinkElement?.classList.add("is-hidden");
      return;
    }

    const shortName = user.name.split(" ")[0] || "Cliente";
    accountLinkElement.textContent = `Olá, ${shortName}`;
    logoutButtonElement.classList.remove("is-hidden");
    adminLinkElement?.classList.toggle("is-hidden", !isAdmin);
  }
}

function bindShellEvents() {
  const logoutButtonElement = document.querySelector("#shell-logout-button");

  if (logoutButtonElement) {
    logoutButtonElement.addEventListener("click", async () => {
      try {
        await signOutCurrentUser();
        showToast("Sessão encerrada.");
      } catch {
        showToast("Não foi possível sair agora. Tente novamente.");
      }

      refreshHeaderIndicators();
    });
  }

  window.addEventListener("cart:updated", refreshHeaderIndicators);
  window.addEventListener("user:updated", refreshHeaderIndicators);
  window.addEventListener("storage", refreshHeaderIndicators);
}

export function renderShell(activePage) {
  initTopLineTicker();
  renderHeader(activePage);
  renderFooter();
  mountBrandAssets(document).catch(() => {
    // Fallback de texto permanece visível caso o carregamento da logo falhe.
  });
  void refreshHeaderIndicators();
  bindShellEvents();
}

export function updateShellHeaderState() {
  void refreshHeaderIndicators();
}
