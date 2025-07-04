import Timer, {TimerRef} from "@/components/Timer";
import { useRef, useState, useEffect } from "react";
import MainLayout from "@/layouts/main";
import { Button } from "@heroui/button";
import SettingsModal from "@/components/SettingsModal";
import ProfileModal from "@/components/profileModal";
import AlertModal from "@/components/AlertModal";
import { useAlert } from "@/hooks/useAlert";
import AnimatedIconButton from "@/components/AnimatedIconButton";
import { IoSettingsOutline } from "react-icons/io5";
import { useSearchParams } from "react-router-dom";
import { useAccentColorManager } from "@/contexts/AccentColorContext";
import { useTimer } from "@/contexts/TimerContext";
import { IoRefreshSharp } from "react-icons/io5";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import AnimatedModeSwitcher from "@/components/AnimatedModeSwitcher";
import AnimatedTimerStatus from "@/components/AnimatedTimerStatus";
import DigitalClock from "@/components/DigitalClock";
import RandomGreeting from "@/components/RandomGreeting";
import { BsCupHotFill } from "react-icons/bs";
import { HiMiniVideoCamera } from "react-icons/hi2";
import { useWebSocket, useWebSocketListener } from "@/contexts/WebSocketContext";
import { useOfflineMode } from "@/contexts/OfflineModeContext";
import { useNavigate } from 'react-router-dom';
import { useProfile } from "@/contexts/ProfileContext";

