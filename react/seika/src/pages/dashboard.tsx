import Timer, {TimerRef} from "@/components/Timer";
import { useRef, useState } from "react";
import MainLayout from "@/layouts/main";
import { Button } from "@heroui/button";
import SettingsModal from "@/components/SettingsModal";
import { IoSettingsOutline } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";

import { MdOutlineTimerOff } from "react-icons/md";
import { IoTimer, IoRefreshSharp } from "react-icons/io5";
import { Tabs, Tab } from "@heroui/react";

export default function DashboardPage() {
  const timerRef = useRef<TimerRef>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);

  // Check if settings modal should be open based on URL
  const isSettingsOpen = searchParams.get('modal') === 'settings';

  const handleStart = () => {
    timerRef.current?.start(300); // Start 5-minute timer
    setStarted(true);
    setRunning(true);
  };

  const handlePause = () => {
    timerRef.current?.pause();
    setRunning(false);
  };

  const handleResume = () => {
    timerRef.current?.resume();
    setRunning(true);
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
        <div className="justify-center flex flex-col">

          <Tabs radius={'full'} size='lg' style={{opacity: 0.7, margin: '0 auto', borderRadius: 50}} className="backdrop-blur-lg">
            <Tab key="pomo" title={<div className="flex items-center gap-2"><IoTimer fontSize={'1.65rem'} /> Pomodoro</div>} style={{ fontSize: "1.35rem" }} />
            <Tab key="Free" title={<div className="flex items-center gap-2"><MdOutlineTimerOff fontSize={'1.45rem'} /> Free</div>} style={{ fontSize: "1.35rem" }} />
          </Tabs>

          <Timer ref={timerRef} displayClassName="font-bold text-white"  style={{ fontFamily: "Marmelat Black", fontSize: "10.5rem", margin: '-2rem 0' }} displayStyle={{ textShadow: '0 4px 30px rgba(0, 0, 0, 0.35), 0 12px 30px rgba(0, 0, 0, 0.4)'}} />

          <div className="flex gap-4 mt-[-0.7rem] justify-center items-center">
            <Button
              onPress={handleOpenSettings}
              variant="light"
              isIconOnly={true}
            >
              <IoSettingsOutline color="white" size={38} />
            </Button>
                        <Button
              onPress={()=> {
                timerRef.current?.reset();
                setStarted(false);
                setRunning(false);
              }}
              variant="light"
              isIconOnly={true}
            >
              <IoRefreshSharp color="white" size={42} />
            </Button>
            
            <Button
              onPress={started ? (running ? handlePause : handleResume) : handleStart}
              variant={started ? (running ? "ghost" : "shadow") : "shadow"}

              color={started ? (running ? "default" : "secondary") : "secondary"}
              size="lg"
              radius="full"
              style={{fontSize: '1.65rem', padding: '1.78rem 2.5rem'}}
              className="text-white border-white"
            >
              {started ? (running ? 'Pause' : 'Resume') : 'Start'}
            </Button>

            {/* <Button
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
            </Button> */}
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
