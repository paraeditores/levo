/* Levo · El Camino. Tu estatua late; el camino tiene ocho piedras y cada paso se sella manteniendo pulsado el corazón.
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
const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
const buzz = p => { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(p) } catch (e) { } };

const sb = window.supabase.createClient(window.MINI.SUPABASE_URL, window.MINI.SUPABASE_ANON_KEY);
const S = { uid: null, ready: false, tab: "hoy", set: {}, profileOutfit: {}, habits: [], days: {}, journal: {}, bodyP: null, weighs: [], fTab: "abiertas", resetArm: false, cur: null };
const set = () => S.set;
const START = () => S.set.start || dayKey(0);

/* ---------- utilidades ---------- */
function toast(t) { const el = $("status"); el.textContent = t; el.classList.add("in"); clearTimeout(toast._t); toast._t = setTimeout(() => el.classList.remove("in"), 2600) }
const J = (k = dayKey(0)) => (S.journal[k] = S.journal[k] || {});
const doneFor = k => (S.days[k] && S.days[k].done) || {};
const habFrac = k => S.habits.length ? S.habits.filter(h => doneFor(k)[h.id]).length / S.habits.length : 0;
const toMin = t => { const [h, m] = (t || "05:00").split(":").map(Number); return h * 60 + m };
const waterGoal = () => S.bodyP && S.bodyP.weight_kg ? Math.round(Math.min(4, Math.max(1.5, S.bodyP.weight_kg * .033)) * 4) : 10;
const fq = (k = dayKey(0)) => fraseSellada(k);
const quoteById = id => { if (typeof id === "number") id = "s" + id; const n = +String(id).slice(1), f = id[0] === "e" ? FRASES_EXITO[n] : FRASES[n]; return f ? { id, t: f.t, a: f.a, acc: f.acc || (PRACTICAS[f.p] || {}).hoy } : null };
const dayNum = () => Math.max(1, Math.round((new Date(dayKey(0) + "T12:00") - new Date(START() + "T12:00")) / 864e5) + 1);
const dateLabel = k => new Date(k + "T12:00").toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "").toUpperCase();
const HEART = id => `<svg viewBox="0 0 24 24" ${id ? `id="${id}"` : ""} aria-hidden="true"><path d="M12 21s-7.5-4.6-10-9.3C.3 8.4 2.3 4 6.4 4c2.3 0 3.9 1.3 5.6 3.4C13.7 5.3 15.3 4 17.6 4 21.7 4 23.7 8.4 22 11.7 19.5 16.4 12 21 12 21z"/></svg>`;

/* El camino: ocho pasos, en orden */
const ORDER = ["wake", "frase", "breath", "aff", "tasks", "habits", "food", "exam"];
const ROM = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const NAME = { wake: "Despertar", frase: "Tu frase", breath: "Respira", aff: "Afirma", tasks: "Tres batallas", habits: "Hábitos", food: "El templo", exam: "Examen" };
const WORD = { wake: "EN PIE", frase: "PACTO<br>SELLADO", breath: "CALMA", aff: "ERES<br>ESO", tasks: "BATALLA<br>GANADA", habits: "FORJADO", food: "TEMPLO", exam: "EXAMINADO" };
function steps(k) {
  const j = S.journal[k] || {}, aff = (j.aff || []).filter(s => s && s.trim()).length, tasks = (j.tasks || []).filter(t => t && t.t && t.t.trim()), tdone = tasks.filter(t => t.done).length, meals = ["desayuno", "comida", "cena"].filter(m => j.meals && j.meals[m]).length;
  return {
    wake: !!j.wake, frase: !!j.commit, breath: !!j.breath, aff: aff >= 3,
    tasks: tasks.length >= 1 && tdone >= Math.min(2, tasks.length), habits: S.habits.length ? habFrac(k) >= .6 : false,
    food: meals >= 3, exam: !!(j.exam && (j.exam.bien || j.exam.mejorar || j.exam.gracias)),
  };
}
const score = k => { const v = Object.values(steps(k)); return v.filter(Boolean).length / v.length };
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
  if (!$("sheet")) route();
}
function bootCache() { try { const c = JSON.parse(localStorage.getItem("levo2-cache") || "null"); if (c) { Object.assign(S, c, { ready: true }); route() } } catch (e) { } }

/* ---------- vistas ---------- */
const TABS = [["hoy", "Hoy"], ["frases", "Frases"], ["estatua", "Estatua"], ["yo", "Yo"]];
function route() {
  const app = $("app");
  if (!S.uid && !DEMO) { stopScene(); return renderGate(app) }
  if (!S.ready) return;
  if (!set().v2) { stopScene(); return renderOnb(app) }
  renderMain(app);
}
function renderMain(app) {
  if (!$("view")) app.innerHTML = `<main id="view"></main><nav class="tabbar" aria-label="Secciones">${TABS.map(([k, n]) => `<button data-tab="${k}">${n}</button>`).join("")}</nav>`;
  app.querySelectorAll("[data-tab]").forEach(b => { b.setAttribute("aria-selected", b.dataset.tab === S.tab); b.onclick = () => { S.tab = b.dataset.tab; S.cur = null; window.scrollTo(0, 0); renderMain(app) } });
  const v = $("view"); v.className = S.tab === "hoy" ? "camino" : "wrap";
  stopScene();
  ({ hoy: renderHoy, frases: renderFrases, estatua: renderEstatua, yo: renderYo })[S.tab](v);
}

/* ================= HOY · EL CAMINO ================= */
const SC = { raf: 0, bpm: 90, phase: 0, chev: 0, last: 0, flare: {}, hold: { on: false, t0: 0, p: 0, ms: 800, act: null }, done: [], cur: 0, won: false, n: 0, hinted: false };
function renderHoy(v) {
  const fz = faseDe(sculpted());
  v.innerHTML = `<div class="scene" id="scene">
    <div class="glow" id="glow"></div><svg id="road" role="img" aria-label="Tu camino de hoy: ocho piedras hasta tu estatua"></svg>
    <div class="hero" id="hero">${statueSVG(fz.i, set().name)}</div><div class="heart" id="heart"></div>
    <header class="chead"><div><p class="day">DÍA ${dayNum()}</p><p class="eyebrow" id="hsub">${dateLabel(dayKey(0))} · ${esc(fz.name)}</p></div>
      <div class="pulse"><p class="bpm">${HEART("hh")}<span id="bpm">90</span></p><p class="eyebrow" id="cnt"></p></div>${pushPill() ? `<div style="flex-basis:100%">${pushPill()}</div>` : ""}</header>
    <div class="ccard" id="ccard"></div>
    <div class="flash" id="flash"></div><div class="stamp" id="stamp"></div></div>`;
  if ($("pushBtn")) $("pushBtn").onclick = enablePush;
  $("road").addEventListener("click", e => { const el = e.target.closest(".st"); if (!el) return; S.cur = +el.dataset.i; drawCard() });
  drawCard(); startScene();
}
function pushPill() { const ok = "Notification" in window && Notification.permission === "granted"; return ok || DEMO ? "" : `<button class="pill" id="pushBtn">ACTIVAR AVISOS · 3 AL DÍA, NI UNO MÁS</button>` }
const curIdx = st => S.cur !== null && S.cur >= 0 ? S.cur : ORDER.findIndex(x => !st[x]);

