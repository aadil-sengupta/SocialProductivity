import { cn } from "@heroui/react";
import { useState } from "react";
import FormOption from "./FormOption";
import { useWallpaper } from "@/contexts/WallpaperContext";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useAccentColorManager } from "@/contexts/AccentColorContext";

interface WallpaperPickerProps {
  className?: string;
}

export default function WallpaperPicker({ className }: WallpaperPickerProps) {
    const { 
        selectedWallpaper, 
        wallpaperBlur, 
        setSelectedWallpaper, 
        setWallpaperBlur, 
        wallpapers,
        getSelectedWallpaper
    } = useWallpaper();
    const { isDarkMode } = useDarkMode();
    const { accentColor } = useAccentColorManager();
    const [showAll, setShowAll] = useState(false);
    // const [hoveredWallpaper, setHoveredWallpaper] = useState<string | null>(null);
    
    // Show only first 6 wallpapers initially, or all if showAll is true
    const displayedWallpapers = showAll ? wallpapers : wallpapers.slice(0, 6);
    const hasMoreWallpapers = wallpapers.length > 6;

    return (
        <div className={cn("flex flex-col gap-6", className)}>
            {/* Header Section */}
            <div className="space-y-4">                
                {/* Blur Toggle */}
                <div className={`
                    p-4 rounded-xl border transition-all duration-300
                    ${isDarkMode 
                        ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/30 border-gray-700/50' 
                        : 'bg-gradient-to-r from-gray-50/80 to-white/60 border-gray-200/60'
                    }
                `}>
                    <FormOption
                        title="✨ Blur Effect"
                        description="Add a dreamy blur to your wallpaper for better text readability."
                        isSelected={wallpaperBlur}
                        onChange={(selected) => setWallpaperBlur(selected)}
                    />
                </div>
            </div>

            {/* Wallpaper Grid */}
            <div className="space-y-4">
                <div className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {displayedWallpapers.length} of {wallpapers.length} wallpapers
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {displayedWallpapers.map((wallpaper, index) => {
                        const isSelected = selectedWallpaper === wallpaper.fileName;
                        
                        return (
                            <div 
                                key={wallpaper.name}
                                className="group relative"
                                // onMouseEnter={() => setHoveredWallpaper(wallpaper.fileName)}
                                // onMouseLeave={() => setHoveredWallpaper(null)}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Main Card */}
                                <div 
                                    className={cn(
                                        "relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 ease-out",
                                        "transform-gpu hover:scale-105 hover:-translate-y-2",
                                        "shadow-lg hover:shadow-2xl",
                                        isSelected && "scale-105 -translate-y-1 shadow-2xl",
                                        isSelected && "ring-4 ring-blue-500/30 dark:ring-blue-400/40"
                                    )} 
                                    onClick={() => setSelectedWallpaper(wallpaper.fileName)}
                                >
                                    {/* Image */}
                                    <div className="relative overflow-hidden aspect-[16/10]">
                                        <img
                                            src={`wallpaper-thumbnails/${wallpaper.fileName}`} 
                                            alt={wallpaper.name} 
                                            className={cn(
                                                "w-full h-full object-cover transition-all duration-700",
                                                "group-hover:scale-110",
                                                isSelected && "scale-110"
                                            )}
                                        />
                                        
                                        {/* Selection Overlay */}
                                        <div className={cn(
                                            "absolute inset-0 transition-all duration-300",
                                            isSelected 
                                                ? "bg-blue-500/20" 
                                                : "bg-black/0 group-hover:bg-black/10"
                                        )} />
                                        
                                        {/* Selection Indicator */}
                                        {isSelected && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div 
                                                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-50 duration-300"
                                                    style={{ backgroundColor: accentColor }}
                                                >
                                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Hover Glow Effect */}
                                    <div className={cn(
                                        "absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl",
                                        isSelected ? "bg-blue-500/30" : "bg-white/20"
                                    )} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Selected Wallpaper Details */}
            {selectedWallpaper && getSelectedWallpaper() && (
                <div className={cn(
                    "p-6 rounded-2xl border transition-all duration-500 animate-in slide-in-from-bottom-3",
                    isDarkMode 
                        ? 'bg-gradient-to-br from-gray-800/60 via-gray-900/40 to-gray-800/20 border-gray-700/50' 
                        : 'bg-gradient-to-br from-blue-50/80 via-white/60 to-purple-50/40 border-blue-200/60'
                )}>
                    <div className="flex items-start gap-4">
                        {/* Mini Preview */}
                        <div className="flex-shrink-0">
                            <div className="w-16 h-10 rounded-lg overflow-hidden shadow-lg">
                                <img
                                    src={`wallpaper-thumbnails/${selectedWallpaper}`}
                                    alt="Selected wallpaper"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <span 
                                    className="text-sm font-bold"
                                    style={{ color: accentColor }}
                                >
                                    ✨ Currently Selected
                                </span>
                            </div>
                            <h5 className={`font-semibold text-base mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {getSelectedWallpaper()?.name}
                            </h5>
                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    📸 Photo by
                                </span>
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {getSelectedWallpaper()?.author}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Show More/Less Button */}
            {hasMoreWallpapers && (
                <div className="flex justify-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            "hover:scale-[1.02] border",
                            isDarkMode
                                ? "bg-gray-800/50 hover:bg-gray-700/50 border-gray-700/50"
                                : "bg-gray-50/50 hover:bg-gray-100/50 border-gray-200/50"
                        )}
                        style={{ 
                            color: accentColor,
                            borderColor: `${accentColor}30`
                        }}
                    >
                        {showAll ? (
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                                Show Less
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                Show {wallpapers.length - 6} More
                            </span>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
