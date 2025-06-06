import React, { createContext, useContext, useEffect, useState } from 'react';

type DarkModeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
};

// Create a context with a default value
const DarkModeContext = createContext<DarkModeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

// Custom hook to use the dark mode context
export const useDarkMode = () => useContext(DarkModeContext);

// Dark mode provider component
export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the initial theme from localStorage or default to light mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('darkMode');
      // Check if user previously selected dark mode or if they prefer dark mode
      return savedDarkMode === 'true' || 
        (savedDarkMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false; // Default to light mode for SSR
  });

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };
  
  // Set theme directly
  const setTheme = (theme: 'light' | 'dark') => {
    setIsDarkMode(theme === 'dark');
  };

  // Apply theme class to body and save preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isDarkMode) {
        document.body.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.body.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
    }
  }, [isDarkMode]);

  // Context value
  const contextValue = {
    isDarkMode,
    toggleTheme,
    setTheme,
  };

  return (
    <DarkModeContext.Provider value={contextValue}>
      {children}
    </DarkModeContext.Provider>
  );
};
