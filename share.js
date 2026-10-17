/* Levo · Resumen semanal compartible (imagen 1080×1920 para historias). */
function summaryWeek() {
  const today = dateOf(0), wd = (today.getDay() + 6) % 7, mon = new Date(today);
  mon.setDate(today.getDate() - wd - (wd === 0 ? 7 : 0)); /* los lunes, la semana pasada */
  const all = Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d });
  const upTo = wd === 0 ? 7 : wd + 1, ds = all.slice(0, upTo).map(fmt).filter(k => k >= START);
  const pcts = all.map((d, i) => i < upTo && fmt(d) >= START ? Math.round(frac(fmt(d)) * 100) : null);
  const avg = ds.length ? Math.round(ds.reduce((t, k) => t + frac(k) * 100, 0) / ds.length) : 0;
  const done = ds.reduce((t, k) => t + habits.filter(h => doneFor(k)[h.id]).length, 0);
  let coinsW = 0; ds.forEach(k => { if (k < START) return; const n = habits.filter(h => doneFor(k)[h.id]).length, f = frac(k); let e = 5 * n + (f >= .6 ? 20 : 0) + (f === 1 ? 50 : 0); if (prevStreak(k) >= 7) e *= 2; if (HARD) e = Math.round(e * 1.5); coinsW += e });
  const star = habits.map(h => ({ h, n: ds.filter(k => doneFor(k)[h.id]).length })).sort((a, b) => b.n - a.n)[0];
  const end = all[6], f = d => d.toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "");
  return { all, pcts, avg, done, coinsW, star, label: `${f(all[0])} – ${f(end)}`, past: wd === 0, upTo, ds: ds.length };
}
function roundRect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath() }
function buildStory() {
  const S = summaryWeek(), W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H; const x = c.getContext("2d");
  const F = (w, s) => `${w} ${s}px -apple-system, "SF Pro Display", "Segoe UI", system-ui, sans-serif`;
  const grad = (x0, x1) => { const g = x.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, "#ff2d55"); g.addColorStop(.35, "#ff9f0a"); g.addColorStop(.68, "#30d158"); g.addColorStop(1, "#0a84ff"); return g };
  // fondo
  x.fillStyle = "#0a0d1f"; x.fillRect(0, 0, W, H);
  [["#ff2d55", 120, 220, 620], ["#ff9f0a", 980, 520, 560], ["#5e5ce6", 200, 1500, 700], ["#30d158", 960, 1750, 520]].forEach(([col, cx, cy, r]) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, col + "66"); g.addColorStop(1, col + "00"); x.fillStyle = g; x.fillRect(0, 0, W, H) });
  // cabecera
  x.textBaseline = "alphabetic"; x.fillStyle = grad(80, 360); x.font = F(800, 92); x.fillText("Levo", 80, 170);
  x.fillStyle = "rgba(255,255,255,.72)"; x.font = F(600, 38); x.fillText((S.past ? "Mi semana · " : "Mi semana hasta hoy · ") + S.label, 80, 230);
  // habitación
  const rc = document.createElement("canvas"); drawRoom(rc);
  x.save(); roundRect(x, 60, 290, 960, 760, 48); x.clip(); const bg = x.createRadialGradient(540, 560, 60, 540, 620, 640); bg.addColorStop(0, "#2a3566"); bg.addColorStop(1, "#0f1430"); x.fillStyle = bg; x.fillRect(60, 290, 960, 760);
  x.imageSmoothingEnabled = false; { const k = Math.min(960 / rc.width, 760 / rc.height), w2 = rc.width * k, h2 = rc.height * k; x.drawImage(rc, 60 + (960 - w2) / 2, 290 + (760 - h2) / 2, w2, h2) } x.restore();
  // porcentaje grande
  x.fillStyle = grad(80, 700); x.font = F(800, 260); x.fillText(`${S.avg}`, 72, 1330);
  const w = x.measureText(`${S.avg}`).width; x.font = F(800, 110); x.fillText("%", 90 + w, 1330);
  x.fillStyle = "#ffffff"; x.font = F(700, 44); x.fillText("de mis hábitos cumplidos", 82, 1395);
  // barras de la semana
  const days = ["L", "M", "X", "J", "V", "S", "D"], bx = 600, by = 1150, bw = 46, gap = 18, bh = 240;
  S.pcts.forEach((p, i) => {
    const a = bx + i * (bw + gap); x.fillStyle = "rgba(255,255,255,.12)"; roundRect(x, a, by, bw, bh, 23); x.fill();
    if (p) { const h = Math.max(46, bh * p / 100); const g = x.createLinearGradient(0, by + bh - h, 0, by + bh); g.addColorStop(0, p >= 60 ? "#30d158" : "#ff9f0a"); g.addColorStop(1, p >= 60 ? "#0a84ff" : "#ff2d55"); x.fillStyle = g; roundRect(x, a, by + bh - h, bw, h, 23); x.fill() }
    x.fillStyle = "rgba(255,255,255,.7)"; x.font = F(700, 30); x.textAlign = "center"; x.fillText(days[i], a + bw / 2, by + bh + 46); x.textAlign = "left";
  });
  // estadísticas
  const stats = [["🔥", `${streak()}`, streak() === 1 ? "día de racha" : "días de racha"], ["⭐", `Nivel ${level()}`, `${xp()} XP`], ["🪙", `+${S.coinsW}`, "monedas"]];
  stats.forEach(([ico, big, small], i) => {
    const a = 60 + i * 330, b = 1480; x.fillStyle = "rgba(255,255,255,.1)"; roundRect(x, a, b, 300, 190, 36); x.fill();
    x.fillStyle = "#ffffff"; x.font = F(400, 54); x.fillText(ico, a + 30, b + 78); x.fillStyle = "#ffffff"; x.font = F(800, 50); x.fillText(big, a + 30, b + 140);
    x.fillStyle = "rgba(255,255,255,.65)"; x.font = F(600, 28); x.fillText(small, a + 30, b + 176);
  });
  // hábito estrella
  if (S.star && S.star.n) { x.fillStyle = "rgba(255,255,255,.1)"; roundRect(x, 60, 1700, 960, 110, 36); x.fill(); x.fillStyle = "#ffffff"; x.font = F(400, 46); x.fillText("🏆", 90, 1772); x.fillStyle = "#ffffff"; x.font = F(700, 36); let t = `Hábito estrella: ${S.star.h.name}`; while (x.measureText(t).width > 760 && t.length > 10) t = t.slice(0, -2); x.fillText(t + (t.endsWith(S.star.h.name) ? "" : "…"), 160, 1758); x.fillStyle = "rgba(255,255,255,.65)"; x.font = F(600, 28); x.fillText(`${S.star.n} de ${S.ds} días`, 160, 1794) }
  x.fillStyle = "rgba(255,255,255,.55)"; x.font = F(600, 30); x.textAlign = "center"; x.fillText("Mi yo pixel sube de nivel cuando yo cumplo · Levo", W / 2, 1875); x.textAlign = "left";
  return { canvas: c, S };
}

