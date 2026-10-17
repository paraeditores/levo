/* Levo · Juice: iconos pixel, sonido chiptune, monedas que vuelan, reacciones del personaje y celebraciones. */

/* ---------- Iconos pixel (10×10). o = tinta, a/b/c = colores del icono, w = blanco ---------- */
const PIX = {
  drop: [["....oo....", "...oaao...", "...oaao...", "..oaaaao..", "..oabaao..", ".oabaaaao.", ".oabaaaao.", ".oaaaaaco.", "..oaaaco..", "...oooo..."], { a: "#3fa9ff", b: "#bfe6ff", c: "#1f6fd1" }],
  dumbbell: [["..........", ".oo....oo.", "oaao..oaao", "oaaooooaao", "oaaccccaao", "oaaooooaao", "oaao..oaao", ".oo....oo.", "..........", ".........."], { a: "#ff4d6d", c: "#8a8aa8" }],
  shoe: [["..........", "...ooo....", "...oaao...", "...oaaooo.", "..oaaaaaao", ".oaaaaaaao", ".obbbbbbbo", ".oooooooo.", "..........", ".........."], { a: "#ff9f1c", b: "#ffffff" }],
  moon: [["...oooo...", "..oaaao...", ".oaaao....", ".oaao.....", ".oaao...b.", ".oaaao....", ".oaaaaoooo", "..oaaaaaao", "...oooooo.", ".........."], { a: "#ffd43b", b: "#ffffff" }],
  apple: [[".....o....", "....oc....", "..oo.oo...", ".oaaoaaao.", "oabaaaaaao", "oabaaaaaao", "oaaaaaaaao", ".oaaaaaao.", "..oaoaao..", "...o..o..."], { a: "#ff4d4d", b: "#ffb3b3", c: "#2fb344" }],
  check: [["..........", "........oo", ".......oao", "......oao.", "oo...oao..", "oaoooao...", ".oaaao....", "..oao.....", "...o......", ".........."], { a: "#16c47f" }],
  target: [["...oooo...", ".ooaaaaoo.", ".oawwwwao.", "oawaaaawao", "oawaooawao", "oawaooawao", "oawaaaawao", ".oawwwwao.", ".ooaaaaoo.", "...oooo..."], { a: "#ff4d6d" }],
  camera: [["..........", "...ooo....", "oooaaaoooo", "oaaaaaaaao", "oaaowwoaao", "oaowbbwoao", "oaowbbwoao", "oaaowwoaao", "oooooooooo", ".........."], { a: "#7b61ff", b: "#3fa9ff" }],
  book: [["..........", "oooo..oooo", "owwwoowwwo", "owcwoowcwo", "owwwoowwwo", "owcwoowcwo", "owwwoowwwo", "oaaaooaaao", ".oooooooo.", ".........."], { a: "#7b61ff", c: "#b8b6d6" }],
  leaf: [["........oo", ".....ooaao", "...ooaaaao", "..oaaabaao", ".oaaabaaao", ".oaabaaao.", ".oabaaao..", "oobooo....", "o.........", ".........."], { a: "#2fb344", b: "#a8f0b4" }],
  bulb: [["...oooo...", "..oaaaao..", ".oaabaaao.", ".oabaaaao.", ".oaaaaaao.", "..oaaaao..", "...oooo...", "...owwo...", "...oooo...", "....oo...."], { a: "#ffd43b", b: "#fff6c2" }],
  coin: [["..oooooo..", ".oaaaaaao.", "oaabbaaaco", "oabaaaaaco", "oabaaaaaco", "oaaaaaaaco", "oaaaaaacco", ".oaaaccco.", "..oooooo..", ".........."], { a: "#ffc83d", b: "#fff2b3", c: "#e09a00" }],
  chat: [[".oooooooo.", "oaaaaaaaao", "oaaaaaaaao", "oawaawaawo", "oaaaaaaaao", ".oaaaaaaao", "..ooaoooo.", "...oao....", "...oo.....", ".........."], { a: "#16c47f" }],
  house: [["....oo....", "...oaao...", "..oaaaao..", ".oaaaaaao.", "oaaaaaaaao", ".obbbbbbo.", ".obooobbo.", ".obowobbo.", ".obowobbo.", ".oooooooo."], { a: "#ff4d6d", b: "#ffe2b0" }],
  flame: [["....o.....", "...oao....", "...oaao...", "..oaabao..", ".oaabbbao.", ".oabbwbbao", ".oabwwwbao", ".oabbwbbao", "..oabbbao.", "...ooooo.."], { a: "#ff4d1c", b: "#ffc83d" }],
  heart: [["..........", ".oo...oo..", "oaao.oaao.", "oaaaoaaaao", "oabaaaaaao", ".oaaaaaao.", "..oaaaao..", "...oaao...", "....oo....", ".........."], { a: "#ff4d6d", b: "#ffb3c1" }],
  star: [["....oo....", "...oaao...", "oooaaaaooo", "oaaaabaaao", ".oaaaaaao.", "..oaaaao..", ".oaaooaao.", ".oao..oao.", ".oo....oo.", ".........."], { a: "#ffc83d", b: "#fff2b3" }],
  shield: [["oooooooooo", "oaaaabbbbo", "oaaaabbbbo", "oaaaabbbbo", "obbbbaaaao", "obbbbaaaao", ".obbbaaao.", "..obbaao..", "...oaao...", "....oo...."], { a: "#3fa9ff", b: "#ffffff" }],
  gift: [["..oo.oo...", ".obbobbo..", "oooooooooo", "oaaaobaaao", "oooooooooo", ".oaaobaao.", ".oaaobaao.", ".oaaobaao.", ".oooooooo.", ".........."], { a: "#ff4d6d", b: "#ffc83d" }],
};
const _pixCache = {};
function pixIcon(name, s = 4) {
  const key = name + s; if (_pixCache[key]) return _pixCache[key];
  const [rows, pal] = PIX[name] || PIX.star, c = document.createElement("canvas"); c.width = c.height = 10 * s; const x = c.getContext("2d");
  rows.forEach((r, y) => [...r].forEach((ch, i) => { if (ch === ".") return; x.fillStyle = ch === "o" ? "#1b1b2f" : ch === "w" ? "#ffffff" : pal[ch] || "#999"; x.fillRect(i * s, y * s, s, s) }));
  return _pixCache[key] = c.toDataURL();
}
const HICON = [[/agua|beber|hidrat/i, "drop"], [/entren|gym|flexi|pesas|deport/i, "dumbbell"], [/paso|camin|correr/i, "shoe"], [/dorm|sueñ/i, "moon"], [/comer|comida|fruta|limpio/i, "apple"], [/tarea|cerrar/i, "check"], [/foco|profundo/i, "target"], [/public|grab|contenido|v[ií]deo/i, "camera"], [/leer|libro|lectura/i, "book"], [/pantalla|medit|pausa|respir/i, "leaf"], [/aprend|\bia\b|curso/i, "bulb"], [/gasto|dinero|ahorro|ingreso/i, "coin"], [/familia|amig|hablar|querid/i, "chat"], [/casa|orden/i, "house"]];
const AREA_ICON = { cuerpo: "heart", trabajo: "check", mente: "bulb", vida: "house" };
window.habitIcon = h => pixIcon((HICON.find(([re]) => re.test(h.name)) || [0, AREA_ICON[h.area] || "star"])[1], 3);

