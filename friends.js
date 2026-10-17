/* Levo · Amigos: código de amigo, solicitudes, visitar habitaciones, compañero de racha y toques. */
let friendRows = [], friendRooms = {}, lastSnap = "", snapTimer = null;
const myCode = () => uid && uid !== "demo" ? uid.replace(/-/g, "").slice(0, 6).toUpperCase() : "DEMO01";
const myName = () => (outfit._cfg && outfit._cfg.name) || "Jugador";

/* ---------- Mi habitación pública (solo la ven mis amigos) ---------- */
function mySnap() {
  const own = [...MUEBLES, ...ESTILOS].filter(i => owned(i.id)).map(i => i.id);
  if (bongoUnlocked()) own.push("@bongo");
  const { _cfg, ...look } = outfit;
  return { outfit: look, owned: own, lvl: level(), streak: streak(), pct: Math.round(frac(dayKey(0)) * 100), mood, layout: outfit._layout || null, day: dayKey(0) };
}
function publishSnap() {
  if (!uid || uid === "demo" || !habits.length) return;
  clearTimeout(snapTimer);
  snapTimer = setTimeout(() => {
    const s = mySnap(), j = JSON.stringify([myName(), s]);
    if (j === lastSnap) return; lastSnap = j;
    sb.from("rooms").upsert({ user_id: uid, code: myCode(), name: myName(), snap: s, updated_at: new Date().toISOString() }, { onConflict: "user_id" }).then(() => { });
  }, 2500);
}

/* ---------- Cargar amigos ---------- */
async function loadFriends() {
  if (!uid || uid === "demo") return demoFriends();
  const f = await sb.from("friends").select("user_id,friend_id,status");
  if (f.error) return;
  friendRows = f.data;
  const ids = [...new Set(friendRows.map(r => r.user_id === uid ? r.friend_id : r.user_id))];
  if (ids.length) { const r = await sb.from("rooms").select("user_id,name,snap,updated_at").in("user_id", ids); if (!r.error) { friendRooms = {}; r.data.forEach(x => friendRooms[x.user_id] = x) } }
  const n = await sb.from("nudges").select("id,from_id,at").eq("to_id", uid).eq("seen", false);
  if (!n.error && n.data.length) {
    const who = [...new Set(n.data.map(x => (friendRooms[x.from_id] || {}).name || "Un amigo"))].join(", ");
    status(`${who} te ha dado un toque 👊 ¡A por tus hábitos!`);
    sb.from("nudges").update({ seen: true }).in("id", n.data.map(x => x.id)).then(() => { });
  }
  renderFriends(); renderBuddy();
}
function demoFriends() {
  const fakeId = "demo-amiga";
  friendRows = [{ user_id: "demo", friend_id: fakeId, status: "accepted" }, { user_id: "demo-pide", friend_id: "demo", status: "pending" }];
  friendRooms = {
    [fakeId]: { user_id: fakeId, name: "Lucía", snap: { outfit: { top: "sudadera-galaxia", gorra: "gorro-lana", _look: { skin: 1, hs: "largo", hc: 2 } }, owned: ["alfombra", "cama", "sofa", "planta", "lampara", "acuario", "pared-coral", "suelo-blanco", "@bongo"], lvl: 6, streak: 9, pct: 80, mood: "feliz", day: dayKey(0) } },
    "demo-pide": { user_id: "demo-pide", name: "Carlos", snap: { outfit: {}, owned: [], lvl: 2, streak: 1, pct: 20, mood: "ok", day: dayKey(0) } },
  };
  renderFriends(); renderBuddy();
}
const friendsAccepted = () => friendRows.filter(r => r.status === "accepted").map(r => r.user_id === uid ? r.friend_id : r.user_id);
const incoming = () => friendRows.filter(r => r.status === "pending" && r.friend_id === uid).map(r => r.user_id);
const outgoing = () => friendRows.filter(r => r.status === "pending" && r.user_id === uid).map(r => r.friend_id);
const snapToday = s => s && s.day === dayKey(0) ? s.pct : 0;

