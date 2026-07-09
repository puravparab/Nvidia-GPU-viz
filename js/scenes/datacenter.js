import * as THREE from 'three';
import { mat, glowMat, box, cyl, led, mark, M, GREEN } from '../common.js';

/**
 * AI-factory view: rows of NVL72 racks in hot/cold aisles, in-row CDUs,
 * end-of-row scale-out spine switches, overhead cable trays. One rack is
 * highlighted as "the rack you explored". Lightweight rack proxies keep the
 * scene cheap enough to render dozens of racks.
 */

const RW = 0.6, RD = 1.1, RH = 2.05;   // proxy rack footprint (m)

function rackProxy(highlight = false) {
  const g = new THREE.Group();
  const bodyM = highlight ? mat(0x14180d, 0.5, 0.6) : mat(0x0d0e10, 0.55, 0.7);
  g.add(box(RW, RH, RD, bodyM, 0, RH / 2, 0));
  // front faceplate
  g.add(box(RW * 0.9, RH * 0.94, 0.02, mat(0x161a1d, 0.5, 0.6), 0, RH / 2, RD / 2));
  // tray seams — thin dark lines down the face
  for (let i = 0; i < 16; i++) {
    const y = 0.22 + i * ((RH - 0.4) / 16);
    g.add(box(RW * 0.82, 0.012, 0.006, mat(0x050506, 0.7, 0.4), 0, y, RD / 2 + 0.012));
  }
  // green accent strips + switch-bay glow
  const strip = highlight ? 2.4 : 0.7;
  g.add(box(0.01, RH * 0.9, 0.01, glowMat(GREEN, strip), -RW * 0.44, RH / 2, RD / 2 + 0.012));
  g.add(box(0.01, RH * 0.9, 0.01, glowMat(GREEN, strip), RW * 0.44, RH / 2, RD / 2 + 0.012));
  // NVLink switch bay: brighter band mid-height
  g.add(box(RW * 0.8, 0.14, 0.008, glowMat(GREEN, highlight ? 2.6 : 0.9), 0, RH * 0.5, RD / 2 + 0.014));
  // a few status LEDs
  for (let i = 0; i < 3; i++) g.add(led(0.01, GREEN, RW * 0.3, RH * 0.62 + i * 0.05, RD / 2 + 0.02));
  return g;
}

function cduProxy() {
  const g = new THREE.Group();
  g.add(box(RW, RH * 0.82, RD, mat(0x1a1c1f, 0.5, 0.7), 0, RH * 0.41, 0));
  g.add(box(RW * 0.92, RH * 0.78, 0.02, M.steel(), 0, RH * 0.41, RD / 2));
  // coolant piping (blue supply / red return) up the front
  g.add(cyl(0.05, 0.05, RH * 0.7, M.blueTube(), -RW * 0.22, RH * 0.4, RD / 2 + 0.06, 14));
  g.add(cyl(0.05, 0.05, RH * 0.7, M.redTube(), RW * 0.22, RH * 0.4, RD / 2 + 0.06, 14));
  // pump/vent grille
  g.add(box(RW * 0.5, RH * 0.3, 0.01, mat(0x0a0b0c, 0.7, 0.4), 0, RH * 0.3, RD / 2 + 0.012));
  g.add(led(0.012, 0x2299ff, RW * 0.32, RH * 0.66, RD / 2 + 0.02));
  return g;
}

function spineProxy() {
  const g = new THREE.Group();
  g.add(box(RW, RH * 0.9, RD, mat(0x101214, 0.5, 0.65), 0, RH * 0.45, 0));
  g.add(box(RW * 0.9, RH * 0.86, 0.02, mat(0x17191c, 0.5, 0.6), 0, RH * 0.45, RD / 2));
  // dense port rows (this is a networking rack)
  for (let r = 0; r < 20; r++) {
    for (let c = 0; c < 8; c++) {
      g.add(box(0.03, 0.014, 0.006, mat(0x060708, 0.8, 0.3),
        -RW * 0.32 + c * (RW * 0.64 / 7), 0.2 + r * (RH * 0.8 / 20), RD / 2 + 0.012));
    }
  }
  for (let i = 0; i < 8; i++) g.add(led(0.008, 0x33ddff, -RW * 0.36, 0.25 + i * 0.2, RD / 2 + 0.02));
  return g;
}

