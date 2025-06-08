import Timer, {TimerRef} from "@/components/Timer";
import { useRef, useState, useEffect } from "react";
import MainLayout from "@/layouts/main";
import { Button } from "@heroui/button";
import SettingsModal from "@/components/SettingsModal";
import AnimatedIconButton from "@/components/AnimatedIconButton";
import { IoSettingsOutline } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { useAccentColorManager } from "@/contexts/AccentColorContext";
import { useTimer } from "@/contexts/TimerContext";
import { IoRefreshSharp } from "react-icons/io5";
import AnimatedModeSwitcher from "@/components/AnimatedModeSwitcher";
import AnimatedTimerStatus from "@/components/AnimatedTimerStatus";
import DigitalClock from "@/components/DigitalClock";

export default function DashboardPage() {
  document.title = "Dashboard | Seika";

  const timerRef = useRef<TimerRef>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [selectedTab, setSelectedTab] = useState("pomo");
  const [showBlur, setShowBlur] = useState(false);
  const [timerMode, setTimerMode] = useState<'countup' | 'countdown'>('countdown'); // New timer mode state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { colorVariations } = useAccentColorManager();
  const { 
      pomodoroMinutes, 
      mode: timerContextMode,
      // shortBreakMinutes, 
      // longBreakMinutes, 
      // longBreakInterval,
      // setPomodoroMinutes,
      // setShortBreakMinutes,
      // setLongBreakMinutes,
      // setLongBreakInterval
    } = useTimer();

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

  // Reset timer when pomodoro duration changes
  useEffect(() => {
    if (timerRef.current) {
      timerRef.current.reset();
      setStarted(false);
      setRunning(false);
    }
  }, [pomodoroMinutes]);

  // Reset document title when component unmounts or timer stops
  useEffect(() => {
    return () => {
      document.title = "Dashboard | Seika";
    };
  }, []);

  // Reset document title when timer is not running
  useEffect(() => {
    if (!running) {
      document.title = "Dashboard | Seika";
    }
  }, [running]);

  const handleModeSwitch = (mode: string) => {
    setSelectedTab(mode);
    setShowBlur(true); // Trigger temporary blur
  };

  const handleStart = () => {
    setIsTransitioning(true);
    
    // Small delay to allow transition animation to begin
    setTimeout(() => {
      setStarted(true);
      setRunning(true);
      
      // Use pomodoroMinutes for duration (convert to seconds)
      const durationInSeconds = pomodoroMinutes * 60;
      
      if (timerMode === 'countdown') {
        timerRef.current?.start(durationInSeconds); // Start countdown timer
      } else {
        timerRef.current?.start(durationInSeconds); // Start countup timer with end value
      }
      
      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 200);
  };

  const handlePause = () => {
    timerRef.current?.pause();
    setRunning(false);
  };

  const handleResume = () => {
    timerRef.current?.resume();
    setRunning(true);
  };

  const handleEnd = () => {
    setIsTransitioning(true);
    
    // Small delay to allow transition animation to begin
    setTimeout(() => {
      // Reset timer state
      setStarted(false);
      setRunning(false);
      
      // Reset the timer component
      timerRef.current?.reset();
      
      // Show completion notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Complete!', {
          body: `Your ${selectedTab === 'pomo' ? 'focus session' : 'timer'} has finished.`,
          icon: '/favicon.ico',
          tag: 'timer-complete'
        });
      }
      
      // Play completion sound (if audio element exists)
      const audio = document.getElementById('timer-complete-sound') as HTMLAudioElement;
      if (audio) {
        audio.play().catch(e => console.warn('Could not play completion sound:', e));
      }
      
      // Optional: Show browser notification if page is not visible
      if (document.hidden) {
        document.title = '⏰ Timer Complete! - Seika';
      }
      
      console.log('Timer completed successfully');
      
      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 200);
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

  // Map timer context mode to AnimatedTimerStatus mode
  const getAnimatedStatusMode = () => {
    if (selectedTab === 'free') return 'free';
    // For pomodoro mode, use the context mode if available
    switch (timerContextMode) {
      case 'shortBreak': return 'shortBreak';
      case 'longBreak': return 'longBreak';
      case 'pomodoro':
      default: return 'pomo';
    }
  };

  return (
    <MainLayout>
      {/* Digital Clock - Top Right Corner */}
      <div className="absolute top-6 right-8 z-30">
        <DigitalClock 
          className=""
          showDate={true}
          showSeconds={false}
          format24h={false}
        />
      </div>

      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 z-20 h-full relative">
        <div className="justify-center flex flex-col">
          
          {/* Animated transition container for mode switcher and timer status */}
          <div className="relative h-16 mb-[-1.2rem] z-10 overflow-visible">
            {/* Mode Switcher */}
            <div 
              className={`
                absolute inset-0 transition-all duration-700 ease-in-out
                ${!started && !isTransitioning 
                  ? 'opacity-100 transform translate-y-0 scale-100' 
                  : 'opacity-0 transform translate-y-4 scale-95 pointer-events-none'
                }
              `}
            >
              <AnimatedModeSwitcher
                defaultSelected="pomo"
                onSelectionChange={handleModeSwitch}
                disabled={started || isTransitioning}
                className="w-full"
              />
            </div>
            
            {/* Timer Status */}
            <div 
              className={`
                absolute inset-0 transition-all duration-700 ease-in-out
                ${started && !isTransitioning 
                  ? 'opacity-100 transform translate-y-0 scale-100' 
                  : 'opacity-0 transform -translate-y-4 scale-95 pointer-events-none'
                }
              `}
            >
              <AnimatedTimerStatus
                mode={getAnimatedStatusMode()}
                isRunning={running}
                className="w-full"
              />
            </div>
            
            {/* Transition Effect Overlay */}
            <div 
              className={`
                absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                transition-all duration-500 ease-in-out pointer-events-none
                ${isTransitioning 
                  ? 'opacity-100 transform translate-x-full' 
                  : 'opacity-0 transform -translate-x-full'
                }
              `}
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                animation: isTransitioning ? 'shimmer 0.8s ease-in-out' : 'none',
              }}
            />
          </div>

          <Timer 
            ref={timerRef} 
            displayClassName="font-bold text-white"  
            style={{ fontFamily: "Marmelat Black", fontSize: "10.5rem", margin: '-2rem 0' }} 
            displayStyle={{ textShadow: '0 4px 30px rgba(0, 0, 0, 0.35), 0 12px 30px rgba(0, 0, 0, 0.4)'}} 
            countUp={timerMode === 'countup'}
            initialTime={timerMode === 'countdown' ? pomodoroMinutes * 60 : 0}
            endValue={timerMode === 'countup' ? pomodoroMinutes * 60 : undefined}
            onTimerEnd={handleEnd}
          />

          

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
                  {`${pomodoroMinutes} minutes of focused work`}
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
      
      {/* CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </MainLayout>
  );
}
