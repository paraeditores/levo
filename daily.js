/* Levo · Regalo diario (calendario de 7 días) y reto semanal. */
const CAL7 = [{ c: 10 }, { c: 15 }, { c: 20 }, { c: 25 }, { c: 30 }, { c: 40 }, { c: 50, escudo: true }];
const localDay = iso => fmt(new Date(iso));
const claimDays = () => new Set(purchases.filter(p => p.kind === "diario").map(p => localDay(p.at)));
function claimStreak() { const s = claimDays(); let n = 0; const d = dateOf(-1); while (s.has(fmt(d))) { n++; d.setDate(d.getDate() - 1) } return n }
const claimedToday = () => claimDays().has(dayKey(0));
const dailyPos = () => claimedToday() ? (claimStreak()) % 7 : claimStreak() % 7; /* índice del regalo de hoy */
const dailyLocked = () => frac(dayKey(0)) === 0;

/* ---------- Reto semanal ---------- */
function weekInfo() {
  const d = dateOf(0), wd = (d.getDay() + 6) % 7, mon = new Date(d); mon.setDate(d.getDate() - wd);
  const ds = Array.from({ length: 7 }, (_, i) => { const x = new Date(mon); x.setDate(mon.getDate() + i); return fmt(x) });
  const t = new Date(Date.UTC(mon.getFullYear(), mon.getMonth(), mon.getDate() + 3)), y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
  const wk = 1 + Math.round(((t - y0) / 864e5 - 3 + (y0.getUTCDay() + 6) % 7) / 7);
  return { key: `${t.getUTCFullYear()}-S${String(wk).padStart(2, "0")}`, days: ds, left: 6 - wd, n: wk };
}
const hashN = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
function reto() {
  const w = weekInfo(), seed = hashN(w.key), past = w.days.filter(k => k <= dayKey(0));
  const star = habits.length ? habits[seed % habits.length] : null;
  const areas = AREAS.filter(([a]) => habits.some(h => h.area === a)), ar = areas.length ? areas[seed % areas.length] : AREAS[0];
  const T = [
    { ico: "🗓️", t: "Semana sólida", d: "5 días al 60 % o más", goal: 5, v: past.filter(k => frac(k) >= .6).length },
    { ico: "💯", t: "Doble perfecto", d: "2 días al 100 %", goal: 2, v: past.filter(k => frac(k) === 1).length },
    star && { ico: "⭐", t: "Hábito estrella", d: `«${star.name}» 5 días`, goal: 5, v: past.filter(k => doneFor(k)[star.id]).length },
    { ico: "🔥", t: `${ar[1]} en llamas`, d: `${ar[1]} al 100 % 4 días`, goal: 4, v: past.filter(k => frac(k, ar[0]) === 1).length },
    { ico: "⚡", t: "Arranque fuerte", d: "Lunes, martes y miércoles al 60 %", goal: 3, v: w.days.slice(0, 3).filter(k => k <= dayKey(0) && frac(k) >= .6).length },
  ].filter(Boolean);
  /* solo retos que se podían cumplir desde el lunes (o desde que empezaste a usar Levo) */
  const ref = START > w.days[0] ? START : w.days[0], avail = w.days.filter(k => k >= ref).length;
  const ok = T.filter(x => x.t === "Arranque fuerte" ? ref <= w.days[0] : x.goal <= avail);
  const pool = ok.length ? ok : T, r = pool[seed % pool.length];
  return { ...r, key: w.key, left: w.left, reward: 150, done: r.v >= r.goal, claimed: purchases.some(p => p.kind === "reto" && p.item === "reto:" + w.key) };
}
function renderReto() {
  const el = $("reto"); if (!el) return;
  if (!uid || !habits.length) { el.hidden = true; return }
  const r = reto(); el.hidden = false; el.className = "reto" + (r.done ? " done" : "") + (r.claimed ? " claimed" : "");
  const dots = Array.from({ length: r.goal }, (_, i) => `<i class="${i < r.v ? "on" : ""}"></i>`).join("");
  el.innerHTML = `<div class="reto-top"><span class="reto-ico">${r.ico}</span><div class="pt"><small>Reto de la semana · ${r.claimed ? "completado" : r.left === 0 ? "último día" : `quedan ${r.left + 1} días`}</small><b></b><span class="reto-d"></span></div><span class="reto-prize">${money(r.reward)}</span></div><div class="dots">${dots}</div>${r.done && !r.claimed ? `<button class="btn accent" id="retoBtn">Reclamar ${r.reward} monedas</button>` : ""}`;
  el.querySelector("b").textContent = r.t; el.querySelector(".reto-d").textContent = `${r.d} · ${Math.min(r.v, r.goal)}/${r.goal}`;
  const b = $("retoBtn"); if (b) b.onclick = () => {
    const row = { user_id: uid, item: "reto:" + r.key, kind: "reto", cost: -r.reward, at: new Date().toISOString() };
    purchases = [...purchases, row]; burst(el); renderCasa(); status(`Reto completado: +${r.reward} monedas.`);
    if (uid !== "demo") write(() => sb.from("purchases").insert(row));
  };
}

