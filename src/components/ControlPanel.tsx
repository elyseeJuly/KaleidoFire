import type { FireworkType } from '@/types/firework';
import type { GameMode, MusicEngineState } from '@/music';
import { 
  Circle, 
  Orbit, 
  Heart, 
  Wind, 
  Smile, 
  Star, 
  Hexagon, 
  Waves, 
  Atom,
  Flower2,
  X,
  Music,
  Zap,
  Wind as WindIcon,
} from 'lucide-react';

interface ControlPanelProps {
  currentType: FireworkType;
  onTypeChange: (type: FireworkType) => void;
  isAutoLaunch: boolean;
  onAutoLaunchChange: (value: boolean) => void;
  autoLaunchInterval: number;
  onIntervalChange: (value: number) => void;
  musicEnabled: boolean;
  onMusicEnabledChange: (value: boolean) => void;
  gameMode: GameMode;
  onGameModeChange: (mode: GameMode) => void;
  musicState?: MusicEngineState;
}

const fireworkTypes: { type: FireworkType; name: string; icon: React.ElementType }[] = [
  { type: 'chrysanthemum', name: '菊花', icon: Circle },
  { type: 'peony', name: '牡丹', icon: Flower2 },
  { type: 'willow', name: '垂柳', icon: Waves },
  { type: 'saturn', name: '土星', icon: Orbit },
  { type: 'heart', name: '爱心', icon: Heart },
  { type: 'vortex', name: '漩涡', icon: Wind },
  { type: 'smiley', name: '笑脸', icon: Smile },
  { type: 'starburst', name: '星爆', icon: Star },
  { type: 'beehive', name: '蜂巢', icon: Hexagon },
  { type: 'cascade', name: '瀑布', icon: Waves },
  { type: 'atomic', name: '原子', icon: Atom },
  { type: 'crossette', name: '十字', icon: X },
];

export function ControlPanel({
  currentType,
  onTypeChange,
  isAutoLaunch,
  onAutoLaunchChange,
  autoLaunchInterval,
  onIntervalChange,
  musicEnabled,
  onMusicEnabledChange,
  gameMode,
  onGameModeChange,
  musicState,
}: ControlPanelProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="glass-panel rounded-2xl mx-auto max-w-5xl p-4">
        {/* Top Row: Music Controls & Mode Selection */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            {/* Music Toggle */}
            <button
              onClick={() => onMusicEnabledChange(!musicEnabled)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                musicEnabled 
                  ? 'bg-yellow-400/20 border border-yellow-400/50' 
                  : 'bg-white/5 border border-transparent'
              }`}
            >
              <Music className={`w-4 h-4 ${musicEnabled ? 'text-yellow-400' : 'text-yellow-400/50'}`} />
              <span className={`text-sm ${musicEnabled ? 'text-yellow-400' : 'text-yellow-400/50'}`}>
                {musicEnabled ? '音乐开启' : '音乐关闭'}
              </span>
            </button>

            {/* Game Mode Selection (only when music enabled) */}
            {musicEnabled && (
              <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
                <button
                  onClick={() => onGameModeChange('festival')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                    gameMode === 'festival'
                      ? 'bg-yellow-400/20 text-yellow-400'
                      : 'text-yellow-400/50 hover:text-yellow-400/70'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  盛典
                </button>
                <button
                  onClick={() => onGameModeChange('flow')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
                    gameMode === 'flow'
                      ? 'bg-yellow-400/20 text-yellow-400'
                      : 'text-yellow-400/50 hover:text-yellow-400/70'
                  }`}
                >
                  <WindIcon className="w-3 h-3" />
                  模拟
                </button>
              </div>
            )}
          </div>
          
          {/* Music State Info */}
          {musicEnabled && musicState && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-yellow-400/60">
                BPM: {musicState.bpm}
              </span>
              <span className="text-yellow-400/60">
                小节: {musicState.currentMeasure + 1}
              </span>
              {musicState.comboCount > 0 && (
                <span className="text-yellow-400 font-bold animate-pulse">
                  连击: {musicState.comboCount}
                </span>
              )}
            </div>
          )}
          
          {/* Auto Launch Toggle (only when music disabled) */}
          {!musicEnabled && (
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-yellow-400/80 text-xs">自动燃放</span>
                <button
                  onClick={() => onAutoLaunchChange(!isAutoLaunch)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    isAutoLaunch ? 'bg-yellow-400' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      isAutoLaunch ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </label>
              
              {isAutoLaunch && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400/80 text-xs">间隔</span>
                  <input
                    type="range"
                    min="500"
                    max="3000"
                    step="100"
                    value={autoLaunchInterval}
                    onChange={(e) => onIntervalChange(Number(e.target.value))}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                  />
                  <span className="text-yellow-400/80 text-xs w-10">
                    {(autoLaunchInterval / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Firework Type Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {fireworkTypes.map(({ type, name, icon: Icon }) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className={`
                firework-btn flex flex-col items-center gap-1.5 p-3 rounded-xl
                min-w-[70px] border-2 transition-all duration-300
                ${currentType === type 
                  ? 'active border-yellow-400 bg-yellow-400/10' 
                  : 'border-transparent bg-white/5 hover:bg-white/10'
                }
              `}
            >
              <Icon 
                className={`w-6 h-6 transition-colors ${
                  currentType === type ? 'text-yellow-400' : 'text-yellow-400/60'
                }`}
              />
              <span 
                className={`text-[10px] font-medium whitespace-nowrap ${
                  currentType === type ? 'text-yellow-400' : 'text-yellow-400/60'
                }`}
              >
                {name}
              </span>
            </button>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-3 pt-3 border-t border-yellow-400/20">
          <p className="text-yellow-400/50 text-xs text-center">
            {musicEnabled 
              ? '点击屏幕与音乐互动 · 盛典模式节奏明快 · 模拟模式自由随性'
              : '点击屏幕任意位置发射烟花 | 选择底座后点击发射不同形态'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
