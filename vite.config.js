import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { seoPlugin } from "./seo/seo-plugin.js";

export default defineConfig(({ isSsrBuild }) => ({
  // O plugin de SEO só roda no build do site; o build de pré-renderização não gera arquivos públicos.
  plugins: [react(), ...(isSsrBuild ? [] : [seoPlugin()])],
  base: "./", // caminhos relativos: funciona em qualquer subpasta (GitHub Pages, Netlify, etc.)
  test: { environment: "node" },
}));
