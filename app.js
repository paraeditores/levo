/* Levo · Ritual estoico. Una sola fuente de verdad: el estado de abajo; todo se pinta desde él. */
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, "0");
const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dateOf = off => { const d = new Date(); d.setDate(d.getDate() + off); return d };
const dayKey = off => fmt(dateOf(off));
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const DEMO = location.hash === "#demo";
const SHOT = new URLSearchParams(location.search).get("shot");

const sb = window.supabase.createClient(window.MINI.SUPABASE_URL, window.MINI.SUPABASE_ANON_KEY);
const S = { uid: null, ready: false, tab: "hoy", set: {}, profileOutfit: {}, habits: [], days: {}, journal: {}, bodyP: null, weighs: [], estoaTab: "frases", resetArm: false };
const set = () => S.set;
const START = () => S.set.start || dayKey(0);

/* ---------- utilidades ---------- */
function toast(t) { const el = $("status"); el.textContent = t; el.classList.add("in"); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("in"), 2600) }
const J = (k = dayKey(0)) => (S.journal[k] = S.journal[k] || {});
const doneFor = k => (S.days[k] && S.days[k].done) || {};
const habFrac = k => S.habits.length ? S.habits.filter(h => doneFor(k)[h.id]).length / S.habits.length : 0;
const toMin = t => { const [h, m] = (t || "05:00").split(":").map(Number); return h * 60 + m };
const waterGoal = () => S.bodyP && S.bodyP.weight_kg ? Math.round(Math.min(4, Math.max(1.5, S.bodyP.weight_kg * .033)) * 4) : 10;
const practicaHoy = () => PRACTICAS[J().prac] || PRACTICAS[fraseDelDia(dayKey(0)).p];
const practicaId = () => J().prac || fraseDelDia(dayKey(0)).p;

/* Los 7 pasos del ritual y si están hechos en un día */
function steps(k) {
  const j = S.journal[k] || {}, aff = (j.aff || []).filter(s => s && s.trim()).length, tasks = (j.tasks || []).filter(t => t && t.t && t.t.trim()), tdone = tasks.filter(t => t.done).length, meals = ["desayuno", "comida", "cena"].filter(m => j.meals && j.meals[m]).length;
  return {
    wake: !!j.wake, breath: !!j.breath, frase: !!j.commit, aff: aff >= 3,
    tasks: tasks.length >= 1 && tdone >= Math.min(2, tasks.length), habits: S.habits.length ? habFrac(k) >= .6 : false,
    food: meals >= 3, exam: !!(j.exam && (j.exam.bien || j.exam.mejorar || j.exam.gracias)),
  };
}
const score = k => { const s = steps(k), v = Object.values(s); return v.filter(Boolean).length / v.length };
const isRitual = k => score(k) >= .75;
function streak() { let n = 0, o = isRitual(dayKey(0)) ? 0 : -1; while (dayKey(o) >= START() && isRitual(dayKey(o)) && n < 999) { n++; o-- } return n }
function wakeStreak() { const tgt = toMin(set().wake) + 15; let n = 0, o = 0; const ok = k => S.journal[k] && S.journal[k].wake && toMin(S.journal[k].wake) <= tgt; if (!ok(dayKey(0))) o = -1; while (dayKey(o) >= START() && ok(dayKey(o)) && n < 999) { n++; o-- } return n }
function sculpted() { let n = 0; for (let o = 0; dayKey(o) >= START(); o--) { if (isRitual(dayKey(o))) n++; if (o < -800) break } return n }

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
  const since = fmt(new Date(Date.now() - 120 * 864e5));
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
  route();
}
function bootCache() { try { const c = JSON.parse(localStorage.getItem("levo2-cache") || "null"); if (c) { Object.assign(S, c, { ready: true }); route() } } catch (e) { } }

/* ---------- iconos de línea ---------- */
const IC = {
  wake: '<svg viewBox="0 0 24 24"><path d="M3 18h18M6 18a6 6 0 0 1 12 0M12 4v3M4.9 8.9l2 2M19.1 8.9l-2 2"/></svg>',
  breath: '<svg viewBox="0 0 24 24"><path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h8"/></svg>',
  frase: '<svg viewBox="0 0 24 24"><path d="M5 4h14v16l-7-4-7 4z"/></svg>',
  aff: '<svg viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/></svg>',
  tasks: '<svg viewBox="0 0 24 24"><path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/></svg>',
  habits: '<svg viewBox="0 0 24 24"><path d="M12 21c-4-3-7-6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4-3 7-7 10z"/></svg>',
  food: '<svg viewBox="0 0 24 24"><path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M16 21V3c-2 1-3 4-3 8h3"/></svg>',
  exam: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></svg>',
  hoy: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></svg>',
  estoa: '<svg viewBox="0 0 24 24"><path d="M3 21h18M4 10h16M12 3l9 5H3zM6 10v9M10 10v9M14 10v9M18 10v9"/></svg>',
  prog: '<svg viewBox="0 0 24 24"><path d="M8 21h8M10 21v-3h4v3M12 18c-3 0-5-2-5-5 0-2 1-3 2-4-1-1-1-2-1-3a4 4 0 0 1 8 0c0 1 0 2-1 3 1 1 2 2 2 4 0 3-2 5-5 5z"/></svg>',
  perfil: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
};