/* ---------- Regalo diario ---------- */
const dCss = document.createElement("style");
dCss.textContent = `
.dchip{position:absolute;left:10px;top:10px;z-index:2;border:0;border-radius:99px;padding:8px 12px 8px 10px;font-weight:700;font-size:13px;color:#3a2400;background:linear-gradient(135deg,#ffd60a,#ff9f0a);box-shadow:0 6px 18px rgba(255,159,10,.45);display:flex;align-items:center;gap:6px;animation:pulse 1.6s ease-in-out infinite}
.dchip.locked{background:rgba(255,255,255,.92);color:#1c1c1e;animation:none;box-shadow:0 4px 12px rgba(0,0,0,.25)}
.dmodal .cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;width:100%}
.dmodal .cal div{display:grid;justify-items:center;gap:4px;padding:8px 0;border-radius:12px;background:var(--soft);font-family:var(--rounded);font-weight:800;font-size:13px}
.dmodal .cal div small{font-size:10px;font-weight:700;color:var(--muted);font-family:var(--sans)}
.dmodal .cal div.got{background:color-mix(in srgb,var(--vida) 22%,transparent);color:var(--vida)}
.dmodal .cal div.now{background:linear-gradient(135deg,#ffd60a,#ff9f0a);color:#3a2400;transform:scale(1.08);box-shadow:0 6px 16px rgba(255,159,10,.4)}
.dmodal .cal div.now small{color:#3a2400}
.giftbox{width:110px;height:100px;position:relative;margin-top:6px}
.giftbox .b{position:absolute;left:10px;right:10px;bottom:0;height:62px;border-radius:12px;background:linear-gradient(90deg,#ff2d55 0 42%,#ffd60a 42% 58%,#ff2d55 58%);box-shadow:inset 0 -8px 0 rgba(0,0,0,.18)}
.giftbox .l{position:absolute;left:0;right:0;top:18px;height:24px;border-radius:10px;background:linear-gradient(90deg,#ff375f 0 42%,#ffd60a 42% 58%,#ff375f 58%);box-shadow:0 4px 0 rgba(0,0,0,.15)}
.giftbox .k{position:absolute;left:50%;top:0;width:44px;height:24px;margin-left:-22px;background:radial-gradient(circle at 30% 60%,#ffd60a 0 9px,transparent 10px),radial-gradient(circle at 70% 60%,#ffd60a 0 9px,transparent 10px)}
.giftbox.shake{animation:shake 1.2s ease-in-out infinite}
.giftbox.open .l{animation:lid .6s var(--spring) forwards}
@keyframes lid{to{transform:translateY(-60px) rotate(-25deg);opacity:0}}
.reto{background:var(--surface);border-radius:var(--r);padding:16px;display:grid;gap:12px;position:relative;overflow:hidden}
.reto::before{content:"";position:absolute;inset:0;background:radial-gradient(120% 80% at 100% 0%,color-mix(in srgb,var(--mente) 22%,transparent),transparent 60%);pointer-events:none}
.reto.done::before{background:radial-gradient(120% 80% at 100% 0%,color-mix(in srgb,var(--vida) 28%,transparent),transparent 60%)}
.reto-top{display:flex;align-items:center;gap:12px;position:relative}
.reto-ico{width:48px;height:48px;border-radius:14px;display:grid;place-items:center;font-size:26px;background:var(--soft);flex:none}
.reto small{font-size:12px;font-weight:700;color:var(--mente);text-transform:uppercase;letter-spacing:.02em}
.reto.done small{color:var(--vida)}
.reto b{font-size:19px;font-weight:800;letter-spacing:-.03em;display:block}
.reto-d{font-size:14px;color:var(--muted)}
.reto-prize{font-family:var(--rounded);font-weight:800;font-size:15px;padding:6px 10px;border-radius:99px;background:var(--soft);white-space:nowrap}
.dots{display:flex;gap:6px;position:relative}
.dots i{flex:1;height:8px;border-radius:99px;background:var(--soft);transition:background .4s var(--ease)}
.dots i.on{background:linear-gradient(90deg,var(--mente),#0a84ff)}
.reto.done .dots i.on{background:linear-gradient(90deg,var(--vida),#0a84ff)}
.reto.claimed{opacity:.75}
.reto .btn{position:relative}
`;
document.head.append(dCss);

