// src/lib/gpu-engine/shapes.ts — Qianshu v6.0 校准版 全18种烟花形态
// All shape generators produce world-unit-scaled Float32Array(count×3) relative to origin.

const TAU = Math.PI * 2;

export const SHAPE_COUNTS: Record<string, [number, number]> = {
    peony:         [800, 1200],
    chrysanthemum: [600,  900],
    dahlia:        [320,  520],
    willow:        [400,  700],
    brocade:       [700, 1050],
    palm:          [400,  650],
    saturn:        [120,  200],
    spiral:        [500,  750],
    heart:         [600,  900],
    starburst:     [650,  950],
    spider:        [220,  360],
    crossette:     [260,  420],
    honeycomb:     [450,  700],
    pearl:         [350,  600],
    atom:          [280,  420],
    concentric:    [550,  800],
    rose:          [700, 1000],
    dud:           [ 80,  150],
};

export const SHAPE_STYLE: Record<string, { point: number; gravity: number; coast: number; tail: number; life: number }> = {
    peony:         { point: 0.45, gravity: 1.00, coast: 0.95, tail: 0.04, life: 0.98 },
    chrysanthemum: { point: 0.45, gravity: 0.95, coast: 1.12, tail: 0.78, life: 1.08 },
    dahlia:        { point: 0.85, gravity: 0.82, coast: 1.34, tail: 0.14, life: 1.12 },
    willow:        { point: 0.42, gravity: 1.70, coast: 0.68, tail: 0.98, life: 1.36 },
    brocade:       { point: 0.42, gravity: 1.42, coast: 0.78, tail: 0.80, life: 1.46 }, 
    palm:          { point: 0.48, gravity: 0.92, coast: 1.04, tail: 0.58, life: 1.08 },
    saturn:        { point: 0.55, gravity: 0.76, coast: 1.08, tail: 0.22, life: 1.00 },
    spiral:        { point: 0.46, gravity: 0.82, coast: 1.12, tail: 0.36, life: 1.02 },
    heart:         { point: 0.38, gravity: 0.88, coast: 0.96, tail: 0.06, life: 1.00 }, 
    starburst:     { point: 0.42, gravity: 0.72, coast: 1.62, tail: 0.72, life: 0.92 },
    spider:        { point: 0.68, gravity: 0.42, coast: 2.35, tail: 0.92, life: 0.90 },
    crossette:     { point: 0.38, gravity: 0.78, coast: 1.58, tail: 0.64, life: 0.86 },
    honeycomb:     { point: 0.48, gravity: 0.88, coast: 0.92, tail: 0.10, life: 0.96 },
    pearl:         { point: 0.45, gravity: 0.86, coast: 1.02, tail: 0.18, life: 0.92 },
    atom:          { point: 0.48, gravity: 0.78, coast: 1.12, tail: 0.26, life: 0.98 },
    concentric:    { point: 0.52, gravity: 0.86, coast: 0.98, tail: 0.12, life: 0.98 },
    rose:          { point: 0.48, gravity: 0.88, coast: 1.02, tail: 0.20, life: 1.04 },
    dud:           { point: 0.42, gravity: 1.35, coast: 0.48, tail: 0.35, life: 0.72 },
};

export function shapeCount(type: string): number {
    const r = SHAPE_COUNTS[type] ?? [500, 800];
    return Math.floor(r[0] + Math.random() * (r[1] - r[0]));
}

export function shapeStyle(type: string) {
    return SHAPE_STYLE[type] ?? SHAPE_STYLE.peony;
}

function rndSphere(r = 1): [number, number, number] {
  const theta = Math.random() * TAU;
  const phi = Math.acos(2 * Math.random() - 1);
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  ];
}

// ─── Shape Generators (calibrated to Qianshu v6 BURST_RADIUS = 36) ──────────

export function shapePeony(count: number, R = 36): Float32Array {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const phi   = Math.acos(1 - 2 * Math.random());
    const theta = Math.random() * TAU;
    const r     = R * Math.pow(0.18 + Math.random() * 0.82, 0.34);
    const wobble = 1.0 + (Math.random() - 0.5) * 0.09;
    a[i * 3]     = r * Math.sin(phi) * Math.cos(theta) * wobble;
    a[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * wobble;
    a[i * 3 + 2] = r * Math.cos(phi) * wobble;
  }
  return a;
}