/* ---------- Sonido chiptune (se puede silenciar) ---------- */
let soundOn = true; try { soundOn = localStorage.getItem("levo-sonido") !== "0" } catch (e) { }
let actx = null;
function tone(f, t0, d, type = "square", v = .05) {
  const o = actx.createOscillator(), g = actx.createGain(); o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(v, actx.currentTime + t0); g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + t0 + d);
  o.connect(g).connect(actx.destination); o.start(actx.currentTime + t0); o.stop(actx.currentTime + t0 + d + .02);
}
const SONGS = {
  tick: [[880, 0, .06], [1320, .06, .09]],
  untick: [[660, 0, .06], [440, .06, .09]],
  coin: [[988, 0, .07], [1319, .07, .18]],
  saved: [[523, 0, .09], [659, .09, .09], [784, .18, .09], [1047, .27, .22]],
  done: [[523, 0, .12], [523, .12, .12], [523, .24, .12], [659, .36, .3], [587, .66, .12], [659, .78, .12], [784, .9, .5]],
  level: [[784, 0, .08], [880, .08, .08], [988, .16, .08], [1175, .24, .3]],
};
function play(name) {
  if (!soundOn) return;
  try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === "suspended") actx.resume(); (SONGS[name] || []).forEach(([f, t, d]) => tone(f, t, d)) } catch (e) { }
}
window.levoPlay = play;
function toggleSound() { soundOn = !soundOn; try { localStorage.setItem("levo-sonido", soundOn ? "1" : "0") } catch (e) { } decorate(); if (soundOn) play("tick") }

