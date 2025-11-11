// Three.js poetic background for Dr. Rajiv Raj
// - Floating Devanagari glyph sprites
// - Gently flowing particle field like ink-in-water
// - Soft parallax on cursor

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { EffectComposer } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://unpkg.com/three@0.160.0/examples/jsm/postprocessing/UnrealBloomPass.js';

const container = document.getElementById('three-container');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 2000);

// Post-processing composer with gentle bloom
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.6, 0.85);
bloom.threshold = 0.2; bloom.strength = 1.0; bloom.radius = 0.6;
composer.addPass(bloom);
camera.position.set(0, 0, 60);

// Lights with warm poetic tones
const keyLight = new THREE.PointLight(0xff7a33, 1.2, 0, 2);
keyLight.position.set(40, 20, 40);
scene.add(keyLight);
const fillLight = new THREE.PointLight(0xff2e86, 0.8, 0, 2);
fillLight.position.set(-30, -10, 30);
scene.add(fillLight);

// Layer 1: flowing particle field
const particleCount = 2500;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  positions[i3 + 0] = THREE.MathUtils.randFloatSpread(200);
  positions[i3 + 1] = THREE.MathUtils.randFloatSpread(120);
  positions[i3 + 2] = THREE.MathUtils.randFloat(-40, 40);
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const pMat = new THREE.PointsMaterial({
  size: 1.6,
  color: new THREE.Color('#ff8f4b'),
  opacity: 0.75,
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// Layer 1.5: twinkling sparkles
const sparkleCount = 600;
const sparklePos = new Float32Array(sparkleCount * 3);
for (let i = 0; i < sparkleCount; i++) {
  const i3 = i * 3;
  sparklePos[i3 + 0] = THREE.MathUtils.randFloatSpread(140);
  sparklePos[i3 + 1] = THREE.MathUtils.randFloatSpread(80);
  sparklePos[i3 + 2] = THREE.MathUtils.randFloat(-12, 12);
}
const sparkleGeo = new THREE.BufferGeometry();
sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePos, 3));
const sparkleMat = new THREE.PointsMaterial({ size: 0.95, color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
scene.add(sparkles);

// Layer 2: floating Devanagari glyph sprites made from canvas textures
const glyphs = ['क', 'ख', 'ग', 'घ', 'च', 'ज', 'ट', 'ठ', 'ड', 'ढ', 'त', 'थ', 'द', 'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'ष', 'स', 'ह', 'क्ष', 'त्र', 'ज्ञ'];
const glyphGroup = new THREE.Group();
scene.add(glyphGroup);

// Constellation lines connecting nearby glyphs
const maxLines = 60;
const linePositions = new Float32Array(maxLines * 6); // 2 points per line
const lineGeo = new THREE.BufferGeometry();
lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
const lineMat = new THREE.LineBasicMaterial({ color: 0xff5aa8, transparent: true, opacity: 0.18 });
const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
scene.add(lineMesh);

function makeGlyphTexture(char, size = 180) {
  const cnv = document.createElement('canvas');
  cnv.width = cnv.height = size;
  const ctx = cnv.getContext('2d');
  // radial ink gradient
  const g = ctx.createRadialGradient(size*0.45, size*0.45, size*0.2, size*0.5, size*0.5, size*0.6);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(1, '#ffd6a8');
  ctx.fillStyle = g; ctx.fillRect(0,0,size,size);

  ctx.font = `bold ${Math.floor(size*0.5)}px Noto Serif Devanagari, Noto Sans Devanagari, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1a0014';
  ctx.shadowColor = 'rgba(255, 0, 119, 0.35)';
  ctx.shadowBlur = 16;
  ctx.fillText(char, size/2, size/2 + size*0.05);

  const tex = new THREE.CanvasTexture(cnv);
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy?.() || 1);
  tex.needsUpdate = true;
  return tex;
}

const glyphSprites = [];
for (let i = 0; i < 120; i++) {
  const char = glyphs[Math.floor(Math.random() * glyphs.length)];
  const tex = makeGlyphTexture(char);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: THREE.MathUtils.randFloat(0.35, 0.8) });
  const sprite = new THREE.Sprite(mat);
  const s = THREE.MathUtils.randFloat(4, 10);
  sprite.scale.set(s, s, 1);
  sprite.position.set(
    THREE.MathUtils.randFloatSpread(120),
    THREE.MathUtils.randFloatSpread(70),
    THREE.MathUtils.randFloat(-20, 20)
  );
  sprite.userData = { speed: THREE.MathUtils.randFloat(0.1, 0.6), off: Math.random() * Math.PI * 2 };
  glyphGroup.add(sprite);
  glyphSprites.push(sprite);
}

// Subtle parallax
const targetRot = { x: 0, y: 0 };
window.addEventListener('pointermove', (e) => {
  const rx = (e.clientY / innerHeight - 0.5) * 0.2;
  const ry = (e.clientX / innerWidth - 0.5) * 0.3;
  targetRot.x = rx; targetRot.y = ry;
});

// Poetic add-ons -----------------------------------------------------------
// 1) Calligraphy flow: a ribbon-like particle trail along a wavy curve
const calligraphyGroup = new THREE.Group();
scene.add(calligraphyGroup);

function makeDotTexture(size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  g.addColorStop(0, 'rgba(255, 209, 102, 0.9)');
  g.addColorStop(1, 'rgba(255, 0, 119, 0.0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(size/2, size/2, size/2, 0, Math.PI*2); ctx.fill();
  const t = new THREE.CanvasTexture(c); t.needsUpdate = true; return t;
}
const dotTex = makeDotTexture();
const ribbonCount = 160;
const ribbonSprites = [];
for (let i = 0; i < ribbonCount; i++) {
  const m = new THREE.SpriteMaterial({ map: dotTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7 });
  const s = new THREE.Sprite(m);
  s.scale.setScalar(THREE.MathUtils.randFloat(0.6, 1.4));
  s.userData = { u: i / ribbonCount };
  calligraphyGroup.add(s); ribbonSprites.push(s);
}

function curveAt(u, t) {
  // wavy path across the screen
  const x = (u - 0.5) * 130;
  const y = 10 * Math.sin(u * Math.PI * 3 + Math.sin(t * 0.5) * 0.6);
  const z = 8 * Math.cos(u * Math.PI * 2 + Math.cos(t * 0.4) * 0.4);
  return new THREE.Vector3(x, y, z);
}

// 2) Drifting poem lines
const linesGroup = new THREE.Group();
scene.add(linesGroup);
const poemLines = [
  'शब्दों की सुरभि',
  'भावों की नदी',
  'यादें झीनी रे',
  'मैं हिंदुस्तान हूँ',
  'वेदना के फूल'
];
function makeLineTexture(text) {
  const padX = 32, padY = 20;
  const tmp = document.createElement('canvas');
  const ctx = tmp.getContext('2d');
  ctx.font = '700 44px Noto Serif Devanagari, serif';
  const metrics = ctx.measureText(text);
  const w = Math.ceil(metrics.width) + padX * 2;
  const h = 88 + padY * 2;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const cctx = c.getContext('2d');
  const g = cctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#ff6a00'); g.addColorStop(0.5, '#ff0077'); g.addColorStop(1, '#ffd166');
  // background veil
  cctx.fillStyle = 'rgba(0,0,0,0.12)'; cctx.fillRect(0, 0, w, h);
  cctx.font = '700 44px Noto Serif Devanagari, serif';
  cctx.textAlign = 'center'; cctx.textBaseline = 'middle';
  cctx.fillStyle = g; cctx.fillText(text, w/2, h/2 + 4);
  const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true; tex.anisotropy = 4; return tex;
}
const lineSprites = [];
for (let i = 0; i < poemLines.length; i++) {
  const tex = makeLineTexture(poemLines[i]);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.28, depthWrite: false });
  const sp = new THREE.Sprite(mat);
  const scale = THREE.MathUtils.randFloat(14, 22);
  const aspect = tex.image.width / tex.image.height;
  sp.scale.set(scale * aspect, scale, 1);
  sp.position.set(THREE.MathUtils.randFloatSpread(100), THREE.MathUtils.randFloatSpread(40), THREE.MathUtils.randFloat(-10, 5));
  sp.userData = { vx: THREE.MathUtils.randFloat(0.06, 0.12), off: Math.random() * Math.PI * 2 };
  linesGroup.add(sp); lineSprites.push(sp);
}

// 3) Ink ripples on click
const ripples = [];
function makeRingTexture(size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.clearRect(0,0,size,size);
  ctx.lineWidth = size * 0.05;
  const g = ctx.createRadialGradient(size/2, size/2, size*0.2, size/2, size/2, size*0.5);
  g.addColorStop(0, 'rgba(255, 213, 128, 0.95)');
  g.addColorStop(1, 'rgba(255, 0, 119, 0.0)');
  ctx.strokeStyle = g;
  ctx.beginPath(); ctx.arc(size/2, size/2, size*0.35, 0, Math.PI*2); ctx.stroke();
  const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true; return tex;
}
const ringTex = makeRingTexture();
function screenToWorld(x, y, planeZ = 0) {
  const nx = (x / innerWidth) * 2 - 1;
  const ny = -(y / innerHeight) * 2 + 1;
  const v = new THREE.Vector3(nx, ny, 0.5).unproject(camera);
  const dir = v.sub(camera.position).normalize();
  const dist = (planeZ - camera.position.z) / dir.z;
  return camera.position.clone().add(dir.multiplyScalar(dist));
}
function spawnRipple(x, y) {
  const mat = new THREE.SpriteMaterial({ map: ringTex, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
  const s = new THREE.Sprite(mat);
  s.position.copy(screenToWorld(x, y, 0));
  s.scale.setScalar(1);
  s.userData = { life: 0 };
  scene.add(s); ripples.push(s);
}
window.addEventListener('pointerdown', (e) => spawnRipple(e.clientX, e.clientY));

// 4) Cursor glyph trail
const trail = [];
function spawnTrail(x, y) {
  const char = glyphs[Math.floor(Math.random() * glyphs.length)];
  const tex = makeGlyphTexture(char, 96);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending });
  const s = new THREE.Sprite(mat);
  s.position.copy(screenToWorld(x, y, THREE.MathUtils.randFloat(-5, 5)));
  const sc = THREE.MathUtils.randFloat(1.2, 2.2);
  s.scale.set(sc, sc, 1);
  s.userData = { life: 0, vy: THREE.MathUtils.randFloat(0.02, 0.06) };
  scene.add(s); trail.push(s);
}
window.addEventListener('pointermove', (e) => { if (Math.random() < 0.6) spawnTrail(e.clientX, e.clientY); });

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  bloom.setSize(window.innerWidth, window.innerHeight);
});

// Animate
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Flow the background particles (ink-like drift)
  const pos = pGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const i3 = i * 3;
    const x = pos.array[i3 + 0];
    const z = pos.array[i3 + 2];
    pos.array[i3 + 1] += Math.sin(t * 0.3 + x * 0.02 + z * 0.015) * 0.03;
    // wrap softly
    if (pos.array[i3 + 1] > 65) pos.array[i3 + 1] = -65;
    if (pos.array[i3 + 1] < -65) pos.array[i3 + 1] = 65;
  }
  pos.needsUpdate = true;

  // Float glyphs
  glyphGroup.rotation.x += (targetRot.x - glyphGroup.rotation.x) * 0.05;
  glyphGroup.rotation.y += (targetRot.y - glyphGroup.rotation.y) * 0.05;

  for (const s of glyphSprites) {
    const spd = s.userData.speed; const off = s.userData.off;
    s.position.y += Math.sin(t * spd + off) * 0.02;
    s.position.x += Math.cos(t * spd * 0.6 + off) * 0.01;
  }

  // Sparkles twinkle
  sparkleMat.size = 0.8 + Math.sin(t * 4.0) * 0.25;
  sparkles.rotation.z = Math.sin(t * 0.05) * 0.05;

  // Update constellation lines (random nearby pairs)
  const positions = lineGeo.attributes.position.array;
  let li = 0;
  for (let i = 0; i < maxLines; i++) {
    const a = glyphSprites[Math.floor(Math.random() * glyphSprites.length)];
    const b = glyphSprites[Math.floor(Math.random() * glyphSprites.length)];
    if (!a || !b) continue;
    if (a === b) continue;
    const da = a.position; const db = b.position;
    const d = da.distanceTo(db);
    if (d < 22) {
      positions[li++] = da.x; positions[li++] = da.y; positions[li++] = da.z;
      positions[li++] = db.x; positions[li++] = db.y; positions[li++] = db.z;
    } else {
      positions[li++] = 0; positions[li++] = 0; positions[li++] = 0;
      positions[li++] = 0; positions[li++] = 0; positions[li++] = 0;
    }
  }
  lineGeo.attributes.position.needsUpdate = true;
  lineMat.opacity = 0.12 + 0.08 * (0.5 + 0.5 * Math.sin(t * 1.6));

  // Calligraphy ribbon update
  for (const s of ribbonSprites) {
    const u = (s.userData.u + (t * 0.05)) % 1;
    const p = curveAt(u, t);
    s.position.copy(p);
    s.material.opacity = 0.3 + 0.7 * Math.sin((u) * Math.PI);
  }
  calligraphyGroup.rotation.y = targetRot.y * 1.5;

  // Poem lines drift
  for (const s of lineSprites) {
    s.position.x += s.userData.vx;
    s.position.y += Math.sin(t * 0.5 + s.userData.off) * 0.02;
    if (s.position.x > 70) s.position.x = -70;
  }
  linesGroup.rotation.x = targetRot.x * 0.6;

  // Ripples expand and fade
  for (let i = ripples.length - 1; i >= 0; i--) {
    const r = ripples[i];
    r.userData.life += 0.02;
    r.scale.setScalar(1 + r.userData.life * 40);
    r.material.opacity = Math.max(0, 0.8 - r.userData.life);
    if (r.material.opacity <= 0.01) { scene.remove(r); ripples.splice(i, 1); }
  }

  // Cursor trail float and fade
  for (let i = trail.length - 1; i >= 0; i--) {
    const s = trail[i];
    s.userData.life += 0.02;
    s.position.y += s.userData.vy;
    s.material.opacity = Math.max(0, 0.9 - s.userData.life * 1.2);
    s.scale.multiplyScalar(0.997);
    if (s.material.opacity <= 0.02) { scene.remove(s); trail.splice(i, 1); }
  }

  // Subtle color breathing on lights
  keyLight.color.setHSL(0.06 + 0.02 * Math.sin(t * 0.2), 1.0, 0.6);
  fillLight.color.setHSL(0.93 + 0.02 * Math.cos(t * 0.22), 1.0, 0.6);

  composer.render();
}
animate();
