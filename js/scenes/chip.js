import * as THREE from 'three';
import { mat, glowMat, box, slab, mark, dieTexture, M, GREEN } from '../common.js';

/**
 * Blackwell B200 package, macro view:
 * substrate → CoWoS advanced package → 2 reticle-limit dies + NV-HBI seam → 8 HBM3e stacks.
 */
export function buildChip() {
  const root = new THREE.Group();
  // The package is made from many sub-millimetre layers. Disabling dynamic
  // shadows here prevents shadow-map texels from crawling across those edges
  // as the camera auto-rotates; direct/environment lighting still applies.
  root.userData.disableShadows = true;

  /* ----- substrate ----- */
  const sub = new THREE.Group();
  sub.add(slab(1.16, 0.045, 0.94, 0.02, M.substrate(), 0, 0, 0));
  // BGA hint along visible edge
  const ballM = mat(0x8a8f95, 0.35, 0.9);
  for (let i = 0; i < 24; i++) {
    sub.add(box(0.012, 0.008, 0.012, ballM, -0.55 + i * 0.048, -0.002, 0.455));
  }
  // silver stiffener frame around the package rim (visible in the B200 photo)
  const stiffM = mat(0x989ea4, 0.3, 0.95);
  sub.add(box(1.16, 0.014, 0.09, stiffM, 0, 0.046, -0.425));
  sub.add(box(1.16, 0.014, 0.09, stiffM, 0, 0.046, 0.425));
  sub.add(box(0.09, 0.014, 0.76, stiffM, -0.535, 0.046, 0));
  sub.add(box(0.09, 0.014, 0.76, stiffM, 0.535, 0.046, 0));
  mark(sub, 'substrate');
  root.add(sub);

  /* ----- CoWoS-L molded body: dies + HBM sit nearly FLUSH (per the photo) ----- */
  const mold = new THREE.Group();
  mold.add(box(0.98, 0.03, 0.66, mat(0x15181d, 0.22, 0.85), 0, 0.06, 0));
  // teal underfill/epoxy ring around the silicon (the photo's blue-green border)
  const tealM = mat(0x1d4a45, 0.4, 0.35);
  mold.add(box(1.0, 0.012, 0.012, tealM, 0, 0.051, -0.336));
  mold.add(box(1.0, 0.012, 0.012, tealM, 0, 0.051, 0.336));
  mold.add(box(0.012, 0.012, 0.684, tealM, -0.496, 0.051, 0));
  mold.add(box(0.012, 0.012, 0.684, tealM, 0.496, 0.051, 0));
  mark(mold, 'interposer');
  root.add(mold);

  /* ----- two compute dies: barely proud of the molding, glossy ----- */
  const t1 = dieTexture(512, 512, '#10141d', 5);
  const t2 = dieTexture(512, 512, '#10141d', 23);
  for (const [dx, tex] of [[-0.155, t1], [0.155, t2]]) {
    const dm = new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.18, metalness: 0.85,
      emissive: 0x2a3550, emissiveIntensity: 0.18, emissiveMap: tex,
    });
    const die = box(0.29, 0.007, 0.5, dm, dx, 0.0785, 0);
    mark(die, 'gpuDie');
    root.add(die);
  }

  /* ----- NV-HBI die-to-die bridge: a subtle glowing seam, near-flush ----- */
  const hbi = box(0.016, 0.0075, 0.5, glowMat(GREEN, 0.55), 0, 0.0788, 0);
  mark(hbi, 'nvhbi');
  root.add(hbi);

  /* ----- 8 HBM3e stacks: flat molded tiles, 2×2 per side ----- */
  const hbmM = mat(0x24272c, 0.26, 0.75);
  for (const sx of [-1, 1]) {
    for (let col = 0; col < 2; col++) {
      for (let row = 0; row < 2; row++) {
        const x = sx * (0.348 + col * 0.094);
        const z = -0.155 + row * 0.31;
        const tile = box(0.085, 0.006, 0.26, hbmM, x, 0.078, z);
        mark(tile, 'hbmStack');
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
    // narrow bands between the interposer edge and the stiffener frame
    const x = (rand() - 0.5) * 0.92;
    const z = (rand() > 0.5 ? -1 : 1) * (0.345 + rand() * 0.028);
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
  ctx.fillText('BLACKWELL · 208B XTORS · CoWoS', 20, 100);
  const labelTex = new THREE.CanvasTexture(cv);
  labelTex.colorSpace = THREE.SRGBColorSpace;
  // etched onto the front stiffener rail
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
    defaultInfo: 'b200Package',
  };
}
