/* Levo · Habitación estilo Habbo, tienda, premios, ruta de niveles e insignias.
   Usa el estado global de index.html (habits, days, frac, dayKey, sb, uid, AREAS, mood, blink…). */
let purchases = [], outfit = {}, casaTab = "muebles", tab = "hoy";

/* ---------- Catálogo ---------- */
const ROPA = [
  { id: "gorra-negra", slot: "gorra", name: "Gorra negra", cost: 60, c: "#1c1c1e" },
  { id: "gorra-roja", slot: "gorra", name: "Gorra roja", cost: 80, c: "#ff2d55" },
  { id: "gorro-lana", slot: "gorra", name: "Gorro de lana", cost: 120, c: "#5e5ce6" },
  { id: "gafas-sol", slot: "gafas", name: "Gafas de sol", cost: 90, c: "#0b0b0f", fill: true },
  { id: "gafas-pasta", slot: "gafas", name: "Gafas de pasta", cost: 70, c: "#7a4a24" },
  { id: "sudadera-negra", slot: "top", name: "Sudadera negra", cost: 150, c: "#2c2c30" },
  { id: "chandal-verde", slot: "top", name: "Chándal verde", cost: 160, c: "#30d158" },
  { id: "sudadera-levo", slot: "top", name: "Sudadera Levo", cost: 220, c: "#ff9f0a" },
  { id: "vaqueros", slot: "pant", name: "Vaqueros", cost: 90, c: "#3b6fd8" },
  { id: "pantalon-blanco", slot: "pant", name: "Pantalón blanco", cost: 110, c: "#ececf0" },
  { id: "zapas-blancas", slot: "zapas", name: "Zapatillas blancas", cost: 100, c: "#f5f5f7" },
  { id: "zapas-rojas", slot: "zapas", name: "Zapatillas rojas", cost: 120, c: "#ff3b30" },
  { id: "cadena-oro", slot: "cadena", name: "Cadena de oro", cost: 250, c: "#ffd60a" },
  { id: "gorra-holo", slot: "gorra", name: "Gorra holográfica", rarity: "raro", c: "#64d2ff" },
  { id: "zapas-neon", slot: "zapas", name: "Zapatillas neón", rarity: "raro", c: "#32d74b" },
  { id: "sudadera-galaxia", slot: "top", name: "Sudadera galaxia", rarity: "epico", c: "#6e3cff" },
  { id: "gafas-cyber", slot: "gafas", name: "Gafas cyber", rarity: "epico", c: "#ff2d55", fill: true },
  { id: "corona", slot: "gorra", name: "Corona", rarity: "legendario", c: "#ffd60a" },
  { id: "aura", slot: "aura", name: "Aura dorada", rarity: "legendario", c: "#ffcc00" },
  { id: "gorra-dorada", slot: "gorra", name: "Gorra dorada", lvGift: 8, c: "#ffc300" },
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
  { id: "cuadro", area: "vida", name: "Foto de familia", cost: 80, lv: 2 },
  { id: "saco", area: "cuerpo", name: "Saco de boxeo", cost: 180, lv: 3 },
  { id: "hucha", area: "vida", name: "Hucha", cost: 120, lv: 3 },
  { id: "sofa", area: "vida", name: "Sofá", cost: 200, lv: 3 },
  { id: "setup", area: "trabajo", name: "Setup de 3 pantallas", cost: 300, lv: 4, needs: "escritorio" },
  { id: "neon", name: "Neón LEVO", rarity: "raro", c: "#ff2d55" },
  { id: "colgantes", name: "Plantas colgantes", rarity: "raro", c: "#30d158" },
  { id: "arcade", name: "Máquina arcade", rarity: "epico", c: "#5e5ce6" },
  { id: "acuario", name: "Acuario", rarity: "epico", c: "#0a84ff" },
  { id: "trofeo", name: "Trofeo de oro", rarity: "legendario", c: "#ffd60a" },
  { id: "poster", name: "Póster Levo", lvGift: 2, c: "#ff2d55" },
  { id: "lava", name: "Lámpara de lava", lvGift: 3, c: "#af52de" },
  { id: "nevera", name: "Nevera retro", lvGift: 5, c: "#64d2ff" },
  { id: "dj", name: "Mesa de DJ", lvGift: 10, c: "#1c1c1e" },
  { id: "trono", name: "Trono", lvGift: 15, c: "#ffd60a" },
  { id: "estatua", name: "Estatua de oro", lvGift: 20, c: "#ffc300" },
];
const ESTILOS = [
  { id: "pared-lavanda", slot: "pared", name: "Pared lavanda", cost: 0, c: "#c9c2e0", base: true },
  { id: "pared-menta", slot: "pared", name: "Papel pintado menta", cost: 80, c: "#9fe3c8" },
  { id: "pared-coral", slot: "pared", name: "Papel pintado coral", cost: 80, c: "#ffb4a2" },
  { id: "pared-azul", slot: "pared", name: "Papel pintado azul noche", lvGift: 4, c: "#3a4f9a" },
  { id: "pared-galaxia", slot: "pared", name: "Papel pintado galaxia", lvGift: 12, c: "#2b1d5c", stars: true },
  { id: "suelo-madera", slot: "suelo", name: "Suelo de madera", cost: 0, c: "#d9a86c", base: true },
  { id: "suelo-blanco", slot: "suelo", name: "Baldosa blanca", cost: 90, c: "#e9e9ee" },
  { id: "suelo-cesped", slot: "suelo", name: "Césped", cost: 120, c: "#5cc85c" },
  { id: "suelo-damero", slot: "suelo", name: "Suelo de damero", lvGift: 6, c: "#ffffff", check: "#1c1c1e" },
];
const RUTA = [...MUEBLES, ...ROPA, ...ESTILOS].filter(i => i.lvGift).sort((a, b) => a.lvGift - b.lvGift);
const RAREZA = { raro: { name: "Raro", c: "#0a84ff" }, epico: { name: "Épico", c: "#af52de" }, legendario: { name: "Legendario", c: "#ffb800" } };
const PREMIOS = [
  { id: "redes15", name: "15 min de Instagram o YouTube", cost: 40, min: 15, ico: "📱" },
  { id: "descanso30", name: "30 min de descanso total", cost: 60, min: 30, ico: "☕" },
  { id: "ocio60", name: "1 h de serie o videojuego", cost: 120, min: 60, ico: "🎮" },
  { id: "tarde", name: "Tarde libre (4 h)", cost: 400, min: 240, ico: "🌅" },
];
const ALL = [...ROPA, ...MUEBLES, ...ESTILOS];

