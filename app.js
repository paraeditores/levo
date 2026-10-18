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
/* Instrumentos de Tone.js: se crean al primer toque (el navegador lo exige) */
const TN = { on: false };
async function toneInit() {
  if (TN.on || TN.busy || !window.Tone || set().sound === false) return; TN.busy = true;
  try {
    await Tone.start();
    const rev = new Tone.Reverb({ decay: 1.6, wet: .16 }).toDestination();
    /* cristal: notas limpias y cortas, como las confirmaciones de iOS */
    TN.glass = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" }, envelope: { attack: .002, decay: .26, sustain: 0, release: .28 }, volume: -21 }).connect(rev);
    TN.bell = new Tone.PolySynth(Tone.FMSynth, { harmonicity: 2, modulationIndex: 2.5, oscillator: { type: "sine" }, envelope: { attack: .002, decay: .5, sustain: 0, release: .6 }, modulation: { type: "sine" }, modulationEnvelope: { attack: .002, decay: .1, sustain: 0, release: .1 }, volume: -26 }).connect(rev);
    TN.tick = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: .001, decay: .03, sustain: 0, release: .02 }, volume: -28 }).toDestination();
    TN.thump = new Tone.MembraneSynth({ pitchDecay: .025, octaves: 2, envelope: { attack: .001, decay: .16, sustain: 0, release: .04 }, volume: -17 }).toDestination();
    TN.pad = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" }, envelope: { attack: .7, decay: 1.2, sustain: .15, release: 1.8 }, volume: -31 }).connect(rev);
    TN.drop = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: .001, decay: .07, sustain: 0, release: .03 }, volume: -25 }).toDestination();
    TN.on = true;
  } catch (e) { } TN.busy = false;
}
const tn = fn => { if (set().sound === false) return false; if (!TN.on) { toneInit(); return false } try { fn(Tone.now()) } catch (e) { } return true };
const SFX = {
  tap: () => tn(t => TN.tick.triggerAttackRelease("G6", .03, t, .7)) || tone(1600, .03, { type: "sine", v: .015 }),
  beat: () => tn(t => { TN.thump.triggerAttackRelease("A1", "32n", t, .7); TN.thump.triggerAttackRelease("F1", "32n", t + .16, .45) }) || (tone(70, .12, { v: .25 }), tone(60, .1, { v: .16, t: .16 })),
  chisel: () => tn(t => { TN.bell.triggerAttackRelease("E7", "32n", t, .5); TN.glass.triggerAttackRelease("B6", "32n", t + .04, .35) }) || tone(2600, .18, { type: "sine", v: .03 }),
  seal: () => tn(t => { TN.glass.triggerAttackRelease("E5", "16n", t, .55); TN.glass.triggerAttackRelease("B5", "16n", t + .09, .5); TN.bell.triggerAttackRelease("E6", "8n", t + .18, .4) }) || (tone(660, .25, { v: .04 }), tone(990, .3, { v: .035, t: .09 })),
  done: () => tn(t => { TN.glass.triggerAttackRelease("C6", "16n", t, .6); TN.glass.triggerAttackRelease("G6", "16n", t + .08, .5) }) || (tone(1046, .25, { v: .04 }), tone(1568, .3, { v: .03, t: .08 })),
  sculpt: () => tn(t => { ["C5", "E5", "G5", "C6"].forEach((n, i) => TN.glass.triggerAttackRelease(n, "16n", t + i * .07, .55)); TN.bell.triggerAttackRelease("G6", "8n", t + .32, .45); TN.pad.triggerAttackRelease(["C4", "G4"], "1n", t, .4) }) || [523, 659, 784, 1047].forEach((f, i) => tone(f, .35, { v: .04, t: i * .07 })),
  breath: i => tn(t => TN.pad.triggerAttackRelease(["A3", "E4", "D4", "A3"][i], "2n", t, .45)) || tone([392, 523, 330, 262][i], 1.2, { v: .025 }),
  water: n => tn(t => { TN.drop.triggerAttackRelease(620 + (n % 10) * 30, .06, t, .6); TN.drop.frequency.exponentialRampToValueAtTime(1350 + (n % 10) * 40, t + .05) }) || tone(880 + n * 40, .08, { v: .03 }),
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
document.addEventListener("pointerdown", () => { ac(); toneInit() }, { once: true });

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
const busy = () => $("sheet") || $("flow") || document.querySelector(".moment") || (document.querySelector(".onb") && renderOnb.o && renderOnb.o.step > 0);

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
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  mentor: '<svg viewBox="0 0 24 24"><path d="M6 20c0-4 2.5-6 6-6s6 2 6 6M12 14a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM4 9c1-3 3-5 5-6M20 9c-1-3-3-5-5-6"/></svg>',
  laurel: '<svg viewBox="0 0 24 24"><path d="M12 21V9M12 9c-3-1-5-4-5-7M12 9c3-1 5-4 5-7M12 14c-3 0-5-2-6-4M12 14c3 0 5-2 6-4M12 18c-2.5 0-4.5-1.5-5.5-3M12 18c2.5 0 4.5-1.5 5.5-3"/></svg>',
  dia: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h9M4 18h6"/><circle cx="17.5" cy="16.5" r="3.5"/><path d="M17.5 15v1.6l1 .9"/></svg>',
  hoy: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>',
  estatua: '<svg viewBox="0 0 24 24"><path d="M7 21h10M9 21v-3h6v3M12 18c-3.5 0-5.5-2-5.5-4.5 0-1.6 1-2.7 2.2-3.3A3.9 3.9 0 0 1 12 3a3.9 3.9 0 0 1 3.3 7.2c1.2.6 2.2 1.7 2.2 3.3C17.5 16 15.5 18 12 18z"/></svg>',
  perfil: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
};
const CHK = IC.check.replace("<svg", '<svg width="20" height="20" style="fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round"');

/* ---------- navegación ---------- */
const TABS = [["hoy", "Hoy"], ["dia", "Día"], ["mentor", "Mentor"], ["estatua", "Galería"], ["perfil", "Perfil"]];
function route() {
  const app = $("app");
  if (!S.uid && !DEMO) return renderGate(app);
  if (!S.ready) return;
  if (!set().v3) return renderOnb(app);
  renderMain(app);
  if (!DEMO && set().v3 && !set().seenTabs && !busy()) { S.set.seenTabs = true; saveSet(); setTimeout(() => openSheet("guide"), 900) }
}
function renderMain(app) {
  if (!$("view")) app.innerHTML = `<main id="view"></main><nav class="tabbar" aria-label="Secciones">${TABS.map(([k, n]) => `<button data-tab="${k}">${IC[k]}${n}</button>`).join("")}<i class="tabind"></i></nav>`;
  app.querySelectorAll("[data-tab]").forEach(b => { b.setAttribute("aria-selected", b.dataset.tab === S.tab); b.onclick = () => { if (S.tab !== b.dataset.tab) SFX.tap(); S.tab = b.dataset.tab; window.scrollTo(0, 0); renderMain(app) } });
  const v = $("view"); v.className = "wrap";
  S.animate = S.lastTab !== S.tab; S.lastTab = S.tab;
  if (!TABS.some(t => t[0] === S.tab)) S.tab = "hoy";
  ({ hoy: renderHoy, dia: renderDia, mentor: renderMentor, estatua: renderEstatua, perfil: renderPerfil })[S.tab](v);
  const nav = app.querySelector(".tabbar"), act = nav && nav.querySelector('[aria-selected="true"]'), ind = nav && nav.querySelector(".tabind");
  if (act && ind) { const r = act.getBoundingClientRect(), nr = nav.getBoundingClientRect(); ind.style.transform = `translateX(${(r.left - nr.left + r.width / 2 - 11).toFixed(1)}px)` }
  if (S.animate) v.querySelectorAll(".now-t, .title").forEach(el => { if (el.children.length) return; el.innerHTML = el.textContent.split(" ").map((w, i) => `<span class="wd" style="animation-delay:${(.12 + i * .07).toFixed(2)}s">${esc(w)}</span>`).join(" ") });
  attach3D();
  if (S.animate) { v.classList.add("anim"); [...v.children].forEach((c, i) => { c.classList.add("rise"); c.style.setProperty("--i", Math.min(i, 8)) }) } else v.classList.remove("anim");
}

