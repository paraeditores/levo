/* Levo · Tu mentor de disciplina. Cien días para esculpir a la persona que quieres ser.
   Una sola fuente de verdad: el estado S; todo se pinta desde él. */
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, "0");
const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dateOf = off => { const d = new Date(); d.setDate(d.getDate() + off); return d };
const dayKey = off => fmt(dateOf(off));
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const hhmm = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}` };
const DEMO = location.hash === "#demo";
const SHOT = new URLSearchParams(location.search).get("shot");

const sb = window.supabase.createClient(window.MINI.SUPABASE_URL, window.MINI.SUPABASE_ANON_KEY);
const S = { uid: null, ready: false, tab: "hoy", set: {}, profileOutfit: {}, habits: [], days: {}, journal: {}, bodyP: null, weighs: [], mTab: "lecciones", resetArm: false, open: {} };
const set = () => S.set;
const START = () => S.set.start || dayKey(0);
const look = () => S.set.look || "a";

/* ---------- utilidades ---------- */
function toast(t) { const el = $("status"); el.textContent = t; el.classList.add("in"); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("in"), 2800) }
const J = (k = dayKey(0)) => (S.journal[k] = S.journal[k] || {});
const doneFor = k => (S.days[k] && S.days[k].done) || {};
const habFrac = k => S.habits.length ? S.habits.filter(h => doneFor(k)[h.id]).length / S.habits.length : 0;
const toMin = t => { const [h, m] = (t || "05:00").split(":").map(Number); return h * 60 + m };
const waterGoal = () => S.bodyP && S.bodyP.weight_kg ? Math.round(Math.min(4, Math.max(1.5, S.bodyP.weight_kg * .033)) * 4) : 10;
const fq = (k = dayKey(0)) => fraseSellada(k);
const quoteById = id => { if (typeof id === "number") id = "s" + id; const n = +String(id).slice(1), f = id[0] === "e" ? FRASES_EXITO[n] : FRASES[n]; return f ? { id, t: f.t, a: f.a, acc: f.acc || (PRACTICAS[f.p] || {}).hoy } : null };
const dayNum = () => Math.max(1, Math.round((new Date(dayKey(0) + "T12:00") - new Date(START() + "T12:00")) / 864e5) + 1);
const dateLabel = k => new Date(k + "T12:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

/* ---------- sonido y vibración ---------- */
const SND = { ctx: null };
function ac() { if (set().sound === false) return null; try { if (!SND.ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; SND.ctx = new A() } if (SND.ctx.state === "suspended") SND.ctx.resume(); return SND.ctx } catch (e) { return null } }
function tone(f, d, { type = "sine", v = .2, t = 0, f2 } = {}) { const c = ac(); if (!c) return; const o = c.createOscillator(), g = c.createGain(), s = c.currentTime + t; o.type = type; o.frequency.setValueAtTime(f, s); if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + d); g.gain.setValueAtTime(.0001, s); g.gain.exponentialRampToValueAtTime(v, s + .008); g.gain.exponentialRampToValueAtTime(.0001, s + d); o.connect(g).connect(c.destination); o.start(s); o.stop(s + d + .03) }
function noise(d, { v = .3, t = 0, hp = 1500, bp } = {}) { const c = ac(); if (!c) return; const n = Math.floor(c.sampleRate * d), b = c.createBuffer(1, n, c.sampleRate), a = b.getChannelData(0); for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3); const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); fl.type = bp ? "bandpass" : "highpass"; fl.frequency.value = bp || hp; g.gain.value = v; s.buffer = b; s.connect(fl).connect(g).connect(c.destination); s.start(c.currentTime + t) }
const SFX = {
  tap: () => tone(1100, .05, { type: "triangle", v: .035 }),
  beat: () => { tone(64, .15, { v: .55 }); tone(56, .13, { v: .38, t: .17 }) },
  chisel: () => { noise(.09, { v: .55, hp: 2600 }); tone(2300, .4, { type: "triangle", v: .07, f2: 1600 }); tone(150, .14, { v: .32, f2: 70 }) },
  seal: () => { noise(.2, { v: .5, bp: 850 }); tone(330, .28, { type: "triangle", v: .12, f2: 110 }) },
  done: () => { tone(660, .5, { v: .09 }); tone(990, .7, { v: .07, t: .09 }) },
  sculpt: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 1, { v: .085, t: i * .12, type: "triangle" })),
};
let _hl = null;
function haptic(n = 1) {
  if (set().sound === false) return;
  try {
    if (navigator.vibrate) { if (!navigator.userActivation || navigator.userActivation.hasBeenActive) navigator.vibrate(n === 1 ? 14 : Array.from({ length: n * 2 - 1 }, (_, i) => i % 2 ? 50 : 22)); return }
    if (!_hl) { _hl = document.createElement("label"); _hl.setAttribute("aria-hidden", "true"); _hl.style.cssText = "position:fixed;left:-99px;top:0;width:1px;height:1px;overflow:hidden;opacity:0"; const i = document.createElement("input"); i.type = "checkbox"; i.setAttribute("switch", ""); _hl.append(i); document.body.append(_hl) }
    for (let k = 0; k < n; k++) setTimeout(() => _hl.click(), k * 110);
  } catch (e) { }
}
document.addEventListener("pointerdown", () => ac(), { once: true });

/* ---------- el ritual: ocho pasos ---------- */
const ORDER = ["wake", "frase", "breath", "aff", "tasks", "habits", "food", "exam"];
const NAME = { wake: "Despertar", frase: "Frase del día", breath: "Respirar", aff: "Afirmaciones", tasks: "Tareas del día", habits: "Hábitos", food: "Comidas y agua", exam: "Examen nocturno" };
function steps(k) {
  const j = S.journal[k] || {}, aff = (j.aff || []).filter(s => s && s.trim()).length, tasks = (j.tasks || []).filter(t => t && t.t && t.t.trim()), tdone = tasks.filter(t => t.done).length, meals = ["desayuno", "comida", "cena"].filter(m => j.meals && j.meals[m]).length;
  return {
    wake: !!j.wake, frase: !!j.commit, breath: !!j.breath, aff: aff >= 3,
    tasks: tasks.length >= 1 && tdone >= Math.min(2, tasks.length), habits: S.habits.length ? habFrac(k) >= .6 : false,
    food: meals >= 3, exam: !!(j.exam && (j.exam.bien || j.exam.mejorar || j.exam.gracias)),
  };
}
const nDone = k => Object.values(steps(k)).filter(Boolean).length;
const isRitual = k => nDone(k) >= 6;
function streak() { let n = 0, o = isRitual(dayKey(0)) ? 0 : -1; while (dayKey(o) >= START() && isRitual(dayKey(o)) && n < 999) { n++; o-- } return n }
function wakeStreak() { const tgt = toMin(set().wake) + 15; let n = 0, o = 0; const ok = k => S.journal[k] && S.journal[k].wake && toMin(S.journal[k].wake) <= tgt; if (!ok(dayKey(0))) o = -1; while (dayKey(o) >= START() && ok(dayKey(o)) && n < 999) { n++; o-- } return n }
function sculpted() { let n = 0; for (let o = 0; dayKey(o) >= START(); o--) { if (isRitual(dayKey(o))) n++; if (o < -800) break } return n }
const myStatue = (days = sculpted()) => statueSVG(faseDe(days).i, set().name, days, look());

/* ---------- guardar ---------- */
let chain = Promise.resolve();
const write = fn => { if (DEMO || !S.uid) return; chain = chain.then(async () => { const r = await fn(); if (r && r.error) throw r.error }).catch(() => toast("No se pudo guardar. Revisa la conexión.")) };
const _jt = {};
function saveJ(k = dayKey(0)) { if (DEMO) return; clearTimeout(_jt[k]); _jt[k] = setTimeout(() => write(() => sb.from("journal").upsert({ user_id: S.uid, day: k, data: S.journal[k] || {}, updated_at: new Date().toISOString() }, { onConflict: "user_id,day" })), 600) }
function saveSet() { S.profileOutfit = { ...S.profileOutfit, lv2: S.set }; write(() => sb.from("profile").upsert({ user_id: S.uid, outfit: S.profileOutfit, updated_at: new Date().toISOString() }, { onConflict: "user_id" })) }
function toggleHabit(h) {
  const k = dayKey(0), cur = { ...doneFor(k) }; if (cur[h.id]) delete cur[h.id]; else cur[h.id] = true;
  S.days = { ...S.days, [k]: { done: cur } };
  write(() => sb.from("days").upsert({ user_id: S.uid, day: k, done: cur, updated_at: new Date().toISOString() }, { onConflict: "user_id,day" }));
}

/* ---------- cargar ---------- */
async function load() {
  const since = fmt(new Date(Date.now() - 400 * 864e5));
  const [p, h, d, j, bp, w] = await Promise.all([
    sb.from("profile").select("outfit").maybeSingle(),
    sb.from("habits").select("id,name,area,ord").eq("active", true).order("ord"),
    sb.from("days").select("day,done").gte("day", since),
    sb.from("journal").select("day,data").gte("day", since),
    sb.from("body_profile").select("height_cm,weight_kg,goal").maybeSingle(),
    sb.from("weighins").select("day,kg").order("day"),
  ]);
  S.profileOutfit = (p.data && p.data.outfit) || {}; S.set = S.profileOutfit.lv2 || {};
  S.habits = h.data || []; S.days = {}; (d.data || []).forEach(r => S.days[r.day] = { done: r.done || {} });
  S.journal = {}; (j.data || []).forEach(r => S.journal[r.day] = r.data || {});
  S.bodyP = bp.data || null; S.weighs = w.data || [];
  S.ready = true;
  try { localStorage.setItem("levo2-cache", JSON.stringify({ uid: S.uid, set: S.set, profileOutfit: S.profileOutfit, habits: S.habits, days: S.days, journal: S.journal, bodyP: S.bodyP, weighs: S.weighs })) } catch (e) { }
  if (!busy()) route();
}
function bootCache() { try { const c = JSON.parse(localStorage.getItem("levo2-cache") || "null"); if (c) { Object.assign(S, c, { ready: true }); route() } } catch (e) { } }
const busy = () => $("sheet") || document.querySelector(".moment") || (document.querySelector(".onb") && renderOnb.o && renderOnb.o.step > 0);

/* ---------- iconos de línea ---------- */
const IC = {
  wake: '<svg viewBox="0 0 24 24"><path d="M3 18h18M6 18a6 6 0 0 1 12 0M12 4v3M4.9 8.9l2 2M19.1 8.9l-2 2"/></svg>',
  frase: '<svg viewBox="0 0 24 24"><path d="M5 4h14v16l-7-4-7 4z"/></svg>',
  breath: '<svg viewBox="0 0 24 24"><path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h8"/></svg>',
  aff: '<svg viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/></svg>',
  tasks: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/></svg>',
  habits: '<svg viewBox="0 0 24 24"><path d="M12 21c-4-3-7-6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4-3 7-7 10z"/></svg>',
  food: '<svg viewBox="0 0 24 24"><path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 21V3c-2 1-3 4-3 8h3"/></svg>',
  exam: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  mentor: '<svg viewBox="0 0 24 24"><path d="M6 20c0-4 2.5-6 6-6s6 2 6 6M12 14a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM4 9c1-3 3-5 5-6M20 9c-1-3-3-5-5-6"/></svg>',
  laurel: '<svg viewBox="0 0 24 24"><path d="M12 21V9M12 9c-3-1-5-4-5-7M12 9c3-1 5-4 5-7M12 14c-3 0-5-2-6-4M12 14c3 0 5-2 6-4M12 18c-2.5 0-4.5-1.5-5.5-3M12 18c2.5 0 4.5-1.5 5.5-3"/></svg>',
  hoy: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>',
  estatua: '<svg viewBox="0 0 24 24"><path d="M7 21h10M9 21v-3h6v3M12 18c-3.5 0-5.5-2-5.5-4.5 0-1.6 1-2.7 2.2-3.3A3.9 3.9 0 0 1 12 3a3.9 3.9 0 0 1 3.3 7.2c1.2.6 2.2 1.7 2.2 3.3C17.5 16 15.5 18 12 18z"/></svg>',
  perfil: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
};
const CHK = IC.check.replace("<svg", '<svg width="20" height="20" style="fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round"');

/* ---------- navegación ---------- */
const TABS = [["hoy", "Hoy"], ["mentor", "Mentor"], ["estatua", "Estatua"], ["perfil", "Perfil"]];
function route() {
  const app = $("app");
  if (!S.uid && !DEMO) return renderGate(app);
  if (!S.ready) return;
  if (!set().v3) return renderOnb(app);
  renderMain(app);
}
function renderMain(app) {
  if (!$("view")) app.innerHTML = `<main id="view"></main><nav class="tabbar" aria-label="Secciones">${TABS.map(([k, n]) => `<button data-tab="${k}">${IC[k]}${n}</button>`).join("")}</nav>`;
  app.querySelectorAll("[data-tab]").forEach(b => { b.setAttribute("aria-selected", b.dataset.tab === S.tab); b.onclick = () => { if (S.tab !== b.dataset.tab) SFX.tap(); S.tab = b.dataset.tab; window.scrollTo(0, 0); renderMain(app) } });
  const v = $("view"); v.className = "wrap";
  S.animate = S.lastTab !== S.tab; S.lastTab = S.tab;
  ({ hoy: renderHoy, mentor: renderMentor, estatua: renderEstatua, perfil: renderPerfil })[S.tab](v);
  if (S.animate) { v.classList.add("anim"); [...v.children].forEach((c, i) => { c.classList.add("rise"); c.style.setProperty("--i", Math.min(i, 8)) }) } else v.classList.remove("anim");
}

/* ================= HOY ================= */
function heroHTML() {
  const d = dayNum(), sc = sculpted(), fz = faseDe(sc), nx = fz.next, n = nDone(dayKey(0));
  return `<section class="hero">
    <div class="bar-top"><span class="wordmark">LEVO</span><button class="help" id="help" aria-label="Cómo funciona Levo">?</button></div>
    <div class="hgrid">
      <div class="hleft"><div class="daynum"><span>DÍA</span><b class="${d >= 100 ? "d3" : ""}" data-count="${d}">${d}</b><small>DE 100</small></div>
        <p class="hphase">${esc(fz.name)}</p><p class="hphase-sub">${nx ? `Faltan ${nx[0] - sc} ${nx[0] - sc === 1 ? "día esculpido" : "días esculpidos"} para «${esc(nx[1])}»` : "Obra terminada. Cuídala cada día."}</p></div>
      <div class="stage" id="stage"><div class="beat"><b></b><i></i><i></i></div>${myStatue(sc)}</div>
    </div>${dustHTML()}
    <div class="today"><div class="tt"><span>Hoy llevas</span><b>${n} de 8 pasos</b></div><div class="segs">${ORDER.map((_, i) => `<i class="${i < n ? "on" : ""} ${i === 5 ? "six" : ""}" style="--i:${i}"></i>`).join("")}</div>
      <small>${n >= 6 ? "Día esculpido. Lo que hagas ahora es pulir." : `Con 6 pasos tu estatua sale un poco más del bloque. Te ${6 - n === 1 ? "falta 1" : `faltan ${6 - n}`}.`}</small></div>
  </section>`;
}
const _r = k => { const v = Math.sin(k * 91.7 + 13.3) * 43758.5453; return v - Math.floor(v) };
const dustHTML = () => `<div class="dust" aria-hidden="true">${Array.from({ length: 16 }, (_, i) => `<i style="left:${(_r(i) * 100).toFixed(1)}%;width:${(2 + _r(i + 40) * 3).toFixed(1)}px;height:${(2 + _r(i + 40) * 3).toFixed(1)}px;animation-duration:${(6 + _r(i + 9) * 7).toFixed(1)}s;animation-delay:-${(_r(i + 3) * 9).toFixed(1)}s"></i>`).join("")}</div>`;
function countUps(root) { root.querySelectorAll("[data-count]").forEach(el => { const to = +el.dataset.count; if (SHOT || matchMedia("(prefers-reduced-motion: reduce)").matches || !S.animate) { el.textContent = to; return } const t0 = performance.now(), ms = 1100; const step = now => { const p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(to * e); if (p < 1) requestAnimationFrame(step) }; el.textContent = 0; requestAnimationFrame(step) }) }
function tilt(hero) { const st = hero.querySelector(".stage"); if (!st) return; hero.addEventListener("pointermove", e => { const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; st.style.setProperty("--ry", (x * 14).toFixed(2) + "deg"); st.style.setProperty("--rx", (-y * 10).toFixed(2) + "deg") }); hero.addEventListener("pointerleave", () => { st.style.setProperty("--ry", "0deg"); st.style.setProperty("--rx", "0deg") }) }
function mentorLine() {
  const k = dayKey(0), st = steps(k), n = nDone(k), hr = new Date().getHours(), d = dayNum(), why = set().why;
  const yRit = d > 1 && isRitual(dayKey(-1)), two = d > 2 && !isRitual(dayKey(-1)) && !isRitual(dayKey(-2));
  if (d === 1 && n === 0) return "Hoy das el primer golpe. No busques hacerlo perfecto: busca empezar.";
  if (n >= 8) return "Has cumplido todo lo que te prometiste. Descansa: mañana seguimos.";
  if (n >= 6) return "Hoy ya has esculpido. Lo que hagas ahora es pulir.";
  if (two && why) return `Dos días sin esculpir. Recuerda por qué empezaste: «${esc(why)}». Hoy solo necesitas 6 pasos.`;
  if (d > 1 && !yRit && hr < 14) return "Ayer no esculpiste. Una caída no te define; dos seguidas empiezan a hacerlo. Hoy es sagrado.";
  if (!st.wake && hr < 11) return "Tu primera victoria es levantarte. Lo demás viene después.";
  if (hr >= 20 && !st.exam) return "Antes de dormir, examina tu día. Así se aprende del camino.";
  const s = streak(); if (s >= 3) return `Llevas ${s} días seguidos. La disciplina ya trabaja para ti: no la dejes sola hoy.`;
  const next = ORDER.find(x => !st[x]); return `Tu siguiente paso: ${NAME[next].toLowerCase()}. Pequeño y ahora.`;
}
function fraseHTML() {
  const j = J(), q = fq();
  if (!j.open) return `<section class="card frase" id="frase"><div class="sealrow"><span class="seal" id="sealIc">${IC.laurel}</span><div><p class="eyebrow b">Frase del día · sellada</p><h3>Hoy te espera una frase de ${esc(q.a)}</h3></div></div><p class="sub">Trae una acción para ti. Solo se abre una vez al día.</p><button class="btn" id="openSeal">Romper el sello</button></section>`;
  let h = `<section class="card frase" id="frase"><p class="eyebrow b">Frase del día</p><p class="quote">${esc(q.t)}</p><p class="who">${esc(q.a)}</p><div class="accbox"><p class="eyebrow">Tu acción de hoy</p><p>${esc(q.acc)}</p></div>`;
  if (!j.commit) h += `<button class="holdbtn" id="hold"><span class="fill"></span><span class="lbl">Mantén pulsado para comprometerte</span></button><p class="holdhint">Es tu firma: un compromiso contigo. Siente el latido.</p>`;
  else if (!j.practiced) h += `<p class="okline">${CHK} Comprometido</p><button class="btn ghost" id="didIt">Ya hice mi acción</button>`;
  else h += `<p class="okline">${CHK} Acción hecha. Palabra cumplida.</p>`;
  return h + `</section>`;
}
function stepStatus(key) {
  const k = dayKey(0), j = J(), st = steps(k), tgt = set().wake || "05:00";
  const aff = (j.aff || []).filter(s => s && s.trim()).length, tasks = (j.tasks || []).filter(t => t && t.t && t.t.trim()), td = tasks.filter(t => t.done).length, meals = ["desayuno", "comida", "cena"].filter(m => j.meals && j.meals[m]).length, hd = S.habits.filter(h => doneFor(k)[h.id]).length;
  return {
    wake: j.wake ? `En pie a las ${j.wake}` : `Levántate a las ${tgt}`,
    frase: st.frase ? (j.practiced ? "Acción hecha" : "Comprometido") : j.open ? "Comprométete con su acción" : "Ábrela y comprométete",
    breath: st.breath ? "Un minuto de calma" : "1 minuto guiado",
    aff: st.aff ? "3 de 3 escritas" : aff ? `${aff} de 3 escritas` : "Escribe quién eliges ser",
    tasks: tasks.length ? `${td} de ${tasks.length} hechas` : "Elige tus 3 tareas clave",
    habits: S.habits.length ? `${hd} de ${S.habits.length} hechos` : "Añade tus hábitos",
    food: `${meals} de 3 comidas · ${j.water || 0} vasos`,
    exam: st.exam ? "Día examinado" : "3 preguntas antes de dormir",
  }[key];
}
function renderHoy(v) {
  const L = leccion(dayNum());
  v.innerHTML = heroHTML() + `<button class="card mentor" id="mentorCard"><span class="emblem">${IC.mentor}</span><span><p class="eyebrow">Tu mentor</p><p class="ml">${mentorLine()}</p><span class="les">${J().lesson ? "✓ " : ""}Lección ${dayNum()}: ${esc(L.t)} →</span></span></button>` + fraseHTML()
    + `<div class="sec-h"><div><p class="eyebrow b">Tu camino de hoy</p><h2 class="title">8 pasos</h2></div><p class="sub" style="text-align:right;max-width:50%;font-size:14px">Toca un paso para hacerlo. Con 6, el día cuenta.</p></div><div class="trail" id="trail"></div>`;
  $("help").onclick = () => { SFX.tap(); openSheet("guide") };
  $("mentorCard").onclick = () => { SFX.tap(); S.tab = "mentor"; window.scrollTo(0, 0); renderMain($("app")) };
  bindFrase();
  drawTrail();
  countUps(v); tilt(v.querySelector(".hero"));
}
function bindFrase() {
  if ($("openSeal")) $("openSeal").onclick = () => {
    SFX.seal(); haptic(2); const ic = $("sealIc"); if (ic) { ic.classList.add("opening"); const w = document.createElement("span"); w.className = "shock"; ic.parentElement.style.position = "relative"; ic.parentElement.append(w) }
    setTimeout(() => { J().open = true; saveJ(); $("frase").outerHTML = fraseHTML(); bindFrase(); $("frase").animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 500, easing: "ease-out" }) }, 520);
  };
  if ($("hold")) bindHold($("hold"), 1700, () => { const p = snapshot(); J().commit = true; saveJ(); renderHoy($("view")); celebrate(p, "Compromiso firmado") });
  if ($("didIt")) $("didIt").onclick = () => { J().practiced = true; saveJ(); SFX.done(); haptic(); toast("Acción hecha. Así se cumple la palabra."); $("frase").outerHTML = fraseHTML(); bindFrase() };
}
/* El sendero: nodos que serpentean de izquierda a derecha y bajan hacia la meta */
const XS = [.22, .62, .8, .42, .2, .6, .78, .4];
function drawTrail() {
  const t = $("trail"); if (!t) return;
  const W = t.clientWidth || 375, gap = 108, y0 = 58, k = dayKey(0), st = steps(k), now = ORDER.findIndex(x => !st[x]);
  const P = XS.map((x, i) => [x * W, y0 + i * gap]), goal = [W * .5, y0 + 8 * gap + 6], all = [...P, goal], H = goal[1] + 150;
  t.style.height = H + "px";
  const seg = (a, b) => `M${a[0]} ${a[1]}C${a[0]} ${a[1] + gap * .55} ${b[0]} ${b[1] - gap * .55} ${b[0]} ${b[1]}`;
  let svg = "", chev = "";
  all.forEach((p, i) => {
    if (!i) return; const a = all[i - 1], doneSeg = st[ORDER[i - 1]] && (i === 8 ? isRitual(k) : st[ORDER[i]]);
    svg += `<path d="${seg(a, p)}" ${doneSeg ? `class="dn" pathLength="1" style="--i:${i}"` : ""} fill="none" stroke="${doneSeg ? "var(--blue)" : "var(--faint)"}" stroke-opacity="${doneSeg ? 1 : .6}" stroke-width="${doneSeg ? 4 : 2.5}" stroke-linecap="round" ${doneSeg ? "" : 'stroke-dasharray="2 9"'}/>`;
    const mx = (a[0] + p[0]) / 2, my = (a[1] + p[1]) / 2, ang = Math.atan2(p[1] - a[1], p[0] - a[0]) * 180 / Math.PI - 90;
    chev += `<path d="M-6 -3L0 3L6 -3" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)}) rotate(${ang.toFixed(0)})" fill="none" stroke="var(--blue)" stroke-opacity=".55" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
  let html = `<svg class="tr" viewBox="0 0 ${W} ${H}" aria-hidden="true">${svg}${chev}</svg>`;
  ORDER.forEach((key, i) => {
    const [x, y] = P[i], done = st[key], isNow = i === now, left = XS[i] >= .5;
    html += `<button class="node ${done ? "done" : ""} ${isNow ? "now" : ""}" data-step="${key}" style="left:${x}px;top:${y}px;--i:${i}" aria-label="${i + 1}. ${NAME[key]}: ${esc(stepStatus(key))}">${done ? IC.check : IC[key]}<span class="num">${i + 1}</span></button>`;
    html += `<button class="nlabel ${left ? "l" : "r"}" data-step="${key}" style="top:${y}px;${left ? `right:${W - x + 42}px` : `left:${x + 42}px`}" tabindex="-1">${isNow ? `<span class="now-pill">Ahora</span>` : ""}<b>${NAME[key]}</b><small>${esc(stepStatus(key))}</small></button>`;
  });
  html += `<div class="goal" style="left:${goal[0]}px;top:${goal[1] - 20}px"><div class="gm">${myStatue()}</div><p>${isRitual(k) ? "Hoy ya has esculpido" : "Con 6 pasos, tu estatua avanza"}${nextPiece() ? `<br><span style="color:var(--blue)">Próxima pieza: ${esc(nextPiece().n)} en ${nextPiece().d - sculpted()} ${nextPiece().d - sculpted() === 1 ? "día" : "días"}</span>` : ""}</p></div>`;
  t.innerHTML = html;
  t.querySelectorAll("[data-step]").forEach(b => b.onclick = () => { SFX.tap(); const key = b.dataset.step; if (key === "frase") { const f = $("frase"); f.scrollIntoView({ behavior: "smooth", block: "center" }); f.animate([{ boxShadow: "0 0 0 4px var(--blue)" }, { boxShadow: "0 0 0 0 transparent" }], { duration: 1400 }) } else openSheet(key) });
}
addEventListener("resize", () => { if (S.tab === "hoy") drawTrail() });

