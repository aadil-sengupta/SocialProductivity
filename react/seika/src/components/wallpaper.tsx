import { useDarkMode } from '@/contexts/DarkModeContext';

export default function Wallpaper() {
    // Logic to select wallpaper from user settings
    const { isDarkMode } = useDarkMode();

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
          src="/wallpapers/purple-gradient.jpg"
          alt="Wallpaper"
          className="wallpaper-image"
        />
      </div>
      {/* <div className="absolute inset-0 bg-black opacity-50" /> */}
    </div>
  );
}
// This component renders a full-screen wallpaper image with a dark overlay.