import * as THREE from 'three';
import { mat, box, cyl, slab, mark, M, GREEN } from '../common.js';

/**
 * Bare GB200 "Bianca" superchip board, matched to NVIDIA's GTC display unit:
 * ~1.4:1 board, rear blind-mate edge (orange connectors) = +X. The two
 * Blackwell GPUs sit side-by-side across the width at the rear, Grace on the
 * centreline behind them, LPDDR5X in two 2×4 banks along the long edges, all
 * packages under silver lids, with dense silver VRM tile fields around the
 * GPUs. Drill into a package to see the bare silicon.
 */
export function buildBoard() {
  const root = new THREE.Group();
  const W = 0.62, D = 0.44;

  const lidM = mat(0xc8ccd2, 0.32, 0.9);
  const lidRimM = mat(0x9ba1a8, 0.4, 0.85);
  const pkgSubM = mat(0x14161a, 0.5, 0.4);

  /* ----- PCB ----- */
  const pcb = new THREE.Group();
  pcb.add(box(W, 0.006, D, M.pcbDark(), 0, -0.003, 0));
  // gold-ringed standoffs (corners + mid-board, per the photo)
  for (const [hx, hz] of [[-0.29, -0.19], [-0.29, 0.19], [0.28, -0.2], [0.28, 0.2], [-0.05, -0.19], [-0.05, 0.19], [0.02, 0]]) {
    pcb.add(cyl(0.006, 0.006, 0.009, M.gold(), hx, 0.002, hz, 10));
  }
  // two dark elastomer pads (left-centre in the photo)
  pcb.add(box(0.055, 0.007, 0.055, M.rubber(), -0.22, 0.004, 0.03));
  pcb.add(box(0.055, 0.007, 0.055, M.rubber(), -0.15, 0.004, 0.03));
  // slim edge-connector socket along the top-left long edge
  pcb.add(box(0.18, 0.01, 0.022, mat(0x1b1d20, 0.5, 0.5), -0.16, 0.006, 0.195));
  pcb.add(box(0.17, 0.005, 0.008, mat(0x050506, 0.7, 0.2), -0.16, 0.011, 0.195));
  mark(pcb, 'boardPcb');
  root.add(pcb);

  /* ----- two Blackwell B200 packages: side-by-side across the rear ----- */
  for (const gz of [-0.105, 0.105]) {
    const pkg = new THREE.Group();
    pkg.position.set(0.155, 0, gz);
    pkg.add(slab(0.15, 0.006, 0.15, 0.005, pkgSubM, 0, 0, 0));
    pkg.add(slab(0.136, 0.005, 0.136, 0.004, lidRimM, 0, 0.006, 0));
    pkg.add(slab(0.12, 0.004, 0.12, 0.003, lidM, 0, 0.011, 0));
    mark(pkg, 'b200Package');
    root.add(pkg);
  }

  /* ----- Grace CPU package: centreline, behind the GPUs ----- */
  const grace = new THREE.Group();
  grace.position.set(-0.09, 0, 0);
  grace.add(slab(0.14, 0.005, 0.14, 0.005, pkgSubM, 0, 0, 0));
  grace.add(slab(0.126, 0.005, 0.126, 0.004, lidRimM, 0, 0.005, 0));
  grace.add(slab(0.11, 0.004, 0.11, 0.003, lidM, 0, 0.01, 0));
  mark(grace, 'graceCpu');
  root.add(grace);

  /* ----- LPDDR5X: two 2×4 banks flanking Grace along the long edges ----- */
  const lp = new THREE.Group();
  for (const sz of [-1, 1]) {
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        lp.add(box(0.036, 0.005, 0.026, M.chipBlack(),
          -0.195 + c * 0.048, 0.006, sz * (0.128 + r * 0.034)));
      }
    }
  }
  mark(lp, 'lpddr');
  root.add(lp);

  /* ----- NVLink-C2C lanes: Grace ↔ each GPU (stylised; invisible in reality) ----- */
  const c2c = new THREE.Group();
  const laneGeo = new THREE.PlaneGeometry(0.15, 0.0035);
  laneGeo.rotateX(-Math.PI / 2);
  for (const gz of [-0.105, 0.105]) {
    const x0 = -0.015, z0 = 0, x1 = 0.08, z1 = gz * 0.85;
    const yaw = Math.atan2(-(z1 - z0), x1 - x0);
    for (let i = 0; i < 5; i++) {
      const t = i / 4 - 0.5;
      const lane = new THREE.Mesh(
        laneGeo,
        new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.7 })
      );
      lane.position.set((x0 + x1) / 2 - t * 0.014 * Math.sign(gz), 0.012, (z0 + z1) / 2 + t * 0.016);
      lane.rotation.y = yaw;
      c2c.add(lane);
    }
  }
  mark(c2c, 'c2cLink');
  root.add(c2c);

  /* ----- VRM tile fields: dense SILVER grids hugging the GPUs (per photo) ----- */
  const vrm = new THREE.Group();
  const tileA = mat(0x83898f, 0.4, 0.75);
  const tileB = mat(0x565c63, 0.45, 0.6);
  const tileC = mat(0x2c3036, 0.55, 0.5);
  let s = 3;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const pick = () => { const r = rand(); return r > 0.55 ? tileA : (r > 0.25 ? tileB : tileC); };
  const tileAt = (x, z) => vrm.add(box(0.017, 0.009, 0.017, pick(), x, 0.006, z));
  // column between Grace and the GPUs
  for (let i = 0; i < 4; i++) for (let j = 0; j < 16; j++) tileAt(0.03 + i * 0.023, -0.185 + j * 0.024);
  // strip between the two GPU packages
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) tileAt(0.11 + i * 0.023, -0.013 + j * 0.026);
  // outboard of each GPU toward the rear edge
  for (let j = 0; j < 8; j++) { tileAt(0.25, -0.2 + j * 0.026); tileAt(0.25, 0.018 + j * 0.026); }
  // above/below each GPU along the long edges
  for (let i = 0; i < 5; i++) { tileAt(0.1 + i * 0.028, -0.198); tileAt(0.1 + i * 0.028, 0.198); }
  mark(vrm, 'vrm');
  root.add(vrm);

  /* ----- rear blind-mate connectors (+X short edge, orange like the photo) ----- */
  const nvl = new THREE.Group();
  const orangeM = mat(0xc9761c, 0.5, 0.3);
  for (const cz of [-0.115, 0.115]) {
    nvl.add(box(0.038, 0.038, 0.115, orangeM, 0.285, 0.019, cz));
    nvl.add(box(0.022, 0.026, 0.085, mat(0x111111, 0.6, 0.4), 0.298, 0.02, cz));
  }
  nvl.add(box(0.028, 0.014, 0.06, M.gold(), 0.295, 0.007, 0));
  mark(nvl, 'boardNvlink');
  root.add(nvl);

  /* ----- front-edge I/O: flat connector row + small power headers ----- */
  const io = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    io.add(box(0.06, 0.008, 0.02, mat(0x1b1d20, 0.5, 0.5), -0.25 + i * 0.078, 0.006, -0.2));
    io.add(box(0.052, 0.004, 0.007, M.gold(), -0.25 + i * 0.078, 0.009, -0.192));
  }
  for (let i = 0; i < 3; i++) {
    io.add(box(0.02, 0.013, 0.015, mat(0x0d0e10, 0.6, 0.3), -0.295, 0.008, 0.05 + i * 0.036));
  }
  mark(io, 'boardPcb');
  root.add(io);

  /* ----- misc small components (kept clear of the packages) ----- */
  const misc = new THREE.Group();
  const tiny = mat(0x2c2f33, 0.55, 0.45);
  for (let i = 0; i < 55; i++) {
    const x = -0.29 + rand() * 0.26, z = (rand() - 0.5) * 0.34;
    if (x > -0.17 && Math.abs(z) < 0.13) continue;      // Grace zone
    if (Math.abs(z) > 0.11 && x > -0.22) continue;      // LPDDR banks
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
    camera: { pos: [0.3, 0.52, 0.58], target: [0, 0, 0], min: 0.2, max: 1.8 },
    defaultInfo: 'biancaBoard',
  };
}
