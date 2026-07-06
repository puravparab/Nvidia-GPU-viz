import * as THREE from 'three';
import { mat, glowMat, box, slab, mark, dieTexture, M, GREEN } from '../common.js';

/**
 * Blackwell B200 package, macro view:
 * substrate → CoWoS interposer → 2 reticle-limit dies + NV-HBI seam → 8 HBM3e stacks.
 */
export function buildChip() {
  const root = new THREE.Group();

  /* ----- substrate ----- */
  const sub = new THREE.Group();
  sub.add(slab(1.16, 0.045, 0.94, 0.02, M.substrate(), 0, 0, 0));
  // BGA hint along visible edge
  const ballM = mat(0x8a8f95, 0.35, 0.9);
  for (let i = 0; i < 24; i++) {
    sub.add(box(0.012, 0.008, 0.012, ballM, -0.55 + i * 0.048, -0.002, 0.455));
  }
  mark(sub, 'substrate');
  root.add(sub);

  /* ----- CoWoS interposer ----- */
  const inter = box(0.98, 0.02, 0.66, mat(0x565c66, 0.32, 0.9), 0, 0.055, 0);
  mark(inter, 'interposer');
  root.add(inter);

  /* ----- two compute dies ----- */
  const t1 = dieTexture(512, 512, '#10141d', 5);
  const t2 = dieTexture(512, 512, '#10141d', 23);
  for (const [dx, tex] of [[-0.155, t1], [0.155, t2]]) {
    const dm = new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.28, metalness: 0.8,
      emissive: 0x2a3550, emissiveIntensity: 0.3, emissiveMap: tex,
    });
    const die = box(0.29, 0.022, 0.5, dm, dx, 0.075, 0);
    mark(die, 'gpuDie');
    root.add(die);
  }

  /* ----- NV-HBI die-to-die bridge (the glowing seam) ----- */
  const hbi = box(0.024, 0.023, 0.5, glowMat(GREEN, 1.5), 0, 0.075, 0);
  mark(hbi, 'nvhbi');
  root.add(hbi);

  /* ----- 8 HBM3e stacks (2×2 per side) ----- */
  const layerM = mat(0x24272c, 0.4, 0.7);
  const topM = mat(0x31353c, 0.3, 0.8);
  for (const sx of [-1, 1]) {
    for (let col = 0; col < 2; col++) {
      for (let row = 0; row < 2; row++) {
        const stack = new THREE.Group();
        const x = sx * (0.40 + col * 0.155);
        const z = -0.155 + row * 0.31;
        // 8-high stacked DRAM dies — visible layering
        for (let l = 0; l < 8; l++) {
          stack.add(box(0.125, 0.0052, 0.26, l === 7 ? topM : layerM, x, 0.068 + l * 0.0062, z));
        }
        // base logic die slightly wider
        stack.add(box(0.132, 0.006, 0.268, mat(0x1c1f24, 0.45, 0.6), x, 0.062, z));
        mark(stack, 'hbmStack');
        root.add(stack);
      }
    }
  }

  /* ----- decoupling capacitor fields ----- */
  const caps = new THREE.Group();
  const capM = mat(0xa08a3c, 0.4, 0.8);
  const capM2 = mat(0x6f6961, 0.45, 0.5);
  let s = 17;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 120; i++) {
    const edge = Math.floor(rand() * 4);
    let x, z;
    if (edge < 2) { x = (rand() - 0.5) * 1.04; z = (edge === 0 ? -1 : 1) * (0.37 + rand() * 0.06); }
    else { x = (edge === 2 ? -1 : 1) * (0.51 + rand() * 0.05); z = (rand() - 0.5) * 0.6; }
    caps.add(box(0.014, 0.007, 0.008, rand() > 0.5 ? capM : capM2, x, 0.049, z));
  }
  mark(caps, 'capacitors');
  root.add(caps);

  /* ----- etched product marking ----- */
  const cv = document.createElement('canvas');
  cv.width = 512; cv.height = 128;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.clearRect(0, 0, 512, 128);
  ctx.fillStyle = 'rgba(220,230,235,0.85)';
  ctx.font = '600 44px system-ui, sans-serif';
  ctx.fillText('NVIDIA B200', 20, 58);
  ctx.font = '400 26px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(180,195,205,0.6)';
  ctx.fillText('BLACKWELL · 208B XTORS · CoWoS-L', 20, 100);
  const labelTex = new THREE.CanvasTexture(cv);
  labelTex.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.115),
    new THREE.MeshBasicMaterial({ map: labelTex, transparent: true })
  );
  label.rotation.x = -Math.PI / 2;
  label.position.set(-0.30, 0.0468, 0.41);
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
    defaultInfo: 'b200Package',
  };
}
