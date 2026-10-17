/* Levo · Casa, tienda y premios. Usa el estado global de index.html (habits, days, frac, dayKey, sb, uid, AREAS…). */
let purchases = [], outfit = {}, casaTab = "muebles", tab = "hoy", timerInt = null;

/* ---------- Catálogo ---------- */
const ROPA = [
  { id: "gorra-negra", slot: "gorra", name: "Gorra negra", cost: 60, c: "#161616" },
  { id: "gorra-roja", slot: "gorra", name: "Gorra roja", cost: 80, c: "#ff2d55" },
  { id: "gorro-lana", slot: "gorra", name: "Gorro de lana", cost: 120, c: "#5e5ce6" },
  { id: "gafas-sol", slot: "gafas", name: "Gafas de sol", cost: 90, c: "#0b0b0f", fill: true },
  { id: "gafas-pasta", slot: "gafas", name: "Gafas de pasta", cost: 70, c: "#7a4a24" },
  { id: "sudadera-negra", slot: "top", name: "Sudadera negra", cost: 150, c: "#2a2a2e" },
  { id: "chandal-verde", slot: "top", name: "Chándal verde", cost: 160, c: "#30d158" },
  { id: "sudadera-levo", slot: "top", name: "Sudadera Levo", cost: 220, c: "#ff9f0a" },
  { id: "zapas-blancas", slot: "zapas", name: "Zapatillas blancas", cost: 100, c: "#f5f5f7" },
  { id: "zapas-rojas", slot: "zapas", name: "Zapatillas rojas", cost: 120, c: "#ff3b30" },
  { id: "cadena-oro", slot: "cadena", name: "Cadena de oro", cost: 250, c: "#ffd60a" },
  { id: "gorra-holo", slot: "gorra", name: "Gorra holográfica", rarity: "raro", c: "#64d2ff" },
  { id: "zapas-neon", slot: "zapas", name: "Zapatillas neón", rarity: "raro", c: "#32d74b" },
  { id: "sudadera-galaxia", slot: "top", name: "Sudadera galaxia", rarity: "epico", c: "#6e3cff" },
  { id: "gafas-cyber", slot: "gafas", name: "Gafas cyber", rarity: "epico", c: "#ff2d55", fill: true },
  { id: "corona", slot: "gorra", name: "Corona", rarity: "legendario", c: "#ffd60a" },
  { id: "aura", slot: "aura", name: "Aura dorada", rarity: "legendario", c: "#ffcc00" },
];
const MUEBLES = [
  { id: "alfombra", area: "vida", name: "Alfombra", cost: 90, lv: 1 },
  { id: "cama", area: "vida", name: "Cama", cost: 120, lv: 1 },
  { id: "esterilla", area: "cuerpo", name: "Esterilla", cost: 50, lv: 1 },
  { id: "mancuernas", area: "cuerpo", name: "Mancuernas", cost: 60, lv: 1 },
  { id: "planta", area: "mente", name: "Planta", cost: 60, lv: 1 },
  { id: "escritorio", area: "trabajo", name: "Escritorio", cost: 100, lv: 1 },
  { id: "lampara", area: "mente", name: "Lámpara de lectura", cost: 70, lv: 2 },
  { id: "estanteria", area: "mente", name: "Estantería de libros", cost: 140, lv: 2 },
  { id: "silla", area: "trabajo", name: "Silla gamer", cost: 150, lv: 2 },
  { id: "saco", area: "cuerpo", name: "Saco de boxeo", cost: 180, lv: 3 },
  { id: "cuadro", area: "vida", name: "Foto de familia", cost: 80, lv: 2 },
  { id: "hucha", area: "vida", name: "Hucha", cost: 120, lv: 3 },
  { id: "sofa", area: "vida", name: "Sofá", cost: 200, lv: 3 },
  { id: "setup", area: "trabajo", name: "Setup de 3 pantallas", cost: 300, lv: 4, needs: "escritorio" },
  { id: "neon", name: "Neón LEVO", rarity: "raro", c: "#ff2d55" },
  { id: "colgantes", name: "Plantas colgantes", rarity: "raro", c: "#30d158" },
  { id: "arcade", name: "Máquina arcade", rarity: "epico", c: "#5e5ce6" },
  { id: "acuario", name: "Acuario", rarity: "epico", c: "#0a84ff" },
  { id: "trofeo", name: "Trofeo de oro", rarity: "legendario", c: "#ffd60a" },
];
const RAREZA = { raro: { name: "Raro", c: "#0a84ff" }, epico: { name: "Épico", c: "#af52de" }, legendario: { name: "Legendario", c: "#ffb800" } };
const PREMIOS = [
  { id: "redes15", name: "15 min de Instagram o YouTube", cost: 40, min: 15, ico: "📱" },
  { id: "descanso30", name: "30 min de descanso total", cost: 60, min: 30, ico: "☕" },
  { id: "ocio60", name: "1 h de serie o videojuego", cost: 120, min: 60, ico: "🎮" },
  { id: "tarde", name: "Tarde libre (4 h)", cost: 400, min: 240, ico: "🌅" },
];

