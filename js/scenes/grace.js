import * as THREE from 'three';
import { mat, glowMat, box, slab, mark, M, GREEN } from '../common.js';

/** Procedural die texture for Grace: a uniform mesh of 72 CPU core tiles
 *  with an L3/fabric band through the middle. */
function graceDieTexture() {
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 448;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#111722';
  ctx.fillRect(0, 0, 512, 448);
  let s = 41;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  // 9 x 8 mesh of core tiles — orange cores + green L3 slices with grey
  // coherency-fabric nodes, per NVIDIA's Grace die diagram
  const cols = 9, rows = 8, gw = 512 / cols, gh = 448 / rows;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const isCore = (i + j) % 2 === 0;
      ctx.fillStyle = isCore
        ? `rgb(${150 + Math.floor(rand() * 30)},${92 + Math.floor(rand() * 16)},20)`
        : `rgb(${52 + Math.floor(rand() * 14)},${112 + Math.floor(rand() * 22)},34)`;
      ctx.fillRect(i * gw + 4, j * gh + 4, gw - 8, gh - 8);
      // fabric node at each tile corner
      ctx.fillStyle = 'rgb(96,100,104)';
      ctx.fillRect(i * gw - 4, j * gh - 4, 9, 9);
    }
  }
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#7a6a3a';
  for (let x = 0; x < 512; x += Math.floor(gw)) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 448); ctx.stroke(); }
  for (let y = 0; y < 448; y += Math.floor(gh)) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke(); }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Grace CPU package, macro view: substrate + monolithic 72-core die.
 * (The 480 GB of LPDDR5X lives on the board around the package, not on it.)
 */
export function buildGrace() {
  const root = new THREE.Group();

  /* ----- substrate ----- */
  const sub = new THREE.Group();
  sub.add(slab(0.95, 0.04, 0.95, 0.02, M.substrate(), 0, 0, 0));
  const ballM = mat(0x8a8f95, 0.35, 0.9);
  for (let i = 0; i < 20; i++) {
    sub.add(box(0.012, 0.008, 0.012, ballM, -0.44 + i * 0.046, -0.002, 0.462));
  }
  mark(sub, 'substrate');
  root.add(sub);

  /* ----- monolithic compute die ----- */
  const tex = graceDieTexture();
  const dieM = new THREE.MeshStandardMaterial({
    map: tex, roughness: 0.28, metalness: 0.75,
    emissive: 0xffffff, emissiveIntensity: 0.14, emissiveMap: tex,
  });
  const die = box(0.62, 0.022, 0.52, dieM, 0, 0.051, -0.03);
  mark(die, 'graceDie');
  root.add(die);

  /* ----- PHY strips on the die edges ----- */
  // NVLink-C2C along the front edge (the 900 GB/s exit toward the GPUs)
  const c2c = box(0.62, 0.023, 0.035, glowMat(GREEN, 0.85), 0, 0.051, 0.25);
  mark(c2c, 'graceC2cPhy');
  root.add(c2c);
  // LPDDR5X controllers/PHY along both side edges (cyan in NVIDIA's diagram)
  const phyM = mat(0x2a7f8c, 0.35, 0.7, { emissive: 0x14444e, emissiveIntensity: 0.25 });
  for (const sx of [-1, 1]) {
    const p = box(0.03, 0.023, 0.52, phyM, sx * 0.335, 0.051, -0.03);
    mark(p, 'graceMemPhy');
    root.add(p);
  }

  /* ----- decoupling capacitors ----- */
  const caps = new THREE.Group();
  const capM = mat(0x6b5c2c, 0.4, 0.8);
  const capM2 = mat(0x4c4841, 0.45, 0.5);
  let s = 13;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 90; i++) {
    const edge = Math.floor(rand() * 4);
    let x, z;
    if (edge < 2) { x = (rand() - 0.5) * 0.8; z = (edge === 0 ? -1 : 1) * (0.36 + rand() * 0.06); }
    else { x = (edge === 2 ? -1 : 1) * (0.41 + rand() * 0.035); z = (rand() - 0.5) * 0.6; }
    caps.add(box(0.013, 0.006, 0.008, rand() > 0.5 ? capM : capM2, x, 0.044, z));
  }
  mark(caps, 'capacitors');
  root.add(caps);

  /* ----- etched marking ----- */
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 128;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = 'rgba(220,230,235,0.85)';
  ctx.font = '600 44px system-ui, sans-serif';
  ctx.fillText('NVIDIA GRACE', 20, 58);
  ctx.font = '400 26px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(180,195,205,0.6)';
  ctx.fillText('72× NEOVERSE V2 · TSMC 4N', 20, 100);
  const labelTex = new THREE.CanvasTexture(cv);
  labelTex.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.1),
    new THREE.MeshBasicMaterial({ map: labelTex, transparent: true })
  );
  label.rotation.x = -Math.PI / 2;
  label.position.set(-0.24, 0.0415, 0.38);
  root.add(label);

  /* ----- shadow disc ----- */
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(1.3, 40),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = -0.25;
  root.add(disc);
  root.userData.noHighlight = new Set([disc.id, label.id]);

  return {
    group: root,
    camera: { pos: [0.75, 0.95, 1.2], target: [0, 0.02, 0], min: 0.45, max: 3.5 },
    defaultInfo: 'graceCpu',
  };
}