/* ================= HOY ================= */
function heroHTML() {
  const d = dayNum(), sc = sculpted(), fz = faseDe(sc);
  return `<section class="hero"><div class="bar-top"><span class="wordmark">LEVO</span><button class="help" id="help" aria-label="Cómo funciona Levo">?</button></div><div class="stage" id="stage"><div class="aura"></div>${myStatue(sc)}</div><p class="hmeta">Día <b data-count="${d}">${d}</b> · ${esc(fz.name)}</p></section>`;
}
const _r = k => { const v = Math.sin(k * 91.7 + 13.3) * 43758.5453; return v - Math.floor(v) };
const dustHTML = () => `<div class="dust" aria-hidden="true">${Array.from({ length: 16 }, (_, i) => `<i style="left:${(_r(i) * 100).toFixed(1)}%;width:${(2 + _r(i + 40) * 3).toFixed(1)}px;height:${(2 + _r(i + 40) * 3).toFixed(1)}px;animation-duration:${(6 + _r(i + 9) * 7).toFixed(1)}s;animation-delay:-${(_r(i + 3) * 9).toFixed(1)}s"></i>`).join("")}</div>`;
function countUps(root) { root.querySelectorAll("[data-count]").forEach(el => { const to = +el.dataset.count; if (SHOT || matchMedia("(prefers-reduced-motion: reduce)").matches || !S.animate) { el.textContent = to; return } const t0 = performance.now(), ms = 1100; const step = now => { const p = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(to * e); if (p < 1) requestAnimationFrame(step) }; el.textContent = 0; requestAnimationFrame(step) }) }
function tilt(hero) { const st = hero.querySelector(".stage"); if (!st) return; hero.addEventListener("pointermove", e => { const r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; st.style.setProperty("--ry", (x * 14).toFixed(2) + "deg"); st.style.setProperty("--rx", (-y * 10).toFixed(2) + "deg") }); hero.addEventListener("pointerleave", () => { st.style.setProperty("--ry", "0deg"); st.style.setProperty("--rx", "0deg") }) }
/* ================= FOCO DE LA SEMANA: tu mentor refuerza tu punto débil ================= */
const WEAK_TIP = {
  wake: "Deja el móvil fuera del dormitorio y el despertador lejos de la cama: tendrás que levantarte para apagarlo.",
  frase: "Abre tu frase nada más levantarte, antes de mirar el móvil.",
  breath: "Respira justo al levantarte, sentado en la cama: un minuto, antes que nada.",
  aff: "Escribe tus afirmaciones con el primer café o el primer vaso de agua.",
  tasks: "Elige tus 3 tareas la noche anterior y empieza por la más difícil.",
  habits: "Hazlos más pequeños esta semana: mejor 5 minutos que nada.",
  food: "Apunta cada comida al terminarla: son 5 segundos.",
  exam: "Pon una alarma 30 minutos antes de dormir para tu rutina de noche.",
};
const SEAL_TXT = { wake: "DESP", frase: "FRASE", breath: "AIRE", aff: "YO", tasks: "TAREA", habits: "HÁB", food: "COMER", exam: "EXAM" };
const weekKey = (d = new Date()) => { const x = new Date(d); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return fmt(x) };
function weakest(before) {
  const days = []; for (let o = 1; o <= 14; o++) { const d = new Date(before + "T12:00"); d.setDate(d.getDate() - o); const k = fmt(d); if (k < START()) break; days.push(k) }
  if (days.length < 2) return null;
  const r = ORDER.map(s => ({ s, n: days.filter(k => steps(k)[s]).length })).sort((a, b) => a.n - b.n)[0];
  return r.n / days.length >= .85 ? null : { step: r.s, n: r.n, of: days.length };
}
function focus() {
  const wk = weekKey(); let f = set().focus;
  if (!f || f.week !== wk) { const w = weakest(wk); f = w ? { week: wk, step: w.step, base: w.n + "/" + w.of } : { week: wk, step: null }; S.set.focus = f; if (!DEMO && S.uid) saveSet() }
  if (!f.step) return null;
  let done = 0; for (let i = 0; i < 7; i++) { const d = new Date(wk + "T12:00"); d.setDate(d.getDate() + i); const k = fmt(d); if (k > dayKey(0)) break; if (k >= START() && steps(k)[f.step]) done++ }
  return { ...f, done, target: 5, tip: WEAK_TIP[f.step] };
}
const focusHTML = fo => `<section class="focus"><p class="eyebrow">Foco de la semana · tu mentor</p><h3>${NAME[fo.step]}</h3><div class="fdots">${Array.from({ length: fo.target }, (_, i) => `<i class="${i < fo.done ? "on" : ""}"></i>`).join("")}</div><p class="sub">${fo.done >= fo.target ? "<b>Reto cumplido.</b> Esta debilidad ya es un poco menos débil: tienes tu sello." : `Es tu punto débil: lo cumpliste ${fo.base} días. <b>Reto: 5 días esta semana</b> (llevas ${fo.done}). ${fo.tip}`}</p></section>`;
function sealsHTML() { const ss = set().seals || []; return `<section class="card" style="display:grid;gap:12px"><p class="eyebrow">Sellos de constancia · ${ss.length}</p>${ss.length ? `<div class="seals">${ss.slice(-12).map(x => `<span class="sealm" title="${esc(NAME[x.step])}">${SEAL_TXT[x.step] || ""}</span>`).join("")}</div>` : `<p class="sub">Cada semana tu mentor elige tu punto débil. Cúmplelo 5 días y ganas un sello.</p>`}</section>` }
function mentorLine() {
  const k = dayKey(0), st = steps(k), n = nDone(k), hr = new Date().getHours(), d = dayNum(), why = set().why;
  const yRit = d > 1 && isRitual(dayKey(-1)), two = d > 2 && !isRitual(dayKey(-1)) && !isRitual(dayKey(-2));
  if (d === 1 && n === 0) return "Hoy das el primer golpe. No busques hacerlo perfecto: busca empezar.";
  if (n >= 8) return "Has cumplido todo lo que te prometiste. Descansa: mañana seguimos.";
  if (n >= 6) return "Hoy ya has esculpido. Lo que hagas ahora es pulir.";
  const fo = focus(); if (fo && !st[fo.step] && fo.done < fo.target) return `Hoy, tu foco de la semana: ${NAME[fo.step].toLowerCase()}. Ese paso es el que más te transforma ahora.`;
  if (two && why) return `Dos días sin esculpir. Recuerda por qué empezaste: «${esc(why)}». Hoy solo necesitas 6 pasos.`;
  if (d > 1 && !yRit && hr < 14) return "Ayer no esculpiste. Una caída no te define; dos seguidas empiezan a hacerlo. Hoy es sagrado.";
  if (!st.wake && hr < 11) return "Tu primera victoria es levantarte. Lo demás viene después.";
  if (hr >= 20 && !st.exam) return "Antes de dormir, examina tu día. Así se aprende del camino.";
  const s = streak(); if (s >= 3) return `Llevas ${s} días seguidos. La disciplina ya trabaja para ti: no la dejes sola hoy.`;
  const next = ORDER.find(x => !st[x]); return `Tu siguiente paso: ${NAME[next].toLowerCase()}. Pequeño y ahora.`;
}
function stepStatus(key) {
  const k = dayKey(0), j = J(), st = steps(k), tgt = set().wake || "05:00";
  const aff = (j.aff || []).filter(s => s && s.trim()).length, tasks = (j.tasks || []).filter(t => t && t.t && t.t.trim()), td = tasks.filter(t => t.done).length, meals = ["desayuno", "comida", "cena"].filter(m => j.meals && j.meals[m]).length, hd = S.habits.filter(h => doneFor(k)[h.id]).length;
  return {
    wake: j.wake ? `En pie a las ${j.wake}` : `Mañana · a las ${tgt}`,
    frase: st.frase ? (j.practiced ? "Acción hecha" : "Comprometido") : j.open ? "Comprométete con su acción" : "Mañana · ábrela",
    breath: st.breath ? "Un minuto de calma" : "Mañana · 1 minuto",
    aff: st.aff ? "3 de 3 escritas" : aff ? `${aff} de 3 escritas` : "Mañana · 3 frases",
    tasks: tasks.length ? `${td} de ${tasks.length} hechas` : "Mañana · elige 3",
    habits: S.habits.length ? `${hd} de ${S.habits.length} hechos` : "Añade tus hábitos",
    food: `${meals} de 3 comidas · ${j.water || 0} vasos`,
    exam: st.exam ? "Día examinado" : "Noche · 3 preguntas",
  }[key];
}
/* ================= TU DÍA: el mejor momento para cada cosa ================= */
const SLOTS = [
  { id: "despertar", n: "Al despertar", why: "Antes de que el día te arrastre: lo que haces al despertar se cumple casi siempre." },
  { id: "manana", n: "Mañana", why: "Tu pico de concentración llega 2–4 horas después de despertar. Es el momento para lo difícil." },
  { id: "mediodia", n: "Mediodía", why: "Después de comer baja la energía: perfecto para caminar o para tareas ligeras." },
  { id: "tarde", n: "Tarde", why: "Por la tarde el cuerpo rinde más físicamente y es buen momento para recados y llamadas." },
  { id: "noche", n: "Noche", why: "Toca bajar el ritmo: leer, reflexionar y preparar mañana." },
];
const SLOT_DIA = { id: "dia", n: "Todo el día", why: "Repártelo a lo largo del día, un poco cada vez." };
const slotById = id => SLOTS.find(s => s.id === id) || SLOT_DIA;
const m2t = m => { const x = ((Math.round(m) % 1440) + 1440) % 1440; return `${pad(Math.floor(x / 60))}:${pad(x % 60)}` };
function slotRange(id) { const w = toMin(set().wake || "05:00"); return { despertar: [w, w + 60], manana: [w + 60, Math.max(w + 120, 780)], mediodia: [Math.max(w + 120, 780), 960], tarde: [960, 1200], noche: [1200, 1410] }[id] }
const slotLabel = id => { const r = slotRange(id); return r ? `${m2t(r[0])}–${m2t(r[1])}` : "" };
const slotTime = id => { const w = toMin(set().wake || "05:00"); return m2t({ despertar: w + 15, manana: w + 120, mediodia: 840, tarde: 1050, noche: 1260 }[id] ?? 720) };
function currentSlot() { const m = toMin(hhmm()); const s = SLOTS.find(x => { const r = slotRange(x.id); return m >= r[0] && m < r[1] }); return s ? s.id : null }
const HSLOT_DEF = { leer: "noche", entreno: "manana", frio: "despertar", meditar: "despertar", sinmovil: "despertar", caminar: "mediodia", agua: "dia", sinazucar: "dia", foco: "manana", dormir: "noche", ayudar: "tarde", gratitud: "tarde", gastos: "noche", ahorro: "manana", diario: "noche", estirar: "noche" };
const SLOT_KEYS = [
  [/medit|respir|ducha|fr[ií]o|afirma|sin m[oó]vil/i, "despertar"],
  [/estudi|trabaj|foco|escrib|proyecto|grab|crear|program|dise[nñ]|gui[oó]n|edit|informe|presentaci/i, "manana"],
  [/entren|gym|gimnas|correr|pesas|deporte|flexi|nadar|yoga|bici|abdomin/i, "manana"],
  [/camin|pase[oa]|pasos/i, "mediodia"],
  [/llam|email|correo|recado|compra|reuni|banco|pag[ao]|cita|mensaje/i, "tarde"],
  [/le[eé]|lectura|libro|gratitud|diario|gasto|estir|dorm|planific|orden/i, "noche"],
  [/agua|az[uú]car|alcohol|comer|fruta|verdura|prote/i, "dia"],
];
function suggestSlot(name, type, idx = 0) { for (const [re, s] of SLOT_KEYS) if (re.test(name || "")) return type === "task" && s === "dia" ? "manana" : s; return type === "task" ? (["manana", "manana", "tarde", "tarde", "mediodia", "noche"][idx] || "tarde") : "manana" }
const hInfo = h => { const x = (set().hslot || {})[h.id]; if (x) return x; const base = Object.keys(HSLOT_DEF).find(k => h.id === k || h.id.startsWith(k + "-")); return { s: base ? HSLOT_DEF[base] : suggestSlot(h.name, "habit") } };
function dayItems() {
  const k = dayKey(0), j = J(), st = steps(k), items = [];
  items.push({ kind: "routine", r: "manana", s: "despertar", name: "Rutina de la mañana", done: mornCount() >= 5, sub: `${mornCount()} de 5 pasos · 6 min` });
  items.push({ kind: "routine", r: "dia", s: "mediodia", name: "Check-in rápido", done: !!(st.habits && st.food), sub: "Hábitos y comidas · 30 s" });
  items.push({ kind: "routine", r: "noche", s: "noche", name: "Rutina de la noche", done: !!(j.closed && st.exam), sub: `${nightCount()} de 4 · 5 min` });
  S.habits.forEach(h => { const x = hInfo(h); items.push({ kind: "habit", id: h.id, s: x.s, t: x.r ? x.t : null, name: h.name, done: !!doneFor(k)[h.id] }) });
  (j.tasks || []).forEach((t, i) => { if (t && t.t && t.t.trim()) items.push({ kind: "task", i, s: t.s || suggestSlot(t.t, "task", i), t: t.r ? t.tm : null, name: t.t, done: !!t.done }) });
  return items;
}
const dueNow = () => { const cur = currentSlot(); return cur ? dayItems().filter(x => x.kind !== "routine" && !x.done && x.s === cur).slice(0, 3) : [] };
function itemHTML(x) {
  const key = x.kind === "habit" ? "h:" + x.id : x.kind === "task" ? "t:" + x.i : "r:" + x.r;
  const lk = itemLock(x);
  if (lk) return `<div class="it ${x.kind} late"><button class="itck" data-lock="${esc(lockText(lk))}" aria-label="${esc(lockText(lk))}">${IC.clock.replace("<svg", '<svg width="15" height="15" style="fill:none;stroke:currentColor;stroke-width:1.4"')}</button><button class="itn" data-ed="${esc(key)}"><b>${esc(x.name)}</b><small>${esc(lockText(lk))}</small></button></div>`;
  return `<div class="it ${x.done ? "done" : ""} ${x.kind} ${S.fresh === key ? "fresh" : ""}"><button class="itck" data-ck="${esc(key)}" aria-label="${x.kind === "routine" ? "Abrir" : x.done ? "Desmarcar" : "Marcar como hecho"}">${x.done ? CHK : x.kind === "routine" ? "›" : ""}</button><button class="itn" data-ed="${esc(key)}"><b>${esc(x.name)}</b><small>${x.kind === "routine" ? x.sub : (x.kind === "habit" ? "Hábito" : "Tarea") + (x.t ? " · aviso a las " + x.t : "")}</small></button></div>`;
}
function planHTML() {
  const items = dayItems(), cur = currentSlot(), ci = SLOTS.findIndex(s => s.id === cur);
  return `<section class="plan"><div class="sec-h"><div><p class="eyebrow b">Tu día</p><h2 class="title">Cada cosa a su hora</h2></div><button class="addbtn" id="addItem">+ Añadir</button></div>
    <div class="tl">${["dia", ...SLOTS.map(s => s.id)].map(sid => { const its = items.filter(x => x.s === sid); if (!its.length) return ""; const sl = slotById(sid), si = SLOTS.findIndex(s => s.id === sid), isNow = sid === cur, past = si >= 0 && ci >= 0 && si < ci;
      return `<div class="slot ${isNow ? "now" : ""} ${past ? "past" : ""}"><div class="sl-h"><b>${sl.n}</b><span>${slotLabel(sid)}</span>${isNow ? `<span class="now-pill">Ahora</span>` : ""}</div>${isNow ? `<p class="sl-why">${sl.why}</p>` : ""}${its.map(itemHTML).join("")}</div>` }).join("")}</div></section>`;
}
function bindPlan(v) {
  if ($("addItem")) $("addItem").onclick = () => { SFX.tap(); S.edit = null; S.addType = "task"; openSheet("item") };
  v.querySelectorAll("[data-lock]").forEach(b => b.onclick = () => { toast(b.dataset.lock + ": ya no se puede marcar"); haptic() });
  v.querySelectorAll("[data-ck]").forEach(b => b.onclick = () => {
    const [t, id] = b.dataset.ck.split(/:(.+)/); if (t === "r") return startFlow(id);
    const p = snapshot();
    if (t === "h") { const h = S.habits.find(z => z.id === id), was = !!doneFor(dayKey(0))[id]; if (!h) return; toggleHabit(h); if (!was) { SFX.done(); haptic() } }
    if (t === "t") { const tk = J().tasks[+id]; tk.done = !tk.done; saveJ(); if (tk.done) { SFX.done(); haptic() } }
    S.fresh = b.dataset.ck; renderMain($("app")); setTimeout(() => S.fresh = null, 900); celebrate(p);
  });
  v.querySelectorAll("[data-ed]").forEach(b => b.onclick = () => { const [t, id] = b.dataset.ed.split(/:(.+)/); SFX.tap(); if (t === "r") return startFlow(id); S.edit = { t, id }; openSheet("item") });
}
function itemSheet(b, f) {
  const ed = S.edit, isNew = !ed; let type = ed ? (ed.t === "h" ? "habit" : "task") : (S.addType || "task"), name = "", s = null, tm = null, remind = false, manual = false;
  if (ed && ed.t === "h") { const h = S.habits.find(z => z.id === ed.id); if (h) { name = h.name; const x = hInfo(h); s = x.s; tm = x.t || null; remind = !!x.r; manual = true } }
  if (ed && ed.t === "t") { const t = J().tasks[+ed.id]; if (t) { name = t.t; s = t.s || suggestSlot(t.t, "task", +ed.id); tm = t.tm || null; remind = !!t.r; manual = true } }
  const nTasks = () => (J().tasks || []).filter(t => t && t.t && t.t.trim()).length;
  b.innerHTML = `<h2 class="title">${isNew ? "Añadir" : "Editar"}</h2>${isNew ? `<div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr))">${[["task", "Tarea de hoy"], ["habit", "Hábito diario"]].map(([k, n]) => `<button data-ty="${k}" aria-selected="${type === k}">${n}</button>`).join("")}</div>` : `<p class="eyebrow b">${type === "habit" ? "Hábito diario" : "Tarea de hoy"}</p>`}
    <input id="itname" maxlength="60" value="${esc(name)}" placeholder="${type === "habit" ? "Ej.: 20 flexiones" : "Ej.: Grabar el vídeo"}"><div id="itdyn" style="display:grid;gap:12px"></div>`;
  const dyn = () => {
    const sug = suggestSlot(name, type, isNew ? nTasks() : +(ed && ed.id) || 0); if (!manual) s = sug;
    if (type === "task" && s === "dia") s = sug;
    const opts = type === "habit" ? [...SLOTS, SLOT_DIA] : SLOTS, sl = slotById(s);
    $("itdyn").innerHTML = `<p class="eyebrow">El mejor momento</p><div class="slots">${opts.map(o => `<button data-sl="${o.id}" class="${s === o.id ? "on" : ""}">${o.n}${o.id === sug ? " <small>· recomendado</small>" : ""}</button>`).join("")}</div>
      <div class="tip"><span class="emblem sm">${IC.mentor}</span><p><b>${sl.n}${s !== "dia" ? " · " + slotLabel(s) : ""}.</b> ${sl.why}</p></div>
      ${s !== "dia" ? `<button class="prow tgl" id="itrem"><span class="tx"><b>Recordármelo a una hora</b><small>Un aviso solo para esto</small></span><span class="sw ${remind ? "on" : ""}"></span></button>${remind ? stepperHTML("ittm", tm || slotTime(s), 15) : ""}` : ""}`;
    $("itdyn").querySelectorAll("[data-sl]").forEach(x => x.onclick = () => { s = x.dataset.sl; manual = true; if (remind) tm = slotTime(s); SFX.tap(); dyn() });
    if ($("itrem")) $("itrem").onclick = () => { remind = !remind; if (remind && !tm) tm = slotTime(s); SFX.tap(); haptic(); dyn() };
    if ($("ittm")) { bindStepper($("itdyn")); $("itdyn").querySelectorAll("[data-for=ittm]").forEach(x => x.addEventListener("click", () => tm = $("ittm").textContent)) }
  };
  $("itname").oninput = e => { name = e.target.value; if (!manual) dyn() };
  b.querySelectorAll("[data-ty]").forEach(x => x.onclick = () => { type = x.dataset.ty; S.addType = type; SFX.tap(); b.querySelectorAll("[data-ty]").forEach(y => y.setAttribute("aria-selected", y.dataset.ty === type)); $("itname").placeholder = type === "habit" ? "Ej.: 20 flexiones" : "Ej.: Grabar el vídeo"; dyn() });
  dyn(); if (isNew) setTimeout(() => $("itname") && $("itname").focus(), 350);
  footBtn(f, isNew ? "Añadir" : "Guardar", () => {
    name = $("itname").value.trim(); if (!name) return toast("Escribe un nombre.");
    const when = remind ? ($("ittm") ? $("ittm").textContent : tm || slotTime(s)) : null;
    if (type === "habit") {
      let id = ed && ed.id;
      if (!id) { id = name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) + "-" + Date.now().toString(36); S.habits = [...S.habits, { id, name, area: "vida" }]; write(() => sb.from("habits").insert({ id, user_id: S.uid, name, area: "vida", ord: Date.now(), active: true })) }
      else { const h = S.habits.find(z => z.id === id); if (h && h.name !== name) { h.name = name; write(() => sb.from("habits").update({ name }).eq("id", id)) } }
      S.set.hslot = { ...(S.set.hslot || {}), [id]: { s, t: when, r: remind } }; saveSet();
    } else {
      const j = J();
      if (ed) Object.assign(j.tasks[+ed.id], { t: name, s, sm: true, tm: when, r: remind });
      else { j.tasks = (j.tasks || []).filter(t => t && t.t && t.t.trim()); if (j.tasks.length >= 6) return toast("Máximo 6 tareas al día: elige lo importante."); j.tasks.push({ t: name, done: false, s, sm: true, tm: when, r: remind }) }
      saveJ();
    }
    SFX.done(); haptic(); toast(isNew ? `Añadido: ${slotById(s).n.toLowerCase()}${when ? " · aviso a las " + when : ""}` : "Guardado"); closeSheet();
  });
  if (!isNew) footBtn(f, "Eliminar", () => {
    if (type === "habit") { const id = ed.id; S.habits = S.habits.filter(h => h.id !== id); write(() => sb.from("habits").update({ active: false }).eq("id", id)); const hs = { ...(S.set.hslot || {}) }; delete hs[id]; S.set.hslot = hs; saveSet() }
    else { J().tasks.splice(+ed.id, 1); saveJ() }
    SFX.tap(); toast("Eliminado"); closeSheet();
  }, "btn ghost");
}

const hasTasks = () => (J().tasks || []).some(t => t && t.t && t.t.trim());
const mornCount = () => { const st = steps(dayKey(0)); return [st.wake, st.breath, st.frase, st.aff, hasTasks()].filter(Boolean).length };
const nightCount = () => { const st = steps(dayKey(0)); return [st.habits, st.food, st.exam, !!J().closed].filter(Boolean).length };
/* ================= EL TIEMPO MANDA: cada cosa tiene su hora (la del reloj del móvil) ================= */
const nowMin = () => toMin(hhmm());
const W0 = () => toMin(set().wake || "05:00");
const MORNING_END = () => Math.min(1439, Math.max(780, W0() + 420));
const NIGHT_FROM = 1140;
const STEP_WIN = { wake: () => [W0() - 120, W0() + 120], breath: () => [W0() - 60, MORNING_END()], frase: () => [W0() - 60, MORNING_END()], aff: () => [W0() - 60, MORNING_END()], tasks: () => [W0() - 60, MORNING_END()], exam: () => [NIGHT_FROM, 1439], action: () => [NIGHT_FROM - 60, 1439] };
const MEAL_WIN = { desayuno: () => [W0() - 60, Math.max(720, W0() + 300)], comida: () => [660, 1050], cena: () => [1110, 1439] };
const slotDeadline = s => { if (!s || s === "dia") return 1439; const r = slotRange(s); return r ? Math.min(1439, r[1] + 30) : 1439 };
const winState = w => { const m = nowMin(); return m < w[0] ? "early" : m > w[1] ? "late" : "open" };
const FLOW_KEY = { m_wake: "wake", m_breath: "breath", m_frase: "frase", m_aff: "aff", m_tasks: "tasks", n_action: "action", n_bien: "exam", n_mejorar: "exam", n_gracias: "exam" };
/* ¿Está cerrado este paso del camino? Lo ya hecho siempre se puede ver */
function stepLock(key) {
  const st = steps(dayKey(0)); if (st[key]) return null;
  if (key === "habits" || key === "food") return null;
  if (key === "tasks" && hasTasks()) return null;
  const w = STEP_WIN[key] ? STEP_WIN[key]() : null; if (!w) return null;
  const s = winState(w); return s === "open" ? null : { s, w };
}
const lockText = l => l.s === "late" ? `Se pasó la hora (${m2t(l.w[1])})` : `Desde las ${m2t(l.w[0])}`;
function itemLock(x) {
  if (x.done) return null;
  if (x.kind === "habit" || x.kind === "task") { const d = slotDeadline(x.s); return nowMin() > d ? { s: "late", w: [0, d] } : null }
  if (x.kind === "routine" && x.r === "manana") { const w = [0, MORNING_END()]; return nowMin() > w[1] ? { s: "late", w } : null }
  if (x.kind === "routine" && x.r === "noche") { const w = [NIGHT_FROM - 60, 1439]; return nowMin() < w[0] ? { s: "early", w } : null }
  return null;
}
function lockedCard(c, nav, l, what) {
  c.innerHTML = `<p class="fl-eyebrow">${l.s === "late" ? "Se pasó la hora" : "Todavía no"}</p><div class="lockic">${IC.clock}</div><h2 class="fl-title">${l.s === "late" ? `${what} se cerró a las ${m2t(l.w[1])}` : `${what} se abre a las ${m2t(l.w[0])}`}</h2>${MLINE(l.s === "late" ? "El tiempo no vuelve, pero mañana sí. Cada cosa a su hora: esa es la disciplina." : "Cada cosa a su hora. Vuelve entonces y estará esperándote.")}`;
  nav.primary("Siguiente", nextStep);
}
const STEP_WHAT = { wake: "Despertar", breath: "La respiración", frase: "Tu frase", aff: "Las afirmaciones", tasks: "Elegir tus tareas", exam: "El examen nocturno", action: "Tu acción de hoy" };
function nowCard() {
  const k = dayKey(0), hr = new Date().getHours(), mc = mornCount(), nc = nightCount(), closed = J().closed && steps(k).exam;
  if (closed) return { r: null, ey: "Hoy", t: "Día cerrado", s: isRitual(k) ? "Has esculpido tu estatua. Descansa." : "Mañana es un día nuevo.", b: "" };
  if (mc < 5 && nowMin() <= MORNING_END()) return { r: "manana", ey: "Ahora", t: "Rutina de la mañana", s: `${mc} de 5 pasos · hasta las ${m2t(MORNING_END())}`, b: mc ? "Continuar" : "Empezar" };
  if (nowMin() >= NIGHT_FROM - 60) return { r: "noche", ey: "Ahora", t: "Rutina de la noche", s: `${nc ? nc + " de 4 · " : ""}Cierra el día en 5 minutos`, b: nc ? "Continuar" : "Empezar" };
  return { r: "dia", ey: "Durante el día", t: "Check-in rápido", s: `Marca tus hábitos y comidas en 30 segundos. Desde las ${m2t(NIGHT_FROM - 60)}, tu rutina de noche.`, b: "Hacer check-in" };
}
function renderHoy(v) {
  const c = nowCard(), n = nDone(dayKey(0)), fo = focus();
  v.innerHTML = heroHTML() + `<section class="now"><p class="now-ey">${c.ey}</p><h2 class="now-t">${c.t}</h2><p class="now-s">${c.s}</p>${c.b ? `<button class="btn" id="goNow">${c.b}</button>` : ""}<div class="dots" aria-label="${n} de 8 pasos">${ORDER.map((_, i) => `<i class="${i < n ? "on" : ""} ${i === 5 ? "six" : ""}" style="animation-delay:${.3 + i * .08}s"></i>`).join("")}<span>${n} de 8 · con 6 esculpes</span></div><p class="fl-mentor"><span class="emblem sm">${IC.mentor}</span><span>${mentorLine()}</span></p>${dueNow().length ? `<div class="due"><p class="eyebrow">Es tu mejor momento para</p>${dueNow().map(itemHTML).join("")}</div>` : ""}</section>`
    + (fo ? focusHTML(fo) : "")
    + `<button class="btn ghost" id="goDia">Ver mi día y mi camino</button>`;
  $("help").onclick = () => { SFX.tap(); openSheet("guide") };
  if ($("goNow")) $("goNow").onclick = () => startFlow(c.r);
  if ($("goDia")) $("goDia").onclick = () => { S.tab = "dia"; window.scrollTo(0, 0); renderMain($("app")) };
  bindPlan(v); countUps(v);
}
function renderDia(v) {
  const hoy = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  v.innerHTML = `<header class="page-top"><p class="eyebrow">Tu día</p><h1 class="title xl">${hoy}</h1><p class="sub" style="margin-top:8px">Tu camino de 8 pasos y cada cosa a su mejor hora.</p></header>
    <div class="sec-h" style="margin-top:6px"><div><p class="eyebrow">Tu camino</p><h2 class="title">8 pasos</h2></div><p class="sub" style="text-align:right;max-width:48%;font-size:13px">Toca uno para hacerlo. Con 6, esculpes.</p></div><div class="trail" id="trail"></div>` + planHTML();
  bindPlan(v); drawTrail();
}
/* La escultura 3D sustituye al SVG en cuanto está lista */
function attach3D() { const st = $("stage"); if (st && window.Statue3D && window.Statue3D.ok) { const n = sculpted(); window.Statue3D.mount(st, { days: n, stage: faseDe(n).i }) } }
addEventListener("statue3d", () => attach3D());
const NODE_GO = { wake: () => ["manana", "m_wake"], frase: () => ["manana", "m_frase"], breath: () => ["manana", "m_breath"], aff: () => ["manana", "m_aff"], tasks: () => hasTasks() ? ["noche", "n_tasks"] : ["manana", "m_tasks"], habits: () => new Date().getHours() >= 19 ? ["noche", "n_habits"] : ["dia", "n_habits"], food: () => new Date().getHours() >= 19 ? ["noche", "n_food"] : ["dia", "n_food"], exam: () => ["noche", "n_bien"] };
/* El sendero: nodos que serpentean de izquierda a derecha y bajan hacia la meta */
const XS = [.22, .62, .8, .42, .2, .6, .78, .4];
function drawTrail() {
  const t = $("trail"); if (!t) return;
  const W = t.clientWidth || 375, gap = 108, y0 = 58, k = dayKey(0), st = steps(k), now = ORDER.findIndex(x => !st[x]);
  const P = XS.map((x, i) => [x * W, y0 + i * gap]), goal = [W * .5, y0 + 8 * gap + 6], all = [...P, goal], H = goal[1] + 160;
  t.style.height = H + "px";
  const seg = (a, b) => `M${a[0]} ${a[1]}C${a[0]} ${a[1] + gap * .55} ${b[0]} ${b[1] - gap * .55} ${b[0]} ${b[1]}`;
  let svg = "", chev = "";
  all.forEach((p, i) => {
    if (!i) return; const a = all[i - 1], doneSeg = st[ORDER[i - 1]] && (i === 8 ? isRitual(k) : st[ORDER[i]]);
    svg += `<path d="${seg(a, p)}" ${doneSeg ? `class="dn" pathLength="1" style="--i:${i}"` : ""} fill="none" stroke="${doneSeg ? "var(--fg)" : "var(--faint)"}" stroke-width="${doneSeg ? 1.6 : 1}" stroke-linecap="round" ${doneSeg ? "" : 'stroke-dasharray="1 7"'}/>`;
    const mx = (a[0] + p[0]) / 2, my = (a[1] + p[1]) / 2, ang = Math.atan2(p[1] - a[1], p[0] - a[0]) * 180 / Math.PI - 90;
    chev += `<path d="M-6 -3L0 3L6 -3" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)}) rotate(${ang.toFixed(0)})" fill="none" stroke="var(--fg)" stroke-opacity=".35" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
  let html = `<svg class="tr" viewBox="0 0 ${W} ${H}" aria-hidden="true">${svg}${chev}</svg>`;
  ORDER.forEach((key, i) => {
    const [x, y] = P[i], done = st[key], isNow = i === now, left = XS[i] >= .5;
    const lk = stepLock(key);
    html += `<button class="node ${done ? "done" : ""} ${isNow && !lk ? "now" : ""} ${lk ? "late" : ""}" data-step="${key}" style="left:${x}px;top:${y}px;--i:${i}" aria-label="${i + 1}. ${NAME[key]}: ${esc(stepStatus(key))}">${done ? IC.check : IC[key]}<span class="num">${i + 1}</span></button>`;
    html += `<button class="nlabel ${left ? "l" : "r"}" data-step="${key}" style="top:${y}px;${left ? `right:${W - x + 42}px` : `left:${x + 42}px`}" tabindex="-1">${isNow && !lk ? `<span class="now-pill">Ahora</span>` : ""}<b>${NAME[key]}</b><small>${esc(lk ? lockText(lk) : stepStatus(key))}</small></button>`;
  });
  html += `<div class="goal" style="left:${goal[0]}px;top:${goal[1] - 20}px"><div class="gm">${myStatue()}</div><p>${isRitual(k) ? "Hoy ya has esculpido" : "Con 6 pasos, tu estatua avanza"}${nextPiece() ? `<br><span style="color:var(--blue)">Próxima pieza: ${esc(nextPiece().n)} en ${nextPiece().d - sculpted()} ${nextPiece().d - sculpted() === 1 ? "día" : "días"}</span>` : ""}</p></div>`;
  t.innerHTML = html;
  t.querySelectorAll("[data-step]").forEach(b => b.onclick = () => { const l = stepLock(b.dataset.step); if (l) { toast(`${STEP_WHAT[b.dataset.step]}: ${lockText(l).toLowerCase()}`); haptic(); return } const [r, at] = NODE_GO[b.dataset.step](); startFlow(r, at) });
}
addEventListener("resize", () => { if ($("trail") && !$("flow")) drawTrail() });