/* Mantener pulsado: el latido se acelera mientras se llena */
function bindHold(btn, ms, onDone) {
  let raf = 0, t0 = 0, lastBeat = 0; const fill = btn.querySelector(".fill");
  const stop = reset => { cancelAnimationFrame(raf); raf = 0; btn.classList.remove("on"); if (reset) fill.style.transform = "scaleX(0)" };
  const loop = now => { const p = Math.min(1, (now - t0) / ms); fill.style.transform = `scaleX(${p})`; if (now - lastBeat > 720 - 500 * p) { lastBeat = now; SFX.beat(); haptic() } if (p >= 1) { stop(false); onDone(); return } raf = requestAnimationFrame(loop) };
  btn.addEventListener("pointerdown", e => { e.preventDefault(); try { btn.setPointerCapture(e.pointerId) } catch (_) { } t0 = performance.now(); lastBeat = 0; btn.classList.add("on"); raf = requestAnimationFrame(loop) });
  const up = () => { if (!raf) return; const p = (performance.now() - t0) / ms; stop(true); if (p < .95) toast("Mantén pulsado hasta que se llene") };
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(ev => btn.addEventListener(ev, up));
  btn.addEventListener("contextmenu", e => e.preventDefault());
  btn.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onDone() } });
}

/* Celebrar: cincel al cumplir un paso, momento a pantalla completa al esculpir el día o cambiar de forma */
const snapshot = () => { const k = dayKey(0); return { st: steps(k), n: nDone(k), rit: isRitual(k), sc: sculpted() } };
function burst(el, big) {
  if (!el) return;
  const host = el.closest(".hero, .moment") || el.parentElement, r = el.getBoundingClientRect(), hr = host.getBoundingClientRect(), cx = r.left - hr.left + r.width * .5, cy = r.top - hr.top + r.height * .4;
  for (let i = 0; i < (big ? 30 : 18); i++) {
    const c = document.createElement("div"), sz = 3 + Math.random() * 6, a = Math.random() * Math.PI * 2, v = 50 + Math.random() * (big ? 180 : 120);
    c.className = "chip"; c.style.cssText = `left:${cx + (Math.random() - .5) * 50}px;top:${cy + (Math.random() - .5) * 70}px;width:${sz}px;height:${sz}px`; host.appendChild(c);
    c.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: `translate(${Math.cos(a) * v}px,${Math.sin(a) * v * .7 + 80}px) rotate(${(Math.random() - .5) * 720}deg)`, opacity: 0 }], { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.15,.7,.35,1)" }).onfinish = () => c.remove();
  }
  el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-4px) rotate(-1deg)" }, { transform: "translateX(3px) rotate(1deg)" }, { transform: "translateX(0)" }], { duration: 320 });
}
function celebrate(p, label) {
  const now = snapshot(), newly = ORDER.filter(k => !p.st[k] && now.st[k]);
  if (newly.length) { SFX.chisel(); haptic(2); setTimeout(() => burst($("stage")), 60); toast(`${label || NAME[newly[newly.length - 1]] + ": hecho"} · ${now.n} de 8`) }
  const fN = faseDe(now.sc), fP = faseDe(p.sc);
  const q = [];
  if (fN.i > fP.i) q.push({ big: "Nueva forma", title: fN.name, text: fN.txt });
  else if (!p.rit && now.rit) q.push({ big: "Día esculpido", title: `Día ${dayNum()}`, text: `${now.n} de 8 pasos. Tu estatua ha salido un poco más del bloque.` });
  else if (now.n === 8 && p.n < 8) q.push({ big: "Día completo", title: "8 de 8", text: "Hoy has cumplido todo lo que te prometiste." });
  GALERIA.forEach(pc => { if (pc.d > p.sc && pc.d <= now.sc) q.push({ big: "Nueva pieza", title: pc.n, text: pc.t + " Ya está en tu galería.", svg: pieceSVG(pc), piece: true }) });
  if (q.length) setTimeout(() => momentQueue(q), 1000);
}
const momentQueue = q => { if (!q.length) return; const m = q.shift(); moment({ ...m, onClose: () => setTimeout(() => momentQueue(q), 250) }) };
function moment({ big, title, text, btn = "Seguir", days = sculpted(), onClose, svg, piece }) {
  const el = document.createElement("div"); el.className = "moment" + (piece ? " piece" : ""); el.setAttribute("role", "dialog");
  el.innerHTML = `<div class="mstage" id="mst"><div class="rays"></div>${svg || statueSVG(faseDe(days).i, set().name, days, look())}</div><p class="big">${big}</p><h2>${esc(title)}</h2><p>${esc(text)}</p><button class="btn white" id="mok">${btn}</button>`;
  document.body.append(el); SFX.sculpt(); haptic(3);
  setTimeout(() => burst($("mst"), true), 250);
  $("mok").onclick = () => { SFX.tap(); el.remove(); if (onClose) onClose() };
}

