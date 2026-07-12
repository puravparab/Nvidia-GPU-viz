import * as THREE from 'three';
import { mat, glowMat, box, slab, mark, M, GREEN } from '../../common.js';

/**
 * Vera CPU package, macro view: one 3nm reticle-sized compute die with 91
 * printed Olympus cores (88 enabled), flanked by the disaggregated memory
 * controller / I/O chiplets that drive the SOCAMM bus and PCIe Gen6.
 */
export function buildVrVera() {
  const root = new THREE.Group();

  /* ----- substrate ----- */
  const sub = new THREE.Group();
  sub.add(slab(1.0, 0.04, 0.92, 0.025, M.substrate(), 0, 0, 0));
  sub.add(slab(0.92, 0.012, 0.84, 0.018, mat(0x1b2524, 0.52, 0.55), 0, 0.035, 0));
  const ballM = mat(0x8a8f95, 0.35, 0.9);
  for (let i = 0; i < 22; i++) {
    const x = -0.46 + i * 0.044;
    sub.add(box(0.011, 0.008, 0.011, ballM, x, -0.002, 0.445));
    sub.add(box(0.011, 0.008, 0.011, ballM, x, -0.002, -0.445));
  }
  mark(sub, 'substrate');
  root.add(sub);

  /* ----- compute die (centre) ----- */
  const dieM = mat(0x101d24, 0.26, 0.78, { emissive: 0x081418, emissiveIntensity: 0.4 });
  const die = box(0.56, 0.024, 0.56, dieM, 0, 0.059, -0.02);
  mark(die, 'vrVeraDie');
  root.add(die);

  /* ----- 91 printed Olympus cores on a 13×7 mesh (88 enabled) ----- */
  const architecture = new THREE.Group();
  const coreM = mat(0xb16b1b, 0.32, 0.72, { emissive: 0x4c2105, emissiveIntensity: 0.22 });
  const spareM = mat(0x5a5148, 0.4, 0.6, { emissive: 0x1c1814, emissiveIntensity: 0.15 });
  const cacheM = mat(0x3b812d, 0.34, 0.62, { emissive: 0x183d14, emissiveIntensity: 0.28 });
  const meshM = glowMat(0x76b900, 0.45);
  const cols = 13, rows = 7, sx = 0.04, sz = 0.072;
  for (let i = 0; i < cols; i++) architecture.add(box(0.0025, 0.002, 0.485, meshM, (i - 6) * sx, 0.073, -0.02));
  for (let j = 0; j < rows; j++) architecture.add(box(0.51, 0.002, 0.0025, meshM, 0, 0.073, -0.02 + (j - 3) * sz));
  // three greyed tiles stand in for the yield-spare cores (91 printed, 88 used)
  const spares = new Set([5, 45, 85]);
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const n = j * cols + i;
      const x = (i - 6) * sx, z = -0.02 + (j - 3) * sz;
      architecture.add(box(0.026, 0.008, 0.05, spares.has(n) ? spareM : coreM, x - 0.003, 0.078, z));
      architecture.add(box(0.005, 0.009, 0.05, cacheM, x + 0.014, 0.0785, z));
    }
  }
  mark(architecture, 'vrVeraDie');
  root.add(architecture);

  /* ----- memory / I/O chiplets flanking the compute die ----- */
  const chipletM = mat(0x2a7f8c, 0.3, 0.8, { emissive: 0x14444e, emissiveIntensity: 0.3 });
  for (const side of [-1, 1]) {
    const c = box(0.09, 0.022, 0.56, chipletM, side * 0.36, 0.058, -0.02);
    mark(c, 'vrVeraChiplet');
    root.add(c);
    // SOCAMM PHY pad rows on the substrate outside each chiplet
    for (let i = 0; i < 10; i++) {
      const pad = box(0.024, 0.004, 0.02, mat(0x3c4046, 0.4, 0.7), side * 0.44, 0.042, -0.24 + i * 0.05);
      mark(pad, 'vrVeraChiplet');
      root.add(pad);
    }
  }

  /* ----- NVLink-C2C PHY along the front edge ----- */
  const c2c = box(0.5, 0.025, 0.03, glowMat(GREEN, 0.9), 0, 0.06, 0.29);
  mark(c2c, 'vrVeraC2cPhy');
  root.add(c2c);

  /* ----- decoupling capacitors ----- */
  const caps = new THREE.Group();
  const capM = mat(0x6b5c2c, 0.4, 0.8);
  const capM2 = mat(0x4c4841, 0.45, 0.5);
  let s = 13;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 96; i++) {
    const edge = i % 2;
    const slot = Math.floor(i / 2);
    const x = -0.42 + slot * 0.0178;
    const z = (edge === 0 ? -1 : 1) * 0.375;
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
  ctx.fillText('NVIDIA VERA', 20, 58);
  ctx.font = '400 26px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(180,195,205,0.6)';
  ctx.fillText('88× OLYMPUS · SMT ×176 · 3nm', 20, 100);
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
  label.position.set(-0.26, 0.049, 0.4);
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
    defaultInfo: 'vrVeraCpu',
  };
}
