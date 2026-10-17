/* Levo · Tu estatua: un bloque de mármol que se esculpe con cada día de ritual.
   «Nunca dejes de esculpir tu propia estatua» (Plotino, Enéadas I, 6, 9). */
const FASES = [
  [0, "Bloque de mármol", "Todo empieza aquí: una piedra sin forma."],
  [1, "Primer golpe", "Has empezado. Lo más difícil ya está hecho."],
  [3, "Desbaste", "Empieza a intuirse una figura."],
  [7, "La forma", "Una semana de ritual. Ya se ve quién eres."],
  [14, "El rostro", "Dos semanas. Tu carácter toma rostro."],
  [30, "Los detalles", "Un mes. Cada día afina un detalle."],
  [60, "El pulido", "Dos meses. La piedra brilla."],
  [100, "Laureado", "Cien días. Te has esculpido a ti mismo."],
];
function faseDe(dias) { let i = 0; FASES.forEach((f, k) => { if (dias >= f[0]) i = k }); return { i, name: FASES[i][1], txt: FASES[i][2], next: FASES[i + 1] || null } }
function statueSVG(stage, name = "") {
  const id = "m" + Math.random().toString(36).slice(2, 7);
  const defs = `<defs>
    <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6f3ec"/><stop offset=".55" stop-color="#e3ddd2"/><stop offset="1" stop-color="#c9c2b5"/></linearGradient>
    <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ddd7cb"/><stop offset="1" stop-color="#b8b0a2"/></linearGradient>
    <linearGradient id="${id}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2a27"/><stop offset="1" stop-color="#1a1918"/></linearGradient>
    <linearGradient id="${id}h" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".45" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
    <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e2bd7a"/><stop offset="1" stop-color="#9b7234"/></linearGradient>
  </defs>`;
  const ped = `<path d="M44 212h112v10H44z" fill="#34322e"/><path d="M50 222h100v30H50z" fill="url(#${id}p)"/><path d="M44 212h112v2H44z" fill="#4a4741"/>` +
    (stage >= 6 ? `<rect x="78" y="229" width="44" height="14" rx="1.5" fill="url(#${id}b)"/><text x="100" y="239" text-anchor="middle" font-family="Cinzel, Georgia, serif" font-size="7" letter-spacing="1.2" fill="#2a1f0e">${(name || "TÚ").toUpperCase().slice(0, 10)}</text>` : "");
  const dust = stage <= 3 ? `<g fill="#cfc8bb" opacity=".85"><path d="M46 212l6-7 7 4 5-6 6 9z"/><path d="M134 212l5-8 6 3 6-5 3 10z"/><circle cx="64" cy="209" r="2"/><circle cx="140" cy="209" r="1.6"/><circle cx="120" cy="210" r="1.2"/></g>` : "";
  let body = "";
  if (stage === 0) {
    body = `<path d="M40 212V40l3-6 54-3 59 2 4 5v174z" fill="url(#${id}r)"/><path d="M40 40l3-6 54-3 59 2 4 5-60 3z" fill="#e7e2d8"/>
      <g stroke="#a69e90" stroke-width="1" opacity=".6"><path d="M60 80l14 4M118 70l12-6M80 150l10 8M128 160l-9 7M58 190l12-3"/></g>`;
  } else if (stage === 1) {
    body = `<path d="M42 212V64l12-28 40-6 44 2 18 22 4 18v140z" fill="url(#${id}r)"/><path d="M54 36l40-6 44 2 18 22-58 4z" fill="#e7e2d8"/>
      <g stroke="#a69e90" stroke-width="1" opacity=".55"><path d="M70 90l12 5M120 86l10-6M86 160l8 7"/></g><path d="M138 32l18 22-12 2z" fill="#cbc4b7"/>`;
  } else if (stage === 2) {
    const pts = "44,178 48,148 64,134 87,126 88,112 76,104 71,78 80,50 100,38 120,50 129,78 124,104 112,112 113,126 136,134 152,148 156,178 130,196 100,200 70,196";
    body = `<polygon points="${pts}" fill="url(#${id}r)"/><path d="M90 199h20l3 8H87zM78 206h44l2 6H76z" fill="url(#${id}r)"/>
      <g fill="#ffffff" opacity=".2"><polygon points="71,78 80,50 100,38 100,84"/><polygon points="48,148 64,134 87,126 92,198 70,196 44,178"/></g>
      <g fill="#000000" opacity=".09"><polygon points="100,38 120,50 129,78 100,84"/><polygon points="113,126 136,134 152,148 156,178 130,196 108,198"/></g>`;
  } else {
    const head = "M100 38C119 38 129 54 129 76C129 96 120 112 106 118Q100 120 94 118C80 112 71 96 71 76C71 54 81 38 100 38Z";
    const chest = "M87 126C80 130 66 132 56 140C46 148 43 162 44 178C60 194 82 200 100 200C118 200 140 194 156 178C157 162 154 148 144 140C134 132 120 130 113 126Z";
    const M = `url(#${id}g)`;
    body = `<path d="M90 199h20l3 8H87z" fill="#cfc8bb"/><path d="M78 206h44l2 6H76z" fill="#ddd6ca"/>
      <path d="${chest}" fill="${M}"/><path d="M100 200C118 200 140 194 156 178C157 162 154 148 144 140C134 132 120 130 113 126L106 128C112 160 108 186 100 200Z" fill="#000" opacity=".07"/>
      <path d="M88 106h24l2 26H86z" fill="${M}"/><path d="M104 106h8l2 26h-8z" fill="#000" opacity=".08"/>
      <path d="${head}" fill="${M}"/><path d="M100 38C119 38 129 54 129 76C129 96 120 112 106 118Q103 119 100 119C112 100 114 60 100 38Z" fill="#000" opacity=".07"/>`;
    if (stage >= 4) body += `<g fill="#000" opacity=".085"><ellipse cx="88.5" cy="81" rx="6.5" ry="3.3"/><ellipse cx="111.5" cy="81" rx="6.5" ry="3.3"/></g>
      <path d="M100 82L96.8 96Q100 98.4 103.2 96" fill="none" stroke="#000" stroke-opacity=".17" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M93 105Q100 108.5 107 105" fill="none" stroke="#000" stroke-opacity=".2" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M82 75Q88.5 71.5 95 75M105 75Q111.5 71.5 118 75" fill="none" stroke="#000" stroke-opacity=".13" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M71.5 78q-4 5 0 11M128.5 78q4 5 0 11" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="1.2"/>`;
    if (stage >= 5) body += `<g fill="none" stroke="#000" stroke-opacity=".11" stroke-width="1.2">${[[80, 56], [88, 49], [97, 45], [106, 45], [115, 49], [122, 57], [76, 65], [125, 66]].map(([x, y]) => `<path d="M${x - 4} ${y}a4 4 0 0 1 8 0"/>`).join("")}<path d="M88 134Q76 138 62 142M112 134Q124 138 138 142M100 140v24M74 168Q87 178 100 172Q113 178 126 168"/></g>`;
    if (stage >= 6) body += `<path d="${chest}" fill="url(#${id}h)"/><path d="${head}" fill="url(#${id}h)"/><g fill="none" stroke="#9c9486" stroke-opacity=".3" stroke-width=".8"><path d="M58 182q14-8 22-3t20-5M122 156q8 6 18 2M84 56q6 8 2 16"/></g>`;
    if (stage >= 7) { let lv = ""; for (let i = 0; i <= 14; i++) { const ang = Math.PI * (1.08 + i * .06), cx = 100 + Math.cos(ang) * 30.5, cy = 70 + Math.sin(ang) * 23, rot = ang * 180 / Math.PI + (i < 7 ? 60 : 120); lv += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="2.6" ry="6.2" transform="rotate(${rot.toFixed(0)} ${cx.toFixed(1)} ${cy.toFixed(1)})" fill="url(#${id}b)" stroke="#6e5022" stroke-width=".4"/>` } body += `<path d="M70 72Q100 40 130 72" fill="none" stroke="#9b7234" stroke-width="1.4"/>${lv}` }
  }
  return `<svg viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Tu estatua: ${FASES[Math.min(stage, 7)][1]}">${defs}${ped}${dust}${body}</svg>`;
}
