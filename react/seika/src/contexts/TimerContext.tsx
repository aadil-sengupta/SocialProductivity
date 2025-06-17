import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';
export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'free';

interface TimerState {
  status: TimerStatus;
  mode: TimerMode;
  currentTime: number; // in seconds
  totalTime: number; // in seconds
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  pomodoroCount: number;
  longBreakInterval: number; // after how many pomodoros to take long break
  countPauseTime: boolean; // whether to count pause time towards total session time
  dailyStudyTime: number; // total study time today in minutes
}

interface TimerActions {
  // Timer controls
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  
  // Mode switching
  setMode: (mode: TimerMode) => void;
  
  // Settings
  setPomodoroMinutes: (minutes: number) => void;
  setShortBreakMinutes: (minutes: number) => void;
  setLongBreakMinutes: (minutes: number) => void;
  setLongBreakInterval: (interval: number) => void;
  setCountPauseTime: (countPauseTime: boolean) => void;
  
  // Time updates
  updateCurrentTime: (time: number) => void;
  
  // Pomodoro cycle management
  completePomodoro: () => void;
  startNextSession: () => void;
  
  // Daily study time tracking
  setDailyStudyTime: (minutes: number) => void;
  getDailyStudyTime: () => number;
  resetDailyStudyTime: () => void;
}

interface TimerContextType extends TimerState, TimerActions {}

