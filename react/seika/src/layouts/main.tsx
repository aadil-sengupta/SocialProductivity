import SideBar from "@/components/SideBar";
import Wallpaper from "@/components/wallpaper";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen bg-white"> {/*bg-[var(--main-bg)]*/}
      <SideBar />
      <main className="flex-grow px-6 pt-4 relative">        
        {children}
        <Wallpaper />
      </main>

    </div>

  );
}
