/* Meu Montador — visualização 3D (Three.js r128 + OrbitControls).
 * Modelo em milímetros, a partir das medidas da tabela do manual (proporções aproximadas nas junções).
 * Eixos: x = largura (0 = lado esquerdo), y = altura, z = profundidade (0 = costas, 385 = frente).
 */
(function () {
  "use strict";
  const HAS = typeof window.THREE !== "undefined" && !!window.WebGLRenderingContext;
  const COR = { novo: 0xffc94d, feito: 0xe9e3d6, fina: 0xd9c8a8, porta: 0xf6f5f1, metal: 0xa3acb8, escuro: 0x334155, azul: 0x3b82f6, papelao: 0xead9bd, chao: 0xeef1f4 };

  /* ---------- Definição das peças ---------- */
  const BAR_X = [497, 994, 1491];
  const COLX = [[12, 497], [509, 994], [1006, 1491], [1503, 1988]];

  function gabinete() {
    const L = [];
    const b = (key, code, a, z, o) => L.push(Object.assign({ key, code, a, b: z }, o || {}));
    b("rod02", "02", [12, 60, 373], [1988, 190, 385], { off: [0, 0, 500] });
    b("rod03", "03", [12, 60, 0], [1988, 190, 12], { off: [0, 0, -500] });
    BAR_X.forEach((x, i) => b("sup06", "06", [x - 1.5, 130, 12], [x + 13.5, 190, 373], { off: [0, -350, 0], lbl: i === 1 }));
    [745, 1243].forEach((x) => b("r04", "04", [x, 90, 12], [x + 12, 190, 373], { off: [0, -350, 0] }));
    [["12", 497], ["11", 994], ["10", 1491]].forEach(([c, x]) => b("divs", c, [x, 190, 0], [x + 12, 549, 385], { off: [0, -500, 0] }));
    // trilhos (parte do móvel) nas divisões
    [[509, 515], [988, 994], [1006, 1012], [1485, 1491]].forEach(([x1, x2], i) => [279, 459].forEach((y, j) =>
      b("railsCab", i === 0 && j === 0 ? "I" : null, [x1, y - 14, 30], [x2, y + 14, 370], { mat: "metal", off: [i % 2 ? 260 : -260, 0, 0] })));
    b("mid13", "13", [12, 549, 0], [1988, 561, 385], { off: [0, -600, 0] });
    b("top15", "15", [12, 1728, 0], [1988, 1740, 385], { off: [0, 500, 0] });
    BAR_X.forEach((x, i) => b("bars09", "09", [x, 561, 0], [x + 12, 1728, 80], { off: [0, 0, -500], lbl: true }));
    BAR_X.forEach((x, i) => b("bars07", "07", [x, 561, 305], [x + 12, 1728, 385], { off: [0, 0, 500], lbl: true }));
    b("lat01", "01", [0, 0, 0], [12, 1740, 385], { off: [-700, 0, 0] });
    b("lat16", "16", [1988, 0, 0], [2000, 1740, 385], { off: [700, 0, 0] });
    [900, 1310].forEach((y) => b("shelvesL", "14", [12, y, 25], [497, y + 12, 360], { off: [-500, 0, 0] }));
    [900, 1310].forEach((y) => b("shelvesR", "14", [1503, y, 25], [1988, y + 12, 360], { off: [500, 0, 0] }));
    [12, 1503].forEach((x) => b("bases", "05", [x, 190, 1], [x + 485, 194, 384], { mat: "fina", off: [0, 400, 0] }));
    [[509, 994], [1006, 1491]].forEach(([a, z]) => {
      b("rods", "T", [a + 20, 1608, 188], [z - 20, 1632, 212], { shape: "cylx", mat: "metal", off: [0, -300, 0] });
      b("rods", null, [a, 1595, 180], [a + 20, 1660, 220], { mat: "metal", off: [-200, 0, 0] });
      b("rods", null, [z - 20, 1595, 180], [z, 1660, 220], { mat: "metal", off: [200, 0, 0] });
    });
    b("top08", "08", [0, 1740, 0], [2000, 1814, 12], { off: [0, 450, 0] });
    [0, 1, 2, 3].forEach((i) => b("back23", "23", [i * 500 + 1, 175, -3], [i * 500 + 499, 1735, 0], { mat: "fina", off: [0, 0, -600] }));
    [40, 640, 1360, 1960].forEach((x) => [45, 340].forEach((z) => b("feet", x === 40 && z === 340 ? "U" : null, [x - 22, -60, z - 22], [x + 22, 0, z + 22], { shape: "pe", mat: "escuro", off: [0, -300, 0] })));
    // gavetas: 2 colunas × 2
    [[503, 996], [1004, 1497]].forEach(([a]) => [190, 370].forEach((y0) => {
      const o = { off: [0, 0, 480] };
      b("drawers", "19", [a, y0, 385], [a + 493, y0 + 178, 397], o);
      b("drawers", null, [a + 22, y0 + 30, 35], [a + 34, y0 + 130, 385], o);
      b("drawers", null, [a + 459, y0 + 30, 35], [a + 471, y0 + 130, 385], o);
      b("drawers", null, [a + 34, y0 + 40, 35], [a + 459, y0 + 120, 47], o);
      b("drawers", null, [a + 22, y0 + 27, 35], [a + 471, y0 + 30, 385], Object.assign({ mat: "fina" }, o));
      b("drawers", null, [a + 116, y0 + 82, 397], [a + 376, y0 + 96, 409], Object.assign({ mat: "escuro" }, o));
    }));
    // portas (com dobradiça na borda de fora de cada par)
    const PORTAS = [["17", 3, 248, 190, 1732, "L"], ["17", 251, 496, 190, 1732, "R"], ["18", 506, 751, 562, 1732, "L"], ["18", 754, 999, 562, 1732, "R"],
      ["18", 1001, 1246, 562, 1732, "L"], ["18", 1249, 1494, 562, 1732, "R"], ["17", 1504, 1749, 190, 1732, "L"], ["17", 1752, 1997, 190, 1732, "R"]];
    PORTAS.forEach(([c, x1, x2, y1, y2, h]) => b("doors", c, [x1, y1, 385], [x2, y2, 397], { mat: "porta", door: h, hy: c === "17" ? [1000, 1230] : [760, 990] }));
    return L;
  }

  /* Gaveta isolada (etapas 08 e 09) */
  function gaveta() {
    const L = [];
    const b = (key, code, a, z, o) => L.push(Object.assign({ key, code, a, b: z }, o || {}));
    b("g19", "19", [0, 0, 350], [493, 180, 362], { off: [0, 0, 300] });
    [[30, 42], [451, 463]].forEach(([x1, x2], i) => {
      b("gD", i ? null : "D", [x1 + 3, 70, 330], [x2 - 3, 76, 350], { mat: "madeira", off: [0, 0, 160] });
      b("gD", null, [x1 + 3, 110, 330], [x2 - 3, 116, 350], { mat: "madeira", off: [0, 0, 160] });
      b("g20", "20", [x1, 40, 0], [x2, 140, 350], { off: [i ? 300 : -300, 0, 0] });
      b("gN", i ? null : "N", [i ? x1 - 26 : x2, 60, 324], [i ? x1 : x2 + 26, 90, 350], { mat: "metal", off: [0, 250, 0] });
      b("gI", i ? null : "I", [i ? x2 : x1 - 6, 85, 10], [i ? x2 + 6 : x1, 95, 340], { mat: "metal", off: [i ? 250 : -250, 0, 0] });
    });
    b("g21", "21", [42, 50, 0], [451, 130, 12], { off: [0, 0, -300] });
    b("g22", "22", [18, 37, 0], [475, 40, 358], { mat: "fina", off: [0, -300, 0] });
    b("gH", "H", [117, 84, 362], [377, 96, 374], { mat: "escuro", off: [0, 0, 250] });
    return L;
  }

  /* Portas deitadas (etapa 11) */
  function portas() {
    const L = [];
    const b = (key, code, a, z, o) => L.push(Object.assign({ key, code, a, b: z }, o || {}));
    const lista = [["17", 1540], ["17", 1540], ["17", 1540], ["17", 1540], ["18", 1170], ["18", 1170], ["18", 1170], ["18", 1170]];
    lista.forEach(([c, len], i) => {
      const z0 = i * 290;
      b("pd", c, [0, 0, z0], [len, 12, z0 + 245], { mat: "porta" });
      [110, len / 2, len - 110].forEach((x, j) => {
        b("pP", i === 0 && j === 0 ? "P" : null, [x - 17, 12, z0 + 8], [x + 17, 26, z0 + 42], { shape: "cyly", mat: "escuro", off: [0, 260, 0] });
        b("pP", null, [x - 8, 12, z0 + 40], [x + 8, 24, z0 + 100], { mat: "metal", off: [0, 260, 0] });
      });
    });
    return L;
  }

  /* ---------- Cenas por etapa ---------- */
  const INSTALL = { railsCab: 1, divs: 2, top15: 2, bars09: 2, bars07: 2, mid13: 2, sup06: 2, rod02: 3, rod03: 3, r04: 3, shelvesL: 3, lat01: 3,
    shelvesR: 4, lat16: 4, feet: 5, rods: 6, bases: 6, back23: 7, top08: 7, drawers: 10, doors: 12 };
  const CENAS = {
    1: { modelo: "gab", pose: "empe", so: ["divs", "railsCab"], base: ["divs"], novo: [["railsCab"]], vista: [0.35, 0.3, 1], folga: 1.25 },
    2: { modelo: "gab", pose: "deitado", novo: [["top15"], ["bars09"], ["bars07"], ["mid13"], ["divs"], ["sup06"]] },
    3: { modelo: "gab", pose: "deitado", novo: [["r04"], ["rod02", "rod03"], ["shelvesL"], ["lat01"]] },
    4: { modelo: "gab", pose: "deitado", novo: [["shelvesR"], ["lat16"]] },
    5: { modelo: "gab", pose: "deitado", novo: [["feet"]], vista: [0.6, 0.9, 1.1] },
    6: { modelo: "gab", pose: "levantar", novo: [["rods"], ["bases"]] },
    7: { modelo: "gab", pose: "empe", novo: [["back23"], ["top08"]], vista: [-0.5, 0.45, -1] },
    8: { modelo: "gav", pose: "mesa", feito: [], novo: [["g19"], ["gD"], ["g20"], ["gN"], ["g21"]], so: ["g19", "gD", "g20", "gN", "g21"] },
    9: { modelo: "gav", pose: "mesa", feito: ["g19", "gD", "g20", "gN", "g21"], novo: [["g22"], ["gI"], ["gH"]] },
    10: { modelo: "gab", pose: "empe", novo: [["drawers"]] },
    11: { modelo: "port", pose: "mesa", feito: ["pd"], novo: [["pP"]], vista: [0.3, 1.2, 0.8] },
    12: { modelo: "gab", pose: "empe", novo: [["doors"]], portaAnim: true },
  };

  /* ---------- Motor ---------- */
  let R = null; // estado do visualizador
  function iniciarRenderer() {
    const T = window.THREE;
    const renderer = new T.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0xf7f8fa);
    const camera = new T.PerspectiveCamera(35, 1, 10, 40000);
    const controls = new T.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.8;
    controls.minDistance = 300;
    controls.maxDistance = 12000;
    controls.autoRotateSpeed = 1.6;
    controls.addEventListener("start", () => { controls.autoRotate = false; if (R) R.ui && R.ui.sync(); });
    R = { T, renderer, camera, controls, scene: null, key: null, raf: 0, host: null, labels: [], anims: [], t0: 0, ghost: false };
  }

  function material(tipo, estado, ghost) {
    const T = R.T;
    if (ghost) return new T.MeshBasicMaterial({ color: 0x9aa5b1, transparent: true, opacity: 0.16, depthWrite: false });
    let c = COR.feito;
    if (estado === "novo") c = tipo === "metal" || tipo === "escuro" ? 0xf59e0b : COR.novo;
    else if (tipo === "fina") c = COR.fina;
    else if (tipo === "porta") c = COR.porta;
    else if (tipo === "metal") c = COR.metal;
    else if (tipo === "escuro") c = COR.escuro;
    else if (tipo === "madeira") c = 0xc9a26b;
    return new T.MeshStandardMaterial({ color: c, roughness: tipo === "metal" ? 0.35 : 0.8, metalness: tipo === "metal" ? 0.5 : 0.02, emissive: estado === "novo" ? 0x3a2600 : 0x000000, emissiveIntensity: estado === "novo" ? 0.25 : 0 });
  }

  function malha(p, estado, ghost) {
    const T = R.T;
    const [x1, y1, z1] = p.a, [x2, y2, z2] = p.b;
    const w = x2 - x1, h = y2 - y1, d = z2 - z1;
    let geo;
    if (p.shape === "cylx") { geo = new T.CylinderGeometry(h / 2, h / 2, w, 20); geo.rotateZ(Math.PI / 2); }
    else if (p.shape === "cyly") geo = new T.CylinderGeometry(w / 2, w / 2, h, 24);
    else if (p.shape === "pe") geo = new T.CylinderGeometry(w / 2, w / 2.9, h, 18);
    else geo = new T.BoxGeometry(w, h, d);
    const m = new T.Mesh(geo, material(p.mat, estado, ghost));
    const g = new T.Group();
    g.add(m);
    if (!ghost && !p.shape) {
      const e = new T.LineSegments(new T.EdgesGeometry(geo), new T.LineBasicMaterial({ color: estado === "novo" ? 0x7a4e00 : 0x8995a3, transparent: true, opacity: 0.7 }));
      g.add(e);
    }
    g.position.set(x1 + w / 2, y1 + h / 2, z1 + d / 2);
    return g;
  }

  function porta(p, estado, ghost) {
    // pivô na borda da dobradiça, na frente do móvel
    const T = R.T;
    const [x1, y1, z1] = p.a, [x2, y2, z2] = p.b;
    const piv = new T.Group();
    const hx = p.door === "L" ? x1 : x2;
    piv.position.set(hx, 0, z1);
    const local = Object.assign({}, p, { a: [x1 - hx, y1, 0], b: [x2 - hx, y2, z2 - z1], door: null });
    piv.add(malha(local, estado, ghost));
    if (!ghost) {
      const px = p.door === "L" ? x2 - hx - 22 : x1 - hx + 22;
      piv.add(malha({ a: [px - 7, p.hy[0], 12], b: [px + 7, p.hy[1], 24], mat: "escuro" }, estado === "novo" ? "novo" : "feito"));
    }
    piv.userData.sinal = p.door === "L" ? -1 : 1;
    return piv;
  }

  function montarCena(cfg, estadoFn) {
    const T = R.T;
    const scene = new T.Scene();
    scene.add(new T.HemisphereLight(0xffffff, 0xb9c2cc, 0.85));
    const sol = new T.DirectionalLight(0xffffff, 0.75);
    sol.position.set(-1500, 3000, 2500);
    scene.add(sol);
    const sol2 = new T.DirectionalLight(0xffffff, 0.3);
    sol2.position.set(2500, 1500, -2000);
    scene.add(sol2);

    const pecas = cfg.modelo === "gav" ? gaveta() : cfg.modelo === "port" ? portas() : gabinete();
    const mundo = new T.Group(); // gira para deitar/levantar
    scene.add(mundo);
    const labels = [], anims = [];
    const ordem = {};
    (cfg.novo || []).forEach((grupo, i) => grupo.forEach((k) => { ordem[k] = i; }));

    pecas.forEach((p) => {
      const est = estadoFn(p.key);
      if (!est) return;
      const ghost = est === "ghost";
      const obj = p.door ? porta(p, est, ghost) : malha(p, est, ghost);
      mundo.add(obj);
      if (est === "novo") {
        const g = ordem[p.key] || 0;
        if (p.door && cfg.portaAnim) anims.push({ obj, tipo: "porta", g, alvo: 0, de: obj.userData.sinal * 1.9 });
        else if (p.off) {
          const fim = obj.position.clone();
          anims.push({ obj, tipo: "voo", g, fim, ini: fim.clone().add(new T.Vector3(p.off[0], p.off[1], p.off[2])) });
        }
        if (p.code && (p.lbl !== false)) labels.push({ obj, code: p.code, door: !!p.door });
      }
      if (p.door) obj.userData.porta = true;
      if (p.key === "drawers") obj.userData.gaveta = true;
    });

    // chão
    const box = new T.Box3();
    const poseFinal = cfg.pose === "levantar" ? "empe" : cfg.pose;
    aplicarPose(mundo, poseFinal);
    mundo.updateMatrixWorld(true);
    box.setFromObject(mundo);
    const cx = (box.min.x + box.max.x) / 2, cz = (box.min.z + box.max.z) / 2;
    const tam = Math.max(box.max.x - box.min.x, box.max.z - box.min.z) * 1.5 + 800;
    const deitado = cfg.pose === "deitado" || cfg.pose === "levantar";
    const chao = new T.Mesh(new T.PlaneGeometry(tam, tam), new T.MeshStandardMaterial({ color: deitado ? COR.papelao : COR.chao, roughness: 1 }));
    chao.rotation.x = -Math.PI / 2;
    chao.position.set(cx, Math.min(box.min.y, 0) - 1, cz);
    scene.add(chao);
    const grid = new T.GridHelper(tam, Math.round(tam / 250), 0xcfd6dd, 0xdfe4e9);
    grid.position.set(cx, Math.min(box.min.y, 0), cz);
    grid.material.transparent = true; grid.material.opacity = deitado ? 0.25 : 0.6;
    scene.add(grid);
    if (cfg.pose === "levantar") aplicarPose(mundo, "deitado");
    return { scene, mundo, labels, anims, box, cfg };
  }

  function aplicarPose(mundo, pose, t) {
    // t: 0 = deitado, 1 = em pé
    if (pose === "deitado") t = 0;
    else if (pose === "empe" || pose === "mesa") t = 1;
    mundo.rotation.x = -Math.PI / 2 * (1 - t);
    mundo.position.y = pose === "mesa" ? 0 : 60 * t;
  }

  /* Enquadra a câmera no conjunto */
  function enquadrar(dir, instant) {
    const T = R.T, c = R.cena;
    const box = c.box;
    const centro = new T.Vector3(); box.getCenter(centro);
    const raio = box.getSize(new T.Vector3()).length() / 2;
    const cam = R.camera;
    const vf = (cam.fov * Math.PI) / 180;
    const hf = 2 * Math.atan(Math.tan(vf / 2) * cam.aspect);
    const dist = (raio / Math.sin(Math.min(vf, hf) / 2)) * 0.92 * (c.cfg.folga || 1);
    const d = new T.Vector3(dir[0], dir[1], dir[2]).normalize();
    const alvoPos = centro.clone().add(d.multiplyScalar(dist));
    if (instant) { cam.position.copy(alvoPos); R.controls.target.copy(centro); }
    else R.voo = { de: cam.position.clone(), para: alvoPos, alvoDe: R.controls.target.clone(), alvoPara: centro, t0: performance.now() };
    R.controls.update();
  }

  const VISTAS = { frente: [0.0001, 0.12, 1], lado: [1, 0.2, 0.05], cima: [0.0001, 1, 0.12], tras: [0.0001, 0.12, -1] };
  function vistaInicial(cfg) {
    if (cfg.vista) return cfg.vista;
    if (cfg.pose === "deitado") return [0.55, 1.15, 0.9];
    if (cfg.pose === "mesa") return [0.6, 0.8, 1];
    return [0.55, 0.3, 1];
  }

  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));
  const DUR = 0.9, PASSO = 0.75, ATRASO = 0.4;

  function animar(agora) {
    const c = R.cena;
    if (!c) return;
    const t = (agora - R.t0) / 1000;
    let base = ATRASO;
    if (c.cfg.pose === "levantar") {
      const k = ease((t - 0.3) / 1.6);
      aplicarPose(c.mundo, "x", k);
      base = 2.1;
    }
    c.anims.forEach((a) => {
      const k = ease((t - base - a.g * PASSO) / DUR);
      if (a.tipo === "voo") a.obj.position.lerpVectors(a.ini, a.fim, k);
      else if (a.tipo === "porta") a.obj.rotation.y = a.de * (1 - k);
    });
    // portas/gavetas abertas (tela inicial)
    if (R.abrir !== undefined) {
      R.abrirK += ((R.abrir ? 1 : 0) - R.abrirK) * 0.08;
      c.mundo.children.forEach((o) => {
        if (o.userData.porta) o.rotation.y = o.userData.sinal * 1.75 * R.abrirK;
        if (o.userData.gaveta) o.position.z = o.userData.z0 + 300 * R.abrirK * (o.userData.colunaSup ? 0.6 : 1);
      });
    }
    if (R.voo) {
      const k = ease((agora - R.voo.t0) / 700);
      R.camera.position.lerpVectors(R.voo.de, R.voo.para, k);
      R.controls.target.lerpVectors(R.voo.alvoDe, R.voo.alvoPara, k);
      if (k >= 1) R.voo = null;
    }
  }

  function loop(agora) {
    if (!R.host || !R.host.isConnected) { R.raf = 0; return; }
    R.raf = requestAnimationFrame(loop);
    redimensionar();
    animar(agora);
    R.controls.update();
    R.renderer.render(R.cena.scene, R.camera);
    rotulos();
  }

  function redimensionar() {
    const el = R.host.querySelector(".v3d-canvas");
    const w = el.clientWidth, h = el.clientHeight;
    if (w && h && (w !== R.w || h !== R.h)) {
      R.w = w; R.h = h;
      R.renderer.setSize(w, h, false);
      R.camera.aspect = w / h;
      R.camera.updateProjectionMatrix();
    }
  }

  function rotulos() {
    const T = R.T, lay = R.host.querySelector(".v3d-labels");
    if (!lay) return;
    if (lay.childElementCount !== R.cena.labels.length) {
      lay.innerHTML = R.cena.labels.map((l) => `<span class="lbl3d">${l.code}</span>`).join("");
    }
    const v = new T.Vector3();
    R.cena.labels.forEach((l, i) => {
      const el = lay.children[i];
      l.obj.updateMatrixWorld();
      if (l.door) { const b = new T.Box3().setFromObject(l.obj); b.getCenter(v); } else l.obj.getWorldPosition(v);
      v.project(R.camera);
      const vis = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
      el.style.display = vis ? "" : "none";
      el.style.transform = `translate(${((v.x + 1) / 2) * R.w}px, ${((1 - v.y) / 2) * R.h}px) translate(-50%, -50%)`;
    });
  }

  /* ---------- API pública ---------- */
  function htmlViewer(opts) {
    if (!HAS) return `<div class="v3d off"><p>A visualização 3D não abriu neste aparelho. Use os desenhos A, B e C.</p></div>`;
    const casa = opts && opts.casa;
    return `<div class="v3d ${casa ? "casa" : ""}" id="v3d">
      <div class="v3d-canvas"></div><div class="v3d-labels" aria-hidden="true"></div>
      <div class="v3d-hint">Arraste para girar · pinça para zoom</div>
      <div class="v3d-bar">
        ${casa ? `<button data-v3="abrir">Abrir portas</button>` : `<button data-v3="animar" class="pri">▶ Animar</button>`}
        <button data-v3="girar">Girar sozinho</button>
        ${casa ? "" : `<button data-v3="ghost">Ver pronto</button>`}
        <button data-v3="frente">Frente</button><button data-v3="lado">Lado</button><button data-v3="cima">Cima</button><button data-v3="tras">Trás</button><button data-v3="inicio" aria-label="Voltar à vista inicial">↺</button><button data-v3="tela">⤢ Tela cheia</button>
      </div></div>`;
  }

  function montar(host, opts) {
    if (!HAS || !host) return;
    try { if (!R) iniciarRenderer(); } catch (e) { host.classList.add("off"); host.innerHTML = `<p>A visualização 3D não abriu neste aparelho. Use os desenhos A, B e C.</p>`; return; }
    const key = opts.casa ? "casa" : `etapa-${opts.n}-${opts.ghost ? 1 : 0}`;
    R.host = host;
    host.querySelector(".v3d-canvas").appendChild(R.renderer.domElement);
    R.w = R.h = 0;
    redimensionar();
    const nova = key !== R.key;
    if (nova) {
      let cfg;
      if (opts.casa) cfg = { modelo: "gab", pose: "empe", novo: [] };
      else cfg = CENAS[opts.n];
      const n = opts.casa ? 99 : opts.n;
      const estado = (k) => {
        if (cfg.so && !cfg.so.includes(k)) return null;
        if ((cfg.novo || []).some((g) => g.includes(k)) && !(cfg.base || []).includes(k)) return "novo";
        if (cfg.feito) return cfg.feito.includes(k) ? "feito" : (opts.ghost ? "ghost" : null);
        if ((cfg.base || []).includes(k)) return "feito";
        if (INSTALL[k] !== undefined && INSTALL[k] < n) return "feito";
        return opts.ghost ? "ghost" : null;
      };
      const reaproveitarCamera = R.key && R.key.split("-").slice(0, 2).join("-") === key.split("-").slice(0, 2).join("-");
      R.cena = montarCena(cfg, estado);
      R.cena.mundo.children.forEach((o) => { o.userData.z0 = o.position.z; });
      R.key = key;
      R.t0 = performance.now();
      R.abrir = opts.casa ? false : undefined; R.abrirK = 0;
      R.controls.autoRotate = !!opts.casa;
      if (!reaproveitarCamera) enquadrar(vistaInicial(cfg), true);
    }
    R.ui = {
      sync() {
        host.querySelectorAll("[data-v3]").forEach((b) => {
          const a = b.dataset.v3;
          if (a === "girar") b.classList.toggle("on", R.controls.autoRotate);
          if (a === "ghost") b.classList.toggle("on", !!opts.ghost);
          if (a === "abrir") { b.classList.toggle("on", !!R.abrir); b.textContent = R.abrir ? "Fechar portas" : "Abrir portas"; }
        });
      },
    };
    host.onclick = (ev) => {
      const b = ev.target.closest("[data-v3]");
      if (!b) return;
      const a = b.dataset.v3;
      if (a === "animar") { R.t0 = performance.now(); if (R.cena.cfg.pose === "levantar") aplicarPose(R.cena.mundo, "deitado"); }
      else if (a === "girar") R.controls.autoRotate = !R.controls.autoRotate;
      else if (a === "abrir") R.abrir = !R.abrir;
      else if (a === "ghost") { if (opts.onGhost) opts.onGhost(); return; }
      else if (a === "inicio") enquadrar(vistaInicial(R.cena.cfg));
      else if (a === "tela") { const f = host.classList.toggle("full"); b.textContent = f ? "✕ Fechar" : "⤢ Tela cheia"; document.body.classList.toggle("v3d-full", f); setTimeout(() => { redimensionar(); enquadrar(vistaInicial(R.cena.cfg)); }, 60); }
      else if (VISTAS[a]) enquadrar(VISTAS[a]);
      R.ui.sync();
    };
    R.ui.sync();
    if (!R.raf) R.raf = requestAnimationFrame(loop);
  }

  window.V3D = { ok: HAS, html: htmlViewer, montar };
})();