/* Lo que dice la tarjeta del paso elegido y qué hace el corazón al mantenerlo */
function cardData(st) {
  const k = dayKey(0), j = J(), n = ORDER.filter(x => st[x]).length, cur = curIdx(st), q = fq(k), hr = new Date().getHours();
  const hint = isRitual(k) ? "DÍA ESCULPIDO · SIGUE SI QUIERES" : `${Math.max(1, 6 - n)} ${6 - n === 1 ? "PASO" : "PASOS"} PARA ESCULPIR HOY`;
  if (cur < 0) return { meta: "VIII / VIII", right: "DÍA ESCULPIDO", h: "Palabra cumplida", d: "Hiciste lo que dijiste. La piedra lo recuerda.", s: `MAÑANA ${set().wake || "05:00"} · TE ESPERA SELLADA UNA FRASE DE ${esc(fq(dayKey(1)).a.toUpperCase())}`, hold: "MANTÉN PARA<br>COMPARTIR", hint: "TU ESTATUA, EN TU HISTORIA", ms: 800, act: shareStatue };
  const key = ORDER[cur], done = st[key];
  const D = { meta: `PASO ${ROM[cur]} / VIII`, right: done ? "HECHO" : "", h: NAME[key], ms: 800, act: () => openSheet(key), hold: done ? "MANTÉN PARA<br>REVISAR" : "MANTÉN PARA<br>EMPEZAR", hint };
  const aff = (j.aff || []).filter(s => s && s.trim()), tasks = (j.tasks || []).filter(t => t && t.t && t.t.trim()), tdone = tasks.filter(t => t.done), meals = ["desayuno", "comida", "cena"].filter(m => j.meals && j.meals[m]).length;
  if (key === "wake") {
    const tgt = set().wake || "05:00", now = hhmm();
    if (done) Object.assign(D, { d: `Te levantaste a las ${j.wake}. ${toMin(j.wake) <= toMin(tgt) + 15 ? "Victoria matinal." : `Mañana, a las ${tgt}.`}`, hold: "MANTÉN PARA<br>CAMBIAR LA HORA" });
    else if (toMin(now) <= toMin(tgt) + 180 && toMin(now) >= toMin(tgt) - 120) Object.assign(D, { right: `OBJETIVO ${tgt}`, d: `Son las ${now}. En pie a la primera: tu primera victoria del día.`, hold: "MANTÉN · ME HE<br>LEVANTADO", ms: 1300, act: withCelebrate(() => { J().wake = hhmm(); saveJ() }) });
    else Object.assign(D, { right: `OBJETIVO ${tgt}`, d: "¿A qué hora te levantaste hoy? Apúntalo con honestidad.", hold: "MANTÉN PARA<br>APUNTARLO" });
  } else if (key === "frase") {
    if (!j.open) Object.assign(D, { h: "Frase sellada", right: "SELLADA", d: `Hoy te espera una frase de ${esc(q.a)} y una acción para ti.`, s: "SOLO SE ABRE UNA VEZ AL DÍA", hold: "MANTÉN PARA<br>ROMPER EL SELLO", hint: "LA LEERÁS SOLO TÚ", ms: 1300, act: openSeal });
    else {
      Object.assign(D, { d: `«${esc(q.t)}»`, s: `— ${esc(q.a.toUpperCase())}`, acc: q.acc });
      if (!j.commit) Object.assign(D, { right: "ACCIÓN DE HOY", hold: "MANTÉN PARA<br>COMPROMETERTE", ms: 1300, act: withCelebrate(() => { J().commit = true; saveJ() }) });
      else if (!j.practiced) Object.assign(D, { right: "COMPROMETIDO", hold: "MANTÉN · YA HICE<br>MI ACCIÓN", act: () => { const x = J(); x.practiced = true; saveJ(); strike("ACCIÓN<br>HECHA"); drawCard() } });
      else Object.assign(D, { right: "ACCIÓN HECHA", hold: "MANTÉN PARA<br>VER TUS FRASES", act: () => { S.tab = "frases"; S.fTab = "abiertas"; renderMain($("app")) } });
    }
  } else if (key === "breath") Object.assign(D, { right: done ? "HECHO" : "1 MIN", d: done ? "Un minuto de calma. La mente, en su sitio." : "Un minuto en caja: cuatro dentro, cuatro arriba, cuatro fuera, cuatro abajo." });
  else if (key === "aff") Object.assign(D, { right: done ? "HECHO" : `${aff.length}/3`, d: done ? `«${esc(aff[0])}»` : "Tres frases de la persona que estás esculpiendo." });
  else if (key === "tasks") {
    const next = tasks.find(t => !t.done);
    Object.assign(D, { right: tasks.length ? `${tdone.length}/${tasks.length}` : "0/3", d: !tasks.length ? "Las tres tareas que harán de hoy un buen día. Ni una más." : next ? `Ahora: «${esc(next.t)}»` : "Las tres batallas, ganadas." });
  } else if (key === "habits") {
    const left = S.habits.filter(h => !doneFor(k)[h.id]);
    Object.assign(D, { right: `${S.habits.length - left.length}/${S.habits.length}`, d: !S.habits.length ? "Elige los hábitos que forjan tu carácter." : left.length ? `Te falta: ${esc(left.map(h => h.name).join(", "))}.` : "Todos hechos. Así se forja el carácter." });
  } else if (key === "food") Object.assign(D, { right: `${meals}/3`, d: `${meals} de 3 comidas apuntadas · ${j.water || 0} de ${waterGoal()} vasos de agua.` });
  else if (key === "exam") Object.assign(D, { right: done ? "HECHO" : hr >= 20 ? "ES LA HORA" : "ESTA NOCHE", d: done ? `«${esc(j.exam.bien || j.exam.gracias || j.exam.mejorar)}»` : "¿Qué hice bien? ¿Qué puedo mejorar? ¿Qué agradezco?" });
  return D;
}
function drawCard() {
  const c = $("ccard"); if (!c) return;
  const st = steps(dayKey(0)); SC.done = ORDER.map(x => st[x]); SC.n = SC.done.filter(Boolean).length; SC.won = SC.n === 8; SC.cur = curIdx(st);
  $("scene").classList.toggle("won", SC.won); $("cnt").textContent = `PULSO · ${SC.n}/8`;
  const d = cardData(st); SC.hold.ms = d.ms; SC.hold.act = d.act; SC.hold.p = 0; SC.hold.on = false;
  c.innerHTML = `<div class="meta"><span>${d.meta}</span><b>${d.right || ""}</b></div><h2>${d.h}</h2><p class="d">${d.d || ""}</p>${d.s ? `<p class="src">${d.s}</p>` : ""}${d.acc ? `<p class="acc"><b>ACCIÓN ·</b> ${esc(d.acc)}</p>` : ""}
    <div class="act"><button id="hold" aria-label="${d.hold.replace(/<br>/g, " ").toLowerCase()}"><svg class="rg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="37" fill="none" stroke="#ffffff14" stroke-width="2"/><circle id="arc" cx="40" cy="40" r="37" fill="none" stroke="var(--red)" stroke-width="3" stroke-linecap="round" stroke-dasharray="232.5" stroke-dashoffset="232.5"/></svg>${HEART("hz").replace("<svg", '<svg class="hz"')}</button><div class="hl">${d.hold}<small>${d.hint}</small></div></div>`;
  const hb = $("hold");
  hb.addEventListener("pointerdown", e => { e.preventDefault(); SC.hold.on = true; SC.hold.t0 = performance.now(); try { hb.setPointerCapture(e.pointerId) } catch (_) { } });
  hb.addEventListener("pointerup", () => { if (SC.hold.on && SC.hold.p < .25 && !SC.hinted) { SC.hinted = true; toast("Mantén pulsado el corazón") } SC.hold.on = false });
  ["pointercancel", "lostpointercapture"].forEach(ev => hb.addEventListener(ev, () => SC.hold.on = false));
  hb.addEventListener("contextmenu", e => e.preventDefault());
  hb.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); SC.hold.act && SC.hold.act() } });
  requestAnimationFrame(sceneLayout);
}
function openSeal() { J().open = true; saveJ(); strike("ABIERTA"); drawCard(); $("ccard").animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 600, easing: "ease-out" }) }

