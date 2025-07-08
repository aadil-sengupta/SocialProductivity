import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
  showSidebar: () => void;
  hideSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  // Initialize sidebar visibility from localStorage or default to true
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarVisible');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  // Save to localStorage whenever sidebar visibility changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarVisible', isSidebarVisible.toString());
    }
  }, [isSidebarVisible]);

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  const showSidebar = () => {
    setIsSidebarVisible(true);
  };

  const hideSidebar = () => {
    setIsSidebarVisible(false);
  };

  const contextValue = {
    isSidebarVisible,
    toggleSidebar,
    showSidebar,
    hideSidebar,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};