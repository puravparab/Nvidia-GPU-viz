import * as THREE from 'three';
import { mat, box, cyl, slab, mark, M, GREEN } from '../../common.js';

/** Lid texture with an etched marking. Rubin lids are electroplated gold
 *  (anti-corrosion for the liquid-metal TIM); Vera keeps a nickel finish. */
function lidTexture(label, gold) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = gold ? '#c2a45c' : '#a9adb2';
  ctx.fillRect(0, 0, 256, 256);
  let s = 19;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 60; i++) {
    const g = 158 + Math.floor(rand() * 22);
    ctx.fillStyle = gold
      ? `rgba(${g + 30},${g},${Math.floor(g * 0.55)},0.35)`
      : `rgba(${g},${g + 2},${g + 5},0.35)`;
    ctx.beginPath();
    ctx.ellipse(rand() * 256, rand() * 256, 12 + rand() * 40, 8 + rand() * 26, rand() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = gold ? 'rgba(88,68,24,0.8)' : 'rgba(72,76,82,0.76)';
  ctx.font = `600 ${label.length > 10 ? 25 : 30}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(label, 128, 118);
  ctx.font = '400 18px system-ui, sans-serif';
  ctx.fillStyle = gold ? 'rgba(96,76,30,0.6)' : 'rgba(82,86,92,0.56)';
  ctx.fillText('T TW 2620', 128, 152);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * Bare Strata module, per the SemiAnalysis module diagram. Portrait board:
 * rear edge (-Z) carries the NVLink 6 backplane connectors; two Rubin
 * packages sit behind the SOCAMM/Vera row; the front edge (+Z) carries the
 * Paladin HD2 board-to-board connectors that mate into the tray midplane.
 * 50 V enters at round side posts, IBCs convert to 12 V mid-board.
 */
export function buildVrBoard() {
  const root = new THREE.Group();
  const W = 0.42, D = 0.66;

  const goldRim = mat(0x8a6d38, 0.3, 0.95);
  const pkgSubM = mat(0x14161a, 0.5, 0.4);
  const connBlack = mat(0x0f1012, 0.55, 0.4);

  /* ----- PCB: bigger than Bianca, M8/M9-class laminate ----- */
  const pcb = new THREE.Group();
  pcb.add(box(W, 0.006, D, M.pcbDark(), 0, -0.003, 0));
  for (const [hx, hz] of [[-0.19, -0.3], [0.19, -0.3], [-0.19, 0.3], [0.19, 0.3], [-0.19, 0], [0.19, 0]]) {
    pcb.add(cyl(0.006, 0.006, 0.009, M.gold(), hx, 0.002, hz, 10));
  }
  mark(pcb, 'vrStrataBoard');
  root.add(pcb);

  /* ----- two Rubin packages side by side, rear of board ----- */
  const rubinLidM = new THREE.MeshStandardMaterial({
    map: lidTexture('NVIDIA RUBIN', true), roughness: 0.28, metalness: 0.9,
  });
  for (const gx of [-0.1, 0.1]) {
    const pkg = new THREE.Group();
    pkg.position.set(gx, 0, -0.17);
    pkg.add(slab(0.155, 0.006, 0.155, 0.005, pkgSubM, 0, 0, 0));
    pkg.add(slab(0.147, 0.003, 0.147, 0.004, goldRim, 0, 0.006, 0));  // stiffener ring
    pkg.add(box(0.138, 0.007, 0.138, rubinLidM, 0, 0.009, 0));        // gold two-piece lid
    pkg.add(box(0.138, 0.0005, 0.002, mat(0x8f7434, 0.3, 0.95), 0, 0.0128, 0)); // lid seam
    mark(pkg, 'vrRubin');
    root.add(pkg);
  }

  /* ----- Vera CPU package on the centreline ----- */
  const veraLidM = new THREE.MeshStandardMaterial({
    map: lidTexture('NVIDIA VERA', false), roughness: 0.3, metalness: 0.85,
  });
  const vera = new THREE.Group();
  vera.position.set(0, 0, 0.08);
  vera.add(slab(0.13, 0.005, 0.13, 0.005, pkgSubM, 0, 0, 0));
  vera.add(box(0.115, 0.008, 0.115, veraLidM, 0, 0.005, 0));
  mark(vera, 'vrVeraCpu');
  root.add(vera);

  /* ----- 8 SOCAMM sockets: 4 per side of Vera, long axis front-to-back ----- */
  const socamm = new THREE.Group();
  const stickM = mat(0x2e3340, 0.45, 0.6);
  const latchM = mat(0x9aa0a6, 0.35, 0.85);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const x = side * (0.105 + i * 0.026);
      socamm.add(box(0.018, 0.012, 0.15, stickM, x, 0.007, 0.08));
      socamm.add(box(0.018, 0.004, 0.008, latchM, x, 0.013, 0.005));
      socamm.add(box(0.018, 0.004, 0.008, latchM, x, 0.013, 0.155));
    }
  }
  mark(socamm, 'vrSocamm');
  root.add(socamm);

  /* ----- NVLink-C2C lanes: Vera ↔ each Rubin (stylised) ----- */
  const c2c = new THREE.Group();
  const laneGeo = new THREE.PlaneGeometry(0.0035, 0.16);
  laneGeo.rotateX(-Math.PI / 2);
  for (const gx of [-0.1, 0.1]) {
    for (let i = 0; i < 5; i++) {
      const t = i / 4 - 0.5;
      const lane = new THREE.Mesh(
        laneGeo,
        new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.28 })
      );
      lane.position.set(gx * 0.5 + t * 0.016, 0.012, -0.045);
      lane.rotation.y = Math.atan2(gx * 0.9, 0.16);
      c2c.add(lane);
    }
  }
  mark(c2c, 'vrC2c');
  root.add(c2c);

  /* ----- VRM tile fields hugging the packages ----- */
  const vrm = new THREE.Group();
  const tileA = mat(0x6e747b, 0.42, 0.75);
  const tileB = mat(0x565c63, 0.45, 0.65);
  const tileC = mat(0x3a3f45, 0.55, 0.5);
  let s = 3;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const pick = () => { const r = rand(); return r > 0.55 ? tileA : (r > 0.25 ? tileB : tileC); };
  const tileAt = (x, z) => vrm.add(box(0.016, 0.009, 0.016, pick(), x, 0.006, z));
  for (let i = 0; i < 16; i++) for (let j = 0; j < 2; j++) tileAt(-0.165 + i * 0.022, -0.29 + j * 0.022); // rear GPU rail
  for (let j = 0; j < 8; j++) { tileAt(-0.195, -0.2 + j * 0.024); tileAt(0.195, -0.2 + j * 0.024); }      // side rails
  for (let i = 0; i < 6; i++) tileAt(-0.06 + i * 0.024, -0.045);                                          // between CPU/GPUs
  mark(vrm, 'vrVrm');
  root.add(vrm);

  /* ----- IBC 50→12 V converter bricks, ahead of the memory row ----- */
  const ibc = new THREE.Group();
  const ibcM = mat(0x2c5a80, 0.45, 0.6);
  for (const side of [-1, 1]) {
    for (const bx of [0.05, 0.085]) {
      ibc.add(box(0.028, 0.014, 0.036, ibcM, side * bx, 0.008, 0.21));
    }
  }
  mark(ibc, 'vrIbc');
  root.add(ibc);

  /* ----- power connectors: round 50 V side posts + yellow 12 V corners ----- */
  const power = new THREE.Group();
  for (const side of [-1, 1]) {
    for (const pz of [0.17, 0.21]) {
      power.add(cyl(0.011, 0.011, 0.018, M.copper(), side * 0.185, 0.009, pz, 12));
      power.add(cyl(0.013, 0.013, 0.004, mat(0x4a3527, 0.5, 0.5), side * 0.185, 0.019, pz, 12));
    }
    power.add(box(0.014, 0.012, 0.024, mat(0x77601f, 0.42, 0.75), side * 0.195, 0.007, 0.3));
  }
  mark(power, 'vrStrataPower');
  root.add(power);

  /* ----- rear edge: NVLink 6 backplane connectors (same layout as GB200) ----- */
  const nvl = new THREE.Group();
  for (const cx of [-0.08, 0.08]) {
    nvl.add(box(0.13, 0.03, 0.035, connBlack, cx, 0.015, -0.31));
    nvl.add(box(0.11, 0.02, 0.018, mat(0x040405, 0.7, 0.2), cx, 0.016, -0.318));
  }
  mark(nvl, 'vrStrataNvlink');
  root.add(nvl);

  /* ----- front edge: Paladin HD2 board-to-board connectors (to midplane) ----- */
  const paladin = new THREE.Group();
  for (const cx of [-0.115, 0, 0.115]) {
    paladin.add(box(0.09, 0.022, 0.03, connBlack, cx, 0.011, 0.31));
    paladin.add(box(0.078, 0.014, 0.014, mat(0x040405, 0.7, 0.2), cx, 0.012, 0.318));
  }
  mark(paladin, 'vrPaladin');
  root.add(paladin);

  /* ----- misc small components ----- */
  const misc = new THREE.Group();
  const tiny = mat(0x2c2f33, 0.55, 0.45);
  for (let i = 0; i < 40; i++) {
    const x = (rand() - 0.5) * 0.36, z = 0.24 + rand() * 0.05;
    if (Math.abs(x) > 0.15) continue;
    misc.add(box(0.005 + rand() * 0.008, 0.003, 0.004 + rand() * 0.006, tiny, x, 0.004, z));
  }
  mark(misc, 'vrStrataBoard');
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
    camera: { pos: [0.34, 0.5, 0.62], target: [0, 0, -0.03], min: 0.2, max: 1.8 },
    defaultInfo: 'vrStrata',
  };
}
