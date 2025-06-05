import React, { useRef } from 'react';
import { useDarkMode } from '../contexts/DarkModeContext';
import './RadialThemeSwitcher.css';

const RadialThemeSwitcher: React.FC = () => {
  const { isDarkMode, toggleTheme } = useDarkMode();
  const bgMaskRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const duration = 400;

  const switchMode = () => {
    const bgMask = bgMaskRef.current;
    
    if (!bgMask) return;

    if (!isDarkMode) {
      // Switching to dark mode - pure black
      bgMask.style.backgroundColor = '#000000';
    } else {
      // Switching to light mode
      bgMask.style.backgroundColor = '#ffffff';
    }

    restartAnimation();
    
    // Use the context's toggle function
    setTimeout(() => {
      toggleTheme();
    }, duration / 2);
  };

  const restartAnimation = () => {
    const bgMask = bgMaskRef.current;
    if (!bgMask) return;

    bgMask.classList.remove('radial-animation');
    // Force reflow
    void bgMask.offsetWidth;
    bgMask.classList.add('radial-animation');
  };

  const handleClick = () => {
    const button = buttonRef.current;
    const bgMask = bgMaskRef.current;
    
    if (!button || !bgMask) return;

    // Get sidebar container for positioning context
    const sidebarContainer = button.closest('.sidebar-container');
    if (!sidebarContainer) return;

    // Get button position relative to sidebar container
    const sidebarRect = sidebarContainer.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    
    const relativeX = buttonRect.left - sidebarRect.left + buttonRect.width / 2;
    const relativeY = buttonRect.top - sidebarRect.top + buttonRect.height / 2;

    // Position the mask relative to sidebar container
    bgMask.style.left = `${relativeX}px`;
    bgMask.style.top = `${relativeY}px`;
    bgMask.style.transform = 'translate(-50%, -50%)';

    switchMode();
  };

  return (
    <>
      <button 
        ref={buttonRef}
        className="radial-theme-button"
        onClick={handleClick}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={isDarkMode ? "Light mode" : "Dark mode"}
      >
        <i style={{ fontSize: '1.25rem' }} className={`fas ${isDarkMode ? 'fa-moon' : 'fa-sun'} fa-lg`}></i>
      </button>
      <div 
        ref={bgMaskRef} 
        className="radial-bg-mask" 
        id="radial-bg-mask"
      />
    </>
  );
};

export default RadialThemeSwitcher;
