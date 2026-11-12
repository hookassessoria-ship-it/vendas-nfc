/* Meu Montador — app de montagem guiada (sem dependências). */
(function () {
  "use strict";
  const ET = window.ETAPAS, PE = window.PECAS, FE = window.FERRAGENS, IL = window.ILUSTRA;
  const TOTAL = ET.length;
  const KEY = "meu-montador:roupeiro-8p-lite:v1";
  const $app = document.getElementById("app");

  /* ---------- Estado salvo ---------- */
  const novoEstado = () => ({ feitas: {}, passos: {}, conf: {}, inv: {}, simples: false, ultima: 0, quadro: {}, cartao: {}, preparo: false });
  let S = novoEstado();
  try { const raw = localStorage.getItem(KEY); if (raw) S = Object.assign(novoEstado(), JSON.parse(raw)); } catch (e) { /* sem armazenamento: segue sem salvar */ }
  let salvo = true;
  function salvar() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); salvo = true; } catch (e) { salvo = false; }
  }

  const feitasN = () => ET.filter((e) => S.feitas[e.n]).length;
  const pct = () => Math.round((feitasN() / TOTAL) * 100);
  const proxima = () => (ET.find((e) => !S.feitas[e.n]) || ET[TOTAL - 1]).n;
  const peca = (c) => PE.find((p) => p.code === c);
  const ferr = (c) => FE.find((f) => f.code === c);
  const esc = (s) => String(s).replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const dimTxt = (d) => `${d[0]} × ${d[1]} mm · ${d[2]} mm de espessura`;
  const nomeFerr = { phillips: "Chave Phillips", toco: "Chave pequena", martelo: "Martelo" };

  /* Uso das ferragens por etapa (para conferir a soma com a lista do manual) */
  const usoFerr = {};
  ET.forEach((e) => e.ferragens.forEach(([c, q]) => { (usoFerr[c] = usoFerr[c] || []).push([e.n, q]); }));
  const usoPeca = {};
  ET.forEach((e) => e.pecas.forEach(([c, q]) => { (usoPeca[c] = usoPeca[c] || []).push([e.n, q]); }));

  /* ---------- Componentes ---------- */
  const barra = (p, label) => `<div class="prog" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}" aria-label="${label || "Progresso"}"><span style="width:${p}%"></span></div>`;
  const chipPeca = (c, q) => {
    const p = peca(c);
    const aviso = p.qtdDesenho && c === "07" ? `<span class="warnDot" title="Quantidade com divergência no manual">!</span>` : "";
    return `<button class="chip peca" data-act="peca" data-code="${c}" aria-label="Peça ${c}, ${esc(p.nome)}, quantidade ${q}">${IL.miniPeca(p.dim)}<span class="code">${c}</span><span class="cn">${esc(p.simples)}</span><span class="qty">×${q}</span>${aviso}</button>`;
  };
  const chipFerr = (c, q) => {
    const f = ferr(c);
    return `<button class="chip ferr" data-act="ferr" data-code="${c}" style="--hw:${window.HW_COLOR[c] || "#333"}" aria-label="Ferragem ${c}, ${esc(f.nome)}, quantidade ${q}">${IL.icone(f.icone)}<span class="code hw">${c}</span><span class="cn">${esc(f.nome)}</span><span class="qty">×${q}</span></button>`;
  };
  const topo = (titulo, voltar) => `<header class="top"><button class="ghost back" data-go="${voltar || "inicio"}" aria-label="Voltar">‹</button><h1>${titulo}</h1><button class="ghost" data-act="menu" aria-label="Menu">☰</button></header>`;

  /* ---------- Telas ---------- */
  function telaInicio() {
    const n = feitasN();
    const comecou = n > 0 || S.preparo;
    const prox = proxima();
    const fim = n === TOTAL;
    const totalPecas = PE.reduce((a, p) => a + p.qtd, 0);
    return `
    <main class="home">
      <div class="brand"><span class="logo" aria-hidden="true">${logo()}</span><div><h1>Meu Montador</h1><p class="sub">${esc(window.MANUAL.produto)}</p></div></div>
      ${window.V3D && window.V3D.ok ? window.V3D.html({ casa: true }) : `<figure class="hero">${IL.capa(true)}</figure>`}
      <div class="stats">
        <div><b>${TOTAL}</b><span>etapas</span></div>
        <div><b>${PE.length}</b><span>tipos de peça</span></div>
        <div><b>${FE.length}</b><span>tipos de ferragem</span></div>
      </div>
      <section class="progresso">
        <div class="row"><span>${fim ? "Montagem concluída" : comecou ? `Etapa ${prox} de ${TOTAL}` : "Ainda não começou"}</span><b>${pct()}%</b></div>
        ${barra(pct(), "Progresso geral da montagem")}
      </section>
      <button class="cta" data-go="${fim ? "fim" : comecou ? "etapa-" + prox : "preparo"}">${fim ? "VER RESULTADO" : comecou ? "CONTINUAR MONTAGEM" : "COMEÇAR MONTAGEM"}</button>
      <nav class="grid-links" aria-label="Consultas">
        <button data-go="pecas"><span class="gi">${IL.miniPeca([1740, 385, 12])}</span>Peças<small>${totalPecas} peças de madeira</small></button>
        <button data-go="ferragens"><span class="gi">${IL.icone("screwC")}</span>Ferragens<small>parafusos e acessórios</small></button>
        <button data-go="etapas"><span class="gi num">1–12</span>Todas as etapas<small>veja qualquer etapa</small></button>
        <button data-go="usadas"><span class="gi num">✓</span>Peças usadas<small>o que já foi montado</small></button>
        <button data-go="seguranca"><span class="gi num">!</span>Segurança<small>e ferramentas</small></button>
        <button data-go="confirmar"><span class="gi num">?</span>Pontos a confirmar<small>${window.CONFIRMAR.length} itens do manual</small></button>
      </nav>
      ${salvo ? "" : `<p class="aviso">Este navegador não deixou salvar o progresso. Se fechar a página, ele será perdido.</p>`}
      <p class="foot">Baseado no manual do fabricante (${esc(window.MANUAL.fabricante)}, rev. ${esc(window.MANUAL.revisao)}). Ilustrações esquemáticas: em caso de dúvida, compare com a foto do manual em cada etapa.</p>
    </main>`;
  }

  function logo() {
    return `<svg viewBox="0 0 40 40"><rect x="4" y="6" width="32" height="28" rx="3" fill="var(--ink)"/><rect x="8" y="10" width="11" height="20" fill="var(--amber)"/><rect x="21" y="10" width="11" height="20" fill="#fff"/><circle cx="17" cy="21" r="1.6" fill="var(--ink)"/><circle cx="23" cy="21" r="1.6" fill="var(--ink)"/></svg>`;
  }

  function telaPreparo() {
    const conferidas = [...PE, ...FE].filter((x) => S.inv[x.code]).length;
    const total = PE.length + FE.length;
    return `${topo("Antes de começar")}
    <main class="page">
      <section class="card big">
        <h2>Desembalando</h2>
        <ol class="simple">
          <li>Identifique todas as peças e deixe-as <b>em pé</b>. Nunca uma sobre a outra.</li>
          <li>Use a própria embalagem (papelão) como tapete para montar.</li>
          <li>A montagem é para <b>2 pessoas</b>.</li>
        </ol>
        <p class="src">Orientação do manual (seção "Desembalando").</p>
      </section>
      <section class="card">
        <h2>Ferramentas</h2>
        <ul class="tools">${window.FERRAMENTAS.map((t) => `<li>${toolIcon(t.id)}<div><b>${t.nome}</b><small>${t.nota}</small></div></li>`).join("")}</ul>
      </section>
      <section class="card">
        <h2>Confira as peças</h2>
        <p>Marque cada tipo de peça e de ferragem que encontrar na caixa.</p>
        <div class="row"><span>${conferidas} de ${total} conferidos</span></div>
        ${barra(Math.round((conferidas / total) * 100), "Peças conferidas")}
        <div class="btnrow"><button class="sec" data-go="pecas">Conferir peças</button><button class="sec" data-go="ferragens">Conferir ferragens</button></div>
      </section>
      <section class="card warn"><h2>Atenção</h2><p>Duas quantidades do manual não batem (peça 07 e corrediça I). Veja antes de começar.</p><button class="sec" data-go="confirmar">Ver pontos a confirmar</button></section>
      <button class="cta" data-act="iniciar">IR PARA A ETAPA 1</button>
    </main>`;
  }

  function toolIcon(id) {
    const s = {
      phillips: `<svg viewBox="0 0 48 48"><rect x="6" y="20" width="18" height="10" rx="4" fill="var(--amber)"/><rect x="24" y="23" width="18" height="4" fill="#64748b"/><path d="M42 21 l4 4 l-4 4z" fill="#64748b"/><text x="15" y="16" font-size="12" text-anchor="middle" font-weight="800" fill="var(--ink)">+</text></svg>`,
      toco: `<svg viewBox="0 0 48 48"><rect x="10" y="18" width="14" height="14" rx="4" fill="var(--amber)"/><rect x="24" y="23" width="10" height="4" fill="#64748b"/></svg>`,
      martelo: `<svg viewBox="0 0 48 48"><rect x="22" y="14" width="5" height="30" rx="2" fill="#a16207"/><rect x="12" y="8" width="26" height="9" rx="2" fill="#475569"/></svg>`,
    }[id];
    return `<span class="ti">${s}</span>`;
  }

  function telaPecas() {
    return `${topo("Peças de madeira")}
    <main class="page">
      <p class="lead">Toque em "Achei" quando encontrar cada peça. Medidas do manual, em milímetros.</p>
      <div class="list">${PE.map((p) => cardPeca(p)).join("")}</div>
      <button class="sec wide" data-go="ferragens">Ver ferragens ›</button>
    </main>`;
  }
  function cardPeca(p) {
    const ok = S.inv[p.code];
    const q = p.qtdDesenho ? `${p.qtd} <small>(desenho: ${p.qtdDesenho})</small>` : p.qtd;
    return `<article class="item ${ok ? "ok" : ""}" id="peca-${p.code}">
      <div class="thumb">${IL.miniPeca(p.dim)}</div>
      <div class="body">
        <div class="head"><span class="code big">${p.code}</span><h3>${esc(p.nome)}</h3><span class="qtd">× ${q}</span></div>
        <p class="dims">${dimTxt(p.dim)}${p.dim[2] <= 3 ? ` <span class="pill thin">chapa fina</span>` : p.dim[2] >= 15 ? ` <span class="pill">mais grossa</span>` : ""}</p>
        <p><b>Como reconhecer:</b> ${esc(p.reconhecer)}</p>
        <p><b>Posição:</b> ${esc(p.orientar)}</p>
        ${p.parecidas.length ? `<p class="similar">Parecida com: ${p.parecidas.map((c) => `<button class="link" data-act="peca" data-code="${c}">${c} ${esc(peca(c).nome)}</button>`).join(", ")}. Confira o número na etiqueta da peça.</p>` : ""}
        ${p.duvida ? `<p class="doubt">${esc(p.duvida)}</p>` : ""}
        ${usoPeca[p.code] ? `<p class="uso">Usada nas etapas ${usoPeca[p.code].map(([n]) => `<button class="link" data-go="etapa-${n}">${pad(n)}</button>`).join(", ")}</p>` : ""}
      </div>
      <button class="check ${ok ? "on" : ""}" data-act="inv" data-code="${p.code}" aria-pressed="${!!ok}">${ok ? "✓ Achei" : "Achei"}</button>
    </article>`;
  }

  function telaFerragens() {
    return `${topo("Ferragens")}
    <main class="page">
      <p class="lead">A soma de cada ferragem nas etapas foi conferida com a lista do manual.</p>
      <div class="list">${FE.map((f) => cardFerr(f)).join("")}</div>
      <button class="sec wide" data-go="pecas">‹ Ver peças de madeira</button>
    </main>`;
  }
  function cardFerr(f) {
    const ok = S.inv[f.code];
    const uso = usoFerr[f.code] || [];
    const soma = uso.reduce((a, [, q]) => a + q, 0);
    const bate = soma === f.qtd;
    const status = !uso.length ? `<span class="pill">não usada nas etapas</span>` : bate ? `<span class="pill okp">soma confere: ${soma}</span>` : `<span class="pill bad">etapas somam ${soma}, lista diz ${f.qtd}</span>`;
    return `<article class="item ${ok ? "ok" : ""}" id="ferr-${f.code}" style="--hw:${window.HW_COLOR[f.code] || "#333"}">
      <div class="thumb hw">${IL.icone(f.icone)}</div>
      <div class="body">
        <div class="head"><span class="code big hw">${f.code}</span><h3>${esc(f.nome)}</h3><span class="qtd">× ${f.qtd}</span></div>
        <p>${esc(f.reconhecer)}</p>
        ${f.alerta ? `<p class="doubt">${esc(f.alerta)}</p>` : ""}
        <p class="uso">${uso.length ? "Etapas: " + uso.map(([n, q]) => `<button class="link" data-go="etapa-${n}">${pad(n)}</button> (${q})`).join(" · ") : ""} ${status}</p>
      </div>
      <button class="check ${ok ? "on" : ""}" data-act="inv" data-code="${f.code}" aria-pressed="${!!ok}">${ok ? "✓ Achei" : "Achei"}</button>
    </article>`;
  }

  function telaEtapas() {
    return `${topo("Todas as etapas")}
    <main class="page">
      <ol class="steps">${ET.map((e) => `<li><button data-go="etapa-${e.n}" class="${S.feitas[e.n] ? "done" : ""}">
        <span class="sn">${pad(e.n)}</span><span class="st"><b>${esc(e.titulo)}</b><small>${esc(e.meta)}</small></span>
        <span class="ss">${S.feitas[e.n] ? "✓" : e.pessoas > 1 ? "2 pessoas" : ""}</span></button></li>`).join("")}</ol>
    </main>`;
  }

  function telaUsadas() {
    const usada = (c) => (usoPeca[c] || []).filter(([n]) => S.feitas[n]).map(([n]) => n);
    const usadaF = (c) => (usoFerr[c] || []).filter(([n]) => S.feitas[n]).reduce((a, [, q]) => a + q, 0);
    return `${topo("Peças usadas")}
    <main class="page">
      <p class="lead">Atualiza sozinho quando você conclui uma etapa. ${feitasN()} de ${TOTAL} etapas concluídas.</p>
      <h2 class="h2">Madeira</h2>
      <ul class="usedlist">${PE.map((p) => { const u = usada(p.code); const tudo = (usoPeca[p.code] || []).every(([n]) => S.feitas[n]); return `<li class="${tudo ? "on" : u.length ? "half" : ""}"><span class="code">${p.code}</span><span>${esc(p.nome)}</span><small>${tudo ? "montada" : u.length ? "em uso" : "na caixa"}</small></li>`; }).join("")}</ul>
      <h2 class="h2">Ferragens</h2>
      <ul class="usedlist">${FE.map((f) => { const u = usadaF(f.code); const tot = (usoFerr[f.code] || []).reduce((a, [, q]) => a + q, 0); return `<li class="${tot && u >= tot ? "on" : u ? "half" : ""}" style="--hw:${window.HW_COLOR[f.code]}"><span class="code hw">${f.code}</span><span>${esc(f.nome)}</span><small>${tot ? `${u} de ${tot}` : "sem uso nas etapas"}</small></li>`; }).join("")}</ul>
    </main>`;
  }

  function telaConfirmar() {
    const label = { atencao: "Atenção", info: "Para conferir", seguranca: "Segurança" };
    return `${topo("Pontos a confirmar")}
    <main class="page">
      <p class="lead">Informações que o manual não deixa claras, ou que não batem entre si. O app não inventou nada para preencher esses pontos.</p>
      <div class="list">${window.CONFIRMAR.map((c) => `<article class="note ${c.nivel}"><span class="pill">${label[c.nivel]}</span><h3>${esc(c.titulo)}</h3><p>${esc(c.texto)}</p></article>`).join("")}</div>
    </main>`;
  }

  function telaSeguranca() {
    return `${topo("Segurança")}
    <main class="page">
      <section class="card warn"><h2>Durante a montagem</h2><ul class="simple">
        <li>Monte com <b>2 pessoas</b>, como pede o manual.</li>
        <li>Crianças só ajudam com a supervisão de um adulto. Martelo, parafusos e pregos não são brinquedo.</li>
        <li>Peças pequenas (pregos, parafusos, cavilhas) ficam longe de crianças pequenas.</li>
        <li>Para levantar o móvel (etapa 06) e segurar as portas (etapa 12), são sempre 2 pessoas.</li>
      </ul></section>
      <section class="card warn"><h2>Depois de montado</h2><ul class="simple">
        <li><b>Nunca suba</b> no móvel, nem nas gavetas ou prateleiras.</li>
        <li><b>Fixe o móvel na parede.</b> Móveis altos podem tombar. As páginas do manual fotografadas não mostram como fazer isso: fale com o fabricante ou com um montador sobre a fixação certa para a sua parede.</li>
        <li>Não pendure peso nas portas abertas.</li>
      </ul>
      <p class="src">Fabricante: ${esc(window.MANUAL.fabricante)} · ${esc(window.MANUAL.contato.fone)} · ${esc(window.MANUAL.contato.site)}</p></section>
      <section class="card"><h2>Limpeza (do manual)</h2><ul class="simple">
        <li>Não use produtos abrasivos como álcool, solventes ou acetona.</li>
        <li>Use somente um pano macio e seco.</li>
        <li>O giz de correção (R) serve para disfarçar pequenos riscos.</li>
      </ul></section>
      <section class="card"><h2>Ferramentas</h2>
        <ul class="tools">${window.FERRAMENTAS.map((t) => `<li>${toolIcon(t.id)}<div><b>${t.nome}</b><small>${t.nota}</small></div></li>`).join("")}</ul></section>
    </main>`;
  }

  function telaEtapa(n) {
    const e = ET.find((x) => x.n === n);
    if (!e) return telaInicio();
    S.ultima = n; salvar();
    const qv = S.quadro[n];
    const modo = qv === -1 ? "foto" : (qv === undefined || qv === "3d") && window.V3D && window.V3D.ok ? "3d" : "desenho";
    const qi = modo === "desenho" ? Math.min(Number(qv) || 0, e.quadros.length - 1) : -2;
    const passosOk = e.passos.filter((_, i) => S.passos[`${n}-${i}`]).length;
    const confOk = e.conferir.filter((_, i) => S.conf[`${n}-${i}`]).length;
    const simples = S.simples;
    const feito = !!S.feitas[n];
    const cart = Math.min(S.cartao[n] || 0, e.passos.length);

    const pessoas = e.pessoas > 1 ? `<span class="badge two"><i class="ppl"></i><i class="ppl"></i>2 pessoas</span>` : `<span class="badge"><i class="ppl"></i>1 pessoa</span>`;
    const ferramentas = e.ferramentas.length ? e.ferramentas.map((t) => `<span class="badge">${nomeFerr[t]}</span>`).join("") : `<span class="badge">sem ferramenta</span>`;
    const pos = { deitado: "Móvel deitado", empe: "Móvel em pé", costas: "Atrás do móvel", gaveta: "Na mesa ou no chão", portas: "Portas deitadas", solto: "Peças soltas" }[e.posicao];

    const quadros = `<div class="frames" id="frames">
      <div class="frame-tabs" role="tablist">${window.V3D && window.V3D.ok ? `<button role="tab" aria-selected="${modo === "3d"}" class="t3d ${modo === "3d" ? "on" : ""}" data-act="quadro" data-i="3d">3D</button>` : ""}${e.quadros.map((_, i) => `<button role="tab" aria-selected="${i === qi}" class="${i === qi ? "on" : ""}" data-act="quadro" data-i="${i}">${String.fromCharCode(65 + i)}</button>`).join("")}<button role="tab" aria-selected="${qi === -1}" class="foto ${S.quadro[n] === -1 ? "on" : ""}" data-act="quadro" data-i="-1">Manual</button>${modo === "3d" ? "" : `<button class="zoombtn" data-act="zoom" aria-label="Ampliar ilustração">⤢ Ampliar</button>`}</div>
      ${modo === "3d" ? `<div class="frame f3d">${window.V3D.html({})}<p class="cap3d">${esc(e.meta)} <span class="muted">Peças novas em amarelo, com o número do manual.</span></p></div>` : S.quadro[n] === -1
        ? `<figure class="frame photo"><img src="${e.foto}" alt="Página do manual, etapa ${pad(n)}" loading="lazy"><figcaption>Desenho original do manual · etapa ${pad(n)}</figcaption></figure>`
        : `<figure class="frame">${IL.quadro(e.quadros[qi])}<figcaption><b>${String.fromCharCode(65 + qi)}.</b> ${esc(e.legendas[qi])}</figcaption></figure>`}
      <div class="legend"><span><i class="sw new"></i>nesta etapa</span><span><i class="sw done"></i>já montado</span><span>Esquema simplificado</span></div>
    </div>`;

    const passosHtml = simples
      ? (cart < e.passos.length
        ? `<div class="cartao"><div class="cn">Passo ${cart + 1} de ${e.passos.length}</div><p>${esc(e.passos[cart])}</p>
           <div class="btnrow"><button class="sec" data-act="cartao" data-d="-1" ${cart === 0 ? "disabled" : ""}>‹ Anterior</button><button class="cta sm" data-act="cartaoOk">Feito ✓</button></div></div>`
        : `<div class="cartao done"><p>Todos os passos feitos!</p><button class="sec" data-act="cartaoReset">Ver os passos de novo</button></div>`)
      : `<ol class="instr">${e.passos.map((p, i) => { const k = `${n}-${i}`; return `<li class="${S.passos[k] ? "on" : ""}"><button data-act="passo" data-k="${k}" aria-pressed="${!!S.passos[k]}"><span class="num">${S.passos[k] ? "✓" : i + 1}</span><span class="tx">${esc(p)}</span></button></li>`; }).join("")}</ol>`;

    return `<header class="top step"><button class="ghost back" data-go="inicio" aria-label="Início">‹</button>
        <div class="tt"><small>Etapa ${pad(n)} de ${TOTAL}</small><h1>${esc(e.titulo)}</h1></div>
        <button class="ghost ${simples ? "on" : ""}" data-act="simples" aria-pressed="${simples}" title="Modo simples">Aa</button></header>
      ${barra(pct(), "Progresso geral")}
      <nav class="dots" aria-label="Etapas">${ET.map((x) => `<button data-go="etapa-${x.n}" class="${x.n === n ? "cur" : ""} ${S.feitas[x.n] ? "done" : ""}" aria-label="Etapa ${x.n}">${x.n}</button>`).join("")}</nav>
      <main class="page step ${simples ? "simples" : ""}">
        <section class="what">
          <span class="eyebrow">O que vamos fazer</span>
          <p class="goal">${esc(e.meta)}</p>
          <div class="badges">${pessoas}${ferramentas}<span class="badge">${pos}</span>${e.repetir ? `<span class="badge two">Repetir ${e.repetir}×</span>` : ""}</div>
        </section>
        ${quadros}
        ${e.pecas.length ? `<section><h2 class="h2">Peças</h2><div class="chips">${e.pecas.map(([c, q]) => chipPeca(c, q)).join("")}</div></section>` : ""}
        ${e.ferragens.length ? `<section><h2 class="h2">Ferragens</h2><div class="chips">${e.ferragens.map(([c, q]) => chipFerr(c, q)).join("")}</div></section>` : `<section><h2 class="h2">Ferragens</h2><p class="muted">Esta etapa não usa ferragens novas.</p></section>`}
        <section><h2 class="h2">Passo a passo <small>${passosOk}/${e.passos.length}</small></h2>${passosHtml}
          ${e.ordemSugerida ? `<p class="src">O manual mostra esta etapa num único desenho; a ordem dos passos é sugerida.</p>` : ""}</section>
        <section class="alerts"><h2 class="h2">Cuidado</h2><ul>${e.erros.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>
        <section class="conf"><h2 class="h2">Conferência <small>${confOk}/${e.conferir.length}</small></h2>
          <p class="muted">Antes de seguir, confira:</p>
          <ul>${e.conferir.map((c, i) => { const k = `${n}-${i}`; return `<li><button class="${S.conf[k] ? "on" : ""}" data-act="conf" data-k="${k}" aria-pressed="${!!S.conf[k]}"><span class="box">${S.conf[k] ? "✓" : ""}</span>${esc(c)}</button></li>`; }).join("")}</ul>
          <div id="concluir-msg"></div>
          ${feito ? `<p class="feito">✓ Etapa concluída</p>` : ""}
        </section>
        <div class="actions">
          <button class="sec" data-act="rever">↺ Ver novamente</button>
          ${feito ? `<button class="sec" data-act="desfazer">Desmarcar etapa</button>` : `<button class="cta" data-act="concluir">CONCLUÍ ESTA ETAPA</button>`}
        </div>
      </main>
      <nav class="bottom" aria-label="Navegação entre etapas">
        <button class="sec" data-go="${n > 1 ? "etapa-" + (n - 1) : "preparo"}">‹ Voltar</button>
        <button class="cta" data-go="${n < TOTAL ? "etapa-" + (n + 1) : "fim"}">${n < TOTAL ? "Próxima etapa ›" : "Finalizar ›"}</button>
      </nav>`;
  }

  function telaFim() {
    const n = feitasN();
    return `${topo("Montagem")}
    <main class="page fim">
      <figure class="hero">${IL.capa(true)}</figure>
      <h2 class="big">${n === TOTAL ? "Guarda-roupa montado!" : `${n} de ${TOTAL} etapas concluídas`}</h2>
      ${n === TOTAL ? "" : `<p class="lead">Faltam: ${ET.filter((e) => !S.feitas[e.n]).map((e) => `<button class="link" data-go="etapa-${e.n}">${pad(e.n)}</button>`).join(", ")}</p>`}
      <section class="card warn"><h2>Antes de usar</h2><ul class="simple">
        <li><b>Fixe o móvel na parede.</b> O manual fotografado não mostra como: fale com o fabricante (${esc(window.MANUAL.contato.fone)}) ou com um montador.</li>
        <li><b>Nunca suba</b> no móvel, nem nas gavetas.</li>
        <li>Abra e feche todas as portas e gavetas para conferir.</li>
        <li>Limpe só com pano macio e seco.</li>
      </ul></section>
      <button class="sec wide" data-act="zerar">Começar outra montagem (apagar progresso)</button>
      <div id="zerar-msg"></div>
    </main>`;
  }

  const pad = (n) => String(n).padStart(2, "0");

  /* ---------- Folhas (detalhe de peça/ferragem) ---------- */
  function folha(html) {
    fecharFolha();
    const d = document.createElement("div");
    d.className = "sheet-wrap";
    d.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><button class="ghost close" data-act="fechar" aria-label="Fechar">✕</button>${html}</div>`;
    document.body.appendChild(d);
    requestAnimationFrame(() => d.classList.add("in"));
    d.addEventListener("click", (ev) => { if (ev.target === d) fecharFolha(); });
    const c = d.querySelector(".close"); if (c) c.focus();
  }
  function fecharFolha() { document.querySelectorAll(".sheet-wrap, .zoom").forEach((x) => x.remove()); }

  function folhaPeca(c) {
    const p = peca(c);
    folha(`<div class="sheet-head">${IL.miniPeca(p.dim)}<div><span class="code big">${p.code}</span><h2>${esc(p.nome)}</h2></div></div>
      <p class="dims">${dimTxt(p.dim)} · quantidade ${p.qtd}${p.qtdDesenho ? ` (desenho mostra ${p.qtdDesenho})` : ""}</p>
      <p><b>Como reconhecer:</b> ${esc(p.reconhecer)}</p><p><b>Posição:</b> ${esc(p.orientar)}</p>
      ${p.parecidas.length ? `<p class="similar">Cuidado, parecida com ${p.parecidas.map((x) => `${x} (${esc(peca(x).nome)})`).join(" e ")}.</p>` : ""}
      ${p.duvida ? `<p class="doubt">${esc(p.duvida)}</p>` : ""}`);
  }
  function folhaFerr(c) {
    const f = ferr(c);
    folha(`<div class="sheet-head hwbig" style="--hw:${window.HW_COLOR[c]}">${IL.icone(f.icone)}<div><span class="code big hw">${f.code}</span><h2>${esc(f.nome)}</h2></div></div>
      <p class="dims">Quantidade na caixa: ${f.qtd}</p><p>${esc(f.reconhecer)}</p>${f.alerta ? `<p class="doubt">${esc(f.alerta)}</p>` : ""}`);
  }
  function menu() {
    folha(`<h2>Menu</h2><nav class="menu">
      <button data-go="inicio">Início</button><button data-go="preparo">Antes de começar</button><button data-go="etapas">Todas as etapas</button>
      <button data-go="pecas">Peças de madeira</button><button data-go="ferragens">Ferragens</button><button data-go="usadas">Peças usadas</button>
      <button data-go="seguranca">Segurança e ferramentas</button><button data-go="confirmar">Pontos a confirmar</button></nav>`);
  }

  /* ---------- Zoom ---------- */
  function zoom(content) {
    fecharFolha();
    const z = document.createElement("div");
    z.className = "zoom";
    z.setAttribute("role", "dialog");
    z.setAttribute("aria-modal", "true");
    z.innerHTML = `<div class="zbar"><button class="sec" data-z="-1" aria-label="Diminuir">−</button><span class="zl">100%</span><button class="sec" data-z="1" aria-label="Aumentar">+</button><button class="cta sm" data-act="fechar">Fechar</button></div><div class="zarea"><div class="zin">${content}</div></div>`;
    document.body.appendChild(z);
    let f = 1;
    const zin = z.querySelector(".zin"), zl = z.querySelector(".zl");
    z.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-z]");
      if (!b) return;
      f = Math.max(1, Math.min(4, f + Number(b.dataset.z) * 0.5));
      zin.style.width = f * 100 + "%";
      zl.textContent = Math.round(f * 100) + "%";
    });
  }

  /* ---------- Roteamento ---------- */
  function rota() {
    const h = (location.hash || "#inicio").slice(1);
    fecharFolha();
    let html;
    if (h.startsWith("etapa-")) html = telaEtapa(Number(h.slice(6)));
    else html = ({ inicio: telaInicio, preparo: telaPreparo, pecas: telaPecas, ferragens: telaFerragens, etapas: telaEtapas,
      usadas: telaUsadas, confirmar: telaConfirmar, seguranca: telaSeguranca, fim: telaFim }[h] || telaInicio)();
    $app.innerHTML = `<div class="view">${html}</div>`;
    const h3 = $app.querySelector("#v3d");
    if (h3 && window.V3D) {
      const n3 = h.startsWith("etapa-") ? Number(h.slice(6)) : 0;
      window.V3D.montar(h3, n3 ? { n: n3, ghost: !!S.fantasma, onGhost: () => { S.fantasma = !S.fantasma; salvar(); redesenhar(); } } : { casa: true });
    }
    document.body.dataset.view = h.split("-")[0];
    window.scrollTo(0, 0);
    const t = $app.querySelector("h1"); if (t) document.title = h === "inicio" ? "Meu Montador" : `${t.textContent} · Meu Montador`;
  }
  function ir(destino) { if (location.hash === "#" + destino) rota(); else location.hash = destino; }
  function redesenhar() {
    const y = window.scrollY;
    const h = (location.hash || "#inicio").slice(1);
    rota();
    window.scrollTo(0, y);
    return h;
  }

  /* ---------- Ações ---------- */
  document.addEventListener("click", (ev) => {
    const go = ev.target.closest("[data-go]");
    if (go) { ev.preventDefault(); fecharFolha(); ir(go.dataset.go); return; }
    const a = ev.target.closest("[data-act]");
    if (!a) return;
    const act = a.dataset.act;
    const h = (location.hash || "").slice(1);
    const n = h.startsWith("etapa-") ? Number(h.slice(6)) : 0;
    const e = ET.find((x) => x.n === n);
    switch (act) {
      case "menu": menu(); break;
      case "fechar": fecharFolha(); break;
      case "peca": folhaPeca(a.dataset.code); break;
      case "ferr": folhaFerr(a.dataset.code); break;
      case "inv": S.inv[a.dataset.code] = !S.inv[a.dataset.code]; salvar(); redesenhar(); break;
      case "iniciar": S.preparo = true; salvar(); ir("etapa-1"); break;
      case "simples": S.simples = !S.simples; salvar(); redesenhar(); break;
      case "quadro": S.quadro[n] = a.dataset.i === "3d" ? "3d" : Number(a.dataset.i); salvar(); { const y = window.scrollY; rota(); window.scrollTo(0, y); } break;
      case "passo": S.passos[a.dataset.k] = !S.passos[a.dataset.k]; salvar(); redesenhar(); break;
      case "conf": S.conf[a.dataset.k] = !S.conf[a.dataset.k]; salvar(); redesenhar(); break;
      case "cartao": S.cartao[n] = Math.max(0, (S.cartao[n] || 0) + Number(a.dataset.d)); salvar(); redesenhar(); break;
      case "cartaoOk": { const c = S.cartao[n] || 0; S.passos[`${n}-${c}`] = true; S.cartao[n] = c + 1; salvar(); redesenhar(); break; }
      case "cartaoReset": S.cartao[n] = 0; salvar(); redesenhar(); break;
      case "rever":
        e.passos.forEach((_, i) => delete S.passos[`${n}-${i}`]);
        S.cartao[n] = 0; S.quadro[n] = "3d"; salvar(); rota(); break;
      case "concluir": {
        const falta = e.conferir.filter((_, i) => !S.conf[`${n}-${i}`]).length;
        if (falta && a.dataset.forcar !== "1") {
          document.getElementById("concluir-msg").innerHTML = `<div class="inline-confirm"><p>Ainda faltam ${falta} ${falta > 1 ? "itens" : "item"} da conferência. Concluir mesmo assim?</p><div class="btnrow"><button class="sec" data-act="marcarConf">Marcar tudo conferido</button><button class="cta sm" data-act="concluir" data-forcar="1">Concluir assim</button></div></div>`;
          document.getElementById("concluir-msg").scrollIntoView({ block: "center", behavior: "smooth" });
          return;
        }
        S.feitas[n] = true; salvar();
        celebrar(n);
        break;
      }
      case "marcarConf": e.conferir.forEach((_, i) => { S.conf[`${n}-${i}`] = true; }); salvar(); redesenhar(); break;
      case "desfazer": delete S.feitas[n]; salvar(); redesenhar(); break;
      case "zoom": {
        const fr = document.querySelector("#frames .frame");
        const img = fr.querySelector("img");
        zoom(img ? `<img src="${img.getAttribute("src")}" alt="${esc(img.alt)}">` : fr.querySelector("svg").outerHTML);
        break;
      }
      case "zerar":
        document.getElementById("zerar-msg").innerHTML = `<div class="inline-confirm"><p>Apagar todo o progresso salvo?</p><div class="btnrow"><button class="sec" data-go="fim">Cancelar</button><button class="cta sm danger" data-act="zerarSim">Apagar</button></div></div>`;
        break;
      case "zerarSim": S = novoEstado(); salvar(); ir("inicio"); break;
    }
  });

  function celebrar(n) {
    const t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.innerHTML = n < TOTAL ? `✓ Etapa ${pad(n)} concluída` : "✓ Última etapa concluída!";
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1800);
    ir(n < TOTAL ? "etapa-" + (n + 1) : "fim");
  }

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") fecharFolha();
    const h = (location.hash || "").slice(1);
    if (!h.startsWith("etapa-") || document.querySelector(".sheet-wrap,.zoom")) return;
    if (ev.target.closest && ev.target.closest("input,textarea")) return;
    const n = Number(h.slice(6));
    if (ev.key === "ArrowRight" && n < TOTAL) ir("etapa-" + (n + 1));
    if (ev.key === "ArrowLeft" && n > 1) ir("etapa-" + (n - 1));
  });

  window.addEventListener("hashchange", rota);
  if (!location.hash && S.ultima) { /* continua de onde parou: a tela inicial mostra "Continuar" */ }
  rota();
})();
