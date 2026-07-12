import * as THREE from 'three';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
import { INFO, LEVELS } from './data.js?v=20260712-1';
import { TOUR, TOUR_VR } from './tour.js?v=20260712-1';
import { GREEN } from './common.js';
import { buildRack } from './scenes/rack.js';
import { buildTray } from './scenes/tray.js';
import { buildBoard } from './scenes/board.js?v=20260710-11';
import { buildChip } from './scenes/chip.js';
import { buildSwitchTray } from './scenes/switchtray.js';
import { buildGrace } from './scenes/grace.js';
import { buildNvswitch } from './scenes/nvswitch.js';
import { buildHbm } from './scenes/hbm.js';
import { buildDatacenter } from './scenes/datacenter.js?v=20260710-13';
import { buildVrRack } from './scenes/vr/rack.js';
import { buildVrTray } from './scenes/vr/tray.js';
import { buildVrBoard } from './scenes/vr/board.js';
import { buildVrChip } from './scenes/vr/chip.js';
import { buildVrVera } from './scenes/vr/vera.js';
import { buildVrSwitchtray } from './scenes/vr/switchtray.js';
import { buildVrNvswitch } from './scenes/vr/nvswitch.js';
import { buildVrHbm } from './scenes/vr/hbm.js';

const BUILDERS = {
  datacenter: buildDatacenter,
  rack: buildRack, tray: buildTray, board: buildBoard, chip: buildChip,
  switchtray: buildSwitchTray, grace: buildGrace, nvswitch: buildNvswitch, hbm: buildHbm,
  vrRack: buildVrRack, vrTray: buildVrTray, vrBoard: buildVrBoard, vrChip: buildVrChip,
  vrVera: buildVrVera, vrSwitchtray: buildVrSwitchtray, vrNvswitch: buildVrNvswitch, vrHbm: buildVrHbm,
};
// Two systems share the app: GB200 levels keep their original names, Vera
// Rubin levels are prefixed `vr`. Each system is a disjoint level tree.
// GB200 spine: datacenter→rack→tray→board→chip→hbm, branches rack→switchtray
// →nvswitch and board→grace. VR spine: vrRack→vrTray→vrBoard→vrChip→vrHbm,
// branches vrRack→vrSwitchtray→vrNvswitch and vrBoard→vrVera.
const PARENT = {
  datacenter: null, rack: 'datacenter', tray: 'rack', switchtray: 'rack', board: 'tray',
  chip: 'board', grace: 'board', nvswitch: 'switchtray', hbm: 'chip',
  vrRack: null, vrTray: 'vrRack', vrSwitchtray: 'vrRack', vrBoard: 'vrTray',
  vrChip: 'vrBoard', vrVera: 'vrBoard', vrNvswitch: 'vrSwitchtray', vrHbm: 'vrChip',
};
const PRIMARY_CHILD = {
  datacenter: 'rack', rack: 'tray', tray: 'board', board: 'chip', chip: 'hbm', switchtray: 'nvswitch',
  vrRack: 'vrTray', vrTray: 'vrBoard', vrBoard: 'vrChip', vrChip: 'vrHbm', vrSwitchtray: 'vrNvswitch',
};
const CRUMB_LABELS = {
  datacenter: 'AI Factory', rack: 'Rack', tray: 'Compute Tray', board: 'GB200 Superchip', chip: 'Blackwell GPU',
  hbm: 'HBM3e', switchtray: 'Switch Tray', nvswitch: 'NVSwitch', grace: 'Grace CPU',
  vrRack: 'Rack', vrTray: 'Compute Tray', vrBoard: 'Strata Module', vrChip: 'Rubin GPU',
  vrHbm: 'HBM4', vrSwitchtray: 'Switch Tray', vrNvswitch: 'NVSwitch 6', vrVera: 'Vera CPU',
};

/* ---------------- system switcher (header title dropdown) ---------------- */
const SYSTEMS = {
  gb200: {
    root: 'rack',
    html: 'NVIDIA GB200 <span>NVL72</span>',
    doc: 'NVIDIA GB200 NVL72 — Interactive 3D Explorer',
  },
  vr: {
    root: 'vrRack',
    html: 'NVIDIA VERA RUBIN <span>NVL72</span>',
    doc: 'NVIDIA Vera Rubin NVL72 — Interactive 3D Explorer',
  },
};
const systemOf = level => (level.startsWith('vr') ? 'vr' : 'gb200');
// shareable hash for a level; the VR root gets the short '#vr'
const levelHash = level =>
  level === 'rack' ? '' : (level === 'vrRack' ? 'vr' : level);
