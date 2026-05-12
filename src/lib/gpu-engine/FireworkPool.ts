import * as THREE from 'three';
import { generateShape, shapeCount, shapeStyle } from './shapes';
import { samplePalette, getRandomPaletteName } from './palettes';

// ── Vertex Shader ─────────────────────────────────────────────────────────
const BURST_VERT = `
precision highp float;

attribute vec3  aOrigin;      // world-space spawn position
attribute vec3  aTarget;      // phase-1 destination (CPU shape)
attribute vec3  aMorphTarget; // phase-2 destination (morph shape, or copy of aTarget)
attribute vec4  aTiming;      // x=birthSec, y=lifespan, z=morphFraction(0=no morph), w=rndSeed
attribute vec4  aColor;       // rgba
attribute vec4  aStyle;       // x=point, y=gravity, z=coast, w=tail

uniform float uTime;
uniform vec2  uGlobalWind;
uniform float uDamping;

varying vec3  vColor;
varying float vLife;
varying float vAlpha;
varying float vTail;

void main() {
    float life     = uTime - aTiming.x;
    float lifespan = aTiming.y;

    if (lifespan < 0.001 || life < 0.0 || life > lifespan) {
        vAlpha       = 0.0;
        gl_Position  = vec4(9999.0, 9999.0, 9999.0, 1.0);
        gl_PointSize = 0.0;
        return;
    }

    float nLife = clamp(life / lifespan, 0.0, 1.0);
    float morphFrac = aTiming.z;

    vec3 shellV;
    if (morphFrac > 0.001 && nLife > morphFrac) {
        float t2 = (nLife - morphFrac) / (1.0 - morphFrac);
        shellV = mix(aTarget, aMorphTarget, t2) - aOrigin; 
    } else {
        shellV = aTarget - aOrigin;
    }

    float R = length(shellV);
    vec3 dir = R > 0.001 ? shellV / R : vec3(0.0, 1.0, 0.0);

    float bFrac   = clamp(0.0333 / lifespan, 0.0005, 0.04);
    float bt      = clamp(nLife / bFrac, 0.0, 1.0);
    float burst   = bt < 1.0 ? pow(bt, 0.06) : 1.0;

    float coastScale = max(aStyle.z, 0.25);
    float k_drag   = mix(6.32, 1.83, smoothstep(0.0, 0.5, nLife)) / coastScale;
    
    float v0_drift = 0.80 + aTiming.w * 0.40;           
    float drift    = v0_drift * (1.0 - exp(-k_drag * life)) / k_drag;
    float maxDrift = v0_drift / 6.32;
    float extraR   = R * 0.10 * coastScale * clamp(drift / max(maxDrift, 0.001), 0.0, 1.0);

    vec3 pos = aOrigin + dir * (R + extraR) * burst;

    float realT    = nLife * lifespan;
    float gravDrop = (0.03 * realT * realT +
                      (0.08 / (3.0 * lifespan)) * realT * realT * realT) * 22.0;
    pos.y -= gravDrop * aStyle.y * burst;

    pos.x += uGlobalWind.x * nLife * 1.8;
    pos.z += uGlobalWind.y * nLife * 1.8;

    float wx = sin(aTiming.w * 6.283 + life * 0.9) * 0.12 * nLife * nLife;
    float wz = cos(aTiming.w * 3.141 + life * 0.6) * 0.09 * nLife * nLife;
    pos.x += wx;
    pos.z += wz;

    float decayT = max(0.0, (nLife - bFrac) / max(1.0 - bFrac, 0.001));
    float fadeIn  = smoothstep(0.0, bFrac * 0.6, nLife);
    float alphaD  = pow(max(0.0, 1.0 - decayT), 2.2);
    vAlpha        = alphaD * fadeIn * (0.72 + aTiming.w * 0.28) * aColor.a;

    vec3 white     = vec3(1.00, 0.97, 0.94);
    vec3 primary   = aColor.rgb;
    vec3 orangeRed = vec3(0.88, 0.24, 0.04);
    vec3 dark      = vec3(0.10, 0.02, 0.01);

    vec3 col  = mix(white,     primary,   smoothstep(0.00, 0.08, nLife));
    col       = mix(col,       orangeRed, smoothstep(0.55, 0.82, nLife));
    col       = mix(col,       dark,      smoothstep(0.86, 1.00, nLife));
    vColor    = col;
    vTail     = aStyle.w * smoothstep(0.06, 0.34, nLife);

    float tailBoost = 1.0 + vTail * 1.15;
    float ptSz = max(0.8, mix(6.5, 1.1, nLife) * (0.60 + aTiming.w * 0.70) * aStyle.x * tailBoost);
    vec4  mv   = modelViewMatrix * vec4(pos, 1.0);
    gl_Position  = projectionMatrix * mv;
    gl_Position.z -= 0.1;
    gl_PointSize = ptSz * (280.0 / max(-mv.z, 0.5));
}
`;

