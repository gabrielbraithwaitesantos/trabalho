import { addDoc, collection, getDocs, limit, query, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { fallbackProducts, getMockProductPhoto } from "./constants";
import { clampNumber, isSafeImageUrl } from "./format";

function normalizeCatalogKey(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizeProduct(id, data, index) {
  const imageCandidate = String(data.image || "").trim();
  const description = String(data.description || "").trim();
  const longDescription = String(data.longDescription || "").trim();
  const material = String(data.material || "").trim();
  const careRaw = data.care;
  const sizesRaw = data.sizes;
  const colorsRaw = data.colors;
  const stockRaw = Number(data.stock);

  const care = Array.isArray(careRaw)
    ? careRaw.map((item) => String(item || "").trim()).filter(Boolean)
    : typeof careRaw === "string"
      ? careRaw
          .split("|")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const sizes = Array.isArray(sizesRaw)
    ? sizesRaw.map((item) => String(item || "").trim()).filter(Boolean)
    : typeof sizesRaw === "string"
      ? sizesRaw
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const colors = Array.isArray(colorsRaw)
    ? colorsRaw.map((item) => String(item || "").trim()).filter(Boolean)
    : typeof colorsRaw === "string"
      ? colorsRaw
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const stock = Number.isFinite(stockRaw) && stockRaw >= 0 ? Math.floor(stockRaw) : null;

  return {
    id,
    title: String(data.title || data.name || `Produto ${index + 1}`),
    category: "Calcinhas",
    price: Number(data.price) || 0,
    oldPrice: Number(data.oldPrice) || 0,
    rating: clampNumber(data.rating, 0, 5, 4.8),
    badge: String(data.badge || ""),
    image: isSafeImageUrl(imageCandidate) ? imageCandidate : getMockProductPhoto(index),
    description,
    longDescription,
    material,
    care,
    sizes,
    colors,
    stock
  };
}

function fallbackCatalog(reason) {
  return {
    products: fallbackProducts.map((product, index) => {
      return normalizeProduct(product.id, { ...product, image: getMockProductPhoto(index) }, index);
    }),
    source: reason,
    error: ""
  };
}

function mergeWithFallbackProducts(products) {
  const existingIds = new Set();
  const existingTitles = new Set();

  products.forEach((product) => {
    existingIds.add(String(product.id || ""));
    existingTitles.add(normalizeCatalogKey(product.title));
  });

  const fallbackOnlyProducts = fallbackProducts
    .map((product, index) => {
      return normalizeProduct(product.id, { ...product, image: getMockProductPhoto(index) }, index);
    })
    .filter((product) => {
      const productId = String(product.id || "");
      const titleKey = normalizeCatalogKey(product.title);
      return !existingIds.has(productId) && !existingTitles.has(titleKey);
    });

  return [...products, ...fallbackOnlyProducts];
}

export async function loadCatalog(options = {}) {
  const maxItems = Number(options.maxItems || 30);
  const includeFallback = Boolean(options.includeFallback);

  try {
    const catalogQuery = query(collection(db, "products"), limit(maxItems));
    const snapshot = await getDocs(catalogQuery);

    if (snapshot.empty) {
      return fallbackCatalog("fallback-empty");
    }

    const products = snapshot.docs.map((doc, index) => normalizeProduct(doc.id, doc.data(), index));
    const mergedProducts = includeFallback ? mergeWithFallbackProducts(products) : products;

    return {
      products: mergedProducts,
      source: "firestore",
      error: ""
    };
  } catch (error) {
    const response = fallbackCatalog("fallback-error");
    response.error = error instanceof Error ? error.message : "Erro desconhecido";
    return response;
  }
}

export function getCategoryList(products) {
  if (!products.length) {
    return ["Todas", "Calcinhas"];
  }

  return ["Todas", "Calcinhas"];
}

export function buildProductMap(products) {
  const map = new Map();
  products.forEach((product) => {
    map.set(product.id, product);
  });
  return map;
}

export async function createCatalogProduct(input) {
  const title = String(input.title || "").trim();
  const category = "Calcinhas";
  const badge = String(input.badge || "").trim();
  const image = String(input.image || "").trim();
  const description = String(input.description || "").trim();
  const longDescription = String(input.longDescription || "").trim();
  const material = String(input.material || "").trim();
  const colorsRaw = input.colors;
  const stockRaw = Number(input.stock);

  const care = Array.isArray(input.care)
    ? input.care.map((item) => String(item || "").trim()).filter(Boolean)
    : typeof input.care === "string"
      ? input.care
          .split("|")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const sizes = Array.isArray(input.sizes)
    ? input.sizes.map((item) => String(item || "").trim()).filter(Boolean)
    : typeof input.sizes === "string"
      ? input.sizes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const colors = Array.isArray(colorsRaw)
    ? colorsRaw.map((item) => String(item || "").trim()).filter(Boolean)
    : typeof colorsRaw === "string"
      ? colorsRaw
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const stock = Number.isFinite(stockRaw) && stockRaw >= 0 ? Math.floor(stockRaw) : 0;

  const price = Number(input.price);
  const oldPrice = Number(input.oldPrice || 0);
  const rating = clampNumber(input.rating, 0, 5, 4.8);

  if (!title) {
    throw new Error("Informe o nome do produto.");
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Informe um preço válido maior que zero.");
  }

  if (image && !isSafeImageUrl(image)) {
    throw new Error("A imagem precisa ser uma URL válida.");
  }

  const payload = {
    title,
    category,
    price,
    oldPrice: Number.isFinite(oldPrice) && oldPrice > 0 ? oldPrice : 0,
    rating,
    badge,
    image,
    description,
    longDescription,
    material,
    care,
    sizes,
    colors,
    stock,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const reference = await addDoc(collection(db, "products"), payload);

  return {
    id: reference.id,
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
