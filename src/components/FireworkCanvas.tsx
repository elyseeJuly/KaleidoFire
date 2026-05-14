import { useEffect, useRef, useCallback } from 'react';
import { useFireworkSystem } from '@/hooks/useFireworkSystem';
import type { FireworkType } from '@/types/firework';

interface FireworkCanvasProps {
  currentType: FireworkType;
  isAutoLaunch: boolean;
  autoLaunchInterval: number;
}

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

  // Celebration Mode (Auto launch)
  useEffect(() => {
    if (isAutoLaunch) {
      autoLaunchTimerRef.current = setInterval(() => {
        autoLaunch(currentType);
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
  }, [isAutoLaunch, autoLaunchInterval, autoLaunch, currentType]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handleClick}
      className="absolute inset-0 cursor-crosshair overflow-hidden z-10"
      style={{ background: 'radial-gradient(ellipse at bottom, #0a0a1a 0%, #000000 70%)' }}
    />
  );
}