// ── Fragment Shader ───────────────────────────────────────────────────────
const BURST_FRAG = `
precision mediump float;
varying vec3  vColor;
varying float vAlpha;
varying float vTail;
void main() {
    vec2  c    = gl_PointCoord - 0.5;
    float tail = clamp(vTail, 0.0, 1.0);
    vec2  oval = vec2(c.x, c.y * mix(1.0, 0.24, tail));
    float d    = length(oval);
    if (d > 0.5) discard;
    float core      = 1.0 - smoothstep(0.00, 0.16, d);
    float glow      = 1.0 - smoothstep(0.16, 0.50, d);
    float tailFalloff = mix(1.0, smoothstep(0.54, -0.36, c.y), tail);
    float intensity = (core * 0.78 + glow * 0.20) * tailFalloff;
    gl_FragColor    = vec4(vColor * (1.0 + core * 2.2), vAlpha * intensity);
}
`;

const MAX_BURSTS = 10;
const PARTICLES_HIGH = 80000; // Can be used when extending module limits
const DEFAULT_LIFESPAN = 4.5;

interface Slot {
  geo: THREE.BufferGeometry;
  mat: THREE.ShaderMaterial;
  points: THREE.Points;
  active: boolean;
  birthSec: number;
  lifespan: number;
  maxPtcl: number;
}

export interface FireEventConfig {
  type: string;
  count?: number; 
  x: number;      // NDC X (-1 to 1)
  y: number;      // NDC Y (-1 to 1)
  palette?: string;
  morphConfig?: {
    shapeType: string;
    morphFraction?: number;
  };
  wind?: [number, number];
  damping?: number;
}

export class FireworkPool {
  scene: THREE.Scene;
  slots: Slot[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    for (let i = 0; i < MAX_BURSTS; i++) {
        this._createSlot(PARTICLES_HIGH);
    }
  }

