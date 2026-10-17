/* Levo · Capa de claridad: barra de progreso única, un solo premio a la vista y controles según la pestaña. */
function renderProg() {
  if (!$("progFill")) return;
  const k = dayKey(offset), n = habits.length, d = habits.filter(h => doneFor(k)[h.id]).length, p = n ? Math.round(d / n * 100) : 0;
  const X = xp(), lv = Math.floor(X / 150) + 1, label = offset === 0 ? "Hoy" : offset === -1 ? "Ayer" : dateOf(offset).toLocaleDateString("es-ES", { weekday: "long" });
  $("progTitle").textContent = n ? `${label[0].toUpperCase() + label.slice(1)}: ${p} %` : "Añade tu primer hábito";
  $("progSub").textContent = n ? `${d} de ${n} hábitos` : "";
  $("progFill").style.width = p + "%";
  $("progFill").style.background = p >= 60 ? "linear-gradient(90deg,var(--vida),#0a84ff)" : "var(--grad)";
  const st = stageOf(lv); $("progLvl").innerHTML = `Nivel ${lv} · <span style="color:${st.c}">${st.name}</span>`; const ha = $("heroAv"); if (ha) ha.style.setProperty("--stage", st.c);
  $("progNext").textContent = p < 60 && n ? `Llega al 60 % para salvar el día` : `${150 - X % 150} XP para el nivel ${lv + 1}`;
  // un solo premio a la vista
  const g = $("goals"); if (g) [...g.querySelectorAll(".goal")].slice(1).forEach(e => e.remove());
}
const _drU = window.dailyRender; window.dailyRender = () => { if (_drU) _drU(); renderProg() };
const _otU = window.onTab; window.onTab = t => { document.body.dataset.tab = t; if (editing2 && t !== "casa") setEditing(false); if (_otU) _otU(t) };
document.body.dataset.tab = "hoy";
renderProg();

/* Carga instantánea: se guarda lo último que viste y se pinta antes de que conteste el servidor */
const CK = "levo-cache-v1"; let _ckT = 0;
function saveCache() { if (!uid || uid === "demo" || !habits.length) return; clearTimeout(_ckT); _ckT = setTimeout(() => { try { localStorage.setItem(CK, JSON.stringify({ uid, START, habits, days, lastLog, purchases, outfit })) } catch (e) { } }, 800) }
const _drC = window.dailyRender; window.dailyRender = () => { if (_drC) _drC(); saveCache() };
(function boot() {
  if (location.hash === "#demo" || location.hash === "#onb") return;
  try { const c = JSON.parse(localStorage.getItem(CK) || "null"); if (c && !habits.length) { habits = c.habits || []; days = c.days || {}; lastLog = c.lastLog || null; purchases = c.purchases || []; outfit = c.outfit || {}; if (c.START) START = c.START; HARD = outfit._cfg ? !!outfit._cfg.hard : true; render() } } catch (e) { }
})();

/* Actualización automática: al volver a la app, si hay versión nueva publicada, se recarga sola */
const LV = (document.querySelector(meta[name=levo-version]) || {}).content;
async function checkUpdate() {
  if (!LV || location.hash === "#demo") return;
  try {
    const j = await (await fetch("version.json?t=" + Date.now(), { cache: "no-store" })).json();
    const busy = document.querySelector(".modal:not([hidden]), .celeb, .onb:not([hidden])") || (window.editing2);
    if (j.v && j.v !== LV && !busy) location.reload();
  } catch (e) { }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") checkUpdate() });
setTimeout(checkUpdate, 2500);