/* ---------- Monedas, nivel y propiedad ---------- */
function prevStreak(k) { let n = 0, d = new Date(k + "T12:00:00"); for (let i = 0; i < 60; i++) { d.setDate(d.getDate() - 1); if (okDay(fmt(d))) n++; else break } return n }
function earned() {
  let c = 0;
  for (const k in days) {
    if (k < START) continue;
    const n = habits.filter(h => doneFor(k)[h.id]).length, f = frac(k);
    let e = 5 * n + (f >= .6 ? 20 : 0) + (f === 1 ? 50 : 0);
    if (prevStreak(k) >= 7) e *= 2;
    if (HARD) e = Math.round(e * 1.5);
    c += e;
  }
  return c;
}
const spent = () => purchases.reduce((t, p) => t + p.cost, 0);
const coins = () => Math.max(0, earned() - spent());
const level = () => Math.floor(xp() / 150) + 1;
const owned = id => { if (window._ownSet) return window._ownSet.has(id); const it = ALL.find(i => i.id === id); if (it && it.base) return true; if (it && it.lvGift) return level() >= it.lvGift; return purchases.some(p => (p.kind === "item" || p.kind === "cofre") && p.item === id) };
const activePremio = () => { const now = Date.now(); return purchases.filter(p => p.kind === "premio").map(p => ({ ...p, ends: Date.parse(p.at) + p.minutes * 60e3 })).find(p => p.ends > now) };

/* ---------- Escudos de racha y días de rescate ---------- */
const ESCUDO = { id: "escudo", name: "Escudo de racha", cost: 100 };
const shieldsTotal = () => 1 + purchases.filter(p => p.kind === "escudo").length;
let _prot = null, _protKey = null;
function protection() {
  const today = dayKey(0), key = [days, purchases, today];
  if (_prot && _protKey && _protKey.every((v, i) => v === key[i])) return _prot;
  let left = shieldsTotal(); const st = {}; const d = new Date(START + "T12:00:00");
  while (fmt(d) < today) {
    const k = fmt(d), n = new Date(d); n.setDate(n.getDate() + 1); const nk = fmt(n);
    if (frac(k) >= .6) st[k] = "ok";
    else if (frac(nk) === 1) st[k] = "rescate";
    else if (left > 0) { left--; st[k] = "escudo" }
    else st[k] = "fallo";
    d.setDate(d.getDate() + 1);
  }
  _protKey = key; return _prot = { st, left };
}
okDay = function (k) { if (k < START || k >= dayKey(0)) return frac(k) >= .6; return protection().st[k] !== "fallo" };
window.dayState = k => (k < START || k >= dayKey(0)) ? "" : (protection().st[k] || "");
const shieldsLeft = () => protection().left;
/* Huecos de hábitos: 3 al empezar y 2 más por nivel */
const slotsTotal = () => 3 + 2 * (level() - 1);
window.slotsLeft = () => slotsTotal() - habits.length;
window.slotsMsg = () => { const need = Math.ceil((habits.length + 1 - 3) / 2) + 1; return `Tienes ${habits.length} de ${slotsTotal()} huecos. El siguiente se abre en el nivel ${need}.` };
function renderRescue() {
  const el = $("rescue"); if (!el || !uid || !habits.length) { if (el) el.hidden = true; return }
  const y = dayKey(-1), s = window.dayState(y), today = Math.round(frac(dayKey(0)) * 100);
  if (s === "escudo" || s === "fallo") {
    el.hidden = false; el.className = "rescue " + s;
    el.innerHTML = `<i>${s === "escudo" ? "🛡️" : "🆘"}</i><div class="pt"><b>${s === "escudo" ? "Ayer te salvó un escudo" : "Ayer se rompió tu racha"}</b><small>${s === "escudo" ? "Llega hoy al 100 % y lo recuperas." : "Llega hoy al 100 % y la rescatas."} Vas por el ${today} %.</small></div>`;
  } else if (s === "rescate" && frac(dayKey(0)) === 1) {
    el.hidden = false; el.className = "rescue ok"; el.innerHTML = `<i>✨</i><div class="pt"><b>Racha rescatada</b><small>Has convertido un mal día en una victoria.</small></div>`;
  } else el.hidden = true;
}