/* ---------- Monedas y racha con iconos pixel ---------- */
money = n => `<img class="pcoin" alt="" src="${pixIcon("coin", 2)}">${n}`;
let shownCoins = null;
function decorate() {
  const c = coins(), chip = $("coinsHoy");
  if (shownCoins === null) shownCoins = c;
  if (c > shownCoins) { const from = shownCoins, t0 = performance.now() + 550; shownCoins = c; const step = t => { const k = Math.min(1, Math.max(0, (t - t0) / 500)); chip.innerHTML = money(Math.round(from + (c - from) * k)); if (k < 1) requestAnimationFrame(step); else { chip.classList.remove("bump"); void chip.offsetWidth; chip.classList.add("bump") } }; requestAnimationFrame(step) }
  else { shownCoins = c; chip.innerHTML = money(c) }
  const st = $("streak"); st.innerHTML = `<img alt="" src="${pixIcon("flame", 2)}">${streak()}`; st.title = "Días de racha";
  const g = $("chestChip"); if (!g.hidden) g.innerHTML = `<img alt="" src="${pixIcon("gift", 2)}">${chestsLeft()}`;
  const s = $("sndBtn"); if (s) s.textContent = soundOn ? "🔊 Sonido" : "🔇 Sin sonido";
}
document.querySelectorAll(".howto li i").forEach((el, i) => { el.innerHTML = `<img alt="" src="${pixIcon(["check", "target", "star", "flame"][i] || "star", 3)}">` });

/* ---------- Reacciones al marcar ---------- */
const REACT = {
  cuerpo: ["¡Eso es, músculo!", "Mi cuerpo te lo agradece", "+1 de energía"],
  trabajo: ["Una menos. ¡Foco!", "Productivo, me gusta", "Así se construye"],
  mente: ["Mente en calma", "Cerebro más fuerte", "Eso suma"],
  vida: ["La vida también cuenta", "Bien hecho", "Esto es equilibrio"],
};
function avatarScreen() { const cv = $("room"); if (!cv || cv.offsetParent === null) return null; const [ax, ay] = P(me.x, me.y), r = cv.getBoundingClientRect(), k = r.width / cv.width; return { x: r.left + ax * k, y: r.top + (ay - 40) * k, k, r } }
function flyCoins(fromEl, n = 3) {
  const to = $("coinsHoy"); if (!fromEl || !to || still) return;
  const a = fromEl.getBoundingClientRect(), b = to.getBoundingClientRect(), src = pixIcon("coin", 2);
  for (let i = 0; i < n; i++) {
    const img = document.createElement("img"); img.className = "fly"; img.src = src; img.alt = ""; document.body.append(img);
    const x0 = a.right - 40 + i * 6, y0 = a.top + a.height / 2 - 11, x1 = b.left + 6, y1 = b.top + b.height / 2 - 11, mx = (x0 + x1) / 2 + (i - 1) * 30, my = Math.min(y0, y1) - 60 - i * 15;
    img.animate([{ transform: `translate(${x0}px,${y0}px) scale(.6)` }, { transform: `translate(${mx}px,${my}px) scale(1.3)`, offset: .45 }, { transform: `translate(${x1}px,${y1}px) scale(.8)` }], { duration: 650 + i * 90, easing: "cubic-bezier(.45,0,.55,1)", delay: i * 70, fill: "forwards" }).onfinish = () => img.remove();
  }
  setTimeout(() => play("coin"), 600);
}
function xpPop(text) {
  const w = $("roomWrap"), s = avatarScreen(); if (!w || !s) return;
  const p = document.createElement("span"); p.className = "xpop"; p.textContent = text;
  const wr = w.getBoundingClientRect(); p.style.left = (s.x - wr.left - 14) + "px"; p.style.top = (s.y - wr.top - 30) + "px"; w.append(p); setTimeout(() => p.remove(), 900);
}
function say(text, ms = 2600) { window._sayOverride = { text, until: Date.now() + ms } }
window.onToggle = (h, on, before, after, k) => {
  const el = document.querySelector(`.habit[data-id="${CSS.escape(h.id)}"]`);
  if (!on) { play("untick"); return }
  play("tick"); if (el) { el.classList.add("pop"); }
  flyCoins(el, 3); me.jump = .5; xpPop("+10 XP");
  if (k !== dayKey(0)) return;
  if (after === 1) { say("¡TODO HECHO! 🎉", 4000); setTimeout(celebrate, 650) }
  else if (before < .6 && after >= .6) { say("¡Día salvado!"); setTimeout(savedBanner, 500) }
  else { const r = REACT[h.area] || REACT.vida; say(r[Math.floor(Math.random() * r.length)]) }
};

