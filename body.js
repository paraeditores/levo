/* Levo · Tu cuerpo: datos privados (nunca se comparten con amigos), metas a tu medida y pesaje semanal. */
let bodyP = null, weighs = [], bGoal = null, bDelArm = false;
const fmtKg = v => `${Number(v).toLocaleString("es-ES", { maximumFractionDigits: 1 })} kg`;
const waterL = kg => Math.min(4, Math.max(1.5, Math.round(kg * .033 * 10) / 10));
const stepsFor = g => g === "perder" ? 10000 : g === "ganar" ? 7000 : 8000;
const SUG = {
  perder: ["Caminar 30 minutos", "Cenar antes de las 21 h", "Sin bebidas azucaradas"],
  mantener: ["Entrenar 30 min", "Fruta o verdura en cada comida", "Estirar 10 minutos"],
  ganar: ["Proteína en cada comida", "Entrenar fuerza", "Comer 4 veces al día"],
};
const bCss = document.createElement("style");
bCss.textContent = `
.bodyrow{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:0;border-radius:var(--r);padding:14px 16px;background:var(--surface);box-shadow:var(--lift)}
.bodyrow i{font-style:normal;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--surface2);flex:none}
.bodyrow i img{width:24px;height:24px;image-rendering:pixelated}
.bodyrow small{color:var(--muted);font-size:13px}
.bodyrow small em{font-style:normal;color:var(--trabajo);font-weight:700}
.bodyrow .go{margin-left:auto;color:var(--muted);font-size:22px}
.bodyin{gap:14px;text-align:left;justify-items:stretch;max-height:calc(100vh - 48px);overflow-y:auto}
.bodyin h2{margin:0;font-size:24px;font-weight:800;letter-spacing:-.03em}
.bodyin .priv{margin:-6px 0 0;font-size:13px;color:var(--muted);display:flex;gap:6px;align-items:center}
.bgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.bgrid label{display:grid;gap:6px;font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.bgrid .unit{position:relative}
.bgrid .unit span{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--muted);font-weight:600;text-transform:none;letter-spacing:0;font-size:15px}
.bgrid input{font-size:20px;font-weight:700;padding-right:44px}
.bodyin .opt > span{font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.bodyin .row-sc{display:flex;gap:8px}
.bodyin .pill{flex:1;border:0;border-radius:12px;padding:11px 8px;background:var(--surface2);font-weight:600;font-size:15px}
.bodyin .pill[aria-pressed="true"]{background:var(--fg);color:var(--bg)}
.bres{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.bres div{background:var(--surface2);border-radius:16px;padding:12px 14px;display:grid;gap:2px}
.bres small{font-size:12px;color:var(--muted);font-weight:600}
.bres b{font-family:var(--rounded);font-size:22px;font-weight:800;letter-spacing:-.02em}
.bchk{display:flex;gap:10px;align-items:center;font-size:14px;color:var(--fg)}
.bchk input{width:20px;height:20px;min-height:0;accent-color:var(--accent)}
.btrend{background:var(--surface2);border-radius:16px;padding:14px;display:grid;gap:8px}
.btrend b{font-size:15px}
.btrend small{color:var(--muted);font-size:13px}
.btrend svg{width:100%;height:110px;display:block}
.bsug{display:grid;gap:8px}
.bsug > span{font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.bsug .chips{display:flex;flex-wrap:wrap;gap:8px}
.bsug button{border:0;border-radius:99px;padding:9px 13px;background:var(--surface2);font-weight:600;font-size:14px}
.bsug button:disabled{opacity:.4}
.bdel{background:none!important;box-shadow:none!important;color:var(--warn)!important;font-size:14px}
`;
document.head.append(bCss);