/* ---------- hojas: un paso cada vez ---------- */
let pending = null;
function closeSheet() { const s = $("sheet"); if (s) s.remove(); document.body.classList.remove("lock"); clearInterval(openSheet._iv); const p = pending; pending = null; route(); if (p && S.tab === "hoy") setTimeout(() => celebrate(p), 150) }
function openSheet(key) {
  if (!pending && ORDER.includes(key)) pending = snapshot();
  let s = $("sheet"); if (!s) { s = document.createElement("div"); s.id = "sheet"; s.className = "sheet"; s.setAttribute("role", "dialog"); document.body.append(s) }
  document.body.classList.add("lock"); clearInterval(openSheet._iv);
  const i = ORDER.indexOf(key);
  s.innerHTML = `<div class="sheet-in"><div class="sheet-head"><p class="eyebrow b">${i >= 0 ? `Paso ${i + 1} de 8` : ""}</p><button class="x" id="sx" aria-label="Cerrar">×</button></div><div class="sheet-body" id="sb"></div><div class="sheet-foot" id="sf"></div></div>`;
  $("sx").onclick = () => { SFX.tap(); closeSheet() };
  SHEETS[key]($("sb"), $("sf"));
}
const footBtn = (f, label, fn, cls = "btn") => { const b = document.createElement("button"); b.className = cls; b.textContent = label; b.onclick = fn; f.append(b); return b };
const SHEETS = {
  wake(b, f) {
    const j = J(), tgt = set().wake || "05:00";
    b.classList.add("middle");
    b.innerHTML = `<p class="eyebrow">Tu objetivo: ${tgt}</p><p class="big-time" id="clk"></p><p class="sub" style="max-width:30ch">«Al amanecer, cuando te cueste levantarte, ten presente: me levanto para hacer el trabajo de un ser humano.» — Marco Aurelio</p>
      <label class="fields" style="width:100%;max-width:280px;margin-top:8px"><span>${j.wake ? "Hora a la que te levantaste" : "¿Te levantaste antes? Corrige la hora"}</span><input id="wt" type="time" value="${j.wake || hhmm()}"></label>`;
    const tick = () => { const c = $("clk"); if (c) c.textContent = hhmm() }; tick(); openSheet._iv = setInterval(tick, 1000);
    footBtn(f, j.wake ? "Guardar" : "Me he levantado", () => { j.wake = $("wt").value || hhmm(); saveJ(); closeSheet() });
  },
  breath(b, f) {
    const j = J(); b.classList.add("middle");
    b.innerHTML = `<h2 class="title">Respirar</h2><p class="sub">Respiración en caja: 4 segundos al inhalar, 4 manteniendo, 4 al exhalar y 4 en pausa.</p><div class="breath"><span class="ringb"></span><span class="orb" id="orb"></span><div><b id="ph">Prepárate</b><small id="cd">60 s</small></div></div>`;
    const phases = [["Inhala", 1.9], ["Mantén", 1.9], ["Exhala", 1], ["Pausa", 1]]; let t0 = null, done = false, lastI = -1;
    const btn = footBtn(f, "Empezar", () => { if (done) return closeSheet(); t0 = Date.now(); btn.textContent = "Respirando…"; btn.disabled = true; skip.textContent = "Terminar antes" });
    const skip = footBtn(f, "Cerrar", () => { if (t0 && Date.now() - t0 > 30e3) { j.breath = true; saveJ() } closeSheet() }, "btn ghost");
    openSheet._iv = setInterval(() => {
      if (!t0) return; const el = (Date.now() - t0) / 1000, left = Math.max(0, 64 - el), i = Math.floor(el / 4) % 4;
      if (i !== lastI && left > 0) { lastI = i; tone([392, 523, 330, 262][i], 1.2, { v: .05 }); haptic() }
      $("ph").textContent = left <= 0 ? "Hecho" : phases[i][0]; $("cd").textContent = left <= 0 ? "Mente en calma" : `${Math.ceil(left)} s`; $("orb").style.transform = `scale(${left <= 0 ? 1.4 : phases[i][1]})`;
      if (left <= 0 && !done) { done = true; j.breath = true; saveJ(); SFX.done(); btn.disabled = false; btn.textContent = "Listo"; skip.hidden = true; clearInterval(openSheet._iv) }
    }, 200);
  },
  aff(b, f) {
    const j = J(); j.aff = j.aff || ["", "", ""]; const prev = S.journal[dayKey(-1)] && S.journal[dayKey(-1)].aff;
    const ph = ["Yo soy…", "Hoy elijo…", "Me comprometo a…"];
    b.innerHTML = `<h2 class="title">¿Quién eliges ser hoy?</h2><p class="sub">Escribe tres frases en presente, como si ya fueras esa persona. Escribirlas cada mañana es la práctica.</p>
      <div class="fields">${[0, 1, 2].map(i => `<textarea id="af${i}" rows="2" placeholder="${ph[i]}">${esc(j.aff[i] || "")}</textarea>`).join("")}</div>
      ${prev && prev.some(Boolean) ? `<button class="link" id="prevAff" style="text-align:left">Usar las de ayer</button>` : ""}
      <p class="eyebrow">Ideas</p><div class="sugs">${AFIRMACIONES.slice(0, 6).map(a => `<button data-a="${esc(a)}">${esc(a)}</button>`).join("")}</div>`;
    [0, 1, 2].forEach(i => $("af" + i).oninput = e => { j.aff[i] = e.target.value; saveJ() });
    b.querySelectorAll("[data-a]").forEach(x => x.onclick = () => { const i = j.aff.findIndex(s => !s || !s.trim()); if (i < 0) return; SFX.tap(); j.aff[i] = x.dataset.a; $("af" + i).value = x.dataset.a; saveJ() });
    if ($("prevAff")) $("prevAff").onclick = () => { j.aff = [...prev]; [0, 1, 2].forEach(i => $("af" + i).value = j.aff[i] || ""); saveJ() };
    footBtn(f, "Guardar", closeSheet);
  },
  tasks(b, f) {
    const j = J(); j.tasks = j.tasks || [{ t: "", done: false }, { t: "", done: false }, { t: "", done: false }];
    b.innerHTML = `<h2 class="title">Tus 3 tareas clave</h2><p class="sub">Si solo hicieras tres cosas hoy, ¿cuáles moverían tu vida? Márcalas al terminarlas: con 2 de 3 cuenta el paso.</p>
      <div class="fields">${j.tasks.map((t, i) => `<div class="task"><button class="ck ${t.done ? "on" : ""}" data-ck="${i}" aria-label="Hecha">✓</button><input id="tk${i}" placeholder="Tarea ${i + 1}" value="${esc(t.t)}"></div>`).join("")}</div>`;
    j.tasks.forEach((t, i) => $("tk" + i).oninput = e => { j.tasks[i].t = e.target.value; saveJ() });
    b.querySelectorAll("[data-ck]").forEach(x => x.onclick = () => { const t = j.tasks[+x.dataset.ck]; if (!t.t.trim()) return toast("Escribe primero la tarea."); t.done = !t.done; if (t.done) { SFX.done(); haptic() } x.classList.toggle("on", t.done); saveJ() });
    footBtn(f, "Listo", closeSheet);
  },
  habits(b, f) {
    const draw = () => {
      const k = dayKey(0);
      b.innerHTML = `<h2 class="title">Tus hábitos</h2><p class="sub">Marca los que cumplas hoy. Con el 60 % cuenta el paso.</p>
        <div class="fields">${S.habits.map(h => `<button class="hab ${doneFor(k)[h.id] ? "on" : ""}" data-h="${h.id}"><span class="ck ${doneFor(k)[h.id] ? "on" : ""}">✓</span><span>${esc(h.name)}</span><span class="rm" data-rm="${h.id}" role="button" aria-label="Quitar">Quitar</span></button>`).join("") || `<p class="sub">Aún no tienes hábitos.</p>`}</div>
        <div class="task"><input id="newHab" placeholder="Nuevo hábito (ej.: 20 flexiones)"><button class="link" id="addHab">Añadir</button></div>`;
      b.querySelectorAll("[data-h]").forEach(x => x.onclick = e => { if (e.target.dataset.rm) return; const h = S.habits.find(z => z.id === x.dataset.h), was = doneFor(dayKey(0))[h.id]; toggleHabit(h); if (!was) { SFX.done(); haptic() } draw() });
      b.querySelectorAll("[data-rm]").forEach(x => x.onclick = e => { e.stopPropagation(); const id = x.dataset.rm; S.habits = S.habits.filter(h => h.id !== id); write(() => sb.from("habits").update({ active: false }).eq("id", id)); draw() });
      $("addHab").onclick = () => { const name = $("newHab").value.trim(); if (!name) return; const id = name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").slice(0, 30) + "-" + Date.now().toString(36); S.habits = [...S.habits, { id, name, area: "vida" }]; write(() => sb.from("habits").insert({ id, user_id: S.uid, name, area: "vida", ord: Date.now(), active: true })); draw() };
    };
    draw(); footBtn(f, "Listo", closeSheet);
  },
  food(b, f) {
    const j = J(); j.meals = j.meals || {};
    const draw = () => {
      const goal = waterGoal(), w = j.water || 0;
      b.innerHTML = `<h2 class="title">Comidas y agua</h2><p class="sub">Sin contar calorías: con honestidad. Apunta las tres comidas para cumplir el paso.</p>
        ${["desayuno", "comida", "cena"].map(m => `<div class="meal"><b>${m}</b><div class="seg3">${[["limpio", "Limpio"], ["regular", "Regular"], ["exceso", "Me pasé"]].map(([k, n]) => `<button data-m="${m}" data-v="${k}" class="${j.meals[m] === k ? "on" : ""}">${n}</button>`).join("")}</div></div>`).join("")}
        <div class="water"><div><p class="eyebrow">Agua</p><div class="n">${w}<span> de ${goal} vasos</span></div><div class="glasses">${Array.from({ length: goal }, (_, i) => `<i class="${i < w ? "on" : ""}"></i>`).join("")}</div></div><div class="pm"><button id="wm" aria-label="Quitar un vaso">−</button><button id="wp" aria-label="Añadir un vaso">+</button></div></div>`;
      b.querySelectorAll("[data-m]").forEach(x => x.onclick = () => { SFX.tap(); j.meals[x.dataset.m] = j.meals[x.dataset.m] === x.dataset.v ? undefined : x.dataset.v; saveJ(); draw() });
      $("wp").onclick = () => { tone(880 + (j.water || 0) * 40, .12, { v: .05 }); haptic(); j.water = (j.water || 0) + 1; saveJ(); draw() }; $("wm").onclick = () => { j.water = Math.max(0, (j.water || 0) - 1); saveJ(); draw() };
    };
    draw(); footBtn(f, "Listo", closeSheet);
  },
  exam(b, f) {
    const j = J(); j.exam = j.exam || {}; const q = fq();
    b.innerHTML = `<h2 class="title">Examen nocturno</h2><p class="sub">«Cada noche examinaré mi día.» — Séneca. Sin castigarte: mira, aprende y suelta.</p>
      ${j.open ? `<div class="card" style="display:grid;gap:10px"><p class="eyebrow b">Tu acción de hoy</p><p style="margin:0">${esc(q.acc)}</p><div class="seg3" style="grid-template-columns:1fr 1fr"><button id="py" class="${j.practiced ? "on" : ""}">La hice</button><button id="pn" class="${j.practiced === false ? "on" : ""}">Todavía no</button></div></div>` : ""}
      <div class="fields"><label>¿Qué hice bien?<textarea id="e1" rows="2">${esc(j.exam.bien || "")}</textarea></label><label>¿Qué puedo mejorar?<textarea id="e2" rows="2">${esc(j.exam.mejorar || "")}</textarea></label><label>¿Qué agradezco?<textarea id="e3" rows="2">${esc(j.exam.gracias || "")}</textarea></label></div>`;
    if ($("py")) { $("py").onclick = () => { j.practiced = true; j.commit = true; saveJ(); SFX.done(); $("py").classList.add("on"); $("pn").classList.remove("on") }; $("pn").onclick = () => { j.practiced = false; saveJ(); $("pn").classList.add("on"); $("py").classList.remove("on") } }
    [["e1", "bien"], ["e2", "mejorar"], ["e3", "gracias"]].forEach(([id, k]) => $(id).oninput = e => { j.exam[k] = e.target.value; saveJ() });
    footBtn(f, "Cerrar el día", closeSheet);
  },
  guide(b, f) {
    b.innerHTML = `<p class="eyebrow b">Cómo funciona Levo</p><h2 class="title">Tu mentor de disciplina</h2><p class="sub">Durante 100 días esculpes a la persona que quieres ser. Cada día, un golpe de cincel.</p>
      <div class="card" style="display:grid;gap:10px"><p class="eyebrow">Cada día</p><div class="steps8">${ORDER.map((k, i) => `<div><b>${i + 1}</b><span>${NAME[k]}</span></div>`).join("")}</div><p class="sub">Con 6 de 8 pasos el día queda <b>esculpido</b> y tu estatua sale un poco más del bloque. Toca cada paso en «Tu camino de hoy» para hacerlo.</p></div>
      <div class="card" style="display:grid;gap:8px"><p class="eyebrow">Tu estatua</p><p class="sub">Empieza siendo un bloque de mármol. Con los días esculpidos va saliendo la figura: la cabeza, el rostro, el cuerpo, los detalles, el pulido y, a los 100 días, el laurel.</p></div>
      <div class="card" style="display:grid;gap:8px"><p class="eyebrow">La frase sellada y tu mentor</p><p class="sub">Cada mañana se abre una frase de un gran autor con una acción para ese día; te comprometes manteniendo pulsado el botón. Tu mentor te deja una lección diaria y te habla según cómo vas.</p></div>
      <div class="card whys">${WHYS.map(([t, x], i) => `<div><b>0${i + 1}</b><div><h3>${t}</h3><p>${x}</p></div></div>`).join("")}</div>`;
    footBtn(f, "Entendido", closeSheet);
  },
  identity(b, f) {
    const s = { goals: new Set(set().goals || []), why: set().why || "", who: set().who || "" };
    const draw = () => {
      b.innerHTML = `<h2 class="title">Tu porqué</h2><p class="sub">Lo que te mueve. Tu mentor te lo recordará en los días difíciles.</p>
        <label class="fields"><span class="eyebrow">Por qué lo quiero de verdad</span><textarea id="iw" rows="3">${esc(s.why)}</textarea></label>
        <label class="fields"><span class="eyebrow">Dentro de 100 días soy alguien que…</span><textarea id="iq" rows="2">${esc(s.who)}</textarea></label>
        <p class="eyebrow">Lo que quiero transformar</p><div class="areas">${AREAS.map(a => `<button data-a="${a.id}" class="${s.goals.has(a.id) ? "on" : ""}"><b>${a.n}</b><small>${a.d}</small></button>`).join("")}</div>`;
      $("iw").oninput = e => s.why = e.target.value; $("iq").oninput = e => s.who = e.target.value;
      b.querySelectorAll("[data-a]").forEach(x => x.onclick = () => { const id = x.dataset.a; s.goals.has(id) ? s.goals.delete(id) : s.goals.add(id); SFX.tap(); draw() });
    };
    draw(); footBtn(f, "Guardar", () => { S.set.why = s.why.trim(); S.set.who = s.who.trim(); S.set.goals = [...s.goals]; saveSet(); toast("Guardado."); closeSheet() });
  },
  look(b, f) {
    let l = look();
    const draw = () => { b.innerHTML = `<h2 class="title">Tu estatua</h2><p class="sub">Elige la figura que vas a esculpir. Puedes cambiarla cuando quieras.</p><div class="looks">${["a", "b"].map(x => `<button data-l="${x}" class="${l === x ? "on" : ""}" aria-label="Figura ${x === "a" ? "1" : "2"}">${statueSVG(5, set().name, 40, x)}</button>`).join("")}</div>`; b.querySelectorAll("[data-l]").forEach(x => x.onclick = () => { l = x.dataset.l; SFX.tap(); draw() }) };
    draw(); footBtn(f, "Guardar", () => { S.set.look = l; saveSet(); closeSheet() });
  },
  body(b, f) {
    const bp = S.bodyP || {};
    b.innerHTML = `<h2 class="title">Tu cuerpo</h2><p class="sub">Solo lo ves tú. Con tu peso calculo tu meta de agua (unos 33 ml por kilo, orientativo). No es consejo médico.</p>
      <div class="fields"><label>Estatura (cm)<input id="bh" type="number" inputmode="numeric" value="${bp.height_cm || ""}"></label><label>Peso (kg)<input id="bw" type="number" inputmode="decimal" step="0.1" value="${bp.weight_kg || ""}"></label>
      <label>Objetivo<select id="bg"><option value="mantener">Mantener</option><option value="perder">Perder peso</option><option value="ganar">Ganar peso</option></select></label></div>`;
    $("bg").value = bp.goal || "mantener";
    footBtn(f, "Guardar", () => { const h = parseFloat($("bh").value) || null, kg = parseFloat(($("bw").value || "").replace(",", ".")) || null; S.bodyP = { height_cm: h, weight_kg: kg, goal: $("bg").value }; write(() => sb.from("body_profile").upsert({ user_id: S.uid, ...S.bodyP, updated_at: new Date().toISOString() }, { onConflict: "user_id" })); if (kg) { const k = dayKey(0); S.weighs = S.weighs.filter(x => x.day !== k).concat([{ day: k, kg }]); write(() => sb.from("weighins").upsert({ user_id: S.uid, day: k, kg }, { onConflict: "user_id,day" })) } toast("Guardado."); closeSheet() });
  },
};
SHEETS.share = (b, f) => {
  let kind = "story", blob = null, url = "";
  const shareText = `Día ${dayNum()} de 100 esculpiendo mi mejor versión con Levo.`;
  const draw = async () => {
    b.innerHTML = `<h2 class="title">Comparte tu estatua</h2><p class="sub">Tu progreso puede despertar a alguien más. Elige el formato y compártelo.</p><div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr))">${[["story", "Historia"], ["post", "Publicación"]].map(([k, n]) => `<button data-k="${k}" aria-selected="${kind === k}">${n}</button>`).join("")}</div><div class="sharepv ${kind}"><div class="spin">Esculpiendo tu imagen…</div></div>`;
    b.querySelectorAll("[data-k]").forEach(x => x.onclick = () => { if (kind === x.dataset.k) return; kind = x.dataset.k; SFX.tap(); draw() });
    blob = await shareCanvas(kind); if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(blob);
    const pv = b.querySelector(".sharepv"); if (pv) pv.innerHTML = `<img src="${url}" alt="Tu tarjeta para compartir">`;
  };
  draw();
  footBtn(f, "Compartir", async () => {
    if (!blob) return toast("Un segundo, se está preparando la imagen.");
    const file = new File([blob], `levo-dia-${dayNum()}.png`, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], text: shareText }); SFX.done() } catch (e) { if (e && e.name !== "AbortError") toast("No se pudo abrir el menú de compartir.") } return }
    toast("Tu navegador no permite compartir directamente: la guardo como imagen."); dl();
  });
  const dl = () => { if (!blob) return; const a = document.createElement("a"); a.href = url; a.download = `levo-dia-${dayNum()}.png`; document.body.append(a); a.click(); a.remove() };
  footBtn(f, "Guardar imagen", dl, "btn ghost");
};
const WHYS = [
  ["Cada acción es un voto", "No cambias de golpe: cambias por repetición. Cada paso pequeño es un voto por la persona que quieres ser."],
  ["Lo que se ve, se cumple", "Tu estatua hace visible un progreso que normalmente no ves. Ver que avanzas te da ganas de seguir."],
  ["Tu palabra pesa", "Comprometerte cada mañana y examinarte cada noche cierra el círculo. Los estoicos lo hacían hace dos mil años y sigue funcionando."],
];