/* ---------- vistas ---------- */
function route() {
  const app = $("app");
  if (!S.uid && !DEMO) return renderGate(app);
  if (!S.ready) return;
  if (!set().v2) return renderOnb(app);
  renderMain(app);
}
function renderMain(app) {
  if (!$("view")) app.innerHTML = `<main class="wrap" id="view"></main>
    <nav class="tabbar" aria-label="Secciones">${[["hoy", "Hoy"], ["estoa", "Estoa"], ["prog", "Progreso"], ["perfil", "Perfil"]].map(([k, n]) => `<button data-tab="${k}" aria-selected="${S.tab === k}">${IC[k]}${n}</button>`).join("")}</nav>`;
  app.querySelectorAll("[data-tab]").forEach(b => { b.setAttribute("aria-selected", b.dataset.tab === S.tab); b.onclick = () => { S.tab = b.dataset.tab; window.scrollTo(0, 0); renderMain(app) } });
  ({ hoy: renderHoy, estoa: renderEstoa, prog: renderProg, perfil: renderPerfil })[S.tab]($("view"));
}
function greet() { const h = new Date().getHours(); return h < 14 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches" }
function renderHoy(v) {
  const k = dayKey(0), j = J(), st = steps(k), sc = score(k), f = fraseDelDia(k), pr = practicaHoy(), name = set().name ? `, ${esc(set().name)}` : "";
  const tasks = (j.tasks || []).filter(t => t && t.t && t.t.trim()), tdone = tasks.filter(t => t.done).length, aff = (j.aff || []).filter(s => s && s.trim()).length;
  const hd = S.habits.filter(h => doneFor(k)[h.id]).length, meals = ["desayuno", "comida", "cena"].filter(m => j.meals && j.meals[m]).length, hr = new Date().getHours();
  const onTime = j.wake && toMin(j.wake) <= toMin(set().wake) + 15;
  const morningDone = st.wake && st.breath && st.frase && st.aff && (j.tasks || []).some(t => t && t.t);
  const C = 2 * Math.PI * 27;
  const rows = [
    ["wake", "Despertar", j.wake ? `${j.wake} · ${onTime ? "victoria matinal" : "mañana, a las " + set().wake}` : `Objetivo: ${set().wake || "05:00"}`, st.wake],
    ["breath", "Respirar", st.breath ? "Hecho · un minuto de calma" : "Un minuto para centrarte", st.breath],
    ["aff", "Afirmaciones", aff ? `${aff} de 3 escritas` : "Escribe quién eliges ser hoy", st.aff],
    ["tasks", "Tareas del día", tasks.length ? `${tdone} de ${tasks.length} hechas` : "Define tus 3 tareas clave", st.tasks],
    ["habits", "Hábitos", S.habits.length ? `${hd} de ${S.habits.length}` : "Añade tus hábitos", st.habits],
    ["food", "Alimentación", `${meals} de 3 comidas · agua ${j.water || 0}/${waterGoal()}`, st.food],
    ["exam", "Examen nocturno", st.exam ? "Hecho" : hr >= 20 ? "Es el momento" : "Esta noche", st.exam],
  ];
  v.innerHTML = `
  <header class="top"><div><p class="eyebrow">${new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p><h1 class="title">${greet()}${name}</h1></div>
    <button class="ring" id="ring" aria-label="Ritual de hoy al ${Math.round(sc * 100)} %"><svg viewBox="0 0 62 62"><circle class="bg" cx="31" cy="31" r="27"/><circle class="fg" cx="31" cy="31" r="27" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - sc)).toFixed(1)}"/></svg><span>${Math.round(sc * 100)}</span></button></header>
  <section class="card quote"><p class="eyebrow">Frase del día</p><p class="q">«${esc(f.t)}»</p><p class="qa">${esc(f.a)} · ${esc(f.s)}</p>
    <div class="prac"><p class="eyebrow">Práctica de hoy</p><b>${esc(pr.name)}</b><p>${esc(pr.hoy)}</p>
      <div class="row"><button class="chipbtn ${j.commit ? "on" : ""}" id="commit">${j.commit ? "✓ Comprometido" : "Me comprometo"}</button><button class="chipbtn ${j.practiced ? "on" : ""}" id="practiced">${j.practiced ? "✓ Practicada" : "La he practicado"}</button></div></div></section>
  ${!morningDone ? `<button class="btn" id="startRitual">Comenzar el ritual de la mañana</button>` : ""}
  ${pushCardHTML()}
  <div class="section-h"><h2>Tu ritual</h2><span class="sub">${Object.values(st).filter(Boolean).length} de 8 pasos</span></div>
  <section class="steps">${rows.map(([key, t, s, d]) => `<button class="step ${d ? "done" : ""}" data-step="${key}"><span class="ic">${IC[key]}</span><span class="tx"><b>${t}</b><small>${esc(s)}</small></span><span class="end">${d ? "✓" : "›"}</span></button>`).join("")}</section>`;
  v.querySelectorAll("[data-step]").forEach(b => b.onclick = () => openSheet(b.dataset.step));
  $("ring").onclick = () => { S.tab = "prog"; renderMain($("app")) };
  $("commit").onclick = () => { j.commit = !j.commit; saveJ(); renderHoy(v); if (j.commit) toast("Comprometido. Hoy lo practicas.") };
  $("practiced").onclick = () => { j.practiced = !j.practiced; if (j.practiced) j.commit = true; saveJ(); renderHoy(v) };
  if ($("startRitual")) $("startRitual").onclick = () => startFlow();
  bindPush();
}

/* ---------- hojas: un paso cada vez ---------- */
let flow = null;
const FLOW = ["wake", "frase", "breath", "aff", "tasks", "fin"];
function startFlow() { flow = 0; openSheet(FLOW[0]) }
function nextFlow() { if (flow === null) return closeSheet(); flow++; if (flow >= FLOW.length) { flow = null; return closeSheet() } openSheet(FLOW[flow]) }
function closeSheet() { const s = $("sheet"); if (s) s.remove(); clearInterval(openSheet._iv); flow = null; route() }
function openSheet(key) {
  let s = $("sheet"); if (!s) { s = document.createElement("div"); s.id = "sheet"; s.className = "sheet"; s.setAttribute("role", "dialog"); document.body.append(s) }
  clearInterval(openSheet._iv);
  const dots = flow !== null ? `<div class="dots">${FLOW.map((_, i) => `<i class="${i <= flow ? "on" : ""}"></i>`).join("")}</div>` : `<span></span>`;
  s.innerHTML = `<div class="sheet-in"><div class="sheet-head">${dots}<button class="x" id="sx" aria-label="Cerrar">×</button></div><div class="sheet-body" id="sb"></div><div class="sheet-foot" id="sf"></div></div>`;
  $("sx").onclick = closeSheet;
  SHEETS[key]($("sb"), $("sf"));
}
const footBtn = (f, label, fn, cls = "btn") => { const b = document.createElement("button"); b.className = cls; b.textContent = label; b.onclick = fn; f.append(b); return b };
const goOn = () => flow !== null ? nextFlow() : closeSheet();
const SHEETS = {
  wake(b, f) {
    const j = J(), tgt = set().wake || "05:00";
    b.classList.add("center");
    b.innerHTML = `<p class="eyebrow">Despertar</p><p class="big-time" id="clk"></p><p class="sub">Tu objetivo: <b>${tgt}</b></p>
      <p class="sub" style="max-width:32ch;margin-top:10px">«Al amanecer, cuando te cueste levantarte, ten presente: me levanto para hacer el trabajo de un ser humano.» — Marco Aurelio</p>
      ${j.wake ? `<p class="link" style="margin-top:12px">Hoy te levantaste a las ${j.wake}</p>` : ""}`;
    const tick = () => { const d = new Date(); $("clk").textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}` }; tick(); openSheet._iv = setInterval(tick, 1000);
    if (!j.wake) footBtn(f, "Me he levantado", () => { const d = new Date(); j.wake = `${pad(d.getHours())}:${pad(d.getMinutes())}`; saveJ(); toast(toMin(j.wake) <= toMin(tgt) + 15 ? "Victoria matinal. Primera batalla ganada." : "Bien. Mañana, a por tu hora."); goOn() });
    else footBtn(f, flow !== null ? "Siguiente" : "Cerrar", goOn);
  },
  frase(b, f) {
    const j = J(), q = fraseDelDia(dayKey(0)), pr = practicaHoy();
    b.classList.add("center");
    b.innerHTML = `<p class="eyebrow">Frase del día</p><p class="big-q">«${esc(q.t)}»</p><p class="eyebrow" style="color:var(--muted)">${esc(q.a)} · ${esc(q.s)}</p>
      <div class="card" style="text-align:left;margin-top:14px;width:100%"><p class="eyebrow">Práctica de hoy</p><b style="font-family:var(--serif);font-size:22px">${esc(pr.name)}</b><p class="sub" style="margin-top:6px">${esc(pr.hoy)}</p></div>`;
    footBtn(f, j.commit ? "Siguiente" : "Me comprometo a practicarlo", () => { j.commit = true; saveJ(); goOn() });
  },
  breath(b, f) {
    const j = J(); b.classList.add("center");
    b.innerHTML = `<p class="eyebrow">Respirar</p><p class="sub">Respiración cuadrada: 4 segundos cada fase.</p><div class="breath"><span class="ringb"></span><span class="orb" id="orb"></span><div><b id="ph">Prepárate</b><small id="cd">60 s</small></div></div>`;
    const phases = [["Inhala", 1.9], ["Mantén", 1.9], ["Exhala", 1], ["Mantén", 1]]; let t0 = null, done = false;
    const btn = footBtn(f, "Empezar", () => { if (done) return goOn(); t0 = Date.now(); btn.textContent = "Respirando…"; btn.disabled = true; skip.textContent = "Terminar antes" });
    const skip = footBtn(f, flow !== null ? "Saltar" : "Cerrar", () => { if (t0 && Date.now() - t0 > 30e3) { j.breath = true; saveJ() } goOn() }, "btn ghost");
    openSheet._iv = setInterval(() => {
      if (!t0) return; const el = (Date.now() - t0) / 1000, left = Math.max(0, 64 - el), i = Math.floor(el / 4) % 4;
      $("ph").textContent = left <= 0 ? "Hecho" : phases[i][0]; $("cd").textContent = left <= 0 ? "Mente en calma" : `${Math.ceil(left)} s`; $("orb").style.transform = `scale(${left <= 0 ? 1.4 : phases[i][1]})`;
      if (left <= 0 && !done) { done = true; j.breath = true; saveJ(); btn.disabled = false; btn.textContent = flow !== null ? "Siguiente" : "Cerrar"; skip.hidden = true; clearInterval(openSheet._iv) }
    }, 200);
  },
  aff(b, f) {
    const j = J(); j.aff = j.aff || ["", "", ""]; const prev = S.journal[dayKey(-1)] && S.journal[dayKey(-1)].aff;
    const ph = ["Yo soy…", "Hoy elijo…", "Me comprometo a…"];
    b.innerHTML = `<p class="eyebrow">Afirmaciones</p><h2 class="title">¿Quién eliges ser hoy?</h2><p class="sub">Escríbelas cada mañana. Escribirlas es la práctica.</p>
      <div class="fields">${[0, 1, 2].map(i => `<textarea id="af${i}" rows="2" placeholder="${ph[i]}">${esc(j.aff[i] || "")}</textarea>`).join("")}</div>
      ${prev && prev.some(Boolean) ? `<button class="link" id="prevAff" style="text-align:left">Usar las de ayer</button>` : ""}
      <p class="eyebrow" style="color:var(--muted)">Ideas</p><div class="sugs">${AFIRMACIONES.slice(0, 6).map(a => `<button data-a="${esc(a)}">${esc(a)}</button>`).join("")}</div>`;
    [0, 1, 2].forEach(i => $("af" + i).oninput = e => { j.aff[i] = e.target.value; saveJ() });
    b.querySelectorAll("[data-a]").forEach(x => x.onclick = () => { const i = j.aff.findIndex(s => !s || !s.trim()); if (i < 0) return; j.aff[i] = x.dataset.a; $("af" + i).value = x.dataset.a; saveJ() });
    if ($("prevAff")) $("prevAff").onclick = () => { j.aff = [...prev]; [0, 1, 2].forEach(i => $("af" + i).value = j.aff[i] || ""); saveJ() };
    footBtn(f, flow !== null ? "Siguiente" : "Guardar", goOn);
  },
  tasks(b, f) {
    const j = J(); j.tasks = j.tasks || [{ t: "", done: false }, { t: "", done: false }, { t: "", done: false }];
    b.innerHTML = `<p class="eyebrow">Tareas del día</p><h2 class="title">Tus 3 tareas clave</h2><p class="sub">Si solo hicieras tres cosas hoy, ¿cuáles moverían tu vida?</p>
      <div class="fields">${j.tasks.map((t, i) => `<div class="task"><button class="ck ${t.done ? "on" : ""}" data-ck="${i}" aria-label="Hecha">✓</button><input id="tk${i}" placeholder="Tarea ${i + 1}" value="${esc(t.t)}"></div>`).join("")}</div>`;
    j.tasks.forEach((t, i) => $("tk" + i).oninput = e => { j.tasks[i].t = e.target.value; saveJ() });
    b.querySelectorAll("[data-ck]").forEach(x => x.onclick = () => { const t = j.tasks[+x.dataset.ck]; if (!t.t.trim()) return toast("Escribe primero la tarea."); t.done = !t.done; x.classList.toggle("on", t.done); saveJ() });
    footBtn(f, flow !== null ? "Siguiente" : "Guardar", goOn);
  },
  habits(b, f) {
    const draw = () => {
      const k = dayKey(0);
      b.innerHTML = `<p class="eyebrow">Hábitos</p><h2 class="title">Tus hábitos</h2><p class="sub">Somos lo que hacemos cada día.</p>
        <div class="fields">${S.habits.map(h => `<button class="hab ${doneFor(k)[h.id] ? "on" : ""}" data-h="${h.id}"><span class="ck ${doneFor(k)[h.id] ? "on" : ""}">✓</span><span>${esc(h.name)}</span><span class="rm" data-rm="${h.id}" role="button" aria-label="Quitar">Quitar</span></button>`).join("") || `<p class="sub">Aún no tienes hábitos.</p>`}</div>
        <div class="task"><input id="newHab" placeholder="Nuevo hábito (ej.: 20 flexiones)"><button class="chipbtn" id="addHab">Añadir</button></div>`;
      b.querySelectorAll("[data-h]").forEach(x => x.onclick = e => { if (e.target.dataset.rm) return; const h = S.habits.find(z => z.id === x.dataset.h); toggleHabit(h); draw() });
      b.querySelectorAll("[data-rm]").forEach(x => x.onclick = e => { e.stopPropagation(); const id = x.dataset.rm; S.habits = S.habits.filter(h => h.id !== id); write(() => sb.from("habits").update({ active: false }).eq("id", id)); draw() });
      $("addHab").onclick = () => { const name = $("newHab").value.trim(); if (!name) return; const id = name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").slice(0, 30) + "-" + Date.now().toString(36); S.habits = [...S.habits, { id, name, area: "vida" }]; write(() => sb.from("habits").insert({ id, user_id: S.uid, name, area: "vida", ord: Date.now(), active: true })); draw() };
    };
    draw(); footBtn(f, "Listo", closeSheet);
  },
  food(b, f) {
    const j = J(); j.meals = j.meals || {};
    const draw = () => {
      const goal = waterGoal(), w = j.water || 0;
      b.innerHTML = `<p class="eyebrow">Alimentación</p><h2 class="title">¿Cómo has comido?</h2><p class="sub">Sin contar calorías: con honestidad.</p>
        ${["desayuno", "comida", "cena"].map(m => `<div class="meal"><b>${m[0].toUpperCase() + m.slice(1)}</b><div class="seg3">${[["limpio", "Limpio"], ["regular", "Regular"], ["exceso", "Me pasé"]].map(([k, n]) => `<button data-m="${m}" data-v="${k}" class="${j.meals[m] === k ? "on" : ""}">${n}</button>`).join("")}</div></div>`).join("")}
        <div class="water"><div><b>Agua</b><div class="n">${w}<span class="sub" style="font-family:var(--sans);font-size:14px"> / ${goal} vasos</span></div><div class="glasses">${Array.from({ length: goal }, (_, i) => `<i class="${i < w ? "on" : ""}"></i>`).join("")}</div></div><div class="pm"><button id="wm" aria-label="Quitar un vaso">−</button><button id="wp" aria-label="Añadir un vaso">+</button></div></div>`;
      b.querySelectorAll("[data-m]").forEach(x => x.onclick = () => { j.meals[x.dataset.m] = j.meals[x.dataset.m] === x.dataset.v ? undefined : x.dataset.v; saveJ(); draw() });
      $("wp").onclick = () => { j.water = (j.water || 0) + 1; saveJ(); draw() }; $("wm").onclick = () => { j.water = Math.max(0, (j.water || 0) - 1); saveJ(); draw() };
    };
    draw(); footBtn(f, "Listo", closeSheet);
  },
  exam(b, f) {
    const j = J(); j.exam = j.exam || {}; const pr = practicaHoy();
    b.innerHTML = `<p class="eyebrow">Examen nocturno</p><h2 class="title">Revisa tu día</h2><p class="sub">«Cada noche examinaré mi día.» — Séneca</p>
      <div class="card" style="display:grid;gap:10px"><b>¿Practicaste «${esc(pr.name)}»?</b><div class="seg3" style="grid-template-columns:1fr 1fr"><button id="py" class="${j.practiced ? "on" : ""}">Sí</button><button id="pn" class="${j.practiced === false ? "on" : ""}">Todavía no</button></div></div>
      <div class="fields"><label>¿Qué hice bien?<textarea id="e1" rows="2">${esc(j.exam.bien || "")}</textarea></label><label>¿Qué puedo mejorar?<textarea id="e2" rows="2">${esc(j.exam.mejorar || "")}</textarea></label><label>¿Qué agradezco?<textarea id="e3" rows="2">${esc(j.exam.gracias || "")}</textarea></label></div>`;
    $("py").onclick = () => { j.practiced = true; j.commit = true; saveJ(); $("py").classList.add("on"); $("pn").classList.remove("on") };
    $("pn").onclick = () => { j.practiced = false; saveJ(); $("pn").classList.add("on"); $("py").classList.remove("on") };
    [["e1", "bien"], ["e2", "mejorar"], ["e3", "gracias"]].forEach(([id, k]) => $(id).oninput = e => { j.exam[k] = e.target.value; saveJ() });
    footBtn(f, "Guardar", () => { closeSheet(); if (isRitual(dayKey(0))) toast("Ritual completo. Has esculpido tu estatua hoy.") });
  },
  fin(b, f) {
    const n = sculpted(), fz = faseDe(n); b.classList.add("center");
    b.innerHTML = `<p class="eyebrow">Mañana ganada</p><div style="width:160px">${statueSVG(fz.i, set().name)}</div><h2 class="title">Has empezado bien.</h2><p class="sub" style="max-width:30ch">Durante el día: tus tareas, tus hábitos y tu comida. Por la noche, el examen. Así se esculpe la estatua.</p>`;
    footBtn(f, "Ir a mi día", closeSheet);
  },
};

/* ---------- Estoa ---------- */
function renderEstoa(v) {
  const fav = set().fav || [];
  const card = (q, i) => `<article class="card qcard"><p class="q">«${esc(q.t)}»</p><p class="eyebrow" style="color:var(--muted)">${esc(q.a)} · ${esc(q.s)}</p><button class="fav ${fav.includes(i) ? "on" : ""}" data-fav="${i}" aria-label="Guardar">${fav.includes(i) ? "★" : "☆"}</button></article>`;
  let list = "";
  if (S.estoaTab === "frases") list = FRASES.map(card).join("");
  else if (S.estoaTab === "favs") list = fav.length ? fav.map(i => card(FRASES[i], i)).join("") : `<p class="sub">Guarda las frases que quieras releer con ☆.</p>`;
  else list = Object.entries(PRACTICAS).map(([id, p]) => `<article class="card pcard"><p class="eyebrow">${esc(p.by)}</p><h3>${esc(p.name)}</h3><p>${esc(p.why)}</p><p class="hoy"><b>Para hoy:</b> ${esc(p.hoy)}</p><button class="chipbtn ${practicaId() === id ? "on" : ""}" data-prac="${id}" style="justify-self:start">${practicaId() === id ? "✓ Es tu práctica de hoy" : "Practicar hoy"}</button></article>`).join("");
  v.innerHTML = `<header><p class="eyebrow">Estoa</p><h1 class="title">La escuela del pórtico</h1><p class="sub" style="margin-top:6px">Frases y prácticas para vivir con virtud.</p></header>
    <div class="seg" role="tablist">${[["frases", "Frases"], ["practicas", "Prácticas"], ["favs", "Guardadas"]].map(([k, n]) => `<button role="tab" data-e="${k}" aria-selected="${S.estoaTab === k}">${n}</button>`).join("")}</div>${list}`;
  v.querySelectorAll("[data-e]").forEach(b => b.onclick = () => { S.estoaTab = b.dataset.e; renderEstoa(v) });
  v.querySelectorAll("[data-fav]").forEach(b => b.onclick = () => { const i = +b.dataset.fav, s = new Set(set().fav || []); s.has(i) ? s.delete(i) : s.add(i); S.set.fav = [...s]; saveSet(); renderEstoa(v) });
  v.querySelectorAll("[data-prac]").forEach(b => b.onclick = () => { J().prac = b.dataset.prac; J().commit = true; saveJ(); toast(`Hoy practicas: ${PRACTICAS[b.dataset.prac].name}`); renderEstoa(v) });
}

/* ---------- Progreso ---------- */
function renderProg(v) {
  const n = sculpted(), fz = faseDe(n), nx = fz.next, prevAt = FASES[fz.i][0], pct = nx ? (n - prevAt) / (nx[0] - prevAt) : 1;
  const cal = []; const start = new Date(); start.setDate(start.getDate() - 34); const off = (start.getDay() + 6) % 7; start.setDate(start.getDate() - off);
  for (let i = 0; i < 35 + off && cal.length < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); if (d > new Date()) break; const k = fmt(d), s = k >= START() ? score(k) : 0; cal.push(`<i class="${k === dayKey(0) ? "today" : ""}" style="${s ? `background:color-mix(in srgb,var(--bronze) ${Math.round(18 + s * 70)}%,var(--surface2));color:${s >= .75 ? "var(--onbronze)" : "var(--fg)"}` : ""}" title="${k}">${d.getDate()}</i>`) }
  const w = S.weighs.slice(-10);
  v.innerHTML = `<header><p class="eyebrow">Progreso</p><h1 class="title">Tu estatua</h1></header>
    <section class="card statue"><div class="svgw">${statueSVG(fz.i, set().name)}</div><p class="eyebrow">Fase ${fz.i + 1} de 8</p><h2>${fz.name}</h2><p class="sub">${fz.txt}</p>
      ${nx ? `<div class="bar" style="margin-top:12px"><b style="width:${Math.round(pct * 100)}%"></b></div><p class="sub" style="font-size:13px">Faltan ${nx[0] - n} ${nx[0] - n === 1 ? "día" : "días"} de ritual para «${nx[1]}»</p>` : `<p class="link">Obra terminada. Sigue cuidándola cada día.</p>`}
      <button class="chipbtn" id="shareStatue" style="margin-top:10px">Compartir mi estatua</button></section>
    <div class="stats"><div class="stat"><b>${streak()}</b><small>días seguidos de ritual</small></div><div class="stat"><b>${wakeStreak()}</b><small>días en pie a las ${set().wake || "05:00"}</small></div><div class="stat"><b>${n}</b><small>días esculpidos</small></div></div>
    <section class="card"><p class="eyebrow" style="margin-bottom:12px">Últimas semanas</p><div class="cal">${["L", "M", "X", "J", "V", "S", "D"].map(d => `<span class="h">${d}</span>`).join("")}${cal.join("")}</div><p class="sub" style="font-size:13px;margin-top:10px">Un día cuenta como esculpido cuando completas al menos 6 de los 8 pasos del ritual.</p></section>
    <section class="card" style="display:grid;gap:10px"><p class="eyebrow">Tu cuerpo</p>${w.length ? `<b style="font-family:var(--serif);font-size:30px">${String(w[w.length - 1].kg).replace(".", ",")} kg</b>${w.length > 1 ? sparkline(w) : ""}` : `<p class="sub">Registra tu peso una vez por semana para ver tu evolución.</p>`}
      <div class="task"><input id="kg" type="number" inputmode="decimal" step="0.1" placeholder="Peso de hoy (kg)"><button class="chipbtn" id="saveKg">Guardar</button></div></section>`;
  $("saveKg").onclick = () => { const kg = parseFloat(($("kg").value || "").replace(",", ".")); if (!kg || kg < 30 || kg > 300) return toast("Escribe un peso válido."); const k = dayKey(0); S.weighs = S.weighs.filter(x => x.day !== k).concat([{ day: k, kg }]); write(() => sb.from("weighins").upsert({ user_id: S.uid, day: k, kg }, { onConflict: "user_id,day" })); S.bodyP = { ...(S.bodyP || {}), weight_kg: kg }; write(() => sb.from("body_profile").upsert({ user_id: S.uid, ...S.bodyP, updated_at: new Date().toISOString() }, { onConflict: "user_id" })); toast("Peso guardado."); renderProg(v) };
  $("shareStatue").onclick = shareStatue;
}
function sparkline(w) { const W = 300, H = 70, ks = w.map(x => +x.kg), mn = Math.min(...ks), mx = Math.max(...ks), rg = Math.max(.5, mx - mn); const pts = w.map((x, i) => `${(8 + i * (W - 16) / (w.length - 1)).toFixed(1)},${(H - 8 - (x.kg - mn) / rg * (H - 16)).toFixed(1)}`); const d = ks[ks.length - 1] - ks[0]; return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-label="Evolución del peso"><polyline points="${pts.join(" ")}" fill="none" stroke="var(--bronze)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><p class="sub" style="font-size:13px">${d === 0 ? "Estable" : (d > 0 ? "+" : "−") + Math.abs(d).toFixed(1).replace(".", ",") + " kg"} en tus últimos ${w.length} registros</p>` }
async function shareStatue() {
  const n = sculpted(), fz = faseDe(n), W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
  const g = x.createRadialGradient(540, 760, 60, 540, 900, 1200); g.addColorStop(0, "#2a241b"); g.addColorStop(1, "#0e0e0d"); x.fillStyle = g; x.fillRect(0, 0, W, H);
  try { await document.fonts.load('600 80px "Cormorant Garamond"'); await document.fonts.load('700 40px "Cinzel"') } catch (e) { }
  const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(statueSVG(fz.i, set().name)); await img.decode().catch(() => { });
  x.textAlign = "center"; x.fillStyle = "#c6a066"; x.font = '700 44px Cinzel, Georgia, serif'; x.fillText("L E V O", W / 2, 170);
  x.drawImage(img, W / 2 - 330, 260, 660, 858);
  x.fillStyle = "#c6a066"; x.font = '600 34px Cinzel, Georgia, serif'; x.fillText(`FASE ${fz.i + 1} DE 8`, W / 2, 1230);
  x.fillStyle = "#ede8e0"; x.font = '600 120px "Cormorant Garamond", Georgia, serif'; x.fillText(fz.name, W / 2, 1360);
  x.fillStyle = "#9b958b"; x.font = '500 44px -apple-system, "Segoe UI", sans-serif'; x.fillText(`${n} días esculpidos · ${streak()} seguidos`, W / 2, 1450);
  x.fillStyle = "#ede8e0"; x.font = 'italic 500 50px "Cormorant Garamond", Georgia, serif'; x.fillText("«Nunca dejes de esculpir", W / 2, 1620); x.fillText("tu propia estatua.»", W / 2, 1690);
  x.fillStyle = "#9b958b"; x.font = '600 28px Cinzel, Georgia, serif'; x.fillText("PLOTINO", W / 2, 1760);
  c.toBlob(async blob => { const file = new File([blob], "levo-mi-estatua.png", { type: "image/png" }); try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: "Esculpiendo mi estatua en Levo" }); return } } catch (e) { if (e && e.name === "AbortError") return } const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "levo-mi-estatua.png"; document.body.append(a); a.click(); a.remove() }, "image/png");
}

