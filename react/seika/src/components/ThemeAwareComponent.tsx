import React from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

interface ThemeAwareComponentProps {
  children?: React.ReactNode;
}

const ThemeAwareComponent: React.FC<ThemeAwareComponentProps> = ({ children }) => {
  const { isDarkMode, toggleTheme } = useDarkMode();

  return (
    <div className="p-4 rounded-lg bg-[var(--main-container-bg)] shadow-md text-[var(--text-color)] transition-colors duration-200">
      <h2 className="text-xl font-bold mb-2">Current Theme: {isDarkMode ? 'Dark' : 'Light'}</h2>
      <p className="mb-4">This component is aware of the global theme state and can respond to theme changes.</p>
      <button
        onClick={toggleTheme}
        className="px-4 py-2 rounded-md bg-[var(--secondary-bg)] text-white hover:opacity-90 transition-opacity"
      >
        Toggle Theme
      </button>
      {children}
    </div>
  );
};

export default ThemeAwareComponent;
