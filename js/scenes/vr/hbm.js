import * as THREE from 'three';
import { mat, box, cyl, mark, M } from '../../common.js';

/**
 * Illustrative exploded HBM4 stack: base logic die with the doubled 2048-bit
 * interface, twelve representative DRAM layers (36 GB per stack), TSV columns
 * and micro-bump arrays. Vendors' shipped layer counts are not public.
 */
export function buildVrHbm() {
  const root = new THREE.Group();

  const LAYERS = 12;
  const GAP = 0.115;           // tighter explode than HBM3e — taller tower
  const baseY = 0;

  /* ----- base logic die ----- */
  const base = new THREE.Group();
  base.add(box(0.78, 0.05, 0.56, mat(0x1c1f24, 0.42, 0.7), 0, baseY + 0.025, 0));
  // 2048-bit interface: two staggered pad rows instead of HBM3e's single row
  for (let i = 0; i < 16; i++) {
    base.add(box(0.03, 0.012, 0.03, M.gold(), -0.35 + i * 0.0467, baseY - 0.004, 0.24));
    base.add(box(0.03, 0.012, 0.03, M.gold(), -0.327 + i * 0.0467, baseY - 0.004, 0.19));
  }
  mark(base, 'vrHbmBase');
  root.add(base);

  /* ----- 12 DRAM dies, exploded upward ----- */
  const layerM = mat(0x262a31, 0.38, 0.72);
  const topM = mat(0x31353c, 0.3, 0.8);
  const dieYs = [];
  for (let l = 0; l < LAYERS; l++) {
    const y = baseY + 0.12 + l * GAP;
    dieYs.push(y);
    const d = box(0.68, 0.024, 0.48, l === LAYERS - 1 ? topM : layerM, 0, y, 0);
    mark(d, 'vrHbmDram');
    root.add(d);
  }

  /* ----- TSV columns through the tower ----- */
  const tsvs = new THREE.Group();
  const tsvM = mat(0x9e6a2a, 0.32, 0.95, { emissive: 0x2a1f06, emissiveIntensity: 0.25 });
  const colH = dieYs[LAYERS - 1] + 0.012 - baseY;
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 4; j++) {
      tsvs.add(cyl(0.006, 0.006, colH, tsvM, -0.24 + i * 0.08, baseY + colH / 2, -0.15 + j * 0.1, 8));
    }
  }
  mark(tsvs, 'hbmTsv');
  root.add(tsvs);

  /* ----- micro-bump arrays between layers ----- */
  const bumps = new THREE.Group();
  const bumpM = mat(0x848a92, 0.3, 0.95);
  for (let l = 0; l < LAYERS; l++) {
    const below = l === 0 ? baseY + 0.05 : dieYs[l - 1] + 0.012;
    const above = dieYs[l] - 0.012;
    const y = (below + above) / 2;
    for (let i = 0; i < 9; i++) {
      for (const bz of [-0.19, 0.19]) {
        bumps.add(box(0.014, 0.014, 0.014, bumpM, -0.28 + i * 0.07, y, bz));
      }
    }
  }
  mark(bumps, 'hbmBumps');
  root.add(bumps);

  /* ----- shadow disc ----- */
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(1.6, 40),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = -0.3;
  root.add(disc);
  root.userData.noHighlight = new Set([disc.id]);

  return {
    group: root,
    camera: { pos: [1.45, 1.25, 1.9], target: [0, 0.75, 0], min: 0.6, max: 4.8 },
    defaultInfo: 'vrHbm4',
  };
}