/* ---------- Monedas ---------- */
function prevStreak(k) { let n = 0, d = new Date(k + "T12:00:00"); for (let i = 0; i < 30; i++) { d.setDate(d.getDate() - 1); if (frac(fmt(d)) >= .6) n++; else break } return n }
function earned() {
  let c = 0;
  for (const k in days) {
    if (k < START) continue;
    const n = habits.filter(h => doneFor(k)[h.id]).length, f = frac(k);
    let e = 5 * n + (f >= .6 ? 20 : 0) + (f === 1 ? 50 : 0);
    if (prevStreak(k) >= 7) e *= 2;
    c += e;
  }
  return c;
}
const spent = () => purchases.reduce((t, p) => t + p.cost, 0);
const coins = () => Math.max(0, earned() - spent());
const owned = id => purchases.some(p => (p.kind === "item" || p.kind === "cofre") && p.item === id);
const level = () => Math.floor(xp() / 150) + 1;
const activePremio = () => { const now = Date.now(); return purchases.filter(p => p.kind === "premio").map(p => ({ ...p, ends: Date.parse(p.at) + p.minutes * 60e3 })).find(p => p.ends > now) };

/* ---------- Personaje con ropa ---------- */
function spritePixels(o, md, bl) {
  const skin = "#f3d9c4", ink = "#161616";
  const top = (ROPA.find(r => r.id === o.top) || {}).c || (md === "enfermo" ? "#98989f" : "#ff2d55");
  const col = { H: ink, S: skin, E: ink, T: top, P: ink };
  const px = [];
  BASE.forEach((r, y) => [...r].forEach((k, x) => { if (k === ".") return; let c = col[k]; if (k === "E" && (bl || md === "agotado" || md === "enfermo") && y === 5) c = skin; px.push([x, y, c]) }));
  const mouth = { enfermo: [[6, 9], [7, 8], [8, 9], [9, 8]], feliz: [[5, 8], [10, 8], [6, 9], [7, 9], [8, 9], [9, 9]], ok: [[6, 9], [7, 9], [8, 9], [9, 9]], triste: [[6, 8], [7, 8], [8, 8], [9, 8], [5, 9], [10, 9]], agotado: [[7, 9], [8, 9]] }[md] || [];
  mouth.forEach(([x, y]) => px.push([x, y, ink]));
  const g = ROPA.find(r => r.id === o.gorra);
  if (g && g.id === "corona") { [[3, 0], [6, 0], [9, 0], [12, 0]].forEach(p => px.push([...p, g.c])); for (let y = 1; y < 3; y++) for (let x = 3; x < 13; x++) px.push([x, y, y === 2 && x % 3 === 1 ? "#ff2d55" : g.c]) }
  else if (g) { for (let y = 0; y < 3; y++) for (let x = 2; x < 14; x++) if (BASE[y][x] !== ".") px.push([x, y, g.c]); if (g.id !== "gorro-lana") for (let x = 1; x < 8; x++) px.push([x, 3, g.c]); else px.push([7, 0, "#fff"], [8, 0, "#fff"]) }
  const gf = ROPA.find(r => r.id === o.gafas);
  if (gf) { [[3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5], [12, 5]].forEach(p => px.push([...p, gf.c])); if (gf.fill) [[3, 6], [4, 6], [5, 6], [6, 6], [9, 6], [10, 6], [11, 6], [12, 6]].forEach(p => px.push([...p, gf.c])); else [[3, 6], [6, 6], [9, 6], [12, 6]].forEach(p => px.push([...p, gf.c])) }
  const z = ROPA.find(r => r.id === o.zapas);
  if (z) [[3, 15], [4, 15], [5, 15], [10, 15], [11, 15], [12, 15]].forEach(p => px.push([...p, z.c]));
  if (o.cadena) [[6, 11], [7, 12], [8, 12], [9, 11]].forEach(p => px.push([...p, "#ffd60a"]));
  return px;
}
drawPet = function () {
  const c = $("pet"), x = c.getContext("2d");
  x.clearRect(0, 0, 16, 16);
  spritePixels(outfit, mood, blink).forEach(([px, py, col]) => { if (py + bob > 15) return; x.fillStyle = col; x.fillRect(px, py + bob, 1, 1) });
  if (tab === "casa") drawRoom();
};