export default function DashboardPage() {
  // document.title = "Dashboard | Seika";
  const navigate = useNavigate();
  const pomoTimerRef = useRef<TimerRef>(null);
  const freeTimerRef = useRef<TimerRef>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [selectedTab, setSelectedTab] = useState("pomo");
  const [showBlur, setShowBlur] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [sessionPhase, setSessionPhase] = useState<'focus' | 'break' | 'focus-overtime' | 'break-overtime'>('focus'); // Track current session phase
  const [pomodoroCount, setPomodoroCount] = useState(0); // Track completed pomodoros for long break
  const { colorVariations } = useAccentColorManager();
  const { userName, profilePhoto } = useProfile();
  const { 
      pomodoroMinutes, 
      shortBreakMinutes, 
      longBreakMinutes, 
      longBreakInterval,
    } = useTimer();
    const { isConnected, sendMessage } = useWebSocket();
    const { alertState, showError, hideAlert, showConfirm, showInfo } = useAlert();
    const { isOfflineMode, setOfflineMode } = useOfflineMode();

    useWebSocketListener('session_exists', (data)=> {
      console.log('Session exists:', data);
      // Session exists modal

      setTimeout(()=> {
      pomoTimerRef.current?.pause();
      pomoTimerRef.current?.reset();
      freeTimerRef.current?.pause();
      freeTimerRef.current?.reset();
      setStarted(false);
      setRunning(false);
      setCurrentTime(0);
      setTotalTime(0);
      setSessionPhase('focus');
      setPomodoroCount(0); // Reset pomodoro count when switching modes
      }, 500);

      showError(
        'Session Already Exists',
        'You already have an active session. Please end the current session before starting a new one.',
        { size: 'lg' }
      );

    });

    useWebSocketListener('session_reconnected', (data) => {
      console.log('Session reconnected:', data);
      
      // tell the user that the session has been reconnected

      showInfo(
        'Session Reconnected',
        'Your session has been reconnected successfully. The timer will continue from where it left off.',
        { size: 'lg' }
      );
    });

  // Check if settings modal should be open based on URL
  const isSettingsOpen = searchParams.get('modal') === 'settings';
  
  // Check if profile modal should be open based on URL
  const isProfileModalOpen = searchParams.get('modal') === 'profile';
  const profileUserId = searchParams.get('userId') || 'current-user';

  // Helper function to get the active timer ref based on selected mode
  const getActiveTimerRef = () => {
    return selectedTab === 'pomo' ? pomoTimerRef : freeTimerRef;
  };

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    if (localStorage.getItem('onboardingCompleted') === 'false') {
          navigate('/onboarding');
        }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [navigate]);

  // Handle direct URL navigation to profile modal
  useEffect(() => {
    if (isProfileModalOpen && !profileUserId) {
      // If profile modal should be open but no userId is provided, default to current user
      setSearchParams({ modal: 'profile', userId: 'current-user' });
    }
  }, [isProfileModalOpen, profileUserId, setSearchParams]);

  // Listen for custom profile modal events from ProfileTile components
  useEffect(() => {
    const handleOpenProfileModal = (event: any) => {
      const userId = event.detail?.userId || 'current-user';
      // Update URL to show profile modal with user ID
      setSearchParams({ modal: 'profile', userId });
    };

    window.addEventListener('openProfileModal', handleOpenProfileModal);
    return () => {
      window.removeEventListener('openProfileModal', handleOpenProfileModal);
    };
  }, [setSearchParams]);

  // Handle page unload - run handleResetButton when page is unloaded
  useEffect(() => {
    const handlePageUnload = () => {
      handleResetButton();
    };

    window.addEventListener('beforeunload', handlePageUnload);
    return () => {
      window.removeEventListener('beforeunload', handlePageUnload);
    };
  }, []);

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
    if (pomoTimerRef.current) {
      pomoTimerRef.current.reset();
      setStarted(false);
      setRunning(false);
      setCurrentTime(0);
      setTotalTime(0);
    }
  }, [pomodoroMinutes]);

  // Debug log timer context values
  useEffect(() => {
    console.log('Timer Context Values:', {
      pomodoroMinutes,
      shortBreakMinutes,
      longBreakMinutes,
      longBreakInterval,
      sessionPhase,
      pomodoroCount
    });

  }, [pomodoroMinutes, shortBreakMinutes, longBreakMinutes, longBreakInterval, sessionPhase, pomodoroCount]);

  // useEffect(() => {
  //   console.log(`New Phase: ${sessionPhase}`);

  //   if (sessionPhase === 'break-overtime' || sessionPhase === 'focus-overtime') {
  //     return
  //   }

  //   sendMessage({
  //     type: sessionPhase,
  //     payload: {}
  //   });

  // }, [sessionPhase]);


  useEffect(() => {
    return () => {
      document.title = "Dashboard | Seika";
      if (!localStorage.getItem('token')) {
      navigate('/login');
    }
    };
     
  }, []);

  // Reset document title when timer is not running
  useEffect(() => {
    if (!running) {
      document.title = "Dashboard | Seika";
    }
  }, [running]);

  // Handle time updates from timers
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleModeSwitch = (mode: string) => {
    // Reset both timers when switching modes to ensure clean state
    if (started || running) {
      pomoTimerRef.current?.pause();
      pomoTimerRef.current?.reset();
      freeTimerRef.current?.pause();
      freeTimerRef.current?.reset();
      setStarted(false);
      setRunning(false);
      setCurrentTime(0);
      setTotalTime(0);
      setSessionPhase('focus');
      setPomodoroCount(0); // Reset pomodoro count when switching modes
    }
    
    setSelectedTab(mode);
    setShowBlur(true); // Trigger temporary blur
  };

  const resetTimer = () => {
        getActiveTimerRef().current?.reset();
        setStarted(false);
        setRunning(false);
        setCurrentTime(0);
        setTotalTime(0);
        setSessionPhase('focus');
        setPomodoroCount(0); // Reset pomodoro count
      }

  const handleResetButton = () => {
    // Modal confirming session end.
      if (!started){
        resetTimer();
        return
      }
    
    showConfirm(
      'Reset Session?',
      'Are you sure you want to reset your current timer session? This will end your current progress.',
      () => {

        // Only send WebSocket message if not in offline mode
        if (!isOfflineMode) {
          sendMessage({
            type: 'end_session',
            payload: {}
          });
        }
      
      resetTimer();
    },
    {
      confirmText: 'Reset',
      cancelText: 'Keep Going',
      type: 'warning'
    }
  );
}

  // Main button press handler - handles start, pause, resume, and session transitions
  const handleMainButtonPress = () => {
    // Special case: if in overtime mode OR during break, start the next session regardless of current running state
    if (selectedTab === 'pomo' && (sessionPhase === 'focus-overtime' || sessionPhase === 'break-overtime' || sessionPhase === 'break')) {
      handleStart();
    } else if (!started) {
      // Starting a new timer session
      handleStart();
    } else if (running) {
      // Timer is running, pause it
      handlePause();
    } else {
      // Timer is paused, resume it
      handleResume();
    }
  };

  // Get the appropriate button text based on current state and session phase
  const getButtonText = () => {
    // Special cases for pomodoro mode based on session phase
    if (selectedTab === 'pomo') {
      if (sessionPhase === 'focus-overtime') {
        return 'Start Break';
      } else if (sessionPhase === 'break-overtime') {
        return 'Start Focus';
      } else if (sessionPhase === 'break') {
        // During break, allow users to start focus immediately
        return 'Start Focus';
      }
    }
    
    if (!started) {
      // Not started yet - show Start
      return 'Start';
    } else if (running) {
      return 'Pause';
    } else {
      return 'Resume';
    }
  };
  
  const handleStart = () => {
    setIsTransitioning(true);

    if (!isConnected && !isOfflineMode) {
      showConfirm(
        'Connection Lost!', 
        'Unable to connect to the server. Would you like to continue in offline mode? In offline mode, you can use the timer and settings, but your study time won\'t be tracked.',
        () => {
          setOfflineMode(true);
        },
        { 
          size: 'lg',
          confirmText: 'Continue Offline',
          cancelText: 'Retry Connection',
          type: 'warning'
        }
      );
      setIsTransitioning(false);
      return;
    }

    // Show offline mode info on first timer start
    if (isOfflineMode && !started) {
      showInfo(
        'Offline Mode Active',
        'Time tracking is disabled for now. Your timer and settings will work normally, but study time won\'t be synced to the server.',
        { size: 'lg' }
      );
    }

    // Small delay to allow transition animation to begin
    setTimeout(() => {
      setStarted(true);
      setRunning(true);
      
      if (selectedTab === 'pomo') {
        // Determine session duration and phase based on current context
        let durationInSeconds: number;
        let newPhase: 'focus' | 'break';
        
        if (sessionPhase === 'focus-overtime') {
          // Starting a break after focus overtime
          // Long break should happen after completing longBreakInterval pomodoros (e.g., after 4th pomodoro)
          const shouldBeLongBreak = pomodoroCount > 0 && pomodoroCount % longBreakInterval === 0;
          durationInSeconds = shouldBeLongBreak ? longBreakMinutes * 60 : shortBreakMinutes * 60;
          newPhase = 'break';

          // Only send WebSocket message if not in offline mode
          if (!isOfflineMode) {
            sendMessage({ type: 'break_start', payload: { break_type: shouldBeLongBreak ? 'longBreak' : 'shortBreak' } });
          }

          console.log(`Starting ${shouldBeLongBreak ? 'long' : 'short'} break. PomodoroCount: ${pomodoroCount}, LongBreakInterval: ${longBreakInterval}, Duration: ${durationInSeconds / 60} minutes, Should be long break: ${shouldBeLongBreak}`);
        } else if (sessionPhase === 'break-overtime') {
          // Starting a focus session after break overtime

          // Only send WebSocket message if not in offline mode
          if (!isOfflineMode) {
            sendMessage({ type: 'break_end', payload: {} });
          }

          durationInSeconds = pomodoroMinutes * 60;
          newPhase = 'focus';

        } else if (sessionPhase === 'break') {
          // This shouldn't happen, but handle it
          if (!isOfflineMode) {
            sendMessage({ type: 'break_end', payload: {} });
          }
          durationInSeconds = pomodoroMinutes * 60;
          newPhase = 'focus';
        } else {
          // Starting a focus session (default)
          if (!isOfflineMode) {
            sendMessage({
              type: 'start_session',
              payload: {
                mode: 'pomodoro',
              }
            });
          }
          durationInSeconds = pomodoroMinutes * 60;
          newPhase = 'focus';
        }
        
        // Update session phase first
        setSessionPhase(newPhase);
        setTotalTime(durationInSeconds);
        
        // Reset timer and start countdown with proper duration
        // Small delay to ensure sessionPhase state has updated
        setTimeout(() => {
          getActiveTimerRef().current?.reset();
          getActiveTimerRef().current?.start(durationInSeconds); // Start countdown timer
        }, 50);
      } else {
        // Free mode - start count up timer without duration
        console.log('Starting free mode timer');
        setSessionPhase('focus');
        setTotalTime(0); // No total time for free mode
        getActiveTimerRef().current?.start(); // Start count up timer
      }
      
      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 200);
  };

  const handlePause = () => {
    // Only send WebSocket message if not in offline mode
    if (!isOfflineMode) {
      sendMessage({
        type: 'pause_session',
        payload: {}
      });
    }

    getActiveTimerRef().current?.pause();
    setRunning(false);
  };

  const handleResume = () => {
    // Only send WebSocket message if not in offline mode
    if (!isOfflineMode) {
      sendMessage({
        type: 'resume_session',
        payload: {}
      });
    }

    getActiveTimerRef().current?.resume();
    setRunning(true);
  };

  const handleEnd = () => {
    // Only handle end for pomodoro mode - for free mode, timer doesn't auto-end

    if (selectedTab === 'pomo') {
      setIsTransitioning(true);
      
      // Small delay to allow transition animation to begin
      setTimeout(() => {
        // Update session phase to overtime first (before resetting timer)
        let newPhase: 'focus-overtime' | 'break-overtime';
        if (sessionPhase === 'focus') {
          newPhase = 'focus-overtime';
          setPomodoroCount(prev => prev + 1); // Increment completed pomodoros
        } else {
          newPhase = 'break-overtime';
        }
        
        setSessionPhase(newPhase);
        setCurrentTime(0);
        setTotalTime(0); // No total time for count-up mode
        
        // Now reset and start the timer in count-up mode
        // Use a small delay to ensure sessionPhase state has updated
        setTimeout(() => {
          getActiveTimerRef().current?.reset();
          getActiveTimerRef().current?.start(); // Start counting up without duration limit
        }, 50);
        
        // Show completion notification based on session type
        const isBreakSession = sessionPhase === 'break';
        
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(isBreakSession ? 'Break Complete!' : 'Focus Session Complete!', {
            body: isBreakSession 
              ? 'Break time is over. Timer is now tracking break overtime.' 
              : 'Great work! Timer is now tracking your overtime.',
            icon: '/favicon.ico',
            tag: 'timer-complete'
          });
        }
        
        // Show custom alert modal for completion
        // if (isBreakSession) {
        //   showSuccess(
        //     '⏰ Break Complete!',
        //     'Break time is over. Your timer is now tracking break overtime.',
        //     { size: 'lg' }
        //   );
        // } else {
        //   showCelebration(
        //     '🎉 Focus Session Complete!',
        //     'Excellent work! You completed a full focus session. Your timer is now tracking overtime.',
        //     { size: 'lg' }
        //   );
        // }
        
        // Play completion sound (if audio element exists)
        const audio = document.getElementById('timer-complete-sound') as HTMLAudioElement;
        if (audio) {
          audio.play().catch(e => console.warn('Could not play completion sound:', e));
        }
        
        // Optional: Show browser notification if page is not visible
        if (document.hidden) {
          document.title = isBreakSession ? '⏰ Break Over! - Seika' : '✅ Session Complete! - Seika';
        }
        
        console.log(`${sessionPhase === 'break' ? 'Break' : 'Focus'} session completed, now tracking overtime`);
        
        // Reset transition state after animation completes
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500);
      }, 200);
    }
  };

  const handleOpenSettings = () => {
    // Update URL to show modal without page refresh
    setSearchParams({ modal: 'settings' });
  };

  const handleCloseSettings = () => {
    // Remove modal parameter from URL
    setSearchParams({});
  };

  const handleOpenProfile = (userId: string = 'current-user') => {
    // Update URL to show profile modal with user ID
    setSearchParams({ modal: 'profile', userId });
  };

  const handleCloseProfile = () => {
    // Remove modal parameters from URL
    setSearchParams({});
  };

  const handleSaveSettings = () => {
    // Here you would typically save the settings to localStorage, context, or API
    // For now, we'll just close the modal
    handleCloseSettings();
  };

  const handleFullscreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Could not enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Could not exit fullscreen:', err);
      });
    }
  };

  const handleSkipToBreak = () => {
    // Only allow skipping during focus sessions in pomodoro mode
    if (selectedTab !== 'pomo' || sessionPhase !== 'focus') {
      return;
    }
    
    setIsTransitioning(true);
    
    // Small delay to allow transition animation to begin
    setTimeout(() => {
      // Increment pomodoro count since we're completing a focus session (even if early)
      const newPomodoroCount = pomodoroCount + 1;
      setPomodoroCount(newPomodoroCount);
      
      // Determine if this should be a long break
      const shouldBeLongBreak = newPomodoroCount > 0 && newPomodoroCount % longBreakInterval === 0;
      const breakDuration = shouldBeLongBreak ? longBreakMinutes * 60 : shortBreakMinutes * 60;
      
      // Set session phase to break
      setSessionPhase('break');
      setTotalTime(breakDuration);
      
      console.log(`Skipping to ${shouldBeLongBreak ? 'long' : 'short'} break. PomodoroCount: ${newPomodoroCount}, Duration: ${breakDuration / 60} minutes`);

      // Send WebSocket message only if not in offline mode
      if (!isOfflineMode) {
        sendMessage({ type: 'break_start', payload: { break_type: shouldBeLongBreak ? 'longBreak' : 'shortBreak' } });
      }  

      // Reset timer and start break countdown
      setTimeout(() => {
        getActiveTimerRef().current?.reset();
        getActiveTimerRef().current?.start(breakDuration);
      }, 50);
      
      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 200);
  };

  // Map timer context mode to AnimatedTimerStatus mode
  const getAnimatedStatusMode = () => {
    if (selectedTab === 'free') return 'free';
    
    // For pomodoro mode, use session phase to determine status
    if (selectedTab === 'pomo') {
      switch (sessionPhase) {
        case 'focus':
          return 'pomo';
        case 'break':
          return 'shortBreak'; // Could be enhanced to detect long break vs short break
        case 'focus-overtime':
          return 'completed';
        case 'break-overtime':
          return 'breakOvertime'; // We'll need to add this to AnimatedTimerStatus
        default:
          return 'pomo';
      }
    }
    
    return 'pomo';
  };

  // Calculate progress percentage for progress bar
  const getProgress = () => {
    if (selectedTab === 'free' || totalTime === 0) {
      return 0; // No progress for free mode
    }
    // For countdown timer: progress goes from 0% to 100% as time decreases
    return Math.max(0, Math.min(100, ((totalTime - currentTime) / totalTime) * 100));
  };

  return (
    <MainLayout>
      {/* Profile Button and Fullscreen Button - Top Left Corner */}
      <div className="absolute top-6 left-6 z-30 flex gap-3 items-center">
        {/* Profile Avatar Button */}
        <button
          onClick={() => handleOpenProfile('current-user')}
          className="group relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg backdrop-blur-sm"
          title={`View ${userName}'s Profile`}
        >
          <img
            src={profilePhoto || "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_1.png"}
            alt={`${userName}'s Avatar`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {/* Profile indicator dot */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
        </button>
        
        {/* Fullscreen Button */}
        <AnimatedIconButton
          onClick={handleFullscreenToggle}
          icon={isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />}
          variant="settings"
          size={38}
          transparent={true}
        />
      </div>

      {/* Digital Clock - Top Right Corner */}
      <div className="absolute top-6 right-8 z-30">
        <DigitalClock 
          className=""
          showDate={true}
          showSeconds={false}
          format24h={false}
        />
      </div>

      {/* Random Greeting - Top Right, below clock */}
      <div className="absolute top-20 right-8 z-30">
        <RandomGreeting 
          firstName={userName} // You can replace this with actual user data
          className="backdrop-blur-sm bg-white/5 px-3 py-2 rounded-lg border border-white/10"
        />
      </div>

      {/* Offline Mode Status Indicator */}
      {isOfflineMode && (
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-30">
          <div className="backdrop-blur-sm bg-orange-500/10 border border-orange-400/30 px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
            <span className="text-orange-400">🔌</span>
            <span className="text-orange-400 text-sm font-medium">Offline Mode</span>
            <span className="text-orange-300 text-xs">(Time tracking disabled)</span>
          </div>
        </div>
      )}

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
                progress={getProgress()}
                className="w-full -translate-y-5 "
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

          {/* Animated Timer Container - switches between Pomodoro and Free timers */}
          <div className="relative" style={{ height: '12rem', marginTop: '-0.8rem', marginBottom: '-1.3rem' }}>
            {/* Pomodoro Timer */}
            <div 
              className={`
                absolute inset-0 transition-all duration-700 ease-in-out flex items-center justify-center
                ${selectedTab === 'pomo' 
                  ? 'opacity-100 transform translate-x-0 scale-100' 
                  : 'opacity-0 transform translate-x-8 scale-95 pointer-events-none'
                }
              `}
            >
              <Timer 
                ref={pomoTimerRef} 
                displayClassName="font-bold text-white"  
                style={{ fontFamily: "Marmelat Black", fontSize: "10.5rem" }} 
                displayStyle={{ 
                  textShadow: '0 4px 30px rgba(0, 0, 0, 0.35), 0 12px 30px rgba(0, 0, 0, 0.4)',
                  ...(sessionPhase === 'focus-overtime' ? { color: '#10B981' } : {}), // Green for focus overtime
                  ...(sessionPhase === 'break-overtime' ? { color: '#EF4444' } : {}), // Red for break overtime
                }} 
                countUp={sessionPhase === 'focus-overtime' || sessionPhase === 'break-overtime'} // Switch to count-up mode when in overtime
                endValue={sessionPhase === 'focus-overtime' || sessionPhase === 'break-overtime' ? 999999 : undefined}
                initialTime={sessionPhase === 'focus-overtime' || sessionPhase === 'break-overtime' ? 0 : (sessionPhase === 'break' ? shortBreakMinutes * 60 : pomodoroMinutes * 60)}
                onTimerEnd={handleEnd}
                onTimeUpdate={handleTimeUpdate}
              />
            </div>
            
            {/* Free Timer */}
            <div 
              className={`
                absolute inset-0 transition-all duration-700 ease-in-out flex items-center justify-center
                ${selectedTab === 'free' 
                  ? 'opacity-100 transform translate-x-0 scale-100' 
                  : 'opacity-0 transform -translate-x-8 scale-95 pointer-events-none'
                }
              `}
            >
              <Timer 
                ref={freeTimerRef} 
                displayClassName="font-bold text-white"  
                style={{ fontFamily: "Marmelat Black", fontSize: "10.5rem" }} 
                displayStyle={{ textShadow: '0 4px 30px rgba(0, 0, 0, 0.35), 0 12px 30px rgba(0, 0, 0, 0.4)'}} 
                countUp={true}
                initialTime={0}
                endValue={999999} // Very large number for unlimited count-up
                onTimerEnd={() => {}} // Free timer doesn't auto-end
                onTimeUpdate={handleTimeUpdate}
              />
            </div>
          </div>

          <div className="flex gap-4 justify-center items-center">
            <AnimatedIconButton
              onClick={handleOpenSettings}
              icon={<IoSettingsOutline />}
              variant="settings"
              size={38}
            />
            
            <AnimatedIconButton
              onClick={handleResetButton}
              icon={<IoRefreshSharp />}
              variant="reset"
              size={42}
            />
            
            <Button
              onPress={handleMainButtonPress}
              variant={(() => {
                const buttonText = getButtonText();
                if (buttonText.includes('Start') || !started) {
                  return "solid";
                } else if (running) {
                  return "ghost";
                } else {
                  return "solid";
                }
              })()}
              color="primary"
              size="lg"
              radius="full"
              style={{
                fontSize: '1.65rem', 
                padding: '1.78rem 2.5rem',
                '--heroui-primary': colorVariations[500],
                '--heroui-primary-foreground': '#ffffff',
                ...(started && running && !getButtonText().includes('Start') ? {
                  borderColor: `${colorVariations[400]}50`,
                  boxShadow: `0 4px 12px ${colorVariations[500]}20`,
                } : {}),
              } as React.CSSProperties}
              className={`
                ${started && running && !getButtonText().includes('Start')
                  ? 'text-white bg-transparent hover:bg-primary-500/20' 
                  : 'relative overflow-hidden'
                }
                transition-all duration-300 ease-out
                hover:scale-[1.01] hover:shadow-sm
                active:scale-95
                ${started && running && !getButtonText().includes('Start')
                  ? `border-2 hover:border-primary-400/70` 
                  : ''
                }
                ${(!started || !running || getButtonText().includes('Start')) ? `
                  before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent 
                  before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:pointer-events-none
                ` : ''}
              `}
            >
              {getButtonText()}
            </Button>
                
            
            <AnimatedIconButton
              onClick={handleSkipToBreak}
              icon={<BsCupHotFill />}
              variant="break"
              size={26}
              tooltip={selectedTab === 'pomo' && sessionPhase === 'focus' ? "Skip to Short Break" : "Skip to Short Break (Focus mode only)"}
              disabled={selectedTab !== 'pomo' || sessionPhase !== 'focus'}
            />

            <AnimatedIconButton
              onClick={() => {
              showInfo(
                'Coming soon!',
                'Group video calls are not yet implemented. Stay tuned for updates!',
                { size: 'lg' }
              );

              }}
              icon={<HiMiniVideoCamera />}
              variant="break"
              size={26}
              tooltip="Group Video Call"
              disabled={started}
            />
            
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
      </section>

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onSave={handleSaveSettings}
      />
      
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfile}
        userId={profileUserId}
      />
      
      <AlertModal 
        isOpen={alertState.isOpen}
        onClose={hideAlert}
        onConfirm={alertState.onConfirm}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        showCancel={alertState.showCancel}
        size={alertState.size}
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
