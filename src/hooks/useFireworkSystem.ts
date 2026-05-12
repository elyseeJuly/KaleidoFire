import { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { playDrum, getAudioContext } from '@/music/instruments';
import type { FireworkType } from '@/types/firework';
import { FireworkPool } from '../lib/gpu-engine/FireworkPool';

export function useFireworkSystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const fireworkPoolRef = useRef<FireworkPool | null>(null);
  
  const audioInitializedRef = useRef(false);

  // Initialize audio
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
    // 简易发射音效可在此处实现，目前留空以保持纯净
  }, []);

  const playExplosionSound = useCallback(() => {
    playDrum(1.0);
  }, []);

  // Initialize Three.js
  const initWebGL = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    if (rendererRef.current) return; // already initialized

    const width = window.innerWidth;
    const height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Add canvas to container
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 20;
    cameraRef.current = camera;

    const fireworkPool = new FireworkPool(scene);
    fireworkPoolRef.current = fireworkPool;

    // Post processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.32, 0.42, 0.18
    );
    composer.addPass(bloomPass);

    const afterimagePass = new AfterimagePass();
    afterimagePass.uniforms['damp'].value = 0.88;
    composer.addPass(afterimagePass);

    // Animation Loop
    renderer.setAnimationLoop(() => {
      const timeSec = performance.now() / 1000;
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

  // Launch firework
  const launch = useCallback((clientX: number, clientY: number, type: FireworkType) => {
    initAudio();
    if (!cameraRef.current || !fireworkPoolRef.current) return;

    // Convert mouse/tap coordinates to NDC
    const ndcX = (clientX / window.innerWidth) * 2 - 1;
    const ndcY = -(clientY / window.innerHeight) * 2 + 1;

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
    setTimeout(playExplosionSound, 300); // Simulate rocket travel delay
  }, [initAudio, playLaunchSound, playExplosionSound]);

  // Auto launch
  const autoLaunch = useCallback((type: FireworkType) => {
    // Generate random screen positions but keep them visually pleasing (not edge bounds)
    const clientX = window.innerWidth * (0.2 + Math.random() * 0.6);
    const clientY = window.innerHeight * (0.1 + Math.random() * 0.4);
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
