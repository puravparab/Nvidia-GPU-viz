import * as THREE from 'three';

export const GREEN = 0x76b900;

/* ---------- shared material factory (cached so clones share GPU state) ---------- */
const matCache = new Map();
export function mat(color, roughness = 0.5, metalness = 0.1, opts = {}) {
  const key = `${color}|${roughness}|${metalness}|${JSON.stringify(opts)}`;
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshStandardMaterial({ color, roughness, metalness, ...opts }));
  }
  return matCache.get(key);
}

export function glowMat(color = GREEN, intensity = 1.6) {
  return mat(0x0a0d05, 0.6, 0.0, { emissive: color, emissiveIntensity: intensity });
}

/* ---------- geometry helpers ---------- */
export function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  return m;
}

export function cyl(rTop, rBot, h, material, x = 0, y = 0, z = 0, radial = 20) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, radial), material);
  m.position.set(x, y, z);
  return m;
}

/** Rounded-edge slab (nicer than a raw box for faceplates / packages). */
export function slab(w, h, d, r, material, x = 0, y = 0, z = 0) {
  const shape = new THREE.Shape();
  const hw = w / 2, hd = d / 2, rr = Math.min(r, hw, hd);
  shape.moveTo(-hw + rr, -hd);
  shape.lineTo(hw - rr, -hd);  shape.absarc(hw - rr, -hd + rr, rr, -Math.PI / 2, 0);
  shape.lineTo(hw, hd - rr);   shape.absarc(hw - rr, hd - rr, rr, 0, Math.PI / 2);
  shape.lineTo(-hw + rr, hd);  shape.absarc(-hw + rr, hd - rr, rr, Math.PI / 2, Math.PI);
  shape.lineTo(-hw, -hd + rr); shape.absarc(-hw + rr, -hd + rr, rr, Math.PI, Math.PI * 1.5);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 6 });
  geo.rotateX(-Math.PI / 2); // shape now lies flat, extruded upward through y ∈ [0, h]
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z);
  return m;
}

/** Small emissive LED dot. */
export function led(r, color, x, y, z) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 10), glowMat(color, 2.2));
  m.position.set(x, y, z);
  return m;
}

/** Curved tube along points. */
export function tube(points, radius, material, segments = 32) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  return new THREE.Mesh(new THREE.TubeGeometry(curve, segments, radius, 10, false), material);
}

/* ---------- interactivity ---------- */
/**
 * Mark an Object3D (and all its descendants) as clickable, pointing at an INFO key.
 * The raycaster walks up parents until it finds `userData.infoKey`.
 */
export function mark(obj, infoKey) {
  obj.userData.infoKey = infoKey;
  return obj;
}

/* ---------- procedural textures ---------- */
/** Fine rectilinear "die shot" texture used on GPU/CPU silicon. */
export function dieTexture(w = 512, h = 512, base = '#12161f', seed = 7) {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  let s = seed;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647;
  // large functional blocks
  const cols = 6, rows = 8, gw = w / cols, gh = h / rows;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const shade = 18 + Math.floor(rand() * 26);
      ctx.fillStyle = `rgb(${shade},${shade + 6},${shade + 16})`;
      ctx.fillRect(i * gw + 2, j * gh + 2, gw - 4, gh - 4);
      // sub-blocks
      for (let k = 0; k < 6; k++) {
        const sw = gw * (0.15 + rand() * 0.3), sh = gh * (0.1 + rand() * 0.35);
        const sx = i * gw + rand() * (gw - sw), sy = j * gh + rand() * (gh - sh);
        const s2 = 14 + Math.floor(rand() * 34);
        ctx.fillStyle = `rgb(${s2},${s2 + 8},${s2 + 20})`;
        ctx.fillRect(sx, sy, sw, sh);
      }
    }
  }
  // fine bus lines
  // Keep the bus grid below pixel frequency at oblique angles; the denser
  // version shimmered as an auto-rotating die crossed mip levels.
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = '#3a4a66';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 2;
  return tex;
}

/** Perforated-metal texture for vented faceplates. */
export function ventTexture(w = 256, h = 64, bg = '#17191b', hole = '#0a0b0c') {
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = hole;
  const r = 2.2, step = 8;
  for (let y = step / 2; y < h; y += step) {
    for (let x = ((y / step) % 2) * step / 2 + step / 2; x < w; x += step) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------- common palette ---------- */
export const M = {
  frame:      () => mat(0x0d0e10, 0.55, 0.75),
  panelDark:  () => mat(0x141618, 0.5, 0.6),
  panelMid:   () => mat(0x1d2023, 0.45, 0.7),
  steel:      () => mat(0x777d84, 0.32, 0.95),
  nickel:     () => mat(0xa9aeb4, 0.26, 0.95),
  copper:     () => mat(0x9e5f28, 0.32, 0.95),
  gold:       () => mat(0x93793a, 0.32, 0.95),
  pcb:        () => mat(0x0e1512, 0.62, 0.25),
  pcbDark:    () => mat(0x101315, 0.6, 0.3),
  chipBlack:  () => mat(0x181a1d, 0.42, 0.6),
  silicon:    () => mat(0x23293a, 0.3, 0.85),
  hbm:        () => mat(0x2a2d33, 0.38, 0.7),
  substrate:  () => mat(0x131f15, 0.42, 0.45),
  rubber:     () => mat(0x151515, 0.9, 0.0),
  blueTube:   () => mat(0x1d4e89, 0.45, 0.4),
  redTube:    () => mat(0x8c2f2f, 0.45, 0.4),
};
