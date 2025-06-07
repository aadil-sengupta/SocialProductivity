import React, { useState } from 'react';
import { IoTimer } from "react-icons/io5";
import { MdOutlineTimerOff } from "react-icons/md";
import { useAccentColorManager } from '@/contexts/AccentColorContext';

interface AnimatedModeSwitcherProps {
  defaultSelected?: 'pomo' | 'free';
  onSelectionChange?: (mode: 'pomo' | 'free') => void;
  className?: string;
  disabled?: boolean;
}

export default function AnimatedModeSwitcher({
  defaultSelected = 'pomo',
  onSelectionChange,
  className = '',
  disabled
}: AnimatedModeSwitcherProps) {
  const [selectedMode, setSelectedMode] = useState<'pomo' | 'free'>(defaultSelected);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const { colorVariations } = useAccentColorManager();

  const handleModeSwitch = (newMode: 'pomo' | 'free') => {
    if (disabled || newMode === selectedMode || isAnimating) return;
    
    setIsAnimating(true);
    
    // Quick animation timing for responsiveness
    setTimeout(() => {
      setSelectedMode(newMode);
      onSelectionChange?.(newMode);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }, 100);
  };

  const dynamicStyle = {
    '--accent-400': colorVariations[400],
    '--accent-500': colorVariations[500],
    '--accent-600': colorVariations[600],
  } as React.CSSProperties;

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className} ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
      style={dynamicStyle}
    >
      {/* Background glow effect - fixed sizing */}
      <div 
        className={`
          absolute rounded-full transition-all duration-500 ease-out
          ${isAnimating ? 'opacity-80' : 'opacity-60'}
        `}
        style={{
          filter: 'blur(20px)',
          width: '280px',
          height: '56px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: selectedMode === 'pomo' 
            ? `linear-gradient(to right, ${colorVariations[500]}20, ${colorVariations[400]}30, ${colorVariations[600]}20)` 
            : `linear-gradient(to right, ${colorVariations[400]}20, ${colorVariations[500]}30, ${colorVariations[300]}20)`,
        }}
      />
      
      {/* Main container - fixed width to prevent sizing issues */}
      <div 
        className={`
          relative backdrop-blur-xl bg-black/40 border border-white/20
          rounded-full p-1 transition-all duration-300 ease-out
          ${isAnimating ? 'shadow-2xl' : 'shadow-lg'}
        `}
        style={{ width: '280px' }}
      >
        
        {/* Sliding background indicator */}
        <div
          className={`
            absolute top-1 h-[calc(100%-8px)] w-1/2 rounded-full
            transition-all duration-400 ease-out
          `}
          style={{
            left: selectedMode === 'pomo' ? '4px' : 'calc(50% - 4px)',
            background: selectedMode === 'pomo' 
              ? `linear-gradient(135deg, 
                  ${colorVariations[500]}60, 
                  ${colorVariations[400]}50, 
                  ${colorVariations[600]}50)`
              : `linear-gradient(135deg, 
                  ${colorVariations[500]}60, 
                  ${colorVariations[300]}50, 
                  ${colorVariations[400]}50)`,
            boxShadow: `
              0 4px 20px ${colorVariations[500]}40,
              0 2px 12px ${colorVariations[500]}30,
              inset 0 1px 0 rgba(255, 255, 255, 0.2)
            `,
            border: `1px solid ${colorVariations[400]}60`,
          }}
        />

        {/* Mode buttons - improved alignment and sizing */}
        <div className="relative flex items-center">
          {/* Pomodoro Mode */}
          <button
            onClick={() => handleModeSwitch('pomo')}
            disabled={disabled}
            className={`
              flex items-center justify-center gap-2 px-5 py-2.5 rounded-full
              transition-all duration-300 ease-out
              text-base font-medium relative overflow-hidden
              min-w-[136px]
              ${disabled 
                ? 'cursor-not-allowed' 
                : ''
              }
              ${selectedMode === 'pomo' 
                ? 'text-white z-10' 
                : `text-white/70 ${disabled ? '' : 'hover:text-white/90'}`
              }
            `}
            style={{
              textShadow: selectedMode === 'pomo'
                ? `0 0 20px ${colorVariations[500]}80, 0 2px 8px rgba(0,0,0,0.6)`
                : '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            <IoTimer 
              className={`
                transition-all duration-300 ease-out flex-shrink-0
                ${selectedMode === 'pomo' 
                  ? 'text-white' 
                  : 'text-white/60'
                }
              `}
              size={20}
              style={{
                filter: selectedMode === 'pomo' 
                  ? `drop-shadow(0 0 8px ${colorVariations[500]}60)` 
                  : 'none',
                color: selectedMode === 'pomo' ? colorVariations[300] : undefined,
              }}
            />
            <span className="relative z-10">Pomodoro</span>
          </button>

          {/* Free Mode */}
          <button
            onClick={() => handleModeSwitch('free')}
            disabled={disabled}
            className={`
              flex items-center justify-center gap-2 px-5 py-2.5 rounded-full
              transition-all duration-300 ease-out
              text-base font-medium relative overflow-hidden
              min-w-[136px]
              ${disabled 
                ? 'cursor-not-allowed' 
                : ''
              }
              ${selectedMode === 'free' 
                ? 'text-white z-10' 
                : `text-white/70 ${disabled ? '' : 'hover:text-white/90'}`
              }
            `}
            style={{
              textShadow: selectedMode === 'free'
                ? `0 0 20px ${colorVariations[500]}80, 0 2px 8px rgba(0,0,0,0.6)`
                : '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            <MdOutlineTimerOff 
              className={`
                transition-all duration-300 ease-out flex-shrink-0
                ${selectedMode === 'free' 
                  ? 'text-white' 
                  : 'text-white/60'
                }
              `}
              size={20}
              style={{
                filter: selectedMode === 'free' 
                  ? `drop-shadow(0 0 8px ${colorVariations[500]}60)` 
                  : 'none',
                color: selectedMode === 'free' ? colorVariations[300] : undefined,
              }}
            />
            <span className="relative z-10">Free</span>
          </button>
        </div>
      </div>
    </div>
  );
}
