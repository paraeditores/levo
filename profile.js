/* Levo · Perfil: todos los ajustes en un sitio y «Empezar de cero». */
let resetArm = false;
const pCss = document.createElement("style");
pCss.textContent = `
.mebtn{border:0;padding:0;width:38px;height:38px;border-radius:50%;background:var(--surface);overflow:hidden;display:grid;place-items:center;box-shadow:inset 0 0 0 1.5px var(--line)}
.mebtn img{width:38px;height:38px;image-rendering:pixelated}
.mesheet{gap:14px;justify-items:stretch;text-align:left;max-height:calc(100vh - 48px);overflow-y:auto}
.me-head{display:flex;align-items:center;gap:14px}
.me-head img{width:72px;height:72px;image-rendering:pixelated;border-radius:20px;background:var(--surface2)}
.me-head b{display:block;font-size:22px;font-weight:800;letter-spacing:-.03em}
.me-head small{color:var(--muted);font-size:14px}
.me-list{display:flex;flex-direction:column;background:var(--surface2);border-radius:18px;overflow:hidden}
.me-row{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:0;background:transparent;padding:14px 16px;font-size:16px;font-weight:600;color:var(--fg);border-radius:0;box-shadow:none!important;min-height:52px}
.me-row+.me-row{box-shadow:inset 0 .5px 0 var(--line)!important}
.me-row .go{margin-left:auto;color:var(--muted);font-size:20px;font-weight:400}
.me-row small{display:block;color:var(--muted);font-size:13px;font-weight:500}
.me-list .bodyrow{background:transparent;box-shadow:none;border-radius:0;padding:14px 16px}
.me-list .bodyrow i{display:none}
.me-list.danger .me-row{color:var(--warn)}
.me-row.armed{background:color-mix(in srgb,var(--warn) 14%,transparent)}
.hero-say{margin:0;font-size:14px;font-weight:600;line-height:1.3;color:var(--fg)}
.hero-say::before{content:"«"}
.hero-say::after{content:"»"}
.prog .dchip{position:static;justify-self:start;animation:none}
`;
document.head.append(pCss);

function renderMe() {
  const lv = level(), st = stageOf(lv), img = typeof hdHead === "function" ? hdHead() : evoIcon(st.i);
  if ($("meImg")) $("meImg").src = img;
  if ($("meBig")) $("meBig").src = img;
  if ($("meName")) $("meName").textContent = (outfit._cfg && outfit._cfg.name) || "Tu perfil";
  if ($("meSub")) $("meSub").textContent = `Nivel ${lv} · ${st.name}`;
  const pr = $("pushRow");
  if (pr) {
    const granted = "Notification" in window && Notification.permission === "granted";
    pr.innerHTML = `<div><span>Avisos</span><small>${granted ? "Activados: 8:00, 13:00, 18:00 y 22:00" : "Desactivados: toca para activarlos"}</small></div><span class="go">›</span>`;
  }
  const rb = $("resetBtn"); if (rb) { rb.classList.toggle("armed", resetArm); rb.innerHTML = resetArm ? `<div><span>¿Seguro? Toca otra vez para borrarlo todo</span><small>Se borran hábitos, días, monedas, casa, personaje y amigos. No se puede deshacer.</small></div>` : `<div><span>Empezar de cero</span><small>Como si acabaras de descargar Levo</small></div>` }
}
function openMe() { resetArm = false; renderMe(); $("meModal").hidden = false }
function closeMe() { $("meModal").hidden = true; resetArm = false }
async function resetAll() {
  if (!resetArm) { resetArm = true; renderMe(); return }
  const rb = $("resetBtn"); rb.disabled = true; rb.innerHTML = `<div><span>Borrando…</span></div>`;
  if (uid && uid !== "demo") {
    try {
      for (const t of ["days", "purchases", "log", "weighins", "habits"]) await sb.from(t).delete().eq("user_id", uid);
      await sb.from("body_profile").delete().eq("user_id", uid);
      await sb.from("friends").delete().or(`user_id.eq.${uid},friend_id.eq.${uid}`);
      await sb.from("profile").delete().eq("user_id", uid);
    } catch (e) { rb.disabled = false; status("No se pudo borrar todo. Revisa la conexión y vuelve a intentarlo."); return }
  }
  try { Object.keys(localStorage).filter(k => k.startsWith("levo-") && k !== "levo-sonido").forEach(k => localStorage.removeItem(k)) } catch (e) { }
  location.href = location.pathname;
}
if ($("meBtn")) $("meBtn").onclick = openMe;
if ($("meClose")) $("meClose").onclick = closeMe;
if ($("meModal")) $("meModal").addEventListener("click", e => { if (e.target === $("meModal")) closeMe() });
["editLook", "hardToggle", "bodyRow"].forEach(id => { const b = $(id); if (b) b.addEventListener("click", closeMe, true) });
if ($("pushRow")) $("pushRow").onclick = () => { closeMe(); if ("Notification" in window && Notification.permission === "granted") status("Los avisos ya están activados."); else if ($("pushBtn") && !$("pushCard").hidden) $("pushBtn").click(); else status("Abre Levo desde el icono de tu pantalla de inicio para activar los avisos.") };
if ($("resetBtn")) $("resetBtn").onclick = resetAll;
if ($("logoutBtn")) $("logoutBtn").onclick = async () => { closeMe(); try { localStorage.removeItem("levo-cache-v1") } catch (e) { } await sb.auth.signOut(); location.href = location.pathname };
const _drP = window.dailyRender; window.dailyRender = () => { if (_drP) _drP(); renderMe() };
renderMe();
