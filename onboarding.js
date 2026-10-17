/* Levo · Onboarding a pantalla completa: personaje, hábitos, modo y regalo de bienvenida. */
const PRESETS = [
  { id: "agua", name: "Beber 2 litros de agua", area: "cuerpo", ico: "💧" },
  { id: "entreno", name: "Entrenar 30 min", area: "cuerpo", ico: "💪" },
  { id: "pasos", name: "8.000 pasos", area: "cuerpo", ico: "👟" },
  { id: "dormir", name: "Dormir 7 horas", area: "cuerpo", ico: "🌙" },
  { id: "tareas3", name: "Cerrar 3 tareas clave", area: "trabajo", ico: "✅" },
  { id: "foco", name: "2 h de trabajo profundo", area: "trabajo", ico: "🎯" },
  { id: "leer", name: "Leer 20 minutos", area: "mente", ico: "📚" },
  { id: "pausa", name: "10 min sin pantallas", area: "mente", ico: "🧘" },
  { id: "gastos", name: "Apuntar mis gastos", area: "vida", ico: "💶" },
  { id: "gente", name: "Hablar con alguien querido", area: "vida", ico: "💬" },
];
const HS = [["corto", "Corto"], ["rapado", "Rapado"], ["largo", "Largo"], ["rizado", "Rizado"], ["calvo", "Calvo"]];
const BEARDS = [["no", "Sin barba"], ["corta", "Corta"], ["completa", "Completa"]];
const GLASSES = [["no", "Sin gafas"], ["pasta", "De pasta"], ["sol", "De sol"]];
const ob = { open: false, step: 0, steps: [], look: {}, picks: new Set(), hard: false, edit: false, demo: false, wave: 0 };

