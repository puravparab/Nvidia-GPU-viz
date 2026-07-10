import * as THREE from 'three';
import { mat, box, slab, mark, M } from '../common.js';

/** Iridescent labeled die-shot texture matching NVIDIA's NVLink Switch Chip
 *  keynote slide: I/O SerDes bands top and bottom, 36-port rows inside them,
 *  core logic centre, management-logic columns at the sides. */
function switchDieTexture() {
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 448;
  const ctx = cv.getContext('2d');
  let s = 47;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const speckle = (x, y, w, h, n, alpha) => {
    for (let i = 0; i < n; i++) {
      const g = 120 + Math.floor(rand() * 90);
      ctx.fillStyle = `rgba(${g - 30},${g},${g - 10},${alpha})`;
      ctx.fillRect(x + rand() * (w - 6), y + rand() * (h - 4), 2 + rand() * 8, 1 + rand() * 4);
    }
  };
  const band = (x, y, w, h, base, label) => {
    ctx.fillStyle = base;
    ctx.fillRect(x, y, w, h);
    speckle(x, y, w, h, Math.floor(w * h / 300), 0.25);
    if (label) {
      ctx.fillStyle = 'rgba(235,240,240,0.75)';
      ctx.font = '600 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, x + w / 2, y + h / 2 + 4);
    }
  };
  ctx.fillStyle = '#20242c';
  ctx.fillRect(0, 0, 512, 448);
  band(10, 8, 492, 52, '#8f9aa0', 'I/O SERDES');       // top SerDes
  band(10, 64, 492, 44, '#5f8f86', '36 PORTS');
  band(10, 336, 492, 44, '#5f8f86', '36 PORTS');
  band(10, 384, 492, 52, '#8f9aa0', 'I/O SERDES');     // bottom SerDes
  band(10, 112, 88, 220, '#7a7490', 'MGMT');           // management columns
  band(414, 112, 88, 220, '#7a7490', 'MGMT');
  band(102, 112, 308, 220, '#4f7a68', 'CORE LOGIC');
  // fine block grid over the core
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#2e4a40';
  for (let x = 102; x < 410; x += 22) { ctx.beginPath(); ctx.moveTo(x, 112); ctx.lineTo(x, 332); ctx.stroke(); }
  for (let y = 112; y < 332; y += 22) { ctx.beginPath(); ctx.moveTo(102, y); ctx.lineTo(410, y); ctx.stroke(); }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * NVLink 5 switch ASIC package, macro view: the big gold substrate from the
 * keynote slide + one monolithic 50B-transistor die with SerDes bands.
 */
export function buildNvswitch() {
  const root = new THREE.Group();

  /* ----- substrate: large gold carrier, per the keynote slide ----- */
  const sub = new THREE.Group();
  sub.add(slab(0.9, 0.04, 0.9, 0.02, mat(0x9c8340, 0.36, 0.85), 0, 0, 0));
  const ballM = mat(0x8a8f95, 0.35, 0.9);
  for (let i = 0; i < 19; i++) {
    sub.add(box(0.012, 0.008, 0.012, ballM, -0.414 + i * 0.046, -0.002, 0.437));
  }
  mark(sub, 'substrate');
  root.add(sub);

  /* ----- monolithic switch die ----- */
  const tex = switchDieTexture();
  const dieM = new THREE.MeshStandardMaterial({
    map: tex, roughness: 0.26, metalness: 0.7,
    emissive: 0x2a3540, emissiveIntensity: 0.16, emissiveMap: tex,
  });
  const die = box(0.56, 0.022, 0.46, dieM, 0, 0.051, 0);
  mark(die, 'nvswitchDie');
  root.add(die);

  /* ----- SerDes PHY banks along both port edges ----- */
  const phyM = mat(0x4a4458, 0.32, 0.8, { emissive: 0x241f30, emissiveIntensity: 0.3 });
  for (const sx of [-1, 1]) {
    const p = box(0.05, 0.023, 0.46, phyM, sx * 0.315, 0.051, 0);
    mark(p, 'nvswitchPhy');
    root.add(p);
    // dark lane pad rows on the gold substrate beside each PHY
    for (let i = 0; i < 12; i++) {
      const pad = box(0.028, 0.004, 0.016, mat(0x3c4046, 0.4, 0.7), sx * 0.395, 0.042, -0.21 + i * 0.038);
      mark(pad, 'nvswitchPhy');
      root.add(pad);
    }
  }

  /* ----- decoupling capacitors (top & bottom rims) ----- */
  const caps = new THREE.Group();
  const capM = mat(0x2e3238, 0.4, 0.7);
  const capM2 = mat(0x4c4841, 0.45, 0.5);
  let s = 29;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 70; i++) {
    const x = (rand() - 0.5) * 0.8;
    const z = (rand() > 0.5 ? -1 : 1) * (0.3 + rand() * 0.09);
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
  ctx.font = '600 40px system-ui, sans-serif';
  ctx.fillText('NVLINK 5 SWITCH', 20, 56);
  ctx.font = '400 26px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(180,195,205,0.6)';
  ctx.fillText('72 PORTS · Σ 7.2 TB/s · TSMC 4NP', 20, 98);
  const labelTex = new THREE.CanvasTexture(cv);
  labelTex.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.105),
    new THREE.MeshBasicMaterial({ map: labelTex, transparent: true })
  );
  label.rotation.x = -Math.PI / 2;
  label.position.set(-0.21, 0.0415, 0.395);
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
    camera: { pos: [0.7, 0.9, 1.15], target: [0, 0.02, 0], min: 0.45, max: 3.5 },
    defaultInfo: 'nvswitchPackage',
  };
}