export function shapeChrysanthemum(count: number, R = 36): Float32Array {
  const NUM_RAYS = 34, PPR = Math.max(1, Math.floor(count / NUM_RAYS));
  const a = new Float32Array(count * 3);
  let idx = 0;
  for (let ray = 0; ray < NUM_RAYS; ray++) {
    const u = (ray + Math.random() * 0.35) / NUM_RAYS;
    const phi = Math.acos(1 - 2 * u);
    const theta = Math.PI * (1 + Math.sqrt(5)) * ray + (Math.random() - 0.5) * 0.16;
    for (let p = 0; p < PPR && idx < count; p++) {
      const t = (p + 1) / PPR;
      const r = R * (0.30 + t * 0.74) * (0.96 + Math.random() * 0.08);
      a[idx * 3]     = r * Math.sin(phi) * Math.cos(theta) + (Math.random() - 0.5) * 0.7;
      a[idx * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) + (Math.random() - 0.5) * 0.7;
      a[idx * 3 + 2] = r * Math.cos(phi) + (Math.random() - 0.5) * 0.7;
      idx++;
    }
  }
  while (idx < count) {
    a[idx * 3] = 0; a[idx * 3 + 1] = 0; a[idx * 3 + 2] = 0;
    idx++;
  }
  return a;
}

export function shapeDahlia(count: number, R = 36): Float32Array {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const phi   = Math.acos(1 - 2 * Math.random());
    const theta = Math.random() * TAU;
    const r     = R * (0.72 + Math.random() * 0.38);
    const noise = 1.0 + (Math.random() - 0.5) * 0.12;
    a[i * 3]     = r * Math.sin(phi) * Math.cos(theta) * noise;
    a[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * noise;
    a[i * 3 + 2] = r * Math.cos(phi) * noise;
  }
  return a;
}

export function shapeWillow(count: number, R = 36): Float32Array {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * TAU;
    const t     = Math.pow(Math.random(), 0.48);
    const r     = (0.18 + t * 0.82) * R;
    a[i * 3]     = r * Math.cos(theta) * (0.18 + (1 - t) * 0.20);
    a[i * 3 + 1] = R * 0.12 - Math.pow(t, 1.55) * R * 1.82;
    a[i * 3 + 2] = r * Math.sin(theta) * (0.18 + (1 - t) * 0.20);
  }
  return a;
}

export function shapeBrocade(count: number, R = 36): Float32Array {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * TAU;
    const radial = Math.pow(Math.random(), 0.58);
    const r = R * (0.18 + radial * 0.82);
    const droop = Math.pow(radial, 1.7);
    const lift = (Math.random() - 0.5) * R * 0.08;
    a[i * 3]     = r * Math.cos(theta) * 0.62;
    a[i * 3 + 1] = R * (0.18 - droop * 1.28) + lift;
    a[i * 3 + 2] = r * Math.sin(theta) * 0.62;
  }
  return a;
}

export function shapePalm(count: number, R = 36): Float32Array {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * TAU;
    const r     = (0.28 + Math.random() * 0.72) * R;
    a[i * 3]     = r * Math.cos(theta) * 1.55;
    a[i * 3 + 1] = (Math.random() - 0.5) * R * 0.18;
    a[i * 3 + 2] = r * Math.sin(theta) * 1.55;
  }
  return a;
}

export function shapeSaturn(count: number, R = 36): Float32Array {
  const a = new Float32Array(count * 3);
  const coreCount = Math.floor(count * 0.2);
  for (let i = 0; i < count; i++) {
    if (i < coreCount) {
      const [x, y, z] = rndSphere(Math.random() * R * 0.25);
      a[i * 3] = x; a[i * 3 + 1] = y; a[i * 3 + 2] = z;
    } else {
      const theta = Math.random() * TAU;
      const r     = R * (0.72 + Math.random() * 0.38);
      a[i * 3]     = r * Math.cos(theta);
      a[i * 3 + 1] = (Math.random() - 0.5) * R * 0.035;
      a[i * 3 + 2] = r * Math.sin(theta);
    }
  }
  return a;
}

export function shapeSpiral(count: number, R = 36): Float32Array {
  const NUM_ARMS = 7, PPR = Math.floor(count / NUM_ARMS);
  const a = new Float32Array(count * 3);
  let idx = 0;
  for (let arm = 0; arm < NUM_ARMS; arm++) {
    const base = (arm / NUM_ARMS) * TAU;
    for (let p = 0; p < PPR && idx < count; p++) {
      const t = (p + 1) / PPR, angle = base + t * Math.PI * 0.88, r = t * R;
      a[idx * 3] = r * Math.cos(angle);
      a[idx * 3 + 1] = r * Math.sin(angle);
      a[idx * 3 + 2] = Math.sin(t * Math.PI * 4) * R * 0.2;
      idx++;
    }
  }
  while (idx < count) { a[idx * 3] = 0; a[idx * 3 + 1] = 0; a[idx * 3 + 2] = 0; idx++; }
  return a;
}

function inHeart(x: number, y: number) {
  const v = x * x + y * y - 1;
  return v * v * v <= x * x * y * y * y;
}

