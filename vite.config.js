import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, "index.html"),
        products: resolve(__dirname, "products.html"),
        admin: resolve(__dirname, "admin.html"),
        login: resolve(__dirname, "login.html"),
        cart: resolve(__dirname, "cart.html"),
        product: resolve(__dirname, "product.html"),
      },
    },
  },
});
