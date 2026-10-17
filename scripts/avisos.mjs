// Manda el aviso de Mini Esteban que toca según la hora de Madrid. Lo lanza GitHub Actions cada hora.
import webpush from "web-push";
const { SUPABASE_URL: U, SUPABASE_SERVICE_KEY: K, VAPID_PUBLIC, VAPID_PRIVATE, FORZAR = "" } = process.env;
webpush.setVapidDetails("https://paraeditores.github.io/levo/", VAPID_PUBLIC, VAPID_PRIVATE);
const H = { apikey: K, Authorization: `Bearer ${K}`, "Content-Type": "application/json" };
const api = async (path, opt = {}) => {
  const r = await fetch(`${U}/rest/v1/${path}`, { ...opt, headers: { ...H, ...(opt.headers || {}) } });
  if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
  return r.status === 204 ? null : r.json().catch(() => null);
};

const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date()).map(x => [x.type, x.value]));
const today = `${p.year}-${p.month}-${p.day}`, hour = +p.hour;
const shift = n => { const d = new Date(today + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const SLOTS = [[8, "manana"], [13, "mediodia"], [18, "tarde"], [22, "cierre"]];
let slot = FORZAR || (SLOTS.filter(([h]) => h <= hour && hour - h < 2).pop() || [])[1];
if (!slot) { console.log(`Madrid ${hour}h: no toca aviso.`); process.exit(0); }
const START = "2026-10-17";

const subs = await api("push_subs?select=endpoint,user_id,sub");
const users = [...new Set(subs.map(s => s.user_id))];
for (const uid of users) {
  if (!FORZAR) {
    const ya = await api(`avisos?user_id=eq.${uid}&day=eq.${today}&slot=eq.${slot}&select=slot`);
    if (ya.length) { console.log(`${slot} ya enviado.`); continue; }
  }
  const habits = await api(`habits?user_id=eq.${uid}&active=eq.true&select=id,name,area&order=ord`);
  const rows = await api(`days?user_id=eq.${uid}&day=gte.${shift(-2)}&select=day,done`);
  const done = d => (rows.find(r => r.day === d) || {}).done || {};
  const frac = d => habits.length ? habits.filter(h => done(d)[h.id]).length / habits.length : 0;
  const t = done(today), pct = Math.round(frac(today) * 100);
  const missing = habits.filter(h => !t[h.id]).map(h => h.name);
  const list = (n) => missing.slice(0, n).join(", ") + (missing.length > n ? ` y ${missing.length - n} más` : "");
  const yesterdayFailed = shift(-1) >= START && frac(shift(-1)) < .6;
  let title = "Levo", body;
  if (slot === "prueba") body = "Aviso de prueba: si lees esto, las notificaciones funcionan.";
  else if (slot === "manana") body = `Buenos días. Hoy toca: ${list(3)}. Empieza por lo más fácil.`;
  else if (!missing.length) body = slot === "cierre" ? "Día perfecto: 100 %. Me has dejado como nuevo." : "Lo tienes todo hecho. Sigue así.";
  else if (slot === "mediodia") body = `Vas por el ${pct} %. Te faltan: ${list(4)}.`;
  else if (slot === "tarde") {
    const ent = habits.find(h => h.area === "cuerpo" && /entren/i.test(h.name));
    body = ent && !t[ent.id] ? `Aún no has entrenado y vas por el ${pct} %. Es ahora o nada.` : `Vas por el ${pct} %. Te faltan: ${list(4)}.`;
  } else {
    body = pct >= 60 ? `Día salvado: ${pct} %. Si quieres más XP aún te queda: ${list(3)}.`
      : `Vas por el ${pct} %. Si no llegas al 60 % antes de dormir pierdes 50 XP` + (yesterdayFailed ? " y mañana amanezco enfermo." : ".") + ` Te falta: ${list(3)}.`;
    if (pct < 60) title = "Levo ⚠️";
  }
  for (const s of subs.filter(s => s.user_id === uid)) {
    try { await webpush.sendNotification(s.sub, JSON.stringify({ title, body, tag: slot })); console.log("Enviado:", body); }
    catch (e) {
      console.log("Fallo push:", e.statusCode, e.body);
      if (e.statusCode === 404 || e.statusCode === 410) await api(`push_subs?endpoint=eq.${encodeURIComponent(s.endpoint)}`, { method: "DELETE" });
    }
  }
  if (slot !== "prueba") await api("avisos", { method: "POST", headers: { Prefer: "resolution=ignore-duplicates" }, body: JSON.stringify({ user_id: uid, day: today, slot }) });
  await api("log", { method: "POST", body: JSON.stringify({ user_id: uid, text: body.slice(0, 160), kind: "aviso" }) });
}