/* ---------- Personaje estilo Habbo ---------- */
const OUT = "#1b1b1f";
const SKINS = ["#f6cfae", "#eab38c", "#c98b5f", "#9a6440", "#6b4329"];
const HAIRS = ["#2a1c14", "#5b3a22", "#a8692e", "#e3b25b", "#c43c2c", "#1f2a52", "#e9e9ee"];
const LOOK_DEF = { skin: 0, hs: "corto", hc: 0, beard: "no", glasses: "no" };
function rect(x, a, b, w, h, c) { x.fillStyle = c; x.fillRect(Math.round(a), Math.round(b), w, h) }
function orect(x, a, b, w, h, c) { rect(x, a - 1, b - 1, w + 2, h + 2, OUT); rect(x, a, b, w, h, c) }
/* fx, fy = posición de los pies. frame alterna las piernas al andar. */
function drawAvatar(x, fx, fy, o = outfit, md = mood, bl = blink, frame = 0, wave = false) {
  const lk = { ...LOOK_DEF, ...(o._look || {}) };
  const skin = SKINS[lk.skin] || SKINS[0], skinD = shade(skin, .86), hair = HAIRS[lk.hc] || HAIRS[0];
  const top = (ALL.find(r => r.id === o.top) || {}).c || (md === "enfermo" ? "#98989f" : "#ff2d55");
  const pant = (ALL.find(r => r.id === o.pant) || {}).c || "#2d3a5a";
  const shoe = (ALL.find(r => r.id === o.zapas) || {}).c || "#3a3a3c";
  const L = Math.round(fx - 7), T = Math.round(fy - 36);
  // sombra
  x.fillStyle = "rgba(0,0,0,.28)"; x.beginPath(); x.ellipse(fx, fy, 8, 3, 0, 0, Math.PI * 2); x.fill();
  if (o.aura) { const g = x.createRadialGradient(fx, fy - 18, 3, fx, fy - 18, 22); g.addColorStop(0, "rgba(255,214,10,.6)"); g.addColorStop(1, "rgba(255,214,10,0)"); x.fillStyle = g; x.fillRect(fx - 24, fy - 42, 48, 48) }
  // piernas y zapatos
  const lu = frame === 1 ? -1 : 0, ru = frame === 2 ? -1 : 0;
  orect(x, L + 4, T + 27 + lu, 3, 7, pant); orect(x, L + 8, T + 27 + ru, 3, 7, pant);
  orect(x, L + 3, T + 33 + lu, 4, 2, shoe); orect(x, L + 8, T + 33 + ru, 4, 2, shoe);
  // brazo de atrás, cuerpo y brazo de delante
  orect(x, L + 1, T + 17, 2, 8, top); rect(x, L + 1, T + 24, 2, 2, skin);
  orect(x, L + 3, T + 16, 9, 12, top); rect(x, L + 3, T + 25, 9, 3, shade(top.startsWith("#") ? top : "#888888", .82));
  if (o.cadena) { rect(x, L + 5, T + 17, 1, 2, "#ffd60a"); rect(x, L + 6, T + 19, 3, 1, "#ffd60a"); rect(x, L + 9, T + 17, 1, 2, "#ffd60a") }
  if (wave) { orect(x, L + 12, T + 9, 2, 8, top); rect(x, L + 12, T + 7, 2, 2, skin) } else { orect(x, L + 12, T + 17, 2, 8, top); rect(x, L + 12, T + 24, 2, 2, skin) }
  // cabeza grande (vista 3/4)
  orect(x, L + 1, T + 3, 13, 13, skin); rect(x, L + 1, T + 13, 13, 3, skinD); rect(x, L + 6, T + 15, 4, 1, skinD);
  rect(x, L + 0, T + 8, 1, 3, skin); rect(x, L - 1, T + 8, 1, 3, OUT); // oreja
  // pelo
  const g = ALL.find(r => r.id === o.gorra);
  if (!g || g.id === "corona") {
    if (lk.hs === "corto") { rect(x, L, T + 1, 15, 4, OUT); rect(x, L + 1, T + 2, 13, 3, hair); rect(x, L + 1, T + 5, 3, 4, hair); rect(x, L, T + 5, 1, 5, OUT) }
    else if (lk.hs === "rapado") { rect(x, L + 1, T + 2, 13, 3, OUT); rect(x, L + 2, T + 3, 11, 2, shade(hair, 1.15)); rect(x, L + 1, T + 5, 2, 3, shade(hair, 1.15)) }
    else if (lk.hs === "largo") { rect(x, L - 1, T + 1, 16, 5, OUT); rect(x, L, T + 2, 14, 3, hair); rect(x, L - 1, T + 5, 5, 13, OUT); rect(x, L, T + 5, 3, 12, hair); rect(x, L + 13, T + 5, 2, 7, OUT); rect(x, L + 13, T + 5, 1, 6, hair) }
    else if (lk.hs === "rizado") { [1, 4, 7, 10, 13].forEach(a => { rect(x, L + a - 2, T - 1, 5, 5, OUT); rect(x, L + a - 1, T, 3, 3, hair) }); rect(x, L, T + 2, 15, 4, OUT); rect(x, L + 1, T + 2, 13, 3, hair); rect(x, L + 1, T + 5, 3, 4, hair); rect(x, L, T + 5, 1, 5, OUT) }
    else if (lk.hs === "calvo") { rect(x, L + 4, T + 4, 4, 1, shade(skin, 1.12)) }
  }
  if (g && g.id === "corona") { [[2, -3], [6, -4], [10, -3]].forEach(([a, b]) => orect(x, L + a, T + b, 3, 4, g.c)); orect(x, L + 1, T - 1, 13, 3, g.c); rect(x, L + 6, T, 3, 1, "#ff2d55") }
  else if (g) { orect(x, L + 1, T, 13, 5, g.c); rect(x, L + 1, T + 4, 13, 1, shade(g.c, .75)); if (g.id === "gorro-lana") { orect(x, L + 6, T - 3, 3, 2, "#ffffff") } else orect(x, L + 10, T + 4, 7, 2, g.c); if (g.id === "gorra-holo") rect(x, L + 3, T + 1, 6, 1, "#ffffff") }
  // barba
  if (lk.beard === "corta") { x.globalAlpha = .55; rect(x, L + 3, T + 13, 11, 3, hair); x.globalAlpha = 1 }
  if (lk.beard === "completa") { rect(x, L + 2, T + 10, 2, 5, hair); rect(x, L + 3, T + 13, 11, 3, hair); rect(x, L + 7, T + 11, 6, 1, hair); rect(x, L + 4, T + 16, 9, 1, OUT) }
  // ojos y boca
  const eyesClosed = bl || md === "agotado" || md === "enfermo";
  [[7, 9], [11, 9]].forEach(([a, b]) => { if (eyesClosed) rect(x, L + a, T + b + 1, 2, 1, OUT); else { rect(x, L + a, T + b, 2, 2, OUT); rect(x, L + a, T + b, 1, 1, "#ffffff") } });
  const gf = ALL.find(r => r.id === o.gafas) || (lk.glasses === "pasta" ? { c: "#1c1c1e" } : lk.glasses === "sol" ? { c: "#0b0b0f", fill: true } : null);
  if (gf) { rect(x, L + 6, T + 8, 4, gf.fill ? 3 : 1, gf.c); rect(x, L + 10, T + 8, 4, gf.fill ? 3 : 1, gf.c); if (!gf.fill) { rect(x, L + 6, T + 8, 1, 3, gf.c); rect(x, L + 9, T + 8, 1, 3, gf.c); rect(x, L + 10, T + 8, 1, 3, gf.c); rect(x, L + 13, T + 8, 1, 3, gf.c) } rect(x, L + 4, T + 8, 2, 1, gf.c) }
  const M = { feliz: [[8, 12, 4, 1], [7, 11, 1, 1], [12, 11, 1, 1]], ok: [[8, 12, 4, 1]], triste: [[8, 12, 4, 1], [7, 13, 1, 1], [12, 13, 1, 1]], agotado: [[9, 12, 2, 1]], enfermo: [[8, 12, 1, 1], [9, 13, 1, 1], [10, 12, 1, 1], [11, 13, 1, 1]] }[md] || [[8, 12, 4, 1]];
  M.forEach(([a, b, w, h]) => rect(x, L + a, T + b, w, h, "#8a3b2a"));
  if (md === "feliz") rect(x, L + 12, T + 11, 2, 1, "#ff9aa2");
}
/* Bongo: perrito negro con mancha blanca y collar naranja (escala 2) */
const BONGO = ["K..K..........", "KKKK..........", "KWKKK........T", "KKKKK.......T.", "KKKKKKKKKKKKK.", ".OOKKKKKKKKKK.", ".KWWKKKKKKKKK.", ".KWKKKKKKKKKK.", ".KK.KK...KK.KK", ".KK.KK...KK.KK"];
function drawBongo(x, sx, sy) {
  const sad = mood === "enfermo" || mood === "agotado" || mood === "triste", wag = !sad && Math.floor(Date.now() / 250) % 2;
  const col = { K: "#1a1a1a", W: "#ffffff", O: "#ff9f0a", T: "#1a1a1a" };
  x.fillStyle = "rgba(0,0,0,.25)"; x.beginPath(); x.ellipse(sx + 14, sy + 20, 12, 3, 0, 0, Math.PI * 2); x.fill();
  BONGO.forEach((r, y) => [...r].forEach((k, i) => {
    if (k === ".") return; let yy = y;
    if (k === "T") { if (sad) return; yy = wag ? y : y + 1 }
    if (sad && y < 2) yy = y + 2;
    if (sad && y >= 8) return;
    x.fillStyle = col[k]; x.fillRect(sx + i * 2, sy + (yy + (sad ? 2 : 0)) * 2, 2, 2);
  }));
}