/* ---------- Pintar la habitación de otra persona ---------- */
const visitor = { x: 3, y: 3, tx: 3, ty: 3, wait: 1, step: 0, wave: 0 };
function drawRoomFor(cv, room) {
  const s = room.snap || {}, saved = { outfit, mood, me: { ...me } };
  outfit = { ...(s.outfit || {}), _layout: s.layout || undefined }; mood = s.mood || "ok"; Object.assign(me, visitor);
  window._ownSet = new Set(s.owned || []);
  try { drawRoom(cv) } finally { window._ownSet = null; Object.assign(visitor, me); Object.assign(me, saved.me); outfit = saved.outfit; mood = saved.mood }
}
function miniAvatar(s) {
  const c = document.createElement("canvas"); c.width = 30; c.height = 44; const x = c.getContext("2d"); x.imageSmoothingEnabled = false;
  window._ownSet = new Set(); try { drawAvatar(x, 15, 42, (s && s.outfit) || {}, (s && s.mood) || "ok", false) } finally { window._ownSet = null }
  return c.toDataURL();
}

/* ---------- Vista ---------- */
const fCss = document.createElement("style");
fCss.textContent = `
.codecard{display:grid;gap:12px;background:var(--surface);border-radius:var(--r);padding:18px;position:relative;overflow:hidden}
.codecard::before{content:"";position:absolute;inset:0;background:radial-gradient(120% 90% at 100% 0%,color-mix(in srgb,var(--vida) 22%,transparent),transparent 60%);pointer-events:none}
.codecard small{font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;position:relative}
.code{font-family:var(--rounded);font-size:44px;font-weight:800;letter-spacing:.12em;position:relative;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.addrow{display:flex;gap:8px;position:relative}
.addrow input{text-transform:uppercase;letter-spacing:.1em;font-weight:700}
.addrow .btn{min-height:50px;padding:0 18px;white-space:nowrap}
.flist{display:flex;flex-direction:column;background:var(--surface);border-radius:var(--r);overflow:hidden}
.frow{display:flex;align-items:center;gap:12px;padding:12px 14px}
.frow+.frow{box-shadow:inset 0 .5px 0 var(--line)}
.frow img{width:42px;height:58px;image-rendering:pixelated;flex:none;border-radius:12px;background:radial-gradient(circle at 50% 40%,#2a3566,#141a38);padding:4px 6px}
.frow .pt b{font-size:16px}
.frow .pt small{color:var(--muted);font-size:13px}
.frow .acts{display:flex;gap:6px}
.frow .acts button{border:0;border-radius:99px;padding:8px 12px;font-weight:700;font-size:13px;background:var(--soft)}
.frow .acts .pri{background:var(--fg);color:var(--bg)}
.frow .star{background:none!important;font-size:20px;padding:4px!important;opacity:.35}
.frow .star.on{opacity:1}
.fempty{padding:18px;color:var(--muted);font-size:14px;text-align:center;margin:0}
.buddy{display:flex;align-items:center;gap:12px;background:var(--surface);border-radius:var(--r);padding:12px 14px}
.buddy img{width:42px;height:58px;image-rendering:pixelated;border-radius:12px;background:radial-gradient(circle at 50% 40%,#2a3566,#141a38);padding:4px 6px;flex:none}
.buddy small{font-size:12px;font-weight:700;color:var(--vida);text-transform:uppercase}
.buddy .ring2{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--vida) calc(var(--p)*1%),var(--soft) 0);flex:none;margin-left:auto}
.buddy .ring2 span{width:34px;height:34px;border-radius:50%;background:var(--surface);display:grid;place-items:center;font-family:var(--rounded);font-weight:800;font-size:12px}
.buddy .poke{border:0;border-radius:99px;padding:10px 14px;font-weight:800;font-size:14px;color:#fff;background:linear-gradient(135deg,#ff2d55,#ff9f0a)}
.vmodal .modal-in{padding:14px;gap:12px;width:min(420px,100%)}
.vmodal canvas{width:100%;aspect-ratio:240/190;image-rendering:pixelated;border-radius:18px;background:radial-gradient(120% 90% at 50% 30%,#2a3566 0%,#141a38 55%,#0a0d1f 100%)}
.vmodal h3{margin:0;font-size:22px;letter-spacing:-.03em}
.vmodal p{margin:0;color:var(--muted);font-size:14px}
.vmodal .vacts{display:grid;grid-template-columns:1fr 1fr;gap:8px;width:100%}
`;
document.head.append(fCss);