/* ================= MENTOR ================= */
function openedDays() { const out = []; for (let o = 0; dayKey(o) >= START() && o > -800; o--) { const k = dayKey(o); if (S.journal[k] && S.journal[k].open) out.push(k) } return out }
const lessonDay = n => { const d = new Date(START() + "T12:00"); d.setDate(d.getDate() + n - 1); return fmt(d) };
const lessonsDone = () => Object.values(S.journal).filter(j => j && j.lesson).length;
function renderMentor(v) {
  const d = dayNum(), L = leccion(d), j = J(), fav = (set().fav || []).map(x => typeof x === "number" ? "s" + x : x), done = !!j.lesson;
  const qc = (q, date) => `<article class="card qcard">${date ? `<p class="eyebrow">${date}</p>` : ""}<p class="quote">${esc(q.t)}</p><p class="eyebrow">— ${esc(q.a)}</p>${q.acc ? `<div class="accbox"><p class="eyebrow">Acción</p><p>${esc(q.acc)}</p></div>` : ""}<button class="fav ${fav.includes(q.id) ? "on" : ""}" data-fav="${q.id}" aria-label="Guardar">${fav.includes(q.id) ? "★" : "☆"}</button></article>`;
  const HELP = { lecciones: "Todas las lecciones que ya has recibido, con lo que respondiste cada día.", frases: "Las frases selladas que has ido abriendo en Hoy, con su acción.", favs: "Las frases que has marcado con ☆ para releerlas." };
  let list = "";
  if (S.mTab === "lecciones") list = Array.from({ length: Math.min(d, 100) }, (_, i) => d - i).map(n => { const l = leccion(n), jj = S.journal[lessonDay(n)] || {}, o = S.open[n]; return `<div class="card lrow"><button class="lt" data-les="${n}"><b>${n}</b><span>${esc(l.t)}</span>${jj.lesson ? `<span class="lchk">${CHK}</span>` : ""}<span class="lpm">${o ? "−" : "+"}</span></button>${o ? `<p>${esc(l.x)}</p><p style="font-weight:700;color:var(--fg)">${esc(l.q)}</p>${jj.reflex ? `<p class="mine">Tu respuesta: «${esc(jj.reflex)}»</p>` : ""}` : ""}</div>` }).join("");
  else if (S.mTab === "frases") { const tom = fq(dayKey(1)), od = openedDays(); list = `<div class="card sealed"><span class="seal">${IC.laurel}</span><div><p class="eyebrow b">Mañana · sellada</p><p style="margin:2px 0;font-weight:700">Una frase de ${esc(tom.a)}</p><p class="sub" style="font-size:14px">Se abre desde las ${set().wake || "05:00"} en Hoy</p></div></div>` + (od.map(k => qc(fq(k), dateLabel(k))).join("") || `<p class="sub">Aún no has abierto ninguna frase. La de hoy te espera en Hoy.</p>`) }
  else list = fav.map(quoteById).filter(Boolean).map(q => qc(q)).join("") || `<p class="sub">Marca con ☆ las frases que quieras releer.</p>`;
  v.innerHTML = `<header class="mhead page-top"><div><p class="eyebrow b">Tu mentor</p><h1 class="title">Aprende en el camino</h1></div><span class="emblem" style="width:54px;height:54px">${IC.mentor}</span></header>
    <p class="sub">Cada día tu mentor te deja una idea para tu proceso. Te lleva un minuto: <b style="color:var(--fg)">léela, piénsala y escribe tu respuesta.</b></p>
    <section class="lesson">
      <div class="lhead"><p class="eyebrow" style="color:rgba(255,255,255,.85)">Lección de hoy · ${d} de 100</p>${done ? `<span class="lok">${CHK} Hecha</span>` : ""}</div>
      <h2>${esc(L.t)}</h2>
      <div class="lpart"><b>1</b><div><p class="lk">La idea</p><p>${esc(L.x)}</p></div></div>
      <div class="lpart"><b>2</b><div><p class="lk">Piénsalo</p><p class="q">${esc(L.q)}</p></div></div>
      <div class="lpart"><b>3</b><div style="flex:1"><p class="lk">Tu respuesta</p><textarea id="refl" rows="3" placeholder="Escribe lo que te venga. Solo lo ves tú.">${esc(j.reflex || "")}</textarea></div></div>
      <button class="btn white" id="lsave">${done ? "Actualizar mi respuesta" : "Guardar y completar la lección"}</button>
    </section>
    <p class="lprog"><b>${lessonsDone()}</b> ${lessonsDone() === 1 ? "lección completada" : "lecciones completadas"} · Mañana: «${esc(leccion(d + 1).t)}»</p>
    <section class="card why"><p class="eyebrow">Lo que te mueve</p>${set().why ? `<p class="wq">«${esc(set().why)}»</p>` : `<p class="sub">Aún no has escrito tu porqué.</p>`}${set().who ? `<p class="sub">Estás esculpiendo a alguien que <b style="color:var(--fg)">${esc(set().who)}</b>.</p>` : ""}<p class="sub" style="font-size:13.5px">Tu mentor te lo recuerda en los días en que flaqueas.</p><button class="link" id="editWhy" style="text-align:left">Editar</button></section>
    <div class="lib"><p class="eyebrow b">Tu biblioteca</p><div class="seg" role="tablist">${[["lecciones", "Lecciones"], ["frases", "Frases"], ["favs", "Favoritas"]].map(([k, n]) => `<button role="tab" data-m="${k}" aria-selected="${S.mTab === k}">${n}</button>`).join("")}</div><p class="sub" style="font-size:14px">${HELP[S.mTab]}</p></div>${list}`;
  $("refl").oninput = e => { j.reflex = e.target.value; saveJ() };
  $("lsave").onclick = () => { if ((j.reflex || "").trim().length < 3) return toast("Escribe tu respuesta, aunque sea una línea."); const first = !j.lesson; j.lesson = true; saveJ(); SFX.done(); haptic(2); toast(first ? "Lección completada. Así se aprende en el camino." : "Respuesta guardada."); renderMentor(v) };
  $("editWhy").onclick = () => openSheet("identity");
  v.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { SFX.tap(); S.mTab = b.dataset.m; renderMentor(v) });
  v.querySelectorAll("[data-les]").forEach(b => b.onclick = () => { const n = +b.dataset.les; S.open[n] = !S.open[n]; renderMentor(v) });
  v.querySelectorAll("[data-fav]").forEach(b => b.onclick = () => { const id = b.dataset.fav, s = new Set(fav); s.has(id) ? s.delete(id) : s.add(id); S.set.fav = [...s]; saveSet(); SFX.tap(); renderMentor(v) });
}

