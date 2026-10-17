/* Levo · Armario: cambia de ropa cuando quieras con vista previa en grande. */
const WSLOTS = [["gorra", "Cabeza"], ["gafas", "Gafas"], ["top", "Arriba"], ["pant", "Abajo"], ["zapas", "Calzado"], ["extra", "Extras"]];
let wSlot = "top";
const wCss = document.createElement("style");
wCss.textContent = `
.wardin{gap:14px;justify-items:stretch;text-align:left;width:min(440px,100%);max-height:calc(100vh - 40px);overflow-y:auto}
.ward-top{display:flex;align-items:center;justify-content:space-between}
.ward-top h2{margin:0;font-size:24px;font-weight:800;letter-spacing:-.03em}
.ward-stage{display:grid;place-items:center;border-radius:22px;padding:8px 0 4px;background:radial-gradient(circle at 50% 70%,color-mix(in srgb,var(--stage,#8d8d99) 30%,transparent),transparent 65%),var(--surface2)}
.ward-stage canvas{width:128px;height:200px;image-rendering:pixelated}
.ward-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none}
.ward-tabs::-webkit-scrollbar{display:none}
.ward-tabs button{flex:none;border:0;border-radius:99px;padding:8px 14px;background:var(--surface2);font-weight:600;font-size:14px}
.ward-tabs button[aria-selected="true"]{background:var(--fg);color:var(--bg)}
.ward-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.wcell{position:relative;border:0;border-radius:16px;padding:8px 6px;background:var(--surface2);display:grid;justify-items:center;gap:4px;font-size:12px;font-weight:600;text-align:center;line-height:1.15;min-height:96px}
.wcell img{width:54px;height:54px;image-rendering:pixelated;border-radius:12px;background:#11152e}
.wcell .none{width:54px;height:54px;border-radius:12px;display:grid;place-items:center;font-size:22px;color:var(--muted);background:var(--surface)}
.wcell[aria-pressed="true"]{box-shadow:0 0 0 2px var(--accent)}
.wcell[aria-pressed="true"]::after{content:"✓";position:absolute;top:6px;right:6px;width:18px;height:18px;border-radius:50%;background:var(--accent);color:#fff;font-size:11px;display:grid;place-items:center}
.wcell.locked{opacity:.45}
.wcell.locked small{display:flex;align-items:center;gap:3px;color:var(--muted)}
.wcell small img{width:14px!important;height:14px!important;background:none!important;border-radius:0!important}
.ward-more{font-size:13px;color:var(--muted);text-align:center;margin:0}
.wardbtn{border:0;border-radius:99px;padding:10px 16px;font-weight:700;font-size:14px;background:var(--surface);box-shadow:var(--lift);justify-self:center}
`;
document.head.append(wCss);

function wardModal() {
  let m = $("wardModal"); if (m) return m;
  m = document.createElement("div"); m.id = "wardModal"; m.className = "modal"; m.hidden = true; m.setAttribute("role", "dialog"); m.setAttribute("aria-label", "Armario");
  m.innerHTML = `<div class="modal-in wardin"><div class="ward-top"><h2>Armario</h2><button class="ghost" id="wClose">Listo</button></div><div class="ward-stage" id="wStage"><canvas id="wCv" width="64" height="100" aria-hidden="true"></canvas></div><div class="ward-tabs" id="wTabs" role="tablist"></div><div class="ward-grid" id="wGrid"></div><p class="ward-more" id="wMore"></p></div>`;
  document.body.append(m);
  m.addEventListener("click", e => { if (e.target === m) m.hidden = true });
  $("wClose").onclick = () => { m.hidden = true };
  return m;
}
function openWardrobe(slot) { if (slot) wSlot = slot; wardModal().hidden = false; drawWard(); tickWard() }
function slotItems(s) { return s === "extra" ? ROPA.filter(r => r.slot === "cadena" || r.slot === "aura") : ROPA.filter(r => r.slot === s) }
function equip(it, slot) {
  const next = { ...outfit };
  if (!it) delete next[slot]; else if (next[it.slot] === it.id && slot === "extra") delete next[it.slot]; else next[it.slot] = it.id;
  outfit = next; drawWard(); renderCasa(); if (window.levoPlay) levoPlay("tick"); me.wave = 1;
  if (uid && uid !== "demo") write(() => sb.from("profile").upsert({ user_id: uid, outfit, updated_at: new Date().toISOString() }, { onConflict: "user_id" }));
}
function drawWard() {
  $("wTabs").innerHTML = WSLOTS.map(([k, n]) => `<button role="tab" data-w="${k}" aria-selected="${k === wSlot}">${n}</button>`).join("");
  $("wTabs").querySelectorAll("button").forEach(b => b.onclick = () => { wSlot = b.dataset.w; drawWard() });
  const list = slotItems(wSlot), mine = list.filter(i => owned(i.id)), locked = list.filter(i => !owned(i.id) && !i.rarity && (!i.season || inSeason(i)));
  const g = $("wGrid"); g.innerHTML = "";
  if (wSlot !== "extra") { const b = document.createElement("button"); b.className = "wcell"; b.setAttribute("aria-pressed", !outfit[wSlot]); b.innerHTML = `<span class="none">∅</span>Nada`; b.onclick = () => equip(null, wSlot); g.append(b) }
  mine.forEach(i => { const b = document.createElement("button"); b.className = "wcell"; b.setAttribute("aria-pressed", outfit[i.slot] === i.id); b.innerHTML = `<img alt="" src="${hdItemIcon(i)}"><span></span>`; b.querySelector("span").textContent = i.name; b.onclick = () => equip(i, wSlot); g.append(b) });
  locked.slice(0, 6).forEach(i => { const b = document.createElement("button"); b.className = "wcell locked"; b.innerHTML = `<img alt="" src="${hdItemIcon(i)}"><span></span><small>${i.lvGift ? "Nivel " + i.lvGift : money(i.cost)}</small>`; b.querySelector("span").textContent = i.name; b.onclick = () => { $("wardModal").hidden = true; setTab("casa"); casaTab = i.season ? "temporada" : "ropa"; document.querySelectorAll("[data-shop]").forEach(x => x.setAttribute("aria-selected", x.dataset.shop === casaTab)); renderCasa(); status(`«${i.name}» está en la tienda.`) }; g.append(b) });
  $("wMore").textContent = mine.length ? "Toca una prenda para ponértela. Las grises se consiguen en la tienda, por nivel o en los cofres." : "Aún no tienes prendas de este tipo. Las grises se consiguen en la tienda, por nivel o en los cofres.";
  $("wStage").style.setProperty("--stage", stageOf(level()).c);
}
function tickWard() {
  const m = $("wardModal"); if (!m || m.hidden) return;
  const cv = $("wCv"), x = cv.getContext("2d"); x.imageSmoothingEnabled = false; x.clearRect(0, 0, 64, 100);
  drawAvatarHD(x, 32, 96, { ...outfit, _evo: window._evoCache }, "feliz", blink, 0, me.wave > 0);
  requestAnimationFrame(tickWard);
}
window.openWardrobe = openWardrobe;
if ($("wardBtn")) $("wardBtn").onclick = () => openWardrobe();
if ($("wardRow")) $("wardRow").addEventListener("click", () => { $("meModal").hidden = true; openWardrobe() });
if ($("heroAv")) { $("heroAv").style.cursor = "pointer"; $("heroAv").setAttribute("title", "Abrir armario"); $("heroAv").onclick = () => openWardrobe() }

if (location.hash === "#demo" && new URLSearchParams(location.search).get("shot") === "armario") setTimeout(() => openWardrobe("gorra"), 300);
