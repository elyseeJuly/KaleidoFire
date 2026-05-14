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

  // Celebration Mode (Simultaneous multi-launch for better atmosphere)
  useEffect(() => {
    if (isAutoLaunch) {
      autoLaunchTimerRef.current = setInterval(() => {
        // 每轮随机燃放 2-3 朵烟花，营造盛典齐放的效果
        const batchSize = Math.floor(Math.random() * 2) + 2; 
        
        for (let i = 0; i < batchSize; i++) {
          // 在极短的随机延迟内发射，增加动态层次感
          setTimeout(() => {
            const randomType = VALID_TYPES[Math.floor(Math.random() * VALID_TYPES.length)];
            autoLaunch(randomType);
          }, i * 150); // 每朵之间间隔 150ms，避免完全重合
        }
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
