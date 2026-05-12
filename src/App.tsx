import { useState, useEffect, useCallback } from 'react';
import { FireworkCanvas } from '@/components/FireworkCanvas';
import { ControlPanel } from '@/components/ControlPanel';
import { BreathRing } from '@/components/BreathRing';
import { Title } from '@/components/Title';
import type { FireworkType } from '@/types/firework';
import type { GameMode, MusicEngineState } from '@/music';
import { getGlobalMusicEngine } from '@/music';
import './App.css';

function App() {
  // 烟花设置
  const [currentType, setCurrentType] = useState<FireworkType>('chrysanthemum');
  const [isAutoLaunch, setIsAutoLaunch] = useState(false);
  const [autoLaunchInterval, setAutoLaunchInterval] = useState(1500);
  
  // 音乐设置
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('festival');
  const [musicState, setMusicState] = useState<MusicEngineState | undefined>();
  
  // UI 状态
  const [showTitle, setShowTitle] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const musicEngineRef = useState(() => getGlobalMusicEngine())[0];

  // 监听音乐状态变化
  useEffect(() => {
    const unsubscribe = musicEngineRef.onStateChange((state) => {
      setMusicState(state);
    });

    return () => unsubscribe();
  }, [musicEngineRef]);

  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setShowTitle(false);
    }
  }, [hasInteracted]);

  // 呼吸圆环交互处理
  const handleBreathTap = useCallback((x: number, y: number) => {
    handleInteraction();
    if (musicEnabled) {
      musicEngineRef.handleInteraction({
        type: 'tap',
        x,
        y,
      });
    }
  }, [handleInteraction, musicEnabled, musicEngineRef]);

  const handleBreathHoldStart = useCallback((x: number, y: number) => {
    handleInteraction();
    if (musicEnabled) {
      musicEngineRef.handleInteraction({
        type: 'hold',
        x,
        y,
      });
    }
  }, [handleInteraction, musicEnabled, musicEngineRef]);

  const handleBreathHoldEnd = useCallback((x: number, y: number) => {
    if (musicEnabled) {
      musicEngineRef.handleInteraction({
        type: 'holdRelease',
        x,
        y,
      });
    }
  }, [musicEnabled, musicEngineRef]);

  // 隐藏标题
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setShowTitle(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [hasInteracted]);

  // 点击隐藏标题
  useEffect(() => {
    const handleClick = () => handleInteraction();
    window.addEventListener('click', handleClick);
    
    return () => window.removeEventListener('click', handleClick);
  }, [handleInteraction]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Firework Canvas */}
      <FireworkCanvas 
        currentType={currentType}
        isAutoLaunch={isAutoLaunch}
        autoLaunchInterval={autoLaunchInterval}
        musicEnabled={musicEnabled}
        gameMode={gameMode}
      />

      {/* Breath Ring (only when music enabled) */}
      {musicEnabled && (
        <BreathRing
          musicEnabled={musicEnabled}
          bpm={musicState?.bpm}
          onTap={handleBreathTap}
          onHoldStart={handleBreathHoldStart}
          onHoldEnd={handleBreathHoldEnd}
        />
      )}

      {/* Title Overlay */}
      <Title visible={showTitle} />

      {/* Control Panel */}
      <ControlPanel
        currentType={currentType}
        onTypeChange={setCurrentType}
        isAutoLaunch={isAutoLaunch}
        onAutoLaunchChange={setIsAutoLaunch}
        autoLaunchInterval={autoLaunchInterval}
        onIntervalChange={setAutoLaunchInterval}
        musicEnabled={musicEnabled}
        onMusicEnabledChange={setMusicEnabled}
        gameMode={gameMode}
        onGameModeChange={setGameMode}
        musicState={musicState}
      />

      {/* Corner Decorations */}
      <div className="fixed top-4 left-4 z-40 pointer-events-none">
        <div className="w-16 h-16 border-l-2 border-t-2 border-yellow-400/30 rounded-tl-lg" />
      </div>
      <div className="fixed top-4 right-4 z-40 pointer-events-none">
        <div className="w-16 h-16 border-r-2 border-t-2 border-yellow-400/30 rounded-tr-lg" />
      </div>

      {/* Music Mode Indicator */}
      {musicEnabled && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${
              gameMode === 'festival' ? 'bg-orange-400' : 'bg-cyan-400'
            }`} />
            <span className="text-xs text-yellow-400/80">
              {gameMode === 'festival' ? '盛典模式' : '模拟模式'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
