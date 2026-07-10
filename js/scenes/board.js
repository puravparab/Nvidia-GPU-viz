import * as THREE from 'three';
import { mat, box, cyl, slab, mark, M, GREEN } from '../common.js';

/**
 * Bare GB200 "Bianca" superchip board, laid out per NVIDIA's GTC display unit:
 * long axis = X, rear blind-mate edge (orange connectors) = +X. The two
 * Blackwell GPUs sit side-by-side across the width at the rear, Grace sits
 * on the centerline behind them, and the LPDDR5X packages flank Grace in two
 * 2×4 banks along the board's long edges. All packages wear silver lids —
 * drill into them to see the bare silicon.
 */
export function buildBoard() {
  const root = new THREE.Group();
  const W = 0.66, D = 0.34;

  const lidM = mat(0xc8ccd2, 0.32, 0.9);
  const lidRimM = mat(0x9ba1a8, 0.4, 0.85);
  const pkgSubM = mat(0x14161a, 0.5, 0.4);

  /* ----- PCB ----- */
  const pcb = new THREE.Group();
  pcb.add(box(W, 0.006, D, M.pcbDark(), 0, -0.003, 0));
  // gold-ringed standoffs (from the photo: corners + mid-board)
  for (const [hx, hz] of [[-0.31, -0.15], [-0.31, 0.15], [0.30, -0.155], [0.30, 0.155], [-0.05, -0.15], [-0.05, 0.15], [0.02, 0]]) {
    pcb.add(cyl(0.006, 0.006, 0.009, M.gold(), hx, 0.002, hz, 10));
  }
  // two dark elastomer pads (left-centre in the photo)
  pcb.add(box(0.05, 0.006, 0.05, M.rubber(), -0.21, 0.004, 0.015));
  pcb.add(box(0.05, 0.006, 0.05, M.rubber(), -0.15, 0.004, 0.015));
  mark(pcb, 'boardPcb');
  root.add(pcb);

  /* ----- two Blackwell B200 packages: side-by-side across the rear ----- */
  for (const gz of [-0.088, 0.088]) {
    const pkg = new THREE.Group();
    pkg.position.set(0.16, 0, gz);
    pkg.add(slab(0.115, 0.006, 0.115, 0.004, pkgSubM, 0, 0, 0));
    // silver lid with a raised centre (like the photo's stepped IHS)
    pkg.add(slab(0.104, 0.005, 0.104, 0.004, lidRimM, 0, 0.006, 0));
    pkg.add(slab(0.092, 0.004, 0.092, 0.003, lidM, 0, 0.011, 0));
    mark(pkg, 'b200Package');
    root.add(pkg);
  }

  /* ----- Grace CPU package: centreline, behind the GPUs ----- */
  const grace = new THREE.Group();
  grace.position.set(-0.07, 0, 0);
  grace.add(slab(0.1, 0.005, 0.1, 0.004, pkgSubM, 0, 0, 0));
  grace.add(slab(0.088, 0.005, 0.088, 0.004, lidRimM, 0, 0.005, 0));
  grace.add(slab(0.076, 0.004, 0.076, 0.003, lidM, 0, 0.01, 0));
  mark(grace, 'graceCpu');
  root.add(grace);

  /* ----- LPDDR5X: two 2×4 banks flanking Grace along the long edges ----- */
  const lp = new THREE.Group();
  for (const sz of [-1, 1]) {
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        lp.add(box(0.032, 0.005, 0.022, M.chipBlack(),
          -0.155 + c * 0.041, 0.006, sz * (0.106 + r * 0.028)));
      }
    }
  }
  mark(lp, 'lpddr');
  root.add(lp);

  /* ----- NVLink-C2C lanes: Grace ↔ each GPU (stylised; invisible in reality) ----- */
  const c2c = new THREE.Group();
  const laneGeo = new THREE.PlaneGeometry(0.16, 0.0035);
  laneGeo.rotateX(-Math.PI / 2); // lie flat in XZ, length along X
  for (const gz of [-0.088, 0.088]) {
    const x0 = -0.02, z0 = 0, x1 = 0.115, z1 = gz * 0.85;
    const yaw = Math.atan2(-(z1 - z0), x1 - x0);
    for (let i = 0; i < 5; i++) {
      const t = i / 4 - 0.5;
      const lane = new THREE.Mesh(
        laneGeo,
        new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.75 })
      );
      lane.position.set((x0 + x1) / 2 - t * 0.012 * Math.sign(gz), 0.011, (z0 + z1) / 2 + t * 0.014);
      lane.rotation.y = yaw;
      c2c.add(lane);
    }
  }
  mark(c2c, 'c2cLink');
  root.add(c2c);

  /* ----- VRM tile fields: dense grids hugging the GPU packages ----- */
  const vrm = new THREE.Group();
  const tileM = mat(0x3a3f45, 0.5, 0.6);
  const tileM2 = mat(0x2c3036, 0.55, 0.5);
  let s = 3;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const tileAt = (x, z) => vrm.add(box(0.016, 0.008, 0.016, rand() > 0.4 ? tileM : tileM2, x, 0.006, z));
  // column between Grace and the GPUs
  for (let i = 0; i < 4; i++) for (let j = 0; j < 12; j++) tileAt(0.035 + i * 0.021, -0.125 + j * 0.023);
  // strips outboard of each GPU and along the rear edge
  for (let j = 0; j < 6; j++) { tileAt(0.24, -0.155 + j * 0.024); tileAt(0.24, 0.035 + j * 0.024); }
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) tileAt(0.10 + i * 0.021, -0.02 + j * 0.012 - 0.012);
  mark(vrm, 'vrm');
  root.add(vrm);

  /* ----- rear blind-mate connectors (+X short edge, orange like the photo) ----- */
  const nvl = new THREE.Group();
  const orangeM = mat(0xc9761c, 0.5, 0.3);
  for (const cz of [-0.09, 0.09]) {
    nvl.add(box(0.035, 0.03, 0.1, orangeM, 0.305, 0.015, cz));
    nvl.add(box(0.02, 0.02, 0.075, mat(0x111111, 0.6, 0.4), 0.318, 0.016, cz));
  }
  // gold power fingers between them
  nvl.add(box(0.025, 0.012, 0.05, M.gold(), 0.315, 0.006, 0));
  mark(nvl, 'boardNvlink');
  root.add(nvl);

  /* ----- front-edge I/O: flat connector row + small power headers ----- */
  const io = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    io.add(box(0.058, 0.008, 0.018, mat(0x1b1d20, 0.5, 0.5), -0.285 + i * 0.075, 0.006, -0.155));
    io.add(box(0.05, 0.004, 0.006, M.gold(), -0.285 + i * 0.075, 0.009, -0.148));
  }
  for (let i = 0; i < 3; i++) {
    io.add(box(0.018, 0.012, 0.014, mat(0x0d0e10, 0.6, 0.3), -0.315, 0.008, 0.06 + i * 0.032));
  }
  mark(io, 'boardPcb');
  root.add(io);

  /* ----- misc small components (kept clear of the packages) ----- */
  const misc = new THREE.Group();
  const tiny = mat(0x2c2f33, 0.55, 0.45);
  for (let i = 0; i < 60; i++) {
    const x = -0.32 + rand() * 0.28, z = (rand() - 0.5) * 0.28;
    if (x > -0.13 && Math.abs(z) < 0.11) continue;      // Grace + LPDDR zone
    if (Math.abs(z) > 0.14 && x > -0.2) continue;       // edge banks
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
