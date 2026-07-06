import * as THREE from 'three';
import { mat, glowMat, box, cyl, slab, led, tube, mark, ventTexture, M, GREEN } from '../common.js';

/**
 * 1U compute tray, lid removed. Front of tray = +Z.
 * Two GB200 "Bianca" boards side by side; GPUs (under cold plates) toward the
 * NVLink rear edge, Grace toward the front — matching NVIDIA's published trays.
 */
export function buildTray() {
  const root = new THREE.Group();
  const W = 0.537, D = 0.9, WALL = 0.05; // 1U interior ≈ 44mm; slightly exaggerated for readability

  /* ----- chassis ----- */
  const chassis = new THREE.Group();
  chassis.add(box(W, 0.006, D, mat(0x2a2d31, 0.45, 0.8), 0, -0.003, 0));                 // floor
  chassis.add(box(0.006, WALL, D, M.panelMid(), -W / 2 + 0.003, WALL / 2, 0));           // left wall
  chassis.add(box(0.006, WALL, D, M.panelMid(), W / 2 - 0.003, WALL / 2, 0));            // right wall
  chassis.add(box(W, WALL, 0.008, M.panelMid(), 0, WALL / 2, -D / 2 + 0.004));           // rear wall
  // front faceplate with cutouts implied
  chassis.add(box(W, WALL, 0.01, mat(0x1d2023, 0.45, 0.7), 0, WALL / 2, D / 2 - 0.005));
  // rack ears
  chassis.add(box(0.02, WALL, 0.012, M.steel(), -W / 2 - 0.01, WALL / 2, D / 2 - 0.006));
  chassis.add(box(0.02, WALL, 0.012, M.steel(), W / 2 + 0.01, WALL / 2, D / 2 - 0.006));
  mark(chassis, 'trayChassis');
  root.add(chassis);

  /* ----- two Bianca boards ----- */
  const boardW = 0.235, boardL = 0.56;
  for (const bx of [-0.128, 0.128]) {
    const b = new THREE.Group();
    b.position.set(bx, 0.008, -0.06);

    // PCB
    b.add(box(boardW, 0.004, boardL, M.pcb(), 0, 0, 0));

    // --- Grace CPU zone (front third) with its cold plate ---
    const cpuPlate = new THREE.Group();
    cpuPlate.add(slab(0.085, 0.015, 0.085, 0.008, M.nickel(), 0, 0.004, 0.17));
    cpuPlate.add(box(0.06, 0.006, 0.06, mat(0xa8adb3, 0.3, 0.95), 0, 0.021, 0.17));
    mark(cpuPlate, 'cpuColdplate');
    b.add(cpuPlate);
    // LPDDR5X flanking the CPU plate
    for (const sx of [-0.075, 0.075]) {
      for (let i = 0; i < 4; i++) {
        const chip = box(0.024, 0.004, 0.017, M.chipBlack(), sx, 0.006, 0.115 + i * 0.036);
        mark(chip, 'lpddr');
        b.add(chip);
      }
    }

    // --- two Blackwell GPUs (rear) under bigger cold plates ---
    for (const gx of [-0.058, 0.058]) {
      const plate = new THREE.Group();
      plate.add(slab(0.1, 0.02, 0.115, 0.008, M.nickel(), gx, 0.004, -0.15));
      // machined ridge detail
      for (let i = 0; i < 4; i++) {
        plate.add(box(0.08, 0.004, 0.012, mat(0xaeb3b9, 0.32, 0.95), gx, 0.025, -0.195 + i * 0.03));
      }
      mark(plate, 'gpuColdplate');
      b.add(plate);
    }

    // --- VRM banks along outer edges ---
    for (const vx of [-boardW / 2 + 0.018, boardW / 2 - 0.018]) {
      for (let i = 0; i < 7; i++) {
        const v = box(0.014, 0.009, 0.014, mat(0x3a3f45, 0.5, 0.6), vx, 0.0065, -0.24 + i * 0.055);
        mark(v, 'vrm');
        b.add(v);
      }
    }

    // board itself is clickable → drill to superchip
    mark(b, 'biancaBoard');
    root.add(b);

    /* --- coolant loop for this board --- */
    const loop = new THREE.Group();
    const tubeM = M.rubber();
    // serpentine: rear QDs -> GPU plates -> CPU plate
    loop.add(tube([
      [bx - 0.03, 0.035, -0.44], [bx - 0.058, 0.035, -0.30], [bx - 0.058, 0.032, -0.21],
    ], 0.0075, tubeM));
    loop.add(tube([
      [bx + 0.03, 0.035, -0.44], [bx + 0.058, 0.035, -0.30], [bx + 0.058, 0.032, -0.21],
    ], 0.0075, tubeM));
    loop.add(tube([
      [bx - 0.058, 0.032, -0.09], [bx - 0.02, 0.034, 0.02], [bx, 0.032, 0.08],
    ], 0.0075, tubeM));
    // quick disconnects at the rear wall
    for (const [qx, col] of [[bx - 0.03, M.blueTube()], [bx + 0.03, M.redTube()]]) {
      const qd = cyl(0.011, 0.011, 0.045, col, qx, 0.035, -0.435, 12);
      qd.rotation.x = Math.PI / 2;
      loop.add(qd);
      const collar = cyl(0.013, 0.013, 0.012, M.steel(), qx, 0.035, -0.415, 12);
      collar.rotation.x = Math.PI / 2;
      loop.add(collar);
    }
    mark(loop, 'coolantLoop');
    root.add(loop);
  }

  /* ----- rear blind-mate connectors ----- */
  const nvl = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    nvl.add(box(0.075, 0.028, 0.018, M.gold(), -0.17 + i * 0.113, 0.024, -D / 2 + 0.014));
  }
  mark(nvl, 'nvlinkConnector');
  root.add(nvl);
  // busbar power clamp (centre rear, copper)
  const pwr = box(0.05, 0.03, 0.02, M.copper(), 0.24, 0.025, -D / 2 + 0.015);
  mark(pwr, 'busbar');
  root.add(pwr);

  /* ----- front I/O, inside view ----- */
  // 4x E1.S NVMe (left)
  const nvme = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    nvme.add(box(0.012, 0.036, 0.11, mat(0x25282c, 0.4, 0.7), -0.225 + i * 0.026, 0.022, D / 2 - 0.07));
  }
  mark(nvme, 'nvme');
  root.add(nvme);

  // 2x BlueField-3 DPU cards (right of drives)
  const bf = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const x = -0.10 + i * 0.075;
    bf.add(box(0.06, 0.003, 0.13, M.pcbDark(), x, 0.012, D / 2 - 0.08));
    bf.add(box(0.034, 0.01, 0.05, mat(0x30343a, 0.4, 0.75), x, 0.019, D / 2 - 0.08)); // heatsink
    bf.add(box(0.024, 0.011, 0.012, M.steel(), x, 0.017, D / 2 - 0.016));             // QSFP cage
  }
  mark(bf, 'bluefield');
  root.add(bf);

  // 4x ConnectX-7 OSFP cages (right)
  const cx = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const x = 0.06 + i * 0.048;
    cx.add(box(0.038, 0.016, 0.075, M.steel(), x, 0.014, D / 2 - 0.048));
    cx.add(box(0.032, 0.01, 0.006, mat(0x050505, 0.9, 0.1), x, 0.014, D / 2 - 0.008));
  }
  mark(cx, 'connectx');
  root.add(cx);

  // HMC management module (far right corner)
  const hmc = new THREE.Group();
  hmc.add(box(0.045, 0.003, 0.09, M.pcbDark(), 0.235, 0.01, D / 2 - 0.09));
  hmc.add(box(0.016, 0.005, 0.016, M.chipBlack(), 0.235, 0.014, D / 2 - 0.09));
  hmc.add(led(0.0025, GREEN, 0.235, 0.016, D / 2 - 0.045));
  mark(hmc, 'hmc');
  root.add(hmc);

  /* ----- ground shadow disc ----- */
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(1.1, 40),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5 })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = -0.12;
  root.add(disc);
  root.userData.noHighlight = new Set([disc.id]);

  return {
    group: root,
    camera: { pos: [0.55, 0.62, 0.85], target: [0, 0, 0], min: 0.3, max: 2.5 },
    defaultInfo: 'computeTray',
  };
}