/* ---------- Perfil ---------- */
function renderPerfil(v) {
  const fz = faseDe(sculpted()), granted = "Notification" in window && Notification.permission === "granted";
  v.innerHTML = `<header style="display:flex;gap:16px;align-items:center"><div style="width:70px">${statueSVG(fz.i, set().name)}</div><div><p class="eyebrow">Perfil</p><h1 class="title">${esc(set().name || "Tú")}</h1><p class="sub">${fz.name}</p></div></header>
    <div class="plist">
      <label class="prow"><span class="tx"><b>Nombre</b><small>Aparece en tu estatua</small></span><input id="pName" value="${esc(set().name || "")}" maxlength="18" style="width:140px;text-align:right"></label>
      <label class="prow"><span class="tx"><b>Hora de despertar</b><small>Cuenta para tu racha de madrugador</small></span><input id="pWake" type="time" value="${set().wake || "05:00"}"></label>
      <button class="prow" id="pPush"><span class="tx"><b>Avisos</b><small>${granted ? "Activados: al despertar, a mediodía y por la noche" : "Desactivados: toca para activarlos"}</small></span><span class="end">›</span></button>
      <button class="prow" id="pBody"><span class="tx"><b>Tu cuerpo</b><small>${S.bodyP && S.bodyP.weight_kg ? `${String(S.bodyP.weight_kg).replace(".", ",")} kg · objetivo de agua: ${waterGoal()} vasos` : "Peso y estatura para tu meta de agua (privado)"}</small></span><span class="end">›</span></button>
    </div>
    <div class="plist">
      <button class="prow danger ${S.resetArm ? "armed" : ""}" id="pReset"><span class="tx"><b>${S.resetArm ? "Toca otra vez para borrarlo todo" : "Empezar de cero"}</b><small>${S.resetArm ? "Se borran tu diario, tus días, tus hábitos y tu estatua. No se puede deshacer." : "Como si acabaras de descargar Levo"}</small></span></button>
      <button class="prow" id="pOut"><span class="tx"><b>Cerrar sesión</b></span></button>
    </div>
    <p class="sub" style="text-align:center;font-size:12.5px">Levo · Esculpe tu mejor versión, un día cada vez.</p>`;
  $("pName").onchange = e => { S.set.name = e.target.value.trim(); saveSet(); toast("Nombre guardado.") };
  $("pWake").onchange = e => { S.set.wake = e.target.value || "05:00"; saveSet(); toast(`Te levantarás a las ${S.set.wake}.`) };
  $("pPush").onclick = enablePush;
  $("pBody").onclick = () => openBody();
  $("pReset").onclick = resetAll;
  $("pOut").onclick = async () => { try { localStorage.removeItem("levo2-cache") } catch (e) { } await sb.auth.signOut(); location.href = location.pathname };
}
function openBody() {
  let s = document.createElement("div"); s.id = "sheet"; s.className = "sheet"; document.body.append(s);
  const bp = S.bodyP || {};
  s.innerHTML = `<div class="sheet-in"><div class="sheet-head"><span></span><button class="x" id="sx">×</button></div><div class="sheet-body"><p class="eyebrow">Tu cuerpo</p><h2 class="title">Solo lo ves tú</h2><p class="sub">Con tu peso calculo tu meta de agua (orientativo, unos 33 ml por kilo). No es consejo médico.</p>
    <div class="fields"><label>Estatura (cm)<input id="bh" type="number" inputmode="numeric" value="${bp.height_cm || ""}"></label><label>Peso (kg)<input id="bw" type="number" inputmode="decimal" step="0.1" value="${bp.weight_kg || ""}"></label>
    <label>Objetivo<select id="bg"><option value="mantener">Mantener</option><option value="perder">Perder peso</option><option value="ganar">Ganar peso</option></select></label></div></div><div class="sheet-foot" id="sf"></div></div>`;
  $("bg").value = bp.goal || "mantener"; $("sx").onclick = () => s.remove();
  footBtn($("sf"), "Guardar", () => { const h = parseFloat($("bh").value) || null, kg = parseFloat(($("bw").value || "").replace(",", ".")) || null; S.bodyP = { height_cm: h, weight_kg: kg, goal: $("bg").value }; write(() => sb.from("body_profile").upsert({ user_id: S.uid, ...S.bodyP, updated_at: new Date().toISOString() }, { onConflict: "user_id" })); if (kg) { const k = dayKey(0); S.weighs = S.weighs.filter(x => x.day !== k).concat([{ day: k, kg }]); write(() => sb.from("weighins").upsert({ user_id: S.uid, day: k, kg }, { onConflict: "user_id,day" })) } s.remove(); toast("Guardado."); route() });
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
function pushCardHTML() { const ok = "Notification" in window && Notification.permission === "granted"; if (ok || DEMO) return ""; return `<section class="card pushcard"><p class="eyebrow">Avisos</p><p>Te escribo al despertar, a mediodía y antes de dormir. Sin agobios.</p><button class="btn soft" id="pushBtn">Activar avisos</button></section>` }
function bindPush() { if ($("pushBtn")) $("pushBtn").onclick = enablePush }
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
  app.innerHTML = `<div class="gate"><div class="mark">${statueSVG(7)}</div><p class="logo">LEVO</p><p class="sub" style="text-align:center">Esculpe tu mejor versión, un día cada vez.</p>
    <form id="gf" class="fields"><input id="ge" type="email" autocomplete="username" placeholder="Email" required><input id="gp" type="password" autocomplete="current-password" placeholder="Contraseña" minlength="8" required><button class="btn" id="gb">Entrar</button></form>
    <button class="link" id="gs" style="text-align:center">¿Primera vez? Crear cuenta</button><p class="sub" id="gm" style="text-align:center;min-height:20px"></p></div>`;
  $("gs").onclick = () => { signup = !signup; $("gb").textContent = signup ? "Crear cuenta" : "Entrar"; $("gs").textContent = signup ? "Ya tengo cuenta" : "¿Primera vez? Crear cuenta"; $("gp").autocomplete = signup ? "new-password" : "current-password" };
  $("gf").onsubmit = async e => {
    e.preventDefault(); const email = $("ge").value.trim(), password = $("gp").value; $("gm").textContent = signup ? "Creando tu cuenta…" : "Entrando…";
    if (signup) { const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: "https://paraeditores.github.io/levo/" } }); $("gm").textContent = error ? (/not allowed|disabled/i.test(error.message) ? "El registro está cerrado: Levo está en beta privada." : "No se pudo crear la cuenta.") : (data.session ? "" : "Te hemos enviado un email para confirmar la cuenta."); return }
    const { error } = await sb.auth.signInWithPassword({ email, password }); $("gm").textContent = error ? "Email o contraseña incorrectos." : "";
  };
}

