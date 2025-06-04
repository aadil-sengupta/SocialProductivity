import Timer, {TimerRef} from "@/components/Timer";
import { useRef } from "react";
import MainLayout from "@/layouts/main";
import { Button } from "@heroui/button";
import SettingsModal from "@/components/SettingsModal";
import { IoSettingsOutline } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { useAccentColor } from "@/contexts/AccentColorContext";

export default function DashboardPage() {
  const timerRef = useRef<TimerRef>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const accentColors = useAccentColor();
  
  // Check if settings modal should be open based on URL
  const isSettingsOpen = searchParams.get('modal') === 'settings';

  const handleStart = () => {
    timerRef.current?.start(300); // Start 5-minute timer
  };

  const handlePause = () => {
    timerRef.current?.pause();
  };

  const handleResume = () => {
    timerRef.current?.resume();
  };

  const handleOpenSettings = () => {
    // Update URL to show modal without page refresh
    setSearchParams({ modal: 'settings' });
  };

  const handleCloseSettings = () => {
    // Remove modal parameter from URL
    setSearchParams({});
  };

  const handleSaveSettings = () => {
    // Here you would typically save the settings to localStorage, context, or API
    // For now, we'll just close the modal
    handleCloseSettings();
  };

  return (
    <MainLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 z-20 h-full relative">
        <div className="inline-block justify-center">
          <Timer ref={timerRef} displayClassName="font-bold text-white" style={{ fontFamily: "The Bold Font", fontSize: "5rem" }} />
          <div className="flex gap-4 mt-4">
            <Button
              onPress={handleOpenSettings}
              variant="light"
              isIconOnly={true}
            >
              <IoSettingsOutline color="white" size={24} />
            </Button>
            <Button
              onPress={handleStart}
              variant="solid"
              className="bg-accent hover:bg-accent-600 text-accent-foreground"
            >
              Start
            </Button>
            <Button
              onPress={handlePause}
              variant="bordered"
              className="border-accent text-accent hover:bg-accent-50"
            >
              Pause
            </Button>
            <Button
              onPress={handleResume}
              variant="bordered"
              className="border-accent text-accent hover:bg-accent-50"
            >
              Resume
            </Button>
          </div>
        </div>
      </section>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onSave={handleSaveSettings}
      />
    </MainLayout>
  );
}