/* Celebrar lo que acaba de cumplirse: golpe de cincel, sello, día esculpido y, si toca, nueva forma de la estatua */
const snapshot = () => { const k = dayKey(0); return { st: steps(k), rit: isRitual(k), sc: sculpted() } };
const withCelebrate = fn => () => { const p = snapshot(); fn(); S.cur = null; drawCard(); celebrate(p) };
function celebrate(p) {
  if (S.tab !== "hoy" || !$("scene")) return;
  const now = snapshot(), q = [];
  ORDER.forEach((k, i) => { if (!p.st[k] && now.st[k]) q.push(() => { SC.flare[i] = performance.now(); strike(WORD[k]) }) });
  if (!p.rit && now.rit) q.push(() => strike("DÍA<br>ESCULPIDO", true));
  if (faseDe(now.sc).i > faseDe(p.sc).i) q.push(() => evolve(faseDe(now.sc)));
  if (q.length) { S.cur = null; drawCard() }
  q.forEach((fn, i) => setTimeout(fn, 150 + i * 1200));
}
function evolve(fz) {
  const h = $("hero"); if (!h) return;
  h.animate([{ opacity: 1, filter: "brightness(1)" }, { opacity: .2, filter: "brightness(3)" }], { duration: 450, easing: "ease-in" }).onfinish = () => {
    h.innerHTML = statueSVG(fz.i, set().name); $("hsub").textContent = `NUEVA FORMA · ${fz.name.toUpperCase()}`;
    h.animate([{ opacity: .2, filter: "brightness(3)" }, { opacity: 1, filter: "brightness(1)" }], { duration: 900, easing: "ease-out" });
    strike(fz.name.toUpperCase().replace(" ", "<br>"), true);
  };
}
function strike(word, big) {
  const sc = $("scene"); if (!sc) return;
  const cx = SC.SX, cy = SC.CY;
  for (let i = 0; i < (big ? 34 : 18); i++) {
    const c = document.createElement("div"), sz = 3 + Math.random() * 6, a = Math.random() * Math.PI * 2, v = 60 + Math.random() * (big ? 200 : 130);
    c.className = "chip"; c.style.cssText = `left:${cx - sz / 2 + (Math.random() - .5) * 40}px;top:${cy - sz / 2 + (Math.random() - .5) * 60}px;width:${sz}px;height:${sz}px;background:${Math.random() < .3 ? "#cfc7b9" : "#ece6db"}`;
    sc.appendChild(c);
    c.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 }, { transform: `translate(${Math.cos(a) * v}px,${Math.sin(a) * v * .7 + 90}px) rotate(${(Math.random() - .5) * 720}deg)`, opacity: 0 }], { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.15,.7,.35,1)" }).onfinish = () => c.remove();
  }
  if (!RM) sc.animate([{ transform: "translate(0,0)" }, { transform: "translate(-5px,3px)" }, { transform: "translate(4px,-3px)" }, { transform: "translate(-2px,1px)" }, { transform: "translate(0,0)" }], { duration: 300 });
  $("flash").animate([{ opacity: big ? .9 : .6 }, { opacity: 0 }], { duration: big ? 1200 : 650, easing: "ease-out" });
  ripple(cx, cy, true); setTimeout(() => ripple(cx, cy, true), 180);
  const st = $("stamp"); st.innerHTML = word; st.style.fontSize = big ? "64px" : "50px";
  st.animate([{ transform: "translate(-50%,-50%) scale(2.4) rotate(-9deg)", opacity: 0 }, { transform: "translate(-50%,-50%) scale(1) rotate(-6deg)", opacity: 1, offset: .18 }, { transform: "translate(-50%,-50%) scale(1) rotate(-6deg)", opacity: 1, offset: .78 }, { transform: "translate(-50%,-60%) scale(.97) rotate(-6deg)", opacity: 0 }], { duration: big ? 2600 : 1500, easing: "cubic-bezier(.2,.8,.3,1)" });
  buzz(big ? [30, 60, 30, 60, 80] : [40]);
}
function ripple(cx, cy, strong) {
  const sc = $("scene"); if (!sc || RM) return;
  const r = document.createElement("div"); r.className = "ring"; r.style.left = cx + "px"; r.style.top = cy + "px"; sc.appendChild(r);
  r.animate([{ transform: "scale(.45)", opacity: strong ? .85 : .5 }, { transform: `scale(${strong ? 3.4 : 2.6})`, opacity: 0 }], { duration: strong ? 1500 : 1700, easing: "cubic-bezier(.2,.6,.3,1)" }).onfinish = () => r.remove();
}

