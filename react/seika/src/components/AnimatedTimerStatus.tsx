import React from 'react';
import { useAccentColorManager } from '@/contexts/AccentColorContext';

interface AnimatedTimerStatusProps {
  mode: 'pomo' | 'free' | 'shortBreak' | 'longBreak' | 'completed' | 'breakOvertime';
  isRunning: boolean;
  progress?: number; // Progress percentage (0-100) for the progress bar
  className?: string;
}

const AnimatedTimerStatus: React.FC<AnimatedTimerStatusProps> = ({
  mode,
  isRunning,
  progress = 0,
  className = ''
}) => {
  const { colorVariations } = useAccentColorManager();

  // Define status configurations
  const statusConfig = {
    pomo: {
      title: 'Focus Session',
      subtitle: 'Deep work in progress',
      emoji: '🎯',
      color: colorVariations[500],
      bgGradient: `linear-gradient(135deg, ${colorVariations[500]}15, ${colorVariations[600]}20)`,
      pulseColor: colorVariations[400],
    },
    free: {
      title: 'Free Timer',
      subtitle: 'Time is flowing',
      emoji: '⏰',
      color: colorVariations[500],
      bgGradient: `linear-gradient(135deg, ${colorVariations[500]}15, ${colorVariations[600]}20)`,
      pulseColor: colorVariations[400],
    },
    completed: {
      title: 'Session Complete!',
      subtitle: 'Tracking overtime',
      emoji: '✅',
      color: '#10B981', // emerald green
      bgGradient: `linear-gradient(135deg, #10B98120, #059F4625)`,
      pulseColor: '#34D399',
    },
    breakOvertime: {
      title: 'Break Overtime',
      subtitle: 'Extended break time',
      emoji: '⏳',
      color: '#EF4444', // red
      bgGradient: `linear-gradient(135deg, #EF444420, #DC262625)`,
      pulseColor: '#F87171',
    },
    shortBreak: {
      title: 'Short Break',
      subtitle: 'Quick refresh time',
      emoji: '☕',
      color: '#10B981', // emerald
      bgGradient: `linear-gradient(135deg, #10B98115, #059F4620)`,
      pulseColor: '#34D399',
    },
    longBreak: {
      title: 'Long Break',
      subtitle: 'Well-deserved rest',
      emoji: '🌟',
      color: '#8B5CF6', // violet
      bgGradient: `linear-gradient(135deg, #8B5CF615, #7C3AED20)`,
      pulseColor: '#A78BFA',
    }
  };

  const config = statusConfig[mode];

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Main container with animated background */}
      <div 
        className="relative px-6 py-3 rounded-xl backdrop-blur-md border border-white/30 overflow-hidden transition-all duration-500 ease-out"
        style={{
          background: config.bgGradient,
          boxShadow: `0 8px 32px ${config.color}20, 0 0 0 1px ${config.color}10`,
        }}
      >
        {/* Animated background pulse */}
        {isRunning && (
          <div 
            className="absolute inset-0 opacity-30 animate-pulse"
            style={{
              background: `radial-gradient(circle at center, ${config.pulseColor}30 0%, transparent 70%)`,
              animation: 'breathe 3s ease-in-out infinite',
            }}
          />
        )}

        {/* Floating particles for running state */}
        {isRunning && (
          <>
            <div className="absolute top-2 left-4 w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }} />
            <div className="absolute top-6 right-6 w-1 h-1 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
            <div className="absolute bottom-3 left-6 w-1 h-1 bg-white/35 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '2.2s' }} />
            <div className="absolute bottom-5 right-4 w-1.5 h-1.5 bg-white/25 rounded-full animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '1.8s' }} />
            <div className="absolute top-1/2 left-2 w-0.5 h-0.5 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '3s' }} />
            <div className="absolute top-1/3 right-8 w-0.5 h-0.5 bg-white/25 rounded-full animate-ping" style={{ animationDelay: '2.5s', animationDuration: '2.8s' }} />
          </>
        )}

        {/* Special floating elements for different modes */}
        {isRunning && mode === 'pomo' && (
          <div className="absolute top-3 right-3 text-xs opacity-60 animate-pulse">💪</div>
        )}
        {isRunning && mode === 'completed' && (
          <div className="absolute top-3 right-3 text-xs opacity-60 animate-bounce" style={{ animationDuration: '2s' }}>🎉</div>
        )}
        {isRunning && mode === 'breakOvertime' && (
          <div className="absolute top-3 right-3 text-xs opacity-60 animate-pulse" style={{ animationDuration: '1.5s' }}>⚡</div>
        )}
        {isRunning && mode === 'shortBreak' && (
          <div className="absolute top-3 left-3 text-xs opacity-60 animate-bounce" style={{ animationDuration: '3s' }}>🌱</div>
        )}
        {isRunning && mode === 'longBreak' && (
          <div className="absolute bottom-3 right-3 text-xs opacity-60 animate-spin" style={{ animationDuration: '4s' }}>✨</div>
        )}

        {/* Content */}
        <div className="relative z-10 flex items-center gap-3">
          {/* Animated emoji */}
          <div 
            className={`text-2xl transition-all duration-500 ${
              isRunning 
                ? mode === 'pomo' 
                  ? 'animate-pulse scale-110' 
                  : mode === 'completed'
                  ? 'animate-bounce scale-110'
                  : mode === 'breakOvertime'
                  ? 'animate-pulse scale-110'
                  : mode === 'shortBreak'
                  ? 'animate-bounce scale-105'
                  : mode === 'longBreak'
                  ? 'animate-spin scale-105'
                  : 'animate-pulse scale-110'
                : 'scale-100'
            }`}
            style={{
              animationDuration: mode === 'longBreak' ? '4s' : mode === 'shortBreak' ? '2s' : mode === 'completed' ? '1.5s' : mode === 'breakOvertime' ? '1.2s' : '3s',
              filter: isRunning ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none'
            }}
          >
            {config.emoji}
          </div>

          {/* Text content */}
          <div className="text-center">
            <div 
              className="text-white text-base font-semibold mb-0.5"
              style={{ 
                textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.3)',
                color: isRunning ? '#ffffff' : '#ffffff90'
              }}
            >
              {config.title}
            </div>
            <div 
              className={`text-white/80 text-xs transition-all duration-300 ${isRunning ? 'opacity-100' : 'opacity-70'}`}
              style={{ 
                textShadow: '0 1px 4px rgba(0,0,0,0.4)',
              }}
            >
              {config.subtitle}
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center">
            <div 
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${isRunning ? 'animate-pulse' : ''}`}
              style={{
                backgroundColor: isRunning ? config.color : `${config.color}60`,
                boxShadow: isRunning ? `0 0 12px ${config.color}80` : 'none',
              }}
            />
            {isRunning && (
              <div 
                className="w-2.5 h-2.5 rounded-full absolute animate-ping"
                style={{
                  backgroundColor: config.pulseColor,
                  opacity: 0.4,
                }}
              />
            )}
          </div>
        </div>

        {/* Progress bar - real progress for pomo mode, animated for free mode */}
        {isRunning && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
            {mode === 'free' ? (
              // Free mode: animated sliding bar (no real progress)
              <div 
                className="h-full animate-slide-progress"
                style={{
                  background: `linear-gradient(90deg, transparent, ${config.color}60, transparent)`,
                }}
              />
            ) : (
              // Pomodoro modes: real progress bar
              <div 
                className="h-full transition-all duration-1000 ease-out"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${config.color}80, ${config.color}60)`,
                  boxShadow: `0 0 4px ${config.color}40`,
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Custom CSS animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes breathe {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.05); }
          }
          
          @keyframes slide-progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
          
          .animate-slide-progress {
            animation: slide-progress 2s ease-in-out infinite;
          }
        `
      }} />
    </div>
  );
};

export default AnimatedTimerStatus;