  _createSlot(maxPtcl: number) {
    const geo = new THREE.BufferGeometry();

    const mk = (n: number, itemSize: number, dynamic = true) => {
      const buf = new THREE.BufferAttribute(new Float32Array(n * itemSize), itemSize);
      if (dynamic) buf.setUsage(THREE.DynamicDrawUsage);
      return buf;
    };

    geo.setAttribute('position', mk(maxPtcl, 3, false));
    geo.setAttribute('aOrigin', mk(maxPtcl, 3));
    geo.setAttribute('aTarget', mk(maxPtcl, 3));
    geo.setAttribute('aMorphTarget', mk(maxPtcl, 3));
    geo.setAttribute('aTiming', mk(maxPtcl, 4));
    geo.setAttribute('aColor', mk(maxPtcl, 4));
    geo.setAttribute('aStyle', mk(maxPtcl, 4));

    const posArr = geo.attributes.position.array;
    for (let i = 0; i < maxPtcl; i++) {
      posArr[i * 3] = i / maxPtcl;
      posArr[i * 3 + 1] = 0;
      posArr[i * 3 + 2] = 0;
    }

    geo.setDrawRange(0, 0);

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uGlobalWind: { value: new THREE.Vector2(0, 0) },
        uDamping: { value: 2.4 },
      },
      vertexShader: BURST_VERT,
      fragmentShader: BURST_FRAG,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    });

    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    points.visible = false;
    this.scene.add(points);

    this.slots.push({ geo, mat, points, active: false, birthSec: 0, lifespan: DEFAULT_LIFESPAN, maxPtcl });
  }

  // ── Extendable interface ──────────────────────────────────────────────────
  fire(config: FireEventConfig, timeSec: number, camera: THREE.Camera) {
    const count = config.count || shapeCount(config.type);
    const style = shapeStyle(config.type);
    const slot = this._getSlot(count);
    if (!slot) return;

    const origin = this._ndcToWorld([config.x, config.y], camera);
    const ox = origin.x, oy = origin.y, oz = origin.z;

    const targets = generateShape(config.type, count, [ox, oy, oz]);

    let morphTargets = null;
    let morphFrac = 0;
    if (config.morphConfig) {
      morphTargets = generateShape(config.morphConfig.shapeType, count, [ox, oy, oz]);
      morphFrac = config.morphConfig.morphFraction ?? 0.5;
    }

    const aOrigin = slot.geo.attributes.aOrigin.array;
    const aTarget = slot.geo.attributes.aTarget.array;
    const aMorphTarget = slot.geo.attributes.aMorphTarget.array;
    const aTiming = slot.geo.attributes.aTiming.array;
    const aColor = slot.geo.attributes.aColor.array;
    const aStyle = slot.geo.attributes.aStyle.array;

    const lifespan = (DEFAULT_LIFESPAN + (Math.random() - 0.5) * 0.4) * style.life;
    const paletteKey = config.palette || getRandomPaletteName();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3, i4 = i * 4;
      const rnd = Math.random();

      // Origin jitter
      aOrigin[i3] = ox + (Math.random() - 0.5) * 0.15;
      aOrigin[i3 + 1] = oy + (Math.random() - 0.5) * 0.15;
      aOrigin[i3 + 2] = oz + (Math.random() - 0.5) * 0.15;

      // Phase 1 target
      aTarget[i3] = targets[i3];
      aTarget[i3 + 1] = targets[i3 + 1];
      aTarget[i3 + 2] = targets[i3 + 2];

      if (morphTargets) {
        aMorphTarget[i3] = morphTargets[i3];
        aMorphTarget[i3 + 1] = morphTargets[i3 + 1];
        aMorphTarget[i3 + 2] = morphTargets[i3 + 2];
      } else {
        aMorphTarget[i3] = aTarget[i3];
        aMorphTarget[i3 + 1] = aTarget[i3 + 1];
        aMorphTarget[i3 + 2] = aTarget[i3 + 2];
      }

      aTiming[i4] = timeSec;
      aTiming[i4 + 1] = lifespan + (Math.random() - 0.5) * 0.6;
      aTiming[i4 + 2] = morphFrac;
      aTiming[i4 + 3] = rnd;

      const [r, g, b] = samplePalette(paletteKey);
      const brightness = 0.7 + rnd * 0.55;
      aColor[i4] = r * brightness;
      aColor[i4 + 1] = g * brightness;
      aColor[i4 + 2] = b * brightness;
      aColor[i4 + 3] = 0.82 + Math.random() * 0.18;

      aStyle[i4] = style.point * (0.90 + Math.random() * 0.26);
      aStyle[i4 + 1] = style.gravity * (0.92 + Math.random() * 0.16);
      aStyle[i4 + 2] = style.coast * (0.92 + Math.random() * 0.18);
      aStyle[i4 + 3] = style.tail * (0.86 + Math.random() * 0.26);
    }

    for (const key of ['aOrigin', 'aTarget', 'aMorphTarget', 'aTiming', 'aColor', 'aStyle']) {
      slot.geo.attributes[key].needsUpdate = true;
    }
    slot.geo.setDrawRange(0, count);

    slot.mat.uniforms.uTime.value = timeSec;
    if (config.wind) {
        slot.mat.uniforms.uGlobalWind.value.set(config.wind[0], config.wind[1]);
    }
    if (config.damping !== undefined) {
        slot.mat.uniforms.uDamping.value = config.damping;
    }

    slot.points.visible = true;
    slot.active = true;
    slot.birthSec = timeSec;
    slot.lifespan = lifespan + 0.7; // Buffer
  }

  update(timeSec: number, globalWind?: [number, number]) {
    for (const slot of this.slots) {
      if (!slot.active) continue;
      slot.mat.uniforms.uTime.value = timeSec;
      
      if (globalWind) {
        slot.mat.uniforms.uGlobalWind.value.set(globalWind[0], globalWind[1]);
      }

      if (timeSec - slot.birthSec > slot.lifespan) {
        slot.active = false;
        slot.points.visible = false;
        slot.geo.setDrawRange(0, 0);
      }
    }
  }

  // Gets the best available slot in the pool
  _getSlot(count: number): Slot | null {
    let best = null, oldestBirth = Infinity;
    for (const s of this.slots) {
      if (!s.active && s.maxPtcl >= count) return s;
      if (s.active && s.maxPtcl >= count && s.birthSec < oldestBirth) {
        oldestBirth = s.birthSec;
        best = s;
      }
    }
    return best;
  }

  // Maps NDC coordinates to world space depth, fixed distance for bloom aesthetic
  _ndcToWorld(ndc: [number, number], camera: THREE.Camera): THREE.Vector3 {
    const vec = new THREE.Vector3(ndc[0], ndc[1], 0.5);
    vec.unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const dist = 12; // Base visual distance
    return camera.position.clone().addScaledVector(dir, dist);
  }
}
