import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Offline mode context type
interface OfflineModeContextType {
  // Offline mode state
  isOfflineMode: boolean;
  
  // Methods to control offline mode
  toggleOfflineMode: () => void;
  setOfflineMode: (enabled: boolean) => void;
}

interface OfflineModeProviderProps {
  children: ReactNode;
}

// Create context
const OfflineModeContext = createContext<OfflineModeContextType | undefined>(undefined);

const STORAGE_KEY = 'seika-offline-mode';

export const OfflineModeProvider: React.FC<OfflineModeProviderProps> = ({ children }) => {
  // Initialize offline mode from localStorage or default to false
  const [isOfflineMode, setIsOfflineModeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === 'true';
    }
    return false;
  });

  // Save to localStorage whenever offline mode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, isOfflineMode.toString());
    }
  }, [isOfflineMode]);

  // Methods to control offline mode
  const setOfflineMode = (enabled: boolean) => {
    console.log(`🔄 [OfflineMode] ${enabled ? 'Enabling' : 'Disabling'} offline mode`);
    setIsOfflineModeState(enabled);
  };

  const toggleOfflineMode = () => {
    setOfflineMode(!isOfflineMode);
  };

  const contextValue: OfflineModeContextType = {
    isOfflineMode,
    toggleOfflineMode,
    setOfflineMode,
  };

  return (
    <OfflineModeContext.Provider value={contextValue}>
      {children}
    </OfflineModeContext.Provider>
  );
};

// Hook to use offline mode context
export const useOfflineMode = () => {
  const context = useContext(OfflineModeContext);
  if (context === undefined) {
    throw new Error('useOfflineMode must be used within an OfflineModeProvider');
  }
  return context;
};

export default OfflineModeContext;