/* ================= RUTINAS PASO A PASO ================= */
const ROUT = {
  manana: { name: "Rutina de la mañana", steps: ["m_wake", "m_breath", "m_frase", "m_aff", "m_tasks", "m_end"] },
  noche: { name: "Rutina de la noche", steps: ["n_tasks", "n_habits", "n_food", "n_action", "n_bien", "n_mejorar", "n_gracias", "n_lesson", "n_tomorrow", "n_end"] },
  dia: { name: "Check-in del día", steps: ["n_habits", "n_food", "d_end"] },
};
const FL = { r: null, list: [], i: 0, snap: null, iv: 0 };
function startFlow(r, at) {
  if (r === "noche" && nowMin() < NIGHT_FROM - 60) { toast(`Tu rutina de noche se abre a las ${m2t(NIGHT_FROM - 60)}`); haptic(); return }
  const j = J(); let list = [...ROUT[r].steps];
  if (r === "noche") { if (!j.open) list = list.filter(s => s !== "n_action"); if (!hasTasks()) list = list.filter(s => s !== "n_tasks") }
  FL.r = r; FL.list = list; FL.i = Math.max(0, at ? list.indexOf(at) : 0); FL.snap = snapshot();
  document.body.classList.add("noscroll");
  let el = $("flow"); if (!el) { el = document.createElement("div"); el.id = "flow"; el.className = "flow"; el.setAttribute("role", "dialog"); document.body.append(el) }
  el.innerHTML = `<div class="fl-top"><div class="fl-prog" id="flprog"></div><button class="x" id="flx" aria-label="Cerrar">×</button></div><p class="fl-label" id="fllab"></p><div class="fl-stage" id="flstage"></div><div class="fl-foot" id="flfoot"></div>`;
  $("flx").onclick = () => { SFX.tap(); endFlow() };
  SFX.tap(); renderStep();
}
function endFlow() { clearInterval(FL.iv); const el = $("flow"); if (el) el.remove(); document.body.classList.remove("noscroll"); const p = FL.snap; FL.snap = null; route(); if (p && S.tab === "hoy") setTimeout(() => celebrate(p, null, true), 150) }
function nextStep() { clearInterval(FL.iv); if (FL.i >= FL.list.length - 1) return endFlow(); FL.i++; renderStep() }
function renderStep() {
  const id = FL.list[FL.i], real = FL.list.filter(s => !s.endsWith("_end")), ri = real.indexOf(id);
  $("flprog").innerHTML = real.map((_, k) => `<i class="${ri < 0 || k < ri ? "on" : k === ri ? "cur" : ""}"></i>`).join("");
  $("fllab").textContent = ri >= 0 ? `${ROUT[FL.r].name} · ${ri + 1} de ${real.length}` : ROUT[FL.r].name;
  const stage = $("flstage"), old = stage.querySelector(".fl-card:not(.out)");
  if (old) { old.classList.add("out"); setTimeout(() => old.remove(), 360) }
  const card = document.createElement("div"); card.className = "fl-card"; stage.append(card);
  const foot = $("flfoot"); foot.innerHTML = "";
  const nav = {
    primary: (label, fn, cls = "btn") => { const b = document.createElement("button"); b.className = cls; b.textContent = label; b.onclick = () => { SFX.tap(); fn() }; foot.append(b); return b },
    skip: (label = "Saltar este paso") => { const b = document.createElement("button"); b.className = "link center"; b.textContent = label; b.onclick = () => { SFX.tap(); nextStep() }; foot.append(b); return b },
    hold: (label, fn) => { foot.insertAdjacentHTML("afterbegin", `<button class="holdbtn" id="flhold"><span class="fill"></span><span class="lbl">${label}</span></button>`); bindHold($("flhold"), 1700, fn) },
  };
  const fk = FLOW_KEY[id], l = fk ? stepLock(fk) : null;
  if (l) lockedCard(card, nav, l, STEP_WHAT[fk]); else STEPUI[id](card, nav);
}
const MLINE = t => `<p class="fl-mentor"><span class="emblem sm">${IC.mentor}</span><span>${t}</span></p>`;
const addMin = (t, m) => { const x = ((toMin(t) + m) % 1440 + 1440) % 1440; return `${pad(Math.floor(x / 60))}:${pad(x % 60)}` };
const stepperHTML = (id, val, step) => `<div class="stepper"><button data-st="${-step}" data-for="${id}" aria-label="Antes">−</button><b id="${id}">${val}</b><button data-st="${step}" data-for="${id}" aria-label="Después">+</button></div>`;
const bindStepper = root => root.querySelectorAll("[data-st]").forEach(b => b.onclick = () => { const el = $(b.dataset.for); el.textContent = addMin(el.textContent, +b.dataset.st); SFX.tap(); haptic() });
const roundNow = () => addMin(hhmm(), -(toMin(hhmm()) % 5));
const won = word => { SFX.chisel(); haptic(2); toast(word) };
const examStep = (key, n, title, line) => (c, nav) => {
  const j = J(); j.exam = j.exam || {};
  c.innerHTML = `<p class="fl-eyebrow">Examen nocturno · ${n} de 3</p><h2 class="fl-title">${title}</h2><textarea id="ex" rows="4" placeholder="Escribe con sinceridad…">${esc(j.exam[key] || "")}</textarea>${MLINE(line)}`;
  $("ex").oninput = e => { j.exam[key] = e.target.value; saveJ() };
  nav.primary("Siguiente", nextStep); nav.skip();
};
const STEPUI = {
  m_wake(c, nav) {
    const j = J(), tgt = set().wake || "05:00";
    c.innerHTML = `<p class="fl-eyebrow">Despertar · tu objetivo: ${tgt}</p><p class="fl-clock" id="flclk">${hhmm()}</p><h2 class="fl-title">${j.wake ? `En pie a las ${j.wake}. Bien hecho.` : "¿A qué hora te has levantado?"}</h2>${j.wake ? "" : stepperHTML("wkt", roundNow(), 5)}${MLINE("La primera victoria del día es levantarte a la primera. Lo demás viene después.")}`;
    FL.iv = setInterval(() => { const e = $("flclk"); if (e) e.textContent = hhmm() }, 1000);
    if (j.wake) return nav.primary("Continuar", nextStep);
    bindStepper(c);
    nav.primary("Me he levantado", () => { j.wake = $("wkt").textContent; saveJ(); won(toMin(j.wake) <= toMin(tgt) + 15 ? "En pie. Primera victoria." : "En pie. Mañana, a tu hora."); nextStep() });
  },
  m_breath(c, nav) {
    const j = J(); let state = j.breath ? "done" : "idle", t0 = 0, lastI = -1;
    c.innerHTML = `<p class="fl-eyebrow">Respirar · 1 minuto</p><div class="breath"><span class="ringb"></span><span class="orb" id="orb"></span><div><b id="ph">${j.breath ? "Hecho" : "Prepárate"}</b><small id="cd">${j.breath ? "Mente en calma" : "4 · 4 · 4 · 4"}</small></div></div><h2 class="fl-title center">Respira en caja</h2>${MLINE("Cuatro segundos al inhalar, cuatro sosteniendo, cuatro al soltar y cuatro en pausa. La calma también se entrena.")}`;
    const phases = [["Inhala", 1.9], ["Mantén", 1.9], ["Exhala", 1], ["Pausa", 1]];
    const b = nav.primary(j.breath ? "Continuar" : "Empezar", () => {
      if (state !== "idle") return nextStep();
      state = "run"; t0 = Date.now(); b.textContent = "Respirando…"; b.disabled = true;
      FL.iv = setInterval(() => {
        const el = (Date.now() - t0) / 1000, left = Math.max(0, 64 - el), i = Math.floor(el / 4) % 4;
        if (i !== lastI && left > 0) { lastI = i; SFX.breath(i); haptic() }
        $("ph").textContent = left <= 0 ? "Hecho" : phases[i][0]; $("cd").textContent = left <= 0 ? "Mente en calma" : `${Math.ceil(left)} s`; $("orb").style.transform = `scale(${left <= 0 ? 1.4 : phases[i][1]})`;
        if (left <= 0) { clearInterval(FL.iv); state = "done"; j.breath = true; saveJ(); SFX.done(); haptic(2); b.disabled = false; b.textContent = "Continuar" }
      }, 200);
    });
    if (!j.breath) nav.skip();
  },
  m_frase(c, nav) {
    const j = J(), q = fq();
    if (!j.open) {
      c.innerHTML = `<p class="fl-eyebrow">Tu frase del día</p><div class="bigseal" id="bseal">${IC.laurel}</div><h2 class="fl-title center">Tu frase de hoy está sellada</h2><p class="sub center">Es de ${esc(q.a)} y trae una acción para ti. Solo se abre una vez al día.</p>`;
      return nav.primary("Romper el sello", () => { SFX.seal(); haptic(2); const s = $("bseal"); s.classList.add("opening"); s.insertAdjacentHTML("afterend", '<span class="shock big"></span>'); setTimeout(() => { j.open = true; saveJ(); renderStep() }, 650) });
    }
    c.classList.add("top");
    c.innerHTML = `<p class="fl-eyebrow">Tu frase del día</p><p class="fl-quote">«${esc(q.t)}»</p><p class="who">${esc(q.a)}</p><div class="accbox"><p class="eyebrow">Tu acción de hoy</p><p>${esc(q.acc)}</p></div>${MLINE("Leer no cambia nada; comprometerse, sí. Esta noche te preguntaré si la hiciste.")}`;
    if (j.commit) return nav.primary("Continuar", nextStep);
    nav.hold("Mantén pulsado para comprometerte", () => { j.commit = true; saveJ(); won("Compromiso firmado"); nextStep() });
  },
  m_aff(c, nav) {
    const j = J(); j.aff = j.aff || ["", "", ""]; const prev = (S.journal[dayKey(-1)] || {}).aff;
    c.classList.add("top");
    c.innerHTML = `<p class="fl-eyebrow">Afirmaciones</p><h2 class="fl-title">¿Quién eliges ser hoy?</h2><p class="sub">Tres frases en presente, como si ya lo fueras.</p><div class="fields">${[0, 1, 2].map(i => `<textarea id="af${i}" rows="2" placeholder="${["Yo soy…", "Hoy elijo…", "Me comprometo a…"][i]}">${esc(j.aff[i] || "")}</textarea>`).join("")}</div><div class="sugs">${AFIRMACIONES.slice(0, 4).map(a => `<button data-a="${esc(a)}">${esc(a)}</button>`).join("")}</div>`;
    const b = nav.primary("", () => { won("Afirmaciones escritas"); nextStep() });
    const upd = () => { const n = j.aff.filter(s => s && s.trim()).length; b.disabled = n < 3; b.textContent = n < 3 ? `Escribe ${3 - n} más` : "Guardar" };
    [0, 1, 2].forEach(i => $("af" + i).oninput = e => { j.aff[i] = e.target.value; saveJ(); upd() });
    c.querySelectorAll("[data-a]").forEach(x => x.onclick = () => { const i = j.aff.findIndex(s => !s || !s.trim()); if (i < 0) return; SFX.tap(); j.aff[i] = x.dataset.a; $("af" + i).value = x.dataset.a; saveJ(); upd() });
    upd();
    if (prev && prev.filter(s => s && s.trim()).length >= 3 && b.disabled) nav.primary("Usar las de ayer", () => { j.aff = [...prev]; saveJ(); won("Afirmaciones escritas"); nextStep() }, "btn ghost");
    nav.skip();
  },
  m_tasks(c, nav) {
    const j = J(); j.tasks = j.tasks || []; while (j.tasks.length < 3) j.tasks.push({ t: "", done: false });
    const ids = SLOTS.map(s => s.id), sOf = (t, i) => t.s || suggestSlot(t.t, "task", i);
    c.classList.add("top");
    c.innerHTML = `<p class="fl-eyebrow">Tus 3 tareas</p><h2 class="fl-title">Si solo hicieras tres cosas hoy, ¿cuáles serían?</h2><div class="fields">${j.tasks.map((t, i) => `<div class="task"><input id="tk${i}" placeholder="Tarea ${i + 1}" value="${esc(t.t)}"><button class="tslot" data-ts="${i}" aria-label="Cambiar el momento">${slotById(sOf(t, i)).n}</button></div>`).join("")}</div>${MLINE("Te sugiero el mejor momento para cada una: lo difícil, por la mañana, cuando tu concentración está en lo más alto. Toca el momento para cambiarlo.")}`;
    c.querySelectorAll("[data-ts]").forEach(x => x.onclick = () => { const i = +x.dataset.ts, t = j.tasks[i]; t.s = ids[(ids.indexOf(sOf(t, i)) + 1) % ids.length]; t.sm = true; x.textContent = slotById(t.s).n; saveJ(); SFX.tap(); haptic() });
    const b = nav.primary("", () => { won("Tareas elegidas"); nextStep() });
    const upd = () => { const n = j.tasks.filter(t => t.t.trim()).length; b.disabled = n < 1; b.textContent = n ? "Guardar" : "Escribe al menos una" };
    j.tasks.forEach((t, i) => $("tk" + i).oninput = e => { t.t = e.target.value; if (!t.sm) { t.s = suggestSlot(t.t, "task", i); c.querySelector(`[data-ts="${i}"]`).textContent = slotById(t.s).n } saveJ(); upd() }); upd(); nav.skip();
  },
  m_end(c, nav) {
    c.innerHTML = `<div class="fl-statue">${myStatue()}</div><h2 class="fl-title center">Mañana ganada</h2><p class="sub center">Durante el día, marca tus hábitos y comidas. Esta noche, 5 minutos para cerrar el día.</p>`;
    SFX.done(); haptic(2); nav.primary("Ir a mi día", endFlow);
  },
  n_tasks(c, nav) {
    const j = J(), tasks = j.tasks.map((t, i) => ({ ...t, i })).filter(t => t.t && t.t.trim());
    c.classList.add("top");
    c.innerHTML = `<p class="fl-eyebrow">Tus tareas</p><h2 class="fl-title">¿Cuáles has terminado?</h2><div class="fields">${tasks.map(t => { const lk = !t.done && nowMin() > slotDeadline(t.s || suggestSlot(t.t, "task", t.i)); return `<button class="chk ${t.done ? "on" : ""} ${lk ? "late" : ""}" data-t="${t.i}" ${lk ? 'data-late="1"' : ""}><span class="ck ${t.done ? "on" : ""}">✓</span><span>${esc(t.t)}${lk ? ` <small>· se pasó la hora</small>` : ""}</span></button>` }).join("")}</div>${MLINE("Con 2 de 3 cuenta el paso. Lo que no terminaste, mañana tiene otra oportunidad.")}`;
    c.querySelectorAll("[data-t]").forEach(x => x.onclick = () => { if (x.dataset.late) { toast("Se pasó la hora de esta tarea"); haptic(); return } const t = j.tasks[+x.dataset.t]; t.done = !t.done; saveJ(); x.classList.toggle("on", t.done); x.querySelector(".ck").classList.toggle("on", t.done); if (t.done) { SFX.done(); haptic() } });
    nav.primary("Continuar", nextStep);
  },
  n_habits(c, nav) {
    const k = dayKey(0);
    c.classList.add("top");
    c.innerHTML = `<p class="fl-eyebrow">Hábitos</p><h2 class="fl-title">¿Qué hábitos has cumplido hoy?</h2><div class="fields">${S.habits.map(h => { const dn = !!doneFor(k)[h.id], lk = !dn && nowMin() > slotDeadline(hInfo(h).s); return `<button class="chk ${dn ? "on" : ""} ${lk ? "late" : ""}" data-h="${h.id}" ${lk ? 'data-late="1"' : ""}><span class="ck ${dn ? "on" : ""}">✓</span><span>${esc(h.name)} <small>· ${lk ? "se pasó la hora" : slotById(hInfo(h).s).n.toLowerCase()}</small></span></button>` }).join("") || `<p class="sub">Aún no tienes hábitos. Añádelos en Perfil.</p>`}</div>${MLINE("Somos lo que hacemos cada día. Con el 60 % cuenta el paso.")}`;
    c.querySelectorAll("[data-h]").forEach(x => x.onclick = () => { if (x.dataset.late) { toast("Se pasó la hora de este hábito"); haptic(); return } const h = S.habits.find(z => z.id === x.dataset.h), was = !!doneFor(k)[h.id]; toggleHabit(h); x.classList.toggle("on", !was); x.querySelector(".ck").classList.toggle("on", !was); if (!was) { SFX.done(); haptic() } });
    nav.primary("Continuar", nextStep);
  },
  n_food(c, nav) {
    const j = J(); j.meals = j.meals || {}; c.classList.add("top");
    const draw = () => {
      const goal = waterGoal(), w = j.water || 0;
      c.innerHTML = `<p class="fl-eyebrow">Comidas y agua</p><h2 class="fl-title">¿Cómo has comido hoy?</h2>${["desayuno", "comida", "cena"].map(m => { const ws = j.meals[m] ? "open" : winState(MEAL_WIN[m]()); return `<div class="meal ${ws !== "open" ? "late" : ""}"><b>${m} <small>${ws === "late" ? "· se pasó la hora" : ws === "early" ? "· desde las " + m2t(MEAL_WIN[m]()[0]) : "· hasta las " + m2t(MEAL_WIN[m]()[1])}</small></b><div class="seg3">${[["limpio", "Limpio"], ["regular", "Regular"], ["exceso", "Me pasé"]].map(([k, n]) => `<button data-m="${m}" data-v="${k}" class="${j.meals[m] === k ? "on" : ""}" ${ws !== "open" ? 'data-late="' + ws + '"' : ""}>${n}</button>`).join("")}</div></div>` }).join("")}<div class="water"><div><p class="eyebrow">Agua</p><div class="n">${w}<span> de ${goal} vasos</span></div><div class="glasses">${Array.from({ length: goal }, (_, i) => `<i class="${i < w ? "on" : ""}"></i>`).join("")}</div></div><div class="pm"><button id="wm" aria-label="Quitar un vaso">−</button><button id="wp" aria-label="Añadir un vaso">+</button></div></div>`;
      c.querySelectorAll("[data-m]").forEach(x => x.onclick = () => { if (x.dataset.late) { toast(x.dataset.late === "late" ? "Se pasó la hora de esta comida" : "Aún no es la hora de esta comida"); haptic(); return } SFX.tap(); j.meals[x.dataset.m] = j.meals[x.dataset.m] === x.dataset.v ? undefined : x.dataset.v; saveJ(); draw() });
      $("wp").onclick = () => { SFX.water(j.water || 0); haptic(); j.water = (j.water || 0) + 1; saveJ(); draw() }; $("wm").onclick = () => { j.water = Math.max(0, (j.water || 0) - 1); saveJ(); draw() };
    };
    draw(); nav.primary("Continuar", nextStep);
  },
  n_action(c, nav) {
    const j = J(), q = fq();
    c.innerHTML = `<p class="fl-eyebrow">Tu acción de hoy</p><h2 class="fl-title">¿La hiciste?</h2><div class="accbox"><p>${esc(q.acc)}</p></div>${MLINE("Cumplir tu palabra contigo es la base de la confianza en ti mismo.")}`;
    nav.primary("Sí, la hice", () => { j.practiced = true; j.commit = true; saveJ(); won("Palabra cumplida"); nextStep() });
    nav.primary("Todavía no", () => { j.practiced = false; saveJ(); nextStep() }, "btn ghost");
  },
  n_bien: examStep("bien", 1, "¿Qué has hecho bien hoy?", "Séneca repasaba su día cada noche, sin castigarse. Empieza por lo bueno."),
  n_mejorar: examStep("mejorar", 2, "¿Qué puedes mejorar?", "No es culpa: es información. Lo que se mira, mejora."),
  n_gracias: examStep("gracias", 3, "¿Qué agradeces hoy?", "Agradecer entrena la mirada para ver lo que ya tienes."),
  n_lesson(c, nav) {
    const j = J(), d = dayNum(), L = leccion(d);
    c.classList.add("top");
    c.innerHTML = `<p class="fl-eyebrow">Lección de tu mentor · ${d} de 100</p><h2 class="fl-title">${esc(L.t)}</h2><p class="fl-lesson">${esc(L.x)}</p><p class="fl-q">${esc(L.q)}</p><textarea id="rf" rows="3" placeholder="Tu respuesta (opcional, solo la ves tú)">${esc(j.reflex || "")}</textarea>`;
    $("rf").oninput = e => { j.reflex = e.target.value; saveJ() };
    nav.primary("Completar la lección", () => { if ((j.reflex || "").trim()) { j.lesson = true; saveJ() } SFX.done(); haptic(); nextStep() });
  },
  n_tomorrow(c, nav) {
    c.innerHTML = `<p class="fl-eyebrow">Prepara mañana</p><h2 class="fl-title center">Mañana te levantas a las</h2>${stepperHTML("tmw", set().wake || "05:00", 15)}<ul class="tips"><li>Deja el móvil lejos de la cama.</li><li>Prepara tu ropa y un vaso de agua.</li><li>Duerme al menos 7 horas.</li></ul>`;
    bindStepper(c);
    nav.primary("Buenas noches", () => { const w = $("tmw").textContent; if (w !== (set().wake || "05:00")) { S.set.wake = w; saveSet() } J().closed = true; saveJ(); nextStep() });
  },
  n_end(c, nav) {
    const rit = isRitual(dayKey(0));
    c.innerHTML = `<div class="fl-statue">${myStatue()}</div><h2 class="fl-title center">Buenas noches${set().name ? ", " + esc(set().name) : ""}</h2><p class="sub center">${rit ? "Hoy has esculpido tu estatua. Descansa: mañana seguimos." : "Hoy no llegaste a 6 pasos. No pasa nada: mañana es sagrado."}</p>`;
    SFX.done(); nav.primary("Cerrar el día", endFlow);
  },
  d_end(c, nav) {
    c.innerHTML = `<div class="fl-statue">${myStatue()}</div><h2 class="fl-title center">Check-in hecho</h2><p class="sub center">Desde las 19:00, tu rutina de noche: 5 minutos para cerrar el día.</p>`;
    SFX.done(); nav.primary("Volver a mi día", endFlow);
  },
};

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
  if (el.classList && el.classList.contains("has3d") && window.Statue3D) { window.Statue3D.burst(); return }
  const host = el.closest(".hero, .moment") || el.parentElement, r = el.getBoundingClientRect(), hr = host.getBoundingClientRect(), cx = r.left - hr.left + r.width * .5, cy = r.top - hr.top + r.height * .4;
  for (let i = 0; i < (big ? 14 : 8); i++) {
    const c = document.createElement("div"), sz = 2 + Math.random() * 3, a = Math.random() * Math.PI * 2, v = 50 + Math.random() * (big ? 180 : 120);
    c.className = "chip"; c.style.cssText = `left:${cx + (Math.random() - .5) * 50}px;top:${cy + (Math.random() - .5) * 70}px;width:${sz}px;height:${sz}px`; host.appendChild(c);
    c.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: `translate(${Math.cos(a) * v}px,${Math.sin(a) * v * .7 + 80}px) rotate(${(Math.random() - .5) * 720}deg)`, opacity: 0 }], { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.15,.7,.35,1)" }).onfinish = () => c.remove();
  }
  el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-4px) rotate(-1deg)" }, { transform: "translateX(3px) rotate(1deg)" }, { transform: "translateX(0)" }], { duration: 320 });
}
function celebrate(p, label, quiet) {
  const now = snapshot(), newly = ORDER.filter(k => !p.st[k] && now.st[k]);
  if (newly.length && !quiet) { SFX.chisel(); haptic(2); setTimeout(() => burst($("stage")), 60); toast(`${label || NAME[newly[newly.length - 1]] + ": hecho"} · ${now.n} de 8`) }
  const fN = faseDe(now.sc), fP = faseDe(p.sc);
  const q = [];
  if (fN.i > fP.i) q.push({ big: "Nueva forma", title: fN.name, text: fN.txt });
  else if (!p.rit && now.rit) q.push({ big: "Día esculpido", title: `Día ${dayNum()}`, text: `${now.n} de 8 pasos. Tu estatua ha salido un poco más del bloque.` });
  else if (now.n === 8 && p.n < 8) q.push({ big: "Día completo", title: "8 de 8", text: "Hoy has cumplido todo lo que te prometiste." });
  GALERIA.forEach(pc => { if (pc.d > p.sc && pc.d <= now.sc) q.push({ big: "Nueva pieza", title: pc.n, text: pc.t + " Ya está en tu galería.", svg: pieceSVG(pc), piece: true }) });
  const fo = focus(); if (fo && fo.done >= fo.target && !(set().seals || []).some(x => x.week === fo.week)) { S.set.seals = [...(set().seals || []), { week: fo.week, step: fo.step }]; saveSet(); q.push({ big: "Sello de constancia", title: NAME[fo.step], text: "Cinco días esta semana cumpliendo tu punto débil. Así se transforma una debilidad en fortaleza." }) }
  if (q.length) setTimeout(() => momentQueue(q), 1000);
}
const momentQueue = q => { if (!q.length) return; const m = q.shift(); moment({ ...m, onClose: () => setTimeout(() => momentQueue(q), 250) }) };
function moment({ big, title, text, btn = "Seguir", days = sculpted(), onClose, svg, piece }) {
  const el = document.createElement("div"); el.className = "moment" + (piece ? " piece" : ""); el.setAttribute("role", "dialog");
  el.innerHTML = `<div class="mstage" id="mst"><div class="rays"></div>${svg || statueSVG(faseDe(days).i, set().name, days, look())}</div><p class="big">${String(big).split(" ").map((w, wi, arr) => `<span style="display:inline-block;white-space:nowrap">${[...w].map((ch, ci) => `<span style="animation-delay:${(.5 + (arr.slice(0, wi).join(" ").length + ci) * .045).toFixed(2)}s">${esc(ch)}</span>`).join("")}</span>`).join(" ")}</p><h2>${esc(title)}</h2><p>${esc(text)}</p><button class="btn" id="mok">${btn}</button>`;
  document.body.append(el); SFX.sculpt(); haptic(3);
  setTimeout(() => burst($("mst"), true), 250);
  $("mok").onclick = () => { SFX.tap(); el.remove(); if (onClose) onClose() };
}