function dailyModal() {
  let m = $("dailyModal"); if (m) return m;
  m = document.createElement("div"); m.id = "dailyModal"; m.className = "modal dmodal"; m.hidden = true; m.setAttribute("role", "dialog"); m.setAttribute("aria-label", "Regalo diario");
  m.innerHTML = `<div class="modal-in"><div class="giftbox shake" id="dBox"><span class="b"></span><span class="l"></span><span class="k"></span></div><div class="result" id="dRes" hidden><span id="dLabel"></span><b id="dWhat"></b></div><p class="lead" id="dText" style="margin:0;color:var(--muted);font-size:15px"></p><div class="cal" id="dCal"></div><button class="btn accent" id="dOpen" style="width:100%"></button><button class="ghost" id="dClose" style="width:100%">Cerrar</button></div>`;
  document.body.append(m);
  $("dClose").onclick = () => { m.hidden = true };
  return m;
}
function openDaily() {
  const m = dailyModal(), pos = dailyPos(), got = claimedToday(), locked = dailyLocked();
  m.hidden = false; $("dRes").hidden = true; $("dBox").className = "giftbox" + (got ? "" : " shake"); $("dBox").hidden = got;
  $("dCal").innerHTML = CAL7.map((r, i) => `<div class="${i < pos || (got && i === pos) ? "got" : i === pos ? "now" : ""}"><small>Día ${i + 1}</small>${r.escudo ? "🛡️" : r.c}</div>`).join("");
  $("dText").textContent = got ? "Ya abriste el regalo de hoy. Vuelve mañana para no perder el calendario." : locked ? "Marca tu primer hábito de hoy para abrirlo." : "Si mañana vuelves, el regalo es mejor. Si fallas un día, el calendario empieza de cero.";
  const b = $("dOpen"); b.hidden = got; b.disabled = locked; b.textContent = locked ? "Marca un hábito primero" : "Abrir regalo";
  b.onclick = () => {
    const r = CAL7[pos]; b.hidden = true; $("dBox").className = "giftbox open";
    setTimeout(() => {
      const now = new Date().toISOString(), rows = [{ user_id: uid, item: "monedas", kind: "diario", cost: -r.c, at: now }];
      if (r.escudo) rows.push({ user_id: uid, item: "escudo-regalo", kind: "escudo", cost: 0, at: now });
      purchases = [...purchases, ...rows];
      $("dBox").hidden = true; $("dRes").hidden = false; $("dRes").style.setProperty("--rc", "#ff9f0a");
      $("dLabel").textContent = `Día ${pos + 1} de 7`; $("dWhat").textContent = `+${r.c} monedas` + (r.escudo ? " y un escudo" : "");
      $("dText").textContent = pos === 6 ? "Calendario completado. Mañana empieza otro." : `Mañana: ${CAL7[pos + 1].escudo ? "50 monedas y un escudo" : CAL7[pos + 1].c + " monedas"}.`;
      $("dCal").querySelectorAll("div")[pos].className = "got";
      burst($("dRes")); renderCasa();
      if (uid !== "demo") write(() => sb.from("purchases").insert(rows));
    }, 550);
  };
}
function renderDaily() {
  const c = $("dailyChip"); if (!c) return;
  if (!uid || !habits.length || claimedToday()) { c.hidden = true; return }
  c.hidden = false; const locked = dailyLocked();
  c.className = "dchip" + (locked ? " locked" : ""); c.textContent = locked ? "🎁 Marca 1 hábito y ábrelo" : `🎁 Regalo del día ${dailyPos() + 1}`;
}
/* Regalo flotando en la habitación */
window.roomExtras = x => {
  if (window._ownSet) return;
  if (!uid || !habits.length || claimedToday()) return;
  const [gx, gy] = P(1.2, 1.9), b = Math.round(Math.sin(Date.now() / 260) * 2) - 4;
  x.fillStyle = "rgba(0,0,0,.25)"; x.beginPath(); x.ellipse(gx, gy, 7, 2.5, 0, 0, Math.PI * 2); x.fill();
  const r = (a, c, w, h, col) => { x.fillStyle = col; x.fillRect(gx + a, gy + c + b, w, h) };
  r(-7, -12, 14, 11, "#1b1b1f"); r(-6, -11, 12, 9, "#ff2d55"); r(-1, -11, 2, 9, "#ffd60a");
  r(-8, -15, 16, 4, "#1b1b1f"); r(-7, -14, 14, 2, "#ff375f"); r(-1, -14, 2, 2, "#ffd60a");
  r(-4, -18, 3, 3, "#ffd60a"); r(1, -18, 3, 3, "#ffd60a");
  if (Math.floor(Date.now() / 400) % 3 === 0) { r(7, -20, 1, 1, "#ffffff"); r(-9, -16, 1, 1, "#ffffff") }
};
window.dailyRender = () => { renderDaily(); renderReto() };
if ($("dailyChip")) $("dailyChip").onclick = openDaily;
renderDaily(); renderReto();