export function shapeHeart(count: number, R = 36): Float32Array {
  const a = new Float32Array(count * 3);
  let filled = 0, attempts = 0;
  while (filled < count && attempts < count * 20) {
    attempts++;
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 0.5;
    if (inHeart(x, y)) {
      const jitter = R * 0.012; // 极小的抖动保持边缘清晰
      a[filled * 3]     = x * R * 0.72 + (Math.random() - 0.5) * jitter;
      a[filled * 3 + 1] = y * R * 0.72 + (Math.random() - 0.5) * jitter;
      a[filled * 3 + 2] = (Math.random() - 0.5) * R * 0.05;
      filled++;
    }
  }
  for (let i = filled; i < count; i++) {
    a[i * 3] = 0; a[i * 3 + 1] = 0; a[i * 3 + 2] = 0;
  }
  return a;
}

export function shapeStarburst(count: number, R = 36): Float32Array {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * TAU;
    const v     = Math.pow(Math.abs(Math.cos(4 * theta)), 10);
    const r     = R * v * (0.55 + Math.random() * 0.45);
    const phi   = (Math.random() - 0.5) * 0.32;
    a[i * 3]     = r * Math.cos(theta) * Math.cos(phi);
    a[i * 3 + 1] = r * Math.sin(theta) * Math.cos(phi);
    a[i * 3 + 2] = r * Math.sin(phi);
  }
  return a;
}

export function shapeSpider(count: number, R = 36): Float32Array {
  const legs = 14;
  const perLeg = Math.max(1, Math.floor(count / legs));
  const a = new Float32Array(count * 3);
  let idx = 0;
  for (let leg = 0; leg < legs; leg++) {
    const theta = (leg / legs) * TAU + (Math.random() - 0.5) * 0.05;
    const phi = (Math.random() - 0.5) * 0.10;
    for (let i = 0; i < perLeg && idx < count; i++) {
      const t = (i + 1) / perLeg;
      const r = R * (0.18 + t * 1.08);
      a[idx * 3]     = r * Math.cos(theta) * Math.cos(phi);
      a[idx * 3 + 1] = r * Math.sin(theta) * Math.cos(phi);
      a[idx * 3 + 2] = r * Math.sin(phi);
      idx++;
    }
  }
  while (idx < count) {
    a[idx * 3] = 0; a[idx * 3 + 1] = 0; a[idx * 3 + 2] = 0; idx++;
  }
  return a;
}

export function shapeCrossette(count: number, R = 36): Float32Array {
  const branchCount = Math.max(4, Math.floor(count / 24));
  const a = new Float32Array(count * 3);
  let idx = 0;
  for (let branch = 0; branch < branchCount; branch++) {
    const baseTheta = (branch / branchCount) * TAU;
    const basePhi = (Math.random() - 0.5) * 0.26;
    const axes: [number, number, number][] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]];
    for (const axis of axes) {
      const t = 0.34 + Math.random() * 0.62;
      const spread = (Math.random() - 0.5) * R * 0.06;
      const stem = R * (0.22 + Math.random() * 0.20);
      const branchX = Math.cos(baseTheta) * stem * Math.cos(basePhi);
      const branchY = Math.sin(baseTheta) * stem * Math.cos(basePhi);
      const branchZ = Math.sin(basePhi) * stem;
      a[idx * 3]     = branchX + axis[0] * R * t + spread;
      a[idx * 3 + 1] = branchY + axis[1] * R * t + spread;
      a[idx * 3 + 2] = branchZ + axis[2] * R * t + spread;
      idx++;
      if (idx >= count) break;
    }
    if (idx >= count) break;
  }
  while (idx < count) {
    a[idx * 3] = 0; a[idx * 3 + 1] = 0; a[idx * 3 + 2] = 0; idx++;
  }
  return a;
}

export function shapeHoneycomb(count: number, R = 36): Float32Array {
  const s = R / 5.2, SQ3 = Math.sqrt(3);
  const raw: [number, number][] = [];
  for (let q = -7; q <= 7; q++)
    for (let r = -7; r <= 7; r++) {
      const x = s * 1.5 * q, y = s * (SQ3 * 0.5 * q + SQ3 * r);
      if (Math.hypot(x, y) <= R * 1.02) raw.push([x, y]);
    }
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = raw[i % raw.length];
    a[i * 3]     = p[0] + (Math.random() - 0.5) * 0.35;
    a[i * 3 + 1] = p[1] + (Math.random() - 0.5) * 0.35;
    a[i * 3 + 2] = (Math.random() - 0.5) * R * 0.09;
  }
  return a;
}