/* ---------- Día salvado (60 %) ---------- */
function savedBanner() {
  play("saved"); me.wave = 2;
  const el = document.createElement("div"); el.className = "saved"; el.setAttribute("role", "status");
  el.innerHTML = `<img alt="" src="${pixIcon("shield", 4)}"><div><b>¡DÍA SALVADO!</b><small>Tu racha está a salvo. A por el 100 %.</small></div>`;
  document.body.append(el); requestAnimationFrame(() => el.classList.add("in"));
  setTimeout(() => { el.classList.remove("in"); setTimeout(() => el.remove(), 500) }, 2800);
}

/* ---------- Día completo (100 %): el ritual ---------- */
function celebrate(force) {
  const key = "levo-celeb-" + dayKey(0);
  try { if (!force && localStorage.getItem(key)) return; localStorage.setItem(key, "1") } catch (e) { }
  play("done");
  const st = streak(), d = new Date(), el = document.createElement("div"); el.className = "celeb"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Día completo");
  el.innerHTML = `<canvas class="fw"></canvas><div class="celeb-in">
    <div class="celeb-kicker">${d.toLocaleDateString("es-ES", { day: "numeric", month: "long" }).toUpperCase()} · ${habits.length} DE ${habits.length}</div>
    <h1>Día completo</h1>
    <canvas class="celeb-av" width="64" height="64"></canvas>
    <div class="celeb-stats">
      <div><img alt="" src="${pixIcon("flame", 3)}"><b id="cStreak">${Math.max(0, st - 1)}</b><small>días de racha</small></div>
      <div><img alt="" src="${pixIcon("coin", 3)}"><b>+50</b><small>bonus del día</small></div>
      <div><img alt="" src="${pixIcon("star", 3)}"><b>Nv ${level()}</b><small>${xp()} XP</small></div>
    </div>
    <button class="btn accent" id="cShare">Compartir mi día</button>
    <button class="ghost" id="cClose">Seguir</button></div>`;
  document.body.append(el);
  setTimeout(() => { const b = $("cStreak"); if (b) { b.textContent = st; b.classList.add("up"); play("coin") } }, 1300);
  // personaje bailando
  const av = el.querySelector(".celeb-av"), ax = av.getContext("2d"); ax.imageSmoothingEnabled = false;
  // fuegos artificiales pixel
  const fw = el.querySelector("canvas.fw"), fx = fw.getContext("2d"), parts = []; let last = 0, alive = true;
  const cols = ["#ffffff", "#f5c451", "#ff5c78", "#ffe8a3"];
  const fit = () => { fw.width = innerWidth; fw.height = innerHeight }; fit();
  function boom() { const x = fw.width * (.15 + Math.random() * .7), y = fw.height * (.12 + Math.random() * .35), c = cols[Math.floor(Math.random() * cols.length)]; for (let i = 0; i < 46; i++) { const a = Math.PI * 2 * i / 46, v = 1.5 + Math.random() * 3; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, c }) } }
  function frame(t) {
    if (!alive) return;
    if (!still && t - last > 520) { boom(); last = t }
    fx.fillStyle = "rgba(10,10,18,.22)"; fx.fillRect(0, 0, fw.width, fw.height);
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx; p.y += p.vy; p.vy += .06; p.vx *= .985; p.life -= .009; if (p.life <= 0) { parts.splice(i, 1); continue } fx.globalAlpha = p.life; fx.fillStyle = p.c; fx.fillRect(p.x, p.y, 3, 3) } fx.globalAlpha = 1;
    const ph = Math.floor(t / 260) % 4; ax.clearRect(0, 0, 64, 64); drawAvatar(ax, 32, 58 - (ph % 2 ? 6 : 0), { ...outfit, _evo: window._evoCache }, "feliz", false, ph % 2 ? 1 : 2, ph < 2);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame); boom();
  const close = () => { alive = false; el.remove() };
  $("cClose").onclick = close;
  $("cShare").onclick = shareDay;
}
window.levoCelebrate = celebrate;

