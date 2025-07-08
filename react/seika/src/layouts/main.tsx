import SideBar from "@/components/SideBar";
import Wallpaper from "@/components/wallpaper";
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useSidebar } from '@/contexts/SidebarContext';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isDarkMode } = useDarkMode();
  const { isSidebarVisible } = useSidebar();

  return (
    <div className={`relative flex h-screen bg-${isDarkMode ? 'black' : 'white'}`}> {/*bg-[var(--main-bg)]*/}
      <Wallpaper />
      {isSidebarVisible && <SideBar />}
      <main className={`flex-grow px-6 pt-4 relative z-10 transition-all duration-300 ${isSidebarVisible ? 'pl-0' : 'pl-6'}`}>        
        {children}
      </main>

    </div>

  );
}
