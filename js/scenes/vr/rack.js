import * as THREE from 'three';
import { mat, glowMat, box, cyl, led, tube, mark, ventTexture, M, GREEN } from '../../common.js';

const U = 0.04445;           // 1 rack unit in metres
const IW = 0.537;            // tray width
const TD = 1.0;              // tray depth
const FRONT = TD / 2;        // z of tray faceplates

/* ------------------------------------------------------------------ */
/* Faceplate templates (built once, cloned per slot)                   */
/* VR NVL72 fronts are fanless: no vent fields on the compute trays,   */
/* just the module bays — Orchid OSFP/E1.S left+right, BF-4 centre.    */
/* ------------------------------------------------------------------ */

function computeTrayTemplate() {
  const g = new THREE.Group();
  const fz = FRONT + 0.006;

  g.add(box(IW, U * 0.92, TD * 0.97, M.panelDark(), 0, 0, 0));
  g.add(box(IW, U * 0.96, 0.012, mat(0x212326, 0.42, 0.75), 0, 0, FRONT));

  // Orchid bays: two stacked modules per side → 2 OSFP cages each + E1.S
  for (const side of [-1, 1]) {
    const cx = side * 0.185;
    g.add(box(0.135, U * 0.8, 0.004, mat(0x17191c, 0.5, 0.6), cx, 0, fz - 0.001)); // bay plate
    for (const py of [-0.0095, 0.0095]) {           // two stacked Orchid rows
      for (const ox of [-0.04, -0.008]) {
        g.add(box(0.026, 0.0085, 0.01, M.steel(), cx + ox, py, fz));
        g.add(box(0.021, 0.0055, 0.004, mat(0x05080a, 0.9, 0.1), cx + ox, py, fz + 0.006));
      }
      g.add(box(0.016, 0.0085, 0.008, mat(0x2b2f36, 0.4, 0.7), cx + 0.036, py, fz)); // E1.S latch
      g.add(led(0.002, GREEN, cx + 0.052, py, fz + 0.004));
    }
    // horizontal seam between the stacked pair
    g.add(box(0.13, 0.0012, 0.002, mat(0x0a0b0c, 0.6, 0.4), cx, 0, fz + 0.004));
  }

  // BlueField-4 bay in the centre: 2 QSFP cages + E1.S + BMC port
  g.add(box(0.1, U * 0.8, 0.004, mat(0x14161a, 0.5, 0.6), -0.006, 0, fz - 0.001));
  for (const ox of [-0.028, -0.002]) {
    g.add(box(0.02, 0.009, 0.01, M.steel(), ox, -0.006, fz));
    g.add(box(0.016, 0.006, 0.004, mat(0x05080a, 0.9, 0.1), ox, -0.006, fz + 0.006));
  }
  g.add(box(0.014, 0.009, 0.008, mat(0x2b2f36, 0.4, 0.7), 0.028, -0.006, fz)); // BF-4 E1.S
  g.add(box(0.012, 0.008, 0.007, mat(0x2f6ea8, 0.4, 0.5), -0.03, 0.008, fz));  // BMC RJ45
  g.add(led(0.002, GREEN, 0.028, 0.009, fz + 0.004));

  // slim management-module strip between centre and right bay
  g.add(box(0.012, U * 0.7, 0.006, mat(0x30353c, 0.45, 0.6), 0.09, 0, fz));
  return g;
}

function switchTrayTemplate() {
  const g = new THREE.Group();
  const fz = FRONT + 0.006;
  g.add(box(IW, U * 0.92, TD * 0.97, M.panelDark(), 0, 0, 0));
  // fully liquid-cooled: a clean plate, no vents — service ports + glow strip
  g.add(box(IW, U * 0.96, 0.012, mat(0x101214, 0.45, 0.7), 0, 0, FRONT));
  g.add(box(0.1, 0.007, 0.004, glowMat(GREEN, 1.4), 0, 0, fz));
  // four ASIC status LEDs
  for (let i = 0; i < 4; i++) g.add(led(0.0024, GREEN, 0.09 + i * 0.016, 0, fz + 0.003));
  // SMM service cluster on the left
  g.add(box(0.014, 0.011, 0.008, mat(0x2f6ea8, 0.4, 0.5), -0.2, 0.004, fz));
  g.add(box(0.012, 0.006, 0.007, M.steel(), -0.175, 0.004, fz));
  // latches
  g.add(box(0.02, U * 0.7, 0.016, M.steel(), -IW / 2 + 0.016, 0, fz));
  g.add(box(0.02, U * 0.7, 0.016, M.steel(), IW / 2 - 0.016, 0, fz));
  return g;
}

