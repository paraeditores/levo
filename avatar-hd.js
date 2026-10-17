/* Levo · Personaje en alta definición (vista de frente, 40×76 px de diseño) para Hoy, armario, celebración y creación. */
function drawAvatarHD(x, cx, fy, o = outfit, md = mood, bl = blink, frame = 0, wave = false) {
  const lk = { ...LOOK_DEF, ...(o._look || {}) }, ev = o._evo || null;
  const skin = SKINS[lk.skin] || SKINS[0], skinD = shade(skin, .86), skinL = shade(skin, 1.08), hair = HAIRS[lk.hc] || HAIRS[0], hairL = shade(hair, 1.45);
  const it = id => ALL.find(r => r.id === id);
  const topI = it(o.top), top = (topI || {}).c || (md === "enfermo" ? "#8e8e99" : "#ff375f");
  const pantI = it(o.pant), pant = (pantI || {}).c || "#2b3654";
  const shoeI = it(o.zapas), shoe = (shoeI || {}).c || "#34343a";
  const X0 = Math.round(cx - 20), Y0 = Math.round(fy - 76);
  const R = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(X0 + a, Y0 + b, w, h) };
  const O = (a, b, w, h, c) => { R(a - 1, b - 1, w + 2, h + 2, OUT); R(a, b, w, h, c) };
  const strong = !!(ev && ev.fit) || lk.build === "fuerte" || lk.build === "robusto";
  const bw = lk.build === "robusto" ? 26 : strong ? 24 : lk.build === "delgado" ? 18 : 20, bx = 20 - bw / 2, aw = strong ? 6 : 5;
  const hoodie = !!(o.top && /sudadera/.test(o.top)), track = o.top === "chandal-verde", jersey = o.top === "jersey-navidad", cape = o.top === "capa-vampiro";
  const longSleeve = hoodie || track || jersey || cape;
  const t = Date.now();
  // sombra y aura
  x.fillStyle = "rgba(0,0,0,.3)"; x.beginPath(); x.ellipse(cx, fy, 14, 3.5, 0, 0, Math.PI * 2); x.fill();
  if (o.aura || (ev && ev.st >= 1)) { const col = o.aura ? "255,214,10" : STAGES[ev.st][2], al = o.aura ? .55 : .14 + ev.st * .06; const g = x.createRadialGradient(cx, fy - 40, 6, cx, fy - 40, 40); g.addColorStop(0, `rgba(${col},${al})`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.fillRect(cx - 42, fy - 84, 84, 88) }
  // capa por detrás
  if (cape) { O(bx - 3, 31, bw + 6, 36, "#141418"); R(bx - 1, 33, 3, 32, "#7a0f16") }
  // pelo largo por detrás
  if (lk.hs === "largo" && !(o.gorra && it(o.gorra))) O(5, 10, 30, 26, hair);
  // piernas
  const ll = frame === 1 ? 2 : 0, rl = frame === 2 ? 2 : 0;
  O(12, 50, 8, 18 - ll, pant); O(21, 50, 8, 18 - rl, pant);
  R(17, 52, 1, 14 - ll, shade(pant, .82)); R(26, 52, 1, 14 - rl, shade(pant, .82));
  if (o.pant === "vaqueros") { R(13, 53, 3, 1, shade(pant, 1.25)); R(25, 53, 3, 1, shade(pant, 1.25)) }
  // zapatillas
  O(10, 68 - ll, 10, 5, shoe); O(21, 68 - rl, 10, 5, shoe);
  R(10, 72 - ll, 10, 1, "#eeeeee"); R(21, 72 - rl, 10, 1, "#eeeeee");
  if (shoeI) { R(13, 69 - ll, 4, 1, "#ffffff"); R(24, 69 - rl, 4, 1, "#ffffff"); if (o.zapas === "zapas-neon") { R(10, 73 - ll, 10, 1, "#32d74b"); R(21, 73 - rl, 10, 1, "#32d74b") } }
  // cuerpo
  O(bx, 30, bw, 21, top); R(bx, 46, bw, 5, shade(top, .84)); R(bx + bw - 3, 31, 3, 15, shade(top, .9)); R(bx + 2, 31, 2, 14, shade(top, 1.1));
  if (hoodie) { R(bx + 4, 28, bw - 8, 4, shade(top, .78)); R(17, 33, 1, 7, "#eeeeee"); R(22, 33, 1, 7, "#eeeeee"); R(bx + 4, 41, bw - 8, 5, shade(top, .9)); if (o.top === "sudadera-levo") { R(18, 35, 4, 4, "#ffffff"); R(19, 36, 2, 2, "#ff5c78") } if (o.top === "sudadera-galaxia") [[3, 33], [9, 37], [15, 34], [6, 42], [12, 44]].forEach(([a, b]) => R(bx + a, b, 1, 1, "#ffffff")) }
  else if (track) { R(19, 31, 2, 19, "#e8e8e8"); R(bx + 1, 31, 1, 19, "#ffffff"); R(bx + bw - 2, 31, 1, 19, "#ffffff") }
  else if (jersey) { [[2, 34], [6, 36], [10, 34], [14, 36], [4, 40], [8, 42], [12, 40]].forEach(([a, b]) => R(bx + a, b, 2, 1, "#ffffff")); R(bx, 45, bw, 1, "#2fb344") }
  else if (cape) { R(bx - 2, 28, 5, 6, "#c81e1e"); R(bx + bw - 3, 28, 5, 6, "#c81e1e"); R(19, 31, 2, 19, "#2a2a30") }
  else { R(17, 30, 6, 2, skin); R(18, 32, 4, 1, skin) }
  R(bx + 1, 50, bw - 2, 2, "#26262b"); R(19, 50, 2, 2, "#c9a227");
  if (o.cadena) { R(15, 31, 1, 2, "#ffd60a"); R(16, 33, 1, 1, "#ffd60a"); R(17, 34, 6, 1, "#ffd60a"); R(23, 33, 1, 1, "#ffd60a"); R(24, 31, 1, 2, "#ffd60a"); R(19, 35, 2, 2, "#ffc300") }
  // brazos
  const xl = bx - aw, xr = bx + bw, sl = longSleeve ? 16 : 7;
  O(xl, 31, aw, sl, top); if (!longSleeve) O(xl, 38, aw, 9, skin); O(xl, 47, aw, 4, skin);
  if (strong && !longSleeve) R(xl + 1, 39, aw - 2, 2, skinL);
  if (wave) { O(xr, 17, aw, 14, longSleeve ? top : skin); if (!longSleeve) O(xr, 24, aw, 7, top); O(xr, 13, aw, 4, skin) }
  else { O(xr, 31, aw, sl, top); if (!longSleeve) O(xr, 38, aw, 9, skin); O(xr, 47, aw, 4, skin); if (strong && !longSleeve) R(xr + 1, 39, aw - 2, 2, skinL) }
  // cuello y cabeza
  R(17, 28, 6, 3, skinD);
  O(5, 15, 3, 6, skin); O(32, 15, 3, 6, skin); R(6, 17, 1, 3, skinD); R(33, 17, 1, 3, skinD);
  O(8, 6, 24, 23, skin); R(9, 26, 22, 2, skinD); R(9, 7, 22, 1, skinL);
  // pelo
  const hat = it(o.gorra);
  if (!hat || hat.id === "corona") {
    if (lk.hs === "corto") { O(7, 3, 26, 8, hair); R(9, 11, 6, 2, hair); R(16, 11, 3, 1, hair); R(22, 11, 5, 2, hair); R(28, 11, 4, 3, hair); R(7, 11, 2, 7, hair); R(31, 11, 2, 7, hair); R(12, 5, 9, 1, hairL); R(23, 6, 5, 1, hairL) }
    else if (lk.hs === "rapado") { R(8, 5, 24, 5, shade(hair, 1.15)); R(8, 10, 2, 5, shade(hair, 1.15)); R(30, 10, 2, 5, shade(hair, 1.15)); for (let i = 9; i < 31; i += 3) R(i, 6, 1, 1, hair) }
    else if (lk.hs === "largo") { O(7, 3, 26, 8, hair); R(9, 11, 15, 3, hair); R(6, 11, 4, 19, hair); R(30, 11, 4, 19, hair); R(12, 5, 10, 1, hairL); R(7, 16, 1, 10, hairL) }
    else if (lk.hs === "rizado") { [[6, 3], [11, 1], [16, 0], [21, 0], [26, 1], [30, 4], [8, 7], [29, 8]].forEach(([a, b]) => { O(a, b, 6, 6, hair); R(a + 1, b + 1, 2, 1, hairL) }); R(8, 8, 24, 4, hair); R(7, 11, 2, 6, hair); R(31, 11, 2, 6, hair) }
    else if (lk.hs === "calvo") { R(13, 8, 7, 2, shade(skin, 1.18)) }
  }
  // sombreros
  if (hat) {
    const c = hat.c;
    if (hat.id === "corona") { [[9, -2, 4, 6], [18, -5, 4, 9], [27, -2, 4, 6]].forEach(([a, b, w, h]) => O(a, b, w, h, c)); O(8, 3, 24, 5, c); R(14, 4, 2, 2, "#ff2d55"); R(19, 4, 2, 2, "#64d2ff"); R(25, 4, 2, 2, "#30d158"); R(9, 3, 22, 1, "#fff2b3") }
    else if (hat.id === "gorro-lana") { O(7, 0, 26, 12, c); for (let i = 0; i < 26; i += 3) R(7 + i, 9, 1, 3, shade(c, .8)); O(17, -5, 6, 5, "#ffffff") }
    else if (hat.id === "gorro-bruja") { O(2, 8, 36, 3, c); O(10, -4, 20, 13, c); O(14, -11, 12, 8, c); O(18, -17, 6, 7, c); R(10, 6, 20, 2, "#ff9f0a") }
    else if (hat.id === "gorro-navidad") { O(7, 1, 26, 8, "#e0312b"); O(6, 8, 28, 4, "#ffffff"); O(27, -4, 6, 6, "#e0312b"); O(31, -7, 5, 5, "#ffffff") }
    else { O(7, 1, 26, 9, c); R(7, 8, 26, 2, shade(c, .8)); O(5, 10, 30, 3, shade(c, .9)); R(19, 1, 2, 1, shade(c, 1.3)); if (hat.id === "gorra-holo") { R(8, 3, 24, 1, "#ffffff"); R(8, 5, 24, 1, "#bf5af2") } else if (hat.id === "gorra-dorada") R(10, 3, 12, 1, "#fff2b3"); else R(18, 4, 4, 3, shade(c, 1.35)) }
  }
  // cejas
  const sad = md === "triste" || md === "agotado" || md === "enfermo";
  R(11, sad ? 13 : 14, 5, 1, shade(hair, .9)); R(24, sad ? 13 : 14, 5, 1, shade(hair, .9)); if (sad) { R(15, 12, 1, 1, shade(hair, .9)); R(24, 12, 1, 1, shade(hair, .9)) }
  // barba (antes que la boca)
  if (lk.beard === "corta") { x.globalAlpha = .4; R(9, 22, 22, 6, hair); x.globalAlpha = 1 }
  if (lk.beard === "completa") { O(8, 21, 24, 9, hair); R(10, 21, 20, 1, shade(hair, 1.2)); R(16, 22, 8, 1, shade(hair, .85)) }
  // ojos
  const closed = bl || md === "agotado" || md === "enfermo";
  [11, 24].forEach(a => { if (closed) R(a, 18, 5, 1, OUT); else { R(a, 15, 5, 1, OUT); R(a, 16, 5, 4, "#ffffff"); R(a + 1, 16, 3, 4, "#3b2a20"); R(a + 2, 17, 1, 2, "#0b0b0f"); R(a + 1, 16, 1, 1, "#ffffff") } });
  if (ev && ev.tired) { R(11, 20, 5, 1, shade(skin, .74)); R(24, 20, 5, 1, shade(skin, .74)) }
  // gafas
  const gf = it(o.gafas) || (lk.glasses === "pasta" ? { c: "#1c1c1e" } : lk.glasses === "sol" ? { c: "#0b0b0f", fill: true } : null);
  if (gf) { [10, 23].forEach(a => { if (gf.fill) { R(a, 15, 7, 6, gf.c); R(a + 1, 16, 2, 1, "rgba(255,255,255,.7)") } else { R(a, 15, 7, 1, gf.c); R(a, 20, 7, 1, gf.c); R(a, 15, 1, 6, gf.c); R(a + 6, 15, 1, 6, gf.c) } }); R(17, 17, 6, 1, gf.c); R(8, 16, 2, 1, gf.c); R(30, 16, 2, 1, gf.c) }
  // nariz, mejillas y boca
  R(19, 20, 2, 2, skinD);
  if (md === "feliz") { R(10, 21, 3, 1, "#ff9aa2"); R(27, 21, 3, 1, "#ff9aa2") }
  const lip = "#7a2f25";
  if (md === "feliz") { R(16, 24, 8, 2, lip); R(17, 24, 6, 1, "#ffffff"); R(15, 23, 1, 1, lip); R(24, 23, 1, 1, lip) }
  else if (md === "triste") { R(17, 24, 6, 1, lip); R(16, 25, 1, 1, lip); R(23, 25, 1, 1, lip) }
  else if (md === "agotado") { R(19, 24, 2, 2, lip) }
  else if (md === "enfermo") { R(16, 24, 2, 1, lip); R(18, 25, 2, 1, lip); R(20, 24, 2, 1, lip); R(22, 25, 2, 1, lip); x.globalAlpha = .12; R(8, 6, 24, 23, "#30d158"); x.globalAlpha = 1 }
  else R(17, 24, 6, 1, lip);
  // partículas de etapa y calma
  if (ev && ev.st >= 3) { const n = ev.st + 2, a0 = t / 800; x.fillStyle = `rgb(${STAGES[ev.st][2]})`; for (let i = 0; i < n; i++) { const an = a0 + i * Math.PI * 2 / n; x.fillRect(Math.round(cx + Math.cos(an) * 24), Math.round(fy - 42 + Math.sin(an) * 9 - (i % 2) * 12), 2, 2) } }
  if (ev && ev.calm && Math.floor(t / 900) % 4 === 0) { x.fillStyle = "#64d2ff"; R(34, 2, 2, 2, "#64d2ff"); R(37, 0, 1, 1, "#64d2ff") }
}

