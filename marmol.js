/* Levo · Tu estatua en 3D. Una cabeza escaneada en mármol que emerge de un bloque de piedra según tus días esculpidos.
   Luz que orbita despacio, giro con el dedo, respiración y lascas de mármol al esculpir.
   Modelo: «Lee Perry-Smith» de Infinite Realities (CC BY 3.0), vía los ejemplos de three.js. Si no hay WebGL, se queda la estatua en SVG. */
import * as THREE from "three";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/environments/RoomEnvironment.js";
const MODEL = "https://cdn.jsdelivr.net/gh/mrdoob/three.js@r160/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb";
const V3 = THREE.Vector3;
let R, scene, cam, world, bust, headMat, block, blockMat, laurel, keyL, dust = null, clip, H = 3, ok = false;
let host = null, raf = 0, e = 0, eT = 0, stage = 0, rotY = 0, vel = 0, drag = false, lastX = 0, shake = 0, t0 = performance.now();

/* Vetas de mármol dibujadas en un lienzo: sutiles, en grises */
function marbleTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 1024; const x = c.getContext("2d");
  x.fillStyle = "#f3f3f3"; x.fillRect(0, 0, 1024, 1024);
  let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let v = 0; v < 18; v++) {
    let px = rnd() * 1024, py = rnd() * 1024, a = rnd() * Math.PI * 2;
    x.strokeStyle = `rgba(110,110,110,${(.05 + rnd() * .12).toFixed(3)})`; x.lineWidth = .6 + rnd() * 2.4; x.beginPath(); x.moveTo(px, py);
    for (let k = 0; k < 60; k++) { a += (rnd() - .5) * .6; px += Math.cos(a) * 14; py += Math.sin(a) * 14; x.lineTo(px, py) }
    x.stroke();
  }
  for (let k = 0; k < 9000; k++) { const g = 200 + rnd() * 55 | 0; x.fillStyle = `rgba(${g},${g},${g},.25)`; x.fillRect(rnd() * 1024, rnd() * 1024, 1.2, 1.2) }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function blockGeometry(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d, 18, 10, 18); g.translate(0, h / 2, 0);
  const p = g.attributes.position; let s = 3; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i), xx = p.getX(i), zz = p.getZ(i);
    if (y > h - .001) p.setY(i, y + (rnd() - .5) * .5);                                   /* cara de arriba, tallada a golpes */
    const edge = Math.abs(Math.abs(xx) - w / 2) < .001 || Math.abs(Math.abs(zz) - d / 2) < .001;
    if (edge && y > h - .5) { p.setX(i, xx + (rnd() - .5) * .04); p.setZ(i, zz + (rnd() - .5) * .04) }  /* caras laterales, irregulares */
  }
  g.computeVertexNormals(); return g;
}
async function init() {
  const cv = document.createElement("canvas"), gl = cv.getContext("webgl2") || cv.getContext("webgl"); if (!gl) throw new Error("sin WebGL");
  R = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  R.setPixelRatio(Math.min(2, devicePixelRatio)); R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = .95; R.localClippingEnabled = true;
  R.domElement.className = "m3d";
  scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(), .04).texture;
  cam = new THREE.PerspectiveCamera(30, 200 / 260, .1, 100);
  keyL = new THREE.DirectionalLight(0xffffff, 1.9); scene.add(keyL);
  const rim = new THREE.DirectionalLight(0xffffff, 1.4); rim.position.set(-4, 3, -5); scene.add(rim);
  scene.add(new THREE.AmbientLight(0xffffff, .22));
  world = new THREE.Group(); scene.add(world);
  const gltf = await new GLTFLoader().loadAsync(MODEL);
  const head = gltf.scene.children[0];
  headMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: marbleTexture(), roughness: .45, metalness: 0, clearcoat: .3, clearcoatRoughness: .45 });
  head.material = headMat;
  bust = new THREE.Group(); bust.add(head); world.add(bust);
  let box = new THREE.Box3().setFromObject(bust), size = box.getSize(new V3());
  head.scale.multiplyScalar(H / size.y);
  box = new THREE.Box3().setFromObject(bust); const c = box.getCenter(new V3());
  head.position.x -= c.x; head.position.z -= c.z; head.position.y -= box.min.y;
  box = new THREE.Box3().setFromObject(bust); size = box.getSize(new V3());
  /* pedestal */
  const pm = new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: .5 });
  const p1 = new THREE.Mesh(new THREE.BoxGeometry(size.x * 1.6, .32, size.z * 1.5), pm); p1.position.y = -.16; world.add(p1);
  const p2 = new THREE.Mesh(new THREE.BoxGeometry(size.x * 1.45, .9, size.z * 1.35), new THREE.MeshStandardMaterial({ color: 0x141414, roughness: .7 })); p2.position.y = -.77; world.add(p2);
  /* el bloque que envuelve la figura: baja con cada día esculpido; lo que queda por debajo del pedestal se recorta */
  clip = new THREE.Plane(new V3(0, 1, 0), 0);
  blockMat = new THREE.MeshStandardMaterial({ color: 0xb4b4b4, roughness: .9, flatShading: true, clippingPlanes: [clip], side: THREE.DoubleSide, map: marbleTexture() });
  block = new THREE.Mesh(blockGeometry(size.x * 1.08, H + .5, size.z * 1.04), blockMat); world.add(block);
  /* laurel de plata para la fase final */
  laurel = new THREE.Group(); const lm = new THREE.MeshStandardMaterial({ color: 0xdedede, metalness: .9, roughness: .28 });
  const rr = size.x * .47; laurel.add(new THREE.Mesh(new THREE.TorusGeometry(rr, .025, 8, 64), lm));
  const leaf = new THREE.SphereGeometry(.11, 10, 8); leaf.scale(1, .38, 2.3);
  for (let k = 0; k < 30; k++) { const a = (k / 30) * Math.PI * 2; if (Math.abs(Math.sin(a / 2)) < .1) continue; const m = new THREE.Mesh(leaf, lm); m.position.set(Math.cos(a) * rr, 0, Math.sin(a) * rr); m.rotation.y = -a + (k % 2 ? .5 : -.5); m.rotation.z = (k % 2 ? .4 : -.4); laurel.add(m) }
  laurel.rotation.x = .12; laurel.position.y = H * .8; laurel.visible = false; bust.add(laurel);
  /* girar con el dedo (sin bloquear el scroll vertical) */
  const el = R.domElement; el.style.touchAction = "pan-y";
  el.addEventListener("pointerdown", ev => { drag = true; lastX = ev.clientX; vel = 0 });
  addEventListener("pointermove", ev => { if (!drag) return; const dx = ev.clientX - lastX; lastX = ev.clientX; rotY += dx * .012; vel = dx * .012 });
  addEventListener("pointerup", () => drag = false); addEventListener("pointercancel", () => drag = false);
  document.addEventListener("visibilitychange", () => { if (!document.hidden && host) loop() });
  ok = true;
}
function apply() {
  if (!ok) return;
  headMat.roughness = stage >= 6 ? .24 : stage >= 4 ? .38 : .55; headMat.clearcoat = stage >= 6 ? .7 : .25;
  laurel.visible = stage >= 7;
}
function size() {
  if (!host) return; const w = host.clientWidth || 260, h = Math.round(w * 1.3);
  R.setSize(w, h, false); R.domElement.style.width = w + "px"; R.domElement.style.height = h + "px"; cam.aspect = w / h; cam.updateProjectionMatrix();
}
function loop() {
  cancelAnimationFrame(raf);
  const step = now => {
    if (!host || !host.isConnected || document.hidden) { raf = 0; return }
    const t = (now - t0) / 1000;
    e += (eT - e) * .035;                                                         /* el bloque baja despacio */
    const top = (H + .25) - e * (H + .55); block.visible = e < .995; block.position.y = top - (H + .5);
    if (!drag) { vel *= .94; rotY += vel; const auto = Math.sin(t * .22) * .42; rotY += (auto - rotY) * .012 }
    world.rotation.y = rotY; world.position.y = Math.sin(t * .9) * .025;           /* respiración */
    clip.constant = -world.position.y;
    const la = t * .35; keyL.position.set(Math.cos(la) * 5, 3.2, Math.sin(la) * 5 + 3);   /* la luz orbita y recorre el mármol */
    shake *= .9; cam.position.set((Math.random() - .5) * shake, 1.9 + (Math.random() - .5) * shake, 10.6); cam.lookAt(0, 1.3, 0);
    if (dust) { const p = dust.geometry.attributes.position, v = dust.userData.v; dust.userData.life -= .016; for (let i = 0; i < v.length; i++) { v[i].y -= .006; p.setXYZ(i, p.getX(i) + v[i].x, p.getY(i) + v[i].y, p.getZ(i) + v[i].z) } p.needsUpdate = true; dust.material.opacity = Math.max(0, dust.userData.life); if (dust.userData.life <= 0) { world.remove(dust); dust = null } }
    R.render(scene, cam); raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}
const ready = init().then(() => { window.Statue3D.ok = true; dispatchEvent(new Event("statue3d")) }).catch(err => { console.info("Estatua 3D no disponible:", err && err.message) });
window.Statue3D = {
  ok: false,
  /* Coloca la escultura en el contenedor; el SVG queda debajo como respaldo */
  mount(el, { days = 0, stage: st = 0 } = {}) {
    if (!ok || !el) return false;
    const target = Math.max(.1, Math.pow(Math.min(1, Math.max(0, days) / 50), .75));
    if (host !== el) { e = Math.max(0, target - .06); host = el; el.append(R.domElement); el.classList.add("has3d") }
    eT = target; stage = st; apply(); size(); loop(); return true;
  },
  /* Lascas de mármol saltando del bloque y un pequeño temblor */
  burst() {
    if (!ok || !host) return; shake = .06;
    const n = 70, pos = new Float32Array(n * 3), v = [], top = (H + .25) - e * (H + .55);
    for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - .5) * 1.8; pos[i * 3 + 1] = Math.max(.1, top); pos[i * 3 + 2] = (Math.random() - .5) * 1.4; v.push(new V3((Math.random() - .5) * .05, .03 + Math.random() * .05, (Math.random() - .5) * .05)) }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    if (dust) world.remove(dust);
    const col = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const r = Math.random(), c = r < .15 ? [1, .23, .19] : r < .3 ? [.18, .42, 1] : [.93, .93, .93]; col.set(c, i * 3) } g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    dust = new THREE.Points(g, new THREE.PointsMaterial({ vertexColors: true, size: .08, transparent: true, opacity: 1, depthWrite: false })); dust.userData = { v, life: 1.3 }; world.add(dust);
    eT = Math.min(1, eT + .015);
  },
  ready,
};
addEventListener("resize", () => size());