function renderFriends() {
  if (tab !== "amigos") return;
  $("myCode").textContent = myCode();
  const list = $("flist"); list.innerHTML = "";
  const buddyId = outfit._cfg && outfit._cfg.buddy;
  const row = (id, kind) => {
    const r = friendRooms[id] || { name: "Jugador", snap: {} }, s = r.snap || {}, d = document.createElement("div"); d.className = "frow";
    d.innerHTML = `<img alt="" src="${miniAvatar(s)}"><div class="pt"><b></b><small>${kind === "in" ? "Quiere ser tu amigo" : kind === "out" ? "Solicitud enviada" : `Nivel ${s.lvl || 1} · 🔥 ${s.streak || 0} · hoy ${snapToday(s)} %`}</small></div><div class="acts"></div>`;
    d.querySelector("b").textContent = r.name;
    const acts = d.querySelector(".acts");
    const btn = (t, cls, fn, label) => { const b = document.createElement("button"); b.textContent = t; if (cls) b.className = cls; if (label) b.setAttribute("aria-label", label); b.onclick = fn; acts.append(b) };
    if (kind === "in") { btn("Aceptar", "pri", () => respond(id, true)); btn("✕", "", () => respond(id, false), "Rechazar") }
    if (kind === "ok") { btn(buddyId === id ? "★" : "☆", "star" + (buddyId === id ? " on" : ""), () => setBuddy(id), "Compañero de racha"); btn("Visitar", "pri", () => visit(id)) }
    list.append(d);
  };
  incoming().forEach(id => row(id, "in"));
  friendsAccepted().forEach(id => row(id, "ok"));
  outgoing().forEach(id => row(id, "out"));
  if (!list.children.length) list.innerHTML = `<p class="fempty">Aún no tienes amigos en Levo. Pásale tu código a alguien y retaos.</p>`;
}
async function addFriend() {
  const c = $("friendCode").value.trim().toUpperCase(); if (c.length !== 6) return status("El código tiene 6 caracteres.");
  if (uid === "demo") return status("En la demo no se pueden añadir amigos.");
  const { data, error } = await sb.rpc("add_friend", { c });
  if (error) return status("No pude enviar la solicitud. Inténtalo otra vez.");
  status({ no_existe: "No hay nadie con ese código.", eres_tu: "Ese es tu propio código 😄", aceptado: "¡Ya sois amigos!", enviado: "Solicitud enviada." }[data] || "Hecho.");
  $("friendCode").value = ""; loadFriends();
}
async function respond(id, yes) {
  if (uid === "demo") { friendRows = friendRows.map(r => r.user_id === id ? { ...r, status: "accepted" } : r).filter(r => yes || r.user_id !== id); return renderFriends() }
  if (yes) await sb.from("friends").update({ status: "accepted" }).eq("user_id", id).eq("friend_id", uid);
  else await sb.from("friends").delete().eq("user_id", id).eq("friend_id", uid);
  loadFriends();
}
function setBuddy(id) {
  const cur = outfit._cfg && outfit._cfg.buddy;
  outfit = { ...outfit, _cfg: { ...(outfit._cfg || {}), buddy: cur === id ? null : id } };
  if (uid !== "demo") write(() => sb.from("profile").upsert({ user_id: uid, outfit, updated_at: new Date().toISOString() }, { onConflict: "user_id" }));
  status(cur === id ? "Ya no es tu compañero de racha." : "Compañero de racha elegido. Lo verás en Hoy.");
  renderFriends(); renderBuddy();
}
async function poke(id) {
  const name = (friendRooms[id] || {}).name || "tu amigo";
  if (uid === "demo") return status(`Toque enviado a ${name} 👊`);
  const r = await sb.from("nudges").insert({ from_id: uid, to_id: id });
  status(r.error ? "No pude enviar el toque." : `Toque enviado a ${name} 👊 Le llegará en unos minutos.`);
}
function renderBuddy() {
  const el = $("buddy"); if (!el) return;
  const id = outfit._cfg && outfit._cfg.buddy, r = id && friendRooms[id];
  if (!r || !friendsAccepted().includes(id)) { el.hidden = true; return }
  const s = r.snap || {}, p = snapToday(s); el.hidden = false;
  el.innerHTML = `<img alt="" src="${miniAvatar(s)}"><div class="pt"><small>Tu compañero de racha</small><b></b><span style="font-size:13px;color:var(--muted)">🔥 ${s.streak || 0} días · nivel ${s.lvl || 1}</span></div><div class="ring2" style="--p:${p}"><span>${p}%</span></div><button class="poke">👊 Toque</button>`;
  el.querySelector("b").textContent = r.name; el.querySelector(".poke").onclick = () => poke(id);
}
let visitId = null;
function visitModal() {
  let m = $("visitModal"); if (m) return m;
  m = document.createElement("div"); m.id = "visitModal"; m.className = "modal vmodal"; m.hidden = true; m.setAttribute("role", "dialog"); m.setAttribute("aria-label", "Habitación de un amigo");
  m.innerHTML = `<div class="modal-in"><canvas id="vRoom" width="240" height="190"></canvas><h3 id="vName"></h3><p id="vInfo"></p><div class="vacts"><button class="btn accent" id="vPoke">👊 Dar un toque</button><button class="btn" id="vClose">Salir</button></div></div>`;
  document.body.append(m); $("vClose").onclick = () => { m.hidden = true; visitId = null }; return m;
}
function visit(id) {
  const r = friendRooms[id]; if (!r) return; visitId = id;
  const m = visitModal(), s = r.snap || {}; m.hidden = false;
  Object.assign(visitor, { x: 3, y: 3, tx: 3, ty: 3, wait: 1 });
  $("vName").textContent = `Casa de ${r.name}`; $("vInfo").textContent = `Nivel ${s.lvl || 1} · 🔥 ${s.streak || 0} días de racha · hoy al ${snapToday(s)} %`;
  $("vPoke").onclick = () => poke(id);
}
/* la habitación visitada se anima con su propio paseante */
let vLast = performance.now();
(function vLoop(t) {
  const dt = Math.min(.1, (t - vLast) / 1000); vLast = t;
  if (visitId && friendRooms[visitId]) {
    if (visitor.wait > 0) { visitor.wait -= dt; if (visitor.wait <= 0) { const q = FREE[Math.floor(Math.random() * FREE.length)]; visitor.tx = q[0]; visitor.ty = q[1] } }
    else { const dx = visitor.tx - visitor.x, dy = visitor.ty - visitor.y, d = Math.hypot(dx, dy); if (d < .05) visitor.wait = 2 + Math.random() * 3; else { const v = 1.1 * dt; visitor.x += dx / d * Math.min(v, d); visitor.y += dy / d * Math.min(v, d); visitor.step += dt * 6 } }
    drawRoomFor($("vRoom"), friendRooms[visitId]);
  }
  requestAnimationFrame(vLoop);
})(performance.now());

if ($("addFriend")) $("addFriend").onclick = addFriend;
if ($("copyCode")) $("copyCode").onclick = async () => { try { await navigator.clipboard.writeText(`Únete a Levo y añádeme como amigo con mi código ${myCode()}: https://paraeditores.github.io/levo/`); status("Código copiado.") } catch (e) { status(`Tu código es ${myCode()}`) } };
const _dr2 = window.dailyRender; window.dailyRender = () => { if (_dr2) _dr2(); publishSnap(); renderFriends(); renderBuddy() };
const _lc = window.loadCasa; window.loadCasa = async () => { await _lc(); loadFriends() };
window.onTab = t => { if (t === "amigos") { renderFriends(); loadFriends() } };
if (uid === "demo") demoFriends();
