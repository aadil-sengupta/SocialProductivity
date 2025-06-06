import { cn } from "@heroui/react";
import { useState } from "react";
import FormOption from "./FormOption";
import { useWallpaper } from "@/contexts/WallpaperContext";

interface WallpaperPickerProps {
  className?: string;
}

export default function WallpaperPicker({ className }: WallpaperPickerProps) {
    const { 
        selectedWallpaper, 
        wallpaperBlur, 
        setSelectedWallpaper, 
        setWallpaperBlur, 
        wallpapers 
    } = useWallpaper();
    const [showAll, setShowAll] = useState(false);
    
    // Show only first 6 wallpapers initially, or all if showAll is true
    const displayedWallpapers = showAll ? wallpapers : wallpapers.slice(0, 5);
    const hasMoreWallpapers = wallpapers.length > 5;

    return (
        <div className={cn("flex flex-col gap-3", className)}>
            <h4 className="text-medium font-semibold">Wallpaper</h4>
            <FormOption
                title="Blur Wallpaper"
                description="Enable to apply a blur effect to the selected wallpaper."
                isSelected={wallpaperBlur}
                onChange={(selected) => setWallpaperBlur(selected)}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5  gap-4">
                {displayedWallpapers.map(wallpaper => (
                    <div 
                        key={wallpaper.name} 
                        className={cn(
                            "relative cursor-pointer rounded-md overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg",
                            selectedWallpaper === wallpaper.fileName && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        )} 
                        onClick={() => setSelectedWallpaper(wallpaper.fileName)}
                    >
                        <img
                            src={`wallpaper-thumbnails/${wallpaper.fileName}`} 
                            alt={wallpaper.name} 
                            className="w-full object-cover aspect-[16/9]"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200" />
                        {selectedWallpaper === wallpaper.fileName && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {hasMoreWallpapers && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="text-sm text-primary hover:text-primary-600 transition-colors duration-200 self-start"
                >
                    {showAll ? "Show Less" : `Show More (${wallpapers.length - 6} more)`}
                </button>
            )}

        </div>
    );
}