const sCss = document.createElement("style");
sCss.textContent = `
.weekcard{display:flex;align-items:center;gap:14px;border:0;width:100%;text-align:left;border-radius:var(--r);padding:16px;color:#fff;background:linear-gradient(120deg,#ff2d55,#ff9f0a 45%,#30d158 75%,#0a84ff);background-size:200% 100%;animation:sheen 8s ease-in-out infinite alternate;box-shadow:0 10px 26px rgba(255,45,85,.28)}
.weekcard i{font-style:normal;width:46px;height:46px;border-radius:14px;display:grid;place-items:center;font-size:24px;background:rgba(255,255,255,.22);flex:none}
.weekcard b{font-size:18px;font-weight:800;letter-spacing:-.02em;display:block}
.weekcard small{font-size:13px;color:rgba(255,255,255,.9)}
.weekcard span.go{margin-left:auto;font-weight:800;font-size:22px}
.smodal .modal-in{gap:14px;padding:18px}
.smodal img{width:100%;max-height:58vh;object-fit:contain;border-radius:18px;box-shadow:0 12px 34px rgba(0,0,0,.35)}
.smodal p{margin:0;color:var(--muted);font-size:13px}
`;
document.head.append(sCss);
function shareModal() {
  let m = $("shareModal"); if (m) return m;
  m = document.createElement("div"); m.id = "shareModal"; m.className = "modal smodal"; m.hidden = true; m.setAttribute("role", "dialog"); m.setAttribute("aria-label", "Compartir mi semana");
  m.innerHTML = `<div class="modal-in"><img id="sImg" alt="Resumen de tu semana en Levo"><button class="btn accent" id="sGo" style="width:100%">Compartir</button><p id="sHint">Si no se abre el menú, mantén pulsada la imagen para guardarla.</p><button class="ghost" id="sClose" style="width:100%">Cerrar</button></div>`;
  document.body.append(m); $("sClose").onclick = () => { m.hidden = true }; return m;
}
function openShare() {
  const { canvas, S } = buildStory(), m = shareModal(); m.hidden = false;
  const url = canvas.toDataURL("image/png"); $("sImg").src = url;
  $("sGo").onclick = () => canvas.toBlob(async blob => {
    const file = new File([blob], "levo-mi-semana.png", { type: "image/png" });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: `Mi semana en Levo: ${S.avg} % de mis hábitos cumplidos.` }); status("Compartido."); return }
    } catch (e) { if (e && e.name === "AbortError") return }
    const a = document.createElement("a"); a.href = url; a.download = "levo-mi-semana.png"; document.body.append(a); a.click(); a.remove();
    $("sHint").textContent = "Imagen descargada. También puedes mantenerla pulsada para guardarla.";
  }, "image/png");
}
function renderWeekCard() {
  const el = $("weekCard"); if (!el) return;
  if (!uid || !habits.length) { el.hidden = true; return }
  const S = summaryWeek(); el.hidden = false;
  el.innerHTML = `<i>📸</i><div class="pt"><b>${S.past ? "Tu semana pasada" : "Tu semana"} · ${S.avg} %</b><small>Comparte tu resumen en Instagram</small></div><span class="go">›</span>`;
}
if ($("weekCard")) $("weekCard").onclick = openShare;
const _dr = window.dailyRender; window.dailyRender = () => { if (_dr) _dr(); renderWeekCard() };
renderWeekCard();
