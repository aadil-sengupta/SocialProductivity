import { useDarkMode } from '@/contexts/DarkModeContext';
import { useWallpaper } from '@/contexts/WallpaperContext';

export default function Wallpaper() {
    // Logic to select wallpaper from user settings
    const { isDarkMode } = useDarkMode();
    const { selectedWallpaper, wallpaperBlur } = useWallpaper();

  return (
    <div className="absolute inset-0 z-0">
      <style>{`
        .wallpaper-container {
          border: 12px solid ${isDarkMode ? 'black' : 'white'};
          border-left: 0;
          border-radius: 12px;
          overflow: hidden;
        }
        .wallpaper-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }
      `}</style>
      <div className="wallpaper-container absolute inset-0">
        <img
          src={`/wallpapers/${selectedWallpaper}`}
          alt="Wallpaper"
          className={`wallpaper-image transition-all duration-500`}
          style={{ filter: wallpaperBlur ? 'blur(3.5px)' : 'none' }}
        />
      </div>
      {/* <div className="absolute inset-0 bg-black opacity-50" /> */}
    </div>
  );
}
// This component renders a full-screen wallpaper image with a dark overlay.