/* ---------- Habitación isométrica ---------- */
const OX = 100, OY = 52, TW = 12, TH = 6;
const P = (x, y, z = 0) => [OX + (x - y) * TW, OY + (x + y) * TH - z];
function shade(hex, f) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255; const m = v => Math.max(0, Math.min(255, Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f))); return `rgb(${m(r)},${m(g)},${m(b)})` }
function poly(x, pts, c) { x.fillStyle = c; x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); x.fill() }
function box(x, gx, gy, w, d, h, c, z0 = 0) {
  poly(x, [P(gx, gy + d, z0), P(gx + w, gy + d, z0), P(gx + w, gy + d, z0 + h), P(gx, gy + d, z0 + h)], shade(c, .78));
  poly(x, [P(gx + w, gy, z0), P(gx + w, gy + d, z0), P(gx + w, gy + d, z0 + h), P(gx + w, gy, z0 + h)], shade(c, .6));
  poly(x, [P(gx, gy, z0 + h), P(gx + w, gy, z0 + h), P(gx + w, gy + d, z0 + h), P(gx, gy + d, z0 + h)], shade(c, 1.12));
}
const DRAW = {
  alfombra: x => box(x, 1.6, 1.8, 2.8, 2.6, .6, "#ff9f0a"),
  esterilla: x => box(x, 4.3, 2.4, 1, 2, .8, "#7d7aff"),
  cama: x => { box(x, 0, 3.2, 1.8, 2.8, 5, "#8b5a2b"); box(x, 0, 3.2, 1.8, 2.8, 3, "#f5f5f7", 5); box(x, 0, 3.3, 1.8, .7, 2, "#cfe3ff", 8); box(x, 0, 4.2, 1.8, 1.8, 1, "#ff375f", 8) },
  escritorio: x => { box(x, 2, 0, 2.6, 1.1, 10, "#b98b5e"); },
  setup: x => { [2.15, 2.95, 3.75].forEach(gx => { box(x, gx, .15, .7, .12, 7, "#16161a", 10); box(x, gx + .05, .27, .6, .01, 6, "#0a84ff", 10.5) }) },
  silla: x => { box(x, 3, 1.5, .8, .8, 6, "#ff3b30"); box(x, 3, 2.15, .8, .15, 11, "#c81e1e", 6) },
  mancuernas: x => { box(x, 5.3, 4.3, .3, .5, 2, "#3a3a3c"); box(x, 5.3, 5.1, .3, .5, 2, "#3a3a3c") },
  saco: x => { box(x, 5.15, 1.1, .02, .02, 12, "#888", 18); box(x, 5, 1, .55, .55, 14, "#c62828", 6) },
  estanteria: x => { box(x, 0, .9, .6, 1.6, 24, "#9c6b3f"); [6, 13, 20].forEach((z, i) => box(x, .45, 1.0, .2, 1.4, 4, ["#ff2d55", "#0a84ff", "#30d158"][i], z)) },
  planta: x => { box(x, 5.3, .2, .6, .6, 3, "#d2691e"); box(x, 5.15, .05, .9, .9, 7, "#30d158", 3); box(x, 5.35, .25, .5, .5, 4, "#28b44c", 10) },
  lampara: x => { box(x, .3, 5.5, .15, .15, 18, "#8e8e93"); box(x, .1, 5.3, .55, .55, 3, "#ffd60a", 18) },
  sofa: x => { box(x, 3.4, 4.8, 2.3, 1, 5, "#5e5ce6"); box(x, 3.4, 5.55, 2.3, .3, 10, "#4b49c9") },
  cuadro: x => { const a = P(1, 0, 34), b = P(2.2, 0, 34), c = P(2.2, 0, 22), d = P(1, 0, 22); poly(x, [a, b, c, d], "#ffffff"); poly(x, [P(1.1, 0, 32.5), P(2.1, 0, 32.5), P(2.1, 0, 23.5), P(1.1, 0, 23.5)], "#ff9f0a") },
  hucha: x => box(x, 4.7, .5, .55, .4, 4, "#ff7eb6"),
  neon: x => { const t = Date.now() / 400; x.save(); x.shadowColor = "#ff2d55"; x.shadowBlur = 6 + Math.sin(t) * 2; poly(x, [P(3.1, 0, 38), P(5.4, 0, 38), P(5.4, 0, 31), P(3.1, 0, 31)], "#ff2d55"); x.restore(); poly(x, [P(3.3, 0, 36.5), P(5.2, 0, 36.5), P(5.2, 0, 32.5), P(3.3, 0, 32.5)], "#ffd1dc") },
  colgantes: x => { [[0, 1.2], [0, 4.6]].forEach(([gx, gy]) => { box(x, gx, gy, .5, .5, 3, "#d2691e", 36); box(x, gx, gy, .6, .6, 8, "#30d158", 28) }) },
  arcade: x => { box(x, 5.2, 2.5, .8, .8, 16, "#5e5ce6"); box(x, 5.15, 2.6, .05, .6, 6, "#64d2ff", 8); box(x, 5.1, 2.6, .1, .6, 2, "#ff2d55", 5) },
  acuario: x => { box(x, 2.2, 5.2, 1.2, .6, 4, "#3a3a3c"); x.globalAlpha = .75; box(x, 2.2, 5.2, 1.2, .6, 6, "#64d2ff", 4); x.globalAlpha = 1; const t = Math.floor(Date.now() / 500) % 2; x.fillStyle = "#ff9f0a"; const [fx, fy] = P(2.6 + t * .3, 5.8, 7); x.fillRect(fx, fy, 2, 1) },
  trofeo: x => { box(x, 1.4, .3, .6, .6, 6, "#e5e5ea"); box(x, 1.5, .4, .4, .4, 6, "#ffd60a", 6); box(x, 1.45, .35, .5, .5, 2, "#ffb800", 12) },
};
/* Bongo: perrito negro con mancha blanca y collar naranja */
const BONGO = ["K..K..........", "KKKK..........", "KWKKK........T", "KKKKK.......T.", "KKKKKKKKKKKKK.", ".OOKKKKKKKKKK.", ".KWWKKKKKKKKK.", ".KWKKKKKKKKKK.", ".KK.KK...KK.KK", ".KK.KK...KK.KK"];
const bongoUnlocked = () => milestones() >= 2;
function drawBongo(x, sx, sy) {
  const sad = mood === "enfermo" || mood === "agotado" || mood === "triste", wag = !sad && Math.floor(Date.now() / 250) % 2;
  const col = { K: "#1a1a1a", W: "#ffffff", O: "#ff9f0a", T: "#1a1a1a" };
  BONGO.forEach((r, y) => [...r].forEach((k, i) => {
    if (k === ".") return; let yy = y;
    if (k === "T") { if (sad) return; yy = wag ? y : y + 1 }
    if (sad && y < 2) yy = y + 2;
    if (sad && y >= 8) return;
    x.fillStyle = col[k]; x.fillRect(sx + i, sy + yy + (sad ? 2 : 0), 1, 1);
  }));
  if (sad) { x.fillStyle = "#1a1a1a"; x.fillRect(sx + 13, sy + 6, 1, 3) }
}
function drawRoom() {
  const cv = $("room"); if (!cv) return; const x = cv.getContext("2d");
  x.clearRect(0, 0, 200, 150);
  // paredes
  poly(x, [P(0, 0, 0), P(6, 0, 0), P(6, 0, 44), P(0, 0, 44)], "#e9e4f2");
  poly(x, [P(0, 0, 0), P(0, 6, 0), P(0, 6, 44), P(0, 0, 44)], "#d8d1e6");
  // ventana con vistas a Murcia en la pared izquierda
  poly(x, [P(0, 2.2, 36), P(0, 3.8, 36), P(0, 3.8, 20), P(0, 2.2, 20)], "#8fd3ff");
  poly(x, [P(0, 3.0, 31), P(0, 3.25, 32.5), P(0, 3.25, 21), P(0, 3.0, 21)], "#b0723a");
  // suelo
  poly(x, [P(0, 0), P(6, 0), P(6, 6), P(0, 6)], "#f1d9b5");
  x.strokeStyle = "rgba(120,80,40,.12)"; x.lineWidth = .5;
  for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(...P(i, 0)); x.lineTo(...P(i, 6)); x.stroke(); x.beginPath(); x.moveTo(...P(0, i)); x.lineTo(...P(6, i)); x.stroke() }
  // muebles por profundidad y el personaje en medio
  const order = ["alfombra", "esterilla", "neon", "cuadro", "colgantes", "estanteria", "trofeo", "escritorio", "setup", "planta", "hucha", "saco", "arcade", "silla", "cama", "lampara", "@yo", "@bongo", "mancuernas", "acuario", "sofa"];
  order.forEach(id => {
    if (id === "@bongo") { if (bongoUnlocked()) { const [bx, by] = P(4.3, 3.7); drawBongo(x, bx - 7, by - 10) } return }
    if (id === "@yo" && outfit.aura) { const [ax, ay] = P(3.3, 3.3); const gr = x.createRadialGradient(ax, ay - 9, 2, ax, ay - 9, 16); gr.addColorStop(0, "rgba(255,214,10,.55)"); gr.addColorStop(1, "rgba(255,214,10,0)"); x.fillStyle = gr; x.fillRect(ax - 18, ay - 27, 36, 36) }
    if (id === "@yo") { const [sx, sy] = P(3.3, 3.3); spritePixels(outfit, mood, blink).forEach(([px, py, c]) => { x.fillStyle = c; x.fillRect(sx - 8 + px, sy - 17 + py + bob, 1, 1) }); return }
    if (owned(id) && DRAW[id]) DRAW[id](x);
  });
  if (mood === "enfermo") { x.fillStyle = "rgba(20,20,30,.45)"; x.fillRect(0, 0, 200, 150); x.fillStyle = "rgba(200,200,200,.5)"; for (let i = 0; i < 40; i++) x.fillRect((i * 53) % 200, (i * 37) % 150, 1, 1) }
}