export function buildDatacenter() {
  const root = new THREE.Group();

  const ROWS = 3;            // rack rows
  const PER_ROW = 9;         // racks per row
  const PITCH_X = RW + 0.05; // rack-to-rack along a row
  const AISLE = 2.4;         // row-to-row (aisle) spacing
  const rowZ = i => (i - (ROWS - 1) / 2) * AISLE;
  const colX = j => (j - (PER_ROW - 1) / 2) * PITCH_X;

  const rackT = rackProxy(false);
  const cduT = cduProxy();
  const highlightIdx = { row: ROWS - 1, col: Math.floor(PER_ROW / 2) + 1 }; // front row, next to the CDU

  for (let r = 0; r < ROWS; r++) {
    for (let j = 0; j < PER_ROW; j++) {
      const isHi = r === highlightIdx.row && j === highlightIdx.col;
      // insert an in-row CDU roughly mid-row
      if (j === 4) {
        const c = cduT.clone();
        c.position.set(colX(j), 0, rowZ(r));
        if ((ROWS - 1 - r) % 2 === 1) c.rotation.y = Math.PI; // hot/cold aisle facing
        mark(c, 'cdu');
        root.add(c);
        continue;
      }
      const rk = isHi ? rackProxy(true) : rackT.clone();
      rk.position.set(colX(j), 0, rowZ(r));
      if ((ROWS - 1 - r) % 2 === 1) rk.rotation.y = Math.PI; // hot/cold aisle facing
      mark(rk, 'dcRack');
      if (isHi) {
        rk.userData.highlightRack = true;
        // floating beam + ring to draw the eye
        const beam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 3.2, 8),
          new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.25 })
        );
        beam.position.set(colX(j), RH + 1.6, rowZ(r));
        root.add(beam);
        root.userData.markerId = beam.id;
      }
      root.add(rk);
    }
  }

  // end-of-row spine switch stacks (both ends of the middle aisle)
  for (const sx of [-1, 1]) {
    const s = spineProxy();
    s.position.set(sx * (colX(PER_ROW - 1) + PITCH_X * 1.4), 0, rowZ((ROWS - 1) / 2));
    mark(s, 'spineSwitch');
    root.add(s);
  }

  // overhead cable trays running along each aisle
  const trayM = mat(0x1a1d20, 0.6, 0.5);
  for (let r = 0; r < ROWS; r++) {
    const t = box(PER_ROW * PITCH_X + 1.2, 0.05, 0.28, trayM, 0, RH + 0.5, rowZ(r) + AISLE * 0.3);
    mark(t, 'dcFloor');
    root.add(t);
  }
  // power busway (yellow) overhead, perpendicular
  for (let j = -1; j <= 1; j++) {
    root.add(box(0.1, 0.06, ROWS * AISLE + 1.5, mat(0x6e5f22, 0.5, 0.6), j * 2.5, RH + 0.75, 0));
  }

  /* ----- floor with hot/cold aisle tint ----- */
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    mat(0x0a0c0d, 0.9, 0.15)
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.002;
  mark(floor, 'dcFloor');
  root.add(floor);
  const grid = new THREE.GridHelper(40, 40, 0x1b2125, 0x121619);
  root.add(grid);
  // cool-aisle light strips between rows
  for (let r = 0; r < ROWS - 1; r++) {
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(PER_ROW * PITCH_X + 2, 1.2),
      new THREE.MeshBasicMaterial({ color: 0x1a3a6a, transparent: true, opacity: 0.12 })
    );
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(0, 0.005, rowZ(r) + AISLE / 2);
    root.add(strip);
    root.userData.noHighlight ??= new Set();
    root.userData.noHighlight.add(strip.id);
  }

  root.userData.noHighlight ??= new Set();
  root.userData.noHighlight.add(floor.id);
  root.userData.noHighlight.add(grid.id);
  if (root.userData.markerId) root.userData.noHighlight.add(root.userData.markerId);

  return {
    group: root,
    camera: { pos: [6.5, 5.2, 8.5], target: [0, 0.8, 0], min: 3, max: 26 },
    defaultInfo: 'datacenter',
  };
}
