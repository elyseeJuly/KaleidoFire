import { useEffect, useRef, useCallback } from 'react';
import { useFireworkSystem } from '@/hooks/useFireworkSystem';
import type { FireworkType } from '@/types/firework';
import { getGlobalMusicEngine, type FireworkSyncEvent, type GameMode } from '@/music';

interface FireworkCanvasProps {
  currentType: FireworkType;
  isAutoLaunch: boolean;
  autoLaunchInterval: number;
  musicEnabled: boolean;
  gameMode: GameMode;
}

export function FireworkCanvas({ 
  currentType, 
  isAutoLaunch, 
  autoLaunchInterval,
  musicEnabled,
  gameMode,
}: FireworkCanvasProps) {
  const { containerRef, launch, autoLaunch } = useFireworkSystem();
  const autoLaunchTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const musicEngineRef = useRef(getGlobalMusicEngine());

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // 如果音乐启用，通过音乐引擎处理交互
    if (musicEnabled) {
      musicEngineRef.current.handleInteraction({
        type: 'tap',
        x: e.clientX,
        y: e.clientY,
      });
    } else {
      launch(e.clientX, e.clientY, currentType);
    }
  }, [launch, currentType, musicEnabled]);

  // 处理音乐同步的烟花事件
  useEffect(() => {
    const musicEngine = musicEngineRef.current;
    
    // 设置游戏模式
    musicEngine.setMode(gameMode);
    
    if (!musicEnabled) return;

    // 注册烟花同步回调
    const unsubscribe = musicEngine.onFireworkSync((event: FireworkSyncEvent) => {
      const x = event.x * window.innerWidth;
      const targetY = event.y * window.innerHeight;
      
      // 使用音乐事件指定的烟花类型
      launch(x, targetY, event.fireworkType);
    });

    return () => {
      unsubscribe();
    };
  }, [launch, gameMode, musicEnabled]);

  // 启动/停止音乐引擎
  useEffect(() => {
    const musicEngine = musicEngineRef.current;
    
    if (musicEnabled) {
      musicEngine.start();
    } else {
      musicEngine.stop();
    }
  }, [musicEnabled]);

  // Auto launch (only when music is disabled)
  useEffect(() => {
    if (isAutoLaunch && !musicEnabled) {
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
  }, [isAutoLaunch, autoLaunchInterval, autoLaunch, currentType, musicEnabled]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handleClick}
      className="absolute inset-0 cursor-crosshair overflow-hidden z-10"
      style={{ background: 'radial-gradient(ellipse at bottom, #0a0a1a 0%, #000000 70%)' }}
    />
  );
}
