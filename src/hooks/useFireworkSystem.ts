import { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { playDrum, getAudioContext } from '@/music/instruments';
import type { FireworkType } from '@/types/firework';
import { FireworkPool } from '../lib/gpu-engine/FireworkPool';

const STAR_VERT = `
uniform float uTime;
attribute float aPhase;
attribute float aSize;
varying float vAlpha;
void main() {
    vAlpha = 0.4 + 0.6 * abs(sin(uTime * aPhase));
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position  = projectionMatrix * mv;
    gl_PointSize = aSize * (200.0 / -mv.z);
}`;

const STAR_FRAG = `
varying float vAlpha;
void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    gl_FragColor = vec4(0.85, 0.90, 1.0, vAlpha * (0.5 - d) * 2.0);
}`;

export function useFireworkSystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const fireworkPoolRef = useRef<FireworkPool | null>(null);
  const starUniformsRef = useRef<{ uTime: { value: number } }>({ uTime: { value: 0 } });
  
  const audioInitializedRef = useRef(false);

  const initAudio = useCallback(async () => {
    if (!audioInitializedRef.current) {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      audioInitializedRef.current = true;
    }
  }, []);

  const playLaunchSound = useCallback(() => {
  }, []);

  const playExplosionSound = useCallback(() => {
    playDrum(1.0);
  }, []);

  const initWebGL = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    if (rendererRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1.0); // 强制 1:1 像素比，防止高分屏下点大小失控
    renderer.setClearColor(0x010102, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const fireworkPool = new FireworkPool(scene);
    fireworkPoolRef.current = fireworkPool;

    _initStarfield(scene, starUniformsRef.current);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.32, 0.4, 0.88
    );
    composer.addPass(bloomPass);

    const afterimagePass = new AfterimagePass();
    afterimagePass.uniforms['damp'].value = 0.82;
    composer.addPass(afterimagePass);

    renderer.setAnimationLoop(() => {
      const timeSec = performance.now() / 1000;
      starUniformsRef.current.uTime.value = timeSec;
      camera.position.x = Math.sin(timeSec * 0.05) * 1.5;
      camera.lookAt(0, 0, 0);
      fireworkPool.update(timeSec);
      composer.render();
    });

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
      composer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.setAnimationLoop(null);
      container.removeChild(renderer.domElement);
      renderer.dispose();
      rendererRef.current = null;
      sceneRef.current = null;
      cameraRef.current = null;
      fireworkPoolRef.current = null;
      audioInitializedRef.current = false;
    };
  }, []);

  const launch = useCallback((clientX: number, clientY: number, type: FireworkType) => {
    initAudio();
    if (!cameraRef.current || !fireworkPoolRef.current) return;

    // 强制升空至屏幕上方 1/3 区域 (clientY 限制在上方 1/3)
    const targetClientY = Math.min(clientY, window.innerHeight / 3.2);

    const ndcX = (clientX / window.innerWidth) * 2 - 1;
    const ndcY = -(targetClientY / window.innerHeight) * 2 + 1;

    fireworkPoolRef.current.fire(
      {
        type,
        x: ndcX,
        y: ndcY,
      },
      performance.now() / 1000,
      cameraRef.current
    );

    playLaunchSound();
    // 延迟 850ms 播放爆炸声，对齐 Shader 中的 launchDuration
    setTimeout(playExplosionSound, 850);
  }, [initAudio, playLaunchSound, playExplosionSound]);

  const autoLaunch = useCallback((type: FireworkType) => {
    // 扩大分布范围至 [0.08, 0.92]，并增加随机抖动，确保全屏均衡覆盖
    const spread = 0.08 + Math.random() * 0.84;
    const clientX = window.innerWidth * spread;
    const clientY = window.innerHeight * (0.22 + Math.random() * 0.12);
    launch(clientX, clientY, type);
  }, [launch]);

  useEffect(() => {
    const cleanup = initWebGL();
    return () => {
      if (cleanup) cleanup();
    };
  }, [initWebGL]);

  return {
    containerRef,
    launch,
    autoLaunch,
  };
}

function _initStarfield(scene: THREE.Scene, starUniforms: { uTime: { value: number } }) {
  const N = 6000;
  const pos   = new Float32Array(N * 3);
  const phase = new Float32Array(N);
  const size  = new Float32Array(N);

  for (let i = 0; i < N; i++) {
    const r = 400 + Math.random() * 200;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3]     = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pos[i * 3 + 2] = r * Math.cos(ph);
    phase[i]       = 0.2 + Math.random() * 1.8;
    size[i]        = 0.8 + Math.random() * 1.4;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aPhase',   new THREE.BufferAttribute(phase, 1));
  geo.setAttribute('aSize',    new THREE.BufferAttribute(size, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms:       starUniforms,
    vertexShader:   STAR_VERT,
    fragmentShader: STAR_FRAG,
    blending:       THREE.AdditiveBlending,
    depthWrite:     false,
    transparent:    true,
  });

  const stars = new THREE.Points(geo, mat);
  stars.frustumCulled = false;
  scene.add(stars);
}