/* ---------- Habitación isométrica estilo Habbo ---------- */
const RW = 240, RH = 190, TW = 16, TH = 8, ZK = 1.35;
let OX = 120, OY = 84;
const P = (x, y, z = 0) => [OX + (x - y) * TW, OY + (x + y) * TH - z * ZK];
function shade(hex, f) { if (!hex.startsWith("#")) return hex; const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255; const m = v => Math.max(0, Math.min(255, Math.round(f > 1 ? v + (255 - v) * (f - 1) : v * f))); return `rgb(${m(r)},${m(g)},${m(b)})` }
function poly(x, pts, c, line) { x.fillStyle = c; x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.closePath(); x.fill(); if (line) { x.strokeStyle = line; x.lineWidth = 1; x.stroke() } }
function box(x, gx, gy, w, d, h, c, z0 = 0) {
  const o = "rgba(20,16,30,.75)";
  poly(x, [P(gx, gy + d, z0), P(gx + w, gy + d, z0), P(gx + w, gy + d, z0 + h), P(gx, gy + d, z0 + h)], shade(c, .8), o);
  poly(x, [P(gx + w, gy, z0), P(gx + w, gy + d, z0), P(gx + w, gy + d, z0 + h), P(gx + w, gy, z0 + h)], shade(c, .62), o);
  poly(x, [P(gx, gy, z0 + h), P(gx + w, gy, z0 + h), P(gx + w, gy + d, z0 + h), P(gx, gy + d, z0 + h)], shade(c, 1.14), o);
}
function wallRect(x, y0, y1, z0, z1, c, gx = 0) { poly(x, [P(gx, y0, z1), P(gx, y1, z1), P(gx, y1, z0), P(gx, y0, z0)], c, "rgba(20,16,30,.7)") }
function backRect(x, x0, x1, z0, z1, c) { poly(x, [P(x0, 0, z1), P(x1, 0, z1), P(x1, 0, z0), P(x0, 0, z0)], c, "rgba(20,16,30,.7)") }
/* d = profundidad para ordenar (más alto = más delante). w: va en la pared. f: va en el suelo, debajo de todo. */
const FURN = {
  alfombra: { f: 1, draw: x => box(x, 1.6, 1.8, 2.8, 2.6, .6, "#ff9f0a") },
  esterilla: { f: 1, draw: x => box(x, 4.3, 2.4, 1, 2, .8, "#7d7aff") },
  cuadro: { w: 1, draw: x => { backRect(x, 1, 2.2, 22, 34, "#ffffff"); backRect(x, 1.12, 2.08, 23.5, 32.5, "#ff9f0a"); backRect(x, 1.4, 1.8, 25, 29, "#ffd9a8") } },
  poster: { w: 1, draw: x => { wallRect(x, 4.3, 5.5, 16, 34, "#ff2d55"); wallRect(x, 4.5, 5.3, 26, 30, "#ffffff") } },
  neon: { w: 1, draw: x => { const t = Date.now() / 400; x.save(); x.shadowColor = "#ff2d55"; x.shadowBlur = 8 + Math.sin(t) * 3; backRect(x, 3.1, 5.4, 31, 38, "#ff2d55"); x.restore(); backRect(x, 3.3, 5.2, 32.5, 36.5, "#ffd1dc") } },
  colgantes: { w: 1, draw: x => { [[0, 1.2], [0, 4.6]].forEach(([gx, gy]) => { box(x, gx, gy, .5, .5, 3, "#d2691e", 38); box(x, gx, gy, .6, .6, 8, "#30d158", 30) }) } },
  estanteria: { d: 1.0, draw: x => { box(x, 0, .9, .6, 1.6, 26, "#9c6b3f"); [6, 13, 20].forEach((z, i) => box(x, .5, 1.0, .15, 1.4, 4, ["#ff2d55", "#0a84ff", "#30d158"][i], z)) } },
  trofeo: { d: 1.8, draw: x => { box(x, 1.4, .3, .6, .6, 6, "#e5e5ea"); box(x, 1.5, .4, .4, .4, 6, "#ffd60a", 6); box(x, 1.45, .35, .5, .5, 2, "#ffb800", 12) } },
  escritorio: { d: 2.2, draw: x => { box(x, 2, 0, 2.6, 1.1, 10, "#b98b5e") } },
  setup: { d: 2.3, draw: x => { [2.15, 2.95, 3.75].forEach(gx => { box(x, gx, .15, .7, .12, 7, "#16161a", 10); box(x, gx + .05, .27, .6, .02, 5.5, "#0a84ff", 10.8) }) } },
  dj: { d: 2.4, draw: x => { box(x, 2.1, 1.2, 1.6, .7, 9, "#1c1c1e"); box(x, 2.3, 1.3, .5, .5, 1, "#ff2d55", 9); box(x, 3, 1.3, .5, .5, 1, "#64d2ff", 9) } },
  planta: { d: 5.3, draw: x => { box(x, 5.3, .2, .6, .6, 3, "#d2691e"); box(x, 5.15, .05, .9, .9, 7, "#30d158", 3); box(x, 5.35, .25, .5, .5, 4, "#28b44c", 10) } },
  hucha: { d: 5.2, draw: x => box(x, 4.7, .5, .55, .4, 4, "#ff7eb6") },
  nevera: { d: 3.2, draw: () => { } },
  saco: { d: 6.1, draw: x => { box(x, 5.2, 1.15, .05, .05, 12, "#8e8e93", 20); box(x, 5, 1, .55, .55, 16, "#c62828", 6) } },
  arcade: { d: 7.7, draw: x => { box(x, 5.2, 2.5, .8, .8, 18, "#5e5ce6"); box(x, 5.15, 2.6, .05, .6, 7, "#64d2ff", 9); box(x, 5.1, 2.6, .1, .6, 2, "#ff2d55", 6) } },
  lava: { d: 7.0, draw: x => { box(x, 5.4, 3.4, .35, .35, 3, "#3a3a3c"); x.save(); x.shadowColor = "#af52de"; x.shadowBlur = 6; box(x, 5.42, 3.42, .3, .3, 9, "#bf5af2", 3); x.restore() } },
  silla: { d: 4.6, draw: x => { box(x, 3, 1.5, .8, .8, 6, "#ff3b30"); box(x, 3, 2.15, .8, .15, 12, "#c81e1e", 6) } },
  cama: { d: 3.4, draw: x => { box(x, 0, 3.2, 1.8, 2.8, 5, "#8b5a2b"); box(x, 0, 3.2, 1.8, 2.8, 3, "#f5f5f7", 5); box(x, 0, 3.3, 1.8, .7, 2, "#cfe3ff", 8); box(x, 0, 4.2, 1.8, 1.8, 1.2, "#ff375f", 8) } },
  lampara: { d: 5.8, draw: x => { box(x, .3, 5.5, .15, .15, 20, "#8e8e93"); box(x, .1, 5.3, .55, .55, 3, "#ffd60a", 20) } },
  trono: { d: 7.7, draw: () => { } },
  mancuernas: { d: 9.6, draw: x => { box(x, 5.3, 4.3, .3, .5, 2, "#3a3a3c"); box(x, 5.3, 5.1, .3, .5, 2, "#3a3a3c") } },
  acuario: { d: 7.4, draw: x => { box(x, 2.2, 5.2, 1.2, .6, 4, "#3a3a3c"); x.globalAlpha = .75; box(x, 2.2, 5.2, 1.2, .6, 7, "#64d2ff", 4); x.globalAlpha = 1; const t = Math.floor(Date.now() / 500) % 2; x.fillStyle = "#ff9f0a"; const [fx, fy] = P(2.6 + t * .3, 5.8, 8); x.fillRect(fx, fy, 3, 2) } },
  sofa: { d: 8.2, draw: x => { box(x, 3.4, 4.8, 2.3, 1, 5, "#5e5ce6"); box(x, 3.4, 5.55, 2.3, .3, 11, "#4b49c9") } },
  estatua: { d: 9.0, draw: x => { box(x, 1.9, 4.9, .8, .8, 6, "#e5e5ea"); box(x, 2.05, 5.05, .5, .5, 14, "#ffc300", 6); box(x, 2.0, 5.0, .6, .6, 5, "#ffd60a", 20) } },
};
// muebles que necesitan algo más de detalle
FURN.nevera.draw = x => { box(x, .1, 2.6, .8, .8, 20, "#64d2ff"); box(x, .9, 2.65, .02, .7, 1, "#ffffff", 12); box(x, .9, 2.65, .02, .2, 4, "#e5e5ea", 14) };
FURN.nevera.d = 3.2;
FURN.trono.draw = x => { box(x, 4.4, 3.3, 1, 1, 6, "#ffd60a"); box(x, 4.4, 4.15, 1, .2, 18, "#ffc300", 6); box(x, 4.5, 3.4, .8, .8, 1.5, "#ff2d55", 6) };
FURN.trono.d = 7.7;