/* Geometría de la escena: estatua arriba, camino en perspectiva hacia ella, tarjeta abajo */
function sceneLayout() {
  const sc = $("scene"); if (!sc) return;
  const r = sc.getBoundingClientRect(); SC.W = r.width; SC.H = r.height;
  const hb = document.querySelector(".chead").getBoundingClientRect().bottom - r.top;
  SC.SW = Math.min(220, SC.H * .28, SC.W * .55); const sh = SC.SW * 1.3; SC.SY = hb + 4; SC.SX = SC.W / 2;
  const hero = $("hero"); hero.style.width = SC.SW + "px"; hero.style.marginLeft = -SC.SW / 2 + "px"; hero.style.top = SC.SY + "px";
  SC.HY = SC.SY + sh * (250 / 260); SC.CY = SC.SY + sh * (150 / 260);
  const m = document.querySelector("#ccard .meta"); SC.CARD = (m ? m.getBoundingClientRect().top : r.bottom) - r.top - 10;
  for (const id of ["heart", "glow"]) { $(id).style.left = SC.SX + "px"; $(id).style.top = SC.CY + "px" }
  $("stamp").style.top = (SC.SY + sh * .42) + "px";
  $("road").setAttribute("viewBox", `0 0 ${SC.W} ${SC.H}`);
}
addEventListener("resize", () => sceneLayout());
const beatCurve = x => Math.exp(-Math.pow((x - .04) / .045, 2)) + .62 * Math.exp(-Math.pow((x - .27) / .05, 2));
const KP = 2.3, fp = t => t * (1 + KP) / (1 + KP * t), fpInv = s => s / (1 + KP - KP * s);
function road(b, now) {
  const { W, H, HY, SX, SW } = SC, red = SC.won ? "#f0d6a8" : "#ff3b1f", glow = SC.won ? "240,214,168" : "255,59,31";
  const by = H + 30, wN = Math.min(W * .95, 380), wF = SW * .2, yAt = s => by - (by - HY) * s, wAt = s => wN + (wF - wN) * s;
  const s0 = (by - (SC.CARD + 30)) / (by - HY), t0 = fpInv(Math.max(.05, Math.min(.8, s0))), t1 = fpInv(.9);
  let g = `<defs><linearGradient id="rf" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="rgb(${glow})" stop-opacity=".10"/><stop offset="1" stop-color="rgb(${glow})" stop-opacity="0"/></linearGradient></defs>
    <path d="M${SX - wN / 2} ${by}L${SX - wF / 2} ${HY}H${SX + wF / 2}L${SX + wN / 2} ${by}Z" fill="url(#rf)"/>
    <path d="M${SX - wN / 2} ${by}L${SX - wF / 2} ${HY}M${SX + wN / 2} ${by}L${SX + wF / 2} ${HY}" stroke="#efe9df" stroke-opacity=".16" stroke-width="1"/><path d="M0 ${HY + .5}H${W}" stroke="#efe9df" stroke-opacity=".08"/>`;
  for (let i = 0, N = 14; i < N; i++) {
    const t = ((i / N) + SC.chev) % 1, s = fp(t), y = yAt(s), w = wAt(s), hw = w * .14, hh = w * .055, op = (SC.won ? .5 : .42) * Math.pow(1 - s, .7) * Math.min(1, t * 6);
    g += `<path d="M${SX - hw} ${y + hh}L${SX} ${y}L${SX + hw} ${y + hh}" fill="none" stroke="#efe9df" stroke-opacity="${op.toFixed(3)}" stroke-width="${Math.max(.8, w * .012).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  let lastLy = -1e9;
  for (let i = 7; i >= 0; i--) {
    const t = t0 + (t1 - t0) * (i / 7), s = fp(t), y = yAt(s), w = wAt(s), rx = w * .3, ry = Math.max(2.5, w * .07), sw = Math.max(1.2, w * .012).toFixed(2);
    if (SC.done[i]) g += `<ellipse cx="${SX}" cy="${y}" rx="${rx * 1.5}" ry="${ry * 2}" fill="${red}" opacity="${(.14 + .1 * b).toFixed(3)}"/><ellipse cx="${SX}" cy="${y}" rx="${rx}" ry="${ry}" fill="${red}"/>`;
    else if (i === SC.cur) g += `<ellipse cx="${SX}" cy="${y}" rx="${rx * (1 + .12 * b)}" ry="${ry * (1 + .12 * b)}" fill="${red}" fill-opacity=".1" stroke="${red}" stroke-opacity="${(.55 + .45 * b).toFixed(3)}" stroke-width="${sw}"/>`;
    else g += `<ellipse cx="${SX}" cy="${y}" rx="${rx}" ry="${ry}" fill="none" stroke="#efe9df" stroke-opacity=".22" stroke-width="1"/>`;
    if (i === SC.cur && SC.done[i]) g += `<ellipse cx="${SX}" cy="${y}" rx="${rx * 1.25}" ry="${ry * 1.5}" fill="none" stroke="#efe9df" stroke-opacity="${(.5 + .4 * b).toFixed(3)}" stroke-width="${sw}"/>`;
    const fl = SC.flare[i] ? (now - SC.flare[i]) / 1100 : 2;
    if (fl < 1) g += `<ellipse cx="${SX}" cy="${y}" rx="${rx * (1 + fl * 2.2)}" ry="${ry * (1 + fl * 2.2)}" fill="none" stroke="${red}" stroke-opacity="${(1 - fl).toFixed(3)}" stroke-width="2"/>`;
    const fs = 8 + w * .035, showL = y - lastLy > fs * 1.05 || i === SC.cur;
    if (showL) { lastLy = y; g += `<text x="${SX - rx - 8 - w * .02}" y="${y + fs * .35}" text-anchor="end" font-family="JetBrains Mono, monospace" font-weight="700" font-size="${fs.toFixed(1)}" fill="${SC.done[i] ? red : i === SC.cur ? "#efe9df" : "#7d776d"}">${ROM[i]}</text>` }
    g += `<ellipse class="st" data-i="${i}" cx="${SX}" cy="${y}" rx="${Math.max(rx * 1.6, 28)}" ry="${Math.max(ry * 3, 15)}" fill="transparent"><title>${ROM[i]} · ${NAME[ORDER[i]]}</title></ellipse>`;
  }
  $("road").innerHTML = g;
}
function frame(now) {
  if (!$("scene")) { SC.raf = 0; return }
  const dt = Math.min(.05, (now - (SC.last || now)) / 1000), h = SC.hold; SC.last = now;
  if (h.on) { h.p = Math.min(1, (now - h.t0) / h.ms); if (h.p >= 1) { h.on = false; h.p = 0; const a = h.act; if (a) setTimeout(a, 0) } } else h.p = Math.max(0, h.p - dt * 2.5);
  const arc = $("arc"); if (arc) arc.style.strokeDashoffset = (232.5 * (1 - h.p)).toFixed(1);
  const base = SC.won ? 48 : 96 - SC.n * 6, target = base + (158 - base) * h.p * h.p;
  SC.bpm += (target - SC.bpm) * Math.min(1, dt * 4);
  const prev = SC.phase; SC.phase += dt * SC.bpm / 60;
  const b = RM ? .35 : beatCurve(SC.phase % 1);
  if (Math.floor(SC.phase) !== Math.floor(prev)) { ripple(SC.SX, SC.CY, h.p > .2); if (h.p > .2) buzz(12) }
  const lv = .45 + SC.n * .06;
  $("glow").style.transform = `scale(${(1 + .09 * b + .25 * h.p).toFixed(4)})`; $("glow").style.opacity = Math.min(1, lv + .4 * b).toFixed(3);
  $("heart").style.transform = `scale(${(1 + .7 * b + h.p).toFixed(3)})`; $("heart").style.opacity = Math.min(1, .55 + .05 * SC.n + .4 * b).toFixed(3);
  $("hero").style.transform = `scale(${(1 + .012 * b).toFixed(4)})`;
  const hz = $("hz"); $("hh").style.transform = `scale(${(1 + .28 * b).toFixed(3)})`; if (hz) hz.style.transform = `scale(${(1 + .28 * b + .15 * h.p).toFixed(3)})`;
  $("bpm").textContent = Math.round(SC.bpm);
  if (!RM) SC.chev = (SC.chev + dt * (.05 + .07 * b) * (SC.bpm / 60)) % 1;
  road(b, now);
  SC.raf = requestAnimationFrame(frame);
}
function startScene() { sceneLayout(); SC.last = 0; if (!SC.raf) SC.raf = requestAnimationFrame(frame); if (document.fonts) document.fonts.ready.then(sceneLayout) }
function stopScene() { if (SC.raf) cancelAnimationFrame(SC.raf); SC.raf = 0 }

