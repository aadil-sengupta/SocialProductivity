import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ContextMenuState {
  isAnyMenuOpen: boolean;
  setIsAnyMenuOpen: (isOpen: boolean) => void;
}

const ContextMenuContext = createContext<ContextMenuState | undefined>(undefined);

export const useContextMenu = () => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('useContextMenu must be used within a ContextMenuProvider');
  }
  return context;
};

interface ContextMenuProviderProps {
  children: ReactNode;
}

export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({ children }) => {
  const [isAnyMenuOpen, setIsAnyMenuOpen] = useState(false);

  return (
    <ContextMenuContext.Provider value={{ isAnyMenuOpen, setIsAnyMenuOpen }}>
      {children}
    </ContextMenuContext.Provider>
  );
};
