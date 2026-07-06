import * as THREE from 'three';
import { mat, glowMat, box, cyl, slab, mark, dieTexture, M, GREEN } from '../common.js';

/**
 * Bare GB200 "Bianca" superchip board: one Grace CPU (front) + two Blackwell
 * B200 GPUs (rear), cold plates removed so the silicon is visible.
 * Rear (NVLink edge) = -Z, long axis = X.
 */
export function buildBoard() {
  const root = new THREE.Group();
  const W = 0.66, D = 0.34;

  /* ----- PCB ----- */
  const pcb = new THREE.Group();
  pcb.add(box(W, 0.006, D, M.pcb(), 0, -0.003, 0));
  // mounting holes
  for (const [hx, hz] of [[-0.3, -0.14], [0.3, -0.14], [-0.3, 0.14], [0.3, 0.14], [0, 0.15]]) {
    pcb.add(cyl(0.005, 0.005, 0.008, M.steel(), hx, 0, hz, 10));
  }
  mark(pcb, 'boardPcb');
  root.add(pcb);

  const dieTex = dieTexture(512, 512, '#10141d', 11);
  const dieMat = new THREE.MeshStandardMaterial({
    map: dieTex, roughness: 0.3, metalness: 0.75,
    emissive: 0x2a3550, emissiveIntensity: 0.22, emissiveMap: dieTex,
  });

  /* ----- two Blackwell B200 packages (rear half) ----- */
  for (const gx of [-0.17, 0.17]) {
    const pkg = new THREE.Group();
    pkg.position.set(gx, 0, -0.055);
    // substrate + interposer
    pkg.add(slab(0.115, 0.006, 0.115, 0.004, M.substrate(), 0, 0, 0));
    pkg.add(box(0.1, 0.003, 0.082, M.silicon(), 0, 0.0075, 0));
    // two compute dies with the NV-HBI seam
    pkg.add(box(0.03, 0.004, 0.056, dieMat, -0.017, 0.011, 0));
    pkg.add(box(0.03, 0.004, 0.056, dieMat, 0.017, 0.011, 0));
    pkg.add(box(0.0035, 0.0042, 0.056, glowMat(GREEN, 0.9), 0, 0.011, 0));
    // 8 HBM3e stacks, 2×2 per side
    for (const sx of [-1, 1]) {
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          pkg.add(box(0.016, 0.006, 0.028, M.hbm(), sx * (0.041 + i * 0.019), 0.012, -0.017 + j * 0.034));
        }
      }
    }
    mark(pkg, 'b200Package');
    root.add(pkg);
  }

  /* ----- Grace CPU (front centre) ----- */
  const grace = new THREE.Group();
  grace.position.set(0, 0, 0.095);
  grace.add(slab(0.1, 0.005, 0.1, 0.004, M.substrate(), 0, 0, 0));
  grace.add(box(0.056, 0.004, 0.062, dieMat, 0, 0.008, 0));
  mark(grace, 'graceCpu');
  root.add(grace);

  // 16 LPDDR5X packages around Grace
  const lp = new THREE.Group();
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      lp.add(box(0.028, 0.0045, 0.02, M.chipBlack(), sx * 0.085, 0.005, 0.035 + i * 0.028));
    }
    for (let i = 0; i < 3; i++) {
      lp.add(box(0.02, 0.0045, 0.028, M.chipBlack(), sx * (0.02 + i * 0.03), 0.005, 0.163));
    }
  }
  mark(lp, 'lpddr');
  root.add(lp);

  /* ----- NVLink-C2C glowing lanes: Grace ↔ each GPU ----- */
  const c2c = new THREE.Group();
  const laneGeo = new THREE.PlaneGeometry(0.155, 0.0035);
  laneGeo.rotateX(-Math.PI / 2); // lie flat in XZ, length along X
  for (const gx of [-0.17, 0.17]) {
    const x0 = gx * 0.28, z0 = 0.075, x1 = gx, z1 = -0.02;
    const yaw = Math.atan2(-(z1 - z0), x1 - x0);
    for (let i = 0; i < 5; i++) {
      const t = i / 4 - 0.5;
      const lane = new THREE.Mesh(
        laneGeo,
        new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.75 })
      );
      lane.position.set((x0 + x1) / 2 + t * 0.02, 0.004, (z0 + z1) / 2 + t * 0.008);
      lane.rotation.y = yaw;
      c2c.add(lane);
    }
  }
  mark(c2c, 'c2cLink');
  root.add(c2c);

  /* ----- VRM banks: rows of inductors + power stages ----- */
  const vrm = new THREE.Group();
  const indM = mat(0x3a3f45, 0.5, 0.6);
  const capM = mat(0x6b6355, 0.45, 0.5);
  for (const vx of [-0.29, 0.29]) {
    for (let i = 0; i < 8; i++) {
      vrm.add(box(0.02, 0.011, 0.02, indM, vx, 0.008, -0.135 + i * 0.038));
      vrm.add(box(0.008, 0.006, 0.02, capM, vx + (vx > 0 ? -0.02 : 0.02), 0.005, -0.135 + i * 0.038));
    }
  }
  // VRM strip between the GPU packages
  for (let i = 0; i < 5; i++) {
    vrm.add(box(0.018, 0.01, 0.018, indM, 0, 0.008, -0.15 + i * 0.045));
  }
  mark(vrm, 'vrm');
  root.add(vrm);

  /* ----- NVLink edge connectors (rear) ----- */
  const nvl = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    nvl.add(box(0.14, 0.018, 0.022, M.gold(), -0.18 + i * 0.18, 0.011, -D / 2 + 0.005));
    nvl.add(box(0.13, 0.008, 0.01, mat(0x0c0c0c, 0.6, 0.4), -0.18 + i * 0.18, 0.011, -D / 2 + 0.018));
  }
  mark(nvl, 'boardNvlink');
  root.add(nvl);

  /* ----- misc small components (part of PCB) ----- */
  const misc = new THREE.Group();
  let s = 3;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const tiny = mat(0x2c2f33, 0.55, 0.45);
  for (let i = 0; i < 70; i++) {
    const x = (rand() - 0.5) * 0.6, z = (rand() - 0.5) * 0.3;
    // keep clear of the packages
    if (Math.abs(x) < 0.26 && z < 0.02 && z > -0.13) continue;
    if (Math.abs(x) < 0.12 && z > 0.02) continue;
    misc.add(box(0.005 + rand() * 0.008, 0.003, 0.004 + rand() * 0.006, tiny, x, 0.004, z));
  }
  mark(misc, 'boardPcb');
  root.add(misc);

  /* ----- shadow disc ----- */
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(0.9, 40),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = -0.1;
  root.add(disc);
  root.userData.noHighlight = new Set([disc.id]);

  return {
    group: root,
    camera: { pos: [0.32, 0.5, 0.55], target: [0, 0, 0], min: 0.2, max: 1.8 },
    defaultInfo: 'biancaBoard',
  };
}