interface TimerProviderProps {
  children: ReactNode;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const [state, setState] = useState<TimerState>(() => {
    // Load settings from localStorage if available
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('timerSettings');
      const savedDailyStudy = localStorage.getItem('dailyStudyTime');
      
      let dailyStudyTime = 0;
      
      // Load daily study time if it exists
      if (savedDailyStudy) {
        try {
          const dailyData = JSON.parse(savedDailyStudy);
          dailyStudyTime = dailyData.minutes || 0;
        } catch (error) {
          console.warn('Failed to parse daily study time from localStorage:', error);
        }
      }
      
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          return {
            status: 'idle' as TimerStatus,
            mode: 'pomodoro' as TimerMode,
            currentTime: parsed.pomodoroMinutes * 60 || 25 * 60,
            totalTime: parsed.pomodoroMinutes * 60 || 25 * 60,
            pomodoroMinutes: parsed.pomodoroMinutes || 25,
            shortBreakMinutes: parsed.shortBreakMinutes || 5,
            longBreakMinutes: parsed.longBreakMinutes || 15,
            pomodoroCount: 0,
            longBreakInterval: parsed.longBreakInterval || 4,
            countPauseTime: parsed.countPauseTime || true,
            dailyStudyTime,
          };
        } catch (error) {
          console.warn('Failed to parse timer settings from localStorage:', error);
        }
      }
    }
    
    // Default values if localStorage is not available or parsing failed
    return {
      status: 'idle',
      mode: 'pomodoro',
      currentTime: 25 * 60, // 25 minutes in seconds
      totalTime: 25 * 60,
      pomodoroMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      pomodoroCount: 0,
      longBreakInterval: 4, // Long break after every 4 pomodoros
      countPauseTime: true,
      dailyStudyTime: 0,
    };
  });

  // Timer controls
  const startTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'running',
      totalTime: prev.mode === 'pomodoro' 
        ? prev.pomodoroMinutes * 60
        : prev.mode === 'shortBreak'
        ? prev.shortBreakMinutes * 60
        : prev.mode === 'longBreak'
        ? prev.longBreakMinutes * 60
        : prev.currentTime, // free mode keeps current time
      currentTime: prev.mode === 'free' 
        ? prev.currentTime 
        : prev.mode === 'pomodoro' 
        ? prev.pomodoroMinutes * 60
        : prev.mode === 'shortBreak'
        ? prev.shortBreakMinutes * 60
        : prev.longBreakMinutes * 60
    }));
  }, []);

  const pauseTimer = useCallback(() => {
    setState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  const resumeTimer = useCallback(() => {
    setState(prev => ({ ...prev, status: 'running' }));
  }, []);

  const stopTimer = useCallback(() => {
    setState(prev => ({ ...prev, status: 'idle' }));
  }, []);

  const resetTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'idle',
      currentTime: prev.mode === 'pomodoro' 
        ? prev.pomodoroMinutes * 60
        : prev.mode === 'shortBreak'
        ? prev.shortBreakMinutes * 60
        : prev.mode === 'longBreak'
        ? prev.longBreakMinutes * 60
        : 0, // free mode starts at 0
      totalTime: prev.mode === 'pomodoro' 
        ? prev.pomodoroMinutes * 60
        : prev.mode === 'shortBreak'
        ? prev.shortBreakMinutes * 60
        : prev.mode === 'longBreak'
        ? prev.longBreakMinutes * 60
        : 0
    }));
  }, []);

  // Mode switching
  const setMode = useCallback((mode: TimerMode) => {
    setState(prev => {
      const newTime = mode === 'pomodoro' 
        ? prev.pomodoroMinutes * 60
        : mode === 'shortBreak'
        ? prev.shortBreakMinutes * 60
        : mode === 'longBreak'
        ? prev.longBreakMinutes * 60
        : 0; // free mode starts at 0

      return {
        ...prev,
        mode,
        status: 'idle',
        currentTime: newTime,
        totalTime: newTime
      };
    });
  }, []);

  // Settings
  const setPomodoroMinutes = useCallback((minutes: number) => {
    setState(prev => ({
      ...prev,
      pomodoroMinutes: minutes,
      ...(prev.mode === 'pomodoro' ? {
        currentTime: minutes * 60,
        totalTime: minutes * 60,
        status: 'idle' as TimerStatus // Reset timer status when duration changes
      } : {})
    }));
  }, []);

  const setShortBreakMinutes = useCallback((minutes: number) => {
    setState(prev => ({
      ...prev,
      shortBreakMinutes: minutes,
      ...(prev.mode === 'shortBreak' ? {
        currentTime: minutes * 60,
        totalTime: minutes * 60,
        status: 'idle' as TimerStatus // Reset timer status when duration changes
      } : {})
    }));
  }, []);

  const setLongBreakMinutes = useCallback((minutes: number) => {
    setState(prev => ({
      ...prev,
      longBreakMinutes: minutes,
      ...(prev.mode === 'longBreak' ? {
        currentTime: minutes * 60,
        totalTime: minutes * 60,
        status: 'idle' as TimerStatus // Reset timer status when duration changes
      } : {})
    }));
  }, []);

  const setLongBreakInterval = useCallback((interval: number) => {
    setState(prev => ({ ...prev, longBreakInterval: interval }));
  }, []);

  const setCountPauseTime = useCallback((countPauseTime: boolean) => {
    setState(prev => ({ ...prev, countPauseTime }));
  }, []);

  // Time updates
  const updateCurrentTime = useCallback((time: number) => {
    setState(prev => ({
      ...prev,
      currentTime: time,
      ...(time <= 0 && prev.status === 'running' ? { status: 'completed' as TimerStatus } : {})
    }));
  }, []);

  // Pomodoro cycle management
  const completePomodoro = useCallback(() => {
    setState(prev => {
      const newPomodoroCount = prev.pomodoroCount + 1;
      const shouldTakeLongBreak = newPomodoroCount % prev.longBreakInterval === 0;
      
      return {
        ...prev,
        status: 'completed',
        pomodoroCount: newPomodoroCount,
        // Automatically suggest next mode
        mode: shouldTakeLongBreak ? 'longBreak' : 'shortBreak'
      };
    });
  }, []);

  const startNextSession = useCallback(() => {
    setState(prev => {
      const newTime = prev.mode === 'pomodoro' 
        ? prev.pomodoroMinutes * 60
        : prev.mode === 'shortBreak'
        ? prev.shortBreakMinutes * 60
        : prev.mode === 'longBreak'
        ? prev.longBreakMinutes * 60
        : 0;

      return {
        ...prev,
        status: 'idle',
        currentTime: newTime,
        totalTime: newTime
      };
    });
  }, []);

  // Save timer settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const settingsToSave = {
        pomodoroMinutes: state.pomodoroMinutes,
        shortBreakMinutes: state.shortBreakMinutes,
        longBreakMinutes: state.longBreakMinutes,
        longBreakInterval: state.longBreakInterval,
        countPauseTime: state.countPauseTime,
      };
      localStorage.setItem('timerSettings', JSON.stringify(settingsToSave));
    }
  }, [state.pomodoroMinutes, state.shortBreakMinutes, state.longBreakMinutes, state.longBreakInterval, state.countPauseTime]);

  // Save daily study time to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dailyStudyData = {
        minutes: state.dailyStudyTime,
      };
      localStorage.setItem('dailyStudyTime', JSON.stringify(dailyStudyData));
    }
  }, [state.dailyStudyTime]);

  // Daily study time tracking functions
  const setDailyStudyTime = useCallback((minutes: number) => {
    setState(prev => ({
      ...prev,
      dailyStudyTime: minutes,
    }));
  }, []);

  const getDailyStudyTime = useCallback(() => {
    return state.dailyStudyTime;
  }, [state.dailyStudyTime]);

  const resetDailyStudyTime = useCallback(() => {
    setState(prev => ({
      ...prev,
      dailyStudyTime: 0,
    }));
  }, []);

  const contextValue: TimerContextType = {
    // State
    ...state,
    
    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    setMode,
    setPomodoroMinutes,
    setShortBreakMinutes,
    setLongBreakMinutes,
    setLongBreakInterval,
    setCountPauseTime,
    updateCurrentTime,
    completePomodoro,
    startNextSession,
    setDailyStudyTime,
    getDailyStudyTime,
    resetDailyStudyTime,
  };

  return (
    <TimerContext.Provider value={contextValue}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export default TimerContext;