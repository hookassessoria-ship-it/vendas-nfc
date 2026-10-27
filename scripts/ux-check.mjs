// Verificação de usabilidade mobile em 320, 375, 390 e 430 px e no desktop, com dados de demonstração:
// - sem rolagem horizontal em nenhuma tela;
// - áreas de toque de pelo menos 40 px (44 px recomendados) em botões, chips, links de ação e interruptores;
// - o último conteúdo de cada tela rola para cima da barra inferior fixa;
// - o botão principal das gavetas (venda, despesa) fica visível acima da área segura.
// Gera capturas em e2e-artifacts/ux/. Uso: BASE_URL=http://localhost:4173/ node scripts/ux-check.mjs
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = (process.env.BASE_URL ?? "http://localhost:4173/").replace(/\/?$/, "/");
const OUT = new URL("../e2e-artifacts/ux/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const SCREENS = ["inicio", "relatorios", "rotas", "vendas", "financas", "financas/custos", "financas/estoque", "financas/transporte", "inteligencia", "metas", "simulador", "importar", "estabelecimentos", "configuracoes", "historico", "definicoes"];
const failures = [];
const fail = (m) => { failures.push(m); console.log("✗", m); };

const browser = await chromium.launch();
async function session(width, mobile) {
  const ctx = await browser.newContext({ viewport: { width, height: mobile ? 800 : 900 }, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile, locale: "pt-BR", timezoneId: "America/Sao_Paulo" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE + "#/configuracoes");
  await page.getByRole("radio", { name: "Ver demonstração" }).click();
  await page.waitForTimeout(1200);
  return { ctx, page, errors };
}

for (const [width, mobile] of [[320, true], [375, true], [390, true], [430, true], [1280, false]]) {
  const { ctx, page, errors } = await session(width, mobile);
  let small = new Set();
  for (const s of SCREENS) {
    await page.goto(BASE + "#/" + s);
    await page.waitForTimeout(s === "relatorios" ? 1200 : 500);
    const r = await page.evaluate(() => {
      const vw = window.innerWidth;
      const over = document.documentElement.scrollWidth > vw + 1;
      const wide = over ? [...document.querySelectorAll("main *")].filter((el) => el.getBoundingClientRect().right > vw + 1 && getComputedStyle(el).position !== "fixed" && !el.closest(".overflow-x-auto")).slice(0, 3).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`) : [];
      const targets = [...document.querySelectorAll('main button, main a[href], main [role="radio"], main [role="switch"], nav button, button[aria-label="Ações rápidas"], header button')]
        .filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(el).visibility !== "hidden" && !el.closest("p"); })
        .map((el) => { const b = el.getBoundingClientRect(); const extra = el.classList.contains("tap") ? 12 : 0; return { h: b.height + extra, w: b.width, t: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40) }; })
        .filter((x) => x.h < 40 || x.w < 40);
      return { over, wide, targets };
    });
    if (r.over) fail(`${width}px #/${s}: rolagem horizontal (${r.wide.join(" | ")})`);
    for (const t of r.targets) small.add(`${t.t} (${Math.round(t.w)}×${Math.round(t.h)})`);
    if (mobile) {
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(250);
      const hidden = await page.evaluate(() => {
        const nav = document.querySelector('nav[aria-label="Navegação principal"]');
        const main = document.querySelector("main");
        const last = main?.lastElementChild?.lastElementChild ?? main?.lastElementChild;
        if (!nav || !last) return null;
        const lb = last.getBoundingClientRect().bottom, nt = nav.getBoundingClientRect().top;
        return lb > nt + 1 ? `último bloco termina em ${Math.round(lb)} e a barra começa em ${Math.round(nt)}` : null;
      });
      if (hidden) fail(`${width}px #/${s}: conteúdo escondido atrás da barra inferior (${hidden})`);
      if (width === 390) { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}${s.replace("/", "-")}-${width}.png` }); }
    }
  }
  if (mobile) {
    // Gaveta de venda: botão "Salvar venda" visível e dentro da tela.
    await page.goto(BASE + "#/inicio");
    await page.getByRole("button", { name: "Ações rápidas" }).click();
    await page.getByRole("button", { name: /Registrar venda/ }).click();
    const btn = page.getByRole("button", { name: /Salvar venda/ });
    await btn.waitFor();
    await page.waitForTimeout(600); // fim da animação de abertura da gaveta
    const b = await btn.boundingBox();
    const vh = page.viewportSize().height;
    if (!b || b.y + b.height > vh || b.height < 44) fail(`${width}px: botão Salvar venda fora da tela ou pequeno (${JSON.stringify(b)})`);
    if (width === 390) await page.screenshot({ path: `${OUT}sheet-venda-${width}.png` });
    // Proteção contra perder o formulário: digitar e tocar fora pede confirmação.
    await page.locator('input[inputmode="decimal"]').first().fill("50,00");
    await page.mouse.click(10, 10);
    const asked = await page.getByText("Descartar o que você preencheu?").isVisible();
    if (!asked) fail(`${width}px: tocar fora da venda preenchida não pediu confirmação`);
    else { await page.getByRole("button", { name: "Continuar editando" }).click(); }
    if (width === 390 && asked) await page.screenshot({ path: `${OUT}sheet-venda-preenchida-${width}.png` });
  }
  if (small.size) console.log(`  ${width}px: alvos de toque < 40 px: ${[...small].slice(0, 12).join("; ")}${small.size > 12 ? ` (+${small.size - 12})` : ""}`);
  if (errors.length) fail(`${width}px: erros no console: ${errors.join(" | ")}`);
  console.log(`${failures.length ? "…" : "✓"} ${width}px verificado (${SCREENS.length} telas)`);
  await ctx.close();
}
await browser.close();
if (failures.length) { console.log(`\n${failures.length} problema(s).`); process.exitCode = 1; }
else console.log("\nSem rolagem horizontal, sem conteúdo escondido pela barra e gavetas utilizáveis em todas as larguras.");