function powerShelfTemplate() {
  // 3U shelf: six 18.3 kW PSUs in a 3×2 grid of hot-swap bricks
  const g = new THREE.Group();
  const H = U * 3;
  const fz = FRONT + 0.006;
  g.add(box(IW, H * 0.96, TD * 0.97, M.panelDark(), 0, 0, 0));
  const w = IW / 3, h = H / 2;
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 2; row++) {
      const x = -IW / 2 + w * (col + 0.5);
      const y = -H / 2 + h * (row + 0.5);
      g.add(box(w * 0.92, h * 0.88, 0.014, mat(0x1a1d20, 0.42, 0.75), x, y, FRONT));
      g.add(box(w * 0.55, 0.006, 0.006, M.steel(), x, y - h * 0.28, fz));           // handle
      const vt = ventTexture(128, 96);
      g.add(box(w * 0.72, h * 0.42, 0.002, new THREE.MeshStandardMaterial({ map: vt, roughness: 0.7, metalness: 0.4 }), x, y + h * 0.12, fz + 0.004));
      g.add(led(0.0026, GREEN, x + w * 0.34, y + h * 0.32, fz + 0.004));
    }
  }
  return g;
}

function mgmtSwitchTemplate() {
  const g = new THREE.Group();
  const fz = FRONT + 0.006;
  g.add(box(IW, U * 0.92, TD * 0.97, M.panelDark(), 0, 0, 0));
  g.add(box(IW, U * 0.96, 0.012, mat(0x17191c, 0.45, 0.7), 0, 0, FRONT));
  for (let i = 0; i < 16; i++) {
    g.add(box(0.011, 0.009, 0.004, mat(0x0a0b0c, 0.8, 0.2), -0.2 + i * 0.0165, 0.002, fz));
  }
  g.add(led(0.0024, GREEN, 0.2, 0.002, fz + 0.003));
  return g;
}

function stiffenerTemplate(withDrip) {
  const g = new THREE.Group();
  const fz = FRONT + 0.004;
  // solid brushed bar across the bay — reads as structure, not equipment
  g.add(box(IW, U * 0.9, TD * 0.95, mat(0x3c4147, 0.42, 0.8), 0, 0, 0));
  g.add(box(IW, U * 0.62, 0.01, mat(0x565c62, 0.4, 0.85), 0, 0, fz));
  for (const bx of [-0.21, -0.07, 0.07, 0.21]) {
    g.add(cyl(0.005, 0.005, 0.012, M.steel(), bx, 0, fz + 0.004, 10));
  }
  if (withDrip) {
    // shallow catch lip along the bottom edge of the bay
    g.add(box(IW * 0.98, 0.008, 0.03, mat(0x59636a, 0.38, 0.85), 0, -U * 0.36, fz + 0.008));
  }
  return g;
}

/* ------------------------------------------------------------------ */

