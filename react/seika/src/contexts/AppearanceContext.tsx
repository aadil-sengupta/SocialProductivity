import React, { createContext, useContext, useState, useEffect } from 'react';

type AppearanceSettings = {
  font: string;
};

type AppearanceContextType = {
  // Font settings
  font: string;
  setFont: (font: string) => void;
  
  // Bulk operations
  appearanceSettings: AppearanceSettings;
  updateAppearanceSettings: (settings: Partial<AppearanceSettings>) => void;
};

// Font categories and options
export type FontCategory = 'display' | 'sans-serif' | 'serif' | 'monospace' | 'handwriting';

export type FontOption = {
  name: string;
  category: FontCategory;
  description: string;
  weight: 'normal' | 'medium' | 'bold' | 'black';
  readability: 'excellent' | 'good' | 'fair';
  style: 'modern' | 'classic' | 'playful' | 'professional' | 'elegant';
  googleFont?: boolean;
};

export const FONT_OPTIONS: FontOption[] = [
  // Display Fonts (Timer-focused)
  { name: 'Marmelat Black', category: 'display', description: 'Bold and striking display font', weight: 'black', readability: 'excellent', style: 'modern' },
  { name: 'Orbitron', category: 'display', description: 'Futuristic digital-style font', weight: 'bold', readability: 'excellent', style: 'modern', googleFont: true },
  { name: 'Rajdhani', category: 'display', description: 'Clean geometric font with excellent legibility', weight: 'bold', readability: 'excellent', style: 'modern', googleFont: true },
  { name: 'Exo 2', category: 'display', description: 'Contemporary technological feel', weight: 'bold', readability: 'excellent', style: 'modern', googleFont: true },
  { name: 'Audiowide', category: 'display', description: 'Digital display inspired font', weight: 'bold', readability: 'good', style: 'modern', googleFont: true },
  { name: 'Bai Jamjuree', category: 'display', description: 'Modern Thai-inspired sans-serif', weight: 'bold', readability: 'excellent', style: 'modern', googleFont: true },
  
  // Sans-Serif (Professional & Clean)
  { name: 'Inter', category: 'sans-serif', description: 'Designed for computer screens', weight: 'medium', readability: 'excellent', style: 'professional', googleFont: true },
  { name: 'Poppins', category: 'sans-serif', description: 'Geometric sans-serif, very readable', weight: 'medium', readability: 'excellent', style: 'modern', googleFont: true },
  { name: 'Roboto', category: 'sans-serif', description: 'Google\'s signature font family', weight: 'medium', readability: 'excellent', style: 'professional', googleFont: true },
  { name: 'Open Sans', category: 'sans-serif', description: 'Optimized for legibility across devices', weight: 'medium', readability: 'excellent', style: 'professional', googleFont: true },
  { name: 'Lato', category: 'sans-serif', description: 'Warm and friendly, yet serious', weight: 'medium', readability: 'excellent', style: 'professional', googleFont: true },
  { name: 'Montserrat', category: 'sans-serif', description: 'Elegant urban typography', weight: 'medium', readability: 'good', style: 'elegant', googleFont: true },
  { name: 'Source Sans Pro', category: 'sans-serif', description: 'Adobe\'s first open source font', weight: 'medium', readability: 'excellent', style: 'professional', googleFont: true },
  { name: 'Nunito', category: 'sans-serif', description: 'Rounded sans-serif, friendly feel', weight: 'medium', readability: 'good', style: 'playful', googleFont: true },
  { name: 'Work Sans', category: 'sans-serif', description: 'Optimized for work environments', weight: 'medium', readability: 'excellent', style: 'professional', googleFont: true },
  { name: 'Manrope', category: 'sans-serif', description: 'Modern geometric with open forms', weight: 'medium', readability: 'excellent', style: 'modern', googleFont: true },
  
  // Serif (Classic & Elegant)
  { name: 'Playfair Display', category: 'serif', description: 'High-contrast serif, very elegant', weight: 'bold', readability: 'good', style: 'elegant', googleFont: true },
  { name: 'Merriweather', category: 'serif', description: 'Designed for comfortable reading', weight: 'bold', readability: 'excellent', style: 'classic', googleFont: true },
  { name: 'Crimson Text', category: 'serif', description: 'Inspired by old-style serif fonts', weight: 'medium', readability: 'good', style: 'classic', googleFont: true },
  { name: 'Libre Baskerville', category: 'serif', description: 'Classic serif with modern touch', weight: 'bold', readability: 'good', style: 'classic', googleFont: true },
  
  // Monospace (Code-like)
  { name: 'JetBrains Mono', category: 'monospace', description: 'Designed for developers', weight: 'medium', readability: 'excellent', style: 'professional', googleFont: true },
  { name: 'Fira Code', category: 'monospace', description: 'Monospace with programming ligatures', weight: 'medium', readability: 'excellent', style: 'professional', googleFont: true },
  { name: 'Source Code Pro', category: 'monospace', description: 'Adobe\'s monospace font', weight: 'medium', readability: 'excellent', style: 'professional', googleFont: true },
  { name: 'Space Mono', category: 'monospace', description: 'Original monospace for headlines', weight: 'bold', readability: 'good', style: 'modern', googleFont: true },
  { name: 'Roboto Mono', category: 'monospace', description: 'Google\'s monospace variant', weight: 'medium', readability: 'excellent', style: 'professional', googleFont: true },
  
  // Handwriting (Creative)
  { name: 'Kalam', category: 'handwriting', description: 'Handwriting font with personality', weight: 'bold', readability: 'fair', style: 'playful', googleFont: true },
  { name: 'Caveat', category: 'handwriting', description: 'Casual handwriting style', weight: 'bold', readability: 'fair', style: 'playful', googleFont: true },
];

