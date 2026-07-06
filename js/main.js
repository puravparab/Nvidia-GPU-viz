import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { INFO, LEVELS } from './data.js';
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

function setLevel(level, { instant = false } = {}) {
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
    camera.position.set(...c.pos);
    controls.target.set(...c.target);
    controls.minDistance = c.min;
    controls.maxDistance = c.max;
    controls.update();

    // rack scene sits on a floor; close-up scenes float in the void
    scene.fog.density = level === 'rack' ? 0.045 : 0.0;

    subtitleEl.textContent = LEVELS[level].subtitle;
    document.querySelectorAll('.crumb').forEach(b => {
      b.classList.toggle('active', b.dataset.level === level);
    });
    showPanel(current.defaultInfo, { auto: true });
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
    if (b.dataset.level !== currentLevel) setLevel(b.dataset.level);
  });
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
  controls.update();
  if (pointerMoved && !downPos) {
    setHover(pick());
    pointerMoved = false;
  }
  renderer.render(scene, camera);
}
tick();
