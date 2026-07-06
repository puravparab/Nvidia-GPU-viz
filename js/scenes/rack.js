import * as THREE from 'three';
import { mat, glowMat, box, cyl, led, mark, ventTexture, M, GREEN } from '../common.js';

const U = 0.04445;           // 1 rack unit in metres
const IW = 0.537;            // tray width
const TD = 1.0;              // tray depth
const FRONT = TD / 2;        // z of tray faceplates

/* ------------------------------------------------------------------ */
/* Faceplate templates (built once, cloned per slot)                   */
/* ------------------------------------------------------------------ */

function computeTrayTemplate() {
  const g = new THREE.Group();
  const fz = FRONT + 0.006;

  // body + faceplate
  g.add(box(IW, U * 0.92, TD * 0.97, M.panelDark(), 0, 0, 0));
  g.add(box(IW, U * 0.96, 0.012, M.panelMid(), 0, 0, FRONT));

  // side handles / ears
  g.add(box(0.014, U * 0.8, 0.018, M.steel(), -IW / 2 + 0.012, 0, fz));
  g.add(box(0.014, U * 0.8, 0.018, M.steel(), IW / 2 - 0.012, 0, fz));

  // 4x E1.S NVMe drives (left)
  for (let i = 0; i < 4; i++) {
    const x = -0.215 + i * 0.028;
    g.add(box(0.02, U * 0.7, 0.008, mat(0x25282c, 0.4, 0.7), x, 0, fz));
    g.add(led(0.0022, GREEN, x + 0.006, U * 0.24, fz + 0.005));
  }

  // 4x OSFP cages (centre) — ConnectX-7
  for (let i = 0; i < 4; i++) {
    const x = -0.075 + i * 0.042;
    g.add(box(0.034, 0.0135, 0.010, M.steel(), x, 0.004, fz));
    g.add(box(0.028, 0.0085, 0.004, mat(0x050505, 0.9, 0.1), x, 0.004, fz + 0.006));
  }

  // 2x QSFP (BlueField-3) + mgmt port (right)
  for (let i = 0; i < 2; i++) {
    const x = 0.13 + i * 0.038;
    g.add(box(0.03, 0.012, 0.010, M.steel(), x, 0.004, fz));
    g.add(box(0.024, 0.0075, 0.004, mat(0x050505, 0.9, 0.1), x, 0.004, fz + 0.006));
  }
  g.add(box(0.016, 0.012, 0.008, mat(0x2f3338, 0.5, 0.5), 0.205, 0.004, fz));

  // status LEDs
  g.add(led(0.0028, GREEN, 0.24, 0.008, fz + 0.004));
  g.add(led(0.002, 0x2299ff, 0.24, -0.006, fz + 0.004));

  // lower vent strip
  const vt = ventTexture();
  vt.repeat.set(6, 1);
  g.add(box(0.44, 0.011, 0.002, new THREE.MeshStandardMaterial({ map: vt, roughness: 0.7, metalness: 0.4 }), -0.02, -U * 0.28, fz + 0.002));
  return g;
}

function switchTrayTemplate() {
  const g = new THREE.Group();
  const fz = FRONT + 0.006;
  g.add(box(IW, U * 0.92, TD * 0.97, M.panelDark(), 0, 0, 0));
  g.add(box(IW, U * 0.96, 0.012, mat(0x101214, 0.45, 0.7), 0, 0, FRONT));

  // perforated vents left + right
  const vt = ventTexture(256, 64, '#131517', '#070808');
  vt.repeat.set(4, 1);
  const ventM = new THREE.MeshStandardMaterial({ map: vt, roughness: 0.65, metalness: 0.45 });
  g.add(box(0.185, U * 0.62, 0.004, ventM, -0.15, 0, fz));
  g.add(box(0.185, U * 0.62, 0.004, ventM.clone(), 0.15, 0, fz));

  // centre badge: NVLink glow strip
  g.add(box(0.075, 0.007, 0.004, glowMat(GREEN, 1.4), 0, 0, fz));

  // latches
  g.add(box(0.02, U * 0.7, 0.016, M.steel(), -IW / 2 + 0.016, 0, fz));
  g.add(box(0.02, U * 0.7, 0.016, M.steel(), IW / 2 - 0.016, 0, fz));
  g.add(led(0.0026, GREEN, 0.055, 0, fz + 0.003));
  return g;
}

