import * as THREE from 'three';
import { mat, glowMat, box, cyl, slab, led, tube, mark, ventTexture, M, GREEN } from '../common.js';

/**
 * 1U compute tray, lid removed. Front of tray = +Z.
 * Two GB200 "Bianca" boards side by side; GPUs (under black cold-plate
 * assemblies) sit at the NVLink rear edge, Grace is ahead of them, and the
 * fan wall separates the liquid-cooled compute from the air-cooled front I/O.
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

    // --- Grace CPU zone (front third) with its production black cold plate ---
    const cpuPlate = new THREE.Group();
    cpuPlate.add(slab(0.09, 0.017, 0.09, 0.008, mat(0x07090a, 0.78, 0.22), 0, 0.004, 0.15));
    cpuPlate.add(box(0.062, 0.005, 0.062, mat(0x171a1c, 0.72, 0.3), 0, 0.022, 0.15));
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

    // --- two Blackwell GPUs (rear) under larger black cold plates ---
    for (const gx of [-0.058, 0.058]) {
      const plate = new THREE.Group();
      plate.add(slab(0.102, 0.021, 0.118, 0.008, mat(0x07090a, 0.78, 0.22), gx, 0.004, -0.17));
      // machined ridge detail
      for (let i = 0; i < 4; i++) {
        plate.add(box(0.08, 0.004, 0.012, mat(0x171a1c, 0.72, 0.3), gx, 0.026, -0.215 + i * 0.03));
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
    const tubeM = mat(0x9da4a9, 0.5, 0.75);
    // serpentine: rear QDs -> GPU plates -> CPU plate
    loop.add(tube([
      [bx - 0.03, 0.035, -0.44], [bx - 0.058, 0.035, -0.31], [bx - 0.058, 0.032, -0.23],
    ], 0.0075, tubeM));
    loop.add(tube([
      [bx + 0.03, 0.035, -0.44], [bx + 0.058, 0.035, -0.31], [bx + 0.058, 0.032, -0.23],
    ], 0.0075, tubeM));
    loop.add(tube([
      [bx - 0.058, 0.032, -0.11], [bx - 0.02, 0.034, 0.00], [bx, 0.032, 0.09],
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

  /* ----- tray power distribution: busbar feed, PDB and paired conductors ----- */
  const trayPower = new THREE.Group();
  const orangeM = mat(0xc35d24, 0.46, 0.55);
  trayPower.add(tube([[0.205, 0.03, -0.42], [0.17, 0.04, -0.22], [0.12, 0.032, 0.15]], 0.009, orangeM, 28));
  trayPower.add(tube([[0.23, 0.03, -0.42], [0.20, 0.042, -0.20], [0.15, 0.032, 0.15]], 0.009, M.rubber(), 28));
  trayPower.add(box(0.09, 0.025, 0.1, mat(0x20252a, 0.46, 0.72), 0.135, 0.018, 0.18));
  for (let i = 0; i < 4; i++) trayPower.add(box(0.013, 0.012, 0.013, M.copper(), 0.105 + i * 0.02, 0.034, 0.155));
  mark(trayPower, 'trayPower');
  root.add(trayPower);

  /* ----- four liquid-cooled ConnectX-7 network cards ----- */
  const cxCards = new THREE.Group();
  for (const x of [-0.19, -0.095, 0.095, 0.19]) {
    cxCards.add(box(0.067, 0.004, 0.09, M.pcbDark(), x, 0.011, 0.21));
    cxCards.add(slab(0.052, 0.012, 0.052, 0.005, mat(0x22272b, 0.4, 0.82), x, 0.013, 0.21));
    cxCards.add(tube([[x - 0.018, 0.032, 0.18], [x, 0.036, 0.21], [x + 0.018, 0.032, 0.24]], 0.0045, mat(0xa0a7ac, 0.45, 0.78), 12));
  }
  mark(cxCards, 'connectx');
  root.add(cxCards);

  /* ----- central fan wall for the air-cooled storage and management zone ----- */
  const fans = new THREE.Group();
  const fanFrameM = mat(0x090b0c, 0.8, 0.2);
  const fanBladeM = mat(0x202428, 0.72, 0.25);
  for (let i = 0; i < 8; i++) {
    const x = -0.225 + i * 0.064;
    fans.add(box(0.055, 0.05, 0.026, fanFrameM, x, 0.03, 0.29));
    const ring = cyl(0.026, 0.026, 0.018, fanFrameM, x, 0.03, 0.29, 20);
    ring.rotation.x = Math.PI / 2;
    fans.add(ring);
    const hub = cyl(0.007, 0.007, 0.021, M.steel(), x, 0.03, 0.302, 12);
    hub.rotation.x = Math.PI / 2;
    fans.add(hub);
    for (let b = 0; b < 5; b++) {
      const blade = box(0.018, 0.005, 0.004, fanBladeM, x, 0.03, 0.301);
      blade.rotation.z = b * Math.PI * 2 / 5;
      fans.add(blade);
    }
  }
  mark(fans, 'airCooling');
  root.add(fans);

  /* ----- front I/O, inside view ----- */
  // 4x E1.S NVMe in the centre bay
  const nvme = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    nvme.add(box(0.026, 0.036, 0.11, mat(0x25282c, 0.4, 0.7), -0.045 + i * 0.03, 0.022, D / 2 - 0.07));
  }
  // Separate M.2 boot device visible behind the fan wall.
  nvme.add(box(0.022, 0.004, 0.075, M.pcbDark(), 0.18, 0.012, 0.34));
  nvme.add(box(0.014, 0.004, 0.022, M.chipBlack(), 0.18, 0.016, 0.34));
  mark(nvme, 'nvme');
  root.add(nvme);

  // 2x BlueField-3 DPU cards in mirrored outer bays
  const bf = new THREE.Group();
  for (const x of [-0.205, 0.205]) {
    bf.add(box(0.06, 0.003, 0.13, M.pcbDark(), x, 0.012, D / 2 - 0.08));
    bf.add(box(0.034, 0.01, 0.05, mat(0x30343a, 0.4, 0.75), x, 0.019, D / 2 - 0.08)); // heatsink
    bf.add(box(0.022, 0.011, 0.012, M.steel(), x - 0.013, 0.017, D / 2 - 0.016));     // dual-port cages
    bf.add(box(0.022, 0.011, 0.012, M.steel(), x + 0.013, 0.017, D / 2 - 0.016));
  }
  mark(bf, 'bluefield');
  root.add(bf);

  // 4x ConnectX-7 OSFP cages, two per side
  const cx = new THREE.Group();
  for (const x of [-0.16, -0.115, 0.115, 0.16]) {
    cx.add(box(0.038, 0.016, 0.075, M.steel(), x, 0.014, D / 2 - 0.048));
    cx.add(box(0.032, 0.01, 0.006, mat(0x050505, 0.9, 0.1), x, 0.014, D / 2 - 0.008));
  }
  mark(cx, 'connectx');
  root.add(cx);

  // HMC/BMC management module just right of centre
  const hmc = new THREE.Group();
  hmc.add(box(0.045, 0.003, 0.09, M.pcbDark(), 0.075, 0.01, D / 2 - 0.09));
  hmc.add(box(0.016, 0.005, 0.016, M.chipBlack(), 0.075, 0.014, D / 2 - 0.09));
  hmc.add(led(0.0025, GREEN, 0.075, 0.016, D / 2 - 0.045));
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
