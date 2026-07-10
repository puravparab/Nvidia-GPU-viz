import * as THREE from 'three';
import { mat, glowMat, box, cyl, led, tube, mark, ventTexture, M, GREEN } from '../common.js';

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

  // body + faceplate: full perforated mesh face (per the STH front photo)
  g.add(box(IW, U * 0.92, TD * 0.97, M.panelDark(), 0, 0, 0));
  g.add(box(IW, U * 0.96, 0.012, M.panelMid(), 0, 0, FRONT));
  const vt = ventTexture(512, 64, '#141618', '#070808');
  vt.repeat.set(8, 1);
  g.add(box(IW * 0.94, U * 0.82, 0.002, new THREE.MeshStandardMaterial({ map: vt, roughness: 0.7, metalness: 0.4 }), 0, 0, fz - 0.001));

  // left: stacked OSFP cage pair
  for (const y of [0.0085, -0.0085]) {
    g.add(box(0.036, 0.012, 0.010, M.steel(), -0.225, y, fz));
    g.add(box(0.03, 0.008, 0.004, mat(0x050505, 0.9, 0.1), -0.225, y, fz + 0.006));
  }

  // 4x E1.S NVMe latches
  for (let i = 0; i < 4; i++) {
    const x = -0.165 + i * 0.03;
    g.add(box(0.018, U * 0.68, 0.008, mat(0x25282c, 0.4, 0.7), x, 0, fz));
    g.add(box(0.012, 0.005, 0.004, M.steel(), x, -U * 0.2, fz + 0.005));
  }

  // centre: management cluster (RJ45s + USB, silver like the photo)
  g.add(box(0.013, 0.011, 0.008, mat(0xd8dde2, 0.35, 0.8), -0.02, 0.002, fz));
  g.add(box(0.013, 0.011, 0.008, mat(0xd8dde2, 0.35, 0.8), 0.02, 0.002, fz));
  g.add(box(0.014, 0.006, 0.006, M.steel(), 0, -0.001, fz));

  // right: stacked InfiniBand OSFP pair + mgmt RJ45 + far-right cage pair
  for (const y of [0.0085, -0.0085]) {
    g.add(box(0.036, 0.012, 0.010, M.steel(), 0.085, y, fz));
    g.add(box(0.03, 0.008, 0.004, mat(0x0a1c30, 0.7, 0.2), 0.085, y, fz + 0.006));
  }
  g.add(box(0.013, 0.011, 0.008, mat(0x2f6ea8, 0.4, 0.5), 0.14, 0.002, fz));
  for (const x of [0.19, 0.23]) {
    g.add(box(0.032, 0.012, 0.010, M.steel(), x, 0.002, fz));
    g.add(box(0.026, 0.008, 0.004, mat(0x050505, 0.9, 0.1), x, 0.002, fz + 0.006));
  }

  // status LEDs
  g.add(led(0.0028, GREEN, 0.165, 0.009, fz + 0.004));
  g.add(led(0.002, 0x2299ff, 0.165, -0.004, fz + 0.004));
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

  const goldM = mat(0xa8894f, 0.42, 0.85);
  let y = yTop;
  let computeIdx = 0;
  for (const [kind, count] of plan) {
    for (let i = 0; i < count; i++) {
      y -= U;
      // gold separator bar under each slot — the DGX GB200's signature trim
      root.add(box(IW, 0.0035, 0.016, goldM, 0, y + 0.002, FRONT + 0.004));
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
  // gold side rails framing the tray bays (per the STH front photo)
  frame.add(box(0.014, H + 0.03, 0.02, goldM, -IW / 2 - 0.012, plinth + topPad + H / 2, FRONT + 0.006));
  frame.add(box(0.014, H + 0.03, 0.02, goldM, IW / 2 + 0.012, plinth + topPad + H / 2, FRONT + 0.006));
  // rounded gold bezel bar with black NVIDIA badge insert at the top
  frame.add(box(IW + 0.04, 0.035, 0.024, goldM, 0, yTop + 0.012, FRONT + 0.004));
  frame.add(box(IW - 0.05, 0.024, 0.006, mat(0x0c0d0e, 0.5, 0.5), 0, yTop + 0.012, FRONT + 0.018));
  frame.add(box(0.05, 0.006, 0.002, glowMat(GREEN, 0.9), 0.16, yTop + 0.012, FRONT + 0.022));
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

  // NVLink cable spine — central perforated cartridge column (per the STH
  // rear photo): four mesh-faced sections, a centre seam, gold edge rails
  const spine = new THREE.Group();
  const spineH = 28 * U; // spans compute + switch bays
  const spineY = plinth + topPad + H - (5 + 1 + 14) * U; // roughly centred on switch bay
  const meshTex = ventTexture(256, 256, '#131416', '#060707');
  meshTex.repeat.set(3, 8);
  const cartH = spineH / 4 - 0.008;
  for (let i = 0; i < 4; i++) {
    const cy = spineY + (i - 1.5) * (spineH / 4);
    spine.add(box(0.30, cartH, 0.05, mat(0x101113, 0.55, 0.55), 0, cy, -TD / 2 - 0.075));
    spine.add(box(0.29, cartH - 0.01, 0.004, new THREE.MeshStandardMaterial({ map: meshTex.clone(), roughness: 0.65, metalness: 0.45 }), 0, cy, -TD / 2 - 0.102));
  }
  // centre seam + gold trim rails on both edges of the column
  spine.add(box(0.006, spineH, 0.006, mat(0x08090a, 0.6, 0.4), 0, spineY, -TD / 2 - 0.104));
  spine.add(box(0.012, spineH + 0.02, 0.02, goldM, -0.158, spineY, -TD / 2 - 0.095));
  spine.add(box(0.012, spineH + 0.02, 0.02, goldM, 0.158, spineY, -TD / 2 - 0.095));
  // dark cable mass just visible behind the mesh
  const cableM = mat(0x1c1e22, 0.8, 0.25);
  for (let i = 0; i < 8; i++) {
    spine.add(cyl(0.014, 0.014, spineH * 0.96, cableM, -0.125 + i * 0.036, spineY, -TD / 2 - 0.112, 8));
  }
  mark(spine, 'spine');
  rear.add(spine);

  // braided steel supply hoses sweeping from the plinth into the manifolds
  const hoseM = mat(0x9aa0a6, 0.45, 0.85);
  for (const hx of [-0.09, 0.09]) {
    const hose = tube([
      [hx, plinth + 0.02, -TD / 2 + 0.05],
      [hx * 1.8, plinth + 0.1, -TD / 2 - 0.1],
      [hx * 2.6, plinth + 0.32, -TD / 2 - 0.06],
    ], 0.026, hoseM, 24);
    mark(hose, 'manifold');
    rear.add(hose);
  }

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