/* Caminar por la habitación */
const FREE = [[3.2, 3.2], [2.4, 2.4], [2.2, 3.9], [3.8, 3.8], [2.8, 4.4], [4.0, 2.8], [3.4, 2.6]];
const me = { x: 3.2, y: 3.2, tx: 3.2, ty: 3.2, wait: 2, step: 0, wave: 0 };
function walkTick(dt) {
  const still2 = mood === "enfermo" || mood === "agotado";
  if (me.wait > 0) { me.wait -= dt; if (me.wait <= 0 && !still2) { const t = FREE[Math.floor(Math.random() * FREE.length)]; me.tx = t[0]; me.ty = t[1] } return }
  const dx = me.tx - me.x, dy = me.ty - me.y, dist = Math.hypot(dx, dy);
  if (dist < .05) { me.x = me.tx; me.y = me.ty; me.wait = 2 + Math.random() * 4; if (mood === "feliz" && Math.random() < .5) me.wave = 1.2; return }
  const v = 1.1 * dt; me.x += dx / dist * Math.min(v, dist); me.y += dy / dist * Math.min(v, dist); me.step += dt * 6;
}
function styleOf(slot, def) { return ESTILOS.find(e => e.id === outfit[slot] && owned(e.id)) || ESTILOS.find(e => e.id === def) }
function drawShell(x, wall, floor) {
  x.clearRect(0, 0, RW, RH);
  const H = 54;
  // paredes con borde superior grueso (estilo Habbo)
  poly(x, [P(0, 0, 0), P(6, 0, 0), P(6, 0, H), P(0, 0, H)], shade(wall.c, 1.05), "rgba(20,16,30,.8)");
  poly(x, [P(0, 0, 0), P(0, 6, 0), P(0, 6, H), P(0, 0, H)], shade(wall.c, .86), "rgba(20,16,30,.8)");
  if (wall.stars) { for (let i = 0; i < 26; i++) { const sx = (i * 47) % 1, gx = (i * 0.231) % 6, z = 8 + (i * 13) % 42; const [a, b] = i % 2 ? P(gx, 0, z) : P(0, gx, z); x.fillStyle = i % 3 ? "#ffffff" : "#ffd60a"; x.fillRect(a, b, 1, 1) } }
  poly(x, [P(0, 0, H), P(6, 0, H), P(6, -.25, H), P(-.25, -.25, H)], shade(wall.c, 1.25), "rgba(20,16,30,.8)");
  poly(x, [P(0, 0, H), P(0, 6, H), P(-.25, 6, H), P(-.25, -.25, H)], shade(wall.c, 1.15), "rgba(20,16,30,.8)");
  // ventana con vistas a Murcia (pared izquierda)
  wallRect(x, 2.2, 3.8, 20, 38, "#8fd3ff"); wallRect(x, 2.95, 3.05, 20, 38, "#ffffff"); wallRect(x, 2.2, 3.8, 28.5, 29.5, "#ffffff");
  wallRect(x, 3.3, 3.55, 21, 33, "#b0723a");
  // puerta (pared del fondo)
  backRect(x, 4.6, 5.6, 0, 30, "#8a5a3c"); x.fillStyle = "#ffd60a"; const [kx, ky] = P(5.45, 0, 15); x.fillRect(kx, ky, 2, 2);
  // suelo con baldosas
  poly(x, [P(0, 0), P(6, 0), P(6, 6), P(0, 6)], floor.c, "rgba(20,16,30,.8)");
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { const alt = (i + j) % 2; if (floor.check ? alt : alt && true) poly(x, [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)], floor.check ? floor.check : shade(floor.c, .93)) }
  // grosor del suelo
  poly(x, [P(6, 0), P(6, 6), P(6, 6, -6), P(6, 0, -6)], shade(floor.c, .55), "rgba(20,16,30,.8)");
  poly(x, [P(0, 6), P(6, 6), P(6, 6, -6), P(0, 6, -6)], shade(floor.c, .7), "rgba(20,16,30,.8)");
}
function drawRoom(cv) {
  if (!cv) return; const x = cv.getContext("2d"); x.imageSmoothingEnabled = false;
  drawShell(x, styleOf("pared", "pared-lavanda"), styleOf("suelo", "suelo-madera"));
  const items = Object.keys(FURN).filter(id => owned(id));
  items.filter(id => FURN[id].w || FURN[id].f).forEach(id => FURN[id].draw(x));
  const list = items.filter(id => !FURN[id].w && !FURN[id].f).map(id => ({ d: FURN[id].d, draw: () => FURN[id].draw(x) }));
  const fr = (me.wait > 0) ? 0 : (Math.floor(me.step) % 2 ? 1 : 2);
  list.push({ d: me.x + me.y, draw: () => { const [ax, ay] = P(me.x, me.y); drawAvatar(x, ax, ay, outfit, mood, blink, fr, me.wave > 0) } });
  if (bongoUnlocked()) list.push({ d: 8.0, draw: () => { const [bx, by] = P(4.4, 3.6); drawBongo(x, bx - 14, by - 20) } });
  list.sort((a, b) => a.d - b.d).forEach(o => o.draw());
  if (window.roomExtras) roomExtras(x);
  if (mood === "enfermo") { x.fillStyle = "rgba(10,10,25,.45)"; x.fillRect(0, 0, RW, RH); x.fillStyle = "rgba(220,220,220,.5)"; for (let i = 0; i < 60; i++) x.fillRect((i * 53) % RW, (i * 37) % RH, 1, 1) }
}
/* Bocadillo de texto encima del personaje */
function placeBubble() {
  const cv = $("room"), b = $("bubble"); if (!cv || !b || cv.offsetParent === null) return;
  const [ax, ay] = P(me.x, me.y), k = cv.clientWidth / RW;
  b.style.left = Math.max(8, Math.min(cv.clientWidth - b.offsetWidth - 8, ax * k - b.offsetWidth / 2)) + "px";
  b.style.top = Math.max(6, (ay - 44) * k - b.offsetHeight) + "px";
  const t = $("say").textContent; if (b.dataset.t !== t) { b.dataset.t = t; b.querySelector("span").textContent = t }
}
let lastT = performance.now();
function loop(t) {
  const dt = Math.min(.1, (t - lastT) / 1000); lastT = t;
  walkTick(dt); if (me.wave > 0) me.wave -= dt;
  if (document.visibilityState === "visible") { drawRoom($("room")); placeBubble() }
  requestAnimationFrame(loop);
}
drawPet = function () { /* el personaje vive en la habitación */ };

