import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { INFO, LEVELS } from './data.js';
import { TOUR } from './tour.js';
import { GREEN } from './common.js';
import { buildRack } from './scenes/rack.js';
import { buildTray } from './scenes/tray.js';
import { buildBoard } from './scenes/board.js';
import { buildChip } from './scenes/chip.js';

const BUILDERS = { rack: buildRack, tray: buildTray, board: buildBoard, chip: buildChip };
const LEVEL_ORDER = ['rack', 'tray', 'board', 'chip'];

/* ---------------- renderer / scene ---------------- */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x060809, 0.045);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.6;

/* lights */
const key = new THREE.DirectionalLight(0xffffff, 2.6);
key.position.set(4, 6, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = key.shadow.camera.bottom = -3;
key.shadow.camera.right = key.shadow.camera.top = 3;
key.shadow.bias = -0.0004;
scene.add(key);
const fill = new THREE.DirectionalLight(0x9db8cf, 1.1);
fill.position.set(-5, 3, -4);
scene.add(fill);
const front = new THREE.DirectionalLight(0xd8e2ea, 0.8);
front.position.set(0.5, 2, 6);
scene.add(front);
const rim = new THREE.PointLight(GREEN, 14, 14);
rim.position.set(0, 2.2, -2.4);
scene.add(rim);
scene.add(new THREE.AmbientLight(0x49525b, 0.85));

/* ---------------- level management ---------------- */
let current = null;      // { group, camera, defaultInfo }
let currentLevel = 'rack';
const cache = {};

const fadeEl = document.getElementById('fade');
const subtitleEl = document.getElementById('level-subtitle');

function setLevel(level, { instant = false, panelKey = null, cam = null } = {}) {
  const apply = () => {
    if (current) scene.remove(current.group);
    clearHover();
    hidePanel();

    if (!cache[level]) {
      cache[level] = BUILDERS[level]();
      cache[level].group.traverse(o => {
        if (o.isMesh && !cache[level].group.userData.noHighlight?.has(o.id)) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
    }
    current = cache[level];
    currentLevel = level;
    scene.add(current.group);

    const c = current.camera;
    camera.position.set(...(cam?.pos ?? c.pos));
    controls.target.set(...(cam?.target ?? c.target));
    controls.minDistance = c.min;
    controls.maxDistance = c.max;
    controls.update();

    // rack scene sits on a floor; close-up scenes float in the void
    scene.fog.density = level === 'rack' ? 0.045 : 0.0;

    subtitleEl.textContent = LEVELS[level].subtitle;
    document.querySelectorAll('.crumb').forEach(b => {
      b.classList.toggle('active', b.dataset.level === level);
    });
    showPanel(panelKey ?? current.defaultInfo, { auto: true });
  };

  if (instant) { apply(); return; }
  fadeEl.classList.add('on');
  setTimeout(() => {
    apply();
    requestAnimationFrame(() => fadeEl.classList.remove('on'));
  }, 290);
}

document.querySelectorAll('.crumb').forEach(b => {
  b.addEventListener('click', () => {
    if (tourIdx >= 0) endTour();
    if (b.dataset.level !== currentLevel) setLevel(b.dataset.level);
  });
});

/* ---------------- camera fly-to ---------------- */
let camTween = null;
function flyTo(pos, target, dur = 1.15) {
  camTween = {
    p0: camera.position.clone(), t0: controls.target.clone(),
    p1: new THREE.Vector3(...pos), t1: new THREE.Vector3(...target),
    start: performance.now(), dur: dur * 1000,
  };
}
const easeInOut = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

/* ---------------- guided tour ---------------- */
let tourIdx = -1;
const tourBtn = document.getElementById('tour-btn');
const tourBar = document.getElementById('tour-bar');
const tourStepEl = document.getElementById('tour-step');
const tourTextEl = document.getElementById('tour-text');
const tourPrev = document.getElementById('tour-prev');
const tourNext = document.getElementById('tour-next');

function startTour() {
  document.body.classList.add('touring');
  tourBar.classList.remove('hidden');
  tourBtn.classList.add('hidden');
  controls.autoRotate = false;
  gotoStop(0);
}
function endTour() {
  tourIdx = -1;
  camTween = null;
  document.body.classList.remove('touring');
  tourBar.classList.add('hidden');
  tourBtn.classList.remove('hidden');
}
function gotoStop(i) {
  if (i < 0 || i >= TOUR.length) { endTour(); return; }
  tourIdx = i;
  const s = TOUR[i];
  tourStepEl.textContent = `STOP ${i + 1} OF ${TOUR.length}`;
  tourTextEl.textContent = s.text;
  tourPrev.disabled = i === 0;
  tourNext.textContent = i === TOUR.length - 1 ? 'Finish ✓' : 'Next ›';
  if (s.level !== currentLevel) {
    // cross-level: fade, then start at the stop's viewpoint
    setLevel(s.level, { panelKey: s.info, cam: s });
  } else {
    flyTo(s.pos, s.target);
    showPanel(s.info);
  }
}
tourBtn.addEventListener('click', startTour);
tourNext.addEventListener('click', () => gotoStop(tourIdx + 1));
tourPrev.addEventListener('click', () => gotoStop(tourIdx - 1));
document.getElementById('tour-exit').addEventListener('click', endTour);
window.addEventListener('keydown', e => {
  if (tourIdx >= 0) {
    // tour mode: arrows step between stops
    if (e.key === 'ArrowRight') gotoStop(tourIdx + 1);
    else if (e.key === 'ArrowLeft') gotoStop(tourIdx - 1);
    else if (e.key === 'Escape') endTour();
    return;
  }
  // normal mode: arrows step between zoom levels
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const i = LEVEL_ORDER.indexOf(currentLevel) + (e.key === 'ArrowRight' ? 1 : -1);
    if (i >= 0 && i < LEVEL_ORDER.length) setLevel(LEVEL_ORDER[i]);
  } else if (e.key === 'Escape') {
    hidePanel();
  }
});

/* ---------------- picking ---------------- */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(-10, -10);
const tooltip = document.getElementById('tooltip');

let hovered = null;                 // Object3D with infoKey
const matSwap = new Map();          // mesh.id -> original material
const highlightCache = new Map();   // original material -> highlighted clone

function findInteractive(obj) {
  let o = obj;
  while (o) {
    if (o.userData.infoKey) return o;
    o = o.parent;
  }
  return null;
}

function highlightMaterial(orig) {
  if (!highlightCache.has(orig)) {
    const h = orig.clone();
    h.emissive = new THREE.Color(GREEN);
    h.emissiveIntensity = Math.max(0.2, (orig.emissiveIntensity || 0) * 1.4);
    if (orig.emissiveMap) h.emissiveMap = orig.emissiveMap;
    highlightCache.set(orig, h);
  }
  return highlightCache.get(orig);
}

function setHover(target) {
  if (target === hovered) return;
  clearHover();
  hovered = target;
  if (!hovered) return;
  hovered.traverse(o => {
    if (o.isMesh && o.material && !o.material.isMeshBasicMaterial) {
      matSwap.set(o.id, o.material);
      o.material = highlightMaterial(o.material);
    }
  });
  document.body.classList.add('pointer-interactive');
  const info = INFO[hovered.userData.infoKey];
  if (info) {
    tooltip.innerHTML = `${info.name}<small>${info.drill ? 'click for info · double-click to open' : 'click for info'}</small>`;
    tooltip.classList.remove('hidden');
  }
}

function clearHover() {
  if (!hovered) return;
  hovered.traverse(o => {
    if (o.isMesh && matSwap.has(o.id)) {
      o.material = matSwap.get(o.id);
      matSwap.delete(o.id);
    }
  });
  hovered = null;
  document.body.classList.remove('pointer-interactive');
  tooltip.classList.add('hidden');
}

function pick() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(current.group.children, true);
  for (const h of hits) {
    if (current.group.userData.noHighlight?.has(h.object.id)) continue;
    const t = findInteractive(h.object);
    if (t) return t;
    break; // first solid hit wins; don't x-ray through geometry
  }
  return null;
}

let pointerMoved = false;
window.addEventListener('pointermove', e => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  tooltip.style.left = e.clientX + 'px';
  tooltip.style.top = e.clientY + 'px';
  pointerMoved = true;
});

