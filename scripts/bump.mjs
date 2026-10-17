// Marca una versión nueva antes de publicar: cambia ?v= en todos los archivos y escribe version.json.
// Uso: node scripts/bump.mjs
import fs from "node:fs";
const v = Date.now().toString(36);
let h = fs.readFileSync("index.html", "utf8");
h = h.replace(/(src|href)="((?:[a-z-]+)\.(?:js|css))(?:\?v=[a-z0-9]+)?"/g, (m, a, f) => `${a}="${f}?v=${v}"`);
if (/<meta name="levo-version"/.test(h)) h = h.replace(/<meta name="levo-version" content="[^"]*">/, `<meta name="levo-version" content="${v}">`);
else h = h.replace("<title>Levo</title>", `<title>Levo</title>\n<meta name="levo-version" content="${v}">`);
fs.writeFileSync("index.html", h);
fs.writeFileSync("version.json", JSON.stringify({ v }) + "\n");
console.log("Versión", v);
