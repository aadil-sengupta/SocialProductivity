import React, { ReactElement } from 'react';
import { useAccentColorManager } from '@/contexts/AccentColorContext';

interface AnimatedIconButtonProps {
  onClick: () => void;
  icon: ReactElement;
  variant?: 'settings' | 'reset';
  size?: number;
  className?: string;
}

const AnimatedIconButton: React.FC<AnimatedIconButtonProps> = ({
  onClick,
  icon,
  variant = 'settings',
  size = 38,
  className = ''
}) => {
  const { colorVariations } = useAccentColorManager();
  const baseClasses = `
    relative group overflow-hidden
    flex items-center justify-center
    w-14 h-14 rounded-full
    transition-all duration-500 ease-out
    cursor-pointer
    backdrop-blur-sm
    border border-white/10
    hover:border-white/30
    active:scale-90
    ${className}
  `;

  const hoverClasses = `hover:shadow-lg`;

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
    <button
      onClick={onClick}
      className={`${baseClasses} ${hoverClasses}`}
      style={dynamicStyle}
    >
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
      
      {/* Icon container with rotation animation */}
      <div className={`
        relative z-10 transition-transform duration-500 ease-out
        group-hover:scale-110
        ${variant === 'settings' ? 'group-hover:rotate-90' : 'group-hover:rotate-180'}
      `}
      style={{
        transformOrigin: variant === 'reset' ? 'center 53%' : 'center center'
      }}>
        {React.cloneElement(icon, {
          size: size,
          className: `transition-all duration-500 text-white group-hover:drop-shadow-[0_0_8px_var(--icon-shadow)]`}
          )}
      </div>
      
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
    </button>
  );
};

export default AnimatedIconButton;
