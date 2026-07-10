import * as THREE from 'three';
import { mat, box, cyl, slab, mark, M, GREEN } from '../common.js';

/**
 * Bare GB200 "Bianca" superchip board, laid out per the SemiAnalysis board
 * diagram and NVIDIA's official render. Rear (+X): two black NVLink5
 * connectors and yellow 12 V RapidLock pairs. Two gold-framed Blackwell
 * packages side-by-side at the rear; Grace on the centreline flanked left and
 * right by LPDDR5X banks; two Mirror-Mezz connectors ahead of Grace (where
 * the ConnectX mezzanine lands); front edge carries the MCIO/SimSAS/225 W
 * cluster, the tan Grace-Grace C2C connector, BMC, CMOS battery and fan
 * headers.
 */
/** Brushed nickel heat-spreader texture with a faint etched NVIDIA marking,
 *  matching the bare production Bianca board photo. */
function lidTexture(label) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 256;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#a9adb2';
  ctx.fillRect(0, 0, 256, 256);
  let s = 19;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  // subtle mottling like the nickel plating in the photo
  for (let i = 0; i < 60; i++) {
    const g = 158 + Math.floor(rand() * 22);
    ctx.fillStyle = `rgba(${g},${g + 2},${g + 5},0.35)`;
    ctx.beginPath();
    ctx.ellipse(rand() * 256, rand() * 256, 12 + rand() * 40, 8 + rand() * 26, rand() * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(72,76,82,0.76)';
  ctx.font = `600 ${label.length > 10 ? 25 : 30}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(label, 128, 118);
  ctx.font = '400 18px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(82,86,92,0.56)';
  ctx.fillText('T TW 2425', 128, 152);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function buildBoard() {
  const root = new THREE.Group();
  const W = 0.62, D = 0.44;

  const goldRim = mat(0x8a6d38, 0.3, 0.95);
  const pkgSubM = mat(0x14161a, 0.5, 0.4);

  /* ----- PCB ----- */
  const pcb = new THREE.Group();
  pcb.add(box(W, 0.006, D, M.pcbDark(), 0, -0.003, 0));
  for (const [hx, hz] of [[-0.29, -0.19], [-0.29, 0.19], [0.28, -0.2], [0.28, 0.2], [-0.05, -0.19], [-0.05, 0.19]]) {
    pcb.add(cyl(0.006, 0.006, 0.009, M.gold(), hx, 0.002, hz, 10));
  }
  mark(pcb, 'boardPcb');
  root.add(pcb);

  /* ----- two Blackwell B200 packages (rear): bare nickel heat spreaders on
     a slim gold substrate rim, per the production board photo ----- */
  const b200LidM = new THREE.MeshStandardMaterial({
    map: lidTexture('NVIDIA B200'), roughness: 0.3, metalness: 0.85,
  });
  for (const gz of [-0.105, 0.105]) {
    const pkg = new THREE.Group();
    pkg.position.set(0.155, 0, gz);
    pkg.add(slab(0.15, 0.006, 0.15, 0.005, pkgSubM, 0, 0, 0));
    pkg.add(slab(0.142, 0.003, 0.142, 0.004, goldRim, 0, 0.006, 0));
    pkg.add(box(0.134, 0.007, 0.134, b200LidM, 0, 0.009, 0));
    mark(pkg, 'b200Package');
    root.add(pkg);
  }

  /* ----- Grace CPU package: same bare nickel lid, clearly etched ----- */
  const graceLidM = new THREE.MeshStandardMaterial({
    map: lidTexture('NVIDIA GRACE'), roughness: 0.3, metalness: 0.85,
  });
  const grace = new THREE.Group();
  grace.position.set(-0.09, 0, 0);
  grace.add(slab(0.14, 0.005, 0.14, 0.005, pkgSubM, 0, 0, 0));
  grace.add(box(0.124, 0.008, 0.124, graceLidM, 0, 0.005, 0));
  mark(grace, 'graceCpu');
  root.add(grace);

  /* ----- LPDDR5X banks flanking Grace left and right (per the diagram) ----- */
  const lp = new THREE.Group();
  for (const sz of [-1, 1]) {
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 4; c++) {
        lp.add(box(0.036, 0.005, 0.026, M.chipBlack(),
          -0.155 + c * 0.044, 0.006, sz * (0.115 + r * 0.033)));
      }
    }
  }
  mark(lp, 'lpddr');
  root.add(lp);

  /* ----- NVLink-C2C lanes: Grace ↔ each GPU (stylised) ----- */
  const c2c = new THREE.Group();
  const laneGeo = new THREE.PlaneGeometry(0.15, 0.0035);
  laneGeo.rotateX(-Math.PI / 2);
  for (const gz of [-0.105, 0.105]) {
    const x0 = -0.015, z0 = 0, x1 = 0.08, z1 = gz * 0.85;
    const yaw = Math.atan2(-(z1 - z0), x1 - x0);
    for (let i = 0; i < 5; i++) {
      const t = i / 4 - 0.5;
      const lane = new THREE.Mesh(
        laneGeo,
        new THREE.MeshBasicMaterial({ color: GREEN, transparent: true, opacity: 0.28 })
      );
      lane.position.set((x0 + x1) / 2 - t * 0.014 * Math.sign(gz), 0.012, (z0 + z1) / 2 + t * 0.016);
      lane.rotation.y = yaw;
      c2c.add(lane);
    }
  }
  mark(c2c, 'c2cLink');
  root.add(c2c);

  /* ----- VRM tile fields hugging the GPUs ----- */
  const vrm = new THREE.Group();
  // light-grey power chokes ("85M" blocks in the production photo)
  const tileA = mat(0x6e747b, 0.42, 0.75);
  const tileB = mat(0x565c63, 0.45, 0.65);
  const tileC = mat(0x3a3f45, 0.55, 0.5);
  let s = 3;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const pick = () => { const r = rand(); return r > 0.55 ? tileA : (r > 0.25 ? tileB : tileC); };
  const tileAt = (x, z) => vrm.add(box(0.017, 0.009, 0.017, pick(), x, 0.006, z));
  for (let i = 0; i < 4; i++) for (let j = 0; j < 16; j++) tileAt(0.03 + i * 0.023, -0.185 + j * 0.024);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) tileAt(0.11 + i * 0.023, -0.013 + j * 0.026);
  for (let j = 0; j < 8; j++) { tileAt(0.25, -0.2 + j * 0.026); tileAt(0.25, 0.018 + j * 0.026); }
  for (let i = 0; i < 5; i++) { tileAt(0.1 + i * 0.028, -0.198); tileAt(0.1 + i * 0.028, 0.198); }
  mark(vrm, 'vrm');
  root.add(vrm);

  /* ----- rear edge: two black NVLink5 connectors + yellow 12V RapidLocks ----- */
  const nvl = new THREE.Group();
  for (const cz of [-0.1, 0.1]) {
    nvl.add(box(0.035, 0.03, 0.13, mat(0x111214, 0.55, 0.4), 0.29, 0.015, cz));
    nvl.add(box(0.018, 0.02, 0.11, mat(0x040405, 0.7, 0.2), 0.3, 0.016, cz));
  }
  mark(nvl, 'boardNvlink');
  root.add(nvl);
  // 12V + GND RapidLock power connectors near the VRMs (yellow in the diagram)
  const rapid = new THREE.Group();
  const yellowM = mat(0x77601f, 0.42, 0.75);
  for (const [rx, rz] of [[0.29, -0.185], [0.29, 0.185], [-0.02, -0.19], [-0.02, 0.19], [-0.24, -0.115], [-0.24, 0.115], [0.02, -0.15], [0.02, 0.15]]) {
    rapid.add(box(0.024, 0.012, 0.014, yellowM, rx, 0.007, rz));
  }
  mark(rapid, 'trayPower');
  root.add(rapid);

  /* ----- two Mirror-Mezz connectors ahead of Grace (ConnectX mezzanine site) ----- */
  // gold pin-grid arrays in the production photo
  const mezzConn = new THREE.Group();
  const mezzM = mat(0x8a743a, 0.48, 0.8);
  mezzConn.add(box(0.075, 0.008, 0.05, mezzM, -0.21, 0.005, -0.02));
  mezzConn.add(box(0.075, 0.008, 0.05, mezzM, -0.21, 0.005, 0.045));
  mark(mezzConn, 'connectx');
  root.add(mezzConn);

  /* ----- front edge: I/O cluster (per the diagram) ----- */
  const io = new THREE.Group();
  // MCIO x16 (blue), SimSAS PCIe x8 ×2 (violet), 8x connector (purple), 225W (red)
  // — real connectors are dark plastic with only a tinted key, not saturated blocks
  io.add(box(0.02, 0.012, 0.05, mat(0x152836, 0.5, 0.35), -0.295, 0.007, -0.06));
  io.add(box(0.016, 0.01, 0.036, mat(0x1e1d30, 0.5, 0.35), -0.295, 0.006, 0.0));
  io.add(box(0.016, 0.01, 0.036, mat(0x1e1d30, 0.5, 0.35), -0.295, 0.006, 0.05));
  io.add(box(0.012, 0.01, 0.022, mat(0x221a30, 0.5, 0.35), -0.295, 0.006, 0.095));
  io.add(box(0.014, 0.012, 0.02, mat(0x3a1616, 0.5, 0.35), -0.295, 0.007, -0.11));
  mark(io, 'boardPcb');
  root.add(io);
  // tan Grace-Grace C2C connector: the 600 GB/s link to the sibling board
  const gg = box(0.024, 0.014, 0.085, mat(0x3a3024, 0.5, 0.35), -0.255, 0.008, -0.165);
  mark(gg, 'graceGraceLink');
  root.add(gg);
  // BMC connector (green, left edge) + CMOS battery
  const bmcM = new THREE.Group();
  bmcM.add(box(0.016, 0.012, 0.09, mat(0x1a2c20, 0.5, 0.4), -0.3, 0.007, 0.15));
  bmcM.add(cyl(0.012, 0.012, 0.005, M.steel(), -0.245, 0.005, 0.185, 14));
  mark(bmcM, 'hmc');
  root.add(bmcM);
  // 8-pin fan connectors along the front edge (red in the diagram)
  const fanConn = new THREE.Group();
  const redM = mat(0x3d1a1a, 0.5, 0.35);
  for (const fx of [-0.16, -0.12, -0.08, 0.08, 0.12, 0.16]) {
    fanConn.add(box(0.024, 0.008, 0.012, redM, fx, 0.005, -0.207));
  }
  mark(fanConn, 'airCooling');
  root.add(fanConn);

  /* ----- misc small components ----- */
  const misc = new THREE.Group();
  const tiny = mat(0x2c2f33, 0.55, 0.45);
  for (let i = 0; i < 50; i++) {
    const x = -0.27 + rand() * 0.24, z = (rand() - 0.5) * 0.3;
    if (x > -0.17 && Math.abs(z) < 0.13) continue;
    if (Math.abs(z) > 0.1 && x > -0.2) continue;
    misc.add(box(0.005 + rand() * 0.008, 0.003, 0.004 + rand() * 0.006, tiny, x, 0.004, z));
  }
  mark(misc, 'boardPcb');
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
    camera: { pos: [0.3, 0.52, 0.58], target: [0, 0, 0], min: 0.2, max: 1.8 },
    defaultInfo: 'biancaBoard',
  };
}