/* ---------- Tarjeta compartible del día completo ---------- */
async function shareDay() {
  const W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
  const F = (w, s) => `${w} ${s}px -apple-system, "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
  const g = x.createRadialGradient(540, 700, 80, 540, 900, 1300); g.addColorStop(0, "#1d2042"); g.addColorStop(1, "#0a0a12"); x.fillStyle = g; x.fillRect(0, 0, W, H);
  // marca y fecha
  x.textBaseline = "alphabetic"; x.fillStyle = "#ffffff"; x.font = F(800, 64); x.fillText("levo", 90, 150);
  x.fillStyle = "#ff5c78"; x.fillRect(90 + x.measureText("levo").width + 10, 128, 14, 14);
  x.textAlign = "right"; x.fillStyle = "rgba(255,255,255,.55)"; x.font = F(600, 30);
  x.fillText(new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }), W - 90, 148); x.textAlign = "left";
  // la habitación, enmarcada como una pieza de galería
  const fx = 90, fy = 230, fw = 900, fh = 760, r = 48;
  x.save(); x.beginPath(); x.moveTo(fx + r, fy); x.arcTo(fx + fw, fy, fx + fw, fy + fh, r); x.arcTo(fx + fw, fy + fh, fx, fy + fh, r); x.arcTo(fx, fy + fh, fx, fy, r); x.arcTo(fx, fy, fx + fw, fy, r); x.closePath();
  x.fillStyle = "#11152e"; x.fill(); x.strokeStyle = "rgba(255,255,255,.08)"; x.lineWidth = 2; x.stroke(); x.clip();
  const rc = document.createElement("canvas"); drawRoom(rc); const k = Math.min((fw - 60) / rc.width, (fh - 60) / rc.height), w2 = rc.width * k, h2 = rc.height * k;
  x.imageSmoothingEnabled = false; x.drawImage(rc, fx + (fw - w2) / 2, fy + (fh - h2) / 2, w2, h2); x.restore();
  // titular
  x.fillStyle = "#ffffff"; x.font = F(800, 150); x.fillText("Día", 82, 1200); x.fillText("completo.", 82, 1350);
  x.fillStyle = "rgba(255,255,255,.62)"; x.font = F(500, 42); x.fillText(`${habits.length} de ${habits.length} hábitos cumplidos hoy`, 90, 1430);
  // datos
  const icons = await Promise.all(["flame", "coin", "star"].map(n => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = pixIcon(n, 6) })));
  const st = streak(), data = [[icons[0], `${st}`, st === 1 ? "día seguido" : "días seguidos"], [icons[1], "+50", "monedas extra"], [icons[2], `${level()}`, "nivel"]];
  data.forEach(([im, big, small], i) => {
    const bx = 90 + i * 310, by = 1510;
    x.fillStyle = "rgba(255,255,255,.06)"; x.beginPath(); x.roundRect ? x.roundRect(bx, by, 280, 200, 32) : x.rect(bx, by, 280, 200); x.fill();
    if (im) { x.imageSmoothingEnabled = false; x.drawImage(im, bx + 32, by + 32, 48, 48) }
    x.fillStyle = "#ffffff"; x.font = F(800, 64); x.fillText(big, bx + 32, by + 150);
    x.fillStyle = "rgba(255,255,255,.55)"; x.font = F(600, 26); x.fillText(small, bx + 32, by + 184);
  });
  x.fillStyle = "rgba(255,255,255,.4)"; x.font = F(600, 28); x.fillText("Mi yo pixel sube de nivel cuando yo cumplo · Levo", 90, 1840);
  c.toBlob(async blob => {
    const file = new File([blob], "levo-dia-completo.png", { type: "image/png" });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: "Día completo en Levo" }); return } } catch (e) { if (e && e.name === "AbortError") return }
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "levo-dia-completo.png"; document.body.append(a); a.click(); a.remove();
  }, "image/png");
}

/* ---------- Enganches ---------- */
const _drJ = window.dailyRender; window.dailyRender = () => { if (_drJ) _drJ(); decorate() };
if ($("sndBtn")) $("sndBtn").onclick = toggleSound;
render(); decorate();
/* Capturas de demostración: ?shot=celebra | casa | premios (solo con #demo) */
(() => { const shot = new URLSearchParams(location.search).get("shot"); if (!shot || location.hash !== "#demo") return; document.documentElement.classList.add("shot"); if (shot === "celebra") setTimeout(() => celebrate(true), 300); else if (shot !== "cuerpo") setTab(shot) })();