const obCss = document.createElement("style");
obCss.textContent = `
.onb{position:fixed;inset:0;z-index:40;background:var(--bg);overflow:hidden;overflow:clip;display:flex;flex-direction:column}
.onb .aur{position:fixed;inset:0;overflow:hidden;pointer-events:none;filter:blur(70px);opacity:.55}
.onb .aur i{position:absolute;width:55vmax;height:55vmax;border-radius:50%;animation:drift 18s ease-in-out infinite alternate}
.onb .aur i:nth-child(1){background:#ff2d55;left:-10%;top:-15%}
.onb .aur i:nth-child(2){background:#ff9f0a;right:-15%;top:10%;animation-duration:22s}
.onb .aur i:nth-child(3){background:#5e5ce6;left:10%;bottom:-25%;animation-duration:26s}
@keyframes drift{to{transform:translate(8%,10%) scale(1.15)}}
@media (prefers-color-scheme:dark){.onb .aur{opacity:.38}}
.onb-in{position:relative;flex:1;width:100%;max-width:480px;margin:0 auto;display:flex;flex-direction:column;padding:calc(env(safe-area-inset-top,0px) + 16px) max(22px,env(safe-area-inset-right,0px)) calc(env(safe-area-inset-bottom,0px) + 18px) max(22px,env(safe-area-inset-left,0px));min-height:0}
.onb-top{display:flex;gap:6px;margin-bottom:22px}
.onb-top i{flex:1;height:4px;border-radius:99px;background:color-mix(in srgb,var(--fg) 12%,transparent);overflow:hidden}
.onb-top i b{display:block;height:100%;width:0;background:var(--fg);border-radius:99px;transition:width .5s var(--ease)}
.onb-top i.done b{width:100%}
.onb-body{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:20px;min-height:0;padding-bottom:8px}
.onb h1{margin:0;font-size:36px;font-weight:800;letter-spacing:-.045em;line-height:1.02;text-wrap:balance}
.onb h1 em{font-style:normal;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.onb .lead{margin:0;font-size:17px;color:var(--muted);line-height:1.35;max-width:34ch}
.onb-cta{display:grid;gap:10px;padding-top:12px}
.onb-cta .btn{min-height:58px;border-radius:18px;font-size:18px;font-weight:700;background:var(--grad);color:#fff;box-shadow:0 10px 30px rgba(255,45,85,.35);transition:transform .2s var(--spring),opacity .2s}
.onb-cta .btn:active{transform:scale(.97)}
.onb-cta .btn:disabled{opacity:.35;box-shadow:none}
.onb-cta .back{background:none;border:0;color:var(--muted);font-weight:600;font-size:15px;padding:6px}
.stage{position:relative;align-self:center;width:220px;height:230px;display:grid;place-items:end center}
.stage::before{content:"";position:absolute;bottom:6px;width:180px;height:46px;border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--fg) 18%,transparent),transparent)}
.stage::after{content:"";position:absolute;inset:10px 20px 30px;border-radius:50%;background:conic-gradient(from 0deg,#ff2d5555,#ff9f0a55,#30d15855,#0a84ff55,#ff2d5555);filter:blur(30px);animation:spin 12s linear infinite;z-index:0}
@keyframes spin{to{transform:rotate(1turn)}}
.stage canvas{position:relative;z-index:1;width:192px;height:208px;image-rendering:pixelated}
.dice{position:absolute;right:0;top:6px;z-index:2;width:44px;height:44px;border-radius:14px;border:0;background:var(--surface);font-size:22px;box-shadow:0 4px 14px rgba(0,0,0,.12);transition:transform .3s var(--spring)}
.dice:active{transform:rotate(-20deg) scale(.9)}
.opt{display:grid;gap:10px}
.opt > span{font-size:13px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.row-sc{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 4px;scrollbar-width:none}
.row-sc::-webkit-scrollbar{display:none}
.sw{flex:none;width:40px;height:40px;border-radius:50%;border:0;background:var(--c);box-shadow:inset 0 -4px 0 rgba(0,0,0,.18);transition:transform .25s var(--spring)}
.sw[aria-pressed="true"]{transform:scale(1.08);box-shadow:inset 0 -4px 0 rgba(0,0,0,.18),0 0 0 3px var(--bg),0 0 0 5px var(--fg)}
.pill{flex:none;border:0;border-radius:99px;padding:10px 16px;background:var(--surface);font-weight:600;font-size:15px;transition:background .2s,color .2s,transform .2s var(--spring)}
.pill[aria-pressed="true"]{background:var(--fg);color:var(--bg)}
.pill:active{transform:scale(.95)}
.hgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.hcard{position:relative;border:0;text-align:left;background:var(--surface);border-radius:20px;padding:14px;display:grid;gap:10px;min-height:104px;transition:transform .25s var(--spring),box-shadow .25s}
.hcard .e{font-size:26px}
.hcard b{font-size:15px;font-weight:600;line-height:1.2}
.hcard small{font-size:12px;font-weight:700;color:var(--c);text-transform:uppercase}
.hcard[aria-pressed="true"]{box-shadow:0 0 0 3px var(--c);transform:translateY(-2px)}
.hcard[aria-pressed="true"]::after{content:"✓";position:absolute;top:12px;right:12px;width:24px;height:24px;border-radius:50%;background:var(--c);color:#fff;display:grid;place-items:center;font-size:14px;font-weight:800}
.hcard:disabled{opacity:.4}
.count{align-self:flex-start;font-family:var(--rounded);font-weight:800;font-size:15px;padding:6px 12px;border-radius:99px;background:var(--surface)}
.mcard{border:0;text-align:left;background:var(--surface);border-radius:24px;padding:20px;display:grid;gap:8px;transition:transform .25s var(--spring),box-shadow .25s}
.mcard b{font-size:22px;font-weight:800;letter-spacing:-.03em;display:flex;align-items:center;gap:10px}
.mcard p{margin:0;color:var(--muted);font-size:15px}
.mcard ul{margin:4px 0 0;padding:0;list-style:none;display:grid;gap:4px;font-size:14px;font-weight:600}
.mcard[aria-pressed="true"]{box-shadow:0 0 0 3px var(--fg);transform:translateY(-2px)}
.mcard.hard[aria-pressed="true"]{box-shadow:0 0 0 3px var(--cuerpo)}
.gifts{display:flex;justify-content:center;gap:18px;margin-top:10px}
.gift-c{display:grid;justify-items:center;gap:8px;animation:giftpop .7s var(--spring) both}
.gift-c:nth-child(2){animation-delay:.15s}
.gift-c i{width:104px;height:104px;border-radius:28px;display:grid;place-items:center;font-size:48px;font-style:normal;background:radial-gradient(circle at 50% 40%,#2a3566,#141a38);box-shadow:0 12px 30px rgba(20,26,56,.35)}
.gift-c img{width:76px;height:76px;image-rendering:pixelated}
.gift-c b{font-size:15px;font-weight:700}
@keyframes giftpop{from{opacity:0;transform:scale(.6) translateY(20px)}to{opacity:1;transform:none}}
.slide{animation:slide .45s var(--ease) both}
@keyframes slide{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}
.onb.out{animation:fadeout .45s var(--ease) forwards}
@keyframes fadeout{to{opacity:0;transform:scale(1.04)}}
.rescue{display:flex;align-items:center;gap:12px;border-radius:var(--r);padding:14px 16px;color:#fff;background:linear-gradient(120deg,#ff2d55,#ff9f0a);box-shadow:0 8px 24px rgba(255,45,85,.3)}
.rescue.escudo{background:linear-gradient(120deg,#5e5ce6,#0a84ff);box-shadow:0 8px 24px rgba(10,132,255,.3)}
.rescue.ok{background:linear-gradient(120deg,#30d158,#0a84ff)}
.rescue i{font-style:normal;font-size:26px;width:44px;height:44px;display:grid;place-items:center;border-radius:14px;background:rgba(255,255,255,.2);flex:none}
.rescue small{color:rgba(255,255,255,.9);font-size:13px}
.day.st-escudo b::after,.day.st-rescate b::after{position:absolute;font-size:11px;margin:22px 0 0 22px}
.day b{position:relative}
.day.st-escudo b::after{content:"🛡️"}
.day.st-rescate b::after{content:"✨"}
`;
document.head.append(obCss);