const hashLevel = hash =>
  hash === '' ? 'rack' : (hash === 'vr' ? 'vrRack' : hash);

/* ---------------- renderer / scene ---------------- */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({
  canvas, antialias: true, alpha: true, powerPreference: 'high-performance',
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const isNarrowViewport = () => window.innerWidth <= 700;
const renderPixelRatio = () => Math.min(window.devicePixelRatio, isNarrowViewport() ? 1.5 : 2);
const PORTRAIT_VIEW_SCALE = {
  datacenter: 1.25, rack: 1.12,
  tray: 1.85, switchtray: 1.85, board: 1.85,
  chip: 2.0, grace: 1.8, nvswitch: 1.8, hbm: 1.7,
  vrRack: 1.12, vrTray: 1.85, vrSwitchtray: 1.85, vrBoard: 1.85,
  vrChip: 2.0, vrVera: 1.8, vrNvswitch: 1.8, vrHbm: 1.7,
};
const responsiveViewScale = (level = 'rack') => {
  if (window.innerWidth > 700) return 1;
  return window.innerHeight > window.innerWidth ? (PORTRAIT_VIEW_SCALE[level] ?? 1.5) : 1.12;
};

renderer.setPixelRatio(renderPixelRatio());
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.28;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x060809, 0.016);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
// The room IBL at full strength washes every metal toward pastel; keep it as
// a specular source only and let the directional key/fill do the shaping.
scene.environmentIntensity = 0.55;

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.autoRotate = !prefersReducedMotion.matches && !isNarrowViewport();
controls.autoRotateSpeed = 0.6;
prefersReducedMotion.addEventListener('change', event => {
  if (event.matches) controls.autoRotate = false;
});

/* lights */
const key = new THREE.DirectionalLight(0xffffff, 3.1);
key.position.set(4, 6, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = key.shadow.camera.bottom = -3;
key.shadow.camera.right = key.shadow.camera.top = 3;
key.shadow.bias = -0.0004;
key.shadow.normalBias = 0.004;
key.shadow.radius = 2;
scene.add(key);
const fill = new THREE.DirectionalLight(0x9db8cf, 0.7);
fill.position.set(-5, 3, -4);
scene.add(fill);
const front = new THREE.DirectionalLight(0xd8e2ea, 0.8);
front.position.set(0.5, 2, 6);
scene.add(front);
// Keep the green accent as a faint backdrop tint only — at higher intensity it
// floods every glossy top surface and turns the whole model yellow-green.
const rim = new THREE.PointLight(GREEN, 2.5, 14);
rim.position.set(0, 2.6, -3.4);
scene.add(rim);
scene.add(new THREE.AmbientLight(0x49525b, 0.5));

/* ---------------- level management ---------------- */
let current = null;      // { group, camera, defaultInfo }
let currentLevel = 'rack';
const cache = {};
let lastViewScale = responsiveViewScale(currentLevel);

const fadeEl = document.getElementById('fade');

function setLevel(level, { instant = false, panelKey = null, cam = null } = {}) {
  const apply = () => {
    if (current) scene.remove(current.group);
    clearHover();
    hidePanel();

    if (!cache[level]) {
      cache[level] = BUILDERS[level]();
      const shadowsEnabled = !cache[level].group.userData.disableShadows;
      cache[level].group.traverse(o => {
        if (o.isMesh && !cache[level].group.userData.noHighlight?.has(o.id)) {
          o.castShadow = shadowsEnabled;
          o.receiveShadow = shadowsEnabled;
        }
      });
      // every clickable component in this scene, for the panel's part list
      const seen = new Set();
      cache[level].group.traverse(o => { if (o.userData.infoKey && INFO[o.userData.infoKey]) seen.add(o.userData.infoKey); });
      cache[level].parts = [...seen];
    }
    current = cache[level];
    currentLevel = level;
    scene.add(current.group);

    const c = current.camera;
    camera.position.set(...(cam?.pos ?? c.pos));
    controls.target.set(...(cam?.target ?? c.target));
    lastViewScale = responsiveViewScale(level);
    camera.position.sub(controls.target).multiplyScalar(lastViewScale).add(controls.target);
    camera.near = Math.max(0.02, c.min * 0.05);
    camera.far = Math.max(20, c.max * 4);
    camera.updateProjectionMatrix();
    controls.minDistance = c.min;
    controls.maxDistance = c.max * lastViewScale;
    controls.update(0);

    // grounded scenes use fog for depth; close-up scenes float in the void
    scene.fog.density = { rack: 0.018, vrRack: 0.018, datacenter: 0.012 }[level] ?? 0.0;

    // widen shadow coverage for the big datacenter scene, tight for close-ups
    const shadowExtent = level === 'datacenter' ? 12 : 3;
    key.shadow.camera.left = key.shadow.camera.bottom = -shadowExtent;
    key.shadow.camera.right = key.shadow.camera.top = shadowExtent;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = level === 'datacenter' ? 40 : 20;
    key.shadow.camera.updateProjectionMatrix();

    renderBreadcrumb();
    updateSystemUI();
    showPanel(panelKey ?? current.defaultInfo, { auto: true });
    // shareable deep link (skip during the tour; it has its own flow)
    if (tourIdx < 0) {
      const h = levelHash(level);
      history.replaceState(null, '', h ? '#' + h : location.pathname + location.search);
    }
  };

  if (instant) { apply(); return; }
  fadeEl.classList.add('on');
  setTimeout(() => {
    apply();
    requestAnimationFrame(() => fadeEl.classList.remove('on'));
  }, 290);
}

/* breadcrumb: path from the rack to the current level, then the primary
   drill-down chain onward, so the depth hierarchy stays visible */
const breadcrumbEl = document.getElementById('breadcrumb');
function renderBreadcrumb() {
  const chain = [];
  for (let l = currentLevel; l; l = PARENT[l]) chain.unshift(l);
  for (let l = PRIMARY_CHILD[currentLevel]; l; l = PRIMARY_CHILD[l]) chain.push(l);
  breadcrumbEl.innerHTML = chain
    .map(l => `<button data-level="${l}" class="crumb${l === currentLevel ? ' active' : ''}">${CRUMB_LABELS[l]}</button>`)
    .join('<span class="crumb-sep">›</span>');
  breadcrumbEl.querySelectorAll('.crumb').forEach(b => {
    b.addEventListener('click', () => {
      if (tourIdx >= 0) endTour();
      if (b.dataset.level !== currentLevel) setLevel(b.dataset.level);
    });
  });
  if (isNarrowViewport()) {
    requestAnimationFrame(() => {
      breadcrumbEl.querySelector('.crumb.active')?.scrollIntoView({ block: 'nearest', inline: 'center' });
    });
  }
}

/* header title doubles as the system picker */
const sysBtn = document.getElementById('sys-btn');
const sysTitle = document.getElementById('sys-title');
const sysMenu = document.getElementById('sys-menu');

function updateSystemUI() {
  const sys = systemOf(currentLevel);
  sysTitle.innerHTML = SYSTEMS[sys].html;
  document.title = SYSTEMS[sys].doc;
  sysMenu.querySelectorAll('.sys-opt').forEach(o => {
    o.classList.toggle('active', o.dataset.sys === sys);
  });
}
function closeSysMenu() {
  sysMenu.classList.add('hidden');
  sysBtn.setAttribute('aria-expanded', 'false');
}
sysBtn.addEventListener('click', e => {
  e.stopPropagation();
  const open = sysMenu.classList.toggle('hidden');
  sysBtn.setAttribute('aria-expanded', String(!open));
});
sysMenu.addEventListener('click', e => {
  const opt = e.target.closest('.sys-opt');
  if (!opt) return;
  closeSysMenu();
  if (opt.dataset.sys === systemOf(currentLevel)) return;
  if (tourIdx >= 0) endTour();
  setLevel(SYSTEMS[opt.dataset.sys].root);
});
window.addEventListener('pointerdown', e => {
  if (!sysMenu.classList.contains('hidden') && !e.target.closest('.brand')) closeSysMenu();
});

/* ---------------- camera fly-to ---------------- */
let camTween = null;
function flyTo(pos, target, dur = 1.15) {
  const t1 = new THREE.Vector3(...target);
  const p1 = new THREE.Vector3(...pos).sub(t1).multiplyScalar(responsiveViewScale(currentLevel)).add(t1);
  camTween = {
    p0: camera.position.clone(), t0: controls.target.clone(),
    p1, t1,
    start: performance.now(), dur: dur * 1000,
  };
}
const easeInOut = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

/* ---------------- guided tour ---------------- */
let tourIdx = -1;
let activeTour = TOUR; // chosen per system when the tour starts
const tourBtn = document.getElementById('tour-btn');
const tourBar = document.getElementById('tour-bar');
const tourStepEl = document.getElementById('tour-step');
const tourTextEl = document.getElementById('tour-text');
const tourPrev = document.getElementById('tour-prev');
const tourNext = document.getElementById('tour-next');

function startTour() {
  activeTour = systemOf(currentLevel) === 'vr' ? TOUR_VR : TOUR;
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
  if (i < 0 || i >= activeTour.length) { endTour(); return; }
  tourIdx = i;
  const s = activeTour[i];
  tourStepEl.textContent = `STOP ${i + 1} OF ${activeTour.length}`;
  tourTextEl.textContent = s.text;
  tourPrev.disabled = i === 0;
  tourNext.textContent = i === activeTour.length - 1 ? 'Finish ✓' : 'Next ›';
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
  // normal mode: → drills into the primary child, ← climbs to the parent
  if (e.key === 'ArrowRight' && PRIMARY_CHILD[currentLevel]) {
    setLevel(PRIMARY_CHILD[currentLevel]);
  } else if (e.key === 'ArrowLeft' && PARENT[currentLevel]) {
    setLevel(PARENT[currentLevel]);
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
const elSources = document.getElementById('info-sources');
const elDrill = document.getElementById('info-drill');
const elParts = document.getElementById('info-parts');

function renderParts(activeKey) {
  const keys = (current?.parts ?? []).filter(k => k !== currentLevel);
  if (keys.length < 2) {
    elParts.replaceChildren();
    elParts.classList.add('hidden');
    return;
  }
  elParts.innerHTML = '<span>In this view</span>' + keys
    .map(k => `<button class="part-chip${k === activeKey ? ' active' : ''}" data-key="${k}">${INFO[k].name}</button>`)
    .join('');
  elParts.classList.remove('hidden');
}
elParts.addEventListener('click', e => {
  const chip = e.target.closest('.part-chip');
  if (chip) showPanel(chip.dataset.key);
});

function showPanel(key, { auto = false } = {}) {
  const info = INFO[key];
  if (!info) return;
  elTag.textContent = info.tag;
  elName.textContent = info.name;
  elBlurb.textContent = info.blurb;
  elSpecs.innerHTML = info.specs.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');
  if (info.sources?.length) {
    elSources.innerHTML = '<span>Sources</span>' + info.sources
      .map(([label, url]) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`)
      .join('');
    elSources.classList.remove('hidden');
  } else {
    elSources.replaceChildren();
    elSources.classList.add('hidden');
  }
  if (info.drill && info.drill !== currentLevel) {
    elDrill.textContent = info.drillLabel;
    elDrill.classList.remove('hidden');
    elDrill.onclick = () => setLevel(info.drill);
  } else {
    elDrill.classList.add('hidden');
  }
  renderParts(key);
  panel.classList.remove('hidden');
}
function hidePanel() { panel.classList.add('hidden'); }

/* ---------------- loop ---------------- */
window.addEventListener('resize', () => {
  const nextViewScale = responsiveViewScale(currentLevel);
  if (current && nextViewScale !== lastViewScale) {
    camera.position.sub(controls.target).multiplyScalar(nextViewScale / lastViewScale).add(controls.target);
    controls.maxDistance = current.camera.max * nextViewScale;
    lastViewScale = nextViewScale;
  }
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(renderPixelRatio());
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (prefersReducedMotion.matches || isNarrowViewport()) controls.autoRotate = false;
});

// deep link support: /#grace, /#hbm, /#vr, /#vrTray, ...
const requested = hashLevel(location.hash.slice(1));
setLevel(BUILDERS[requested] ? requested : 'rack', { instant: true });
window.addEventListener('hashchange', () => {
  const l = hashLevel(location.hash.slice(1));
  if (BUILDERS[l] && l !== currentLevel && tourIdx < 0) setLevel(l);
});

let previousFrame = performance.now();
function tick(now) {
  requestAnimationFrame(tick);
  const deltaSeconds = Math.min((now - previousFrame) / 1000, 0.05);
  previousFrame = now;
  if (camTween) {
    const k = Math.min(1, (performance.now() - camTween.start) / camTween.dur);
    const e = easeInOut(k);
    camera.position.lerpVectors(camTween.p0, camTween.p1, e);
    controls.target.lerpVectors(camTween.t0, camTween.t1, e);
    if (k >= 1) camTween = null;
  }
  // Passing elapsed time keeps auto-rotation smooth when frame rate varies.
  controls.update(deltaSeconds);
  if (pointerMoved && !downPos) {
    setHover(pick());
    pointerMoved = false;
  }
  renderer.render(scene, camera);
}
requestAnimationFrame(tick);
