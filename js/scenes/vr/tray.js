import * as THREE from 'three';
import { mat, box, cyl, slab, led, tube, mark, M, GREEN } from '../../common.js';

/**
 * VR NVL72 compute tray, lid removed — laid out per the SemiAnalysis top-view
 * diagram. Front of tray = +Z. Rear half: two Strata modules (2 Rubin + 1 Vera
 * + 8 SOCAMM each) blind-mating to NVLink 6 connectors at the rear edge and to
 * the green PCB midplane at mid-chassis. Front half: stacked Orchid module
 * bays left and right, BlueField-4 + power-delivery module in the centre, a
 * slim management column beside it. No fans, no internal cables: coolant
 * enters by UQD rear-left, feeds an internal manifold, exits rear-right.
 */
export function buildVrTray() {
  const root = new THREE.Group();
  const W = 0.537, D = 0.9, WALL = 0.05;

  const goldPlate = mat(0x8f7434, 0.28, 1.0);        // gold-plated Rubin cold plates
  const goldRidge = mat(0xa2843c, 0.26, 1.0);
  const darkPlate = mat(0x3a3f45, 0.4, 0.8);         // Vera plate
  const socammM = mat(0x2e3340, 0.45, 0.6);
  const strataPcb = mat(0x2a2d31, 0.5, 0.5);         // grey Strata carrier
  const orchidPcb = mat(0x13201a, 0.55, 0.35);       // dark green module PCBs
  const midplaneM = mat(0x16351f, 0.5, 0.4);         // midplane green
  const connBlack = mat(0x0f1012, 0.55, 0.4);        // Paladin HD2 blocks

  /* ----- chassis: fanless aluminium tub ----- */
  const chassis = new THREE.Group();
  chassis.add(box(W, 0.006, D, mat(0x565c62, 0.4, 0.85), 0, -0.003, 0));
  chassis.add(box(0.006, WALL, D, M.panelMid(), -W / 2 + 0.003, WALL / 2, 0));
  chassis.add(box(0.006, WALL, D, M.panelMid(), W / 2 - 0.003, WALL / 2, 0));
  chassis.add(box(W, WALL, 0.008, M.panelMid(), 0, WALL / 2, -D / 2 + 0.004));
  chassis.add(box(W, WALL, 0.01, mat(0x1d2023, 0.45, 0.7), 0, WALL / 2, D / 2 - 0.005));
  chassis.add(box(0.02, WALL, 0.012, M.steel(), -W / 2 - 0.01, WALL / 2, D / 2 - 0.006));
  chassis.add(box(0.02, WALL, 0.012, M.steel(), W / 2 + 0.01, WALL / 2, D / 2 - 0.006));
  // module bay divider walls in the front half (the guided loading mechanism)
  for (const dx of [-0.115, 0.045, 0.125]) {
    chassis.add(box(0.004, 0.034, 0.36, mat(0x4a5057, 0.45, 0.8), dx, 0.017, 0.24));
  }
  mark(chassis, 'vrTrayChassis');
  root.add(chassis);

  /* ----- two Strata modules, rear half ----- */
  for (const sx of [-0.131, 0.131]) {
    const s = new THREE.Group();
    s.position.set(sx, 0.008, -0.22);

    // module carrier board — the pair leaves a centre channel for the
    // internal busbar and manifold runs
    s.add(box(0.225, 0.004, 0.42, strataPcb, 0, 0, 0));

    // two gold-plated Rubin cold plates side by side at the rear
    for (const gx of [-0.058, 0.058]) {
      const plate = new THREE.Group();
      plate.add(slab(0.1, 0.02, 0.105, 0.008, goldPlate, gx, 0.004, -0.135));
      for (let i = 0; i < 3; i++) {
        plate.add(box(0.08, 0.003, 0.015, goldRidge, gx, 0.025, -0.17 + i * 0.035));
      }
      s.add(plate);
    }

    // Vera cold plate on the centreline, mid-board
    const cpu = new THREE.Group();
    cpu.add(slab(0.085, 0.016, 0.085, 0.008, darkPlate, 0, 0.004, 0.03));
    cpu.add(box(0.028, 0.002, 0.02, mat(0x9aa0a6, 0.35, 0.85), 0, 0.021, 0.03));
    s.add(cpu);

    // 8 SOCAMM modules: four vertical sticks per side of Vera
    for (const side of [-1, 1]) {
      for (let i = 0; i < 4; i++) {
        const stick = box(0.014, 0.014, 0.085, socammM, side * (0.058 + i * 0.016), 0.009, 0.03);
        mark(stick, 'vrSocamm');
        s.add(stick);
      }
    }

    // IBC 50→12V bricks ahead of the memory
    for (const bx of [-0.05, -0.026, 0.026, 0.05]) {
      const ibc = box(0.02, 0.012, 0.024, mat(0x2c5a80, 0.45, 0.6), bx, 0.008, 0.13);
      mark(ibc, 'vrIbc');
      s.add(ibc);
    }
    // round 50V power posts on the module's outer edge
    for (const pz of [0.1, 0.13]) {
      const post = cyl(0.008, 0.008, 0.014, M.copper(), Math.sign(sx) * 0.1, 0.009, pz, 10);
      mark(post, 'vrStrataPower');
      s.add(post);
    }

    // Paladin HD2 board-to-board connectors on the front edge (to midplane)
    for (const cx of [-0.07, 0, 0.07]) {
      const c = box(0.055, 0.016, 0.022, connBlack, cx, 0.01, 0.2);
      mark(c, 'vrPaladin');
      s.add(c);
    }

    mark(s, 'vrStrata');
    root.add(s);
  }

  /* ----- rear edge: NVLink 6 connectors + busbar clip + UQDs ----- */
  const nvl = new THREE.Group();
  for (const cx of [-0.19, -0.06, 0.06, 0.19]) {
    nvl.add(box(0.085, 0.028, 0.018, M.gold(), cx, 0.024, -D / 2 + 0.014));
  }
  mark(nvl, 'vrTrayNvlink');
  root.add(nvl);

  const busbar = new THREE.Group();
  busbar.add(box(0.045, 0.03, 0.022, M.copper(), 0, 0.025, -D / 2 + 0.016));
  // internal busbar cables: short runs from the clip to each Strata's inner
  // edge, plus the long feed under the midplane to the front PDM
  const busM = mat(0x571d1d, 0.6, 0.2);
  busbar.add(tube([[0, 0.024, -0.435], [-0.012, 0.014, -0.32], [-0.016, 0.012, -0.17]], 0.004, busM, 20));
  busbar.add(tube([[0, 0.024, -0.435], [0.012, 0.014, -0.32], [0.016, 0.012, -0.17]], 0.004, busM, 20));
  busbar.add(tube([[0, 0.024, -0.435], [0.002, 0.012, -0.2], [0.002, 0.01, 0.02], [-0.02, 0.02, 0.1]], 0.0035, busM, 28));
  mark(busbar, 'vrTrayBusbar');
  root.add(busbar);

  /* ----- coolant: UQDs → rear-wall runs → centre-channel manifold + MQDs ----- */
  const cool = new THREE.Group();
  // blue inlet UQD rear-left, red outlet rear-right
  for (const [qx, colM] of [[-W / 2 + 0.035, M.blueTube()], [W / 2 - 0.035, M.redTube()]]) {
    const qd = cyl(0.013, 0.013, 0.05, colM, qx, 0.03, -D / 2 + 0.03, 12);
    qd.rotation.x = Math.PI / 2;
    cool.add(qd);
    const collar = cyl(0.015, 0.015, 0.012, M.steel(), qx, 0.03, -D / 2 + 0.058, 12);
    collar.rotation.x = Math.PI / 2;
    cool.add(collar);
  }
  // edge runs: down the chassis sides (outside the Stratas), turning inward
  // through the gap ahead of the Paladin connectors to reach the manifold
  cool.add(tube([
    [-W / 2 + 0.035, 0.026, -0.41], [-W / 2 + 0.02, 0.026, -0.2],
    [-W / 2 + 0.02, 0.024, -0.02], [-0.12, 0.022, 0.014], [-0.02, 0.02, 0.006],
  ], 0.0075, M.blueTube(), 40));
  cool.add(tube([
    [W / 2 - 0.035, 0.026, -0.41], [W / 2 - 0.02, 0.026, -0.2],
    [W / 2 - 0.02, 0.024, -0.02], [0.12, 0.022, 0.014], [0.02, 0.02, 0.006],
  ], 0.0075, M.redTube(), 40));
  // internal manifold: slim supply/return pipes down the centre channel
  for (const [mxOff, colM] of [[-0.011, M.blueTube()], [0.011, M.redTube()]]) {
    const run = cyl(0.0075, 0.0075, 0.38, colM, mxOff, 0.02, -0.18, 10);
    run.rotation.x = Math.PI / 2;
    cool.add(run);
  }
  // MQD fittings branching to the module cold plates
  const stubM = M.steel();
  for (const mz of [-0.34, -0.22, -0.1]) {
    for (const side of [-1, 1]) {
      const fit = cyl(0.004, 0.004, 0.022, stubM, side * 0.024, 0.02, mz, 8);
      fit.rotation.z = Math.PI / 2;
      cool.add(fit);
    }
  }
  mark(cool, 'vrTrayManifold');
  root.add(cool);

  /* ----- PCB midplane: vertical green wall at mid-chassis ----- */
  const mid = new THREE.Group();
  mid.add(box(W * 0.94, 0.036, 0.008, midplaneM, 0, 0.02, 0.035));
  // Paladin HD2 connector blocks on both faces
  for (const cx of [-0.195, -0.125, -0.055, 0.02, 0.09, 0.16, 0.22]) {
    mid.add(box(0.05, 0.014, 0.006, connBlack, cx, 0.018, 0.028));
    mid.add(box(0.05, 0.014, 0.006, connBlack, cx, 0.018, 0.042));
  }
  mark(mid, 'vrMidplane');
  root.add(mid);

  /* ----- Orchid bays: two stacked modules left and right ----- */
  for (const ox of [-0.185, 0.185]) {
    const bay = new THREE.Group();
    bay.position.set(ox, 0, 0);
    // two stacked slim boards (lower + upper of the pair)
    for (const [oy, tall] of [[0.008, false], [0.026, true]]) {
      bay.add(box(0.125, 0.003, 0.36, orchidPcb, 0, oy, 0.24));
      if (!tall) continue;
      // upper module carries the visible parts in this view
      // Paladin HD2 at the rear end, mating the midplane
      bay.add(box(0.05, 0.012, 0.018, connBlack, 0, oy + 0.008, 0.07));
      // two CX-9 packages with slim cold plates near the front
      for (const nx of [-0.032, 0.002]) {
        const nic = slab(0.03, 0.008, 0.03, 0.004, mat(0x22272b, 0.4, 0.82), nx, oy + 0.004, 0.33);
        mark(nic, 'vrCx9');
        bay.add(nic);
      }
      // E1.S ruler drive alongside
      const ssd = box(0.024, 0.01, 0.1, mat(0x2e3340, 0.42, 0.65), 0.042, oy + 0.006, 0.35);
      mark(ssd, 'vrNvme');
      bay.add(ssd);
      // 800G OSFP cages at the faceplate
      for (const cx of [-0.034, -0.002]) {
        const cage = box(0.026, 0.014, 0.05, M.steel(), cx, oy + 0.006, 0.415);
        mark(cage, 'vrCx9');
        bay.add(cage);
      }
    }
    mark(bay, 'vrOrchid');
    root.add(bay);
  }

  /* ----- BlueField-4 module, front centre ----- */
  const bf = new THREE.Group();
  bf.position.set(-0.035, 0, 0);
  bf.add(box(0.145, 0.003, 0.36, orchidPcb, 0, 0.008, 0.24));
  bf.add(box(0.05, 0.012, 0.018, connBlack, 0, 0.016, 0.07));   // Paladin HD2
  // Grace + CX-9 co-package on a shared substrate
  const pkg = new THREE.Group();
  pkg.add(slab(0.075, 0.006, 0.095, 0.006, mat(0x14161a, 0.5, 0.4), 0.01, 0.01, 0.17));
  pkg.add(box(0.05, 0.008, 0.05, mat(0x969ca2, 0.3, 0.9), 0.01, 0.014, 0.155)); // Grace lid
  pkg.add(box(0.028, 0.007, 0.024, mat(0x30353c, 0.4, 0.75), 0.01, 0.013, 0.2)); // CX-9 die
  bf.add(pkg);
  // LPDDR5X chips beside the package
  for (let i = 0; i < 4; i++) {
    bf.add(box(0.016, 0.005, 0.02, M.chipBlack(), -0.048, 0.01, 0.125 + i * 0.028));
  }
  // BMC (AST2600)
  bf.add(box(0.02, 0.006, 0.02, mat(0x3c2f42, 0.45, 0.6), -0.04, 0.01, 0.26));
  // E1.S SSD front-right
  const bfSsd = box(0.024, 0.01, 0.1, mat(0x2e3340, 0.42, 0.65), 0.045, 0.011, 0.35);
  mark(bfSsd, 'vrNvme');
  bf.add(bfSsd);
  // two 400G QSFP cages at the faceplate
  for (const cx of [-0.026, 0.004]) {
    bf.add(box(0.024, 0.013, 0.05, M.steel(), cx, 0.011, 0.415));
  }
  mark(bf, 'vrBluefield');
  root.add(bf);

  /* ----- power delivery module: raised deck above the BF-4 rear ----- */
  const pdm = new THREE.Group();
  pdm.add(box(0.14, 0.008, 0.13, mat(0x20252a, 0.46, 0.72), -0.035, 0.036, 0.135));
  for (let i = 0; i < 4; i++) {
    pdm.add(box(0.024, 0.012, 0.03, mat(0x2c5a80, 0.45, 0.6), -0.083 + i * 0.032, 0.046, 0.115));
  }
  for (let i = 0; i < 3; i++) {
    pdm.add(box(0.014, 0.01, 0.014, M.copper(), -0.06 + i * 0.028, 0.045, 0.165));
  }
  mark(pdm, 'vrPdm');
  root.add(pdm);

  /* ----- management column: SMM / TPM / DC-SCM between BF-4 and right bay ----- */
  const smm = new THREE.Group();
  smm.add(box(0.028, 0.003, 0.34, orchidPcb, 0.083, 0.008, 0.24));
  for (let i = 0; i < 3; i++) {
    smm.add(box(0.02, 0.008, 0.07, mat(0x30353c, 0.45, 0.6), 0.083, 0.012, 0.13 + i * 0.1));
  }
  smm.add(led(0.0025, GREEN, 0.083, 0.018, 0.4));
  mark(smm, 'vrSmm');
  root.add(smm);

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
    defaultInfo: 'vrComputeTray',
  };
}
