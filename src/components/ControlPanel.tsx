import type { FireworkType } from '@/types/firework';
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
} from 'lucide-react';

interface ControlPanelProps {
  currentType: FireworkType;
  onTypeChange: (type: FireworkType) => void;
  isAutoLaunch: boolean;
  onAutoLaunchChange: (value: boolean) => void;
  autoLaunchInterval: number;
  onIntervalChange: (value: number) => void;
}

const fireworkTypes: { type: FireworkType; name: string; icon: React.ElementType }[] = [
  { type: 'peony', name: '牡丹', icon: Flower2 },
  { type: 'chrysanthemum', name: '菊花', icon: Circle },
  { type: 'dahlia', name: '大丽花', icon: Flower2 },
  { type: 'willow', name: '垂柳', icon: Waves },
  { type: 'brocade', name: '锦冠', icon: Star },
  { type: 'palm', name: '棕榈', icon: Wind },
  { type: 'saturn', name: '土星', icon: Orbit },
  { type: 'spiral', name: '螺旋', icon: Wind },
  { type: 'heart', name: '爱心', icon: Heart },
  { type: 'starburst', name: '星爆', icon: Star },
  { type: 'spider', name: '蜘蛛', icon: X },
  { type: 'crossette', name: '爆裂', icon: X },
  { type: 'honeycomb', name: '蜂巢', icon: Hexagon },
  { type: 'pearl', name: '珍珠', icon: Circle },
  { type: 'atom', name: '原子', icon: Atom },
  { type: 'concentric', name: '同心', icon: Orbit },
  { type: 'rose', name: '玫瑰', icon: Flower2 },
  { type: 'dud', name: '哑弹', icon: Smile },
];

export function ControlPanel({
  currentType,
  onTypeChange,
  isAutoLaunch,
  onAutoLaunchChange,
  autoLaunchInterval,
  onIntervalChange,
}: ControlPanelProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="glass-panel rounded-2xl mx-auto max-w-5xl p-4">
        {/* Top Row: Celebration Mode Toggle */}
        <div className="flex items-center justify-center mb-4 gap-6 flex-wrap">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <span className={`text-xs transition-colors ${isAutoLaunch ? 'text-yellow-400' : 'text-yellow-400/50'}`}>
                盛典模式
              </span>
              <button
                onClick={() => onAutoLaunchChange(!isAutoLaunch)}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                  isAutoLaunch ? 'bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.4)]' : 'bg-white/10'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    isAutoLaunch ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
            
            {isAutoLaunch && (
              <div className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-yellow-400/20">
                <span className="text-yellow-400/60 text-[10px] uppercase tracking-wider">频率</span>
                <input
                  type="range"
                  min="400"
                  max="2500"
                  step="100"
                  value={autoLaunchInterval}
                  onChange={(e) => onIntervalChange(Number(e.target.value))}
                  className="w-24 h-1 bg-yellow-400/20 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                />
                <span className="text-yellow-400/80 text-xs font-mono w-8">
                  {(autoLaunchInterval / 1000).toFixed(1)}s
                </span>
              </div>
            )}
          </div>
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
            点击屏幕任意位置发射烟花 | 选择底座后点击发射不同形态
          </p>
        </div>
      </div>
    </div>
  );
}
