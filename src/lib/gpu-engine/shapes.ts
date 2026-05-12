// src/lib/gpu-engine/shapes.ts — CPU-side 3D topology generators

const TAU = Math.PI * 2;

export const SHAPE_COUNTS: Record<string, [number, number]> = {
    peony:         [800, 1200],
    chrysanthemum: [600,  900],
    willow:        [400,  700],
    saturn:        [120,  200],
    heart:         [600,  900],
    starburst:     [650,  950],
    crossette:     [260,  420],
    beehive:       [450,  700],
    cascade:       [350,  600],
    atomic:        [280,  420],
    vortex:        [500,  750],
    smiley:        [300,  500], 
};

export const SHAPE_STYLE: Record<string, { point: number; gravity: number; coast: number; tail: number; life: number }> = {
    peony:         { point: 0.88, gravity: 1.00, coast: 0.95, tail: 0.04, life: 0.98 },
    chrysanthemum: { point: 0.78, gravity: 0.95, coast: 1.12, tail: 0.78, life: 1.08 },
    willow:        { point: 0.78, gravity: 1.70, coast: 0.68, tail: 0.98, life: 1.36 },
    saturn:        { point: 0.92, gravity: 0.76, coast: 1.08, tail: 0.22, life: 1.00 },
    heart:         { point: 0.86, gravity: 0.88, coast: 0.96, tail: 0.06, life: 1.00 },
    starburst:     { point: 0.74, gravity: 0.72, coast: 1.62, tail: 0.72, life: 0.92 },
    crossette:     { point: 0.66, gravity: 0.78, coast: 1.58, tail: 0.64, life: 0.86 },
    beehive:       { point: 0.78, gravity: 0.88, coast: 0.92, tail: 0.10, life: 0.96 },
    cascade:       { point: 1.18, gravity: 0.86, coast: 1.02, tail: 0.18, life: 0.92 },
    atomic:        { point: 0.82, gravity: 0.78, coast: 1.12, tail: 0.26, life: 0.98 },
    vortex:        { point: 0.82, gravity: 0.82, coast: 1.12, tail: 0.36, life: 1.02 },
    smiley:        { point: 0.90, gravity: 0.90, coast: 1.00, tail: 0.10, life: 1.00 },
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

export function shapePeony(count: number, R = 5.5): Float32Array {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = R * (0.65 + Math.random() * 0.35);
    const [x, y, z] = rndSphere(r);
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

export function shapeChrysanthemum(count: number, R = 5.5): Float32Array {
  const a = new Float32Array(count * 3);
  const NC = 20;
  const clusters = Array.from({ length: NC }, () =>
    rndSphere(R * (0.8 + Math.random() * 0.2))
  );
  const spread = R * 0.14;
  for (let i = 0; i < count; i++) {
    const c = clusters[i % NC];
    a[i * 3] = c[0] + (Math.random() - 0.5) * spread;
    a[i * 3 + 1] = c[1] + (Math.random() - 0.5) * spread;
    a[i * 3 + 2] = c[2] + (Math.random() - 0.5) * spread;
  }
  return a;
}

export function shapeWillow(count: number, H = 7): Float32Array {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = Math.random();
    const theta = Math.random() * TAU;
    const r = t * 3.5;
    a[i * 3] = r * Math.cos(theta);
    a[i * 3 + 1] = H * (1 - t * 0.55) + (Math.random() - 0.5);
    a[i * 3 + 2] = r * Math.sin(theta);
  }
  return a;
}

export function shapeSaturn(count: number, Rring = 7, Rcore = 2, tilt = 0.42): Float32Array {
  const a = new Float32Array(count * 3);
  const nc = Math.floor(count * 0.2);
  const ct = Math.cos(tilt),
    st = Math.sin(tilt);
  for (let i = 0; i < count; i++) {
    let x, y, z;
    if (i < nc) {
      [x, y, z] = rndSphere(Rcore * (0.4 + Math.random() * 0.6));
    } else {
      const ang = Math.random() * TAU;
      const r = Rring * (0.7 + Math.random() * 0.3);
      const rx = r * Math.cos(ang),
        ry = (Math.random() - 0.5) * 0.4,
        rz = r * Math.sin(ang);
      x = rx;
      y = ry * ct - rz * st;
      z = ry * st + rz * ct;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function inHeart(x: number, y: number) {
  const v = x * x + y * y - 1;
  return v * v * v <= x * x * y * y * y;
}
export function shapeHeart(count: number, S = 5): Float32Array {
  const a = new Float32Array(count * 3);
  let filled = 0,
    attempts = 0;
  while (filled < count && attempts < count * 20) {
    attempts++;
    const x = Math.random() * 2 - 1;
    const y = Math.random() * 2 - 0.5;
    if (inHeart(x, y)) {
      a[filled * 3] = x * S;
      a[filled * 3 + 1] = y * S;
      a[filled * 3 + 2] = (Math.random() - 0.5) * 1.5;
      filled++;
    }
  }
  for (let i = filled; i < count; i++) {
    a[i * 3] = 0;
    a[i * 3 + 1] = 0;
    a[i * 3 + 2] = 0;
  }
  return a;
}

export function shapeSwirl(count: number, R = 6, wraps = 4): Float32Array {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = Math.random();
    const theta = t * TAU * wraps;
    const r = R * Math.pow(t, 0.6);
    a[i * 3] = r * Math.cos(theta);
    a[i * 3 + 1] = (Math.random() - 0.5) * 3 * (1 - t);
    a[i * 3 + 2] = r * Math.sin(theta);
  }
  return a;
}

export function shapeSmiley(count: number, S = 5): Float32Array {
  const a = new Float32Array(count * 3);
  const perEye = Math.floor(count * 0.33);
  const mouthN = count - perEye * 2;
  let idx = 0;
  for (let e = 0; e < 2; e++) {
    const ex = e === 0 ? -0.42 : 0.42;
    for (let i = 0; i < perEye; i++) {
      const ang = Math.random() * TAU;
      const r = 0.18 * Math.sqrt(Math.random());
      a[idx * 3] = (ex + r * Math.cos(ang)) * S;
      a[idx * 3 + 1] = (0.28 + r * Math.sin(ang)) * S;
      a[idx * 3 + 2] = (Math.random() - 0.5) * 0.4;
      idx++;
    }
  }
  for (let i = 0; i < mouthN; i++) {
    const ang = ((200 + Math.random() * 140) * Math.PI) / 180;
    const r = 0.48 + (Math.random() - 0.5) * 0.06;
    a[idx * 3] = r * Math.cos(ang) * S;
    a[idx * 3 + 1] = (-0.06 + r * Math.sin(ang) * 0.6) * S;
    a[idx * 3 + 2] = (Math.random() - 0.5) * 0.4;
    idx++;
  }
  return a;
}

export function shapeStarburst(count: number, spikes = 10, L = 8): Float32Array {
  const a = new Float32Array(count * 3);
  const dirs = Array.from({ length: spikes }, (_, s) => {
    const phi = Math.acos(1 - 2 * (s + 0.5) / spikes);
    const th = Math.PI * (3 - Math.sqrt(5)) * s;
    return [
      Math.sin(phi) * Math.cos(th),
      Math.sin(phi) * Math.sin(th),
      Math.cos(phi),
    ];
  });
  for (let i = 0; i < count; i++) {
    const d = dirs[i % spikes];
    const t = Math.random();
    const sp = 0.25 * (1 - t);
    a[i * 3] = d[0] * t * L + (Math.random() - 0.5) * sp;
    a[i * 3 + 1] = d[1] * t * L + (Math.random() - 0.5) * sp;
    a[i * 3 + 2] = d[2] * t * L + (Math.random() - 0.5) * sp;
  }
  return a;
}

export function shapeHoneycomb(count: number, layers = 4, cell = 1.3): Float32Array {
  const a = new Float32Array(count * 3);
  const pts: [number, number][] = [];
  for (let q = -layers; q <= layers; q++)
    for (let r = -layers; r <= layers; r++)
      if (Math.abs(q + r) <= layers)
        pts.push([cell * (q + r * 0.5), cell * (r * Math.sqrt(3) / 2)]);
  const DL = 5;
  for (let i = 0; i < count; i++) {
    const p = pts[Math.floor(Math.random() * pts.length)];
    const d = (Math.floor(Math.random() * DL) - DL / 2) * cell;
    a[i * 3] = p[0] + (Math.random() - 0.5) * cell * 0.06;
    a[i * 3 + 1] = d + (Math.random() - 0.5) * cell * 0.06;
    a[i * 3 + 2] = p[1] + (Math.random() - 0.5) * cell * 0.06;
  }
  return a;
}

export function shapeWaterfall(count: number): Float32Array {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const sx = (Math.random() - 0.5) * 2;
    const sz = (Math.random() - 0.5) * 2;
    a[i * 3] = sx * 1.5 + (Math.random() - 0.5);
    a[i * 3 + 1] = 4 - Math.random() * 10;
    a[i * 3 + 2] = sz * 1.5;
  }
  return a;
}

export function shapeAtom(count: number, R = 5): Float32Array {
  const a = new Float32Array(count * 3);
  const pO = Math.floor(count / 3);
  const orbs = [
    [
      [1, 0, 0],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 0, 1],
    ],
    [
      [1, 0, 0],
      [0, 1, 0],
    ],
  ];
  for (let o = 0; o < 3; o++) {
    const [u, v] = orbs[o];
    const s = o * pO,
      e = o === 2 ? count : s + pO;
    for (let i = s; i < e; i++) {
      const th = ((i - s) / (e - s)) * TAU + Math.random() * 0.05;
      const r = R * (1 + (Math.random() - 0.5) * 0.04);
      a[i * 3] = r * (Math.cos(th) * u[0] + Math.sin(th) * v[0]);
      a[i * 3 + 1] = r * (Math.cos(th) * u[1] + Math.sin(th) * v[1]);
      a[i * 3 + 2] = r * (Math.cos(th) * u[2] + Math.sin(th) * v[2]);
    }
  }
  return a;
}

export function shapeRose(count: number, k = 5, wraps = 3, Rmax = 6): Float32Array {
  const a = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = Math.pow(Math.random(), 0.5);
    const theta = t * TAU * wraps;
    const rSh = Math.abs(Math.sin(k * theta));
    const r = rSh * Rmax * Math.pow(t, 0.45);
    const phi = theta * 0.5;
    const sp = Math.sin(phi),
      cp = Math.cos(phi);
    const st = Math.sin(theta),
      ct2 = Math.cos(theta);
    a[i * 3] = r * sp * ct2;
    a[i * 3 + 1] = r * cp;
    a[i * 3 + 2] = r * sp * st + Math.sin(theta * 5.0) * (r * 0.3);
  }
  return a;
}

// Map frontend firework simulator types to our shape generator
export const SHAPE_GEN: Record<string, (c: number) => Float32Array> = {
  chrysanthemum: shapeChrysanthemum,
  peony: shapePeony,
  willow: shapeWillow,
  saturn: shapeSaturn,
  heart: shapeHeart,
  vortex: shapeSwirl,     // 'vortex'
  smiley: shapeSmiley,
  starburst: shapeStarburst,
  beehive: shapeHoneycomb, // 'beehive'
  cascade: shapeWaterfall, // 'cascade'
  atomic: shapeAtom,
  crossette: shapeRose,    // 'crossette' maps to rose
};

export function generateShape(type: string, count: number, origin = [0, 0, 0]): Float32Array {
  const gen = SHAPE_GEN[type] || shapePeony;
  const arr = gen(count);
  for (let i = 0; i < count; i++) {
    arr[i * 3] += origin[0];
    arr[i * 3 + 1] += origin[1];
    arr[i * 3 + 2] += origin[2];
  }
  return arr;
}