/* ---------- bienvenida ---------- */
function renderOnb(app) {
  const o = renderOnb.o = renderOnb.o || { step: 0, name: set().name || "", wake: set().wake || "05:00", picks: new Set(S.habits.length ? [] : ["leer", "entreno", "frio"]) };
  const N = 4, dots = `<div class="dots" style="justify-content:center">${Array.from({ length: N }, (_, i) => `<i class="${i <= o.step ? "on" : ""}"></i>`).join("")}</div>`;
  let body = "", btn = "Continuar", ok = true;
  if (o.step === 0) body = `<div class="mark" style="width:110px">${statueSVG(0)}</div><p class="logo" style="font-size:28px">LEVO</p><h1 class="title" style="text-align:center">Tu mejor versión está dentro del bloque.</h1><p class="sub" style="text-align:center">Cada mañana: madrugar, una frase estoica, respirar, afirmaciones y tareas. Cada día cumplido esculpe tu estatua.</p><input id="on" placeholder="¿Cómo te llamas?" maxlength="18" value="${esc(o.name)}">`;
  if (o.step === 1) body = `<p class="eyebrow" style="text-align:center">Despertar</p><h1 class="title" style="text-align:center">¿A qué hora te levantarás?</h1><p class="sub" style="text-align:center">Ganar la mañana es ganar el día.</p><div class="opts time">${["05:00", "05:30", "06:00", "06:30"].map(t => `<button data-w="${t}" class="${o.wake === t ? "on" : ""}">${t}</button>`).join("")}</div><label class="fields" style="display:grid;gap:6px"><span class="sub">Otra hora</span><input id="ow" type="time" value="${o.wake}"></label>`;
  if (o.step === 2) { ok = o.picks.size >= 3; btn = ok ? "Continuar" : `Elige ${3 - o.picks.size} más`; body = `<p class="eyebrow" style="text-align:center">Hábitos</p><h1 class="title" style="text-align:center">Elige de 3 a 5 hábitos</h1><p class="sub" style="text-align:center">Pocos y firmes. Podrás cambiarlos cuando quieras.</p><div class="fields">${HABITOS_ESTOICOS.map(h => `<button class="hab ${o.picks.has(h.id) ? "on" : ""}" data-p="${h.id}"><span class="ck ${o.picks.has(h.id) ? "on" : ""}">✓</span><span style="color:var(--fg)">${esc(h.name)}</span></button>`).join("")}</div>` }
  if (o.step === 3) { btn = "Esculpir mi estatua"; body = `<p class="eyebrow" style="text-align:center">Tu ritual</p><h1 class="title" style="text-align:center">Así será cada día</h1><section class="steps">${[["wake", "Despertar a las " + o.wake], ["breath", "Un minuto de respiración"], ["frase", "Una frase estoica y su práctica"], ["aff", "Tres afirmaciones escritas"], ["tasks", "Tus tres tareas clave"], ["habits", "Tus hábitos y tu alimentación"], ["exam", "El examen nocturno de Séneca"]].map(([k, t]) => `<div class="step"><span class="ic">${IC[k]}</span><span class="tx"><b>${t}</b></span></div>`).join("")}</section><p class="sub" style="text-align:center">Cumple al menos 6 de 8 pasos y ese día cuenta para tu estatua.</p>` }
  app.innerHTML = `<div class="gate" style="justify-content:flex-start;gap:16px">${dots}${body}<button class="btn" id="onext" ${ok ? "" : "disabled"}>${btn}</button>${o.step ? `<button class="link" id="oback" style="text-align:center">Atrás</button>` : ""}</div>`;
  if ($("on")) $("on").oninput = e => o.name = e.target.value.trim();
  app.querySelectorAll("[data-w]").forEach(b => b.onclick = () => { o.wake = b.dataset.w; renderOnb(app) });
  if ($("ow")) $("ow").onchange = e => { o.wake = e.target.value || "05:00"; renderOnb(app) };
  app.querySelectorAll("[data-p]").forEach(b => b.onclick = () => { const id = b.dataset.p; if (o.picks.has(id)) o.picks.delete(id); else if (o.picks.size < 5) o.picks.add(id); renderOnb(app) });
  if ($("oback")) $("oback").onclick = () => { o.step--; renderOnb(app) };
  $("onext").onclick = async () => {
    if (o.step < N - 1) { o.step++; return renderOnb(app) }
    S.set = { ...S.set, v2: true, name: o.name, wake: o.wake, start: dayKey(0), fav: S.set.fav || [] };
    const old = S.habits.map(h => h.id);
    S.habits = HABITOS_ESTOICOS.filter(h => o.picks.has(h.id)).map((h, i) => ({ id: `${h.id}-${(S.uid || "demo").slice(0, 8)}-${Date.now().toString(36)}`, name: h.name, area: h.area, ord: i }));
    if (!DEMO && S.uid) {
      saveSet();
      if (old.length) write(() => sb.from("habits").update({ active: false }).in("id", old));
      write(() => sb.from("habits").insert(S.habits.map(h => ({ ...h, user_id: S.uid, active: true }))));
    }
    renderOnb.o = null; route(); setTimeout(() => toast("Bienvenido, " + (o.name || "estoico") + ". Mañana a las " + o.wake + "."), 300);
  };
}

