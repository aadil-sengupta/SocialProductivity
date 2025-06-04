import React, { createContext, useContext, useEffect, useState } from 'react';

// Color utility functions
export const hexToHsl = (hex: string): [number, number, number] => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

export const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

// Generate color variations
export const generateColorVariations = (baseColor: string) => {
  const [h, s, l] = hexToHsl(baseColor);
  
  return {
    50: hslToHex(h, Math.max(s - 40, 10), Math.min(l + 40, 95)),
    100: hslToHex(h, Math.max(s - 30, 15), Math.min(l + 30, 90)),
    200: hslToHex(h, Math.max(s - 20, 20), Math.min(l + 20, 85)),
    300: hslToHex(h, Math.max(s - 10, 25), Math.min(l + 10, 80)),
    400: hslToHex(h, s, Math.min(l + 5, 75)),
    500: baseColor, // Base color
    600: hslToHex(h, Math.min(s + 10, 100), Math.max(l - 10, 25)),
    700: hslToHex(h, Math.min(s + 20, 100), Math.max(l - 20, 20)),
    800: hslToHex(h, Math.min(s + 30, 100), Math.max(l - 30, 15)),
    900: hslToHex(h, Math.min(s + 40, 100), Math.max(l - 40, 10)),
    DEFAULT: baseColor,
    foreground: l > 50 ? '#000000' : '#ffffff',
  };
};

// Predefined color options
export const PRESET_COLORS = {
  blue: '#0070f3',
  purple: '#8b5cf6', 
  green: '#10b981',
  orange: '#f59e0b',
  red: '#ef4444',
  pink: '#ec4899',
  teal: '#14b8a6',
  indigo: '#6366f1',
  yellow: '#eab308',
  emerald: '#059669',
  cyan: '#06b6d4',
  rose: '#f43f5e',
};

interface AccentColorContextType {
  accentColor: string;
  setAccentColor: (color: string) => void;
  colorVariations: ReturnType<typeof generateColorVariations>;
  presetColors: typeof PRESET_COLORS;
}

const AccentColorContext = createContext<AccentColorContextType | undefined>(undefined);

interface AccentColorProviderProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'seika-accent-color';
const DEFAULT_COLOR = PRESET_COLORS.blue;

export function AccentColorProvider({ children }: AccentColorProviderProps) {
  const [accentColor, setAccentColorState] = useState<string>(DEFAULT_COLOR);
  const [colorVariations, setColorVariations] = useState(generateColorVariations(DEFAULT_COLOR));

  // Load saved color from localStorage on mount
  useEffect(() => {
    const savedColor = localStorage.getItem(STORAGE_KEY);
    if (savedColor && Object.values(PRESET_COLORS).includes(savedColor)) {
      setAccentColorState(savedColor);
      setColorVariations(generateColorVariations(savedColor));
    }
  }, []);

  // Update CSS custom properties when accent color changes
  useEffect(() => {
    const variations = generateColorVariations(accentColor);
    setColorVariations(variations);
    
    const root = document.documentElement;
    
    // Set CSS custom properties for accent color variations
    Object.entries(variations).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--accent-${key}`, value);
        root.style.setProperty(`--color-primary-${key}`, value);
      }
    });

    // Set primary color for HeroUI components
    root.style.setProperty('--heroui-primary', accentColor);
    root.style.setProperty('--heroui-primary-50', variations[50]);
    root.style.setProperty('--heroui-primary-100', variations[100]);
    root.style.setProperty('--heroui-primary-200', variations[200]);
    root.style.setProperty('--heroui-primary-300', variations[300]);
    root.style.setProperty('--heroui-primary-400', variations[400]);
    root.style.setProperty('--heroui-primary-500', variations[500]);
    root.style.setProperty('--heroui-primary-600', variations[600]);
    root.style.setProperty('--heroui-primary-700', variations[700]);
    root.style.setProperty('--heroui-primary-800', variations[800]);
    root.style.setProperty('--heroui-primary-900', variations[900]);
    root.style.setProperty('--heroui-primary-foreground', variations.foreground);

  }, [accentColor]);

  const setAccentColor = (color: string) => {
    setAccentColorState(color);
    localStorage.setItem(STORAGE_KEY, color);
  };

  return (
    <AccentColorContext.Provider value={{
      accentColor,
      setAccentColor,
      colorVariations,
      presetColors: PRESET_COLORS,
    }}>
      {children}
    </AccentColorContext.Provider>
  );
}

// Hook to get the full accent color context
function useAccentColorContext() {
  const context = useContext(AccentColorContext);
  if (context === undefined) {
    throw new Error('useAccentColorContext must be used within an AccentColorProvider');
  }
  return context;
}

// Hook for accent color management (setting colors, getting preset colors)
export function useAccentColorManager() {
  return useAccentColorContext();
}

// Utility hook for getting accent color classes
export function useAccentColor() {
  
  return {
    // Background classes
    bg: 'bg-accent-DEFAULT',
    bgHover: 'hover:bg-accent-600',
    bgActive: 'active:bg-accent-700',
    bgLight: 'bg-accent-100',
    bgSubtle: 'bg-accent-50',
    
    // Text classes
    text: 'text-accent-DEFAULT',
    textLight: 'text-accent-400',
    textDark: 'text-accent-700',
    
    // Border classes
    border: 'border-accent-DEFAULT',
    borderLight: 'border-accent-200',
    
    // Ring/focus classes
    ring: 'ring-accent-DEFAULT',
    focusRing: 'focus:ring-accent-DEFAULT',
    
    // CSS custom property values
    cssVars: {
      primary: 'var(--accent-DEFAULT)',
      primaryHover: 'var(--accent-600)',
      primaryActive: 'var(--accent-700)',
      primaryLight: 'var(--accent-100)',
      primarySubtle: 'var(--accent-50)',
    }
  };
}