async function loadBody() {
  if (!uid || uid === "demo") { renderBodyRow(); return }
  const [p, w] = await Promise.all([sb.from("body_profile").select("height_cm,weight_kg,goal").maybeSingle(), sb.from("weighins").select("day,kg").order("day")]);
  if (!p.error) bodyP = p.data; if (!w.error) weighs = w.data || [];
  renderBodyRow();
}
function lastWeigh() { return weighs[weighs.length - 1] || null }
function renderBodyRow() {
  const el = $("bodyRow"); if (!el) return;
  const last = lastWeigh(), d = last ? Math.round((new Date(dayKey(0)) - new Date(last.day)) / 864e5) : null;
  const ago = d === null ? "" : d === 0 ? "hoy" : d === 1 ? "ayer" : `hace ${d} días`;
  el.innerHTML = `<i><img alt="" src="${pixIcon("heart", 3)}"></i><div class="pt"><b>Tu cuerpo</b><small>${bodyP && bodyP.weight_kg ? `${last ? fmtKg(last.kg) + " · " + ago : fmtKg(bodyP.weight_kg)}${d !== null && d >= 7 ? " · <em>toca pesarse</em>" : ""}` : "Peso, estatura y objetivo para metas a tu medida (opcional)"}</small></div><span class="go">›</span>`;
}
function trendSvg() {
  const pts = weighs.slice(-12); if (pts.length < 2) return "";
  const W = 300, H = 110, pad = 10, ks = pts.map(p => +p.kg), mn = Math.min(...ks), mx = Math.max(...ks), rg = Math.max(.5, mx - mn);
  const xy = pts.map((p, i) => [pad + i * (W - pad * 2) / (pts.length - 1), H - pad - (p.kg - mn) / rg * (H - pad * 2)]);
  const d = xy.map(([a, b], i) => `${i ? "L" : "M"}${a.toFixed(1)},${b.toFixed(1)}`).join(" "), last = xy[xy.length - 1];
  const diff = ks[ks.length - 1] - ks[0], since = new Date(pts[0].day).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  return `<div class="btrend"><b>${diff === 0 ? "Estable" : (diff > 0 ? "+" : "−") + fmtKg(Math.abs(diff))} desde el ${since}</b><svg viewBox="0 0 ${W} ${H}" aria-label="Evolución de tu peso"><path d="${d}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${last[0]}" cy="${last[1]}" r="4.5" fill="var(--accent)"/></svg><small>Último: ${fmtKg(ks[ks.length - 1])} · pésate una vez por semana, siempre a la misma hora.</small></div>`;
}
function bodyModal() {
  let m = $("bodyModal"); if (m) return m;
  m = document.createElement("div"); m.id = "bodyModal"; m.className = "modal"; m.hidden = true; m.setAttribute("role", "dialog"); m.setAttribute("aria-label", "Tu cuerpo");
  m.innerHTML = `<div class="modal-in bodyin" id="bodyIn"></div>`; document.body.append(m);
  m.addEventListener("click", e => { if (e.target === m) m.hidden = true });
  return m;
}
function openBody() { bGoal = (bodyP && bodyP.goal) || null; bDelArm = false; bodyModal().hidden = false; drawBody() }
function drawBody() {
  const el = $("bodyIn"), last = lastWeigh(), kgNow = last ? last.kg : bodyP && bodyP.weight_kg;
  el.innerHTML = `<h2>Tu cuerpo</h2>
  <p class="priv">🔒 Solo lo ves tú. Tus amigos nunca verán tu peso ni tus medidas.</p>
  <div class="bgrid">
    <label>Estatura<div class="unit"><input id="bH" type="number" inputmode="numeric" min="120" max="230" placeholder="175" value="${bodyP && bodyP.height_cm ? bodyP.height_cm : ""}"><span>cm</span></div></label>
    <label>Peso de hoy<div class="unit"><input id="bW" type="number" inputmode="decimal" step="0.1" min="30" max="300" placeholder="72,5" value="${kgNow || ""}"><span>kg</span></div></label>
  </div>
  <div class="opt"><span>Tu objetivo</span><div class="row-sc">${[["perder", "Perder"], ["mantener", "Mantener"], ["ganar", "Ganar"]].map(([k, t]) => `<button class="pill" data-g="${k}" aria-pressed="${bGoal === k}">${t}</button>`).join("")}</div></div>
  <div class="bres" id="bRes"></div>
  <label class="bchk"><input type="checkbox" id="bAdj" checked> Ajustar mis hábitos de agua y pasos a estas metas</label>
  <button class="btn accent" id="bSave">Guardar</button>
  ${trendSvg()}
  <div class="bsug" id="bSug"></div>
  ${bodyP ? `<button class="ghost bdel" id="bDel">${bDelArm ? "Toca otra vez para borrar todos tus datos de cuerpo" : "Borrar mis datos de cuerpo"}</button>` : ""}
  <button class="ghost" id="bClose">Cerrar</button>`;
  const upd = () => {
    const kg = parseFloat(($("bW").value || "").replace(",", ".")), g = bGoal || "mantener";
    $("bRes").innerHTML = kg ? `<div><small>Agua al día</small><b>${waterL(kg).toLocaleString("es-ES")} L</b></div><div><small>Pasos al día</small><b>${stepsFor(g).toLocaleString("es-ES")}</b></div>` : `<div style="grid-column:1/-1"><small>Pon tu peso y te calculo el agua y los pasos (orientativo, no es consejo médico).</small></div>`;
    const sug = bGoal ? SUG[bGoal].filter(n => !habits.some(h => h.name.toLowerCase() === n.toLowerCase())) : [];
    $("bSug").innerHTML = sug.length ? `<span>Hábitos para tu objetivo</span><div class="chips">${sug.map(n => `<button data-n="${n}">+ ${n}</button>`).join("")}</div>` : "";
    $("bSug").querySelectorAll("button").forEach(b => { if (window.slotsLeft && slotsLeft() <= 0) b.disabled = true; b.onclick = () => addSug(b.dataset.n, b) });
  };
  el.querySelectorAll("[data-g]").forEach(b => b.onclick = () => { bGoal = b.dataset.g; el.querySelectorAll("[data-g]").forEach(x => x.setAttribute("aria-pressed", x === b)); upd() });
  $("bW").oninput = upd; upd();
  $("bSave").onclick = saveBody;
  $("bClose").onclick = () => { $("bodyModal").hidden = true };
  if ($("bDel")) $("bDel").onclick = delBody;
}
async function addSug(name, btn) {
  if (!uid) return; if (window.slotsLeft && slotsLeft() <= 0) { status(slotsMsg()); return }
  const id = name.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").slice(0, 40) + "-" + Date.now().toString(36);
  const row = { id, user_id: uid, name, area: "cuerpo", ord: Date.now(), active: true };
  habits = [...habits, { id, name, area: "cuerpo" }]; btn.disabled = true; render(); status(`Añadido: ${name}.`);
  if (uid !== "demo") write(() => sb.from("habits").insert(row));
}
async function saveBody() {
  const h = parseFloat(($("bH").value || "").replace(",", ".")) || null, kg = parseFloat(($("bW").value || "").replace(",", ".")) || null;
  if (kg && (kg < 30 || kg > 300)) return status("Revisa el peso: entre 30 y 300 kg.");
  if (h && (h < 120 || h > 230)) return status("Revisa la estatura: entre 120 y 230 cm.");
  bodyP = { height_cm: h, weight_kg: kg, goal: bGoal || "mantener" };
  if (kg) { const t = dayKey(0); weighs = weighs.filter(w => w.day !== t).concat([{ day: t, kg }]) }
  if ($("bAdj").checked && kg) {
    const L = waterL(kg).toLocaleString("es-ES"), S = stepsFor(bodyP.goal).toLocaleString("es-ES");
    habits.forEach(x => {
      let n = null;
      if (/agua|beber|hidrat/i.test(x.name)) n = `Beber ${L} litros de agua`;
      else if (/\bpasos\b/i.test(x.name)) n = `${S} pasos`;
      if (n && n !== x.name) { x.name = n; if (uid !== "demo") write(() => sb.from("habits").update({ name: n }).eq("id", x.id)) }
    });
    habits = [...habits];
  }
  if (uid && uid !== "demo") {
    write(() => sb.from("body_profile").upsert({ user_id: uid, ...bodyP, updated_at: new Date().toISOString() }, { onConflict: "user_id" }));
    if (kg) write(() => sb.from("weighins").upsert({ user_id: uid, day: dayKey(0), kg }, { onConflict: "user_id,day" }));
  }
  render(); renderBodyRow(); drawBody(); status("Guardado. Tus metas ya están a tu medida.");
}
async function delBody() {
  if (!bDelArm) { bDelArm = true; drawBody(); return }
  bodyP = null; weighs = []; bDelArm = false;
  if (uid && uid !== "demo") { write(() => sb.from("weighins").delete().eq("user_id", uid)); write(() => sb.from("body_profile").delete().eq("user_id", uid)) }
  $("bodyModal").hidden = true; renderBodyRow(); status("Tus datos de cuerpo se han borrado.");
}
if ($("bodyRow")) $("bodyRow").onclick = openBody;
const _lcB = window.loadCasa; window.loadCasa = async () => { await _lcB(); loadBody() };
const _drB = window.dailyRender; window.dailyRender = () => { if (_drB) _drB(); renderBodyRow() };
renderBodyRow();
/* Modo demo: datos de ejemplo para ver la gráfica (no se guardan) */
if (location.hash === "#demo") { weighs = [[-28, 78.4], [-21, 77.9], [-14, 77.6], [-7, 77.1]].map(([o, kg]) => ({ day: dayKey(o), kg })); bodyP = { height_cm: 178, weight_kg: 77.1, goal: "perder" }; renderBodyRow(); if (new URLSearchParams(location.search).get("shot") === "cuerpo") { setTab("casa"); setTimeout(openBody, 300) } }