/* Miniaturas en alta definición: la cabeza, el torso o las piernas según la prenda */
const _hdIc = {};
function hdCrop(o, region, key) {
  if (key && _hdIc[key]) return _hdIc[key];
  const c = document.createElement("canvas"); c.width = 64; c.height = 100; const x = c.getContext("2d"); x.imageSmoothingEnabled = false;
  const sv = window._ownSet; window._ownSet = null; drawAvatarHD(x, 32, 96, o, "feliz", false); window._ownSet = sv;
  const [sx, sy, sw, sh] = { head: [6, 0, 52, 52], torso: [6, 44, 52, 34], legs: [10, 66, 44, 34], face: [10, 18, 44, 40] }[region];
  const k = Math.min(64 / sw, 64 / sh), out = document.createElement("canvas"); out.width = out.height = 64; const ox = out.getContext("2d"); ox.imageSmoothingEnabled = false;
  ox.drawImage(c, sx, sy, sw, sh, (64 - sw * k) / 2, (64 - sh * k) / 2, sw * k, sh * k);
  const url = out.toDataURL(); if (key) _hdIc[key] = url; return url;
}
function hdItemIcon(it) {
  const look = outfit._look || {}, reg = it.slot === "gorra" ? "head" : it.slot === "gafas" ? "face" : it.slot === "pant" || it.slot === "zapas" ? "legs" : "torso";
  return hdCrop({ _look: look, [it.slot]: it.id, ...(it.slot === "pant" ? {} : {}) }, reg, it.id + JSON.stringify(look));
}
function hdHead() { return hdCrop({ ...outfit, _evo: window._evoCache }, "head") }