/* ---------- hojas: un paso cada vez ---------- */
let pending = null;
function closeSheet() { const s = $("sheet"); if (s) s.remove(); document.body.classList.remove("lock"); clearInterval(openSheet._iv); const p = pending; pending = null; route(); if (p) setTimeout(() => celebrate(p), 120) }
function openSheet(key) {
  if (!pending && key !== "body") pending = snapshot();
  stopScene();
  let s = $("sheet"); if (!s) { s = document.createElement("div"); s.id = "sheet"; s.className = "sheet"; s.setAttribute("role", "dialog"); document.body.append(s) }
  document.body.classList.add("lock"); clearInterval(openSheet._iv);
  const i = ORDER.indexOf(key);
  s.innerHTML = `<div class="sheet-in"><div class="sheet-head"><p class="eyebrow ${i >= 0 ? "r" : ""}">${i >= 0 ? `Paso ${ROM[i]} / VIII · ${NAME[key]}` : ""}</p><button class="x" id="sx" aria-label="Cerrar">×</button></div><div class="sheet-body" id="sb"></div><div class="sheet-foot" id="sf"></div></div>`;
  $("sx").onclick = closeSheet;
  SHEETS[key]($("sb"), $("sf"));
}
const footBtn = (f, label, fn, cls = "btn") => { const b = document.createElement("button"); b.className = cls; b.textContent = label; b.onclick = fn; f.append(b); return b };
const SHEETS = {
  wake(b, f) {
    const j = J(), tgt = set().wake || "05:00";
    b.classList.add("center");
    b.innerHTML = `<p class="eyebrow r">Objetivo ${tgt}</p><p class="big-time" id="clk"></p><p class="sub" style="max-width:30ch">«Al amanecer, cuando te cueste levantarte, ten presente: me levanto para hacer el trabajo de un ser humano.»</p><p class="eyebrow">Marco Aurelio · Meditaciones V, 1</p>
      <label class="fields" style="width:100%;max-width:260px;margin-top:10px"><span>¿A qué hora te levantaste?</span><input id="wt" type="time" value="${j.wake || hhmm()}"></label>`;
    const tick = () => { const c = $("clk"); if (c) c.textContent = hhmm() }; tick(); openSheet._iv = setInterval(tick, 1000);
    footBtn(f, "Guardar", () => { j.wake = $("wt").value || hhmm(); saveJ(); closeSheet() });
  },
  breath(b, f) {
    const j = J(); b.classList.add("center");
    b.innerHTML = `<h2 class="title">Respira</h2><p class="sub">Respiración en caja: cuatro segundos cada fase.</p><div class="breath"><span class="ringb"></span><span class="orb" id="orb"></span><div><b id="ph">Prepárate</b><small id="cd">60 S</small></div></div>`;
    const phases = [["Inhala", 1.9], ["Mantén", 1.9], ["Exhala", 1], ["Mantén", 1]]; let t0 = null, done = false;
    const btn = footBtn(f, "Empezar", () => { if (done) return closeSheet(); t0 = Date.now(); btn.textContent = "Respirando…"; btn.disabled = true; skip.textContent = "Terminar antes" });
    const skip = footBtn(f, "Cerrar", () => { if (t0 && Date.now() - t0 > 30e3) { j.breath = true; saveJ() } closeSheet() }, "btn ghost");
    openSheet._iv = setInterval(() => {
      if (!t0) return; const el = (Date.now() - t0) / 1000, left = Math.max(0, 64 - el), i = Math.floor(el / 4) % 4;
      $("ph").textContent = left <= 0 ? "Hecho" : phases[i][0]; $("cd").textContent = left <= 0 ? "MENTE EN CALMA" : `${Math.ceil(left)} S`; $("orb").style.transform = `scale(${left <= 0 ? 1.4 : phases[i][1]})`;
      if (left <= 0 && !done) { done = true; j.breath = true; saveJ(); btn.disabled = false; btn.textContent = "Listo"; skip.hidden = true; clearInterval(openSheet._iv) }
    }, 200);
  },
  aff(b, f) {
    const j = J(); j.aff = j.aff || ["", "", ""]; const prev = S.journal[dayKey(-1)] && S.journal[dayKey(-1)].aff;
    const ph = ["Yo soy…", "Hoy elijo…", "Me comprometo a…"];
    b.innerHTML = `<h2 class="title">¿Quién eliges ser hoy?</h2><p class="sub">Escríbelas cada mañana. Escribirlas es la práctica.</p>
      <div class="fields">${[0, 1, 2].map(i => `<textarea id="af${i}" rows="2" placeholder="${ph[i]}">${esc(j.aff[i] || "")}</textarea>`).join("")}</div>
      ${prev && prev.some(Boolean) ? `<button class="link" id="prevAff" style="text-align:left">Usar las de ayer</button>` : ""}
      <p class="eyebrow">Ideas</p><div class="sugs">${AFIRMACIONES.slice(0, 6).map(a => `<button data-a="${esc(a)}">${esc(a)}</button>`).join("")}</div>`;
    [0, 1, 2].forEach(i => $("af" + i).oninput = e => { j.aff[i] = e.target.value; saveJ() });
    b.querySelectorAll("[data-a]").forEach(x => x.onclick = () => { const i = j.aff.findIndex(s => !s || !s.trim()); if (i < 0) return; j.aff[i] = x.dataset.a; $("af" + i).value = x.dataset.a; saveJ() });
    if ($("prevAff")) $("prevAff").onclick = () => { j.aff = [...prev]; [0, 1, 2].forEach(i => $("af" + i).value = j.aff[i] || ""); saveJ() };
    footBtn(f, "Sellar", closeSheet);
  },
  tasks(b, f) {
    const j = J(); j.tasks = j.tasks || [{ t: "", done: false }, { t: "", done: false }, { t: "", done: false }];
    b.innerHTML = `<h2 class="title">Tres batallas</h2><p class="sub">Si solo hicieras tres cosas hoy, ¿cuáles moverían tu vida?</p>
      <div class="fields">${j.tasks.map((t, i) => `<div class="task"><button class="ck ${t.done ? "on" : ""}" data-ck="${i}" aria-label="Hecha">✓</button><input id="tk${i}" placeholder="Batalla ${ROM[i]}" value="${esc(t.t)}"></div>`).join("")}</div>`;
    j.tasks.forEach((t, i) => $("tk" + i).oninput = e => { j.tasks[i].t = e.target.value; saveJ() });
    b.querySelectorAll("[data-ck]").forEach(x => x.onclick = () => { const t = j.tasks[+x.dataset.ck]; if (!t.t.trim()) return toast("Escribe primero la tarea."); t.done = !t.done; x.classList.toggle("on", t.done); saveJ() });
    footBtn(f, "Listo", closeSheet);
  },
  habits(b, f) {
    const draw = () => {
      const k = dayKey(0);
      b.innerHTML = `<h2 class="title">Hábitos</h2><p class="sub">Somos lo que hacemos cada día.</p>
        <div class="fields">${S.habits.map(h => `<button class="hab ${doneFor(k)[h.id] ? "on" : ""}" data-h="${h.id}"><span class="ck ${doneFor(k)[h.id] ? "on" : ""}">✓</span><span>${esc(h.name)}</span><span class="rm" data-rm="${h.id}" role="button" aria-label="Quitar">Quitar</span></button>`).join("") || `<p class="sub">Aún no tienes hábitos.</p>`}</div>
        <div class="task"><input id="newHab" placeholder="Nuevo hábito (ej.: 20 flexiones)"><button class="link" id="addHab">Añadir</button></div>`;
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
      b.innerHTML = `<h2 class="title">El templo</h2><p class="sub">Sin contar calorías: con honestidad.</p>
        ${["desayuno", "comida", "cena"].map(m => `<div class="meal"><b>${m}</b><div class="seg3">${[["limpio", "Limpio"], ["regular", "Regular"], ["exceso", "Me pasé"]].map(([k, n]) => `<button data-m="${m}" data-v="${k}" class="${j.meals[m] === k ? "on" : ""}">${n}</button>`).join("")}</div></div>`).join("")}
        <div class="water"><div><p class="eyebrow">Agua</p><div class="n">${w}<span> / ${goal} VASOS</span></div><div class="glasses">${Array.from({ length: goal }, (_, i) => `<i class="${i < w ? "on" : ""}"></i>`).join("")}</div></div><div class="pm"><button id="wm" aria-label="Quitar un vaso">−</button><button id="wp" aria-label="Añadir un vaso">+</button></div></div>`;
      b.querySelectorAll("[data-m]").forEach(x => x.onclick = () => { j.meals[x.dataset.m] = j.meals[x.dataset.m] === x.dataset.v ? undefined : x.dataset.v; saveJ(); draw() });
      $("wp").onclick = () => { j.water = (j.water || 0) + 1; saveJ(); draw() }; $("wm").onclick = () => { j.water = Math.max(0, (j.water || 0) - 1); saveJ(); draw() };
    };
    draw(); footBtn(f, "Listo", closeSheet);
  },
  exam(b, f) {
    const j = J(); j.exam = j.exam || {}; const q = fq();
    b.innerHTML = `<h2 class="title">Examen nocturno</h2><p class="sub">«Cada noche examinaré mi día.» — Séneca</p>
      ${j.open ? `<div class="card" style="display:grid;gap:10px"><p class="eyebrow r">Tu acción de hoy</p><p class="sub" style="font-size:18px">${esc(q.acc)}</p><div class="seg3" style="grid-template-columns:1fr 1fr"><button id="py" class="${j.practiced ? "on" : ""}">La hice</button><button id="pn" class="${j.practiced === false ? "on" : ""}">Todavía no</button></div></div>` : ""}
      <div class="fields"><label>¿Qué hice bien?<textarea id="e1" rows="2">${esc(j.exam.bien || "")}</textarea></label><label>¿Qué puedo mejorar?<textarea id="e2" rows="2">${esc(j.exam.mejorar || "")}</textarea></label><label>¿Qué agradezco?<textarea id="e3" rows="2">${esc(j.exam.gracias || "")}</textarea></label></div>`;
    if ($("py")) { $("py").onclick = () => { j.practiced = true; j.commit = true; saveJ(); $("py").classList.add("on"); $("pn").classList.remove("on") }; $("pn").onclick = () => { j.practiced = false; saveJ(); $("pn").classList.add("on"); $("py").classList.remove("on") } }
    [["e1", "bien"], ["e2", "mejorar"], ["e3", "gracias"]].forEach(([id, k]) => $(id).oninput = e => { j.exam[k] = e.target.value; saveJ() });
    footBtn(f, "Sellar el día", closeSheet);
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

/* ================= FRASES: tu biblioteca ================= */
function openedDays() { const out = []; for (let o = 0; dayKey(o) >= START() && o > -800; o--) { const k = dayKey(o); if (S.journal[k] && S.journal[k].open) out.push(k) } return out }
const sealedCard = (when, txt, note, go) => `<${go ? "button" : "article"} class="sealed" ${go ? 'data-go="hoy"' : ""}><span class="seal">L</span><div><p class="eyebrow r">${when} · Sellada</p><p class="sq">${txt}</p><p class="eyebrow">${note}</p></div></${go ? "button" : "article"}>`;
function renderFrases(v) {
  const fav = (set().fav || []).map(x => typeof x === "number" ? "s" + x : x), opened = openedDays(), total = FRASES.length + FRASES_EXITO.length, tom = fq(dayKey(1));
  const qc = (q, date) => `<article class="qcard">${date ? `<p class="eyebrow">${date}</p>` : ""}<p class="q">«${esc(q.t)}»</p><p class="eyebrow">— ${esc(q.a)}</p>${q.acc ? `<p class="acc"><b>ACCIÓN ·</b> ${esc(q.acc)}</p>` : ""}<button class="fav ${fav.includes(q.id) ? "on" : ""}" data-fav="${q.id}" aria-label="Guardar">${fav.includes(q.id) ? "★" : "☆"}</button></article>`;
  let list = "";
  if (S.fTab === "abiertas") list = sealedCard("Mañana", `Una frase de ${esc(tom.a)}.`, `Se abre mañana desde las ${set().wake || "05:00"}`) + (J().open ? "" : sealedCard("Hoy", `Una frase de ${esc(fq().a)} te espera.`, "Toca para ir a tu camino", true)) + (opened.map(k => qc(fq(k), dateLabel(k))).join("") || "");
  else if (S.fTab === "practicas") list = Object.values(PRACTICAS).map(p => `<article class="pcard"><p class="eyebrow r">${esc(p.by)}</p><h3>${esc(p.name)}</h3><p class="sub">${esc(p.why)}</p><p class="acc"><b>PARA HOY ·</b> ${esc(p.hoy)}</p></article>`).join("");
  else list = fav.map(quoteById).filter(Boolean).map(q => qc(q)).join("") || `<p class="sub">Guarda con ☆ las frases que quieras releer.</p>`;
  v.innerHTML = `<header><p class="eyebrow r">Tu biblioteca</p><h1 class="title" style="font-size:64px">Frases</h1><p class="sub" style="margin-top:8px">${opened.length} de ${total} abiertas. Cada mañana se abre una nueva, solo para ti.</p></header>
    <div class="seg" role="tablist">${[["abiertas", "Abiertas"], ["practicas", "Prácticas"], ["favs", "Guardadas"]].map(([k, n]) => `<button role="tab" data-e="${k}" aria-selected="${S.fTab === k}">${n}</button>`).join("")}</div>${list}`;
  v.querySelectorAll("[data-e]").forEach(b => b.onclick = () => { S.fTab = b.dataset.e; renderFrases(v) });
  v.querySelectorAll("[data-go]").forEach(b => b.onclick = () => { S.tab = "hoy"; S.cur = 1; renderMain($("app")) });
  v.querySelectorAll("[data-fav]").forEach(b => b.onclick = () => { const id = b.dataset.fav, s = new Set(fav); s.has(id) ? s.delete(id) : s.add(id); S.set.fav = [...s]; saveSet(); renderFrases(v) });
}

/* ================= ESTATUA ================= */
function renderEstatua(v) {
  const n = sculpted(), fz = faseDe(n), nx = fz.next, prevAt = FASES[fz.i][0], pct = nx ? (n - prevAt) / (nx[0] - prevAt) : 1;
  const cal = [], start = new Date(); start.setDate(start.getDate() - 34); const off = (start.getDay() + 6) % 7; start.setDate(start.getDate() - off);
  for (let i = 0; i < 35 + off && cal.length < 42; i++) { const d = new Date(start); d.setDate(start.getDate() + i); if (d > new Date()) break; const k = fmt(d), s = k >= START() ? score(k) : 0; cal.push(`<i class="${k === dayKey(0) ? "today" : ""}" style="${s ? `background:color-mix(in srgb,var(--red) ${Math.round(12 + s * 80)}%,var(--s2));color:${s >= .75 ? "#0b0b0b" : "var(--fg)"}` : ""}" title="${k}">${d.getDate()}</i>`) }
  const w = S.weighs.slice(-10);
  v.innerHTML = `<header><p class="eyebrow r">Tu estatua · Fase ${ROM[fz.i]} / VIII</p><h1 class="title" style="font-size:60px">${esc(fz.name)}</h1><p class="sub" style="margin-top:8px">${esc(fz.txt)}</p></header>
    <section class="statue"><div class="sglow"></div><div class="svgw">${statueSVG(fz.i, set().name)}</div></section>
    ${nx ? `<div><div class="bar"><b style="width:${Math.round(pct * 100)}%"></b></div><p class="small" style="margin-top:10px">Faltan ${nx[0] - n} ${nx[0] - n === 1 ? "día" : "días"} de ritual para «${esc(nx[1])}»</p></div>` : `<p class="small">Obra terminada. Cuídala cada día.</p>`}
    <div class="track">${FASES.map((f, i) => `<div class="tk ${i < fz.i ? "done" : i === fz.i ? "now" : ""}" title="${esc(f[1])}"><b>${ROM[i]}</b><small>${f[0]}</small></div>`).join("")}</div>
    <button class="btn ghost" id="shareStatue">Compartir mi estatua</button>
    <div class="stats"><div class="stat"><b>${streak()}</b><small>Días seguidos de ritual</small></div><div class="stat"><b>${wakeStreak()}</b><small>En pie a las ${set().wake || "05:00"}</small></div><div class="stat"><b>${n}</b><small>Días esculpidos</small></div></div>
    <section class="card"><p class="eyebrow" style="margin-bottom:12px">Últimas semanas</p><div class="cal">${["L", "M", "X", "J", "V", "S", "D"].map(d => `<span class="h">${d}</span>`).join("")}${cal.join("")}</div><p class="sub" style="font-size:16px;margin-top:12px">Un día queda esculpido cuando cumples al menos 6 de los 8 pasos.</p></section>
    <section class="card" style="display:grid;gap:10px"><p class="eyebrow">Tu cuerpo</p>${w.length ? `<p class="kg">${String(w[w.length - 1].kg).replace(".", ",")} KG</p>${w.length > 1 ? sparkline(w) : ""}` : `<p class="sub">Registra tu peso una vez por semana para ver tu evolución.</p>`}
      <div class="task"><input id="kg" type="number" inputmode="decimal" step="0.1" placeholder="Peso de hoy (kg)"><button class="link" id="saveKg">Guardar</button></div></section>`;
  $("saveKg").onclick = () => { const kg = parseFloat(($("kg").value || "").replace(",", ".")); if (!kg || kg < 30 || kg > 300) return toast("Escribe un peso válido."); const k = dayKey(0); S.weighs = S.weighs.filter(x => x.day !== k).concat([{ day: k, kg }]); write(() => sb.from("weighins").upsert({ user_id: S.uid, day: k, kg }, { onConflict: "user_id,day" })); S.bodyP = { ...(S.bodyP || {}), weight_kg: kg }; write(() => sb.from("body_profile").upsert({ user_id: S.uid, ...S.bodyP, updated_at: new Date().toISOString() }, { onConflict: "user_id" })); toast("Peso guardado."); renderEstatua(v) };
  $("shareStatue").onclick = shareStatue;
}
function sparkline(w) { const W = 300, H = 70, ks = w.map(x => +x.kg), mn = Math.min(...ks), mx = Math.max(...ks), rg = Math.max(.5, mx - mn); const pts = w.map((x, i) => `${(8 + i * (W - 16) / (w.length - 1)).toFixed(1)},${(H - 8 - (x.kg - mn) / rg * (H - 16)).toFixed(1)}`); const d = ks[ks.length - 1] - ks[0]; return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-label="Evolución del peso"><polyline points="${pts.join(" ")}" fill="none" stroke="var(--red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><p class="small">${d === 0 ? "Estable" : (d > 0 ? "+" : "−") + Math.abs(d).toFixed(1).replace(".", ",") + " kg"} en tus últimos ${w.length} registros</p>` }
async function shareStatue() {
  const n = sculpted(), fz = faseDe(n), W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
  x.fillStyle = "#060606"; x.fillRect(0, 0, W, H);
  const g = x.createRadialGradient(540, 760, 40, 540, 760, 720); g.addColorStop(0, "rgba(255,59,31,.42)"); g.addColorStop(.4, "rgba(255,59,31,.1)"); g.addColorStop(1, "rgba(255,59,31,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
  try { await Promise.all([document.fonts.load('400 80px Anton'), document.fonts.load('italic 400 60px "Instrument Serif"'), document.fonts.load('700 30px "JetBrains Mono"')]) } catch (e) { }
  const img = new Image(); img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(statueSVG(fz.i, set().name)); await img.decode().catch(() => { });
  x.textAlign = "center"; x.fillStyle = "#efe9df"; x.font = '400 76px Anton, Impact, sans-serif'; x.fillText("LEVO", W / 2, 180);
  x.drawImage(img, W / 2 - 310, 260, 620, 806);
  x.fillStyle = "#ff3b1f"; x.font = '700 30px "JetBrains Mono", monospace'; x.fillText(`DÍA ${n} · FASE ${ROM[fz.i]} / VIII`, W / 2, 1180);
  let fs = 170; x.fillStyle = "#efe9df"; do { x.font = `400 ${fs}px Anton, Impact, sans-serif`; fs -= 6 } while (x.measureText(fz.name.toUpperCase()).width > 960 && fs > 60); x.fillText(fz.name.toUpperCase(), W / 2, 1360);
  x.fillStyle = "#8a847a"; x.font = '700 30px "JetBrains Mono", monospace'; x.fillText(`${streak()} DÍAS SEGUIDOS · EN PIE A LAS ${set().wake || "05:00"}`, W / 2, 1440);
  x.fillStyle = "#efe9df"; x.font = 'italic 400 64px "Instrument Serif", Georgia, serif'; x.fillText("«Nunca dejes de esculpir", W / 2, 1620); x.fillText("tu propia estatua.»", W / 2, 1696);
  x.fillStyle = "#8a847a"; x.font = '700 26px "JetBrains Mono", monospace'; x.fillText("PLOTINO", W / 2, 1768);
  c.toBlob(async blob => { const file = new File([blob], "levo-mi-estatua.png", { type: "image/png" }); try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: "Esculpiendo mi estatua en Levo" }); return } } catch (e) { if (e && e.name === "AbortError") return } const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "levo-mi-estatua.png"; document.body.append(a); a.click(); a.remove() }, "image/png");
}

