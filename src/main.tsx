import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./index.css";

// O app navega por hash (#/rotas). Se alguém abrir um caminho como /rotas/123 (link antigo,
// favorito ou digitado), a Vercel entrega o index.html e aqui convertemos para #/rotas/123.
if (window.location.pathname !== "/" && !window.location.hash) {
  window.history.replaceState(null, "", "/#" + window.location.pathname.replace(/\/index\.html$/, "/") + window.location.search);
}

// Service worker: o app abre mesmo sem internet depois do primeiro acesso.
if ("serviceWorker" in navigator && import.meta.env.PROD) registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