/* ---------- Miniaturas de objetos (para tienda, ruta y siguiente premio) ---------- */
const iconCache = {};
function iconFor(it) {
  if (iconCache[it.id]) return iconCache[it.id];
  const c = document.createElement("canvas"); c.width = RW; c.height = RH; const x = c.getContext("2d");
  if (it.slot === "pared" || it.slot === "suelo") drawShell(x, it.slot === "pared" ? it : ESTILOS[0], it.slot === "suelo" ? it : ESTILOS[5]);
  else if (it.slot) drawAvatar(x, 120, 120, { [it.slot]: it.id }, "feliz", false);
  else if (FURN[it.id]) FURN[it.id].draw(x);
  const d = x.getImageData(0, 0, RW, RH).data; let x0 = RW, y0 = RH, x1 = 0, y1 = 0;
  for (let y = 0; y < RH; y++) for (let i = 0; i < RW; i++) if (d[(y * RW + i) * 4 + 3] > 10) { if (i < x0) x0 = i; if (i > x1) x1 = i; if (y < y0) y0 = y; if (y > y1) y1 = y }
  if (x1 < x0) return "";
  const w = x1 - x0 + 1, h = y1 - y0 + 1, s = Math.max(1, Math.floor(56 / Math.max(w, h))), o = document.createElement("canvas");
  o.width = 64; o.height = 64; const ox = o.getContext("2d"); ox.imageSmoothingEnabled = false;
  ox.drawImage(c, x0, y0, w, h, Math.round((64 - w * s) / 2), Math.round((64 - h * s) / 2), w * s, h * s);
  return iconCache[it.id] = o.toDataURL();
}

/* ---------- Insignias ---------- */
function maxStreak() { let best = 0, cur = 0; const ks = Object.keys(days).filter(k => k >= START).sort(); let prev = null; ks.forEach(k => { const ok = okDay(k); const cont = prev && (new Date(k) - new Date(prev)) / 864e5 === 1; cur = ok ? (cont ? cur + 1 : 1) : 0; best = Math.max(best, cur); prev = k }); return best }
const countHabit = id => Object.keys(days).filter(k => Object.keys(doneFor(k)).some(h => doneFor(k)[h] && (h === id || h.startsWith(id + "-")))).length;
const totalDone = () => Object.keys(days).reduce((t, k) => t + Object.values(doneFor(k)).filter(Boolean).length, 0);
const INSIGNIAS = [
  { id: "primer", name: "Primer paso", desc: "Marca tu primer hábito", ico: "👣", c: "#30d158", v: () => totalDone(), goal: 1 },
  { id: "perfecto", name: "Día perfecto", desc: "Cumple el 100 % de un día", ico: "💯", c: "#ff2d55", v: () => Object.keys(days).filter(k => frac(k) === 1).length, goal: 1 },
  { id: "racha3", name: "En marcha", desc: "3 días seguidos al 60 %", ico: "🔥", c: "#ff9f0a", v: maxStreak, goal: 3 },
  { id: "racha7", name: "Semana de hierro", desc: "7 días seguidos al 60 %", ico: "🛡️", c: "#5e5ce6", v: maxStreak, goal: 7 },
  { id: "racha14", name: "Imparable", desc: "14 días seguidos al 60 %", ico: "⚡", c: "#0a84ff", v: maxStreak, goal: 14 },
  { id: "racha30", name: "Leyenda", desc: "30 días seguidos al 60 %", ico: "👑", c: "#ffb800", v: maxStreak, goal: 30 },
  { id: "atleta", name: "Atleta", desc: "Entrena 10 días", ico: "💪", c: "#ff375f", v: () => countHabit("entreno"), goal: 10 },
  { id: "lector", name: "Lector", desc: "Lee 10 días", ico: "📚", c: "#7d7aff", v: () => countHabit("leer"), goal: 10 },
  { id: "agua", name: "Hidratado", desc: "Bebe tus 2 litros 20 días", ico: "💧", c: "#64d2ff", v: () => countHabit("agua"), goal: 20 },
  { id: "cien", name: "Centurión", desc: "100 hábitos cumplidos", ico: "🏛️", c: "#ffd60a", v: totalDone, goal: 100 },
];

