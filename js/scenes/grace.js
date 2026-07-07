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
  // 9 x 8 mesh of core tiles
  const cols = 9, rows = 8, gw = 512 / cols, gh = 448 / rows;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      // central band = fabric / L3
      const isFabric = j === 3 || j === 4;
      const base = isFabric ? 26 : 20 + Math.floor(rand() * 8);
      ctx.fillStyle = isFabric
        ? `rgb(${base + 8},${base + 14},${base + 26})`
        : `rgb(${base},${base + 6},${base + 16})`;
      ctx.fillRect(i * gw + 2, j * gh + 2, gw - 4, gh - 4);
      if (!isFabric) {
        // identical sub-structure in every core tile (cores are copies)
        ctx.fillStyle = 'rgba(90,110,150,0.35)';
        ctx.fillRect(i * gw + 6, j * gh + 6, gw * 0.4, gh * 0.35);
        ctx.fillRect(i * gw + gw * 0.55, j * gh + gh * 0.5, gw * 0.3, gh * 0.35);
      }
    }
  }
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = '#3a4a66';
  for (let x = 0; x < 512; x += 8) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 448); ctx.stroke(); }
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
    map: tex, roughness: 0.28, metalness: 0.8,
    emissive: 0x2a3550, emissiveIntensity: 0.28, emissiveMap: tex,
  });
  const die = box(0.62, 0.022, 0.52, dieM, 0, 0.051, -0.03);
  mark(die, 'graceDie');
  root.add(die);

  /* ----- PHY strips on the die edges ----- */
  // NVLink-C2C along the front edge (the 900 GB/s exit toward the GPUs)
  const c2c = box(0.62, 0.023, 0.035, glowMat(GREEN, 1.1), 0, 0.051, 0.25);
  mark(c2c, 'graceC2cPhy');
  root.add(c2c);
  // LPDDR5X controllers/PHY along both side edges
  const phyM = mat(0x3a5a8a, 0.35, 0.8, { emissive: 0x1a3a6a, emissiveIntensity: 0.35 });
  for (const sx of [-1, 1]) {
    const p = box(0.03, 0.023, 0.52, phyM, sx * 0.335, 0.051, -0.03);
    mark(p, 'graceMemPhy');
    root.add(p);
  }

  /* ----- decoupling capacitors ----- */
  const caps = new THREE.Group();
  const capM = mat(0xa08a3c, 0.4, 0.8);
  const capM2 = mat(0x6f6961, 0.45, 0.5);
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