/* ================= GALERÍA ================= */
function unlockDates() { const out = {}; let c = 0; for (let o = -800; o <= 0; o++) { const k = dayKey(o); if (k < START()) continue; if (isRitual(k)) { c++; GALERIA.forEach((p, i) => { if (p.d === c) out[i] = k }) } } return out }
const nextPiece = (n = sculpted()) => GALERIA.find(p => p.d > n) || null;
function galleryHTML() {
  const n = sculpted(), got = GALERIA.filter(p => n >= p.d).length, nx = nextPiece(n), prev = [...GALERIA].reverse().find(p => p.d <= n), from = prev ? prev.d : 0;
  return `<section class="gal"><div class="sec-h"><div><p class="eyebrow b">Tu galería</p><h2 class="title">Colección</h2></div><p class="galcount"><b>${got}</b>/${GALERIA.length}</p></div>
    <p class="sub">Cada cierto número de días esculpidos ganas una pieza nueva para tu galería. Las oscuras aún te esperan.</p>
    ${nx ? `<button class="card galnext" data-pc="${GALERIA.indexOf(nx)}"><div class="gpic locked">${pieceSVG(nx)}</div><div style="flex:1;min-width:0"><p class="eyebrow b">Próxima pieza</p><h3>${esc(nx.n)}</h3><p class="sub" style="font-size:14px">Faltan ${nx.d - n} ${nx.d - n === 1 ? "día esculpido" : "días esculpidos"}</p><div class="bar"><b style="width:${Math.round((n - from) / (nx.d - from) * 100)}%"></b></div></div></button>` : `<p class="sub"><b style="color:var(--fg)">Colección completa.</b> Eres leyenda.</p>`}
    <div class="galgrid">${GALERIA.map((p, i) => `<button class="gcard ${n >= p.d ? "got" : "locked"}" data-pc="${i}"><div class="gpic">${pieceSVG(p)}${n >= p.d ? "" : `<span class="lock">${p.d}</span>`}</div><b>${esc(p.n)}</b></button>`).join("")}</div></section>`;
}
function bindGallery(v) { v.querySelectorAll("[data-pc]").forEach(b => b.onclick = () => { SFX.tap(); S.piece = +b.dataset.pc; openSheet("piece") }) }
SHEETS.piece = (b, f) => {
  const p = GALERIA[S.piece], n = sculpted(), got = n >= p.d, when = unlockDates()[S.piece];
  b.classList.add("middle");
  b.innerHTML = `<div class="piecebig ${got ? "" : "locked"}">${pieceSVG(p)}</div><p class="eyebrow b">Pieza ${S.piece + 1} de ${GALERIA.length} · ${p.d} días esculpidos</p><h2 class="title">${esc(p.n)}</h2><p class="sub" style="max-width:30ch">${got ? esc(p.t) : "Esta pieza aún duerme dentro de la piedra."}</p>${got ? (when ? `<p class="okline" style="justify-content:center">${CHK} Conseguida el ${dateLabel(when)}</p>` : "") : `<div style="width:100%;max-width:300px"><div class="bar"><b style="width:${Math.round(n / p.d * 100)}%"></b></div><p class="sub" style="font-size:14px;margin-top:8px">Llevas ${n} de ${p.d}. Faltan ${p.d - n} días esculpidos.</p></div>`}`;
  footBtn(f, got ? "Volver a mi galería" : "A por ella", closeSheet);
};