/* ---------- Vistas ---------- */
function money(n) { return `<span class="coin"></span>${n}` }
function itemCard(it, opts) {
  const d = document.createElement("button"); d.className = "item" + (opts.have ? " have" : "");
  if (it.rarity) { d.classList.add("rare"); d.style.setProperty("--rc", RAREZA[it.rarity].c) }
  d.innerHTML = `<img alt="" src="${iconFor(it)}"><b></b><small>${opts.sub}</small>${it.rarity ? `<em>${RAREZA[it.rarity].name}</em>` : it.lvGift ? `<em class="gift">Nivel ${it.lvGift}</em>` : ""}`;
  d.querySelector("b").textContent = it.name; d.disabled = !!opts.disabled; d.onclick = opts.onclick; return d;
}
function nextGoal() {
  const c = coins(), lv = level();
  const buyable = [...MUEBLES, ...ROPA, ...ESTILOS].filter(it => it.cost && !it.rarity && !owned(it.id) && !(it.lv && lv < it.lv) && !(it.needs && !owned(it.needs))).sort((a, b) => a.cost - b.cost);
  const goal = buyable.find(it => it.cost > c) || buyable[0];
  const gift = RUTA.find(it => it.lvGift > lv);
  return { goal, gift, c, lv };
}
function renderGoals() {
  const { goal, gift, c, lv } = nextGoal(), el = $("goals"); if (!el) return;
  const X = xp(), into = X % 150;
  el.innerHTML = "";
  if (goal) { const a = document.createElement("div"); a.className = "goal"; const pct = Math.min(100, Math.round(c / goal.cost * 100));
    a.innerHTML = `<img alt="" src="${iconFor(goal)}"><div class="pt"><small>${c >= goal.cost ? "¡Ya puedes comprarlo!" : `Te faltan ${goal.cost - c} monedas`}</small><b></b><div class="bar"><b style="width:${pct}%"></b></div></div>`;
    a.querySelector(".pt > b").textContent = goal.name; a.onclick = () => setTab("casa"); el.append(a) }
  if (gift) { const a = document.createElement("div"); a.className = "goal"; const need = (gift.lvGift - 1) * 150 - X;
    a.innerHTML = `<img alt="" src="${iconFor(gift)}"><div class="pt"><small>Gratis en el nivel ${gift.lvGift} · faltan ${Math.max(0, need)} XP</small><b></b><div class="bar"><b style="width:${Math.min(100, Math.round(X / ((gift.lvGift - 1) * 150) * 100))}%"></b></div></div>`;
    a.querySelector(".pt > b").textContent = gift.name; a.onclick = () => setTab("premios"); el.append(a) }
}
function renderCasa() {
  const c = coins(), lv = level(), sickNow = mood === "enfermo";
  $("coinsHoy").innerHTML = money(c);
  renderGoals();
  if (tab === "casa") {
    $("roomNote").textContent = sickNow ? "Estás enfermo: la tienda está cerrada hasta que llegues hoy al 60 %." : `${MUEBLES.filter(m => !m.rarity && !m.lvGift && owned(m.id)).length} de ${MUEBLES.filter(m => !m.rarity && !m.lvGift).length} muebles · nivel ${lv}`;
    const list = casaTab === "muebles" ? MUEBLES : casaTab === "ropa" ? ROPA : ESTILOS, g = $("shop"); g.innerHTML = "";
    list.filter(it => !it.rarity || owned(it.id)).forEach(it => {
      const have = owned(it.id), wearable = !!it.slot, worn = wearable && (outfit[it.slot] === it.id || (it.base && !outfit[it.slot]));
      const lockLv = (it.lv && lv < it.lv) || (it.lvGift && lv < it.lvGift), lockNeed = it.needs && !owned(it.needs);
      const sub = have ? (wearable ? (worn ? "Puesto" : "Ponértelo") : "En tu casa") : it.lvGift ? `Gratis en el nivel ${it.lvGift}` : lockLv ? `Nivel ${it.lv}` : lockNeed ? "Necesita escritorio" : money(it.cost);
      g.append(itemCard(it, { have, sub, disabled: !have && (lockLv || lockNeed || sickNow || c < it.cost || !it.cost), onclick: () => have ? (wearable && wear(it)) : buy(it, "item") }));
    });
  }
  if (tab === "premios") {
    const a = activePremio(), g = $("premios"); g.innerHTML = "";
    const sh = document.createElement("button"); sh.className = "premio shieldrow";
    sh.innerHTML = `<span class="ico">🛡️</span><span class="pt"><b>Escudo de racha</b><small>Tienes ${shieldsLeft()} · salva un día malo automáticamente</small></span><span class="cost">${money(ESCUDO.cost)}</span>`;
    sh.disabled = c < ESCUDO.cost; sh.onclick = () => buy(ESCUDO, "escudo"); g.append(sh);
    PREMIOS.forEach(p => {
      const d = document.createElement("button"); d.className = "premio";
      d.innerHTML = `<span class="ico">${p.ico}</span><span class="pt"><b></b><small>${c < p.cost ? `Te faltan ${p.cost - c} monedas` : `${p.min} min de temporizador`}</small></span><span class="cost">${money(p.cost)}</span>`; d.querySelector("b").textContent = p.name;
      d.disabled = !!a || sickNow || c < p.cost; d.onclick = () => buy(p, "premio"); g.append(d);
    });
    $("premioNote").textContent = sickNow ? "Estás enfermo: primero cúrate llegando hoy al 60 %." : a ? "Ya tienes un premio en marcha." : "Cada día perfecto da unos 140 de monedas: una hora de ocio bien ganada.";
    const r = $("ruta"); r.innerHTML = "";
    RUTA.forEach(it => { const n = document.createElement("div"); const got = lv >= it.lvGift, cur = !got && RUTA.find(z => z.lvGift > lv) === it;
      n.className = "node" + (got ? " got" : "") + (cur ? " cur" : ""); n.innerHTML = `<span>Nv ${it.lvGift}</span><img alt="" src="${iconFor(it)}"><b></b>`; n.querySelector("b").textContent = it.name; r.append(n) });
    const ins = $("insignias"); ins.innerHTML = "";
    INSIGNIAS.forEach(b => { const v = Math.min(b.goal, b.v()), done = v >= b.goal, e = document.createElement("div");
      e.className = "badge" + (done ? " done" : ""); e.style.setProperty("--bc", b.c);
      e.innerHTML = `<i>${b.ico}</i><b></b><small>${done ? "Conseguida" : `${v}/${b.goal}`}</small>`; e.querySelector("b").textContent = b.name; e.title = b.desc; ins.append(e) });
    $("insCount").textContent = `${INSIGNIAS.filter(b => b.v() >= b.goal).length} de ${INSIGNIAS.length}`;
  }
  renderCofres(); renderTimer(); renderRescue(); checkLevelUp();
  if (window.onboardingRender) onboardingRender();
  if (window.dailyRender) dailyRender();
}