/* ---------- Vistas ---------- */
function money(n) { return `<span class="coin"></span>${n}` }
function renderCasa() {
  const c = coins(), lv = level(), sickNow = mood === "enfermo";
  $("coinsHoy").innerHTML = money(c);
  if (tab === "casa") {
    $("roomNote").textContent = sickNow ? "Estás enfermo: la tienda está cerrada hasta que llegues hoy al 60 %." : `${MUEBLES.filter(m => !m.rarity && owned(m.id)).length} de ${MUEBLES.filter(m => !m.rarity).length} muebles · nivel ${lv}`;
    const list = casaTab === "muebles" ? MUEBLES : ROPA, g = $("shop"); g.innerHTML = "";
    list.filter(it => !it.rarity || owned(it.id)).forEach(it => {
      const have = casaTab === "muebles" ? owned(it.id) : owned(it.id), worn = casaTab === "ropa" && outfit[it.slot] === it.id;
      const lockLv = it.lv && lv < it.lv, lockNeed = it.needs && !owned(it.needs);
      const d = document.createElement("button"); d.className = "item" + (have ? " have" : ""); d.style.setProperty("--c", it.area ? `var(--${it.area})` : it.c); if (it.rarity) { d.classList.add("rare"); d.style.setProperty("--rc", RAREZA[it.rarity].c) }
      const sub = have ? (casaTab === "ropa" ? (worn ? "Puesto" : "Ponértelo") : "En tu casa") : lockLv ? `Nivel ${it.lv}` : lockNeed ? "Necesita escritorio" : "";
      d.innerHTML = `<i class="swatch"></i><b></b><small>${sub || money(it.cost)}</small>${it.rarity ? `<em>${RAREZA[it.rarity].name}</em>` : ""}`; d.querySelector("b").textContent = it.name;
      d.disabled = !have && (lockLv || lockNeed || sickNow || c < it.cost);
      d.onclick = () => have ? (casaTab === "ropa" && wear(it)) : buy(it, "item");
      g.append(d);
    });
  }
  if (tab === "premios") {
    const a = activePremio(), g = $("premios"); g.innerHTML = "";
    PREMIOS.forEach(p => {
      const d = document.createElement("button"); d.className = "premio";
      d.innerHTML = `<span class="ico">${p.ico}</span><span class="pt"><b></b><small>${c < p.cost ? `Te faltan ${p.cost - c} monedas` : `${p.min} min de temporizador`}</small></span><span class="cost">${money(p.cost)}</span>`; d.querySelector("b").textContent = p.name;
      d.disabled = !!a || sickNow || c < p.cost; d.onclick = () => buy(p, "premio"); g.append(d);
    });
    $("premioNote").textContent = sickNow ? "Estás enfermo: primero cúrate llegando hoy al 60 %." : a ? "Ya tienes un premio en marcha." : "Cada día perfecto da unos 140 de monedas: una hora de ocio bien ganada.";
  }
  renderCofres();
  renderTimer();
}

