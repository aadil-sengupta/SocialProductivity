import React, { ReactElement } from 'react';
import { useAccentColorManager } from '@/contexts/AccentColorContext';

interface AnimatedIconButtonProps {
  onClick: () => void;
  icon: ReactElement;
  variant?: 'settings' | 'reset' | 'break'; // Define variants for different animations
  size?: number;
  className?: string;
  transparent?: boolean; // Add option for transparent background
  tooltip?: string; // Custom tooltip text
  disabled?: boolean; // Disable all animations and interactions
}

const AnimatedIconButton: React.FC<AnimatedIconButtonProps> = ({
  onClick,
  icon,
  variant = 'settings',
  size = 38,
  className = '',
  transparent = false,
  tooltip,
  disabled = false
}) => {
  const { colorVariations } = useAccentColorManager();
  
  // Default tooltip text based on variant
  const getDefaultTooltip = () => {
    switch (variant) {
      case 'settings': return 'Settings';
      case 'reset': return 'Reset';
      case 'break': return 'Break';
      default: return '';
    }
  };
  
  const tooltipText = tooltip || getDefaultTooltip();
  
  // Base classes for transparent vs. normal button
  const baseClasses = transparent ? `
    relative group overflow-hidden
    flex items-center justify-center
    w-14 h-14 rounded-full
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
    ${disabled ? '' : 'transition-all duration-500 ease-out active:scale-90'}
    ${className}
  ` : `
    relative group overflow-hidden
    flex items-center justify-center
    w-14 h-14 rounded-full
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
    ${disabled ? '' : 'transition-all duration-500 ease-out active:scale-90'}
    backdrop-blur-sm
    border border-white/10
    ${disabled ? '' : 'hover:border-white/30'}
    ${className}
  `;

  const hoverClasses = transparent || disabled ? '' : `hover:shadow-lg`;

  // Create dynamic styles using accent color
  const dynamicStyle = {
    '--hover-bg': colorVariations[500] + '33', // 20% opacity
    '--hover-shadow': colorVariations[500] + '40', // 25% opacity
    '--glow-start': colorVariations[400] + '33', // 20% opacity
    '--glow-end': colorVariations[600] + '33', // 20% opacity
    '--ripple-bg': colorVariations[400] + '4D', // 30% opacity
    '--icon-shadow': colorVariations[500] + '80', // 50% opacity
  } as React.CSSProperties;

  return (
    <div className="relative group">
      {/* Animated Tooltip */}
      {tooltipText && !disabled && (
        <div className="
          absolute top-16 left-1/2 transform -translate-x-1/2
          bg-black/90 backdrop-blur-sm text-white text-xs font-medium
          px-3 py-2 rounded-md
          opacity-0 group-hover:opacity-100
          -translate-y-2 group-hover:translate-y-0
          transition-all duration-300 ease-out delay-500
          pointer-events-none z-[100]
          whitespace-nowrap
          border border-white/20
          shadow-lg shadow-black/50
        "
        style={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
        }}>
          {tooltipText}
          {/* Tooltip arrow */}
          <div className="
            absolute bottom-full left-1/2 transform -translate-x-1/2
            w-0 h-0 border-l-4 border-r-4 border-b-4
            border-l-transparent border-r-transparent border-b-black/90
          " />
        </div>
      )}
      
      <button
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`${baseClasses} ${hoverClasses}`}
        style={dynamicStyle}
      >
      {/* Background effects - only render if not transparent */}
      {!transparent && !disabled && (
        <>
          {/* Background glow effect */}
          <div 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ 
              background: `linear-gradient(to right, var(--glow-start), var(--glow-end))`,
              boxShadow: `0 8px 32px var(--hover-shadow)`
            }}
          />
          
          {/* Hover background */}
          <div 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ backgroundColor: 'var(--hover-bg)' }}
          />
          
          {/* Ripple effect */}
          <div 
            className="absolute inset-0 rounded-full opacity-0 group-active:opacity-100 transition-all duration-200 ease-out scale-75 group-active:scale-110"
            style={{ backgroundColor: 'var(--ripple-bg)' }}
          />
          
          {/* Shine effect */}
          <div className="
            absolute inset-0 rounded-full
            bg-gradient-to-tr from-transparent via-white/20 to-transparent
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
            pointer-events-none
            before:content-[''] before:absolute before:inset-0 before:rounded-full
            before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
            before:transform before:-translate-x-full before:transition-transform before:duration-1000 before:ease-out
            group-hover:before:translate-x-full
          " />
        </>
      )}
      
      {/* Icon container with rotation animation */}
      <div className={`
        relative z-10 ${disabled ? '' : 'transition-transform duration-500 ease-out'}
        ${disabled ? '' : 'group-hover:scale-110'}
        ${disabled ? '' : (variant === 'settings' ? 'group-hover:rotate-90' : 'group-hover:rotate-180')}
        ${disabled ? '' : (variant === 'break' ? 'group-hover:rotate-0 group-hover:scale-120' : '')}
      `}
      style={{
        transformOrigin: variant === 'reset' ? 'center 53%' : 'center center'
      }}>
        {React.cloneElement(icon, {
          size: size,
          className: `${disabled ? 'text-white' : 'transition-all duration-500 text-white group-hover:drop-shadow-[0_0_8px_var(--icon-shadow)]'}`}
          )}
      </div>
      </button>
    </div>
  );
};

export default AnimatedIconButton;
