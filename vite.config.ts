/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// Publicado na raiz do domínio (Vercel). Caminhos absolutos fazem /rotas/123 carregar os mesmos arquivos.
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "apple-touch-icon.png", "dados/*"],
      manifest: {
        name: "Vendas NFC — Prospecção e Finanças",
        short_name: "Vendas NFC",
        description: "Rotas, visitas, vendas e finanças da venda presencial de placas NFC.",
        lang: "pt-BR",
        theme_color: "#16141c",
        background_color: "#16141c",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,csv,xlsx}"],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
    }),
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: {
    chunkSizeWarningLimit: 650,
    // Sem manualChunks: o Rollup separa os gráficos (recharts) no chunk da tela de Relatórios,
    // que só é baixado quando ela é aberta. O service worker pré-carrega tudo para uso offline.
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    env: { TZ: "America/Sao_Paulo" },
  },
});