/* ================= YO ================= */
function renderYo(v) {
  const fz = faseDe(sculpted()), granted = "Notification" in window && Notification.permission === "granted";
  v.innerHTML = `<header style="display:flex;gap:16px;align-items:center"><div style="width:76px;flex:none">${statueSVG(fz.i, set().name)}</div><div><p class="eyebrow r">Día ${dayNum()} · ${esc(fz.name)}</p><h1 class="title">${esc(set().name || "Tú")}</h1></div></header>
    <div class="plist">
      <label class="prow"><span class="tx"><b>Nombre</b><small>Aparece en la placa de tu estatua</small></span><input id="pName" value="${esc(set().name || "")}" maxlength="18" style="width:140px;text-align:right;font-size:18px"></label>
      <label class="prow"><span class="tx"><b>Hora de despertar</b><small>Tu primera victoria de cada día</small></span><input id="pWake" type="time" value="${set().wake || "05:00"}"></label>
      <button class="prow" id="pPush"><span class="tx"><b>Avisos</b><small>${granted ? "Activados: al despertar, y a mediodía y por la noche solo si hace falta" : "Desactivados: toca para activarlos (3 al día como máximo)"}</small></span><span class="end">›</span></button>
      <button class="prow" id="pBody"><span class="tx"><b>Tu cuerpo</b><small>${S.bodyP && S.bodyP.weight_kg ? `${String(S.bodyP.weight_kg).replace(".", ",")} kg · meta de agua: ${waterGoal()} vasos` : "Peso y estatura para tu meta de agua (privado)"}</small></span><span class="end">›</span></button>
    </div>
    <div class="plist">
      <button class="prow danger ${S.resetArm ? "armed" : ""}" id="pReset"><span class="tx"><b>${S.resetArm ? "Toca otra vez para borrarlo todo" : "Empezar de cero"}</b><small>${S.resetArm ? "Se borran tu diario, tus días, tus hábitos y tu estatua. No se puede deshacer." : "Como si acabaras de descargar Levo"}</small></span></button>
      <button class="prow" id="pOut"><span class="tx"><b>Cerrar sesión</b></span></button>
    </div>
    <p class="small center">Levo · Esculpe tu mejor versión, un día cada vez</p>`;
  $("pName").onchange = e => { S.set.name = e.target.value.trim(); saveSet(); toast("Nombre guardado.") };
  $("pWake").onchange = e => { S.set.wake = e.target.value || "05:00"; saveSet(); toast(`Te levantarás a las ${S.set.wake}.`) };
  $("pPush").onclick = enablePush;
  $("pBody").onclick = () => openSheet("body");
  $("pReset").onclick = resetAll;
  $("pOut").onclick = async () => { try { localStorage.removeItem("levo2-cache") } catch (e) { } await sb.auth.signOut(); location.href = location.pathname };
}
async function resetAll() {
  if (!S.resetArm) { S.resetArm = true; return renderYo($("view")) }
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
  app.innerHTML = `<div class="gate"><div class="mark">${statueSVG(7)}</div><p class="logo">LEVO</p><p class="sub center">Esculpe tu mejor versión, un día cada vez.</p>
    <form id="gf" class="fields"><input id="ge" type="email" autocomplete="username" placeholder="Email" required><input id="gp" type="password" autocomplete="current-password" placeholder="Contraseña" minlength="8" required><button class="btn" id="gb">Entrar</button></form>
    <button class="link center" id="gs">¿Primera vez? Crear cuenta</button><p class="small center" id="gm" style="min-height:20px"></p></div>`;
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
  const N = 4, dots = `<div class="dots">${Array.from({ length: N }, (_, i) => `<i class="${i <= o.step ? "on" : ""}"></i>`).join("")}</div>`;
  let body = "", btn = "Continuar", ok = true;
  if (o.step === 0) body = `<div class="mark" style="width:110px">${statueSVG(0)}</div><h1 class="title center">Tu mejor versión está dentro del bloque</h1><p class="sub center">Cada día que cumples tu camino, das un golpe de cincel. Cien días y estarás laureado.</p><input id="on" placeholder="¿Cómo te llamas?" maxlength="18" value="${esc(o.name)}">`;
  if (o.step === 1) body = `<p class="eyebrow r center">Paso I · Despertar</p><h1 class="title center">¿A qué hora te levantarás?</h1><p class="sub center">Ganar la mañana es ganar el día.</p><div class="opts time">${["05:00", "05:30", "06:00", "06:30"].map(t => `<button data-w="${t}" class="${o.wake === t ? "on" : ""}">${t}</button>`).join("")}</div><label class="fields"><span>Otra hora</span><input id="ow" type="time" value="${o.wake}"></label>`;
  if (o.step === 2) { ok = o.picks.size >= 3; btn = ok ? "Continuar" : `Elige ${3 - o.picks.size} más`; body = `<p class="eyebrow r center">Paso VI · Hábitos</p><h1 class="title center">Elige de 3 a 5</h1><p class="sub center">Pocos y firmes. Podrás cambiarlos cuando quieras.</p><div class="fields">${HABITOS_ESTOICOS.map(h => `<button class="hab ${o.picks.has(h.id) ? "on" : ""}" data-p="${h.id}" style="text-decoration:none"><span class="ck ${o.picks.has(h.id) ? "on" : ""}">✓</span><span style="color:var(--fg);text-decoration:none">${esc(h.name)}</span></button>`).join("")}</div>` }
  if (o.step === 3) { btn = "Esculpir mi estatua"; body = `<p class="eyebrow r center">Tu camino</p><h1 class="title center">Ocho piedras cada día</h1><div class="roman">${[["Despertar a las " + o.wake], ["Tu frase sellada y su acción"], ["Un minuto de respiración"], ["Tres afirmaciones"], ["Tres batallas"], ["Tus hábitos"], ["El templo: comida y agua"], ["El examen nocturno"]].map(([t], i) => `<div><b>${ROM[i]}</b><span>${t}</span></div>`).join("")}</div><p class="sub center">Cada paso se sella manteniendo pulsado el corazón. Con 6 de 8, el día queda esculpido.</p>` }
  app.innerHTML = `<div class="gate" style="justify-content:flex-start;gap:16px">${dots}${body}<button class="btn" id="onext" ${ok ? "" : "disabled"}>${btn}</button>${o.step ? `<button class="link center" id="oback">Atrás</button>` : ""}</div>`;
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
    renderOnb.o = null; app.innerHTML = ""; route(); setTimeout(() => toast("Bienvenido, " + (o.name || "estoico") + ". Mañana a las " + o.wake + "."), 300);
  };
}