export function buildVrRack() {
  const root = new THREE.Group();

  // ----- 48U elevation, top → bottom, per the SemiAnalysis VR NVL72 diagram -----
  // Each entry: [kind, rack units]. Power shelves are 3U in this generation.
  const plan = [
    ['blank', 1], ['mgmt', 1], ['mgmt', 1], ['blank', 1],
    ['power', 3], ['power', 3],
    ['stiff', 1],
    ...Array(10).fill(['compute', 1]),
    ...Array(9).fill(['switch', 1]),
    ...Array(8).fill(['compute', 1]),
    ['drip', 1],
    ['power', 3], ['power', 3],
    ['blank', 3],
  ];
  const totalU = plan.reduce((s, [, u]) => s + u, 0); // 48U
  const plinth = 0.13;
  const topPad = 0.03;
  const H = totalU * U;
  const yTop = plinth + topPad + H;

  const templates = {
    compute: computeTrayTemplate(),
    switch: switchTrayTemplate(),
    power: powerShelfTemplate(),
    mgmt: mgmtSwitchTemplate(),
    stiff: stiffenerTemplate(false),
    drip: stiffenerTemplate(true),
  };
  const infoKeys = {
    compute: 'vrComputeTray', switch: 'vrSwitchTray', power: 'vrPowerShelf',
    mgmt: 'vrMgmtSwitch', stiff: 'vrStiffener', drip: 'vrDripTray',
  };

  // VR trim: graphite/silver rails instead of GB200's champagne gold
  const trimM = mat(0x6b7278, 0.35, 0.9);
  let y = yTop;
  for (const [kind, u] of plan) {
    y -= U * u;
    const sepM = kind === 'blank' ? mat(0x27292b, 0.55, 0.6) : trimM;
    root.add(box(IW, kind === 'blank' ? 0.0015 : 0.003, 0.012, sepM, 0, y + 0.001, FRONT + 0.003));
    if (kind === 'blank') {
      const b = box(IW, U * u * 0.94, 0.008, mat(0x0b0c0d, 0.6, 0.5), 0, y + U * u / 2, FRONT);
      mark(b, 'vrRackFrame');
      root.add(b);
      continue;
    }
    const t = templates[kind].clone();
    t.position.set(0, y + U * u / 2, 0);
    mark(t, infoKeys[kind]);
    root.add(t);
  }

  /* ----- rack frame ----- */
  const frame = new THREE.Group();
  const fh = yTop + 0.05;
  const postM = M.frame();
  const px = IW / 2 + 0.022, pzF = FRONT + 0.03, pzR = -TD / 2 - 0.13;
  for (const [x, z] of [[-px, pzF], [px, pzF], [-px, pzR], [px, pzR]]) {
    frame.add(box(0.045, fh, 0.06, postM, x, fh / 2, z));
  }
  frame.add(box(IW + 0.14, plinth, TD + 0.22, postM, 0, plinth / 2, (pzF + pzR) / 2 + 0.02));
  frame.add(box(IW + 0.14, 0.05, TD + 0.22, postM, 0, fh + 0.025, (pzF + pzR) / 2 + 0.02));
  const sideM = mat(0x0a0b0c, 0.5, 0.7);
  frame.add(box(0.012, fh - plinth, TD + 0.16, sideM, -px - 0.02, plinth + (fh - plinth) / 2, (pzF + pzR) / 2 + 0.02));
  frame.add(box(0.012, fh - plinth, TD + 0.16, sideM, px + 0.02, plinth + (fh - plinth) / 2, (pzF + pzR) / 2 + 0.02));
  // silver side rails framing the tray bays (U11–U37)
  const bayTop = yTop - 11 * U;
  const bayBottom = yTop - 38 * U;
  const bayMid = (bayTop + bayBottom) / 2;
  frame.add(box(0.018, bayTop - bayBottom + 0.025, 0.024, trimM, -IW / 2 - 0.012, bayMid, FRONT + 0.006));
  frame.add(box(0.018, bayTop - bayBottom + 0.025, 0.024, trimM, IW / 2 + 0.012, bayMid, FRONT + 0.006));
  frame.add(box(IW + 0.04, 0.022, 0.024, trimM, 0, bayTop + 0.011, FRONT + 0.006));
  frame.add(box(IW + 0.04, 0.022, 0.024, trimM, 0, bayBottom - 0.011, FRONT + 0.006));
  // thin green accent line down both rails — the CES rack's signature glow
  frame.add(box(0.004, bayTop - bayBottom, 0.004, glowMat(GREEN, 0.9), -IW / 2 - 0.026, bayMid, FRONT + 0.012));
  frame.add(box(0.004, bayTop - bayBottom, 0.004, glowMat(GREEN, 0.9), IW / 2 + 0.026, bayMid, FRONT + 0.012));
  mark(frame, 'vrRackFrame');
  root.add(frame);

  /* ----- rear infrastructure ----- */
  const rear = new THREE.Group();

  // 50V busbar — 5,000A+ and liquid-cooled: copper column with coolant lines
  const bus = new THREE.Group();
  bus.add(box(0.07, H, 0.02, M.copper(), 0, plinth + topPad + H / 2, -TD / 2 - 0.035));
  bus.add(box(0.1, 0.05, 0.034, M.copper(), 0, plinth + topPad + H + 0.02, -TD / 2 - 0.035));
  // coolant capillaries running up both faces of the bar
  bus.add(cyl(0.007, 0.007, H * 0.98, M.blueTube(), -0.028, plinth + topPad + H / 2, -TD / 2 - 0.048, 10));
  bus.add(cyl(0.007, 0.007, H * 0.98, M.redTube(), 0.028, plinth + topPad + H / 2, -TD / 2 - 0.048, 10));
  mark(bus, 'vrBusbar');
  rear.add(bus);

  // NVLink 6 backplane: same four-cartridge copper column as GB200 — the
  // cables are unchanged, only the signaling doubled.
  const spine = new THREE.Group();
  const spineH = 28 * U;
  const spineY = plinth + topPad + H - (8 + 1 + 14) * U;
  const meshTex = ventTexture(256, 256, '#131416', '#060707');
  meshTex.repeat.set(3, 8);
  const cartH = spineH / 4 - 0.008;
  for (let i = 0; i < 4; i++) {
    const cy = spineY + (i - 1.5) * (spineH / 4);
    spine.add(box(0.30, cartH, 0.05, mat(0x101113, 0.55, 0.55), 0, cy, -TD / 2 - 0.075));
    spine.add(box(0.29, cartH - 0.01, 0.004, new THREE.MeshStandardMaterial({ map: meshTex.clone(), roughness: 0.65, metalness: 0.45 }), 0, cy, -TD / 2 - 0.102));
  }
  spine.add(box(0.006, spineH, 0.006, mat(0x08090a, 0.6, 0.4), 0, spineY, -TD / 2 - 0.104));
  spine.add(box(0.012, spineH + 0.02, 0.02, trimM, -0.158, spineY, -TD / 2 - 0.095));
  spine.add(box(0.012, spineH + 0.02, 0.02, trimM, 0.158, spineY, -TD / 2 - 0.095));
  const cableM = mat(0x9ea4aa, 0.55, 0.6);
  for (let i = 0; i < 8; i++) {
    spine.add(cyl(0.014, 0.014, spineH * 0.96, cableM, -0.125 + i * 0.036, spineY, -TD / 2 - 0.112, 8));
  }
  mark(spine, 'vrSpine');
  rear.add(spine);

  // braided supply hoses from the plinth — sized up for 2–2.5× the flow
  const hoseM = mat(0x9aa0a6, 0.45, 0.85);
  for (const hx of [-0.09, 0.09]) {
    const hose = tube([
      [hx, plinth + 0.02, -TD / 2 + 0.05],
      [hx * 1.8, plinth + 0.1, -TD / 2 - 0.1],
      [hx * 2.6, plinth + 0.32, -TD / 2 - 0.06],
    ], 0.032, hoseM, 24);
    mark(hose, 'vrManifold');
    rear.add(hose);
  }

  // vertical supply/return manifolds with per-tray stubs — thicker than GB200
  const manifold = new THREE.Group();
  const my = plinth + topPad + H / 2;
  manifold.add(cyl(0.032, 0.032, H, M.blueTube(), -IW / 2 + 0.02, my, -TD / 2 - 0.06, 14));
  manifold.add(cyl(0.032, 0.032, H, M.redTube(), IW / 2 - 0.02, my, -TD / 2 - 0.06, 14));
  const stubM = M.steel();
  let sy = yTop;
  for (const [kind, u] of plan) {
    sy -= U * u;
    if (kind !== 'compute' && kind !== 'switch') continue;
    for (const sx of [-IW / 2 + 0.02, IW / 2 - 0.02]) {
      const s = cyl(0.009, 0.009, 0.05, stubM, sx, sy + U * u / 2, -TD / 2 - 0.035, 8);
      s.rotation.x = Math.PI / 2;
      manifold.add(s);
    }
  }
  mark(manifold, 'vrManifold');
  rear.add(manifold);
  root.add(rear);

  /* ----- floor ----- */
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(7, 48),
    mat(0x0a0c0d, 0.85, 0.25)
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  root.add(floor);
  const grid = new THREE.GridHelper(14, 23, 0x1b2125, 0x151a1d);
  grid.position.y = 0.001;
  root.add(grid);
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(1.3, 32),
    new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.05 })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.002;
  root.add(pool);

  root.userData.noHighlight = new Set([floor.id, grid.id, pool.id]);

  return {
    group: root,
    camera: { pos: [1.85, 1.9, 4.05], target: [0, 1.2, 0], min: 1.4, max: 9 },
    defaultInfo: 'vrRack',
  };
}