/* ================= ESTATUA ================= */
function renderEstatua(v) {
  const n = sculpted(), fz = faseDe(n), nx = fz.next, prevAt = FASES[fz.i][0], pct = nx ? (n - prevAt) / (nx[0] - prevAt) : 1;
  const cal = [], start = new Date(); start.setDate(start.getDate() - 34); const off = (start.getDay() + 6) % 7; start.setDate(start.getDate() - off);
  for (let i = 0; i < 35 + off && cal.length < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); if (d > new Date()) break; const k = fmt(d), c = k >= START() ? nDone(k) : 0; cal.push(`<i class="${k === dayKey(0) ? "today" : ""}" style="${c ? `background:color-mix(in srgb,var(--blue) ${Math.round(10 + c / 8 * 85)}%,var(--s2));color:${c >= 6 ? "#fff" : "var(--fg)"}` : ""}" title="${k}">${d.getDate()}</i>`) }
  const w = S.weighs.slice(-10);
  v.innerHTML = `<section class="hero statue-hero"><div class="bar-top"><span class="wordmark">LEVO</span><span class="eyebrow" style="color:#fff;opacity:.85">Fase ${fz.i + 1} de 8</span></div>
      ${dustHTML()}<div class="hgrid"><div class="stage" id="stage"><div class="beat"><b></b><i></i><i></i></div>${myStatue(n)}</div>
        <div class="hleft"><div class="daynum"><span>ESCULPIDOS</span><b class="${n >= 100 ? "d3" : ""}" data-count="${n}">${n}</b><small>DÍAS</small></div><p class="hphase">${esc(fz.name)}</p><p class="hphase-sub">${esc(fz.txt)}</p></div></div>
      <div class="today"><div class="tt"><span>${nx ? `Hacia «${esc(nx[1])}»` : "Obra terminada"}</span><b>${nx ? `${nx[0] - n} ${nx[0] - n === 1 ? "día" : "días"}` : "100"}</b></div><div class="segs"><i class="on" style="flex:${Math.max(.01, pct)}"></i><i style="flex:${Math.max(.01, 1 - pct)}"></i></div></div></section>
    ${set().who ? `<p class="sculpting">Estás esculpiendo a alguien que <em>${esc(set().who)}</em>.</p>` : ""}
    <button class="btn" id="shareStatue">Compartir mi estatua</button>
    ${galleryHTML()}
    <div class="stats"><div class="stat"><b>${streak()}</b><small>días seguidos esculpiendo</small></div><div class="stat"><b>${wakeStreak()}</b><small>en pie a las ${set().wake || "05:00"}</small></div><div class="stat"><b>${dayNum()}</b><small>días de camino</small></div></div>
    <section class="card"><p class="eyebrow" style="margin-bottom:6px">Las 8 formas de tu estatua</p><div class="phases">${FASES.map((f, i) => `<div class="ph ${i < fz.i ? "done" : i === fz.i ? "now" : ""}"><span class="n">${i < fz.i ? "✓" : i + 1}</span><div class="t"><b>${esc(f[1])}</b><small>${esc(f[2])}</small></div><span class="d">${f[0]} d</span></div>`).join("")}</div></section>
    <section class="card"><p class="eyebrow" style="margin-bottom:12px">Últimas semanas</p><div class="cal">${["L", "M", "X", "J", "V", "S", "D"].map(d => `<span class="h">${d}</span>`).join("")}${cal.join("")}</div><p class="sub" style="font-size:14px;margin-top:12px">Más azul, más pasos cumplidos. Los días con 6 o más quedan esculpidos.</p></section>
    <section class="card" style="display:grid;gap:10px"><p class="eyebrow">Tu cuerpo</p>${w.length ? `<p class="kg">${String(w[w.length - 1].kg).replace(".", ",")} kg</p>${w.length > 1 ? sparkline(w) : ""}` : `<p class="sub">Registra tu peso una vez por semana para ver tu evolución.</p>`}
      <div class="task"><input id="kg" type="number" inputmode="decimal" step="0.1" placeholder="Peso de hoy (kg)"><button class="link" id="saveKg">Guardar</button></div></section>`;
  $("saveKg").onclick = () => { const kg = parseFloat(($("kg").value || "").replace(",", ".")); if (!kg || kg < 30 || kg > 300) return toast("Escribe un peso válido."); const k = dayKey(0); S.weighs = S.weighs.filter(x => x.day !== k).concat([{ day: k, kg }]); write(() => sb.from("weighins").upsert({ user_id: S.uid, day: k, kg }, { onConflict: "user_id,day" })); S.bodyP = { ...(S.bodyP || {}), weight_kg: kg }; write(() => sb.from("body_profile").upsert({ user_id: S.uid, ...S.bodyP, updated_at: new Date().toISOString() }, { onConflict: "user_id" })); toast("Peso guardado."); renderEstatua(v) };
  $("shareStatue").onclick = shareStatue;
  bindGallery(v); countUps(v); tilt(v.querySelector(".hero"));
}
function sparkline(w) { const W = 300, H = 70, ks = w.map(x => +x.kg), mn = Math.min(...ks), mx = Math.max(...ks), rg = Math.max(.5, mx - mn); const pts = w.map((x, i) => `${(8 + i * (W - 16) / (w.length - 1)).toFixed(1)},${(H - 8 - (x.kg - mn) / rg * (H - 16)).toFixed(1)}`); const d = ks[ks.length - 1] - ks[0]; return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-label="Evolución del peso"><polyline points="${pts.join(" ")}" fill="none" stroke="var(--blue)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg><p class="sub" style="font-size:14px">${d === 0 ? "Estable" : (d > 0 ? "+" : "−") + Math.abs(d).toFixed(1).replace(".", ",") + " kg"} en tus últimos ${w.length} registros</p>` }
function shareStatue() { SFX.tap(); openSheet("share") }
const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src });
function wrapText(x, text, maxW) { const words = String(text).split(" "), lines = []; let l = ""; for (const w of words) { const t = l ? l + " " + w : w; if (x.measureText(t).width > maxW && l) { lines.push(l); l = w } else l = t } if (l) lines.push(l); return lines }
/* La tarjeta para redes: azul Klein, el número enorme, la estatua saliéndose del borde y lo que estás esculpiendo */
async function shareCanvas(kind) {
  const story = kind !== "post", W = 1080, H = story ? 1920 : 1350, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
  const n = sculpted(), fz = faseDe(n), d = dayNum(), e = Math.round(Math.pow(Math.min(1, n / 50), .75) * 100);
  try { await Promise.all(["900 300px Archivo", "800 80px Archivo", "600 40px Archivo", "italic 500 40px Archivo"].map(f => document.fonts.load(f))) } catch (_) { }
  const F = (w, s) => `${w} ${s}px Archivo, "Arial Black", Arial, sans-serif`, wide = v => { try { x.fontStretch = v } catch (_) { } };
  x.fillStyle = "#1f3fff"; x.fillRect(0, 0, W, H);
  x.strokeStyle = "rgba(255,255,255,.05)"; x.lineWidth = 2; for (let gx = 0; gx < W; gx += 60) { x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, H); x.stroke() }
  const sy = story ? 250 : 130, sw = story ? 880 : 700, sx = W - sw + (story ? 230 : 190), cxs = sx + sw * .46, cys = sy + sw * .48;
  x.save(); x.translate(cxs, cys); for (let k = 0; k < 18; k++) { x.rotate(Math.PI / 9); x.fillStyle = k % 2 ? "rgba(255,255,255,.05)" : "rgba(255,255,255,.025)"; x.beginPath(); x.moveTo(0, 0); x.lineTo(1400, -110); x.lineTo(1400, 110); x.closePath(); x.fill() } x.restore();
  let g = x.createRadialGradient(cxs, cys, 30, cxs, cys, sw * .9); g.addColorStop(0, "rgba(255,255,255,.34)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = "rgba(255,255,255,.22)"; x.lineWidth = 3; [1, 1.45, 1.95].forEach(r => { x.beginPath(); x.arc(cxs, cys, sw * .3 * r, 0, Math.PI * 2); x.stroke() });
  const svg = myStatue(n).replace('<svg viewBox="0 0 200 260"', '<svg width="' + sw + '" height="' + Math.round(sw * 1.3) + '" viewBox="0 0 200 260"');
  const img = await loadImg("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));
  if (img) x.drawImage(img, sx, sy, sw, sw * 1.3);
  for (let i = 0; i < 26; i++) { const r = (k => { const v = Math.sin((i + 1) * k) * 43758.5453; return v - Math.floor(v) }), px = sx + sw * (.15 + r(12.9) * .7), py = sy + sw * (.2 + r(78.2) * 1), s = 6 + r(3.7) * 14; x.fillStyle = "rgba(242,242,239," + (.5 + r(5.1) * .5) + ")"; x.beginPath(); x.moveTo(px, py + s * .3); x.lineTo(px + s * .6, py); x.lineTo(px + s, py + s * .45); x.lineTo(px + s * .7, py + s); x.lineTo(px + s * .15, py + s * .85); x.closePath(); x.fill() }
  x.fillStyle = "#fff"; x.textAlign = "left"; x.textBaseline = "alphabetic";
  wide("expanded"); x.font = F(900, 46); x.fillText("L E V O", 72, story ? 150 : 110); wide("normal");
  x.font = F(700, 26); x.globalAlpha = .8; x.textAlign = "right"; x.fillText("TU MENTOR DE DISCIPLINA", W - 72, story ? 150 : 110); x.textAlign = "left"; x.globalAlpha = 1;
  const top = story ? 330 : 220;
  x.font = F(800, 38); x.globalAlpha = .85; x.fillText("DÍA", 72, top); x.globalAlpha = 1;
  wide("expanded"); x.font = F(900, d >= 100 ? 230 : 330); x.fillText(String(d), 56, top + (d >= 100 ? 230 : 300)); wide("normal");
  x.font = F(800, 38); x.globalAlpha = .85; x.fillText("DE 100", 72, top + (d >= 100 ? 300 : 370)); x.globalAlpha = 1;
  let y = top + (story ? 500 : 460);
  wide("expanded"); x.font = F(900, story ? 74 : 60); const ph = wrapText(x, fz.name.toUpperCase(), 520); ph.forEach((l, i) => x.fillText(l, 72, y + i * (story ? 76 : 62))); wide("normal"); y += ph.length * (story ? 76 : 62);
  x.fillStyle = "rgba(255,255,255,.25)"; x.fillRect(72, y, 440, 14); x.fillStyle = "#fff"; x.fillRect(72, y, 440 * e / 100, 14);
  x.font = F(600, 30); x.fillText(e >= 100 ? "Ya ha salido entera del bloque" : `Ha salido el ${e} % del bloque`, 72, y + 60);
  if (story) {
    y = 1340; x.font = F(500, 42); x.globalAlpha = .9; x.fillText("Estoy esculpiendo a alguien que", 72, y); x.globalAlpha = 1;
    x.font = F(800, 66); wrapText(x, set().who || "cumple lo que se promete", W - 144).slice(0, 3).forEach((l, i) => x.fillText(l, 72, y + 84 + i * 74));
    y = 1640; [[streak(), "días seguidos"], [n, "días esculpidos"], [set().wake || "05:00", "en pie cada día"]].forEach(([v, t], i) => { const bx = 72 + i * 320; x.font = F(900, 76); x.fillText(String(v), bx, y); x.font = F(600, 28); x.globalAlpha = .85; x.fillText(t, bx, y + 42); x.globalAlpha = 1 });
    x.font = F(700, 24); x.globalAlpha = .8; x.fillText("ÚLTIMOS 14 DÍAS", 72, 1748); x.globalAlpha = 1; y = 1764; for (let i = 13; i >= 0; i--) { const k = dayKey(-i), on = k >= START() && isRitual(k), bx = 72 + (13 - i) * 66; x.fillStyle = on ? "#fff" : "rgba(255,255,255,.18)"; x.fillRect(bx, y, 52, 52) } x.fillStyle = "#fff";
    x.font = F(800, 36); x.fillText("¿Y tú, qué estatua estás esculpiendo?", 72, 1882);
  } else {
    y = 1110; x.font = F(500, 36); x.globalAlpha = .9; x.fillText("Estoy esculpiendo a alguien que", 72, y); x.globalAlpha = 1;
    x.font = F(800, 54); wrapText(x, set().who || "cumple lo que se promete", W - 144).slice(0, 2).forEach((l, i) => x.fillText(l, 72, y + 66 + i * 60));
    x.font = F(700, 30); x.fillText(`${streak()} días seguidos · ¿y tú, qué estatua estás esculpiendo?`, 72, 1300);
  }
  return new Promise(r => c.toBlob(r, "image/png"));
}
/* ================= PERFIL ================= */
function renderPerfil(v) {
  const fz = faseDe(sculpted()), granted = "Notification" in window && Notification.permission === "granted", snd = set().sound !== false;
  v.innerHTML = `<header class="page-top" style="display:flex;gap:16px;align-items:center"><div style="width:80px;flex:none;background:var(--blue);border-radius:22px;padding:8px 6px 2px">${myStatue()}</div><div><p class="eyebrow b">Día ${dayNum()} · ${esc(fz.name)}</p><h1 class="title">${esc(set().name || "Tú")}</h1></div></header>
    <div class="plist">
      <label class="prow"><span class="tx"><b>Nombre</b><small>Aparece en la placa de tu estatua</small></span><input id="pName" value="${esc(set().name || "")}" maxlength="18" style="width:140px;text-align:right"></label>
      <label class="prow"><span class="tx"><b>Hora de despertar</b><small>Tu primera victoria de cada día</small></span><input id="pWake" type="time" value="${set().wake || "05:00"}"></label>
      <button class="prow" id="pWhy"><span class="tx"><b>Tu porqué y quién serás</b><small>${set().why ? esc(set().why) : "Lo que te mueve y lo que estás esculpiendo"}</small></span><span class="end">›</span></button>
      <button class="prow" id="pLook"><span class="tx"><b>Tu estatua</b><small>Elige la figura que esculpes</small></span><span class="end">›</span></button>
    </div>
    <div class="plist">
      <button class="prow" id="pSnd"><span class="tx"><b>Sonido y vibración</b><small>Cincel, latido y sello al cumplir</small></span><span class="sw ${snd ? "on" : ""}"></span></button>
      <button class="prow" id="pPush"><span class="tx"><b>Avisos</b><small>${granted ? "Activados: al despertar, y a mediodía y por la noche solo si hace falta" : "Desactivados: toca para activarlos (3 al día como máximo)"}</small></span><span class="end">›</span></button>
      <button class="prow" id="pBody"><span class="tx"><b>Tu cuerpo</b><small>${S.bodyP && S.bodyP.weight_kg ? `${String(S.bodyP.weight_kg).replace(".", ",")} kg · meta de agua: ${waterGoal()} vasos` : "Peso y estatura para tu meta de agua (privado)"}</small></span><span class="end">›</span></button>
      <button class="prow" id="pGuide"><span class="tx"><b>Cómo funciona Levo</b><small>Los 8 pasos, tu estatua y por qué funciona</small></span><span class="end">›</span></button>
    </div>
    <div class="plist">
      <button class="prow danger ${S.resetArm ? "armed" : ""}" id="pReset"><span class="tx"><b>${S.resetArm ? "Toca otra vez para borrarlo todo" : "Empezar de cero"}</b><small>${S.resetArm ? "Se borran tu diario, tus días, tus hábitos y tu estatua. No se puede deshacer." : "Como si acabaras de descargar Levo"}</small></span></button>
      <button class="prow" id="pOut"><span class="tx"><b>Cerrar sesión</b></span></button>
    </div>
    <p class="sub center" style="font-size:13px">Levo · Esculpe tu mejor versión, un día cada vez</p>`;
  $("pName").onchange = e => { S.set.name = e.target.value.trim(); saveSet(); toast("Nombre guardado.") };
  $("pWake").onchange = e => { S.set.wake = e.target.value || "05:00"; saveSet(); toast(`Te levantarás a las ${S.set.wake}.`) };
  $("pWhy").onclick = () => openSheet("identity");
  $("pLook").onclick = () => openSheet("look");
  $("pSnd").onclick = () => { S.set.sound = !(set().sound !== false); saveSet(); if (S.set.sound) { SFX.chisel(); haptic(2) } renderPerfil(v) };
  $("pPush").onclick = enablePush;
  $("pBody").onclick = () => openSheet("body");
  $("pGuide").onclick = () => openSheet("guide");
  $("pReset").onclick = resetAll;
  $("pOut").onclick = async () => { try { localStorage.removeItem("levo2-cache") } catch (e) { } await sb.auth.signOut(); location.href = location.pathname };
}
async function resetAll() {
  if (!S.resetArm) { S.resetArm = true; return renderPerfil($("view")) }
  S.resetArm = false;
  if (!DEMO && S.uid) {
    try { for (const t of ["journal", "days", "weighins", "habits"]) await sb.from(t).delete().eq("user_id", S.uid); await sb.from("body_profile").delete().eq("user_id", S.uid); await sb.from("profile").delete().eq("user_id", S.uid) } catch (e) { return toast("No se pudo borrar. Revisa la conexión.") }
  }
  try { Object.keys(localStorage).filter(k => k.startsWith("levo")).forEach(k => localStorage.removeItem(k)) } catch (e) { }
  location.href = location.pathname;
}

/* ---------- avisos ---------- */
const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
function b64(u) { const p = "=".repeat((4 - u.length % 4) % 4), r = atob((u + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(r, c => c.charCodeAt(0)) }
async function enablePush() {
  if (/iphone|ipad/i.test(navigator.userAgent) && !standalone) return toast("Abre Levo desde el icono de tu pantalla de inicio para activar los avisos.");
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return toast("Este navegador no admite avisos.");
  try {
    const perm = await Notification.requestPermission(); if (perm !== "granted") return toast("Sin permiso no puedo avisarte. Actívalo en Ajustes.");
    const reg = await navigator.serviceWorker.ready, sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(window.MINI.VAPID_PUBLIC) });
    const j = sub.toJSON(); const r = await sb.from("push_subs").upsert({ endpoint: j.endpoint, user_id: S.uid, sub: j }, { onConflict: "endpoint" }); if (r.error) throw r.error;
    toast("Avisos activados."); route();
  } catch (e) { toast("No pude activar los avisos.") }
}

/* ---------- acceso ---------- */
function renderGate(app) {
  let signup = false;
  app.innerHTML = `<div class="gate"><div class="gstage">${statueSVG(7, "", 100, "a")}</div><span class="wordmark">LEVO</span><p class="sub">Tu mentor de disciplina. Cien días para esculpir a la persona que quieres ser.</p>
    <form id="gf" class="fields"><input id="ge" type="email" autocomplete="username" placeholder="Email" required><input id="gp" type="password" autocomplete="current-password" placeholder="Contraseña" minlength="8" required><button class="btn" id="gb">Entrar</button></form>
    <button class="link center" id="gs">¿Primera vez? Crear cuenta</button><p class="sub center" id="gm" style="min-height:20px;font-size:14px"></p></div>`;
  $("gs").onclick = () => { signup = !signup; $("gb").textContent = signup ? "Crear cuenta" : "Entrar"; $("gs").textContent = signup ? "Ya tengo cuenta" : "¿Primera vez? Crear cuenta"; $("gp").autocomplete = signup ? "new-password" : "current-password" };
  $("gf").onsubmit = async e => {
    e.preventDefault(); const email = $("ge").value.trim(), password = $("gp").value; $("gm").textContent = signup ? "Creando tu cuenta…" : "Entrando…";
    if (signup) { const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: "https://paraeditores.github.io/levo/" } }); $("gm").textContent = error ? (/not allowed|disabled/i.test(error.message) ? "El registro está cerrado: Levo está en beta privada." : "No se pudo crear la cuenta.") : (data.session ? "" : "Te hemos enviado un email para confirmar la cuenta."); return }
    const { error } = await sb.auth.signInWithPassword({ email, password }); $("gm").textContent = error ? "Email o contraseña incorrectos." : "";
  };
}