/* click vs drag discrimination */
let downPos = null;
canvas.addEventListener('pointerdown', e => {
  downPos = [e.clientX, e.clientY];
  controls.autoRotate = false;
  camTween = null; // user grabbed the camera mid-flight
});
canvas.addEventListener('pointerup', e => {
  if (!downPos) return;
  const dx = e.clientX - downPos[0], dy = e.clientY - downPos[1];
  downPos = null;
  if (dx * dx + dy * dy > 25) return; // was a drag
  const t = pick();
  if (t) showPanel(t.userData.infoKey);
  else hidePanel();
});
canvas.addEventListener('dblclick', () => {
  const t = pick();
  if (!t) return;
  const info = INFO[t.userData.infoKey];
  if (info?.drill) setLevel(info.drill);
});

/* ---------------- info panel ---------------- */
const panel = document.getElementById('info-panel');
const elTag = document.getElementById('info-tag');
const elName = document.getElementById('info-name');
const elBlurb = document.getElementById('info-blurb');
const elSpecs = document.getElementById('info-specs');
const elDrill = document.getElementById('info-drill');

function showPanel(key, { auto = false } = {}) {
  const info = INFO[key];
  if (!info) return;
  elTag.textContent = info.tag;
  elName.textContent = info.name;
  elBlurb.textContent = info.blurb;
  elSpecs.innerHTML = info.specs.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  if (info.drill && info.drill !== currentLevel) {
    elDrill.textContent = info.drillLabel;
    elDrill.classList.remove('hidden');
    elDrill.onclick = () => setLevel(info.drill);
  } else {
    elDrill.classList.add('hidden');
  }
  panel.classList.remove('hidden');
}
function hidePanel() { panel.classList.add('hidden'); }
document.getElementById('info-close').addEventListener('click', hidePanel);

/* ---------------- loop ---------------- */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

setLevel('rack', { instant: true });

function tick() {
  requestAnimationFrame(tick);
  if (camTween) {
    const k = Math.min(1, (performance.now() - camTween.start) / camTween.dur);
    const e = easeInOut(k);
    camera.position.lerpVectors(camTween.p0, camTween.p1, e);
    controls.target.lerpVectors(camTween.t0, camTween.t1, e);
    if (k >= 1) camTween = null;
  }
  controls.update();
  if (pointerMoved && !downPos) {
    setHover(pick());
    pointerMoved = false;
  }
  renderer.render(scene, camera);
}
tick();
