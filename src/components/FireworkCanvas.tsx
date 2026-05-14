import { useEffect, useRef, useCallback } from 'react';
import { useFireworkSystem } from '@/hooks/useFireworkSystem';
import type { FireworkType } from '@/types/firework';

interface FireworkCanvasProps {
  currentType: FireworkType;
  isAutoLaunch: boolean;
  autoLaunchInterval: number;
}

const VALID_TYPES: FireworkType[] = [
  'chrysanthemum', 'willow', 'saturn', 'heart', 'spiral', 
  'starburst', 'honeycomb', 'atom', 'peony', 'crossette',
  'dahlia', 'brocade', 'palm', 'spider', 'pearl', 
  'concentric', 'rose'
];

export function FireworkCanvas({ 
  currentType, 
  isAutoLaunch, 
  autoLaunchInterval,
}: FireworkCanvasProps) {
  const { containerRef, launch, autoLaunch } = useFireworkSystem();
  const autoLaunchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    launch(e.clientX, e.clientY, currentType);
  }, [launch, currentType]);

  // Celebration Mode (Auto launch with true randomness)
  useEffect(() => {
    if (isAutoLaunch) {
      autoLaunchTimerRef.current = setInterval(() => {
        // 在盛典模式下，随机选取一种精美样态（排除哑弹）
        const randomType = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)];
        autoLaunch(randomType);
      }, autoLaunchInterval);
    } else {
      if (autoLaunchTimerRef.current) {
        clearInterval(autoLaunchTimerRef.current);
        autoLaunchTimerRef.current = null;
      }
    }

    return () => {
      if (autoLaunchTimerRef.current) {
        clearInterval(autoLaunchTimerRef.current);
      }
    };
  }, [isAutoLaunch, autoLaunchInterval, autoLaunch]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handleClick}
      className="absolute inset-0 cursor-crosshair overflow-hidden z-10"
      style={{ background: 'radial-gradient(ellipse at bottom, #0a0a1a 0%, #000000 70%)' }}
    />
  );
}