function obEl() {
  let el = $("onb"); if (el) return el;
  el = document.createElement("div"); el.id = "onb"; el.className = "onb"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Bienvenida a Levo");
  el.innerHTML = `<div class="aur"><i></i><i></i><i></i></div><div class="onb-in"><div class="onb-top" id="obTop"></div><div class="onb-body" id="obBody"></div><div class="onb-cta"><button class="btn" id="obNext"></button><button class="back" id="obBack">Atrás</button></div></div>`;
  document.body.append(el);
  $("obNext").onclick = next; $("obBack").onclick = () => { if (ob.step > 0) { ob.step--; draw() } };
  return el;
}
function openOnboarding(edit) {
  ob.open = true; ob.edit = !!edit; ob.step = 0;
  ob.look = { ...LOOK_DEF, ...(outfit._look || {}) };
  ob.hard = outfit._cfg ? !!outfit._cfg.hard : (habits.length ? true : false);
  ob.picks = new Set(); ob.name = (outfit._cfg && outfit._cfg.name) || "";
  ob.steps = edit ? ["look", "modo"] : habits.length ? ["hola", "look", "modo", "regalo"] : ["hola", "look", "habitos", "modo", "regalo"];
  obEl().hidden = false; obEl().classList.remove("out"); draw(); tickPreview();
}
function obClose() { const el = obEl(); el.classList.add("out"); setTimeout(() => { el.hidden = true; ob.open = false }, 450) }
function pressed(b, on) { b.setAttribute("aria-pressed", on ? "true" : "false") }
function draw() {
  const s = ob.steps[ob.step], body = $("obBody");
  $("obTop").innerHTML = ob.steps.map((_, i) => `<i class="${i < ob.step || (i === ob.step) ? "done" : ""}"><b></b></i>`).join("");
  $("obBack").hidden = ob.step === 0 || s === "regalo";
  const keep = ob.lastStep === ob.step ? body.scrollTop : 0;
  body.innerHTML = ""; const w = document.createElement("div"); w.className = ob.lastStep === ob.step ? "" : "slide"; ob.lastStep = ob.step; requestAnimationFrame(() => body.scrollTop = keep); w.style.cssText = "display:flex;flex-direction:column;gap:20px"; body.append(w);
  const next = $("obNext"); next.disabled = false;
  if (s === "hola") {
    w.innerHTML = `<h1>Tú, en versión <em>pixel</em>.<br>Subiendo de nivel.</h1><p class="lead">Cada hábito que cumples hace crecer a tu personaje, su casa y tus premios. Si fallas, también lo nota.</p><div class="stage"><canvas id="obCv" width="48" height="52"></canvas></div>`;
    next.textContent = "Crear mi personaje";
  }
  if (s === "look") {
    w.innerHTML = `<h1>${ob.edit ? "Tu personaje" : "¿Cómo eres?"}</h1><input id="obName" maxlength="18" placeholder="Tu nombre (lo verán tus amigos)" autocomplete="given-name"><div class="stage"><canvas id="obCv" width="48" height="52"></canvas><button class="dice" id="obDice" aria-label="Aspecto aleatorio">🎲</button></div>`;
    const group = (label, items, key, isSw) => {
      const g = document.createElement("div"); g.className = "opt"; g.innerHTML = `<span>${label}</span><div class="row-sc"></div>`;
      const row = g.querySelector(".row-sc");
      items.forEach((it, i) => {
        const b = document.createElement("button");
        if (isSw) { b.className = "sw"; b.style.setProperty("--c", it); b.setAttribute("aria-label", `${label} ${i + 1}`); pressed(b, ob.look[key] === i); b.onclick = () => { ob.look[key] = i; draw() } }
        else { b.className = "pill"; b.textContent = it[1]; pressed(b, ob.look[key] === it[0]); b.onclick = () => { ob.look[key] = it[0]; ob.wave = 1; draw() } }
        row.append(b);
      });
      w.append(g);
    };
    $("obName").value = ob.name || ""; $("obName").oninput = e => { ob.name = e.target.value.trim() };
    group("Piel", SKINS, "skin", true); group("Peinado", HS, "hs"); group("Color de pelo", HAIRS, "hc", true); group("Barba", BEARDS, "beard"); group("Gafas", GLASSES, "glasses");
    $("obDice").onclick = () => { const r = a => Math.floor(Math.random() * a); ob.look = { skin: r(SKINS.length), hs: HS[r(HS.length)][0], hc: r(HAIRS.length), beard: BEARDS[r(3)][0], glasses: GLASSES[r(3)][0] }; ob.wave = 1.2; draw() };
    next.textContent = ob.edit ? "Siguiente" : "Este soy yo";
  }
  if (s === "habitos") {
    w.innerHTML = `<h1>Empieza con <em>3</em>.</h1><p class="lead">Pocos y fáciles. Cada nivel abre 2 huecos más.</p><span class="count" id="obCount"></span><div class="hgrid" id="obGrid"></div>`;
    PRESETS.forEach(p => {
      const b = document.createElement("button"); b.className = "hcard"; b.style.setProperty("--c", `var(--${p.area})`);
      b.innerHTML = `<span class="e">${p.ico}</span><b></b><small>${AREAS.find(a => a[0] === p.area)[1]}</small>`; b.querySelector("b").textContent = p.name;
      pressed(b, ob.picks.has(p.id)); b.disabled = !ob.picks.has(p.id) && ob.picks.size >= 3;
      b.onclick = () => { ob.picks.has(p.id) ? ob.picks.delete(p.id) : ob.picks.add(p.id); draw() };
      $("obGrid").append(b);
    });
    $("obCount").textContent = `${ob.picks.size} de 3`;
    next.textContent = ob.picks.size === 3 ? "Listo" : `Elige ${3 - ob.picks.size} más`; next.disabled = ob.picks.size !== 3;
  }
  if (s === "modo") {
    w.innerHTML = `<h1>¿Cómo de <em>exigente</em>?</h1><p class="lead">Puedes cambiarlo cuando quieras desde Casa.</p>`;
    [[false, "🌿 Normal", "Para crear el hábito sin agobios.", ["Escudos y días de rescate", "Sin castigos de XP"]], [true, "🔥 Modo duro", "Para quien quiere no poder escaquearse.", ["+50 % de monedas", "−50 XP por cada día fallado", "Tu personaje enferma si fallas 2 días"]]].forEach(([hard, t, p, li]) => {
      const b = document.createElement("button"); b.className = "mcard" + (hard ? " hard" : ""); pressed(b, ob.hard === hard);
      b.innerHTML = `<b>${t}</b><p>${p}</p><ul>${li.map(x => `<li>${x}</li>`).join("")}</ul>`; b.onclick = () => { ob.hard = hard; draw() }; w.append(b);
    });
    next.textContent = ob.edit ? "Guardar" : "Continuar";
  }
  if (s === "regalo") {
    const plant = MUEBLES.find(m => m.id === "planta");
    w.innerHTML = `<h1>Tu regalo de <em>bienvenida</em>.</h1><p class="lead">Un escudo para tu primer día malo y una planta para tu casa nueva.</p><div class="gifts"><div class="gift-c"><i>🛡️</i><b>Escudo de racha</b></div><div class="gift-c"><i><img alt="" src="${iconFor(plant)}"></i><b>Planta</b></div></div>`;
    next.textContent = "Entrar en mi casa";
    setTimeout(() => burst(w.querySelector(".gifts")), 350);
  }
}
async function next() {
  const s = ob.steps[ob.step];
  if (ob.step < ob.steps.length - 1) { ob.step++; draw(); return }
  // guardar
  outfit = { ...outfit, _look: ob.look, _cfg: { ...(outfit._cfg || {}), hard: ob.hard, onb: true, name: ob.name || (outfit._cfg && outfit._cfg.name) || "" } };
  HARD = ob.hard;
  if (!ob.demo && uid && uid !== "demo") {
    write(() => sb.from("profile").upsert({ user_id: uid, outfit, updated_at: new Date().toISOString() }, { onConflict: "user_id" }));
    if (!ob.edit) {
      if (!habits.length && ob.picks.size) {
        const rows = PRESETS.filter(p => ob.picks.has(p.id)).map((p, i) => ({ id: `${p.id}-${uid.slice(0, 8)}`, user_id: uid, name: p.name, area: p.area, ord: i, active: true }));
        habits = rows.map(r => ({ id: r.id, name: r.name, area: r.area }));
        write(() => sb.from("habits").insert(rows));
      }
      if (!owned("planta")) { const row = { user_id: uid, item: "planta", kind: "item", cost: 0, at: new Date().toISOString() }; purchases = [...purchases, row]; write(() => sb.from("purchases").insert(row)) }
    }
  } else if (!ob.edit && !habits.length) habits = PRESETS.filter(p => ob.picks.has(p.id)).map(p => ({ id: p.id, name: p.name, area: p.area }));
  render(); renderCasa(); obClose();
  status(ob.edit ? "Personaje guardado." : "Bienvenido a Levo.");
}
function tickPreview() {
  if (!ob.open) return;
  const cv = $("obCv");
  if (cv) { const x = cv.getContext("2d"); x.imageSmoothingEnabled = false; x.clearRect(0, 0, 48, 52); if (ob.wave > 0) ob.wave -= 1 / 30; drawAvatar(x, 24, 48, { ...outfit, _look: ob.look }, "feliz", blink, 0, ob.wave > 0 || ob.steps[ob.step] === "hola" && Math.floor(Date.now() / 900) % 3 === 0) }
  setTimeout(tickPreview, 33);
}
window.maybeOnboard = () => { if (uid && uid !== "demo" && !(outfit._cfg && outfit._cfg.onb) && !ob.open) openOnboarding(false) };
window.openOnboarding = openOnboarding;
window.onboardingRender = () => { const t = $("hardToggle"); if (t) t.textContent = HARD ? "🔥 Modo duro" : "🌿 Modo normal" };
if ($("editLook")) $("editLook").onclick = () => openOnboarding(true);
if ($("hardToggle")) $("hardToggle").onclick = () => openOnboarding(true);
if (location.hash === "#onb") { ob.demo = true; uid = "demo"; loaded = true; habits = []; days = {}; openOnboarding(false) }
