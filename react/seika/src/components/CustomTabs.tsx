import React, { useState, ReactElement, useRef } from 'react';
import { useAccentColorManager } from '@/contexts/AccentColorContext';

interface TabData {
  key: string;
  title: ReactElement;
  icon?: ReactElement;
  content?: ReactElement;
}

interface CustomTabsProps {
  tabs: TabData[];
  defaultSelected?: string;
  onSelectionChange?: (key: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  showContent?: boolean;
  contentClassName?: string;
}

export default function CustomTabs({
  tabs,
  defaultSelected,
  onSelectionChange,
  className = '',
  size = 'lg',
  radius = 'full',
  showContent = false,
  contentClassName = ''
}: CustomTabsProps) {
  const [selectedKey, setSelectedKey] = useState(defaultSelected || tabs[0]?.key);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { colorVariations } = useAccentColorManager();
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTabClick = (key: string) => {
    if (key === selectedKey) return;
    
    setIsTransitioning(true);
    
    // Trigger slide animation with shorter timing for responsiveness
    setTimeout(() => {
      setSelectedKey(key);
      onSelectionChange?.(key);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 120);
    }, 120);
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-sm px-4 py-2',
    md: 'text-base px-5 py-2.5',
    lg: 'text-xl px-6 py-3'
  };

  // Radius classes
  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  // Create dynamic styles using accent color - improved for better contrast
  const dynamicStyle = {
    '--accent-50': colorVariations[50],
    '--accent-100': colorVariations[100],
    '--accent-200': colorVariations[200],
    '--accent-300': colorVariations[300],
    '--accent-400': colorVariations[400],
    '--accent-500': colorVariations[500],
    '--accent-600': colorVariations[600],
    '--accent-700': colorVariations[700],
    '--selected-bg': colorVariations[500] + '55', // 33% opacity for better contrast
    '--selected-border': colorVariations[300] + 'F0', // 94% opacity
    '--hover-bg': colorVariations[400] + '40', // 25% opacity
    '--active-bg': colorVariations[500] + '65', // 40% opacity
    '--glow-color': colorVariations[500] + '90', // 56% opacity for better visibility
  } as React.CSSProperties;

  return (
    <>
      <div 
        className={`
          relative inline-flex items-center
          backdrop-blur-xl bg-black/60 border border-white/25
          ${radiusClasses[radius]}
          ${className}
          overflow-hidden
        `}
        style={{
          ...dynamicStyle,
          opacity: 0.9,
          margin: '0 auto',
          padding: '4px',
        }}
      >
        {/* Sliding background indicator - similar to sidebar theme switcher */}
        <div
          className={`
            absolute transition-all duration-300 ease-out
            ${radiusClasses[radius]}
          `}
          style={{
            left: `calc(${(tabs.findIndex(tab => tab.key === selectedKey) * 100) / tabs.length}% + 2px)`,
            width: `calc(${100 / tabs.length}% - 4px)`,
            height: 'calc(100% - 8px)',
            top: '4px',
            backgroundColor: 'var(--selected-bg)',
            borderColor: 'var(--selected-border)',
            border: '1px solid var(--selected-border)',
            boxShadow: `
              0 4px 20px var(--glow-color), 
              0 2px 12px var(--accent-600)40,
              inset 0 1px 0 rgba(255, 255, 255, 0.15),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1)
            `,
            background: `
              linear-gradient(135deg, var(--selected-bg), var(--accent-600)25),
              var(--selected-bg)
            `,
            transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
            zIndex: 0,
          }}
        />

        {tabs.map((tab) => {
          const isSelected = selectedKey === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className={`
                relative flex items-center justify-center gap-2
                transition-all duration-200 ease-out
                cursor-pointer select-none
                font-medium
                hover:text-white
                active:scale-98
                focus:outline-none
                ${sizeClasses[size]}
                ${isSelected ? 
                  'text-white font-bold' : 
                  'text-white/85 hover:text-white/95 font-medium'
                }
              `}
              style={{
                flex: 1,
                fontSize: size === 'lg' ? '1.35rem' : undefined,
                transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                textShadow: isSelected 
                  ? `
                    0 0 20px var(--glow-color), 
                    0 2px 12px rgba(0, 0, 0, 0.8),
                    0 4px 20px rgba(0, 0, 0, 0.6),
                    0 1px 4px rgba(0, 0, 0, 0.9)
                  ` 
                  : `
                    0 2px 12px rgba(0, 0, 0, 0.7),
                    0 1px 4px rgba(0, 0, 0, 0.8),
                    0 4px 8px rgba(0, 0, 0, 0.5)
                  `,
                filter: isSelected ? 'drop-shadow(0 0 10px var(--glow-color))' : 'none',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                zIndex: 1,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.textShadow = `
                    0 2px 16px rgba(0, 0, 0, 0.8),
                    0 1px 6px rgba(0, 0, 0, 0.9),
                    0 4px 12px rgba(0, 0, 0, 0.6)
                  `;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.textShadow = `
                    0 2px 12px rgba(0, 0, 0, 0.7),
                    0 1px 4px rgba(0, 0, 0, 0.8),
                    0 4px 8px rgba(0, 0, 0, 0.5)
                  `;
                }
              }}
            >
              {/* Tab content with improved readability */}
              <div className="relative z-10 flex items-center gap-2">
                {tab.title}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Sliding content container for tab content */}
      {showContent && (
        <div className={`mt-6 ${contentClassName}`}>
          <div 
            ref={contentRef}
            className="relative overflow-hidden"
            style={{ minHeight: '200px' }}
          >
            {tabs.map((tab, index) => {
              const isActive = selectedKey === tab.key;
              const currentIndex = tabs.findIndex(t => t.key === selectedKey);
              const tabIndex = index;
              
              return (
                <div
                  key={tab.key}
                  className={`
                    absolute inset-0 w-full
                    transition-all duration-300 ease-in-out
                    ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}
                  `}
                  style={{
                    transform: `translateX(${(tabIndex - currentIndex) * 100}%)`,
                    filter: isTransitioning ? 'blur(2px)' : 'blur(0px)',
                  }}
                >
                  {tab.content}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Remove the old animations since we're using a simpler approach */}
      <style>
        {`
          /* Custom tab animations removed - using pure CSS transitions now */
        `}
      </style>
    </>
  );
}

// Export a simple Tab component for consistency with HeroUI API
export interface TabProps {
  key: string;
  title: ReactElement;
}

export function Tab(_props: TabProps) {
  // This is just a helper component for type consistency
  // The actual rendering is handled by CustomTabs
  return null;
}
