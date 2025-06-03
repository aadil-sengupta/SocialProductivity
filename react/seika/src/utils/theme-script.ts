// This script runs immediately during page load to prevent flash of wrong theme
export function themeScript() {
  return `
    (function() {
      // Get the saved theme from localStorage
      const theme = localStorage.getItem('theme');
      
      // Check if dark mode is preferred or was previously set
      const isDark = theme === 'dark' || 
        (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      // Apply dark class to body if needed
      if (isDark) {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    })();
  `;
}
