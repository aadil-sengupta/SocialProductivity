import React, { useState, useRef, useCallback } from 'react';

// Fonts:
// @import url('https://fonts.googleapis.com/css2?family=Ultra&display=swap');

interface TimerProps {
  onTimeUpdate?: (time: number) => void;
  onTimerEnd?: () => void;
  initialTime?: number; // in seconds
  countUp?: boolean; // if true, counts up from 0, otherwise counts down from initialTime
  endValue?: number; // target value for count-up timers (in seconds)
  className?: string; // custom CSS class for the timer container
  style?: React.CSSProperties; // custom inline styles for the timer container
  displayClassName?: string; // custom CSS class for the time display
  displayStyle?: React.CSSProperties; // custom inline styles for the time display
}

export interface TimerRef {
  start: (duration?: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  getTime: () => number;
  isRunning: () => boolean;
}

const Timer: React.ForwardRefRenderFunction<TimerRef, TimerProps> = (
  { 
    onTimeUpdate, 
    onTimerEnd, 
    initialTime = 0, 
    countUp = true, 
    endValue,
    className,
    style,
    displayClassName,
    displayStyle
  },
  ref
) => {
  const [time, setTime] = useState<number>(countUp ? 0 : initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((duration?: number) => {
    clearTimer();
    
    let startTime: number;
    let targetTime: number;
    
    if (countUp) {
      // For count-up mode: start from 0, end at endValue or duration
      startTime = 0;
      targetTime = duration !== undefined ? duration : (endValue || 60); // default 60 seconds if no target
      setTime(0);
    } else {
      // For count-down mode: start from duration or current time, end at 0
      startTime = duration !== undefined ? duration : time;
      targetTime = 0;
      setTime(startTime);
    }
    
    setIsRunning(true);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current - pausedTimeRef.current) / 1000);
      
      let currentTime: number;
      let shouldEnd = false;
      
      if (countUp) {
        currentTime = Math.min(targetTime, elapsed);
        shouldEnd = currentTime >= targetTime;
      } else {
        currentTime = Math.max(0, startTime - elapsed);
        shouldEnd = currentTime <= 0;
      }
      
      setTime(currentTime);
      // set title to formatted time
      document.title = `${formatTime(currentTime)} | Seika`;
      onTimeUpdate?.(currentTime);
      
      if (shouldEnd) {
        clearTimer();
        setIsRunning(false);
        onTimerEnd?.();
      }
    }, 1000);
  }, [time, clearTimer, onTimeUpdate, onTimerEnd, countUp, endValue]);

  const pause = useCallback(() => {
    if (isRunning && intervalRef.current) {
      clearTimer();
      setIsRunning(false);
      pausedTimeRef.current += Date.now() - startTimeRef.current;
    }
  }, [isRunning, clearTimer]);

  const resume = useCallback(() => {
    if (!isRunning && ((countUp && time < (endValue || 60)) || (!countUp && time > 0))) {
      setIsRunning(true);
      const resumeTime = Date.now();
      
      const targetTime = countUp ? (endValue || 60) : 0;
      const baseTime = time;
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - resumeTime) / 1000);
        
        let currentTime: number;
        let shouldEnd = false;
        
        if (countUp) {
          currentTime = Math.min(targetTime, baseTime + elapsed);
          shouldEnd = currentTime >= targetTime;
        } else {
          currentTime = Math.max(0, baseTime - elapsed);
          shouldEnd = currentTime <= 0;
        }
        
        setTime(currentTime);
        onTimeUpdate?.(currentTime);
        
        if (shouldEnd) {
          clearTimer();
          setIsRunning(false);
          onTimerEnd?.();
        }
      }, 1000);
    }
  }, [isRunning, time, clearTimer, onTimeUpdate, onTimerEnd, countUp, endValue]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setTime(countUp ? 0 : initialTime);
    pausedTimeRef.current = 0;
  }, [clearTimer, initialTime, countUp]);

  const getTime = useCallback(() => time, [time]);
  const isTimerRunning = useCallback(() => isRunning, [isRunning]);

  // Expose methods through ref
  React.useImperativeHandle(ref, () => ({
    start,
    pause,
    resume,
    reset,
    getTime,
    isRunning: isTimerRunning,
  }), [start, pause, resume, reset, getTime, isTimerRunning]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  return (
    <div className={`timer ${className || ''}`} style={style}>
      <div 
        className={`timer-display ${displayClassName || ''}`}
        style={displayStyle}
      >
        {formatTime(time)}
      </div>
        <style>{`
            @font-face {
            font-family: "Marmelat Black";
            src: local("Marmelat Black"),
            url("/fonts/Marmelat Black.woff") format("woff");
            font-weight: bold;
            }
        `}</style>
    </div>
  );
};

export default React.forwardRef(Timer);