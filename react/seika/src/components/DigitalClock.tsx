import { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';

interface DigitalClockProps {
  className?: string;
  showDate?: boolean;
  showSeconds?: boolean;
  format24h?: boolean;
}

export default function DigitalClock({ 
  className = '', 
  showDate = true, 
  showSeconds = true,
  format24h = false 
}: DigitalClockProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { selectedTimezone } = useProfile();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      timeZone: selectedTimezone,
      hour12: !format24h,
      hour: 'numeric',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      timeZone: selectedTimezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`flex flex-col items-end text-right ${className}`}>
      {/* Time Display */}
      <div 
        className={`
          font-sans text-lg font-semibold 
          transition-all duration-300 
          text-white/90
        `}
        style={{ 
          textShadow: '0 0 10px rgba(255,255,255,0.4), 0 1px 4px rgba(0,0,0,0.9)',
          fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
        }}
      >
        {formatTime(currentTime)}
      </div>

      {/* Date Display */}
      {showDate && (
        <div className="mt-0.2">
          <div 
            className={`
              text-sm font-medium 
              text-white/85
            `}
            style={{ 
              textShadow: '0 0 8px rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.5)',
              fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
            }}
          >
            {formatDate(currentTime)}
          </div>
        </div>
      )}
    </div>
  );
}