function powerShelfTemplate() {
  const g = new THREE.Group();
  const fz = FRONT + 0.006;
  g.add(box(IW, U * 0.92, TD * 0.97, M.panelDark(), 0, 0, 0));
  // 6 hot-swap PSU modules
  const w = IW / 6;
  for (let i = 0; i < 6; i++) {
    const x = -IW / 2 + w * (i + 0.5);
    g.add(box(w * 0.9, U * 0.86, 0.014, mat(0x1a1d20, 0.42, 0.75), x, 0, FRONT));
    g.add(box(w * 0.55, 0.005, 0.006, M.steel(), x, -U * 0.22, fz));           // handle
    const vt = ventTexture(128, 64);
    g.add(box(w * 0.7, U * 0.4, 0.002, new THREE.MeshStandardMaterial({ map: vt, roughness: 0.7, metalness: 0.4 }), x, U * 0.1, fz + 0.004));
    g.add(led(0.0024, GREEN, x + w * 0.32, U * 0.3, fz + 0.004));
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

/* ------------------------------------------------------------------ */

export function buildRack() {
  const root = new THREE.Group();

  // ----- slot plan, top → bottom (matches DGX GB200 elevation) -----
  const plan = [
    ['mgmt', 1], ['power', 4], ['blank', 1],
    ['compute', 10], ['blank', 1],
    ['switch', 9], ['blank', 1],
    ['compute', 8], ['blank', 1],
    ['power', 4],
  ];
  const totalU = plan.reduce((s, [, n]) => s + n, 0); // 40U of gear
  const plinth = 0.13;
  const topPad = 0.03;
  const H = totalU * U;                    // gear stack height
  const yTop = plinth + topPad + H;        // interior top

  const templates = {
    compute: computeTrayTemplate(),
    switch: switchTrayTemplate(),
    power: powerShelfTemplate(),
    mgmt: mgmtSwitchTemplate(),
  };
  const infoKeys = { compute: 'computeTray', switch: 'switchTray', power: 'powerShelf', mgmt: 'mgmtSwitch' };

  let y = yTop;
  let computeIdx = 0;
  for (const [kind, count] of plan) {
    for (let i = 0; i < count; i++) {
      y -= U;
      if (kind === 'blank') {
        const b = box(IW, U * 0.9, 0.008, mat(0x0b0c0d, 0.6, 0.5), 0, y + U / 2, FRONT);
        mark(b, 'rackFrame');
        root.add(b);
        continue;
      }
      const t = templates[kind].clone();
      t.position.set(0, y + U / 2, 0);
      mark(t, infoKeys[kind]);
      if (kind === 'compute') t.userData.drillIndex = computeIdx++;
      root.add(t);
    }
  }

  /* ----- rack frame ----- */
  const frame = new THREE.Group();
  const fh = yTop + 0.05;
  const postM = M.frame();
  const px = IW / 2 + 0.022, pzF = FRONT + 0.03, pzR = -TD / 2 - 0.13;
  for (const [x, z] of [[-px, pzF], [px, pzF], [-px, pzR], [px, pzR]]) {
    frame.add(box(0.045, fh, 0.06, postM, x, fh / 2, z));
  }
  // plinth + top cap
  frame.add(box(IW + 0.14, plinth, TD + 0.22, postM, 0, plinth / 2, (pzF + pzR) / 2 + 0.02));
  frame.add(box(IW + 0.14, 0.05, TD + 0.22, postM, 0, fh + 0.025, (pzF + pzR) / 2 + 0.02));
  // side panels
  const sideM = mat(0x0a0b0c, 0.5, 0.7);
  frame.add(box(0.012, fh - plinth, TD + 0.16, sideM, -px - 0.02, plinth + (fh - plinth) / 2, (pzF + pzR) / 2 + 0.02));
  frame.add(box(0.012, fh - plinth, TD + 0.16, sideM, px + 0.02, plinth + (fh - plinth) / 2, (pzF + pzR) / 2 + 0.02));
  // interior green accent strips (NVIDIA-style glow along the bays)
  frame.add(box(0.004, H, 0.004, glowMat(GREEN, 1.1), -IW / 2 - 0.006, plinth + topPad + H / 2, FRONT + 0.012));
  frame.add(box(0.004, H, 0.004, glowMat(GREEN, 1.1), IW / 2 + 0.006, plinth + topPad + H / 2, FRONT + 0.012));
  mark(frame, 'rackFrame');
  root.add(frame);

  /* ----- rear infrastructure ----- */
  const rear = new THREE.Group();

  // 48V copper busbar
  const bus = new THREE.Group();
  bus.add(box(0.055, H, 0.016, M.copper(), 0, plinth + topPad + H / 2, -TD / 2 - 0.035));
  bus.add(box(0.09, 0.05, 0.03, M.copper(), 0, plinth + topPad + H + 0.02, -TD / 2 - 0.035));
  mark(bus, 'busbar');
  rear.add(bus);

  // NVLink cable spine — cartridge + cable bundles behind the switch bay
  const spine = new THREE.Group();
  const spineH = 28 * U; // spans compute + switch bays
  const spineY = plinth + topPad + H - (5 + 1 + 14) * U; // roughly centred on switch bay
  spine.add(box(0.34, spineH, 0.05, mat(0x101113, 0.55, 0.55), 0, spineY, -TD / 2 - 0.075));
  const cableM = mat(0x1c1e22, 0.8, 0.25);
  for (let i = 0; i < 10; i++) {
    spine.add(cyl(0.012, 0.012, spineH * 0.96, cableM, -0.145 + i * 0.032, spineY, -TD / 2 - 0.108, 10));
  }
  mark(spine, 'spine');
  rear.add(spine);

  // coolant manifolds: blue supply / red return verticals + per-tray stubs
  const manifold = new THREE.Group();
  const my = plinth + topPad + H / 2;
  manifold.add(cyl(0.026, 0.026, H, M.blueTube(), -IW / 2 + 0.02, my, -TD / 2 - 0.06, 14));
  manifold.add(cyl(0.026, 0.026, H, M.redTube(), IW / 2 - 0.02, my, -TD / 2 - 0.06, 14));
  const stubM = M.steel();
  let sy = yTop;
  for (const [kind, count] of plan) {
    for (let i = 0; i < count; i++) {
      sy -= U;
      if (kind !== 'compute' && kind !== 'switch') continue;
      for (const sx of [-IW / 2 + 0.02, IW / 2 - 0.02]) {
        const s = cyl(0.008, 0.008, 0.05, stubM, sx, sy + U / 2, -TD / 2 - 0.035, 8);
        s.rotation.x = Math.PI / 2;
        manifold.add(s);
      }
    }
  }
  mark(manifold, 'manifold');
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
  // datacenter floor tile seams
  const grid = new THREE.GridHelper(14, 23, 0x1b2125, 0x151a1d);
  grid.position.y = 0.001;
  root.add(grid);
  // soft green pool of light under the rack
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
    camera: { pos: [1.55, 1.6, 3.35], target: [0, 1.05, 0], min: 1.2, max: 8 },
    defaultInfo: 'rack',
  };
}
