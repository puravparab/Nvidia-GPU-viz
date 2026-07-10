import * as THREE from 'three';
import { mat, glowMat, box, cyl, led, mark, ventTexture, M, GREEN } from '../common.js';

/**
 * AI-factory hall: NVL72 racks arranged in back-to-back pods with enclosed
 * hot-aisle containment, front rows facing a central cold aisle, in-row CDUs,
 * end-of-row scale-out spine switches, overhead cable baskets and power
 * busways, and a raised perforated floor. One rack is highlighted as "the rack
 * you explored". Lightweight proxies keep dozens of racks cheap to render.
 */

const RW = 0.6, RD = 1.1, RH = 2.05;   // proxy rack footprint (m)
const goldM = mat(0x8a6f3f, 0.3, 1.0);

/** An NVL72 rack proxy — dark body, gold front trim, green switch-bay glow. */
function rackProxy(highlight = false) {
  const g = new THREE.Group();
  const f = RD / 2 + 0.012;               // front face z
  g.add(box(RW, RH, RD, mat(highlight ? 0x14170e : 0x0c0d0f, 0.55, 0.7), 0, RH / 2, 0));
  // perforated mesh front
  const vt = ventTexture(128, 256, '#131518', '#050607');
  vt.repeat.set(2, 9);
  g.add(box(RW * 0.82, RH * 0.9, 0.004, new THREE.MeshStandardMaterial({ map: vt, roughness: 0.7, metalness: 0.45 }), 0, RH / 2, RD / 2 + 0.002));
  // gold side rails + top/bottom bezel (NVL72 signature trim)
  g.add(box(0.03, RH * 0.96, 0.02, goldM, -RW * 0.44, RH / 2, f));
  g.add(box(0.03, RH * 0.96, 0.02, goldM, RW * 0.44, RH / 2, f));
  g.add(box(RW * 0.92, 0.045, 0.022, goldM, 0, RH * 0.965, f));
  g.add(box(RW * 0.92, 0.03, 0.022, goldM, 0, RH * 0.04, f));
  // NVLink switch bay: green glow band across the middle
  g.add(box(RW * 0.78, 0.12, 0.006, glowMat(GREEN, highlight ? 2.4 : 1.0), 0, RH * 0.5, RD / 2 + 0.014));
  // status LEDs
  g.add(led(0.01, GREEN, RW * 0.3, RH * 0.62, RD / 2 + 0.02));
  g.add(led(0.008, 0x33ddff, RW * 0.3, RH * 0.58, RD / 2 + 0.02));
  return g;
}

/** In-row coolant distribution unit — silver door, blue/red risers. */
function cduProxy() {
  const g = new THREE.Group();
  g.add(box(RW, RH * 0.9, RD, mat(0x191b1e, 0.5, 0.7), 0, RH * 0.45, 0));
  g.add(box(RW * 0.9, RH * 0.86, 0.02, M.steel(), 0, RH * 0.45, RD / 2));
  g.add(cyl(0.05, 0.05, RH * 0.72, M.blueTube(), -RW * 0.24, RH * 0.42, RD / 2 + 0.055, 14));
  g.add(cyl(0.05, 0.05, RH * 0.72, M.redTube(), RW * 0.24, RH * 0.42, RD / 2 + 0.055, 14));
  const vt = ventTexture(128, 128, '#0c0d0e', '#040405');
  g.add(box(RW * 0.5, RH * 0.34, 0.006, new THREE.MeshStandardMaterial({ map: vt, roughness: 0.7, metalness: 0.4 }), 0, RH * 0.32, RD / 2 + 0.012));
  g.add(led(0.012, 0x2299ff, RW * 0.3, RH * 0.72, RD / 2 + 0.02));
  return g;
}

/** Scale-out spine networking rack — dense fiber ports, blue link LEDs. */
function spineProxy() {
  const g = new THREE.Group();
  g.add(box(RW, RH * 0.94, RD, mat(0x0f1113, 0.5, 0.65), 0, RH * 0.47, 0));
  g.add(box(RW * 0.9, RH * 0.9, 0.02, mat(0x16181b, 0.5, 0.6), 0, RH * 0.47, RD / 2));
  for (let r = 0; r < 22; r++) {
    for (let c = 0; c < 8; c++) {
      g.add(box(0.03, 0.013, 0.006, mat(0x060708, 0.8, 0.3),
        -RW * 0.32 + c * (RW * 0.64 / 7), 0.22 + r * (RH * 0.8 / 22), RD / 2 + 0.012));
    }
  }
  for (let i = 0; i < 10; i++) g.add(led(0.007, 0x33ddff, -RW * 0.36, 0.26 + i * 0.16, RD / 2 + 0.02));
  return g;
}

