// Avisos estoicos de Levo. GitHub Actions lo lanza cada 15 minutos.
// Al despertar (hora de cada usuario): la frase del día. 13:00: lo que falta. 21:00: el examen nocturno.
import fs from "node:fs";
import webpush from "web-push";
const { SUPABASE_URL: U, SUPABASE_SERVICE_KEY: K, VAPID_PUBLIC, VAPID_PRIVATE, FORZAR = "" } = process.env;
webpush.setVapidDetails("https://paraeditores.github.io/levo/", VAPID_PUBLIC, VAPID_PRIVATE);
const H = { apikey: K, Authorization: `Bearer ${K}`, "Content-Type": "application/json" };
const api = async (path, opt = {}) => {
  const r = await fetch(`${U}/rest/v1/${path}`, { ...opt, headers: { ...H, ...(opt.headers || {}) } });
  if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
  return r.status === 204 ? null : r.json().catch(() => null);
};
const { FRASES, fraseDelDia } = new Function(fs.readFileSync(new URL("../content.js", import.meta.url), "utf8") + ";return { FRASES, fraseDelDia };")();
const send = async (subs, title, body, tag) => { for (const s of subs) { try { await webpush.sendNotification(s.sub, JSON.stringify({ title, body, tag })); console.log("Enviado:", body.slice(0, 80)) } catch (e) { console.log("Fallo push:", e.statusCode); if (e.statusCode === 404 || e.statusCode === 410) await api(`push_subs?endpoint=eq.${encodeURIComponent(s.endpoint)}`, { method: "DELETE" }) } } };

/* Toques entre amigos (si los hay) */
const pend = await api("nudges?sent=eq.false&select=id,from_id,to_id");
if (pend.length) {
  const allSubs = await api("push_subs?select=endpoint,user_id,sub"), rooms = await api("rooms?select=user_id,name");
  for (const n of pend) { const name = (rooms.find(r => r.user_id === n.from_id) || {}).name || "Un amigo"; await send(allSubs.filter(x => x.user_id === n.to_id), "Levo", `${name} te recuerda tu ritual de hoy.`, "toque"); await api(`nudges?id=eq.${n.id}`, { method: "PATCH", body: JSON.stringify({ sent: true }) }) }
}

const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date()).map(x => [x.type, x.value]));
const today = `${p.year}-${p.month}-${p.day}`, nowMin = +p.hour * 60 + +p.minute;
const subs = await api("push_subs?select=endpoint,user_id,sub");
for (const uid of [...new Set(subs.map(s => s.user_id))]) {
  const mine = subs.filter(s => s.user_id === uid);
  const prof = (await api(`profile?user_id=eq.${uid}&select=outfit`))[0];
  const cfg = (prof && prof.outfit && prof.outfit.lv2) || {};
  const [wh, wm] = (cfg.wake || "05:00").split(":").map(Number), wake = wh * 60 + wm;
  const win = { amanecer: [wake, wake + 90], mediodia: [13 * 60, 15 * 60], examen: [21 * 60, 23 * 60 + 30] };
  let slot = FORZAR || Object.keys(win).find(k => nowMin >= win[k][0] && nowMin < win[k][1]);
  if (!slot) continue;
  if (!FORZAR) { const ya = await api(`avisos?user_id=eq.${uid}&day=eq.${today}&slot=eq.${slot}&select=slot`); if (ya.length) continue }
  const j = ((await api(`journal?user_id=eq.${uid}&day=eq.${today}&select=data`))[0] || {}).data || {};
  const habits = await api(`habits?user_id=eq.${uid}&active=eq.true&select=id`), done = ((await api(`days?user_id=eq.${uid}&day=eq.${today}&select=done`))[0] || {}).done || {};
  const hd = habits.filter(h => done[h.id]).length;
  const aff = (j.aff || []).filter(s => s && s.trim()).length, tasks = (j.tasks || []).filter(t => t && t.t && t.t.trim()), meals = ["desayuno", "comida", "cena"].filter(m => j.meals && j.meals[m]).length;
  const steps = [!!j.wake, !!j.breath, !!j.commit, aff >= 3, tasks.length && tasks.filter(t => t.done).length >= Math.min(2, tasks.length), habits.length && hd / habits.length >= .6, meals >= 3, !!(j.exam && (j.exam.bien || j.exam.mejorar || j.exam.gracias))];
  const f = fraseDelDia(today);
  let body;
  if (slot === "prueba") body = "Aviso de prueba: si lees esto, los avisos funcionan.";
  else if (slot === "amanecer") body = `«${f.t}» — ${f.a}. Tu ritual te espera.`;
  else if (slot === "mediodia") {
    const falta = [!j.breath && "respirar", aff < 3 && "afirmaciones", !tasks.length && "tus 3 tareas", habits.length && hd < habits.length && `${habits.length - hd} hábitos`, meals < 2 && "apuntar tus comidas"].filter(Boolean);
    body = falta.length ? `Te falta: ${falta.join(", ")}. Cada paso esculpe tu estatua.` : "Vas firme. Sigue así esta tarde.";
  } else body = "Antes de dormir, tu examen: ¿qué hiciste bien?, ¿qué puedes mejorar?, ¿qué agradeces?" + (steps.filter(Boolean).length < 6 ? " Aún puedes completar el ritual de hoy." : "");
  await send(mine, "Levo", body.length > 180 ? body.slice(0, 177) + "…" : body, slot);
  if (slot !== "prueba") await api("avisos", { method: "POST", headers: { Prefer: "resolution=ignore-duplicates" }, body: JSON.stringify({ user_id: uid, day: today, slot }) });
}
