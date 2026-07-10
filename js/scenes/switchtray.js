import * as THREE from 'three';
import { mat, box, cyl, slab, led, tube, mark, dieTexture, M, GREEN } from '../common.js';

/**
 * NVLink switch tray, lid removed — matched to NVIDIA's production top view:
 * the two NVLink 5 switch ASICs sit side-by-side in the rear half, beside a
 * dense gray liquid-cooling loop and the rear blind-mate connector field.
 * Red/black 50 V feeds run down the centerline from the busbar clamp.
 * One ASIC keeps its cold plate, one is exposed to show the silicon.
 * Front of tray = +Z.
 */
export function buildSwitchTray() {
  const root = new THREE.Group();
  const W = 0.537, D = 0.9, WALL = 0.05;

  /* ----- chassis ----- */
  const chassis = new THREE.Group();
  chassis.add(box(W, 0.006, D, mat(0x2a2d31, 0.45, 0.8), 0, -0.003, 0));
  chassis.add(box(0.006, WALL, D, M.panelMid(), -W / 2 + 0.003, WALL / 2, 0));
  chassis.add(box(0.006, WALL, D, M.panelMid(), W / 2 - 0.003, WALL / 2, 0));
  chassis.add(box(W, WALL, 0.008, M.panelMid(), 0, WALL / 2, -D / 2 + 0.004));
  chassis.add(box(W, WALL, 0.01, mat(0x17191c, 0.45, 0.7), 0, WALL / 2, D / 2 - 0.005));
  chassis.add(box(0.02, WALL, 0.012, M.steel(), -W / 2 - 0.01, WALL / 2, D / 2 - 0.006));
  chassis.add(box(0.02, WALL, 0.012, M.steel(), W / 2 + 0.01, WALL / 2, D / 2 - 0.006));
  chassis.add(led(0.0026, GREEN, 0.24, WALL / 2, D / 2 + 0.002));
  mark(chassis, 'switchTrayChassis');
  root.add(chassis);

  /* ----- switch board PCB ----- */
  const pcb = box(W * 0.92, 0.004, D * 0.82, M.pcb(), 0, 0.006, -0.02);
  mark(pcb, 'switchTrayChassis');
  root.add(pcb);

  const dieTex = dieTexture(512, 512, '#101720', 31);
  const dieMat = new THREE.MeshStandardMaterial({
    map: dieTex, roughness: 0.3, metalness: 0.75,
    emissive: 0x2a3550, emissiveIntensity: 0.22, emissiveMap: dieTex,
  });

  /* ----- ASIC 1 (left): under its cold plate ----- */
  const covered = new THREE.Group();
  covered.position.set(-0.115, 0.008, -0.16);
  covered.add(slab(0.13, 0.005, 0.13, 0.005, M.substrate(), 0, 0, 0));
  const plate1 = new THREE.Group();
  plate1.add(slab(0.12, 0.022, 0.12, 0.008, mat(0xaeb4b8, 0.34, 0.88), 0, 0.005, 0));
  for (let i = 0; i < 4; i++) {
    plate1.add(box(0.095, 0.004, 0.014, mat(0xaeb3b9, 0.32, 0.95), 0, 0.028, -0.045 + i * 0.03));
  }
  mark(plate1, 'swColdplate');
  covered.add(plate1);
  mark(covered, 'nvswitchPackage');
  root.add(covered);

  /* ----- ASIC 2 (right): exposed silicon ----- */
  const exposed = new THREE.Group();
  exposed.position.set(0.115, 0.008, -0.16);
  exposed.add(slab(0.13, 0.005, 0.13, 0.005, M.substrate(), 0, 0, 0));
  exposed.add(box(0.085, 0.004, 0.075, dieMat, 0, 0.007, 0));
  // port PHY strips along two die edges
  exposed.add(box(0.008, 0.0042, 0.075, mat(0x8a7a30, 0.35, 0.85), -0.046, 0.007, 0));
  exposed.add(box(0.008, 0.0042, 0.075, mat(0x8a7a30, 0.35, 0.85), 0.046, 0.007, 0));
  // decoupling caps on the substrate rim
  const capM = mat(0xa08a3c, 0.4, 0.8);
  for (let i = 0; i < 10; i++) {
    exposed.add(box(0.007, 0.003, 0.004, capM, -0.05 + i * 0.011, 0.006, 0.052));
    exposed.add(box(0.007, 0.003, 0.004, capM, -0.05 + i * 0.011, 0.006, -0.052));
  }
  mark(exposed, 'nvswitchPackage');
  root.add(exposed);

  /* ----- short board-level link headers feeding the rear connector field ----- */
  const bundles = new THREE.Group();
  const linkM = mat(0x1d2226, 0.58, 0.5);
  for (const ax of [-0.115, 0.115]) {
    for (let i = 0; i < 4; i++) {
      const spread = (i - 1.5) * 0.052;
      bundles.add(tube([
        [ax + spread * 0.35, 0.026, -0.225],
        [ax + spread * 0.8, 0.035, -0.32],
        [ax + spread, 0.028, -0.415],
      ], 0.006, linkM, 24));
      // cable-header block on top of the package edge
      bundles.add(box(0.022, 0.012, 0.02, mat(0x22262b, 0.45, 0.6), ax + spread * 0.35, 0.026, -0.215));
    }
  }
  mark(bundles, 'swBackplane');
  root.add(bundles);

  /* ----- nominal 50 V feeds: orange + black cables down the centerline ----- */
  const power = new THREE.Group();
  power.add(tube([[0.012, 0.03, -0.43], [0.014, 0.055, -0.2], [0.01, 0.03, 0.09]], 0.0085, mat(0xc35d24, 0.46, 0.55), 24));
  power.add(tube([[-0.012, 0.03, -0.43], [-0.014, 0.05, -0.19], [-0.01, 0.03, 0.1]], 0.0085, M.rubber(), 24));
  // heatsinked power modules where the feeds land
  power.add(box(0.05, 0.022, 0.06, mat(0x1a1c1f, 0.45, 0.7), 0.035, 0.017, 0.13));
  power.add(box(0.05, 0.022, 0.06, mat(0x1a1c1f, 0.45, 0.7), -0.035, 0.017, 0.13));
  mark(power, 'busbar');
  root.add(power);

  /* ----- mid-tray module row (per the photo: blocks across the width) ----- */
  const mods = new THREE.Group();
  const modM = mat(0x33373c, 0.5, 0.65);
  const modM2 = mat(0x212429, 0.55, 0.5);
  for (let i = 0; i < 5; i++) {
    if (i === 2) continue; // centre kept clear for the power feeds
    const x = -0.19 + i * 0.095;
    mods.add(box(0.08, 0.03, 0.055, modM, x, 0.021, 0.03));
    mods.add(box(0.07, 0.024, 0.006, modM2, x, 0.02, 0.062));
  }
  mark(mods, 'vrm');
  root.add(mods);

  /* ----- coolant loop: rear QDs feeding the ASIC plates ----- */
  const loop = new THREE.Group();
  const tubeM = mat(0xa2a9ae, 0.48, 0.78);
  loop.add(tube([[-0.2, 0.035, -0.42], [-0.15, 0.05, -0.31], [-0.115, 0.04, -0.24]], 0.0075, tubeM));
  loop.add(tube([[0.2, 0.035, -0.42], [0.16, 0.05, -0.31], [0.115, 0.04, -0.24]], 0.0075, tubeM));
  // Return branches loop around the power-distribution board as in the
  // production tray, where rigid gray plumbing is the dominant visual cue.
  loop.add(tube([[-0.115, 0.042, -0.10], [-0.18, 0.055, 0.02], [-0.18, 0.04, 0.28], [-0.20, 0.035, -0.42]], 0.007, tubeM, 30));
  loop.add(tube([[0.115, 0.042, -0.10], [0.18, 0.055, 0.02], [0.18, 0.04, 0.28], [0.20, 0.035, -0.42]], 0.007, tubeM, 30));
  for (const [qx, col] of [[-0.2, M.blueTube()], [0.2, M.redTube()]]) {
    const qd = cyl(0.011, 0.011, 0.045, col, qx, 0.035, -0.435, 12);
    qd.rotation.x = Math.PI / 2;
    loop.add(qd);
  }
  mark(loop, 'coolantLoop');
  root.add(loop);

  /* ----- rear NVLink backplane: dense gold connector field ----- */
  const back = new THREE.Group();
  for (let r = 0; r < 2; r++) {
    for (let i = 0; i < 9; i++) {
      back.add(box(0.045, 0.016, 0.018, M.gold(), -0.21 + i * 0.0525, 0.014 + r * 0.022, -D / 2 + 0.014));
    }
  }
  mark(back, 'swBackplane');
  root.add(back);
  // busbar power clamp
  const pwr = box(0.05, 0.03, 0.02, M.copper(), 0, 0.025, -D / 2 + 0.015);
  mark(pwr, 'busbar');
  root.add(pwr);

  /* ----- management cluster (front, centre-left like the photo) ----- */
  const hmc = new THREE.Group();
  hmc.add(box(0.09, 0.003, 0.09, M.pcbDark(), -0.12, 0.012, D / 2 - 0.08));
  hmc.add(box(0.018, 0.005, 0.018, M.chipBlack(), -0.12, 0.016, D / 2 - 0.09));
  hmc.add(box(0.014, 0.013, 0.016, M.steel(), -0.15, 0.012, D / 2 - 0.045));
  hmc.add(box(0.014, 0.013, 0.016, M.steel(), -0.10, 0.012, D / 2 - 0.045));
  hmc.add(led(0.0025, GREEN, -0.075, 0.018, D / 2 - 0.05));
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
    camera: { pos: [0.5, 0.6, 0.8], target: [0, 0, -0.05], min: 0.3, max: 2.5 },
    defaultInfo: 'switchTray',
  };
}
