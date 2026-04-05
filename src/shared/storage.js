const storageKeys = {
  user: "dudas:user",
  cart: "dudas:cart"
};

function safeReadJson(key, fallbackValue) {
  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      return fallbackValue;
    }
    return JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
}

function safeWriteJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage write errors.
  }
}

function dispatchEvent(name) {
  window.dispatchEvent(new CustomEvent(name));
}

export function getStoredUser() {
  const data = safeReadJson(storageKeys.user, null);
  if (!data || typeof data.email !== "string") {
    return null;
  }

  return {
    name: String(data.name || "Cliente"),
    email: data.email
  };
}

export function setStoredUser(user) {
  safeWriteJson(storageKeys.user, user);
  dispatchEvent("user:updated");
}

export function clearStoredUser() {
  try {
    window.localStorage.removeItem(storageKeys.user);
  } catch {
    // Ignore storage delete errors.
  }
  dispatchEvent("user:updated");
}

export function getStoredCart() {
  const data = safeReadJson(storageKeys.cart, {});
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }

  const normalized = {};
  Object.entries(data).forEach(([productId, quantity]) => {
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return;
    }
    normalized[productId] = Math.floor(qty);
  });

  return normalized;
}

function persistCart(cartMap) {
  safeWriteJson(storageKeys.cart, cartMap);
  dispatchEvent("cart:updated");
}

export function getCartItemCount() {
  return Object.values(getStoredCart()).reduce((total, qty) => total + qty, 0);
}

export function addCartItem(productId, quantity = 1) {
  const cart = getStoredCart();
  const current = Number(cart[productId] || 0);
  cart[productId] = Math.max(1, current + Math.floor(quantity));
  persistCart(cart);
}

export function setCartItemQuantity(productId, quantity) {
  const cart = getStoredCart();
  const normalizedQty = Math.floor(Number(quantity));

  if (!Number.isFinite(normalizedQty) || normalizedQty <= 0) {
    delete cart[productId];
  } else {
    cart[productId] = normalizedQty;
  }

  persistCart(cart);
}

export function removeCartItem(productId) {
  const cart = getStoredCart();
  delete cart[productId];
  persistCart(cart);
}

export function clearCart() {
  persistCart({});
}
