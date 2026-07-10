import * as THREE from 'three';
import { mat, box, slab, mark, dieTexture, M } from '../common.js';

/**
 * NVLink 5 switch ASIC package, macro view: substrate + one monolithic
 * 50B-transistor die with SerDes PHY banks lining the port edges.
 */
export function buildNvswitch() {
  const root = new THREE.Group();

  /* ----- substrate ----- */
  const sub = new THREE.Group();
  sub.add(slab(0.9, 0.04, 0.9, 0.02, M.substrate(), 0, 0, 0));
  const ballM = mat(0x8a8f95, 0.35, 0.9);
  for (let i = 0; i < 19; i++) {
    sub.add(box(0.012, 0.008, 0.012, ballM, -0.414 + i * 0.046, -0.002, 0.437));
  }
  mark(sub, 'substrate');
  root.add(sub);

  /* ----- monolithic switch die ----- */
  const tex = dieTexture(512, 512, '#101720', 47);
  const dieM = new THREE.MeshStandardMaterial({
    map: tex, roughness: 0.28, metalness: 0.8,
    emissive: 0x2a3550, emissiveIntensity: 0.28, emissiveMap: tex,
  });
  const die = box(0.56, 0.022, 0.46, dieM, 0, 0.051, 0);
  mark(die, 'nvswitchDie');
  root.add(die);

  /* ----- SerDes PHY banks along both port edges ----- */
  const phyM = mat(0x6f6228, 0.32, 0.85, { emissive: 0x4a3d0e, emissiveIntensity: 0.25 });
  for (const sx of [-1, 1]) {
    const p = box(0.05, 0.023, 0.46, phyM, sx * 0.315, 0.051, 0);
    mark(p, 'nvswitchPhy');
    root.add(p);
    // lane pad rows on the substrate beside each PHY
    for (let i = 0; i < 12; i++) {
      const pad = box(0.028, 0.004, 0.016, M.gold(), sx * 0.395, 0.042, -0.21 + i * 0.038);
      mark(pad, 'nvswitchPhy');
      root.add(pad);
    }
  }

  /* ----- decoupling capacitors (top & bottom rims) ----- */
  const caps = new THREE.Group();
  const capM = mat(0x6b5c2c, 0.4, 0.8);
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
