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
  
  // UI 状态
  const [showTitle, setShowTitle] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setShowTitle(false);
    }
  }, [hasInteracted]);

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
      />

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
      />

      {/* Corner Decorations */}
      <div className="fixed top-4 left-4 z-40 pointer-events-none">
        <div className="w-16 h-16 border-l-2 border-t-2 border-yellow-400/30 rounded-tl-lg" />
      </div>
      <div className="fixed top-4 right-4 z-40 pointer-events-none">
        <div className="w-16 h-16 border-r-2 border-t-2 border-yellow-400/30 rounded-tr-lg" />
      </div>
    </div>
  );
}

export default App;