/* ---------- bienvenida: el porqué, el para qué y el pacto ---------- */
function renderOnb(app) {
  const mine = h => S.habits.some(x => x.id.startsWith(h.id + "-") || x.name === h.name);
  const o = renderOnb.o = renderOnb.o || { step: 0, name: set().name || "", wake: set().wake || "05:00", goals: new Set(set().goals || []), why: set().why || "", who: set().who || "", look: set().look || "a", picks: new Set(HABITOS_ESTOICOS.filter(mine).map(h => h.id)) };
  const N = 10, blue = o.step === 0 || o.step === N - 1;
  let body = "", btn = "Continuar", ok = true, extra = "";
  const no = `<p class="bigno">${pad(o.step + 1)} / ${N}</p>`;
  if (o.step === 0) { body = `${no}<h1 class="title xl">Tu mentor de disciplina</h1><p class="sub" style="max-width:24ch">Durante 100 días vas a esculpir a la persona que quieres ser. Cada día, un golpe de cincel.</p><div style="flex:1;min-height:150px"></div><input id="on" placeholder="¿Cómo te llamas?" maxlength="18" value="${esc(o.name)}">`; btn = "Empezar"; extra = `<div class="ostage">${statueSVG(0, "", 0, o.look)}</div>` }
  if (o.step === 1) body = `${no}<h1 class="title">Por qué funciona</h1><p class="sub">Levo no te pide fuerza de voluntad infinita. Te da un sistema.</p><div class="whys">${WHYS.map(([t, x], i) => `<div><b>0${i + 1}</b><div><h3>${t}</h3><p>${x}</p></div></div>`).join("")}</div>`;
  if (o.step === 2) { ok = o.goals.size >= 1; btn = ok ? "Continuar" : "Elige al menos una"; body = `${no}<h1 class="title">¿Qué quieres transformar?</h1><p class="sub">Elige de 1 a 3. Tus hábitos y tu mentor se adaptarán.</p><div class="areas">${AREAS.map(a => `<button data-g="${a.id}" class="${o.goals.has(a.id) ? "on" : ""}"><b>${a.n}</b><small>${a.d}</small></button>`).join("")}</div>` }
  if (o.step === 3) { ok = o.why.trim().length >= 3; btn = ok ? "Continuar" : "Escribe tu porqué"; body = `${no}<h1 class="title">¿Por qué lo quieres de verdad?</h1><p class="sub">Escribe la razón que te levantará cuando no tengas ganas. Te la recordaré en los días difíciles.</p><textarea id="ow" rows="3" placeholder="Porque…">${esc(o.why)}</textarea><div class="sugs">${PORQUES.map(p => `<button data-why="${esc(p)}">${esc(p)}</button>`).join("")}</div>` }
  if (o.step === 4) { ok = o.who.trim().length >= 3; btn = ok ? "Continuar" : "Completa la frase"; body = `${no}<h1 class="title">¿Quién serás?</h1><p class="sub">No pienses en metas: piensa en identidad. Completa la frase.</p><p style="margin:0;font-size:22px;font-weight:800;font-stretch:110%">Dentro de 100 días soy alguien que…</p><textarea id="oq" rows="2" placeholder="…se levanta sin negociar">${esc(o.who)}</textarea><div class="sugs">${QUIENES.map(p => `<button data-who="${esc(p)}">${esc(p)}</button>`).join("")}</div>` }
  if (o.step === 5) body = `${no}<h1 class="title">Esta será tu estatua</h1><p class="sub">Hoy es un bloque de mármol. Con cada día cumplido irá saliendo de la piedra. Elige la figura.</p><div class="looks">${["a", "b"].map(x => `<button data-l="${x}" class="${o.look === x ? "on" : ""}" aria-label="Figura ${x === "a" ? "1" : "2"}">${statueSVG(4, o.name, 20, x)}</button>`).join("")}</div>`;
  if (o.step === 6) body = `${no}<h1 class="title">¿A qué hora te levantarás?</h1><p class="sub">Ganar la primera hora es ganar el día. Será tu primera victoria cada mañana.</p><div class="opts time">${["05:00", "05:30", "06:00", "06:30"].map(t => `<button data-w="${t}" class="${o.wake === t ? "on" : ""}">${t}</button>`).join("")}</div><label class="fields"><span>Otra hora</span><input id="owk" type="time" value="${o.wake}"></label>`;
  if (o.step === 7) {
    const sug = new Set(AREAS.filter(a => o.goals.has(a.id)).flatMap(a => a.h)), list = [...HABITOS_ESTOICOS.filter(h => sug.has(h.id)), ...HABITOS_ESTOICOS.filter(h => !sug.has(h.id))];
    ok = o.picks.size >= 3; btn = ok ? "Continuar" : `Elige ${3 - o.picks.size} más`;
    body = `${no}<h1 class="title">Tus hábitos</h1><p class="sub">Elige de 3 a 5. Arriba, los que más te ayudan con lo que quieres transformar.</p><div class="fields">${list.map(h => `<button class="hab ${o.picks.has(h.id) ? "on" : ""}" data-p="${h.id}"><span class="ck ${o.picks.has(h.id) ? "on" : ""}">✓</span><span style="color:var(--fg)">${esc(h.name)}${sug.has(h.id) ? ` <small style="color:var(--blue);font-weight:700">· recomendado</small>` : ""}</span></button>`).join("")}</div>`;
  }
  if (o.step === 8) body = `${no}<h1 class="title">Así será cada día</h1><p class="sub">Ocho pasos sencillos, de la mañana a la noche. Con 6 de 8, el día queda esculpido.</p><div class="steps8">${ORDER.map((k, i) => `<div><b>${i + 1}</b><span>${k === "wake" ? `Despertar a las ${o.wake}` : NAME[k]}</span></div>`).join("")}</div><div class="card" style="display:grid;gap:8px"><p class="sub"><b style="color:var(--fg)">Cada mañana</b>, una frase sellada de un gran autor con una acción para ti.</p><p class="sub"><b style="color:var(--fg)">Cada día</b>, una lección de tu mentor para aprender en el camino.</p><p class="sub"><b style="color:var(--fg)">Cada noche</b>, tres preguntas para examinar tu día.</p></div>`;
  if (o.step === 9) { body = `${no}<h1 class="title xl">El pacto</h1><p class="pact">Yo, <em>${esc(o.name || "yo")}</em>, me comprometo a esculpir a alguien que <em>${esc(o.who || "cumple lo que se promete")}</em> durante 100 días. Cuando caiga, me levantaré.</p><div style="flex:1"></div>`; extra = `<div class="ostage" style="opacity:.22;bottom:190px">${statueSVG(0, "", 0, o.look)}</div>` }
  const foot = o.step === 9 ? `<button class="holdbtn" id="sign"><span class="fill"></span><span class="lbl">Mantén pulsado para firmar</span></button><p class="holdhint">Es tu palabra. Siente el latido.</p><button class="link center" id="oback" style="color:#fff">Atrás</button>`
    : `<button class="btn ${blue ? "white" : ""}" id="onext" ${ok ? "" : "disabled"}>${btn}</button>${o.step ? `<button class="link center" id="oback">Atrás</button>` : ""}`;
  app.innerHTML = `<div class="onb ${blue ? "blue" : ""}">${extra}<div class="prog">${Array.from({ length: N }, (_, i) => `<i class="${i <= o.step ? "on" : ""}"></i>`).join("")}</div><div class="body">${body}</div><div class="foot">${foot}</div></div>`;
  const re = () => renderOnb(app);
  if ($("on")) $("on").oninput = e => o.name = e.target.value.trim();
  if ($("ow")) $("ow").oninput = e => { o.why = e.target.value; const okk = o.why.trim().length >= 3; $("onext").disabled = !okk; $("onext").textContent = okk ? "Continuar" : "Escribe tu porqué" };
  if ($("oq")) $("oq").oninput = e => { o.who = e.target.value; const okk = o.who.trim().length >= 3; $("onext").disabled = !okk; $("onext").textContent = okk ? "Continuar" : "Completa la frase" };
  app.querySelectorAll("[data-g]").forEach(b => b.onclick = () => { const id = b.dataset.g; if (o.goals.has(id)) o.goals.delete(id); else if (o.goals.size < 3) o.goals.add(id); SFX.tap(); re() });
  app.querySelectorAll("[data-why]").forEach(b => b.onclick = () => { o.why = b.dataset.why; SFX.tap(); re() });
  app.querySelectorAll("[data-who]").forEach(b => b.onclick = () => { o.who = b.dataset.who; SFX.tap(); re() });
  app.querySelectorAll("[data-l]").forEach(b => b.onclick = () => { o.look = b.dataset.l; SFX.tap(); re() });
  app.querySelectorAll("[data-w]").forEach(b => b.onclick = () => { o.wake = b.dataset.w; SFX.tap(); re() });
  if ($("owk")) $("owk").onchange = e => { o.wake = e.target.value || "05:00"; re() };
  app.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { const id = b.dataset.p; if (o.picks.has(id)) o.picks.delete(id); else if (o.picks.size < 5) o.picks.add(id); SFX.tap(); re() });
  if ($("oback")) $("oback").onclick = () => { o.step--; re() };
  if ($("onext")) $("onext").onclick = () => { SFX.tap(); haptic(); o.step++; window.scrollTo(0, 0); re() };
  if ($("sign")) bindHold($("sign"), 2200, () => {
    const keepStart = set().v2 && set().start;
    S.set = { ...S.set, v2: true, v3: true, name: o.name, wake: o.wake, goals: [...o.goals], why: o.why.trim(), who: o.who.trim(), look: o.look, start: keepStart || dayKey(0), pactAt: new Date().toISOString(), fav: S.set.fav || [] };
    const had = new Set(HABITOS_ESTOICOS.filter(mine).map(h => h.id)), same = had.size === o.picks.size && [...o.picks].every(id => had.has(id));
    if (!same) {
      const old = S.habits.map(h => h.id);
      S.habits = HABITOS_ESTOICOS.filter(h => o.picks.has(h.id)).map((h, i) => ({ id: `${h.id}-${(S.uid || "demo").slice(0, 8)}-${Date.now().toString(36)}`, name: h.name, area: h.area, ord: i }));
      if (!DEMO && S.uid) { if (old.length) write(() => sb.from("habits").update({ active: false }).in("id", old)); write(() => sb.from("habits").insert(S.habits.map(h => ({ ...h, user_id: S.uid, active: true })))) }
    }
    if (!DEMO && S.uid) saveSet();
    renderOnb.o = null; app.innerHTML = ""; SFX.chisel();
    moment({ big: "Pacto firmado", title: `Día ${dayNum()}`, text: "Tu bloque de mármol te espera. Empieza por el primer paso de tu camino.", btn: "Empezar mi camino", onClose: () => { route(); setTimeout(() => openSheet("guide"), 300) } });
  });
}

