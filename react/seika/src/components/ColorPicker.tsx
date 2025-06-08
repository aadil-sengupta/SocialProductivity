
import { useAccentColorManager } from '@/contexts/AccentColorContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { cn } from '@heroui/react';
import { useState } from 'react';

interface ColorPickerProps {
  className?: string;
}

function capitalizeFirstLetter(val?: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export default function ColorPicker({ className }: ColorPickerProps) {
  const { accentColor, setAccentColor, presetColors } = useAccentColorManager();
  const { isDarkMode } = useDarkMode();
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);

  const currentColorName = Object.entries(presetColors).find(([_, color]) => color === accentColor)?.[0];
  
  // Create a circular arrangement of colors
  const colorNames = Object.keys(presetColors);
  const centerX = 120;
  const centerY = 120;
  const radius = 80;

  const getColorPosition = (index: number, total: number) => {
    const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // Start from top
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y, angle };
  };

  return (
    <div className={cn("space-y-8", className)}>
      {/* Circular Color Wheel */}
      <div className="flex flex-col items-center space-y-6">
        <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Choose Your Vibe ✨
        </h4>
        
        {/* Color Wheel Container */}
        <div className="relative">
          <svg width="240" height="240" className="overflow-visible">
            {/* Central circle with current color */}
            <circle
              cx={centerX}
              cy={centerY}
              r="32"
              fill={hoveredColor || accentColor}
              className="transition-all duration-500 drop-shadow-lg"
            />
            <circle
              cx={centerX}
              cy={centerY}
              r="32"
              fill="url(#centerGradient)"
              className="transition-all duration-300"
            />
            
            {/* Gradient definition */}
            <defs>
              <radialGradient id="centerGradient" cx="0.3" cy="0.3">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
              </radialGradient>
            </defs>

            {/* Color circles around the center */}
            {colorNames.map((colorName, index) => {
              const colorValue = presetColors[colorName as keyof typeof presetColors];
              const isSelected = accentColor === colorValue;
              const position = getColorPosition(index, colorNames.length);
              const scale = isSelected ? 1.2 : hoveredColor === colorValue ? 1.1 : 1;
              
              return (
                <g key={colorName}>
                  {/* Glow effect for selected color */}
                  {isSelected && (
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="20"
                      fill={colorValue}
                      className="opacity-30 blur-sm animate-pulse"
                    />
                  )}
                  
                  {/* Main color circle */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="16"
                    fill={colorValue}
                    className="cursor-pointer transition-all duration-300 drop-shadow-md hover:drop-shadow-xl"
                    style={{ 
                      transform: `scale(${scale})`,
                      transformOrigin: `${position.x}px ${position.y}px`
                    }}
                    onMouseEnter={() => setHoveredColor(colorValue)}
                    onMouseLeave={() => setHoveredColor(null)}
                    onClick={() => setAccentColor(colorValue)}
                  />
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r="8"
                      fill="rgba(255,255,255,0.9)"
                      className="animate-pulse"
                    />
                  )}
                  
                  {/* Highlight overlay */}
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="16"
                    fill="url(#highlightGradient)"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredColor(colorValue)}
                    onMouseLeave={() => setHoveredColor(null)}
                    onClick={() => setAccentColor(colorValue)}
                  />
                </g>
              );
            })}
            
            {/* Highlight gradient definition */}
            <defs>
              <radialGradient id="highlightGradient" cx="0.3" cy="0.3">
                <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                <stop offset="70%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
              </radialGradient>
            </defs>
          </svg>
          
          {/* Color name tooltip */}
          {hoveredColor && (
            <div className={`
              absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
              px-3 py-1 rounded-full text-xs font-medium
              ${isDarkMode ? 'text-white' : 'text-gray-800'}
              transition-all duration-200 animate-in fade-in-50
            `}>
              {capitalizeFirstLetter(
                Object.entries(presetColors).find(([_, color]) => color === hoveredColor)?.[0]
              )}
            </div>
          )}
        </div>
      </div>

      {/* Fun Color Info Card */}
      <div className={`
        relative overflow-hidden rounded-2xl p-6 transition-all duration-500
        ${isDarkMode 
          ? 'bg-gradient-to-br from-gray-800/80 via-gray-900/60 to-gray-800/40' 
          : 'bg-gradient-to-br from-white/80 via-gray-50/60 to-white/40'
        }
      `}
        style={{
          background: isDarkMode 
            ? `linear-gradient(135deg, ${accentColor}15 0%, ${accentColor}05 50%, transparent 100%)`
            : `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}08 50%, transparent 100%)`
        }}
      >
        {/* Background decoration */}
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10 blur-2xl"
          style={{ backgroundColor: accentColor }}
        />
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Large color preview */}
            <div className="relative">
              <div 
                className="w-12 h-12 rounded-xl shadow-lg relative overflow-hidden" 
                style={{ backgroundColor: accentColor }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-tl from-black/10 to-transparent" />
              </div>
              <div 
                className="absolute -inset-1 rounded-xl opacity-30 blur-md -z-10"
                style={{ backgroundColor: accentColor }}
              />
            </div>
            
            <div>
              <p className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {capitalizeFirstLetter(currentColorName) || 'Custom'}
              </p>
              <p className={`text-sm font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {accentColor.toUpperCase()}
              </p>
            </div>
          </div>
          
          {/* Emotion indicator */}
          <div className={`
            px-4 py-2 rounded-xl text-sm font-medium
            ${isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-700'}
          `}>
            {getColorEmotion(currentColorName)}
          </div>
        </div>
      </div>
    </div>
  );
}

// Fun function to assign emotions to colors
function getColorEmotion(colorName?: string): string {
  const emotions: Record<string, string> = {
    blue: '🌊 Calm',
    indigo: '🔮 Mystical', 
    purple: '👑 Royal',
    pink: '🌸 Playful',
    red: '🔥 Energetic',
    orange: '🍊 Vibrant',
    yellow: '☀️ Cheerful',
    emerald: '💎 Fresh',
    green: '🌿 Natural',
    teal: '🌊 Serene',
    cyan: '❄️ Cool',
    rose: '🌹 Romantic'
  };
  
  return emotions[colorName || ''] || '✨ Unique';
}
