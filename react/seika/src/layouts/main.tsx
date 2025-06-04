import SideBar from "@/components/SideBar";
import Wallpaper from "@/components/wallpaper";
import { useDarkMode } from '@/contexts/DarkModeContext';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={`relative flex h-screen bg-${isDarkMode ? 'black' : 'white'}`}> {/*bg-[var(--main-bg)]*/}
      <SideBar />
      <main className="flex-grow px-6 pt-4 relative">        
        {children}
        <Wallpaper />
      </main>

    </div>

  );
}