// Legacy support - extract just the font names for backward compatibility
export const FONT_NAMES = FONT_OPTIONS.map(font => font.name);

// Category display names
export const CATEGORY_LABELS: Record<FontCategory, string> = {
  'display': 'Display',
  'sans-serif': 'Sans-Serif', 
  'serif': 'Serif',
  'monospace': 'Monospace',
  'handwriting': 'Handwriting'
};

// Category descriptions
export const CATEGORY_DESCRIPTIONS: Record<FontCategory, string> = {
  'display': 'Bold fonts designed for timers and headlines',
  'sans-serif': 'Clean, modern fonts without serifs',
  'serif': 'Classic fonts with decorative strokes',
  'monospace': 'Fixed-width fonts with technical feel',
  'handwriting': 'Casual, handwritten-style fonts'
};

// Create a context with default values
const AppearanceContext = createContext<AppearanceContextType>({
  font: 'Marmelat Black',
  setFont: () => {},
  appearanceSettings: {
    font: 'Marmelat Black',
  },
  updateAppearanceSettings: () => {},
});

// Custom hook to use the appearance context
export const useAppearance = () => useContext(AppearanceContext);

// Appearance provider component
export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage values or defaults
  const [font, setFontState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('font');
      return saved && FONT_NAMES.includes(saved as any) ? saved : 'Marmelat Black';
    }
    return 'Marmelat Black';
  });

  // Load Marmelat Black font and Google Fonts on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load Marmelat Black font (local)
      const styleId = 'marmelat-black-font';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          @font-face {
            font-family: "Marmelat Black";
            src: local("Marmelat Black"),
                 url("/fonts/Marmelat Black.woff") format("woff");
            font-weight: bold;
            font-display: swap;
          }
        `;
        document.head.appendChild(style);
      }
      
      // Load Google Fonts
      const googleFontsId = 'google-fonts-timer';
      if (!document.getElementById(googleFontsId)) {
        const googleFonts = FONT_OPTIONS
          .filter(font => font.googleFont)
          .map(font => font.name.replace(' ', '+'))
          .join('|');
        
        const link = document.createElement('link');
        link.id = googleFontsId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${googleFonts.replace('|', '&family=')}:wght@400;500;600;700;900&display=swap`;
        document.head.appendChild(link);
      }
    }
  }, []); // Run once on mount

  // Update localStorage when font changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('font', font);
      // Apply font only to timer elements via CSS custom property
      document.documentElement.style.setProperty('--timer-font-family', font);
    }
  }, [font]);

  // Helper functions with localStorage sync
  const setFont = (newFont: string) => {
    if (FONT_NAMES.includes(newFont as any)) {
      setFontState(newFont);
    }
  };

  // Bulk update function
  const updateAppearanceSettings = (settings: Partial<AppearanceSettings>) => {
    if (settings.font !== undefined) {
      setFont(settings.font);
    }
  };

  // Create appearance settings object
  const appearanceSettings: AppearanceSettings = {
    font,
  };

  // Context value
  const contextValue = {
    font,
    setFont,
    appearanceSettings,
    updateAppearanceSettings,
  };

  return (
    <AppearanceContext.Provider value={contextValue}>
      {children}
    </AppearanceContext.Provider>
  );
};