/* ---------- Cofres de racha ---------- */
function milestones() {
  let n = 0;
  for (const k of Object.keys(days).sort()) { if (k < START || frac(k) < .6) continue; if ((prevStreak(k) + 1) % 7 === 0) n++ }
  return n;
}
const opened = () => purchases.filter(p => p.kind === "cofre").length;
const chestsLeft = () => Math.max(0, milestones() - new Set(purchases.filter(p => p.kind === "cofre").map(p => p.minutes)).size);
function renderCofres() {
  const n = chestsLeft(), st = streak(), next = 7 - (st % 7 || (frac(dayKey(0)) >= .6 ? 7 : 0)) || 7;
  const chip = $("chestChip"); chip.hidden = !n; chip.textContent = "🎁 " + n;
  if (tab !== "casa") return;
  $("chestTitle").textContent = n ? (n === 1 ? "Tienes un cofre" : `Tienes ${n} cofres`) : "Cofre de racha";
  $("chestSub").textContent = n ? "Dentro hay un objeto raro que no se puede comprar." : `El próximo, al llegar a ${Math.ceil((st + 1) / 7) * 7} días de racha (vas por ${st}).`;
  $("chestBtn").hidden = !n;
  const b = $("bongoNote"); b.hidden = bongoUnlocked();
  b.textContent = `Bongo llega a tu casa con 14 días de racha (cofres conseguidos: ${milestones()} de 2).`;
}
function roll() {
  const r = Math.random(), rar = r < .07 ? "legendario" : r < .35 ? "epico" : "raro";
  const pool = [...ROPA, ...MUEBLES].filter(it => it.rarity === rar && !owned(it.id));
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
function openChest() {
  if (!chestsLeft()) return;
  const used = new Set(purchases.filter(p => p.kind === "cofre").map(p => p.minutes));
  let m = 1; while (used.has(m)) m++;
  const it = roll(), row = it ? { user_id: uid, item: it.id, kind: "cofre", cost: 0, minutes: m, at: new Date().toISOString() } : { user_id: uid, item: "monedas", kind: "cofre", cost: -150, minutes: m, at: new Date().toISOString() };
  const modal = $("chestModal"), box = $("chestBox"), res = $("chestResult");
  modal.hidden = false; res.hidden = true; box.className = "chest shake"; $("chestOpen").hidden = false;
  $("chestOpen").onclick = () => {
    $("chestOpen").hidden = true; box.className = "chest pop";
    setTimeout(() => {
      purchases = [...purchases, row]; box.className = "chest gone";
      const rz = it ? RAREZA[it.rarity] : { name: "Bolsa de monedas", c: "#ffb800" };
      res.style.setProperty("--rc", rz.c); res.hidden = false;
      $("chestRarity").textContent = rz.name; $("chestItem").textContent = it ? it.name : "+150 monedas";
      $("chestHint").textContent = it ? (it.slot ? "Ya lo llevas puesto. Puedes quitártelo en Casa → Ropa." : "Ya está en tu habitación.") : "Ya tenías todos los objetos de esta rareza.";
      if (it && it.slot) outfit = { ...outfit, [it.slot]: it.id };
      burst(res); renderCasa(); drawPet();
      write(() => sb.from("purchases").insert(row));
      if (it && it.slot) write(() => sb.from("profile").upsert({ user_id: uid, outfit, updated_at: new Date().toISOString() }, { onConflict: "user_id" }));
    }, 650);
  };
}
$("chestBtn").onclick = openChest;
$("chestClose").onclick = () => { $("chestModal").hidden = true };
$("chestChip").onclick = () => setTab("casa");
function renderTimer() {
  const a = activePremio(), el = $("timer");
  if (!a) { el.hidden = true; return }
  el.hidden = false; const left = Math.max(0, a.ends - Date.now()), m = Math.floor(left / 60e3), s = Math.floor(left / 1e3) % 60;
  const p = PREMIOS.find(x => x.id === a.item) || { name: "Premio", ico: "⏳" };
  el.innerHTML = `<span class="ico">${p.ico}</span><span class="pt"><b>${p.name}</b><small>Disfrútalo sin culpa</small></span><span class="clock">${m}:${String(s).padStart(2, "0")}</span>`;
}
setInterval(() => {
  const a = activePremio(); renderTimer();
  if (!a && window._wasActive) { window._wasActive = false; status("Se acabó el tiempo libre. A por el siguiente hábito."); try { navigator.serviceWorker.ready.then(r => r.showNotification("Levo", { body: "Se acabó tu tiempo libre. Vuelve a lo tuyo.", icon: "icon-192.png", tag: "premio" })) } catch (e) { } renderCasa() }
  if (a) window._wasActive = true;
}, 1000);

async function buy(it, kind) {
  if (!uid) return;
  const row = { user_id: uid, item: it.id, kind, cost: it.cost, minutes: it.min || null, at: new Date().toISOString() };
  purchases = [...purchases, row]; renderCasa(); burst($(kind === "premio" ? "premios" : "room"));
  status(kind === "premio" ? `Premio activado: ${it.name}.` : `Comprado: ${it.name}.`);
  if (kind === "item" && it.slot) wear(it);
  write(() => sb.from("purchases").insert(row));
}
function wear(it) {
  outfit = { ...outfit, [it.slot]: outfit[it.slot] === it.id ? undefined : it.id };
  Object.keys(outfit).forEach(k => outfit[k] === undefined && delete outfit[k]);
  renderCasa(); drawPet();
  write(() => sb.from("profile").upsert({ user_id: uid, outfit, updated_at: new Date().toISOString() }, { onConflict: "user_id" }));
}
async function loadCasa() {
  if (!uid || uid === "demo") { renderCasa(); return }
  const [p, o] = await Promise.all([sb.from("purchases").select("item,kind,cost,minutes,at").order("at"), sb.from("profile").select("outfit").maybeSingle()]);
  if (!p.error) purchases = p.data; if (!o.error && o.data) outfit = o.data.outfit || {};
  renderCasa(); drawPet();
}
function setTab(t) {
  tab = t; ["hoy", "casa", "premios"].forEach(n => { $("tab-" + n).hidden = n !== t; $("tb-" + n).setAttribute("aria-selected", n === t) });
  window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" }); renderCasa(); drawPet();
}
["hoy", "casa", "premios"].forEach(n => $("tb-" + n).onclick = () => setTab(n));
document.querySelectorAll("[data-shop]").forEach(b => b.onclick = () => { casaTab = b.dataset.shop; document.querySelectorAll("[data-shop]").forEach(x => x.setAttribute("aria-selected", x === b)); renderCasa() });
window.onRendered = renderCasa;
window.loadCasa = loadCasa;

if (uid === "demo") { milestones = () => 2; purchases = ["alfombra","cama","escritorio","setup","planta","estanteria","gorra-negra","cadena-oro"].map(item => ({ item, kind: "item", cost: 0, at: "2026-10-17T10:00:00Z" })); outfit = { gorra: "gorra-negra", cadena: "cadena-oro" } }
renderCasa(); drawPet();
