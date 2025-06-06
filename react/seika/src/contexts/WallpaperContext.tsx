import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the wallpaper interface
export interface Wallpaper {
  name: string;
  fileName: string;
  author: string;
}

// Available wallpapers data
export const wallpapers: Wallpaper[] = [
  { name: "Purple Gradient", fileName: "purple-gradient.jpg", author: "Milad Fakurian" },
  { name: "Japan Sunset", fileName: "japan-sunset.jpg", author: "AI Generated" },
  { name: "Japan Coastal Landscape", fileName: "japan-coastal-landscape.jpg", author: "AI Generated" },
  { name: "Japan Street", fileName: "japan-street.jpg", author: "" },
  { name: "Japan Mountain", fileName: "japan-mountain.jpg", author: "" },
  { name: "Purple Gradient", fileName: "purple-gradient.jpg", author: "Milad Fakurian" },
  { name: "Japan Sunset", fileName: "japan-sunset.jpg", author: "AI Generated" },
  { name: "Japan Coastal Landscape", fileName: "japan-coastal-landscape.jpg", author: "AI Generated" },
  { name: "Japan Street", fileName: "japan-street.jpg", author: "" },
  { name: "Japan Mountain", fileName: "japan-mountain.jpg", author: "" },
];

type WallpaperContextType = {
  selectedWallpaper: string | null;
  wallpaperBlur: boolean;
  setSelectedWallpaper: (fileName: string) => void;
  setWallpaperBlur: (blur: boolean) => void;
  getSelectedWallpaper: () => Wallpaper | null;
  wallpapers: Wallpaper[];
};

// Create a context with a default value
const WallpaperContext = createContext<WallpaperContextType>({
  selectedWallpaper: null,
  wallpaperBlur: false,
  setSelectedWallpaper: () => {},
  setWallpaperBlur: () => {},
  getSelectedWallpaper: () => null,
  wallpapers: [],
});

// Custom hook to use the wallpaper context
export const useWallpaper = () => useContext(WallpaperContext);

// Wallpaper provider component
export const WallpaperProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize selected wallpaper from localStorage or default to first wallpaper
  const [selectedWallpaper, setSelectedWallpaperState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const savedWallpaper = localStorage.getItem('selectedWallpaper');
      return savedWallpaper || wallpapers[0]?.fileName || null;
    }
    return wallpapers[0]?.fileName || null;
  });

  // Initialize wallpaper blur from localStorage or default to false
  const [wallpaperBlur, setWallpaperBlurState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedBlur = localStorage.getItem('wallpaperBlur');
      return savedBlur ? JSON.parse(savedBlur) : false;
    }
    return false;
  });

  // Update localStorage when selectedWallpaper changes
  useEffect(() => {
    if (selectedWallpaper && typeof window !== 'undefined') {
      localStorage.setItem('selectedWallpaper', selectedWallpaper);
    }
  }, [selectedWallpaper]);

  // Update localStorage when wallpaperBlur changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wallpaperBlur', JSON.stringify(wallpaperBlur));
    }
  }, [wallpaperBlur]);

  // Function to set selected wallpaper
  const setSelectedWallpaper = (fileName: string) => {
    setSelectedWallpaperState(fileName);
  };

  // Function to set wallpaper blur
  const setWallpaperBlur = (blur: boolean) => {
    setWallpaperBlurState(blur);
  };

  // Function to get the currently selected wallpaper object
  const getSelectedWallpaper = (): Wallpaper | null => {
    if (!selectedWallpaper) return null;
    return wallpapers.find(wallpaper => wallpaper.fileName === selectedWallpaper) || null;
  };

  const contextValue: WallpaperContextType = {
    selectedWallpaper,
    wallpaperBlur,
    setSelectedWallpaper,
    setWallpaperBlur,
    getSelectedWallpaper,
    wallpapers,
  };

  return (
    <WallpaperContext.Provider value={contextValue}>
      {children}
    </WallpaperContext.Provider>
  );
};
