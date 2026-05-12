/**
 * 《千树流律》呼吸涟漪圆环
 * 用于交互反馈的呼吸式动画元素
 */

import { useEffect, useRef, useState } from 'react';

interface BreathRingProps {
  musicEnabled: boolean;
  bpm?: number;
  onTap?: (x: number, y: number) => void;
  onHoldStart?: (x: number, y: number) => void;
  onHoldEnd?: (x: number, y: number) => void;
}

export function BreathRing({ 
  musicEnabled, 
  bpm = 110, 
  onTap, 
  onHoldStart, 
  onHoldEnd 
}: BreathRingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);
  const rippleIdRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // 呼吸动画周期
  const breathDuration = musicEnabled ? (60 / bpm) * 2 : 3;

  // 移除单独的 handleClick，逻辑合并到 handleMouseUp

  // 处理按下
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    lastPosRef.current = { x: clientX, y: clientY };
    setIsPressed(true);
    isHoldingRef.current = false;
    
    // 开始长按计时
    holdTimerRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      onHoldStart?.(clientX, clientY);
    }, 300);
  };

  // 处理释放
  const handleMouseUp = () => {
    setIsPressed(false);
    
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    
    if (isHoldingRef.current) {
      onHoldEnd?.(lastPosRef.current.x, lastPosRef.current.y);
      isHoldingRef.current = false;
    } else {
      // 触发点击
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const localX = lastPosRef.current.x - rect.left;
        const localY = lastPosRef.current.y - rect.top;
        
        // 添加涟漪效果
        const newRipple = { id: rippleIdRef.current++, x: localX, y: localY };
        setRipples(prev => [...prev, newRipple]);
        
        // 移除涟漪
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 1000);
      }
      
      onTap?.(lastPosRef.current.x, lastPosRef.current.y);
    }
  };

  // 触摸事件处理
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    handleMouseDown(e);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    handleMouseUp();
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-30 pointer-events-auto overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 中心呼吸圆环 */}
      {musicEnabled && (
        <div className="absolute left-1/2 bottom-32 -translate-x-1/2 pointer-events-none">
          {/* 外环 - 呼吸动画 */}
          <div 
            className="relative w-24 h-24"
            style={{
              animation: `breath ${breathDuration}s ease-in-out infinite`,
            }}
          >
            {/* 主圆环 */}
            <div 
              className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
                isPressed 
                  ? 'border-yellow-400 scale-90' 
                  : 'border-yellow-400/40'
              }`}
              style={{
                boxShadow: isPressed 
                  ? '0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 215, 0, 0.2)'
                  : '0 0 15px rgba(255, 215, 0, 0.2)',
              }}
            />
            
            {/* 内环 */}
            <div 
              className="absolute inset-4 rounded-full border border-yellow-400/20"
              style={{
                animation: `breath ${breathDuration * 0.8}s ease-in-out infinite reverse`,
              }}
            />
            
            {/* 中心点 */}
            <div 
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-yellow-400 transition-transform ${
                isPressed ? 'scale-150' : 'scale-100'
              }`}
              style={{
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
              }}
            />
          </div>
          
          {/* 提示文字 */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-yellow-400/40 text-xs tracking-wider">
              点击 · 长按
            </span>
          </div>
        </div>
      )}

      {/* 涟漪效果 */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div 
            className="w-4 h-4 rounded-full border border-yellow-400/60"
            style={{
              animation: 'ripple 1s ease-out forwards',
            }}
          />
        </div>
      ))}

      {/* CSS 动画 */}
      <style>{`
        @keyframes breath {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }
        
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 1;
            border-width: 2px;
          }
          100% {
            transform: scale(8);
            opacity: 0;
            border-width: 0;
          }
        }
      `}</style>
    </div>
  );
}
