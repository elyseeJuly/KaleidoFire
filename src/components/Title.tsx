import { Sparkles } from 'lucide-react';

interface TitleProps {
  visible: boolean;
}

export function Title({ visible }: TitleProps) {
  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex flex-col items-center justify-center pt-16 pointer-events-none">
      <div className="title-animate flex flex-col items-center">
        {/* Main Title */}
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-orange-400 to-red-500 glow-text tracking-tighter"
            style={{ fontFamily: 'Orbitron, sans-serif' }}>
          万华烟火
        </h1>
        
        {/* Subtitle */}
        <div className="mt-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          <p className="text-yellow-400/70 text-sm tracking-[0.3em] font-medium"
             style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            KALEIDOFIRE · PROJECT SIMULATOR
          </p>
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
        </div>

        {/* Decorative line */}
        <div className="mt-6 w-48 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
        
        {/* Hint */}
        <p className="mt-4 text-yellow-400/50 text-sm animate-pulse">
          点击屏幕开始体验
        </p>
      </div>
    </div>
  );
}