/* ---------- hojas: un paso cada vez ---------- */
let pending = null;
function closeSheet() { const s = $("sheet"); if (s) s.remove(); document.body.classList.remove("noscroll"); clearInterval(openSheet._iv); const p = pending; pending = null; route(); if (p && S.tab === "hoy") setTimeout(() => celebrate(p), 150) }
function openSheet(key) {
  if (!pending && ORDER.includes(key)) pending = snapshot();
  let s = $("sheet"); if (!s) { s = document.createElement("div"); s.id = "sheet"; s.className = "sheet"; s.setAttribute("role", "dialog"); document.body.append(s) }
  document.body.classList.add("noscroll"); clearInterval(openSheet._iv);
  const i = ORDER.indexOf(key);
  s.innerHTML = `<div class="sheet-in"><div class="sheet-head"><p class="eyebrow b">${i >= 0 ? `Paso ${i + 1} de 8` : ""}</p><button class="x" id="sx" aria-label="Cerrar">×</button></div><div class="sheet-body" id="sb"></div><div class="sheet-foot" id="sf"></div></div>`;
  $("sx").onclick = () => { SFX.tap(); closeSheet() };
  SHEETS[key]($("sb"), $("sf"));
}
const footBtn = (f, label, fn, cls = "btn") => { const b = document.createElement("button"); b.className = cls; b.textContent = label; b.onclick = fn; f.append(b); return b };
const SHEETS = {
  habits(b, f) {
    b.innerHTML = `<h2 class="title">Tus hábitos</h2><p class="sub">Cada uno con su mejor momento. Toca uno para cambiarlo o borrarlo.</p><div class="fields">${S.habits.map(h => { const x = hInfo(h); return `<button class="hab" data-he="${esc(h.id)}"><span>${esc(h.name)}</span><small style="flex:none;color:var(--blue);font-weight:700">${slotById(x.s).n}${x.r && x.t ? " · " + x.t : ""}</small></button>` }).join("") || `<p class="sub">Aún no tienes hábitos.</p>`}</div>`;
    b.querySelectorAll("[data-he]").forEach(x => x.onclick = () => { SFX.tap(); S.edit = { t: "h", id: x.dataset.he }; openSheet("item") });
    footBtn(f, "Añadir hábito", () => { S.edit = null; S.addType = "habit"; openSheet("item") });
    footBtn(f, "Cerrar", closeSheet, "btn ghost");
  },
  guide(b, f) {
    b.innerHTML = `<p class="eyebrow b">Cómo funciona Levo</p><h2 class="title">Tu mentor de disciplina</h2><p class="sub">Durante 100 días esculpes a la persona que quieres ser. Cada día, un golpe de cincel.</p><p class="eyebrow" style="margin-top:8px">Las 5 pestañas</p>${tabsHTML()}<p class="eyebrow" style="margin-top:8px">Tu día</p>
      <div class="card guide"><b>1</b><div><h3>Rutina de la mañana · 6 min</h3><p class="sub">Despertar, respirar, abrir tu frase sellada y comprometerte con su acción, tus afirmaciones y tus 3 tareas.</p></div></div>
      <div class="card guide"><b>2</b><div><h3>Durante el día · 30 s</h3><p class="sub">Un check-in rápido para marcar hábitos, comidas y agua.</p></div></div>
      <div class="card guide"><b>3</b><div><h3>Rutina de la noche · 5 min</h3><p class="sub">Cierra tus tareas, examina tu día con tres preguntas, recibe la lección de tu mentor y prepara mañana.</p></div></div>
      <div class="card guide"><b>4</b><div><h3>Tu estatua</h3><p class="sub">Con 6 de los 8 pasos el día queda esculpido: la figura sale un poco más del bloque. Cada cierto número de días ganas una pieza para tu galería.</p></div></div>
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
SHEETS.item = itemSheet;
SHEETS.library = (b, f) => { renderMentor(b); footBtn(f, "Cerrar", closeSheet) };
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
const TABS_INFO = [["hoy", "Hoy", "Lo que toca ahora, con un solo botón. Tu estatua, tu progreso del día y el foco de tu mentor."], ["dia", "Día", "Tu camino de 8 pasos y cada cosa a su mejor hora. Aquí añades tareas y hábitos."], ["mentor", "Mentor", "Una lección cada día, tu porqué y la biblioteca de frases."], ["estatua", "Galería", "Tu estatua en 3D, la colección de piezas, tus sellos y tu calendario."], ["perfil", "Perfil", "Tu hora de despertar, tus hábitos, los avisos y los ajustes."]];
const tabsHTML = () => `<div class="tabsx">${TABS_INFO.map(([k, n, d]) => `<div><span class="emblem">${IC[k]}</span><div><b>${n}</b><p>${d}</p></div></div>`).join("")}</div><div class="tip"><span class="emblem sm">${IC.clock}</span><p><b>El tiempo manda.</b> Cada paso tiene su hora según el reloj de tu móvil: despertar hasta 2 h después de tu hora, la mañana hasta las ${m2t(MORNING_END())}, el examen desde las ${m2t(NIGHT_FROM)}. Si se pasa la hora, ya no se puede marcar: mañana es otra oportunidad.</p></div>`;
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
      <div class="lhead"><p class="eyebrow">Lección de hoy · ${d} de 100</p>${done ? `<span class="lok">${CHK} Hecha</span>` : ""}</div>
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
    <div class="galgrid">${GALERIA.map((p, i) => `<button class="gcard ${n >= p.d ? "got" : "locked"}" data-pc="${i}"><div class="gpic">${pieceSVG(p)}${n >= p.d ? "" : `<span class="glock">${p.d}</span>`}</div><b>${esc(p.n)}</b></button>`).join("")}</div></section>`;
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
  for (let i = 0; i < 35 + off && cal.length < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); if (d > new Date()) break; const k = fmt(d), c = k >= START() ? nDone(k) : 0; cal.push(`<i class="${k === dayKey(0) ? "today" : ""}" style="${c ? `background:color-mix(in srgb,var(--fg) ${Math.round(8 + c / 8 * 92)}%,transparent);color:${c >= 5 ? "var(--bg)" : "var(--fg)"};box-shadow:none` : ""}" title="${k}">${d.getDate()}</i>`) }
  const w = S.weighs.slice(-10);
  v.innerHTML = `<section class="phero"><p class="eyebrow">Tu estatua · fase ${fz.i + 1} de 8</p><div class="stage" id="stage"><div class="aura"></div>${myStatue(n)}</div><p class="bignum"><span data-count="${n}">${n}</span><small> días esculpidos</small></p><h1 class="title" style="margin-top:4px">${esc(fz.name)}</h1><p class="sub" style="max-width:30ch;margin-top:6px">${esc(fz.txt)}</p></section>
    ${nx ? `<div style="display:grid;gap:10px"><div class="line"><b style="width:${Math.round(pct * 100)}%"></b></div><p class="sub" style="font-size:13px">Faltan ${nx[0] - n} ${nx[0] - n === 1 ? "día" : "días"} esculpidos para «${esc(nx[1])}»</p></div>` : ""}
    ${set().who ? `<p class="sculpting">Estás esculpiendo a alguien que <em>${esc(set().who)}</em>.</p>` : ""}
    <button class="btn ghost" id="shareStatue">Compartir mi estatua</button>
    ${galleryHTML()}
    ${sealsHTML()}
    <div class="stats"><div class="stat"><b>${streak()}</b><small>días seguidos esculpiendo</small></div><div class="stat"><b>${wakeStreak()}</b><small>en pie a las ${set().wake || "05:00"}</small></div><div class="stat"><b>${dayNum()}</b><small>días de camino</small></div></div>
    <section class="card"><p class="eyebrow" style="margin-bottom:6px">Las 8 formas</p><div class="phases">${FASES.map((f, i) => `<div class="ph ${i < fz.i ? "done" : i === fz.i ? "now" : ""}"><span class="n">${i < fz.i ? "✓" : i + 1}</span><div class="t"><b>${esc(f[1])}</b><small>${esc(f[2])}</small></div><span class="d">${f[0]} d</span></div>`).join("")}</div></section>
    <section class="card"><p class="eyebrow" style="margin-bottom:14px">Últimas semanas</p><div class="cal">${["L", "M", "X", "J", "V", "S", "D"].map(d => `<span class="h">${d}</span>`).join("")}${cal.join("")}</div><p class="sub" style="font-size:13px;margin-top:14px">Cuanto más lleno, más pasos cumplidos.</p></section>
    <section class="card" style="display:grid;gap:10px"><p class="eyebrow">Tu cuerpo</p>${w.length ? `<p class="kg">${String(w[w.length - 1].kg).replace(".", ",")} kg</p>${w.length > 1 ? sparkline(w) : ""}` : `<p class="sub">Registra tu peso una vez por semana para ver tu evolución.</p>`}
      <div class="task"><input id="kg" type="number" inputmode="decimal" step="0.1" placeholder="Peso de hoy (kg)"><button class="link" id="saveKg">Guardar</button></div></section>`;
  $("saveKg").onclick = () => { const kg = parseFloat(($("kg").value || "").replace(",", ".")); if (!kg || kg < 30 || kg > 300) return toast("Escribe un peso válido."); const k = dayKey(0); S.weighs = S.weighs.filter(x => x.day !== k).concat([{ day: k, kg }]); write(() => sb.from("weighins").upsert({ user_id: S.uid, day: k, kg }, { onConflict: "user_id,day" })); S.bodyP = { ...(S.bodyP || {}), weight_kg: kg }; write(() => sb.from("body_profile").upsert({ user_id: S.uid, ...S.bodyP, updated_at: new Date().toISOString() }, { onConflict: "user_id" })); toast("Peso guardado."); renderEstatua(v) };
  $("shareStatue").onclick = shareStatue;
  bindGallery(v); countUps(v);
}
function sparkline(w) { const W = 300, H = 70, ks = w.map(x => +x.kg), mn = Math.min(...ks), mx = Math.max(...ks), rg = Math.max(.5, mx - mn); const pts = w.map((x, i) => `${(8 + i * (W - 16) / (w.length - 1)).toFixed(1)},${(H - 8 - (x.kg - mn) / rg * (H - 16)).toFixed(1)}`); const d = ks[ks.length - 1] - ks[0]; return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-label="Evolución del peso"><polyline points="${pts.join(" ")}" fill="none" stroke="var(--blue)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg><p class="sub" style="font-size:14px">${d === 0 ? "Estable" : (d > 0 ? "+" : "−") + Math.abs(d).toFixed(1).replace(".", ",") + " kg"} en tus últimos ${w.length} registros</p>` }
function shareStatue() { SFX.tap(); openSheet("share") }
const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src });
function wrapText(x, text, maxW) { const words = String(text).split(" "), lines = []; let l = ""; for (const w of words) { const t = l ? l + " " + w : w; if (x.measureText(t).width > maxW && l) { lines.push(l); l = w } else l = t } if (l) lines.push(l); return lines }
/* La tarjeta para redes: negro con auroras roja y azul, el número enorme detrás, la estatua 3D delante y un gancho para que te pregunten */
async function shareCanvas(kind) {
  const story = kind !== "post", W = 1080, H = story ? 1920 : 1350, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
  const n = sculpted(), fz = faseDe(n), d = dayNum(), e = Math.round(Math.pow(Math.min(1, n / 50), .75) * 100);
  try { await Promise.all(["900 300px Archivo", "800 80px Archivo", "600 40px Archivo", "300 40px Archivo"].map(f => document.fonts.load(f))) } catch (_) { }
  const F = (w, s) => `${w} ${s}px Archivo, "Arial Black", Arial, sans-serif`, wide = v => { try { x.fontStretch = v } catch (_) { } };
  const RED = "#ff3b30", AZ = "#2f6bff", grad = (x0, y0, x1, y1) => { const g = x.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, RED); g.addColorStop(1, AZ); return g };
  const rr = (X, Y, w, h, r) => { x.beginPath(); if (x.roundRect) x.roundRect(X, Y, w, h, r); else x.rect(X, Y, w, h) };
  const blob = (cx, cy, r, rgb, a) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.fillRect(0, 0, W, H) };
  /* fondo: negro, auroras y grano */
  x.fillStyle = "#050505"; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = "lighter";
  blob(W * .08, H * .2, 640, "255,59,48", .3); blob(W * 1.02, H * .42, 760, "47,107,255", .4); blob(W * .3, H * 1.02, 700, "47,107,255", .14); blob(W * .9, H * .06, 380, "255,59,48", .12);
  x.globalCompositeOperation = "source-over";
  let sd = 9; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 14000; i++) { x.fillStyle = `rgba(255,255,255,${(rnd() * .06).toFixed(3)})`; x.fillRect(rnd() * W, rnd() * H, 1.6, 1.6) }
  /* cabecera: la marca y un piloto rojo encendido */
  const hy = story ? 215 : 100; x.fillStyle = "#fff"; x.textAlign = "left"; x.textBaseline = "alphabetic";
  wide("expanded"); x.font = F(900, 44); x.fillText("L E V O", 72, hy); wide("normal");
  x.font = F(700, 25); const lab = "ESCULPIÉNDOME", lw = x.measureText(lab).width, px = W - 72 - lw - 70;
  x.strokeStyle = "rgba(255,255,255,.28)"; x.lineWidth = 2; rr(px, hy - 37, lw + 70, 52, 26); x.stroke();
  x.shadowColor = RED; x.shadowBlur = 22; x.fillStyle = RED; x.beginPath(); x.arc(px + 28, hy - 11, 8, 0, Math.PI * 2); x.fill(); x.shadowBlur = 0;
  x.fillStyle = "#fff"; x.fillText(lab, px + 48, hy);
  /* el día, enorme y en contorno de color, por detrás de la estatua */
  const top = story ? 350 : 190, ds = String(d);
  x.font = F(800, 34); x.globalAlpha = .8; x.fillText("DÍA", 76, top); x.globalAlpha = 1;
  wide("expanded"); let fs = story ? 520 : 400; x.font = F(900, fs); while (x.measureText(ds).width > W - 150 && fs > 180) { fs -= 20; x.font = F(900, fs) }
  const nw = x.measureText(ds).width, nb = top + 20 + fs * .74;
  x.globalAlpha = .16; x.fillStyle = grad(56, top, 56 + nw, nb); x.fillText(ds, 52, nb); x.globalAlpha = 1;
  x.lineWidth = 5; x.strokeStyle = grad(56, top, 56 + nw, nb); x.strokeText(ds, 52, nb); wide("normal");
  x.font = F(800, 34); x.globalAlpha = .8; x.fillText("DE 100", 76, nb + 62); x.globalAlpha = 1;
  /* la estatua: brillo, anillos de color y la escultura 3D (o el SVG si no hay 3D) */
  const sw = story ? 860 : 660, sh = sw * 1.3, scx = story ? 690 : 720, sx = scx - sw / 2, sy = story ? 330 : 150, hcy = sy + sh * .38;
  blob(scx, hcy, sw * .55, "255,255,255", .1);
  [[.36, .5, 0], [.5, .34, 1.4], [.66, .2, 2.6]].forEach(([r, a, s]) => { x.globalAlpha = a; x.lineWidth = 3; x.strokeStyle = grad(scx - sw * r, hcy, scx + sw * r, hcy); x.beginPath(); x.arc(scx, hcy, sw * r, s, s + Math.PI * 1.55); x.stroke() }); x.globalAlpha = 1;
  let shot = null;
  if (window.Statue3D) try { shot = await Promise.race([window.Statue3D.shot({ days: n, stage: fz.i, w: 1000, h: 1300 }), new Promise(r => setTimeout(() => r(null), 6000))]) } catch (_) { }
  let src = shot; if (!src) { const svg = myStatue(n).replace('<svg viewBox="0 0 200 260"', '<svg width="' + sw + '" height="' + Math.round(sh) + '" viewBox="0 0 200 260"'); src = await loadImg("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)) }
  if (src) {
    /* el pie de la estatua se oscurece y se funde con el fondo para dejar sitio al texto */
    const tmp = document.createElement("canvas"); tmp.width = sw; tmp.height = Math.round(sh); const tx = tmp.getContext("2d"); tx.drawImage(src, 0, 0, sw, sh);
    tx.globalCompositeOperation = "source-atop"; const dg = tx.createLinearGradient(0, sh * .55, 0, sh * .88); dg.addColorStop(0, "rgba(5,5,5,0)"); dg.addColorStop(1, "rgba(5,5,5,.9)"); tx.fillStyle = dg; tx.fillRect(0, 0, sw, sh);
    tx.globalCompositeOperation = "destination-in"; const ag = tx.createLinearGradient(0, sh * .7, 0, sh * .96); ag.addColorStop(0, "#000"); ag.addColorStop(1, "rgba(0,0,0,0)"); tx.fillStyle = ag; tx.fillRect(0, 0, sw, sh);
    x.drawImage(tmp, sx, sy);
  }
  /* lascas de color saltando del bloque */
  for (let i = 0; i < 22; i++) { const a = rnd() * Math.PI * 2, r0 = sw * (.2 + rnd() * .3), qx = scx + Math.cos(a) * r0, qy = hcy + Math.sin(a) * r0 * .8, s = 5 + rnd() * 11; x.fillStyle = i % 3 === 0 ? RED : i % 3 === 1 ? AZ : "rgba(255,255,255,.8)"; x.globalAlpha = .55 + rnd() * .45; x.beginPath(); x.moveTo(qx, qy + s * .3); x.lineTo(qx + s * .6, qy); x.lineTo(qx + s, qy + s * .45); x.lineTo(qx + s * .7, qy + s); x.lineTo(qx + s * .15, qy + s * .85); x.closePath(); x.fill() } x.globalAlpha = 1;
  /* la fase y lo que ha salido del bloque */
  let y = nb + (story ? 190 : 150); x.fillStyle = "#fff";
  wide("expanded"); x.font = F(900, story ? 60 : 48); const ph = wrapText(x, fz.name.toUpperCase(), story ? 480 : 420); ph.forEach((l, i) => x.fillText(l, 72, y + i * (story ? 64 : 52))); wide("normal"); y += (ph.length - 1) * (story ? 64 : 52) + 40;
  const bw = story ? 420 : 380; x.fillStyle = "rgba(255,255,255,.16)"; rr(72, y, bw, 12, 6); x.fill(); x.fillStyle = grad(72, 0, 72 + bw, 0); rr(72, y, Math.max(12, bw * e / 100), 12, 6); x.fill();
  x.fillStyle = "#fff"; x.font = F(600, 28); x.globalAlpha = .85; x.fillText(e >= 100 ? "Ya ha salido entera del bloque" : `Ha salido el ${e} % del bloque`, 72, y + 56); x.globalAlpha = 1;
  /* quién estás esculpiendo */
  y = story ? 1350 : 1010;
  x.font = F(300, story ? 42 : 34); x.globalAlpha = .8; x.fillText("Estoy esculpiendo a alguien que", 72, y); x.globalAlpha = 1;
  x.font = F(800, story ? 68 : 54); const wl = wrapText(x, set().who || "cumple lo que se promete", W - 144).slice(0, 2); wl.forEach((l, i) => x.fillText(l, 72, y + (story ? 82 : 66) + i * (story ? 76 : 62)));
  const ly = y + (story ? 82 : 66) + (wl.length - 1) * (story ? 76 : 62) + 26, lw2 = Math.min(W - 144, x.measureText(wl[wl.length - 1]).width); x.fillStyle = grad(72, 0, 72 + lw2, 0); x.fillRect(72, ly, lw2, 6); x.fillStyle = "#fff";
  if (story) {
    y = 1600; [[streak(), streak() === 1 ? "día seguido" : "días seguidos"], [n, n === 1 ? "día esculpido" : "días esculpidos"], [set().wake || "05:00", "en pie cada día"]].forEach(([v, t], i) => { const bx = 72 + i * 322; x.font = F(900, 64); x.fillText(String(v), bx, y); x.font = F(500, 26); x.globalAlpha = .75; x.fillText(t, bx, y + 38); x.globalAlpha = 1 });
    const qs = 34; y = 1684; const gg = grad(72, 0, 72 + 14 * (qs + 10), 0);
    for (let i = 13; i >= 0; i--) { const k = dayKey(-i), on = k >= START() && isRitual(k), bx = 72 + (13 - i) * (qs + 10); if (on) { x.fillStyle = gg; rr(bx, y, qs, qs, 8); x.fill() } else { x.strokeStyle = i === 0 ? "rgba(255,255,255,.7)" : "rgba(255,255,255,.2)"; x.lineWidth = 2; rr(bx + 1, y + 1, qs - 2, qs - 2, 8); x.stroke() } }
    x.fillStyle = "#fff"; x.font = F(500, 24); x.globalAlpha = .6; x.textAlign = "right"; x.fillText("últimos 14 días", W - 72, y + 25); x.textAlign = "left"; x.globalAlpha = 1;
    x.font = F(800, 36); x.fillText("100 días para esculpirme. Pregúntame cómo.", 72, 1790);
  } else {
    x.font = F(700, 30); x.globalAlpha = .85; x.fillText(`${streak()} ${streak() === 1 ? "día seguido" : "días seguidos"} · ${n} esculpidos`, 72, 1200); x.globalAlpha = 1;
    x.font = F(800, 34); x.fillText("100 días para esculpirme. Pregúntame cómo.", 72, 1290);
  }
  return new Promise(r => c.toBlob(r, "image/png"));
}
/* ================= PERFIL ================= */
function renderPerfil(v) {
  const fz = faseDe(sculpted()), granted = "Notification" in window && Notification.permission === "granted", snd = set().sound !== false;
  v.innerHTML = `<header class="page-top" style="display:flex;gap:16px;align-items:center"><div style="width:70px;flex:none">${myStatue()}</div><div><p class="eyebrow b">Día ${dayNum()} · ${esc(fz.name)}</p><h1 class="title">${esc(set().name || "Tú")}</h1></div></header>
    <div class="plist">
      <label class="prow"><span class="tx"><b>Nombre</b><small>Aparece en la placa de tu estatua</small></span><input id="pName" value="${esc(set().name || "")}" maxlength="18" style="width:140px;text-align:right"></label>
      <label class="prow"><span class="tx"><b>Hora de despertar</b><small>Tu primera victoria de cada día</small></span><input id="pWake" type="time" value="${set().wake || "05:00"}"></label>
      <button class="prow" id="pWhy"><span class="tx"><b>Tu porqué y quién serás</b><small>${set().why ? esc(set().why) : "Lo que te mueve y lo que estás esculpiendo"}</small></span><span class="end">›</span></button>
      <button class="prow" id="pLook"><span class="tx"><b>Tu estatua</b><small>Elige la figura que esculpes</small></span><span class="end">›</span></button>
      <button class="prow" id="pHabits"><span class="tx"><b>Tus hábitos</b><small>${S.habits.length} hábitos · añade o quita</small></span><span class="end">›</span></button>
      <button class="prow" id="pLib"><span class="tx"><b>Tu biblioteca</b><small>Lecciones del mentor, frases abiertas y favoritas</small></span><span class="end">›</span></button>
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
    <p class="sub center" style="font-size:13px">Levo · Esculpe tu mejor versión, un día cada vez</p><p class="sub center" style="font-size:11px;opacity:.7">Escultura 3D basada en el modelo «Lee Perry-Smith» de Infinite Realities (CC BY 3.0).</p>`;
  $("pName").onchange = e => { S.set.name = e.target.value.trim(); saveSet(); toast("Nombre guardado.") };
  $("pWake").onchange = e => { S.set.wake = e.target.value || "05:00"; saveSet(); toast(`Te levantarás a las ${S.set.wake}.`) };
  $("pWhy").onclick = () => openSheet("identity");
  $("pLook").onclick = () => openSheet("look");
  $("pHabits").onclick = () => openSheet("habits");
  $("pLib").onclick = () => { S.tab = "mentor"; window.scrollTo(0, 0); renderMain($("app")) };
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
  const N = 11, blue = o.step === 0 || o.step === N - 1;
  let body = "", btn = "Continuar", ok = true, extra = "";
  const no = `<p class="bigno">${pad(o.step + 1)} / ${N}</p>`;
  if (o.step === 0) { body = `${no}<h1 class="title xl">Tu mentor de disciplina</h1><p class="sub" style="max-width:24ch">Durante 100 días vas a esculpir a la persona que quieres ser. Cada día, un golpe de cincel.</p><div style="flex:1;min-height:150px"></div><input id="on" placeholder="¿Cómo te llamas?" maxlength="18" value="${esc(o.name)}">`; btn = "Empezar"; extra = `<div class="ostage">${statueSVG(0, "", 0, o.look)}</div>` }
  if (o.step === 1) body = `${no}<h1 class="title">Por qué funciona</h1><p class="sub">Levo no te pide fuerza de voluntad infinita. Te da un sistema.</p><div class="whys">${WHYS.map(([t, x], i) => `<div class="wstep" style="--d:${(.25 + i * .22).toFixed(2)}s"><span class="wn">${i + 1}</span><h3>${t}</h3><p>${x}</p></div>`).join("")}</div>`;
  if (o.step === 2) { ok = o.goals.size >= 1; btn = ok ? "Continuar" : "Elige al menos una"; body = `${no}<h1 class="title">¿Qué quieres transformar?</h1><p class="sub">Elige de 1 a 3. Tus hábitos y tu mentor se adaptarán.</p><div class="areas">${AREAS.map(a => `<button data-g="${a.id}" class="${o.goals.has(a.id) ? "on" : ""}"><b>${a.n}</b><small>${a.d}</small></button>`).join("")}</div>` }
  if (o.step === 3) { ok = o.why.trim().length >= 3; btn = ok ? "Continuar" : "Escribe tu porqué"; body = `${no}<h1 class="title">¿Por qué lo quieres de verdad?</h1><p class="sub">Escribe la razón que te levantará cuando no tengas ganas. Te la recordaré en los días difíciles.</p><textarea id="ow" rows="3" placeholder="Porque…">${esc(o.why)}</textarea><div class="sugs">${PORQUES.map(p => `<button data-why="${esc(p)}">${esc(p)}</button>`).join("")}</div>` }
  if (o.step === 4) { ok = o.who.trim().length >= 3; btn = ok ? "Continuar" : "Completa la frase"; body = `${no}<h1 class="title">¿Quién serás?</h1><p class="sub">No pienses en metas: piensa en identidad. Completa la frase.</p><p style="margin:0;font-size:22px;font-weight:800;font-stretch:110%">Dentro de 100 días soy alguien que…</p><textarea id="oq" rows="2" placeholder="…se levanta sin negociar">${esc(o.who)}</textarea><div class="sugs">${QUIENES.map(p => `<button data-who="${esc(p)}">${esc(p)}</button>`).join("")}</div>` }
  if (o.step === 5) body = `${no}<h1 class="title">Esta será tu estatua</h1><p class="sub">Hoy es un bloque de mármol. Con cada día cumplido irá saliendo de la piedra. Elige la figura.</p><div class="looks">${["a", "b"].map(x => `<button data-l="${x}" class="${o.look === x ? "on" : ""}" aria-label="Figura ${x === "a" ? "1" : "2"}">${statueSVG(4, o.name, 20, x)}</button>`).join("")}</div>`;
  if (o.step === 6) body = `${no}<h1 class="title">¿A qué hora te levantarás?</h1><p class="sub">Ganar la primera hora es ganar el día. Será tu primera victoria cada mañana.</p><div class="opts time">${["05:00", "05:30", "06:00", "06:30"].map(t => `<button data-w="${t}" class="${o.wake === t ? "on" : ""}">${t}</button>`).join("")}</div><p class="sub center" style="margin-top:6px">¿Otra hora?</p>${stepperHTML("owk", o.wake, 15)}`;
  if (o.step === 7) {
    const sug = new Set(AREAS.filter(a => o.goals.has(a.id)).flatMap(a => a.h)), list = [...HABITOS_ESTOICOS.filter(h => sug.has(h.id)), ...HABITOS_ESTOICOS.filter(h => !sug.has(h.id))];
    ok = o.picks.size >= 3; btn = ok ? "Continuar" : `Elige ${3 - o.picks.size} más`;
    const chip = h => `<button class="hchip ${o.picks.has(h.id) ? "on" : ""}" data-p="${h.id}">${esc(h.s || h.name)}</button>`, mineL = list.filter(h => sug.has(h.id)), rest = list.filter(h => !sug.has(h.id));
    body = `${no}<h1 class="title">Tus hábitos</h1><p class="sub">Elige de 3 a 5. Mejor pocos y cumplidos que muchos a medias.</p><div class="pdots" id="pdots" aria-label="Elegidos">${[0, 1, 2, 3, 4].map(i => `<i class="${i < o.picks.size ? "on" : ""}"></i>`).join("")}<span>${o.picks.size} de 5</span></div>${mineL.length ? `<div class="hgroup"><p class="eyebrow">Para lo que quieres transformar</p><div class="hchips">${mineL.map(chip).join("")}</div></div>` : ""}<div class="hgroup"><p class="eyebrow">${mineL.length ? "Más hábitos" : "Hábitos"}</p><div class="hchips">${rest.map(chip).join("")}</div></div>`;
  }
  if (o.step === 8) body = `${no}<h1 class="title">Así será cada día</h1><p class="sub">Dos rutinas guiadas, paso a paso. Con 6 de los 8 pasos, el día queda esculpido.</p><div class="card guide"><b>☀</b><div><h3>Mañana · 6 min</h3><p class="sub">Despertar a las ${o.wake}, respirar, tu frase sellada, afirmaciones y 3 tareas.</p></div></div><div class="card guide"><b>◐</b><div><h3>Durante el día · 30 s</h3><p class="sub">Hábitos, comidas y agua.</p></div></div><div class="card guide"><b>☾</b><div><h3>Noche · 5 min</h3><p class="sub">Cierra tus tareas, examina tu día, la lección de tu mentor y prepara mañana.</p></div></div>`;
  if (o.step === 9) body = `${no}<h1 class="title">Tu app, en 5 pestañas</h1><p class="sub">Abajo tienes cinco pestañas. Esto es lo que hace cada una.</p>${tabsHTML()}`;
  if (o.step === 10) { body = `${no}<h1 class="title xl">El pacto</h1><p class="pact">Yo, <em>${esc(o.name || "yo")}</em>, me comprometo a esculpir a alguien que <em>${esc(o.who || "cumple lo que se promete")}</em> durante 100 días. Cuando caiga, me levantaré.</p><div style="flex:1"></div>`; extra = `<div class="ostage" style="opacity:.22;bottom:190px">${statueSVG(0, "", 0, o.look)}</div>` }
  const foot = o.step === 10 ? `<button class="holdbtn" id="sign"><span class="fill"></span><span class="lbl">Mantén pulsado para firmar</span></button><p class="holdhint">Es tu palabra. Siente el latido.</p><button class="link center" id="oback">Atrás</button>`
    : `<button class="btn" id="onext" ${ok ? "" : "disabled"}>${btn}</button>${o.step ? `<button class="link center" id="oback">Atrás</button>` : ""}`;
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
  app.querySelectorAll("[data-for=owk]").forEach(b => b.onclick = () => { o.wake = addMin(o.wake, +b.dataset.st); SFX.tap(); haptic(); re() });
  app.querySelectorAll("[data-p]").forEach(b => b.onclick = () => {
    const id = b.dataset.p, pd = $("pdots");
    if (o.picks.has(id)) o.picks.delete(id); else if (o.picks.size < 5) o.picks.add(id); else { pd.classList.remove("full"); void pd.offsetWidth; pd.classList.add("full"); haptic(); return }
    SFX.tap(); b.classList.toggle("on", o.picks.has(id));
    pd.querySelectorAll("i").forEach((d, i) => d.classList.toggle("on", i < o.picks.size)); pd.querySelector("span").textContent = `${o.picks.size} de 5`;
    const okk = o.picks.size >= 3, nx = $("onext"); nx.disabled = !okk; nx.textContent = okk ? "Continuar" : `Elige ${3 - o.picks.size} más`;
  });
  if ($("oback")) $("oback").onclick = () => { o.step--; re() };
  if ($("onext")) $("onext").onclick = () => { SFX.tap(); haptic(); o.step++; window.scrollTo(0, 0); re() };
  if ($("sign")) bindHold($("sign"), 2200, () => {
    const keepStart = set().v2 && set().start;
    S.set = { ...S.set, v2: true, v3: true, seenTabs: true, name: o.name, wake: o.wake, goals: [...o.goals], why: o.why.trim(), who: o.who.trim(), look: o.look, start: keepStart || dayKey(0), pactAt: new Date().toISOString(), fav: S.set.fav || [] };
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

/* ---------- detalles de movimiento ---------- */
const RMQ = matchMedia("(prefers-reduced-motion: reduce)");
document.addEventListener("pointerdown", e => {
  const b = e.target.closest(".btn,.addbtn,.prow,.slots button,.seg3 button,.opts button,.areas button,.chk"); if (!b || RMQ.matches) return;
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 1.2, sp = document.createElement("span");
  sp.className = "ripple"; sp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`; b.append(sp); setTimeout(() => sp.remove(), 800);
}, { passive: true });
let _par = 0;
addEventListener("scroll", () => { if (_par || RMQ.matches) return; _par = requestAnimationFrame(() => { _par = 0; const st = (S.tab === "hoy" || S.tab === "estatua") && !$("flow") ? $("stage") : null; if (!st) return; const y = Math.max(0, Math.min(window.scrollY, 520)); st.style.transform = `translateY(${(y * .32).toFixed(1)}px) scale(${(1 - y / 2400).toFixed(4)})`; st.style.opacity = Math.max(.12, 1 - y / 560).toFixed(3) }) }, { passive: true });

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