export function shapePearl(count: number, R = 36): Float32Array {
  const NUM_RAYS = 12, PEARLS = 8;
  const a = new Float32Array(count * 3);
  let idx = 0;
  for (let ray = 0; ray < NUM_RAYS; ray++) {
    const theta = (ray / NUM_RAYS) * TAU;
    const phi   = (Math.random() - 0.5) * 0.42;
    for (let p = 0; p < PEARLS && idx < count; p++) {
      const r = ((p + 1) / PEARLS) * R, jt = (Math.random() - 0.5) * 0.5;
      a[idx * 3]     = (r + jt) * Math.cos(theta) * Math.cos(phi);
      a[idx * 3 + 1] = (r + jt) * Math.sin(theta) * Math.cos(phi);
      a[idx * 3 + 2] = (r + jt) * Math.sin(phi);
      idx++;
    }
  }
  while (idx < count) {
    a[idx * 3] = 0; a[idx * 3 + 1] = 0; a[idx * 3 + 2] = 0; idx++;
  }
  return a;
}

export function shapeAtom(count: number, R = 36): Float32Array {
  const PER = Math.floor(count / 3);
  const a = new Float32Array(count * 3);
  let idx = 0;
  for (let i = 0; i < PER && idx < count; i++) {
    const t = (i / PER) * TAU;
    a[idx * 3] = R * Math.cos(t); a[idx * 3 + 1] = R * Math.sin(t); a[idx * 3 + 2] = 0;
    idx++;
  }
  for (let i = 0; i < PER && idx < count; i++) {
    const t = (i / PER) * TAU;
    a[idx * 3] = R * Math.cos(t); a[idx * 3 + 1] = 0; a[idx * 3 + 2] = R * Math.sin(t);
    idx++;
  }
  for (let i = 0; idx < count; i++) {
    const t = (i / Math.max(count - PER * 2, 1)) * TAU;
    a[idx * 3] = 0; a[idx * 3 + 1] = R * Math.cos(t); a[idx * 3 + 2] = R * Math.sin(t);
    idx++;
  }
  return a;
}

export function shapeConcentric(count: number, R = 36): Float32Array {
  const RINGS = 3, PPR = Math.floor(count / RINGS);
  const radii = [R * 0.33, R * 0.64, R * 1.00];
  const a = new Float32Array(count * 3);
  let idx = 0;
  for (let ring = 0; ring < RINGS; ring++) {
    const r = radii[ring];
    const n = ring === RINGS - 1 ? count - idx : PPR;
    for (let i = 0; i < n && idx < count; i++) {
      const t = (i / Math.max(n, 1)) * TAU;
      const j = (Math.random() - 0.5) * 0.45;
      a[idx * 3]     = (r + j) * Math.cos(t);
      a[idx * 3 + 1] = (r + j) * Math.sin(t);
      a[idx * 3 + 2] = (Math.random() - 0.5) * 0.4;
      idx++;
    }
  }
  while (idx < count) {
    a[idx * 3] = 0; a[idx * 3 + 1] = 0; a[idx * 3 + 2] = 0; idx++;
  }
  return a;
}

export function shapeRose(count: number, R = 36): Float32Array {
  const WRAPS = 5, K = 3;
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const theta = t * TAU * WRAPS;
    const rShape = Math.abs(Math.sin(K * theta));
    const r = Math.pow(t, 0.45) * R * rShape;
    a[i * 3]     = Math.cos(theta) * r;
    a[i * 3 + 1] = Math.sin(theta) * r;
    a[i * 3 + 2] = Math.sin(theta * 5.0) * r * 0.30;
  }
  return a;
}

export function shapeDud(count: number, R = 36): Float32Array {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = i / count;
    a[i * 3]     = (Math.random() - 0.5) * 1.8;
    a[i * 3 + 1] = t * R * 0.7;
    a[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
  }
  return a;
}

// ─── Shape Generator Dispatch (all 18 types) ────────────────────────────────
export const SHAPE_GEN: Record<string, (c: number, R?: number) => Float32Array> = {
  peony:         shapePeony,
  chrysanthemum: shapeChrysanthemum,
  dahlia:        shapeDahlia,
  willow:        shapeWillow,
  brocade:       shapeBrocade,
  palm:          shapePalm,
  saturn:        shapeSaturn,
  spiral:        shapeSpiral,
  heart:         shapeHeart,
  starburst:     shapeStarburst,
  spider:        shapeSpider,
  crossette:     shapeCrossette,
  honeycomb:     shapeHoneycomb,
  pearl:         shapePearl,
  atom:          shapeAtom,
  concentric:    shapeConcentric,
  rose:          shapeRose,
  dud:           shapeDud,
};

export function generateShape(type: string, count: number, origin = [0, 0, 0], R = 5.2): Float32Array {
  const gen = SHAPE_GEN[type] || shapePeony;
  const arr = gen(count, R);
  for (let i = 0; i < count; i++) {
    arr[i * 3]     += origin[0];
    arr[i * 3 + 1] += origin[1];
    arr[i * 3 + 2] += origin[2];
  }
  return arr;
}