export function buildDatacenter() {
  const root = new THREE.Group();
  root.userData.noHighlight = new Set();
  const noHi = root.userData.noHighlight;

  const PER_ROW = 9;
  const PITCH_X = RW + 0.06;
  const HOT = 1.35;                 // contained hot aisle within a pod
  const COLD = 2.3;                 // cold aisle between pods
  const colX = j => (j - (PER_ROW - 1) / 2) * PITCH_X;
  const rowLen = PER_ROW * PITCH_X;

  // two pods, each = two rows back-to-back around a hot aisle, centred on ±(HOT+COLD)/2
  const podC = (HOT + COLD) / 2;
  // rowZ, and whether the row's FRONT faces -Z (true) or +Z (false)
  const rows = [
    { z: -podC - HOT / 2, faceNeg: true },   // pod0 outer
    { z: -podC + HOT / 2, faceNeg: false },  // pod0 inner (faces central cold aisle)
    { z: podC - HOT / 2, faceNeg: true },    // pod1 inner (faces central cold aisle)
    { z: podC + HOT / 2, faceNeg: false },   // pod1 outer
  ];

  const rackT = rackProxy(false);
  const cduT = cduProxy();
  const cduCol = 6;                                    // in-row CDU position
  const hi = { row: 2, col: Math.floor(PER_ROW / 2) }; // inner row facing the aisle, toward camera

  rows.forEach((row, r) => {
    for (let j = 0; j < PER_ROW; j++) {
      // Clear the sightline immediately in front of and behind the hero rack.
      if (j === hi.col && (r === hi.row - 1 || r === hi.row + 1)) continue;
      const isCdu = j === cduCol;
      const isHi = r === hi.row && j === hi.col;
      const unit = isCdu ? cduT.clone() : (isHi ? rackProxy(true) : rackT.clone());
      unit.position.set(colX(j), 0, row.z);
      if (row.faceNeg) unit.rotation.y = Math.PI;       // front faces the outer/aisle side
      mark(unit, isCdu ? 'cdu' : 'dcRack');
      root.add(unit);
      if (isHi) {
        const beam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.018, 3.4, 8),
          new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.22 })
        );
        beam.position.set(colX(j), RH + 1.7, row.z);
        root.add(beam);
        noHi.add(beam.id);
      }
    }
  });

  /* ----- hot-aisle containment: translucent roof + end doors over each pod ----- */
  const panelM = new THREE.MeshStandardMaterial({
    color: 0x9fb4c4, transparent: true, opacity: 0.12, roughness: 0.2, metalness: 0, side: THREE.DoubleSide,
  });
  const frameM = mat(0x2a2e33, 0.5, 0.7);
  for (const cz of [-podC, podC]) {
    // roof
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(rowLen + 0.4, HOT), panelM);
    roof.rotation.x = -Math.PI / 2;
    roof.position.set(0, RH + 0.04, cz);
    root.add(roof); noHi.add(roof.id);
    // roof frame rails
    root.add(box(rowLen + 0.5, 0.04, 0.04, frameM, 0, RH + 0.06, cz - HOT / 2));
    root.add(box(rowLen + 0.5, 0.04, 0.04, frameM, 0, RH + 0.06, cz + HOT / 2));
    // end doors (both ends of the aisle)
    for (const ex of [-1, 1]) {
      const door = new THREE.Mesh(new THREE.PlaneGeometry(HOT, RH), panelM);
      door.rotation.y = Math.PI / 2;
      door.position.set(ex * (rowLen / 2 + 0.18), RH / 2, cz);
      root.add(door); noHi.add(door.id);
      root.add(box(0.05, RH + 0.1, HOT + 0.05, frameM, ex * (rowLen / 2 + 0.2), RH / 2, cz));
    }
  }

  /* ----- end-of-row spine networking racks (ends of the central cold aisle) ----- */
  for (const sx of [-1, 1]) {
    for (const rz of [rows[1].z, rows[2].z]) {
      const s = spineProxy();
      s.position.set(sx * (colX(PER_ROW - 1) + PITCH_X * 1.3), 0, rz);
      if (rz === rows[1].z) s.rotation.y = Math.PI;
      mark(s, 'spineSwitch');
      root.add(s);
    }
  }

  /* ----- overhead: cable baskets along rows + power busways across ----- */
  const basketM = mat(0x20242a, 0.6, 0.5);
  rows.forEach(row => {
    root.add(box(rowLen + 1.0, 0.04, 0.34, basketM, 0, RH + 0.34, row.z));
  });
  for (let j = -1; j <= 1; j++) {
    root.add(box(0.09, 0.055, 2 * podC + HOT + 1.2, mat(0x2c2f34, 0.5, 0.7), j * 2.6, RH + 0.55, 0));
  }

  /* ----- facility coolant loop: red/blue piping snaking along the pods to
     the CDUs at floor level, per NVIDIA's NVL72 compute-racks slide ----- */
  const pipes = new THREE.Group();
  const supplyM = mat(0x4a7fa8, 0.4, 0.6);
  const returnM = mat(0xa85252, 0.4, 0.6);
  const pipeRun = (m, y, z) => {
    const p = cyl(0.045, 0.045, rowLen + 1.6, m, 0, y, z, 12);
    p.rotation.z = Math.PI / 2;
    pipes.add(p);
  };
  for (const cz of [-podC, podC]) {
    pipeRun(supplyM, 0.09, cz - 0.14);
    pipeRun(returnM, 0.09, cz + 0.14);
    // riser elbows at both row ends
    for (const ex of [-1, 1]) {
      pipes.add(cyl(0.045, 0.045, 0.5, supplyM, ex * (rowLen / 2 + 0.8), 0.25, cz - 0.14, 12));
      pipes.add(cyl(0.045, 0.045, 0.5, returnM, ex * (rowLen / 2 + 0.8), 0.25, cz + 0.14, 12));
    }
  }
  // cross-feed from the in-row CDU column to both pods
  for (const [m, dx] of [[supplyM, -0.14], [returnM, 0.14]]) {
    const c = cyl(0.045, 0.045, 2 * podC + HOT, m, colX(cduCol) + dx, 0.09, 0, 12);
    c.rotation.x = Math.PI / 2;
    pipes.add(c);
  }
  mark(pipes, 'cdu');
  root.add(pipes);

  /* ----- far-field: the rest of the data hall, revealed on zoom-out.
     Cheap row proxies (one box per row + glow strip) replicate the pod
     cluster across the floor so the detailed pods sit in an endless hall ----- */
  const far = new THREE.Group();
  const farBodyM = mat(0x0d0e10, 0.6, 0.6);
  const farGlowM = new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.35 });
  const clusterPitchZ = 2 * podC + HOT + COLD;      // pod pair + shared aisles
  const clusterPitchX = rowLen + 2.4;
  for (let gx = -1; gx <= 1; gx++) {
    for (let gz = -2; gz <= 2; gz++) {
      // Leave a full front-to-back viewing corridor through the hero pod.
      if (gx === 0) continue;
      for (const row of rows) {
        const body = box(rowLen, RH, RD, farBodyM, gx * clusterPitchX, RH / 2, gz * clusterPitchZ + row.z);
        far.add(body);
        const strip = box(rowLen * 0.96, 0.1, 0.01, farGlowM,
          gx * clusterPitchX, RH * 0.5,
          gz * clusterPitchZ + row.z + (row.faceNeg ? -RD / 2 - 0.01 : RD / 2 + 0.01));
        far.add(strip);
      }
    }
  }
  far.traverse(o => { if (o.isMesh) noHi.add(o.id); });
  root.add(far);

  /* ----- floor: dark slab + grid + perforated cold-aisle tiles ----- */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(46, 46), mat(0x0a0c0d, 0.9, 0.15));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.002;
  mark(floor, 'dcFloor');
  root.add(floor); noHi.add(floor.id);
  const grid = new THREE.GridHelper(46, 46, 0x1b2125, 0x121619);
  root.add(grid); noHi.add(grid.id);

  // perforated tiles + cool underglow down each cold aisle (central + two outer)
  const tileTex = ventTexture(64, 64, '#0e1013', '#05070a');
  const tileMat = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.7, metalness: 0.4 });
  const coldZ = [0, -podC - HOT / 2 - COLD / 2, podC + HOT / 2 + COLD / 2];
  for (const cz of coldZ) {
    for (let j = 0; j < PER_ROW; j++) {
      const t = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), tileMat);
      t.rotation.x = -Math.PI / 2;
      t.position.set(colX(j), 0.004, cz);
      root.add(t); noHi.add(t.id);
    }
    const glow = new THREE.Mesh(
      new THREE.PlaneGeometry(rowLen + 1, 1.0),
      new THREE.MeshBasicMaterial({ color: 0x1c4a86, transparent: true, opacity: 0.1 })
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(0, 0.006, cz);
    root.add(glow); noHi.add(glow.id);
  }

  return {
    group: root,
    camera: { pos: [-6.6, 6.2, 7.6], target: [0.5, 0.5, 0], min: 3, max: 42 },
    defaultInfo: 'datacenter',
  };
}
