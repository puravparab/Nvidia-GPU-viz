import * as THREE from 'three';
import { mat, glowMat, box, slab, mark, M, GREEN } from '../../common.js';

/** Rubin compute-die texture: taller SM array than Blackwell (224 SMs), HBM
 *  controller bands along the sides, but no NVLink strip — I/O moved off-die
 *  into the chiplets at the package ends. */
function rubinDieTexture(seed) {
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 448;
  const ctx = cv.getContext('2d');
  let s = seed;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const speckle = (x, y, w, h, r, g, b) => {
    for (let i = 0; i < w * h / 90; i++) {
      const k = 0.75 + rand() * 0.5;
      ctx.fillStyle = `rgba(${r * k | 0},${g * k | 0},${b * k | 0},0.6)`;
      ctx.fillRect(x + rand() * (w - 5), y + rand() * (h - 3), 2 + rand() * 6, 1 + rand() * 4);
    }
  };
  ctx.fillStyle = '#1a2024';
  ctx.fillRect(0, 0, 256, 448);
  // HBM controller bands along both long edges
  for (const x0 of [0, 232]) {
    ctx.fillStyle = '#4d5a2f';
    ctx.fillRect(x0, 6, 24, 436);
    speckle(x0, 6, 24, 436, 105, 120, 62);
  }
  // die-to-die / chiplet PHY strips across both ends
  ctx.fillStyle = '#3d5556';
  ctx.fillRect(28, 0, 200, 20);
  ctx.fillRect(28, 428, 200, 20);
  // 2×5 GPC blocks around a thin L2 column — denser than Blackwell
  for (let cx = 0; cx < 2; cx++) {
    for (let cy = 0; cy < 5; cy++) {
      const x = 30 + cx * 102, y = 26 + cy * 80;
      ctx.fillStyle = '#39584a';
      ctx.fillRect(x, y, 94, 74);
      speckle(x, y, 94, 74, 80, 130, 105);
    }
  }
  ctx.fillStyle = '#28403a';
  ctx.fillRect(126, 26, 6, 396);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Rubin GPU package, macro view, lid off: substrate + stiffener → CoWoS body
 * → 2 reticle-limit dies, NVLink 6 chiplet across one end, NVLink-C2C chiplet
 * across the other, 8 HBM4 stacks down the sides. 336B transistors on 3nm.
 */
export function buildVrChip() {
  const root = new THREE.Group();
  root.userData.disableShadows = true;

  /* ----- substrate + the new anti-warpage stiffener ring ----- */
  const sub = new THREE.Group();
  sub.add(slab(1.16, 0.045, 0.94, 0.02, M.substrate(), 0, 0, 0));
  const ballM = mat(0x8a8f95, 0.35, 0.9);
  for (let i = 0; i < 24; i++) {
    sub.add(box(0.012, 0.008, 0.012, ballM, -0.55 + i * 0.048, -0.002, 0.455));
  }
  mark(sub, 'substrate');
  root.add(sub);
  // gold-toned stiffener ring — on Rubin it is a separate structural part,
  // and the lid above it (removed in this view) is electroplated gold
  const stiffM = mat(0xa08544, 0.3, 0.95);
  const lid = new THREE.Group();
  lid.add(box(1.16, 0.014, 0.09, stiffM, 0, 0.046, -0.425));
  lid.add(box(1.16, 0.014, 0.09, stiffM, 0, 0.046, 0.425));
  lid.add(box(0.09, 0.014, 0.76, stiffM, -0.535, 0.046, 0));
  lid.add(box(0.09, 0.014, 0.76, stiffM, 0.535, 0.046, 0));
  mark(lid, 'vrRubinLid');
  root.add(lid);

  /* ----- CoWoS molded body ----- */
  const mold = new THREE.Group();
  mold.add(box(0.98, 0.03, 0.72, mat(0x15181d, 0.22, 0.85), 0, 0.06, 0));
  const tealM = mat(0x1d4a45, 0.4, 0.35);
  mold.add(box(1.0, 0.012, 0.012, tealM, 0, 0.051, -0.366));
  mold.add(box(1.0, 0.012, 0.012, tealM, 0, 0.051, 0.366));
  mold.add(box(0.012, 0.012, 0.744, tealM, -0.496, 0.051, 0));
  mold.add(box(0.012, 0.012, 0.744, tealM, 0.496, 0.051, 0));
  mark(mold, 'vrInterposer');
  root.add(mold);

  /* ----- two compute dies ----- */
  const t1 = rubinDieTexture(5);
  const t2 = rubinDieTexture(23);
  for (const [dx, tex] of [[-0.155, t1], [0.155, t2]]) {
    const dm = new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.18, metalness: 0.8,
      emissive: 0xffffff, emissiveIntensity: 0.1, emissiveMap: tex,
    });
    const die = box(0.29, 0.007, 0.44, dm, dx, 0.0785, 0);
    mark(die, 'vrRubinDie');
    root.add(die);
  }
  // die-to-die seam
  const seam = box(0.016, 0.0075, 0.44, glowMat(GREEN, 0.55), 0, 0.0788, 0);
  mark(seam, 'vrRubinDie');
  root.add(seam);

  /* ----- I/O chiplets across the package ends ----- */
  // NVLink 6 chiplet (36× 400G SerDes) — front end
  const nvlM = mat(0x3d4d63, 0.24, 0.85, { emissive: 0x16222e, emissiveIntensity: 0.35 });
  const nvlChiplet = box(0.62, 0.007, 0.09, nvlM, 0, 0.0785, 0.275);
  mark(nvlChiplet, 'vrNvlink6Chiplet');
  root.add(nvlChiplet);
  // NVLink-C2C chiplet (1.8 TB/s to Vera) — rear end
  const c2cM = mat(0x2f5648, 0.24, 0.85, { emissive: 0x12291f, emissiveIntensity: 0.35 });
  const c2cChiplet = box(0.62, 0.007, 0.09, c2cM, 0, 0.0785, -0.275);
  mark(c2cChiplet, 'vrC2cChiplet');
  root.add(c2cChiplet);

  /* ----- 8 HBM4 stacks, 2×2 per side ----- */
  const hbmM = mat(0x24272c, 0.26, 0.75);
  for (const sx of [-1, 1]) {
    for (let col = 0; col < 2; col++) {
      for (let row = 0; row < 2; row++) {
        const x = sx * (0.348 + col * 0.094);
        const z = -0.155 + row * 0.31;
        const tile = box(0.085, 0.006, 0.26, hbmM, x, 0.078, z);
        mark(tile, 'vrHbm4');
        root.add(tile);
      }
    }
  }

  /* ----- decoupling capacitor fields ----- */
  const caps = new THREE.Group();
  const capM = mat(0x6b5c2c, 0.4, 0.8);
  const capM2 = mat(0x4c4841, 0.45, 0.5);
  let s = 17;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 90; i++) {
    const x = (rand() - 0.5) * 0.92;
    const z = (rand() > 0.5 ? -1 : 1) * (0.385 + rand() * 0.02);
    caps.add(box(0.014, 0.007, 0.008, rand() > 0.5 ? capM : capM2, x, 0.049, z));
  }
  mark(caps, 'capacitors');
  root.add(caps);

  /* ----- etched product marking ----- */
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 128;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = 'rgba(40,32,12,0.85)';
  ctx.font = '600 44px system-ui, sans-serif';
  ctx.fillText('NVIDIA RUBIN', 20, 58);
  ctx.font = '400 26px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(56,46,20,0.6)';
  ctx.fillText('336B XTORS · 3nm · CoWoS', 20, 100);
  const labelTex = new THREE.CanvasTexture(cv);
  labelTex.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34, 0.075),
    new THREE.MeshBasicMaterial({
      map: labelTex, transparent: true,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    })
  );
  label.rotation.x = -Math.PI / 2;
  label.position.set(-0.35, 0.056, 0.425);
  root.add(label);

  /* ----- shadow disc ----- */
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(1.4, 40),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = -0.25;
  root.add(disc);
  root.userData.noHighlight = new Set([disc.id, label.id]);

  return {
    group: root,
    camera: { pos: [0.85, 1.05, 1.35], target: [0, 0.02, 0], min: 0.5, max: 4 },
    defaultInfo: 'vrRubin',
  };
}