/* ---------- Subida de nivel ---------- */
function checkLevelUp() {
  if (!uid || !habits.length) return; const lv = level(); let last = 0;
  try { last = +localStorage.getItem("levo-nivel") || 0 } catch (e) { }
  if (!last) { try { localStorage.setItem("levo-nivel", lv) } catch (e) { } return }
  if (lv > last) {
    try { localStorage.setItem("levo-nivel", lv) } catch (e) { }
    const gift = RUTA.filter(it => it.lvGift > last && it.lvGift <= lv);
    showReward(`Nivel ${lv}`, "#30d158", gift.length ? gift.map(g => g.name).join(" + ") : `¡Subiste al nivel ${lv}!`, gift.length ? "Desbloqueado gratis. Ya está en tu casa." : "Sigue así: el siguiente premio está cerca.", gift[0]);
  }
}
function showReward(label, color, name, hint, it) {
  const modal = $("chestModal"), res = $("chestResult");
  modal.hidden = false; $("chestBox").className = "chest gone"; $("chestOpen").hidden = true;
  res.style.setProperty("--rc", color); res.hidden = false; $("chestRarity").textContent = label; $("chestItem").textContent = name; $("chestHint").textContent = hint;
  const img = $("chestImg"); img.hidden = !it; if (it) img.src = iconFor(it);
  burst(res);
}

/* ---------- Cofres de racha ---------- */
function milestones() {
  let n = 0;
  for (const k of Object.keys(days).sort()) { if (k < START || !okDay(k)) continue; if ((prevStreak(k) + 1) % 7 === 0) n++ }
  return n;
}
const bongoUnlocked = () => window._ownSet ? window._ownSet.has("@bongo") : milestones() >= 2;
const chestsLeft = () => Math.max(0, milestones() - new Set(purchases.filter(p => p.kind === "cofre").map(p => p.minutes)).size);
function renderCofres() {
  const n = chestsLeft(), st = streak();
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
      purchases = [...purchases, row];
      const rz = it ? RAREZA[it.rarity] : { name: "Bolsa de monedas", c: "#ffb800" };
      if (it && it.slot) outfit = { ...outfit, [it.slot]: it.id };
      showReward(rz.name, rz.c, it ? it.name : "+150 monedas", it ? (it.slot ? "Ya lo llevas puesto. Puedes quitártelo en Casa → Ropa." : "Ya está en tu habitación.") : "Ya tenías todos los objetos de esta rareza.", it);
      renderCasa();
      write(() => sb.from("purchases").insert(row));
      if (it && it.slot) write(() => sb.from("profile").upsert({ user_id: uid, outfit, updated_at: new Date().toISOString() }, { onConflict: "user_id" }));
    }, 650);
  };
}
$("chestBtn").onclick = openChest;
$("chestClose").onclick = () => { $("chestModal").hidden = true };
$("chestChip").onclick = () => setTab("casa");

/* ---------- Premios de tiempo libre ---------- */
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
  status(kind === "premio" ? `Premio activado: ${it.name}.` : kind === "escudo" ? "Escudo comprado. Te protegerá en un día malo." : `Comprado: ${it.name}.`);
  if (kind === "item" && it.slot) wear(it);
  write(() => sb.from("purchases").insert(row));
}
function wear(it) {
  outfit = { ...outfit, [it.slot]: outfit[it.slot] === it.id && !it.base ? undefined : it.id };
  Object.keys(outfit).forEach(k => outfit[k] === undefined && delete outfit[k]);
  renderCasa();
  write(() => sb.from("profile").upsert({ user_id: uid, outfit, updated_at: new Date().toISOString() }, { onConflict: "user_id" }));
}
async function loadCasa() {
  if (!uid || uid === "demo") { renderCasa(); return }
  const [p, o] = await Promise.all([sb.from("purchases").select("item,kind,cost,minutes,at").order("at"), sb.from("profile").select("outfit").maybeSingle()]);
  if (!p.error) purchases = p.data; if (!o.error && o.data) outfit = o.data.outfit || {};
  HARD = outfit._cfg ? !!outfit._cfg.hard : true;
  render(); renderCasa(); if (window.maybeOnboard) maybeOnboard();
}
function setTab(t) {
  tab = t; ["hoy", "casa", "premios", "amigos"].forEach(n => { $("tab-" + n).hidden = n !== t; $("tb-" + n).setAttribute("aria-selected", n === t) });
  const slot = $(t === "casa" ? "roomSlotCasa" : "roomSlotHoy"); if (slot && (t === "hoy" || t === "casa")) slot.append($("roomWrap"));
  window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" }); renderCasa(); if (window.onTab) onTab(t);
}
["hoy", "casa", "premios", "amigos"].forEach(n => $("tb-" + n).onclick = () => setTab(n));
document.querySelectorAll("[data-shop]").forEach(b => b.onclick = () => { casaTab = b.dataset.shop; document.querySelectorAll("[data-shop]").forEach(x => x.setAttribute("aria-selected", x === b)); renderCasa() });
window.onRendered = renderCasa;
window.loadCasa = loadCasa;

if (uid === "demo" && location.hash === "#demo") { milestones = () => 2; xp = () => 470; purchases = ["alfombra", "cama", "escritorio", "setup", "planta", "estanteria", "silla", "cuadro", "gorra-negra", "cadena-oro", "vaqueros"].map(item => ({ item, kind: "item", cost: 0, at: "2026-10-17T10:00:00Z" })); outfit = { gorra: "gorra-negra", cadena: "cadena-oro", pant: "vaqueros" } }
renderCasa();
requestAnimationFrame(loop);