/* ---------- arranque ---------- */
function demo() {
  S.uid = "demo"; S.ready = true; S.set = { v2: true, v3: true, name: "Esteban", wake: "05:00", start: dayKey(-28), fav: ["s0", "e3"], goals: ["cuerpo", "trabajo"], why: "Para demostrarme que puedo y tener energía para los que quiero", who: "cumple lo que se promete", look: "a" };
  S.habits = HABITOS_ESTOICOS.slice(0, 5).map((h, i) => ({ ...h, ord: i }));
  for (let o = -28; o <= 0; o++) {
    const k = dayKey(o), good = ![-6, -11, -2, -19].includes(o);
    S.days[k] = { done: Object.fromEntries(S.habits.slice(0, good && o ? 4 : 1).map(h => [h.id, true])) };
    S.journal[k] = o === 0 ? { wake: "05:04" } : good ? { wake: "05:0" + (Math.abs(o) % 9), open: true, breath: true, commit: true, practiced: true, aff: ["a", "b", "c"], tasks: [{ t: "x", done: true }, { t: "y", done: true }], meals: { desayuno: "limpio", comida: "limpio", cena: "regular" }, water: 9, exam: { bien: "x" } } : { wake: "06:40", open: o % 2 === 0 };
  }
  S.weighs = [[-21, 78.4], [-14, 77.9], [-7, 77.3], [0, 76.9]].map(([o, kg]) => ({ day: dayKey(o), kg })); S.bodyP = { height_cm: 178, weight_kg: 76.9, goal: "perder" };
}
const LV = (document.querySelector('meta[name="levo-version"]') || {}).content;
async function checkUpdate() { if (!LV || DEMO) return; try { const j = await (await fetch("version.json?t=" + Date.now(), { cache: "no-store" })).json(); if (j.v && j.v !== LV && !busy()) location.reload() } catch (e) { } }
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { checkUpdate(); if (S.ready && !busy()) route() } });
if ("serviceWorker" in navigator && !DEMO) navigator.serviceWorker.register("sw.js");
if (DEMO) {
  if (SHOT) document.documentElement.classList.add("shot");
  demo();
  if (SHOT && SHOT.startsWith("onb")) { S.set.v3 = false; if (SHOT.length > 3) { renderOnb.o = null; route(); renderOnb.o.step = +SHOT.slice(3) } }
  if (SHOT && ["mentor", "estatua", "perfil"].includes(SHOT)) S.tab = SHOT;
  route();
  if (SHOT && SHEETS[SHOT]) setTimeout(() => openSheet(SHOT), 200);
} else {
  bootCache();
  sb.auth.onAuthStateChange((_e, session) => { const was = S.uid; S.uid = session ? session.user.id : null; if (S.uid && S.uid !== was) load(); else if (!S.uid) { S.ready = false; route() } });
  setTimeout(checkUpdate, 2500);
}
