import * as THREE from 'three';
import { mat, box, cyl, slab, led, tube, mark, M, GREEN } from '../common.js';

/**
 * 1U compute tray, lid removed — matched to the GTC display photos and the
 * DGX GB200 hardware guide. Front of tray = +Z. Two Bianca boards sit side
 * by side: four dark anodised GPU cold plates in a row at the NVLink rear
 * edge, one Grace plate per board ahead of them. A power-distribution board
 * feeds from the busbar clip; liquid-cooled ConnectX-7 cards and braided
 * DensiLink runs sit ahead of the boards; a central fan wall air-cools the
 * storage/management zone behind the front I/O.
 */
export function buildTray() {
  const root = new THREE.Group();
  const W = 0.537, D = 0.9, WALL = 0.05;

  // teal anodised GPU cold plates + grey Grace plate, per the GTC tray photo
  const tealPlate = mat(0x1f6a70, 0.38, 0.7);
  const tealRidge = mat(0x27787e, 0.35, 0.75);
  const darkPlate = mat(0x3a3f45, 0.4, 0.8);
  const labelM = mat(0x9aa0a6, 0.35, 0.85);          // small spec label on each plate
  const pcbM = mat(0x101214, 0.55, 0.35);            // near-black board

  /* ----- chassis: bright aluminium interior like the production tray ----- */
  const chassis = new THREE.Group();
  chassis.add(box(W, 0.006, D, mat(0x565c62, 0.4, 0.85), 0, -0.003, 0));
  chassis.add(box(0.006, WALL, D, M.panelMid(), -W / 2 + 0.003, WALL / 2, 0));
  chassis.add(box(0.006, WALL, D, M.panelMid(), W / 2 - 0.003, WALL / 2, 0));
  chassis.add(box(W, WALL, 0.008, M.panelMid(), 0, WALL / 2, -D / 2 + 0.004));
  chassis.add(box(W, WALL, 0.01, mat(0x1d2023, 0.45, 0.7), 0, WALL / 2, D / 2 - 0.005));
  chassis.add(box(0.02, WALL, 0.012, M.steel(), -W / 2 - 0.01, WALL / 2, D / 2 - 0.006));
  chassis.add(box(0.02, WALL, 0.012, M.steel(), W / 2 + 0.01, WALL / 2, D / 2 - 0.006));
  mark(chassis, 'trayChassis');
  root.add(chassis);

  /* ----- two Bianca boards side by side ----- */
  const boardW = 0.245, boardL = 0.58;
  for (const bx of [-0.128, 0.128]) {
    const b = new THREE.Group();
    b.position.set(bx, 0.008, -0.1);

    // near-black PCB
    b.add(box(boardW, 0.004, boardL, pcbM, 0, 0, 0));

    // --- two Blackwell GPUs under dark cold plates: rear row (4 across tray) ---
    for (const gx of [-0.06, 0.06]) {
      const plate = new THREE.Group();
      plate.add(slab(0.105, 0.02, 0.115, 0.008, tealPlate, gx, 0.004, -0.19));
      for (let i = 0; i < 3; i++) {
        plate.add(box(0.085, 0.003, 0.016, tealRidge, gx, 0.025, -0.23 + i * 0.038));
      }
      // pale spec label square (visible in the photo)
      plate.add(box(0.034, 0.002, 0.026, labelM, gx, 0.0255, -0.185));
      mark(plate, 'gpuColdplate');
      b.add(plate);
    }

    // --- Grace CPU under its own dark plate, centre of the board, mid-depth ---
    const cpuPlate = new THREE.Group();
    cpuPlate.add(slab(0.095, 0.016, 0.095, 0.008, darkPlate, 0, 0.004, -0.02));
    cpuPlate.add(box(0.03, 0.002, 0.022, labelM, 0, 0.021, -0.02));
    mark(cpuPlate, 'cpuColdplate');
    b.add(cpuPlate);

    // LPDDR5X banks flanking the Grace plate across the board's width
    for (const sx of [-0.085, 0.085]) {
      for (let i = 0; i < 4; i++) {
        const chip = box(0.022, 0.004, 0.03, M.chipBlack(), sx, 0.006, -0.075 + i * 0.038);
        mark(chip, 'lpddr');
        b.add(chip);
      }
    }

    // VRM tiles between CPU and GPU zones
    for (let i = 0; i < 6; i++) {
      const v = box(0.014, 0.008, 0.014, mat(0x3b4046, 0.45, 0.75), -0.075 + i * 0.03, 0.006, -0.115);
      mark(v, 'vrm');
      b.add(v);
    }

    mark(b, 'biancaBoard');
    root.add(b);

    /* --- ConnectX-7 mezzanine on Mirror-Mezz connectors, ahead of Grace --- */
    const mezz = new THREE.Group();
    mezz.add(box(0.13, 0.004, 0.09, mat(0x131518, 0.55, 0.35), bx, 0.046, 0.06));
    for (const mx of [-0.032, 0.032]) {
      mezz.add(slab(0.042, 0.01, 0.042, 0.004, mat(0x22272b, 0.4, 0.82), bx + mx, 0.05, 0.06));
    }
    for (const [sx, sz] of [[-0.055, -0.035], [0.055, -0.035], [-0.055, 0.035], [0.055, 0.035]]) {
      mezz.add(cyl(0.0035, 0.0035, 0.034, M.steel(), bx + sx, 0.029, 0.06 + sz, 8));
    }
    mark(mezz, 'connectx');
    root.add(mezz);

    /* --- coolant loop: black corrugated hoses, rear quick-disconnects --- */
    const loop = new THREE.Group();
    const tubeM = mat(0x1a1c1e, 0.75, 0.25);
    loop.add(tube([
      [bx - 0.035, 0.035, -0.44], [bx - 0.06, 0.038, -0.36], [bx - 0.06, 0.032, -0.3],
    ], 0.008, tubeM));
    loop.add(tube([
      [bx + 0.035, 0.035, -0.44], [bx + 0.06, 0.038, -0.36], [bx + 0.06, 0.032, -0.3],
    ], 0.008, tubeM));
    loop.add(tube([
      [bx - 0.06, 0.032, -0.24], [bx - 0.02, 0.036, -0.16], [bx, 0.032, -0.12],
    ], 0.008, tubeM));
    for (const [qx, col] of [[bx - 0.035, M.blueTube()], [bx + 0.035, M.redTube()]]) {
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
  const pwr = box(0.05, 0.03, 0.02, M.copper(), 0, 0.025, -D / 2 + 0.015);
  mark(pwr, 'busbar');
  root.add(pwr);

  /* ----- central fan wall directly behind the boards (per the diagram) ----- */
  const fans = new THREE.Group();
  // silver fan cassettes with dark rotors, as in the GTC photo
  const fanFrameM = mat(0x4c5257, 0.45, 0.8);
  const fanBladeM = mat(0x17191c, 0.72, 0.25);
  for (let i = 0; i < 8; i++) {
    const x = -0.225 + i * 0.064;
    fans.add(box(0.055, 0.05, 0.026, fanFrameM, x, 0.03, 0.205));
    const ring = cyl(0.026, 0.026, 0.018, fanFrameM, x, 0.03, 0.205, 20);
    ring.rotation.x = Math.PI / 2;
    fans.add(ring);
    const hub = cyl(0.007, 0.007, 0.021, M.steel(), x, 0.03, 0.217, 12);
    hub.rotation.x = Math.PI / 2;
    fans.add(hub);
    for (let b = 0; b < 5; b++) {
      const blade = box(0.018, 0.005, 0.004, fanBladeM, x, 0.03, 0.216);
      blade.rotation.z = b * Math.PI * 2 / 5;
      fans.add(blade);
    }
  }
  mark(fans, 'airCooling');
  root.add(fans);

  /* ----- power: centre-rear busbar clip → red 48V pair → central PDB ----- */
  const trayPower = new THREE.Group();
  // dark insulated 48 V pair — hugs the board channel instead of arcing over it
  const redFeed = mat(0x571d1d, 0.6, 0.2);
  const blkFeed = mat(0x131416, 0.7, 0.15);
  trayPower.add(tube([[0.012, 0.024, -0.43], [0.014, 0.03, -0.1], [0.01, 0.026, 0.26]], 0.006, redFeed, 28));
  trayPower.add(tube([[-0.012, 0.024, -0.43], [-0.014, 0.028, -0.09], [-0.01, 0.026, 0.26]], 0.006, blkFeed, 28));
  // central power-distribution board between the fan wall and the storage bay
  trayPower.add(box(0.14, 0.028, 0.09, mat(0x20252a, 0.46, 0.72), 0, 0.019, 0.3));
  for (let i = 0; i < 5; i++) trayPower.add(box(0.014, 0.012, 0.014, M.copper(), -0.05 + i * 0.025, 0.038, 0.28));
  mark(trayPower, 'trayPower');
  root.add(trayPower);

  /* ----- daughter boards flanking the PDB (per the diagram) ----- */
  const daughters = new THREE.Group();
  for (const dx of [-0.17, 0.17]) {
    daughters.add(box(0.13, 0.004, 0.07, M.pcbDark(), dx, 0.012, 0.3));
    daughters.add(box(0.03, 0.007, 0.03, M.chipBlack(), dx, 0.017, 0.3));
  }
  mark(daughters, 'hmc');
  root.add(daughters);

  /* ----- braided DensiLink runs: mezzanines → around the fan wall → front ----- */
  const cables = new THREE.Group();
  const braidM = mat(0x191b1e, 0.85, 0.15);
  const runs = [
    [[-0.185, 0.026, 0.1], [-0.245, 0.032, 0.2], [-0.215, 0.026, 0.33]],
    [[-0.07, 0.024, 0.1], [-0.03, 0.03, 0.19], [-0.09, 0.026, 0.3]],
    [[0.07, 0.024, 0.1], [0.03, 0.03, 0.2], [0.09, 0.026, 0.3]],
    [[0.185, 0.026, 0.1], [0.245, 0.032, 0.21], [0.215, 0.026, 0.33]],
  ];
  for (const pts of runs) cables.add(tube(pts, 0.0075, braidM, 20));
  mark(cables, 'connectx');
  root.add(cables);

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
