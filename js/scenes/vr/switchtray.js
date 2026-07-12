import * as THREE from 'three';
import { mat, box, cyl, slab, led, tube, mark, dieTexture, M, GREEN } from '../../common.js';

/**
 * NVLink 6 switch tray, lid removed. Four switch ASICs sit in a row across
 * the rear half of a 32-layer board — every NVLink signal runs over PCB, so
 * unlike the GB200 tray there are no cable looms around the packages. Three
 * ASICs keep their shared cold plate, one is exposed to show the silicon.
 * The SMM host module at the front connects through the only flyover cable
 * left in the entire rack. Front of tray = +Z.
 */
export function buildVrSwitchtray() {
  const root = new THREE.Group();
  const W = 0.537, D = 0.9, WALL = 0.05;

  /* ----- chassis ----- */
  const chassis = new THREE.Group();
  chassis.add(box(W, 0.006, D, mat(0x565c62, 0.4, 0.85), 0, -0.003, 0));
  chassis.add(box(0.006, WALL, D, M.panelMid(), -W / 2 + 0.003, WALL / 2, 0));
  chassis.add(box(0.006, WALL, D, M.panelMid(), W / 2 - 0.003, WALL / 2, 0));
  chassis.add(box(W, WALL, 0.008, M.panelMid(), 0, WALL / 2, -D / 2 + 0.004));
  chassis.add(box(W, WALL, 0.01, mat(0x17191c, 0.45, 0.7), 0, WALL / 2, D / 2 - 0.005));
  chassis.add(box(0.02, WALL, 0.012, M.steel(), -W / 2 - 0.01, WALL / 2, D / 2 - 0.006));
  chassis.add(box(0.02, WALL, 0.012, M.steel(), W / 2 + 0.01, WALL / 2, D / 2 - 0.006));
  chassis.add(led(0.0026, GREEN, 0.24, WALL / 2, D / 2 + 0.002));
  mark(chassis, 'vrSwitchChassis');
  root.add(chassis);

  /* ----- 32-layer switch board ----- */
  const pcb = box(W * 0.92, 0.005, D * 0.82, mat(0x101a13, 0.55, 0.35), 0, 0.006, -0.02);
  mark(pcb, 'vrSwPcb');
  root.add(pcb);

  const dieTex = dieTexture(512, 512, '#101a17', 31);
  const dieMat = new THREE.MeshStandardMaterial({
    map: dieTex, roughness: 0.3, metalness: 0.75,
    emissive: 0x2a4038, emissiveIntensity: 0.22, emissiveMap: dieTex,
  });

  /* ----- four ASICs in a row across the rear half ----- */
  const xs = [-0.183, -0.061, 0.061, 0.183];

  // cold plate module over the left pair + third package, leaving the
  // centreline power channel clear and the fourth package exposed
  const plate = new THREE.Group();
  const plateM = mat(0x969ca2, 0.3, 0.95);
  const ridgeM = mat(0x9aa0a6, 0.28, 0.95);
  plate.add(slab(0.215, 0.022, 0.13, 0.008, plateM, -0.122, 0.016, -0.16));
  for (let i = 0; i < 6; i++) {
    plate.add(box(0.19, 0.004, 0.012, ridgeM, -0.122, 0.04, -0.21 + i * 0.02));
  }
  plate.add(slab(0.095, 0.022, 0.13, 0.008, plateM, 0.063, 0.016, -0.16));
  for (let i = 0; i < 6; i++) {
    plate.add(box(0.075, 0.004, 0.012, ridgeM, 0.063, 0.04, -0.21 + i * 0.02));
  }
  mark(plate, 'vrSwColdplate');
  root.add(plate);

  for (let i = 0; i < 4; i++) {
    const pkg = new THREE.Group();
    pkg.position.set(xs[i], 0.009, -0.16);
    pkg.add(slab(0.11, 0.005, 0.11, 0.005, M.substrate(), 0, 0, 0));
    if (i === 3) {
      // exposed silicon on the rightmost package
      pkg.add(box(0.07, 0.004, 0.062, dieMat, 0, 0.007, 0));
      pkg.add(box(0.007, 0.0042, 0.062, mat(0x8a7a30, 0.35, 0.85), -0.039, 0.007, 0));
      pkg.add(box(0.007, 0.0042, 0.062, mat(0x8a7a30, 0.35, 0.85), 0.039, 0.007, 0));
      const capM = mat(0x6b5c2c, 0.4, 0.8);
      for (let c = 0; c < 8; c++) {
        pkg.add(box(0.006, 0.003, 0.004, capM, -0.04 + c * 0.0115, 0.006, 0.044));
        pkg.add(box(0.006, 0.003, 0.004, capM, -0.04 + c * 0.0115, 0.006, -0.044));
      }
    }
    mark(pkg, 'vrNvswitchPkg');
    root.add(pkg);
  }

  /* ----- NVLink lanes over PCB: etched trace bundles, no cables ----- */
  const lanes = new THREE.Group();
  const laneM = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.16 });
  for (const ax of xs) {
    for (let i = 0; i < 3; i++) {
      const spread = (i - 1) * 0.028;
      const lane = new THREE.Mesh(new THREE.PlaneGeometry(0.006, 0.17), laneM);
      lane.rotation.x = -Math.PI / 2;
      lane.rotation.z = spread * 2.2;
      lane.position.set(ax + spread, 0.0095, -0.325);
      lanes.add(lane);
    }
  }
  mark(lanes, 'vrSwPcb');
  root.add(lanes);

  /* ----- 50 V feeds + power stages down the centreline ----- */
  const power = new THREE.Group();
  power.add(tube([[0.012, 0.024, -0.43], [0.014, 0.03, -0.2], [0.01, 0.026, 0.09]], 0.006, mat(0x6e3316, 0.55, 0.4), 24));
  power.add(tube([[-0.012, 0.024, -0.43], [-0.014, 0.028, -0.19], [-0.01, 0.026, 0.1]], 0.006, M.rubber(), 24));
  power.add(box(0.05, 0.022, 0.06, mat(0x1a1c1f, 0.45, 0.7), 0.035, 0.017, 0.13));
  power.add(box(0.05, 0.022, 0.06, mat(0x1a1c1f, 0.45, 0.7), -0.035, 0.017, 0.13));
  mark(power, 'vrBusbar');
  root.add(power);

  /* ----- coolant loop: rear QDs into the shared plate ----- */
  const loop = new THREE.Group();
  const tubeM = mat(0x82888d, 0.42, 0.85);
  loop.add(tube([[-0.2, 0.03, -0.42], [-0.17, 0.04, -0.3], [-0.13, 0.036, -0.22]], 0.007, tubeM));
  loop.add(tube([[0.2, 0.03, -0.42], [0.14, 0.04, -0.3], [0.01, 0.036, -0.22]], 0.007, tubeM));
  for (const [qx, col] of [[-0.2, M.blueTube()], [0.2, M.redTube()]]) {
    const qd = cyl(0.012, 0.012, 0.045, col, qx, 0.035, -0.435, 12);
    qd.rotation.x = Math.PI / 2;
    loop.add(qd);
  }
  mark(loop, 'vrSwColdplate');
  root.add(loop);

  /* ----- rear NVLink backplane: same connector field as GB200 ----- */
  const back = new THREE.Group();
  for (let r = 0; r < 2; r++) {
    for (let i = 0; i < 9; i++) {
      back.add(box(0.045, 0.016, 0.018, M.gold(), -0.21 + i * 0.0525, 0.014 + r * 0.022, -D / 2 + 0.014));
    }
  }
  mark(back, 'vrSwBackplane');
  root.add(back);
  const pwr = box(0.05, 0.03, 0.02, M.copper(), 0, 0.025, -D / 2 + 0.015);
  mark(pwr, 'vrBusbar');
  root.add(pwr);

  /* ----- SMM host module, front — with the rack's last flyover cable ----- */
  const smm = new THREE.Group();
  smm.add(box(0.11, 0.003, 0.11, M.pcbDark(), -0.12, 0.012, D / 2 - 0.09));
  smm.add(box(0.03, 0.008, 0.03, mat(0x969ca2, 0.3, 0.9), -0.12, 0.017, D / 2 - 0.1)); // small CPU lid
  smm.add(box(0.014, 0.013, 0.016, M.steel(), -0.15, 0.012, D / 2 - 0.045));
  smm.add(box(0.014, 0.013, 0.016, M.steel(), -0.10, 0.012, D / 2 - 0.045));
  smm.add(led(0.0025, GREEN, -0.075, 0.018, D / 2 - 0.05));
  // the lone PCIe flyover, arcing from the board mid-zone to the SMM
  smm.add(tube([[0.03, 0.02, 0.12], [-0.03, 0.05, 0.22], [-0.1, 0.022, 0.33]], 0.0065, mat(0x6fa3b5, 0.5, 0.35), 24));
  mark(smm, 'vrSwSmm');
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
    camera: { pos: [0.5, 0.6, 0.8], target: [0, 0, -0.05], min: 0.3, max: 2.5 },
    defaultInfo: 'vrSwitchTray',
  };
}