/* ---------- arranque ---------- */
function demo() {
  S.uid = "demo"; S.ready = true; S.set = { v2: true, name: "Esteban", wake: "05:00", start: dayKey(-28), fav: ["s0", "e3"] };
  S.habits = HABITOS_ESTOICOS.slice(0, 5).map((h, i) => ({ ...h, ord: i }));
  for (let o = -28; o <= 0; o++) {
    const k = dayKey(o), good = ![-6, -11, -2, -19].includes(o);
    S.days[k] = { done: Object.fromEntries(S.habits.slice(0, good && o ? 4 : 1).map(h => [h.id, true])) };
    S.journal[k] = o === 0 ? { wake: "05:04" } : good ? { wake: "05:0" + (Math.abs(o) % 9), open: true, breath: true, commit: true, practiced: true, aff: ["a", "b", "c"], tasks: [{ t: "x", done: true }, { t: "y", done: true }], meals: { desayuno: "limpio", comida: "limpio", cena: "regular" }, water: 9, exam: { bien: "x" } } : { wake: "06:40", open: o % 2 === 0 };
  }
  S.weighs = [[-21, 78.4], [-14, 77.9], [-7, 77.3], [0, 76.9]].map(([o, kg]) => ({ day: dayKey(o), kg })); S.bodyP = { height_cm: 178, weight_kg: 76.9, goal: "perder" };
}
const LV = (document.querySelector('meta[name="levo-version"]') || {}).content;
async function checkUpdate() { if (!LV || DEMO) return; try { const j = await (await fetch("version.json?t=" + Date.now(), { cache: "no-store" })).json(); if (j.v && j.v !== LV && !$("sheet")) location.reload() } catch (e) { } }
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { checkUpdate(); if (S.ready && !$("sheet")) route() } });
if ("serviceWorker" in navigator && !DEMO) navigator.serviceWorker.register("sw.js");
if (DEMO) {
  if (SHOT) document.documentElement.classList.add("shot");
  demo();
  if (SHOT === "onb") S.set.v2 = false;
  if (SHOT && ["frases", "estatua", "yo"].includes(SHOT)) S.tab = SHOT;
  route();
  if (SHOT && SHEETS[SHOT]) setTimeout(() => openSheet(SHOT), 200);
} else {
  bootCache();
  sb.auth.onAuthStateChange((_e, session) => { const was = S.uid; S.uid = session ? session.user.id : null; if (S.uid && S.uid !== was) load(); else if (!S.uid) { S.ready = false; route() } });
  setTimeout(checkUpdate, 2500);
}