/* ---------- arranque ---------- */
function demo() {
  S.uid = "demo"; S.ready = true; S.set = { v2: true, name: "Esteban", wake: "05:00", start: dayKey(-20), fav: [0, 6] };
  S.habits = HABITOS_ESTOICOS.slice(0, 5).map((h, i) => ({ ...h, ord: i }));
  for (let o = -20; o <= 0; o++) { const k = dayKey(o), good = o !== -6 && o !== -11 && o !== -2; S.days[k] = { done: Object.fromEntries(S.habits.slice(0, good ? 4 : 1).map(h => [h.id, true])) }; S.journal[k] = good || o === 0 ? { wake: o === 0 ? "05:04" : "05:0" + (Math.abs(o) % 9), breath: true, commit: true, aff: o === 0 ? ["Soy disciplinado aunque no tenga ganas.", "Hoy elijo la calma.", ""] : ["a", "b", "c"], tasks: [{ t: "Grabar el vídeo de Levo", done: o !== 0 }, { t: "Llamar a Sandra", done: o !== 0 }, { t: "Entrenar piernas", done: false }], meals: o === 0 ? { desayuno: "limpio" } : { desayuno: "limpio", comida: "limpio", cena: "regular" }, water: o === 0 ? 4 : 9, exam: o === 0 ? {} : { bien: "x" } } : { wake: "06:40" } }
  S.weighs = [[-21, 78.4], [-14, 77.9], [-7, 77.3], [0, 76.9]].map(([o, kg]) => ({ day: dayKey(o), kg })); S.bodyP = { height_cm: 178, weight_kg: 76.9, goal: "perder" };
}
const LV = (document.querySelector('meta[name="levo-version"]') || {}).content;
async function checkUpdate() { if (!LV || DEMO) return; try { const j = await (await fetch("version.json?t=" + Date.now(), { cache: "no-store" })).json(); if (j.v && j.v !== LV && !$("sheet")) location.reload() } catch (e) { } }
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { checkUpdate(); if (S.ready) route() } });
if ("serviceWorker" in navigator && !DEMO) navigator.serviceWorker.register("sw.js");
if (DEMO) {
  if (SHOT) document.documentElement.classList.add("shot");
  demo();
  if (SHOT === "onb") S.set.v2 = false;
  if (SHOT && ["estoa", "prog", "perfil"].includes(SHOT)) S.tab = SHOT;
  route();
  if (SHOT && SHEETS[SHOT]) setTimeout(() => SHOT === "ritual" ? startFlow() : openSheet(SHOT), 200);
  if (SHOT === "ritual") setTimeout(() => startFlow(), 200);
} else {
  bootCache();
  sb.auth.onAuthStateChange((_e, session) => { const was = S.uid; S.uid = session ? session.user.id : null; if (S.uid && S.uid !== was) load(); else if (!S.uid) { S.ready = false; route() } });
  setTimeout(checkUpdate, 2500);
}
