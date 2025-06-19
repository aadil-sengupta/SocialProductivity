import React, { createContext, useContext, useEffect, useState } from 'react';

// Define the wallpaper interface
export interface Wallpaper {
  name: string;
  fileName: string;
  author: string;
}

// Available wallpapers data
export const wallpapers: Wallpaper[] = [
  { name: "Tropical Leaves", fileName: "leaves.jpg", author: "Pikisuperstar" },
  { name: "Purple Gradient", fileName: "purple-gradient.jpg", author: "Milad Fakurian" },
  { name: "Japan Sunset", fileName: "japan-sunset.jpg", author: "AI Generated" },
  { name: "Japan Coastal Landscape", fileName: "japan-coastal-landscape.jpg", author: "AI Generated" },
  { name: "Japan Street", fileName: "japan-street.jpg", author: "AI Generated" },
  { name: "Japan Mountain", fileName: "japan-mountain.jpg", author: "AI Generated" },
  { name: "Lake and Mountain", fileName: "pexels-eberhardgross-443446.jpg", author: "Eberhard Grossgasteiger" },
  { name: "Tree Nature View", fileName: "photorealistic-view-tree-nature-with-branches-trunk.jpg", author: "Freepik" },
  { name: "Mountain Lake Painting", fileName: "painting-mountain-lake-with-mountain-background.jpg", author: "AI Generated" },
  { name: "City Buildings at Sunset", fileName: "matt-nelson-dCNGrp_0GyM-unsplash.jpg", author: "Matt Nelson" },
  { name: "City Time Lapse", fileName: "rafael-de-nadai-b0eg-PYGICQ-unsplash.jpg", author: "Rafael de Nadai" },
  { name: "City Buildings Daytime", fileName: "pedro-lastra-Nyvq2juw4_o-unsplash.jpg", author: "Pedro Lastra" },
  { name: "Eiffel Tower at Dusk", fileName: "louie-martinez-IocJwyqRv3M-unsplash.jpg", author: "Louie Martinez" },
  { name: "Aerial City Night View", fileName: "andre-benz-JBkwaYMuhdc-unsplash.jpg", author: "Andre Benz" },
  { name: "City Night Time Lapse", fileName: "matteo-catanese-SdjIiAE2M1A-unsplash.jpg", author: "Matteo Catanese" },
];
//Photo by eberhard grossgasteiger: https://www.pexels.com/photo/lake-and-mountain-under-white-sky-443446/
//<a href="https://www.freepik.com/free-vector/tropical-leaves-background-zoom_8851807.htm#fromView=search&page=1&position=1&uuid=0b74a544-53cb-4e2f-819e-bbed68e9db77&query=Nature+Wallpaper">Image by freepik</a>
//Photo by <a href="https://unsplash.com/@mnelson?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Matt Nelson</a> on <a href="https://unsplash.com/photos/city-buildings-during-sunset-dCNGrp_0GyM?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
//Photo by <a href="https://unsplash.com/@andandoporai?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Rafael de Nadai</a> on <a href="https://unsplash.com/photos/time-lapse-photography-of-city-building-b0eg-PYGICQ?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
//Photo by <a href="https://unsplash.com/@peterlaster?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Pedro Lastra</a> on <a href="https://unsplash.com/photos/white-and-brown-city-buildings-during-daytime-Nyvq2juw4_o?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
//Photo by <a href="https://unsplash.com/@thetalkinglens?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Louie Martinez</a> on <a href="https://unsplash.com/photos/eiffel-tower-paris-during-dusk-IocJwyqRv3M?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
//Photo by <a href="https://unsplash.com/@trapnation?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Andre Benz</a> on <a href="https://unsplash.com/photos/an-aerial-view-of-a-city-at-night-JBkwaYMuhdc?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
//Photo by <a href="https://unsplash.com/@matteocatanese?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Matteo Catanese</a> on <a href="https://unsplash.com/photos/time-lapse-photography-of-city-at-night-SdjIiAE2M1A?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
//Leaves by pikisuperstar on Freepik
//Tree nature view by Freepik

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
