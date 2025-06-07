import Timer, {TimerRef} from "@/components/Timer";
import { useRef, useState, useEffect } from "react";
import MainLayout from "@/layouts/main";
import { Button } from "@heroui/button";
import SettingsModal from "@/components/SettingsModal";
import AnimatedIconButton from "@/components/AnimatedIconButton";
import { IoSettingsOutline } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { useAccentColorManager } from "@/contexts/AccentColorContext";

import { IoRefreshSharp } from "react-icons/io5";
import AnimatedModeSwitcher from "@/components/AnimatedModeSwitcher";

export default function DashboardPage() {
  document.title = "Dashboard | Seika";

  const timerRef = useRef<TimerRef>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [selectedTab, setSelectedTab] = useState("pomo");
  const [showBlur, setShowBlur] = useState(false);
  const { colorVariations } = useAccentColorManager();

  // Check if settings modal should be open based on URL
  const isSettingsOpen = searchParams.get('modal') === 'settings';

  // Handle temporary blur effect when mode is switched
  useEffect(() => {
    if (showBlur) {
      const timer = setTimeout(() => {
        setShowBlur(false);
      }, 2000); // Blur disappears after 2 seconds (shorter delay)

      return () => clearTimeout(timer);
    }
  }, [showBlur]);

  const handleModeSwitch = (mode: string) => {
    setSelectedTab(mode);
    setShowBlur(true); // Trigger temporary blur
  };

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
          
          <AnimatedModeSwitcher
            defaultSelected="pomo"
            onSelectionChange={handleModeSwitch}

            className="mb-[-1.2rem] z-10"
          />

          <Timer ref={timerRef} displayClassName="font-bold text-white"  style={{ fontFamily: "Marmelat Black", fontSize: "10.5rem", margin: '-2rem 0' }} displayStyle={{ textShadow: '0 4px 30px rgba(0, 0, 0, 0.35), 0 12px 30px rgba(0, 0, 0, 0.4)'}} />

          

          <div className="flex gap-4 mt-[-1.5rem] justify-center items-center">
            <AnimatedIconButton
              onClick={handleOpenSettings}
              icon={<IoSettingsOutline />}
              variant="settings"
              size={38}
            />
            <AnimatedIconButton
              onClick={() => {
                timerRef.current?.reset();
                setStarted(false);
                setRunning(false);
              }}
              icon={<IoRefreshSharp />}
              variant="reset"
              size={42}
            />
            
            <Button
              onPress={started ? (running ? handlePause : handleResume) : handleStart}
              variant={started ? (running ? "ghost" : "solid") : "solid"}
              color="primary"
              size="lg"
              radius="full"
              style={{
                fontSize: '1.65rem', 
                padding: '1.78rem 2.5rem',
                '--heroui-primary': colorVariations[500],
                '--heroui-primary-foreground': '#ffffff',
                ...(started && running ? {
                  borderColor: `${colorVariations[400]}50`,
                  boxShadow: `0 4px 12px ${colorVariations[500]}20`,
                } : {}),
              } as React.CSSProperties}
              className={`
                ${started && running 
                  ? 'text-white bg-transparent hover:bg-primary-500/20' 
                  : 'relative overflow-hidden'
                }
                transition-all duration-300 ease-out
                hover:scale-[1.01] hover:shadow-sm
                active:scale-95
                ${started && running 
                  ? `border-2 hover:border-primary-400/70` 
                  : ''
                }
                ${!started || !running ? `
                  before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent 
                  before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none
                ` : ''}
              `}
            >
            
              {started ? (running ? 'Pause' : 'Resume') : 'Start'}
            </Button>

            {/* <Button

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

<div className="absolute bottom-2 left-1/2 w-60 h-20 translate-x-[-50%] " > 
      <div className="relative h-16 overflow-hidden mb-1">
            <div 
              className={`
                absolute inset-0 flex items-center justify-center
                transition-all duration-300 ease-in-out
                ${selectedTab === 'pomo' ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-8'}
              `}
            >
              <div className={`text-center rounded-lg px-4 py-2 transition-all duration-500 ease-out ${showBlur ? 'backdrop-blur-sm border border-white/10 bg-white/5' : 'backdrop-blur-none border border-transparent bg-transparent'}`}>
                <div 
                  className="text-white text-lg font-medium" 
                  style={{ 
                    textShadow: '0 0 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.1)' 
                  }}
                >
                  Focus Session
                </div>
                <div 
                  className="text-white/80 text-sm" 
                  style={{ 
                    textShadow: '0 0 15px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.5)' 
                  }}
                >
                  25 minutes of focused work
                </div>
              </div>
            </div>
            
            <div 
              className={`
                absolute inset-0 flex items-center justify-center
                transition-all duration-300 ease-in-out
                ${selectedTab === 'free' ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform -translate-x-8'}
              `}
            >
              <div className={`text-center rounded-lg px-4 py-2 transition-all duration-500 ease-out ${showBlur ? 'backdrop-blur-sm border border-white/10 bg-white/5' : 'backdrop-blur-none border border-transparent bg-transparent'}`}>
                <div 
                  className="text-white text-lg font-medium" 
                  style={{ 
                    textShadow: '0 0 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.1)' 
                  }}
                >
                  Free Timer
                </div>
                <div 
                  className="text-white/80 text-sm" 
                  style={{ 
                    textShadow: '0 0 15px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.5)' 
                  }}
                >
                  Unlimited time tracking
                </div>
              </div>
            </div>
          </div>
</div>
      </section>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onSave={handleSaveSettings}
      />
    </MainLayout>
  );
}
