import * as THREE from 'three';
import { mat, glowMat, box, slab, mark, M, GREEN } from '../common.js';

/**
 * Grace CPU package, macro view: substrate + monolithic 72-core die.
 * (The 480 GB of LPDDR5X lives on the board around the package, not on it.)
 */
export function buildGrace() {
  const root = new THREE.Group();

  /* ----- substrate ----- */
  const sub = new THREE.Group();
  sub.add(slab(1.0, 0.04, 0.92, 0.025, M.substrate(), 0, 0, 0));
  sub.add(slab(0.9, 0.012, 0.82, 0.018, mat(0x1b2524, 0.52, 0.55), 0, 0.035, 0));
  const ballM = mat(0x8a8f95, 0.35, 0.9);
  for (let i = 0; i < 22; i++) {
    const x = -0.46 + i * 0.044;
    sub.add(box(0.011, 0.008, 0.011, ballM, x, -0.002, 0.445));
    sub.add(box(0.011, 0.008, 0.011, ballM, x, -0.002, -0.445));
  }
  mark(sub, 'substrate');
  root.add(sub);

  /* ----- monolithic compute die ----- */
  const dieM = mat(0x111c2a, 0.26, 0.78, { emissive: 0x07111b, emissiveIntensity: 0.4 });
  const die = box(0.68, 0.024, 0.54, dieM, 0, 0.059, -0.025);
  mark(die, 'graceDie');
  root.add(die);

  /* ----- 72 cores + distributed cache on the SCF mesh ----- */
  const architecture = new THREE.Group();
  const coreM = mat(0xb16b1b, 0.32, 0.72, { emissive: 0x4c2105, emissiveIntensity: 0.22 });
  const cacheM = mat(0x3b812d, 0.34, 0.62, { emissive: 0x183d14, emissiveIntensity: 0.28 });
  const meshM = glowMat(0x76b900, 0.45);
  const nodeM = mat(0xa9b2b7, 0.25, 0.82);
  const cols = 12, rows = 6, sx = 0.05, sz = 0.07;
  for (let i = 0; i < cols; i++) architecture.add(box(0.003, 0.002, 0.43, meshM, (i - 5.5) * sx, 0.073, -0.025));
  for (let j = 0; j < rows; j++) architecture.add(box(0.59, 0.002, 0.003, meshM, 0, 0.073, -0.025 + (j - 2.5) * sz));
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = (i - 5.5) * sx, z = -0.025 + (j - 2.5) * sz;
      architecture.add(box(0.032, 0.008, 0.047, coreM, x - 0.004, 0.078, z));
      architecture.add(box(0.006, 0.009, 0.047, cacheM, x + 0.018, 0.0785, z));
    }
  }
  for (const [x, z] of [[-0.15, -0.095], [0.15, -0.095], [-0.15, 0.045], [0.15, 0.045]]) {
    architecture.add(box(0.018, 0.012, 0.018, nodeM, x, 0.081, z));
  }
  mark(architecture, 'graceDie');
  root.add(architecture);

  /* ----- PHY strips on the die edges ----- */
  // NVLink-C2C along the front edge (the 900 GB/s exit toward the GPUs)
  const c2c = box(0.58, 0.025, 0.03, glowMat(GREEN, 0.9), 0, 0.06, 0.26);
  mark(c2c, 'graceC2cPhy');
  root.add(c2c);
  // LPDDR5X controllers/PHY along both side edges (cyan in NVIDIA's diagram)
  const phyM = mat(0x2a7f8c, 0.35, 0.7, { emissive: 0x14444e, emissiveIntensity: 0.25 });
  for (const sx of [-1, 1]) {
    const p = box(0.027, 0.025, 0.46, phyM, sx * 0.354, 0.06, -0.025);
    mark(p, 'graceMemPhy');
    root.add(p);
  }

  /* ----- decoupling capacitors ----- */
  const caps = new THREE.Group();
  const capM = mat(0x6b5c2c, 0.4, 0.8);
  const capM2 = mat(0x4c4841, 0.45, 0.5);
  let s = 13;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 112; i++) {
    const edge = i % 4;
    const slot = Math.floor(i / 4);
    let x, z;
    if (edge < 2) { x = -0.405 + slot * 0.03; z = (edge === 0 ? -1 : 1) * 0.36; }
    else { x = (edge === 2 ? -1 : 1) * 0.43; z = -0.304 + slot * 0.0225; }
    caps.add(box(0.014, 0.006, 0.008, rand() > 0.5 ? capM : capM2, x, 0.052, z));
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
    new THREE.MeshBasicMaterial({
      map: labelTex, transparent: true, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    })
  );
  label.rotation.x = -Math.PI / 2;
  label.position.set(-0.26, 0.049, 0.39);
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
