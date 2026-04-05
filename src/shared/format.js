export function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number(value) || 0);
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function clampNumber(value, min, max, fallback = min) {
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    return fallback;
  }
  return Math.min(Math.max(normalized, min), max);
}

export function isSafeImageUrl(value) {
  return typeof value === "string" && /^(https?:\/\/|\/)/i.test(value);
}

const categoryLabelMap = {
  Calcinhas: "Calcinhas"
};

export function formatCategoryLabel(category) {
  const normalized = String(category || "").trim();
  return categoryLabelMap[normalized] || normalized;
}
