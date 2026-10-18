/* Levo · Tu estatua. Una figura clásica que emerge del bloque de mármol día a día (como los «Prisioneros» de Miguel Ángel).
   Cuántos días has esculpido decide cuánto ha salido del bloque; la fase decide los detalles (rostro, cabello, pliegues, pulido, laurel).
   «Nunca dejes de esculpir tu propia estatua» (Plotino, Enéadas I, 6, 9). */
const FASES = [
  [0, "Bloque de mármol", "Todo empieza aquí: una piedra sin forma y la decisión de empezar."],
  [1, "Primer golpe", "Has empezado. Lo más difícil ya está hecho."],
  [3, "Desbaste", "Empieza a intuirse una figura dentro de la piedra."],
  [7, "La forma", "Una semana. La cabeza ya asoma del bloque."],
  [14, "El rostro", "Dos semanas. Tu carácter empieza a tener cara."],
  [30, "Los detalles", "Un mes. Cabello, ropa, gesto: cada día afina algo."],
  [60, "El pulido", "Dos meses. La figura está libre y la piedra brilla."],
  [100, "Laureado", "Cien días. Te has esculpido a ti mismo."],
];
function faseDe(dias) { let i = 0; FASES.forEach((f, k) => { if (dias >= f[0]) i = k }); return { i, name: FASES[i][1], txt: FASES[i][2], next: FASES[i + 1] || null } }
const _rn = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) };
/* stage: fase 0–7 · name: placa · days: días esculpidos (decide cuánto ha salido) · look: "a" pelo corto rizado, "b" pelo recogido */
function statueSVG(stage, name = "", days, look = "a") {
  stage = Math.max(0, Math.min(7, stage | 0));
  if (days == null) days = FASES[stage][0];
  const e = Math.pow(Math.min(1, Math.max(0, days) / 50), .75), id = "m" + Math.random().toString(36).slice(2, 7), U = s => `url(#${id}${s})`;
  const defs = `<defs>
    <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdfcf8"/><stop offset=".55" stop-color="#ebe7de"/><stop offset="1" stop-color="#cdc6b9"/></linearGradient>
    <radialGradient id="${id}f" cx=".4" cy=".36" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#ece8df"/><stop offset="1" stop-color="#cbc3b5"/></radialGradient>
    <linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0"><stop offset=".45" stop-color="#1a1f3a" stop-opacity="0"/><stop offset="1" stop-color="#1a1f3a" stop-opacity=".2"/></linearGradient>
    <linearGradient id="${id}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6e1d7"/><stop offset="1" stop-color="#b9b0a1"/></linearGradient>
    <linearGradient id="${id}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d2f3a"/><stop offset="1" stop-color="#17181f"/></linearGradient>
    <linearGradient id="${id}h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="${id}o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6dc93"/><stop offset=".5" stop-color="#d9ad52"/><stop offset="1" stop-color="#9c7127"/></linearGradient>
  </defs>`;
  /* pedestal y placa */
  let g = `<path d="M42 212h116v9H42z" fill="#3a3c48"/><path d="M48 221h104v31H48z" fill="${U("p")}"/><path d="M42 212h116v2H42z" fill="#575a68"/>`;
  if (stage >= 6) g += `<rect x="76" y="229" width="48" height="15" rx="1.5" fill="${U("o")}"/><text x="100" y="239.6" text-anchor="middle" font-family="Archivo, Arial, sans-serif" font-weight="800" font-size="7" letter-spacing="1.3" fill="#3a2a0c">${String(name || "TÚ").toUpperCase().slice(0, 11).replace(/[<&]/g, "")}</text>`;
  /* la figura */
  const head = "M100 36C117 36 127 50 127 72C127 80 126 88 124 94C121 104 114 113 106 117Q100 120 94 117C86 113 79 104 76 94C74 88 73 80 73 72C73 50 83 36 100 36Z";
  const chest = "M87 128C76 133 56 135 44 142C33 149 29 161 29 174C29 184 33 192 40 197H160C167 192 171 184 171 174C171 161 167 149 156 142C144 135 124 133 113 128Z";
  const drape = "M154 140C160 152 158 170 148 186C142 194 134 197 128 197H82C102 186 122 170 134 152C139 145 146 140 154 140Z";
  let f = `<path d="M84 197h32l4 8H80z" fill="#d9d3c8"/><path d="M74 205h52l3 7H71z" fill="#e6e1d8"/>`;
  f += `<path d="${chest}" fill="${U("g")}"/>`;
  if (stage >= 3) f += `<path d="${drape}" fill="#e3ded4"/><path d="${drape}" fill="${U("s")}"/>`;
  f += `<path d="${chest}" fill="${U("s")}"/>`;
  f += `<path d="M89 106C89 116 88 124 85 133H115C112 124 111 116 111 106Z" fill="${U("g")}"/><path d="M104 108C106 118 108 126 111 133H115C112 124 111 116 111 106Z" fill="#1a1f3a" opacity=".1"/><ellipse cx="100" cy="121" rx="13" ry="5" fill="#1a1f3a" opacity=".09"/>`;
  /* orejas, cabeza */
  f += `<path d="M74.5 76C69.5 75 67.5 80 68.5 86S72.5 95 75.5 94Z" fill="#e4dfd5"/><path d="M125.5 76C130.5 75 132.5 80 131.5 86S127.5 95 124.5 94Z" fill="#d9d3c8"/>`;
  f += `<path d="${head}" fill="${U("f")}"/><path d="M100 36C117 36 127 50 127 72C127 80 126 88 124 94C121 104 114 113 106 117Q103 118.6 100 118.8C112 100 114 60 100 36Z" fill="#1a1f3a" opacity=".08"/>${stage < 3 ? `<g stroke="#8f8676" stroke-opacity=".35" stroke-width="1" stroke-linecap="round"><path d="M86 46l6-3M104 42l7 2M92 56l5-2M112 52l6 3"/></g>` : ""}`;
  /* cabello */
  if (look === "b") {
    f += `<ellipse cx="100" cy="31" rx="15" ry="10" fill="#e6e1d7"/><path d="M71 86C66 58 82 33 100 33S134 58 129 86C128 94 125 102 121 108C123 94 123 80 118 69C111 60 89 60 82 69C77 80 77 94 79 108C75 102 72 94 71 86Z" fill="#e8e3d9"/><path d="M100 34C104 46 106 54 108 60" fill="none" stroke="#1a1f3a" stroke-opacity=".14" stroke-width="1.1"/>`;
    if (stage >= 5) f += `<g fill="none" stroke="#1a1f3a" stroke-opacity=".13" stroke-width="1">${[0, 1, 2, 3].map(k => `<path d="M${84 - k * 3} ${44 + k * 9}C${80 - k * 3} ${58 + k * 8} ${76 - k} ${74 + k * 7} ${78 - k} ${92 + k * 4}"/><path d="M${116 + k * 3} ${44 + k * 9}C${120 + k * 3} ${58 + k * 8} ${124 + k} ${74 + k * 7} ${122 + k} ${92 + k * 4}"/>`).join("")}<path d="M88 28q12-6 24 0M90 34q10-4 20 0"/></g><path d="M74 62Q100 50 126 62" fill="none" stroke="#c9c1b2" stroke-width="2.4"/>`;
  } else {
    f += `<path d="M73 74C71 53 83 32 100 31S129 53 127 74C125 66 121 60 115 57C108 54 92 54 85 57C79 60 75 66 73 74Z" fill="#e8e3d9"/>`;
    if (stage >= 5) {
      let c = "";
      for (let k = 0; k <= 12; k++) { const t = k / 12, px = (1 - t) ** 2 * 75 + 2 * (1 - t) * t * 100 + t * t * 125, py = (1 - t) ** 2 * 71 + 2 * (1 - t) * t * 47 + t * t * 71; c += `<path d="M${(100 + (t - .5) * 16).toFixed(1)} 37Q${(100 + (t - .5) * 54).toFixed(1)} 42 ${px.toFixed(1)} ${py.toFixed(1)}"/>`; if (k > 1 && k < 11) c += `<path d="M${px.toFixed(1)} ${(py - 3).toFixed(1)}q${t < .5 ? 2 : -2} 3 ${t < .5 ? 1 : -1} 6"/>` }
      f += `<g fill="none" stroke="#1a1f3a" stroke-opacity=".14" stroke-width="1" stroke-linecap="round">${c}</g>`;
    } else if (stage >= 3) f += `<path d="M78 62Q100 50 122 62" fill="none" stroke="#1a1f3a" stroke-opacity=".08" stroke-width="3"/>`;
  }
  /* rostro */
  if (stage >= 4) f += `<g fill="#1a1f3a"><ellipse cx="88" cy="79" rx="8" ry="4.2" opacity=".07"/><ellipse cx="112" cy="79" rx="8" ry="4.2" opacity=".09"/></g>
    <path d="M81.5 80.6Q88 75.8 94.5 80.6Q88 83.6 81.5 80.6ZM105.5 80.6Q112 75.8 118.5 80.6Q112 83.6 105.5 80.6Z" fill="#dcd5c9"/><g fill="none" stroke="#1a1f3a" stroke-opacity=".22" stroke-width=".9"><circle cx="88.4" cy="80.2" r="2.3"/><circle cx="112.4" cy="80.2" r="2.3"/></g><g fill="#1a1f3a" opacity=".16"><circle cx="88.6" cy="80" r=".8"/><circle cx="112.6" cy="80" r=".8"/></g>
    <g fill="none" stroke="#1a1f3a" stroke-linecap="round"><path d="M80 72.5Q88 68.5 95.5 71.5M104.5 71.5Q112 68.5 120 72.5" stroke-opacity=".2" stroke-width="1.5"/><path d="M81.5 80.3Q88 75.6 94.5 80.3M105.5 80.3Q112 75.6 118.5 80.3" stroke-opacity=".34" stroke-width="1.2"/>
    <path d="M101.5 76C102.5 84 104 90 105.5 95.2" stroke-opacity=".16" stroke-width="1.4"/><path d="M95 96.3Q100 99.4 105 96.3" stroke-opacity=".24" stroke-width="1.2"/><path d="M96.4 95.4q-1.6 .4-1.8 1.6M103.6 95.4q1.6 .4 1.8 1.6" stroke-opacity=".2" stroke-width=".9"/>
    <path d="M92.5 104.2Q96.5 102.4 100 103.6Q103.5 102.4 107.5 104.2" stroke-opacity=".3" stroke-width="1.2"/><path d="M94.5 104.4Q100 106.4 105.5 104.4" stroke-opacity=".12" stroke-width="1"/><path d="M95.5 107.6Q100 109.8 104.5 107.6" stroke-opacity=".14" stroke-width="1.1"/><path d="M97 113Q100 114.4 103 113" stroke-opacity=".1" stroke-width="1"/></g>`;
  else if (stage >= 3) f += `<g fill="#1a1f3a" opacity=".06"><ellipse cx="88" cy="80" rx="8" ry="4"/><ellipse cx="112" cy="80" rx="8" ry="4"/><path d="M98 78l4 0 3 18h-10z"/></g>`;
  /* pliegues, clavículas */
  if (stage >= 5) f += `<g fill="none" stroke-linecap="round"><g stroke="#1a1f3a" stroke-opacity=".11" stroke-width="1.1"><path d="M148 150C144 164 134 178 118 191"/><path d="M155 160C151 172 143 184 132 193"/><path d="M139 146C132 160 121 174 103 188"/></g><g stroke="#fff" stroke-opacity=".45" stroke-width=".8"><path d="M151 153C147 166 138 179 124 191"/><path d="M143 147C137 161 126 175 110 189"/></g><path d="M88 139Q75 141 62 146" stroke="#1a1f3a" stroke-opacity=".12" stroke-width="1.3"/></g>`;
  else if (stage >= 3) f += `<path d="M88 139Q75 141 62 146" fill="none" stroke="#1a1f3a" stroke-opacity=".08" stroke-width="1.3"/>`;
  /* pulido y laurel */
  if (stage >= 6) f += `<path d="${chest}" fill="${U("h")}"/><path d="${head}" fill="${U("h")}"/><g fill="none" stroke="#9e9686" stroke-opacity=".28" stroke-width=".8"><path d="M54 182q14-8 22-3t20-5M60 160q10 4 16 0"/></g>`;
  if (stage >= 7) {
    let lv = "";
    const branch = (a0, a1) => { const n = 10; let s = ""; for (let k = 0; k < n; k++) { const a = (a0 + (a1 - a0) * k / (n - 1)) * Math.PI / 180, x = 100 + 30 * Math.cos(a), y = 51 - 14 * Math.sin(a), a2 = (a0 + (a1 - a0) * (k + .5) / (n - 1)) * Math.PI / 180, t = Math.atan2((51 - 14 * Math.sin(a2)) - y, (100 + 30 * Math.cos(a2)) - x) * 180 / Math.PI; for (const d of [-42, 42]) { const r = (t + d) * Math.PI / 180, cx = x + 5 * Math.cos(r), cy = y + 5 * Math.sin(r); s += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="2.8" ry="6.8" transform="rotate(${(t + d - 90).toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="${U("o")}" stroke="#7a5a1c" stroke-width=".35"/>` } } return s };
    lv = branch(178, 258) + branch(2, -78);
    f += `<path d="M70 51Q74 64 96 65M130 51Q126 64 104 65" fill="none" stroke="#9c7127" stroke-width="1.2"/>${lv}`;
  }
  /* el bloque que aún la envuelve: cada día esculpido lo rebaja */
  let blk = "";
  if (e < 1) {
    const top = 26 + e * 188, pts = [];
    for (let x = 28, k = 0; x <= 172; x += 8, k++) pts.push(`${x},${(top + (_rn(k + 3) - .5) * (e < .02 ? 4 : 12)).toFixed(1)}`);
    const poly = `28,213 ${pts.join(" ")} 172,213`;
    let marks = "";
    for (let k = 0; k < 34; k++) { const x = 34 + _rn(k * 7.3) * 132, y = top + 10 + _rn(k * 3.1 + 1) * 190; if (y < 206) marks += `<path d="M${x.toFixed(1)} ${y.toFixed(1)}l${(4 + _rn(k) * 6).toFixed(1)} ${(-2 - _rn(k + 9) * 3).toFixed(1)}"/>` }
    blk = `<clipPath id="${id}c"><polygon points="${poly}"/></clipPath><polygon points="${poly}" fill="${U("k")}"/>
      <g clip-path="url(#${id}c)"><g stroke="#8f8676" stroke-opacity=".38" stroke-width="1" stroke-linecap="round">${marks}</g><path d="M28 ${top + 40}L172 ${top + 30}" stroke="#fff" stroke-opacity=".12" stroke-width="18"/><rect x="150" y="0" width="22" height="213" fill="#1a1f3a" opacity=".07"/></g>
      <polyline points="${pts.join(" ")}" fill="none" stroke="#f4f1ea" stroke-width="1.4" stroke-linejoin="round"/>`;
    if (e > .02) blk += `<g fill="#d6cfc2"><path d="M30 212l6-7 6 4 5-5 5 8z"/><path d="M150 212l5-8 6 3 5-5 4 10z"/><circle cx="58" cy="209.5" r="1.8"/><circle cx="143" cy="209.8" r="1.4"/><circle cx="66" cy="210.4" r="1.1"/></g>`;
  }
  return `<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tu estatua: ${FASES[stage][1]}">${defs}${g}${f}${blk}</svg>`;
}
