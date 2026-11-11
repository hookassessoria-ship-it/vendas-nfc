/* Meu Montador — ilustrações em SVG.
 * O móvel é desenhado a partir de um modelo esquemático (medidas da tabela, proporções aproximadas).
 * Cada etapa destaca em amarelo as peças novas; o que já foi montado fica cinza.
 */
(function () {
  "use strict";

  /* ---------- Modelo do móvel (vista de frente, mm; y para cima) ---------- */
  const COL = [[12, 497], [509, 994], [1006, 1491], [1503, 1988]];
  const BAR_X = [497, 994, 1491];
  const M = [];
  const add = (key, code, x1, y1, x2, y2, extra) => M.push(Object.assign({ key, code, x1, y1, x2, y2 }, extra || {}));

  add("rod02", "02", 12, 0, 1988, 190, { lbl: [1000, 95] });
  add("lat01", "01", 0, 0, 12, 1740, { lbl: [6, 1000], lblOut: -1 });
  add("lat16", "16", 1988, 0, 2000, 1740, { lbl: [1994, 1000], lblOut: 1 });
  add("top15", "15", 12, 1728, 1988, 1740, { lbl: [1000, 1734] });
  add("mid13", "13", 12, 549, 1988, 561, { lbl: [250, 555] });
  BAR_X.forEach((x, i) => add("bars", "07/09", x, 561, x + 12, 1728, { lbl: [x + 6, 1150], i }));
  [["12", 497], ["11", 994], ["10", 1491]].forEach(([c, x]) => add("divs", c, x, 190, x + 12, 549, { lbl: [x + 6, 370] }));
  BAR_X.forEach((x) => add("sup06", "06", x - 14, 150, x + 26, 190, { lbl: [x + 6, 170], small: true }));
  [900, 1310].forEach((y) => add("shelvesL", "14", 12, y, 497, y + 12, { lbl: [255, y + 6] }));
  [900, 1310].forEach((y) => add("shelvesR", "14", 1503, y, 1988, y + 12, { lbl: [1745, y + 6] }));
  [12, 1503].forEach((x) => add("bases", "05", x, 190, x + 485, 200, { lbl: [x + 242, 195] }));
  [[530, 973], [1027, 1470]].forEach(([a, b]) => add("rods", "T", a, 1610, b, 1636, { lbl: [(a + b) / 2, 1623], round: true }));
  add("top08", "08", 0, 1740, 2000, 1814, { lbl: [1000, 1777], back: true });
  [20, 640, 1360, 1980].forEach((x) => add("feet", "U", x - 22, -70, x + 22, 0, { lbl: [x, -35], foot: true }));
  [[503, 996], [1004, 1497]].forEach(([a, b]) => {
    add("drawers", "19", a, 190, b, 368, { lbl: [(a + b) / 2, 330], front: true });
    add("drawers", "19", a, 370, b, 548, { lbl: [(a + b) / 2, 510], front: true });
  });
  const DOORS = [
    ["17", 3, 248, 190, 1732], ["17", 251, 496, 190, 1732],
    ["18", 506, 751, 562, 1732], ["18", 754, 999, 562, 1732],
    ["18", 1001, 1246, 562, 1732], ["18", 1249, 1494, 562, 1732],
    ["17", 1504, 1749, 190, 1732], ["17", 1752, 1997, 190, 1732],
  ];
  DOORS.forEach(([c, a, b, y1, y2]) => add("doors", c, a, y1, b, y2, { lbl: [(a + b) / 2, y1 + (y2 - y1) * 0.62], front: true }));
  // puxadores: 1 por porta, perto da borda onde o par se encontra
  [[232, 1000], [267, 1000], [735, 760], [770, 760], [1230, 760], [1265, 760], [1733, 1000], [1768, 1000]].forEach(([x, y]) =>
    add("dhandles", "H", x - 7, y, x + 7, y + 230, { front: true, handle: true }));
  [[503, 996], [1004, 1497]].forEach(([a, b]) => [279, 459].forEach((y) =>
    add("drawers", "H", (a + b) / 2 - 130, y - 7, (a + b) / 2 + 130, y + 7, { front: true, handle: true })));

  const INSTALL = { top15: 2, bars: 2, mid13: 2, divs: 2, sup06: 2, rod02: 3, shelvesL: 3, lat01: 3, shelvesR: 4, lat16: 4,
    feet: 5, rods: 6, bases: 6, back23: 7, top08: 7, drawers: 10, doors: 12, dhandles: 12 };

  /* ---------- Transformações de vista ---------- */
  const VIEWS = {
    empe: { vb: "0 0 2200 2010", t: (x, y) => [x + 100, 1910 - y] },
    costas: { vb: "0 0 2200 2010", t: (x, y) => [2100 - x, 1910 - y] },
    // deitado de costas, com a parte de baixo à esquerda (como nas etapas 02 a 05 do manual)
    deitado: { vb: "0 0 2140 2340", t: (x, y) => [y + 260, 2200 - x] },
  };

  function rectT(view, x1, y1, x2, y2) {
    const a = view.t(x1, y1), b = view.t(x2, y2);
    let x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]), w = Math.abs(a[0] - b[0]), h = Math.abs(a[1] - b[1]);
    const MIN = 30; // espessura mínima desenhada, para as chapas de 12 mm ficarem visíveis
    if (w < MIN) { x -= (MIN - w) / 2; w = MIN; }
    if (h < MIN) { y -= (MIN - h) / 2; h = MIN; }
    return { x, y, w, h };
  }

  const COLORS = { A: "#d6336c", B: "#c2410c", C: "#b91c1c", F: "#7c3aed", D: "#a16207", K: "#854d0e", E: "#475569",
    O: "#1d4ed8", N: "#0f766e", G: "#0e7490", U: "#334155", V: "#4d7c0f", L: "#be185d", M: "#9d174d", T: "#475569",
    I: "#1e40af", J: "#ca8a04", H: "#334155", P: "#1f2937", Q: "#4338ca", X: "#6d28d9" };
  window.HW_COLOR = COLORS;

  function marker(cx, cy, code, r) {
    r = r || 46;
    const c = COLORS[code] || "#111";
    return `<g class="mk"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${c}" stroke-width="${r * 0.22}"/>` +
      `<text x="${cx}" y="${cy + r * 0.38}" text-anchor="middle" font-size="${r * 1.1}" font-weight="800" fill="${c}">${code}</text></g>`;
  }
  window.SVG_MARKER = marker;

  function codeTag(cx, cy, code, cls) {
    const w = code.length > 2 ? 230 : 150;
    return `<g class="tag ${cls}"><rect x="${cx - w / 2}" y="${cy - 48}" width="${w}" height="96" rx="48"/>` +
      `<text x="${cx}" y="${cy + 24}" text-anchor="middle">${code}</text></g>`;
  }

  /* Desenha o modelo. opts: { view, step, novo:[keys], antes:[keys], marks:[[x,y,code]], semPortas, nota } */
  function modelo(opts) {
    const view = VIEWS[opts.view || "empe"];
    const novo = new Set(opts.novo || []);
    const antes = new Set(opts.antes || []);
    const tudo = opts.tudo;
    const status = (k) => {
      if (novo.has(k)) return "new";
      if (tudo || antes.has(k) || (INSTALL[k] && INSTALL[k] < opts.step)) return "done";
      return null;
    };
    let body = "", tags = "";
    if (opts.view === "deitado") body += `<rect x="30" y="20" width="2080" height="2300" rx="30" class="papelao"/>` +
      `<text x="1070" y="2295" text-anchor="middle" class="papelao-txt">papelão da embalagem no chão</text>`;
    if (opts.view === "costas" && status("back23")) {
      [0, 1, 2, 3].forEach((i) => {
        const r = rectT(view, i * 500, 175, i * 500 + 500, 1735);
        body += `<rect x="${r.x + 3}" y="${r.y}" width="${r.w - 6}" height="${r.h}" class="s-${status("back23")} thin"/>`;
        const c = view.t(i * 500 + 250, 1000);
        tags += codeTag(c[0], c[1], "23", status("back23"));
      });
    }
    const order = ["back", "struct", "front", "handle"];
    const layer = (e) => e.handle ? "handle" : e.front ? "front" : e.back ? "back" : "struct";
    const skipFront = opts.view === "costas" || opts.semPortas;
    for (const L of order) {
      for (const e of M) {
        if (layer(e) !== L) continue;
        if (skipFront && (e.key === "doors" || e.key === "dhandles")) continue;
        const st = status(e.key);
        if (!st) continue;
        // Portas fechadas escondem o interior: mostra-se o interior só até a etapa 11
        const r = rectT(view, e.x1, e.y1, e.x2, e.y2);
        const cls = `s-${st}${e.key === "doors" ? " door" : ""}${e.handle ? " hnd" : ""}`;
        if (e.foot) {
          body += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="10" class="${cls}"/>`;
        } else if (e.round) {
          body += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${Math.min(r.w, r.h) / 2}" class="${cls}"/>`;
        } else {
          body += `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" class="${cls}"/>`;
        }
        if (e.lbl && (st === "new" || opts.rotulos) && !e.handle) {
          const c = view.t(e.lbl[0], e.lbl[1]);
          let dx = 0;
          if (e.lblOut && opts.view !== "deitado") dx = e.lblOut * 70 * (opts.view === "costas" ? -1 : 1);
          let dy = 0;
          if (e.lblOut && opts.view === "deitado") dy = -e.lblOut * 70;
          tags += codeTag(c[0] + dx, c[1] + dy, e.code, st);
        }
      }
    }
    if (opts.view === "costas" && status("back23") === "new") {
      // emendas com prendedores G
      [500, 1000, 1500].forEach((x) => {
        for (let k = 0; k < 10; k++) {
          const p = view.t(x, 260 + k * 150);
          body += `<rect x="${p[0] - 14}" y="${p[1] - 9}" width="28" height="18" fill="${COLORS.G}"/>`;
        }
      });
    }
    let mk = "";
    (opts.marks || []).forEach(([x, y, code]) => { const p = view.t(x, y); mk += marker(p[0], p[1], code, 62); });
    const extra = opts.extra ? opts.extra(view) : "";
    return `<svg viewBox="${view.vb}" class="ill" role="img" aria-label="${opts.aria || "Ilustração da etapa"}">${body}${tags}${extra}${mk}</svg>`;
  }

  /* ---------- Desenhos de detalhe ---------- */
  const W = (vb, inner, aria) => `<svg viewBox="${vb}" class="ill" role="img" aria-label="${aria || "Detalhe"}">${inner}</svg>`;
  const T = (x, y, s, size, cls, anchor) => `<text x="${x}" y="${y}" font-size="${size || 18}" text-anchor="${anchor || "middle"}" class="${cls || "t"}">${s}</text>`;
  const arrow = (x1, y1, x2, y2, cls) => {
    const a = Math.atan2(y2 - y1, x2 - x1), h = 12;
    const p1 = [x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)], p2 = [x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)];
    return `<g class="${cls || "arw"}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><polygon points="${x2},${y2} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}"/></g>`;
  };
  const mk = (x, y, c, r) => marker(x, y, c, r || 14);
  const screwDot = (x, y, code) => `<circle cx="${x}" cy="${y}" r="4.5" fill="${COLORS[code]}"/>`;
  const tag = (x, y, code, st) => {
    const w = code.length > 2 ? 52 : 36;
    return `<g class="tag ${st || "new"} sm"><rect x="${x - w / 2}" y="${y - 13}" width="${w}" height="26" rx="13"/><text x="${x}" y="${y + 6}" text-anchor="middle">${code}</text></g>`;
  };
  const rail = (x, y, w) => `<rect x="${x}" y="${y - 5}" width="${w}" height="10" rx="3" class="rail"/><circle cx="${x + w - 6}" cy="${y}" r="6" class="wheel"/>`;
  const person = (x, y, s) => { s = s || 1; return `<g class="person" transform="translate(${x},${y}) scale(${s})"><circle cx="0" cy="-58" r="12"/><path d="M-14,-42 h28 l6,40 h-10 l-2,-24 l-2,24 l2,40 h-10 l-2,-38 l-2,38 h-10 l2,-40 l-2,-24 l-2,24 h-10 z"/></g>`; };

  const D = {};

  D.p1Trilhos = () => {
    let s = "";
    const panels = [["12", 30, "→"], ["11", 225, "↔"], ["10", 420, "←"]];
    panels.forEach(([c, x, dir]) => {
      s += `<rect x="${x}" y="40" width="150" height="145" class="s-done"/>`;
      s += rail(x + 8, 78, 134) + rail(x + 8, 150, 134);
      [x + 30, x + 110].forEach((sx) => { s += screwDot(sx, 78, "A") + screwDot(sx, 150, "A"); });
      s += tag(x + 75, 115, c, "new");
      const t = c === "11" ? "trilhos nos 2 lados" : c === "12" ? "trilhos para a direita" : "trilhos para a esquerda";
      s += T(x + 75, 212, t, 14, "t2");
      s += T(x + 75, 238, dir, 24, "t3");
    });
    s += `<path d="M300,30 C 280,4 330,4 312,30" class="flip"/>` + arrow(318, 22, 312, 31, "arw sm");
    s += mk(560, 30, "I") + mk(560, 68, "A");
    s += T(300, 275, "Gavetas ficam entre 12 e 11, e entre 11 e 10", 15, "t2");
    return W("0 0 600 290", s, "Trilhos nas divisões 12, 11 e 10");
  };

  D.p1Porcas = () => {
    let s = "";
    const rows = [["02", 560], ["03", 560], ["07", 440], ["07", 440], ["07", 440], ["09", 440], ["09", 440], ["09", 440], ["06", 200], ["06", 200], ["06", 200]];
    rows.forEach(([c, w], i) => {
      const y = 22 + i * 21;
      s += `<rect x="70" y="${y}" width="${w}" height="13" class="s-done"/>`;
      s += `<circle cx="84" cy="${y + 6.5}" r="5" fill="${COLORS.O}"/><circle cx="${70 + w - 14}" cy="${y + 6.5}" r="5" fill="${COLORS.O}"/>`;
      s += T(48, y + 11, c, 13, "t2b");
    });
    // detalhe da porca
    const dx = 470, dy = 268;
    s += `<rect x="${dx - 110}" y="${dy - 22}" width="230" height="44" class="s-new"/>`;
    s += `<circle cx="${dx + 70}" cy="${dy}" r="14" fill="#fff" stroke="${COLORS.O}" stroke-width="3"/><line x1="${dx + 60}" y1="${dy}" x2="${dx + 80}" y2="${dy}" stroke="${COLORS.O}" stroke-width="3"/>`;
    s += `<line x1="${dx + 70}" y1="${dy}" x2="${dx + 150}" y2="${dy}" stroke="${COLORS.C}" stroke-dasharray="6 5" stroke-width="2"/>`;
    s += arrow(dx + 175, dy, dx + 128, dy, "arw red");
    s += T(dx - 30, dy + 52, "furo da porca alinhado com o furo da borda", 13, "t2");
    s += mk(dx - 140, dy, "O", 16);
    return W("0 0 640 335", s, "Porcas O nas pontas das ripas");
  };

  D.p1Rodape = () => {
    let s = "";
    [60, 160].forEach((y) => {
      s += `<rect x="90" y="${y}" width="330" height="70" class="s-new"/>` + tag(255, y + 35, "04");
      [y + 20, y + 50].forEach((yy) => {
        s += `<rect x="58" y="${yy - 4}" width="32" height="8" rx="3" fill="${COLORS.D}"/><rect x="420" y="${yy - 4}" width="32" height="8" rx="3" fill="${COLORS.D}"/>`;
      });
      s += `<path d="M120,${y + 70} v18 h26" class="corner"/><path d="M390,${y + 70} v18 h-26" class="corner"/>`;
    });
    s += mk(40, 30, "D") + mk(475, 30, "N") + mk(510, 30, "A");
    s += T(255, 275, "2 cavilhas D em cada ponta · 2 cantoneiras N por peça", 14, "t2");
    // martelo
    s += `<g transform="translate(520,140) rotate(-30)"><rect x="-6" y="0" width="12" height="90" rx="5" class="tool"/><rect x="-28" y="-14" width="56" height="20" rx="4" class="tool"/></g>`;
    s += arrow(495, 140, 462, 182, "arw red");
    return W("0 0 600 290", s, "Cavilhas e cantoneiras no rodapé interno 04");
  };

  /* Etapa 02 */
  D.p2Ripas = () => modelo({ view: "deitado", step: 2, novo: ["top15", "bars"], marks: [[BAR_X[0] - 110, 1640, "D"], [BAR_X[1] - 110, 1640, "C"], [BAR_X[2] - 110, 1640, "D"]], aria: "Ripas no teto 15" });
  D.p2Tampo = () => modelo({ view: "deitado", step: 2, antes: ["top15", "bars"], novo: ["mid13"], marks: [[BAR_X[0] - 110, 660, "K"], [BAR_X[1] - 110, 660, "C"], [BAR_X[2] - 110, 660, "K"]], aria: "Tampo 13" });
  D.p2Divisoes = () => modelo({ view: "deitado", step: 2, antes: ["top15", "bars", "mid13"], novo: ["divs", "sup06"], marks: [[BAR_X[0] - 110, 460, "K"], [BAR_X[1] - 110, 460, "C"], [BAR_X[2] + 140, 170, "D"], [BAR_X[0] + 140, 170, "C"]], aria: "Divisões e apoios" });

  /* Etapa 03: rodapés vistos de cima */
  D.p3Rodapes = () => {
    let s = "";
    const sx = (x) => 30 + x * 0.27, sy = (y) => 86 + y * 0.48; // y: 0 = frente
    s += `<rect x="${sx(12)}" y="${sy(0) + 186}" width="${1976 * 0.27}" height="14" class="s-new"/>` + tag(sx(1000), sy(0) + 222, "02");
    s += `<rect x="${sx(12)}" y="${sy(0) - 14}" width="${1976 * 0.27}" height="14" class="s-new"/>` + tag(sx(1000), sy(0) - 34, "03");
    BAR_X.forEach((x) => {
      s += `<rect x="${sx(x) - 2}" y="${sy(0)}" width="8" height="186" class="s-done"/>` + tag(sx(x) + 2, sy(190) + 4, "06", "done");
      s += mk(sx(x) + 2, sy(0) + 230, "C", 12) + mk(sx(x) + 2, sy(0) - 58, "C", 12);
    });
    [751, 1249].forEach((x) => {
      s += `<rect x="${sx(x) - 2}" y="${sy(0)}" width="8" height="186" class="s-new"/>` + tag(sx(x) + 2, sy(90), "04");
      s += `<path d="M${sx(x) + 8},${sy(0) + 12} h14" class="corner"/><path d="M${sx(x) + 8},${sy(0) + 174} h14" class="corner"/>`;
    });
    s += T(40, 26, "VISTO DE CIMA", 13, "t2b", "start");
    s += T(sx(1000), 44, "atrás", 14, "t2");
    s += T(sx(1000), 352, "frente", 14, "t2");
    s += mk(560, 26, "A", 13) + T(588, 31, "nas cantoneiras", 12, "t2", "start");
    return W("0 0 640 370", s, "Rodapés vistos de cima");
  };
  D.p3Prateleiras = () => modelo({ view: "deitado", step: 3, antes: ["rod02"], novo: ["shelvesL"], marks: [[480, 940, "C"], [480, 1350, "C"]], aria: "Prateleiras da esquerda" });
  D.p3Lateral = () => modelo({ view: "deitado", step: 3, antes: ["rod02", "shelvesL"], novo: ["lat01"], marks: [[-90, 1700, "O"], [-90, 600, "O"], [-90, 1300, "F"], [-90, 900, "F"], [-90, 100, "F"], [-90, 330, "V"]], aria: "Lateral esquerda" });
  D.p4Prateleiras = () => modelo({ view: "deitado", step: 4, novo: ["shelvesR"], marks: [[1520, 940, "C"], [1520, 1350, "C"]], aria: "Prateleiras da direita" });
  D.p4Lateral = () => modelo({ view: "deitado", step: 4, antes: ["shelvesR"], novo: ["lat16"], marks: [[2090, 1700, "O"], [2090, 600, "O"], [2090, 1300, "F"], [2090, 900, "F"], [2090, 100, "F"], [2090, 330, "V"]], aria: "Lateral direita" });

  D.p5Pes = () => modelo({ view: "deitado", step: 5, novo: ["feet"], marks: [[1000, -150, "U"]], aria: "Pés",
    extra: () => `<text x="1150" y="110" class="snote" text-anchor="middle">+ 4 pés do lado de trás</text>` });
  D.p5Detalhe = () => {
    let s = `<rect x="40" y="40" width="520" height="40" class="s-done"/>` + T(300, 66, "parte de baixo do móvel", 15, "t2");
    s += `<path d="M240,80 h120 l-16,120 h-88 z" class="s-new"/>`;
    s += `<rect x="226" y="80" width="148" height="18" class="plate"/>`;
    [244, 280, 320, 356].forEach((x) => { s += screwDot(x, 89, "A") + arrow(x, 150 + (x % 3) * 0, x, 100, "arw red sm"); });
    s += tag(300, 160, "U") + mk(450, 150, "A", 16) + T(475, 155, "× 4", 16, "t2b", "start");
    s += T(300, 240, "Cada pé: 4 parafusos A (32 no total)", 15, "t2");
    return W("0 0 600 260", s, "Pé com 4 parafusos");
  };

  /* Etapa 06 */
  D.p6EmPe = () => {
    let s = "";
    s += `<rect x="40" y="170" width="200" height="56" class="s-done"/>` + T(140, 250, "deitado", 15, "t2");
    s += `<path d="M260,170 C 300,90 360,90 390,140" class="flip"/>` + arrow(380, 125, 392, 144, "arw");
    s += `<rect x="430" y="40" width="80" height="186" class="s-new"/>` + T(470, 250, "em pé", 15, "t2");
    s += person(560, 226, 1.1) + person(330, 226, 1.1);
    s += T(300, 26, "2 PESSOAS", 18, "t3");
    return W("0 0 620 270", s, "Duas pessoas levantam o móvel");
  };
  D.p6Cabideiro = () => modelo({ view: "empe", step: 6, semPortas: true, novo: ["rods"], marks: [[560, 1520, "L"], [940, 1520, "M"], [1057, 1520, "L"], [1440, 1520, "M"], [750, 1720, "B"]], aria: "Cabideiros" });
  D.p6Base = () => modelo({ view: "empe", step: 6, semPortas: true, antes: ["rods"], novo: ["bases"], marks: [[255, 290, "E"], [1745, 290, "E"]], aria: "Bases 05" });

  /* Etapa 07 */
  D.p7Fundos = () => modelo({ view: "costas", step: 7, novo: ["back23"], marks: [[1000, 1820, "E"], [500, 120, "G"]], aria: "Fundos" });
  D.p7Emenda = () => {
    let s = `<rect x="40" y="40" width="250" height="220" class="s-new"/><rect x="294" y="40" width="250" height="220" class="s-new"/>`;
    s += tag(165, 150, "23") + tag(420, 150, "23");
    [80, 150, 220].forEach((y) => {
      s += `<path d="M270,${y - 14} h46 v28 h-46 z" fill="${COLORS.G}" stroke="#0b3b47" stroke-width="2"/>`;
      s += `<circle cx="293" cy="${y}" r="5" fill="${COLORS.E}" stroke="#fff" stroke-width="2"/>`;
    });
    s += mk(560, 60, "G", 16) + mk(560, 100, "E", 16);
    s += T(292, 290, "Prendedor G sobre a emenda + 1 prego E", 15, "t2");
    return W("0 0 600 305", s, "Emenda entre chapas");
  };
  D.p7Vista = () => modelo({ view: "empe", step: 7, novo: ["top08"], marks: [[150, 1880, "N"], [600, 1880, "N"], [1000, 1880, "N"], [1400, 1880, "N"], [1850, 1880, "N"]], aria: "Vista superior 08",
    extra: (v) => { const p = v.t(1000, 1660); return `<text x="${p[0]}" y="${p[1]}" class="snote" text-anchor="middle">peça 08 em pé, na borda de trás do teto</text>`; } });

  /* Etapa 08 — gaveta vista de cima */
  const box = (opts) => {
    let s = "";
    const x0 = 160, x1 = 440, yF = 230, yB = 60;
    s += `<rect x="${x0 - 14}" y="${yF}" width="${x1 - x0 + 28}" height="26" class="s-${opts.f}"/>` + tag(300, yF + 13, "19", opts.f);
    if (opts.l) {
      s += `<rect x="${x0}" y="${yB}" width="16" height="${yF - yB}" class="s-${opts.l}"/><rect x="${x1 - 16}" y="${yB}" width="16" height="${yF - yB}" class="s-${opts.l}"/>`;
      s += tag(x0 - 40, 145, "20", opts.l) + tag(x1 + 40, 145, "20", opts.l);
    }
    if (opts.c) s += `<rect x="${x0 + 16}" y="${yB + 20}" width="${x1 - x0 - 32}" height="16" class="s-${opts.c}"/>` + tag(300, yB + 6, "21", opts.c);
    if (opts.n) s += `<path d="M${x0 + 18},${yF - 22} v20 h20" class="corner"/><path d="M${x1 - 18},${yF - 22} v20 h-20" class="corner"/>`;
    s += T(300, 300, "frente", 14, "t2") + T(40, 28, "GAVETA VISTA DE CIMA", 13, "t2b", "start");
    return s;
  };
  D.p8Cola = () => {
    let s = box({ f: "new" });
    [175, 425].forEach((x) => { s += `<rect x="${x - 4}" y="196" width="8" height="34" rx="3" fill="${COLORS.D}"/><circle cx="${x}" cy="194" r="7" fill="${COLORS.J}" opacity=".7"/>`; });
    s += mk(520, 90, "J", 16) + mk(520, 130, "D", 16) + T(520, 170, "2 de cada lado", 13, "t2");
    return W("0 0 600 320", s, "Cola e cavilhas na frente 19");
  };
  D.p8Cantos = () => W("0 0 600 320", box({ f: "done", l: "new", n: true }) + mk(300, 180, "N", 16) + mk(340, 180, "A", 16) + T(300, 214, "2 cantoneiras por gaveta", 13, "t2"), "Laterais e cantoneiras");
  D.p8Fecha = () => W("0 0 600 320", box({ f: "done", l: "done", c: "new", n: true }) + arrow(100, 88, 156, 88, "arw red") + arrow(500, 88, 444, 88, "arw red") + mk(80, 88, "B", 16) + mk(520, 88, "B", 16), "Contra fundo 21");

  /* Etapa 09 */
  D.p9Fundo = () => {
    let s = `<rect x="120" y="60" width="360" height="200" class="s-done"/><rect x="132" y="72" width="336" height="176" class="s-new thin"/>` + tag(300, 160, "22");
    for (let i = 0; i < 7; i++) { const t = i / 6; s += `<circle cx="${140 + t * 320}" cy="${i % 2 ? 252 : 68}" r="5" fill="${COLORS.E}"/>`; }
    s += mk(530, 100, "E", 16) + T(530, 140, "7 por gaveta", 13, "t2");
    s += T(300, 34, "gaveta de BOCA PARA BAIXO", 14, "t2b");
    return W("0 0 600 290", s, "Fundo da gaveta");
  };
  D.p9Trilho = () => {
    let s = `<rect x="80" y="90" width="420" height="110" class="s-done"/>` + tag(290, 170, "20", "done");
    s += `<rect x="520" y="70" width="26" height="150" class="s-done"/>` + T(533, 248, "frente 19", 13, "t2");
    s += rail(96, 130, 400);
    [140, 420].forEach((x) => { s += screwDot(x, 130, "A"); });
    s += mk(300, 60, "I", 16) + mk(340, 60, "A", 16) + T(300, 280, "Trilho em cada lado da gaveta · 2 parafusos A por trilho", 14, "t2");
    return W("0 0 600 295", s, "Trilho na lateral da gaveta");
  };
  D.p9Puxador = () => {
    let s = `<rect x="80" y="70" width="440" height="150" class="s-done"/>` + tag(300, 190, "19", "done");
    s += `<rect x="170" y="130" width="260" height="16" rx="8" class="s-new"/>` + mk(300, 110, "H", 15);
    s += `<circle cx="200" cy="138" r="5" fill="${COLORS.B}"/><circle cx="400" cy="138" r="5" fill="${COLORS.B}"/>`;
    s += mk(470, 260, "B", 15) + T(300, 266, "2 parafusos B, de dentro para fora", 14, "t2");
    return W("0 0 600 290", s, "Puxador da gaveta");
  };

  /* Etapa 10 */
  D.p10Gavetas = () => modelo({ view: "empe", step: 10, semPortas: true, novo: ["drawers"], aria: "Gavetas no lugar",
    extra: (v) => { let s = ""; [[750, 279], [750, 459], [1250, 279], [1250, 459]].forEach(([x, y]) => { const p = v.t(x, y); s += `<path d="M${p[0]},${p[1] + 120} l0,-60" class="push"/>`; }); return s; } });
  D.p10Encaixe = () => {
    let s = `<rect x="40" y="150" width="520" height="16" rx="4" class="rail"/><circle cx="548" cy="158" r="10" class="wheel"/>`;
    s += T(300, 196, "trilho do móvel", 14, "t2");
    s += `<g transform="rotate(-6 300 120)"><rect x="60" y="110" width="420" height="16" rx="4" class="rail drawer"/><circle cx="72" cy="118" r="10" class="wheel"/></g>`;
    s += T(270, 88, "trilho da gaveta", 14, "t2");
    s += arrow(420, 60, 510, 60, "arw red") + T(465, 44, "empurre", 14, "t3");
    s += T(300, 250, "Apoie a rodinha da gaveta sobre o trilho do móvel e empurre", 14, "t2");
    return W("0 0 600 270", s, "Encaixe da gaveta no trilho");
  };

  /* Etapa 11 */
  D.p11Portas = () => {
    let s = "";
    const door = (x, h, c) => {
      let r = `<rect x="${x}" y="${270 - h}" width="90" height="${h}" class="s-new door"/>` + tag(x + 45, 270 - h / 2, c);
      [0.08, 0.5, 0.92].forEach((t) => {
        const y = 270 - h + t * h;
        r += `<circle cx="${x + 16}" cy="${y}" r="9" fill="#fff" stroke="#1f2937" stroke-width="2"/><rect x="${x + 22}" y="${y - 4}" width="22" height="8" fill="#1f2937"/>`;
      });
      return r;
    };
    s += door(120, 240, "17") + door(330, 182, "18");
    s += T(165, 290, "porta grande", 13, "t2") + T(375, 290, "porta pequena", 13, "t2");
    s += mk(520, 80, "P", 16) + mk(520, 120, "X", 16) + T(520, 160, "3 por porta", 13, "t2");
    s += T(300, 18, "LADO DE DENTRO PARA CIMA", 13, "t2b");
    return W("0 0 600 300", s, "Dobradiças nas portas");
  };
  D.p11Detalhe = () => {
    let s = `<rect x="40" y="60" width="300" height="200" class="s-done door"/>` + T(190, 285, "porta (lado de dentro)", 14, "t2");
    s += `<circle cx="120" cy="160" r="34" fill="#fff" stroke="#1f2937" stroke-width="3" stroke-dasharray="5 4"/>`;
    s += `<rect x="102" y="96" width="90" height="128" rx="10" class="xshim"/>` + mk(214, 100, "X", 14);
    s += `<circle cx="120" cy="160" r="28" class="hingecup"/><rect x="140" y="146" width="190" height="28" rx="6" class="hingearm"/>`;
    s += screwDot(160, 116, "A") + screwDot(160, 204, "A");
    s += arrow(230, 116, 172, 116, "arw red sm") + arrow(230, 204, 172, 204, "arw red sm") + mk(252, 204, "A", 14);
    s += mk(380, 160, "P", 16) + T(470, 120, "caneco no furo redondo", 14, "t2") + T(470, 210, "2 parafusos A", 14, "t2");
    return W("0 0 600 300", s, "Dobradiça na porta");
  };

  /* Etapa 12 */
  D.p12Portas = () => modelo({ view: "empe", step: 12, novo: ["doors", "dhandles"], marks: [[250, 1450, "H"], [1750, 1450, "H"]], aria: "Portas instaladas" });
  D.p12Encaixe = () => {
    let s = `<rect x="40" y="40" width="40" height="230" class="s-done"/>` + T(60, 290, "móvel", 13, "t2");
    s += `<rect x="80" y="120" width="120" height="60" rx="6" class="plateq"/>` + screwDot(105, 150, "A") + screwDot(175, 150, "A") + mk(140, 100, "Q", 15);
    s += `<rect x="230" y="134" width="230" height="32" rx="6" class="hingearm"/><circle cx="480" cy="150" r="30" class="hingecup"/>`;
    s += `<rect x="490" y="40" width="40" height="230" class="s-new door"/>` + T(510, 290, "porta", 13, "t2");
    s += arrow(300, 210, 206, 210, "arw red") + T(300, 240, "deslize a dobradiça P no calço Q e aperte", 14, "t2");
    s += mk(350, 110, "P", 15);
    return W("0 0 600 300", s, "Encaixe da dobradiça");
  };
  D.p12Regula = () => {
    let s = "";
    const card = (x, title, a) => {
      let r = `<rect x="${x}" y="30" width="170" height="220" rx="14" class="card"/>`;
      r += `<rect x="${x + 50}" y="70" width="70" height="140" class="s-new door"/>` + a + T(x + 85, 240, title, 15, "t3");
      return r;
    };
    s += card(15, "para os lados", arrow(x(15) + 40, 140, x(15) + 0 + 10, 140, "arw red") + arrow(x(15) + 130, 140, x(15) + 160, 140, "arw red"));
    s += card(215, "sobe e desce", arrow(300, 66, 300, 40, "arw red") + arrow(300, 214, 300, 236 - 10, "arw red"));
    s += card(415, "frente e trás", arrow(500, 140, 540, 110, "arw red") + arrow(500, 140, 460, 170, "arw red"));
    return W("0 0 600 270", s, "Regulagens da dobradiça");
    function x(v) { return v; }
  };

  /* ---------- Ícones das ferragens ---------- */
  const screw = (len, head) => {
    const L = 14 + len * 2.1, y = 24;
    let s = "";
    if (head === "flat") s += `<path d="M10,${y - 12} L10,${y + 12} L22,${y + 4} L22,${y - 4} Z" class="metal"/>`;
    else if (head === "wide") s += `<rect x="8" y="${y - 15}" width="7" height="30" rx="3" class="metal"/><rect x="15" y="${y - 5}" width="7" height="10" class="metal"/>`;
    s += `<rect x="22" y="${y - 4}" width="${L - 10}" height="8" class="metal"/><path d="M${12 + L},${y - 4} L${22 + L},${y} L${12 + L},${y + 4} Z" class="metal"/>`;
    for (let i = 26; i < 10 + L; i += 5) s += `<line x1="${i}" y1="${y - 5}" x2="${i + 3}" y2="${y + 5}" class="thread"/>`;
    return s;
  };
  const ICONS = {
    screwA: () => screw(12, "flat"), screwB: () => screw(25, "flat"), screwC: () => screw(40, "flat"), screwF: () => screw(40, "wide"),
    dowelD: () => `<rect x="20" y="17" width="63" height="14" rx="6" class="wood"/>` + [30, 42, 54, 66].map((x) => `<line x1="${x}" y1="18" x2="${x + 6}" y2="30" class="grain"/>`).join(""),
    dowelK: () => `<rect x="10" y="17" width="105" height="14" rx="6" class="wood"/>` + [22, 36, 50, 64, 78, 92].map((x) => `<line x1="${x}" y1="18" x2="${x + 6}" y2="30" class="grain"/>`).join(""),
    nailE: () => `<rect x="40" y="16" width="4" height="16" class="metal"/><rect x="44" y="22" width="22" height="4" class="metal"/><path d="M66,22 L74,24 L66,26 Z" class="metal"/>`,
    clipG: () => `<path d="M30,34 L46,14 L76,14 L92,34 L80,34 L70,22 L52,22 L42,34 Z" class="metal"/><circle cx="61" cy="18" r="3" fill="#fff"/>`,
    handleH: () => `<rect x="10" y="18" width="100" height="12" rx="3" class="metal dark"/>`,
    slideI: () => `<rect x="8" y="18" width="104" height="10" rx="2" class="metal"/><circle cx="104" cy="23" r="6" fill="#fff" stroke="#475569" stroke-width="2"/>` + [24, 50, 76].map((x) => `<circle cx="${x}" cy="23" r="2" fill="#fff"/>`).join(""),
    glueJ: () => `<rect x="28" y="10" width="64" height="28" rx="8" fill="#fef3c7" stroke="#ca8a04" stroke-width="2"/><text x="60" y="29" text-anchor="middle" font-size="12" font-weight="700" fill="#854d0e">cola</text>`,
    suppL: () => `<rect x="36" y="10" width="48" height="10" class="metal"/><path d="M48,20 v16 a12,12 0 0 0 24,0 v-16" fill="none" stroke="#475569" stroke-width="7"/>`,
    suppM: () => `<rect x="36" y="10" width="48" height="10" class="metal"/><path d="M48,20 v16 a12,12 0 0 0 24,0" fill="none" stroke="#475569" stroke-width="7"/>`,
    cornerN: () => `<path d="M40,10 h14 v24 h26 v12 h-40 z" class="metal"/><circle cx="47" cy="20" r="3" fill="#fff"/><circle cx="70" cy="40" r="3" fill="#fff"/>`,
    nutO: () => `<rect x="42" y="10" width="36" height="28" rx="6" class="metal blue"/><ellipse cx="60" cy="24" rx="5" ry="5" fill="#fff"/><line x1="42" y1="24" x2="78" y2="24" stroke="#fff" stroke-width="2"/>`,
    hingeP: () => `<circle cx="34" cy="24" r="13" class="metal dark"/><rect x="44" y="18" width="56" height="12" rx="3" class="metal"/>`,
    plateQ: () => `<rect x="34" y="14" width="52" height="20" rx="4" class="metal blue"/><circle cx="44" cy="24" r="3" fill="#fff"/><circle cx="76" cy="24" r="3" fill="#fff"/>`,
    chalkR: () => `<rect x="24" y="18" width="72" height="12" rx="6" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>`,
    labelS: () => `<rect x="24" y="10" width="72" height="28" rx="3" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/><line x1="34" y1="20" x2="86" y2="20" stroke="#94a3b8" stroke-width="2"/><line x1="34" y1="28" x2="70" y2="28" stroke="#94a3b8" stroke-width="2"/>`,
    tubeT: () => `<rect x="8" y="17" width="104" height="14" rx="7" class="metal"/>`,
    footU: () => `<path d="M38,10 h44 l-8,30 h-28 z" fill="#475569"/><rect x="34" y="8" width="52" height="6" class="metal"/>`,
    pinV: () => `<rect x="44" y="18" width="14" height="12" rx="2" class="metal"/><rect x="58" y="15" width="18" height="18" rx="4" class="metal"/>`,
    shimX: () => `<rect x="30" y="12" width="60" height="24" rx="5" fill="#ede9fe" stroke="#6d28d9" stroke-width="2"/><circle cx="60" cy="24" r="8" fill="#fff" stroke="#6d28d9" stroke-width="2"/>`,
  };
  function icone(name) { return `<svg viewBox="0 0 120 48" class="hwicon" aria-hidden="true">${(ICONS[name] || (() => ""))()}</svg>`; }

  /* Miniatura proporcional da peça de madeira */
  function miniPeca(dim) {
    const [a, b, e] = dim;
    const s = 92 / Math.max(a, b);
    const w = Math.max(6, a * s), h = Math.max(6, b * s);
    const fina = e <= 3;
    return `<svg viewBox="0 0 100 100" class="mini" aria-hidden="true"><rect x="${50 - w / 2}" y="${50 - h / 2}" width="${w}" height="${h}" class="${fina ? "fina" : "grossa"}"/></svg>`;
  }

  /* Móvel completo para a tela inicial */
  function capa(fechado) {
    return modelo({ view: "empe", step: 99, tudo: true, aria: "Guarda-roupa de 8 portas montado", semPortas: !fechado });
  }

  window.ILUSTRA = { quadro: (n) => (D[n] ? D[n]() : ""), icone, miniPeca, capa, modelo };
})();
