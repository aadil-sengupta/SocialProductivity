import React, { useState, useEffect } from 'react';
import { useProfile } from '@/contexts/ProfileContext';

interface RandomGreetingProps {
  firstName?: string;
  className?: string;
}

const RandomGreeting: React.FC<RandomGreetingProps> = ({
  firstName,
  className = ""
}) => {
  const { userName } = useProfile();
  const [greeting, setGreeting] = useState("");
  const [emoji, setEmoji] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  // Use provided firstName, or extract first name from userName, or default to "Friend"
  const displayName = firstName || userName.split(' ')[0] || "Friend";

  // Get time-based greetings
  const getTimeBasedGreetings = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      // Morning (5 AM - 12 PM)
      return {
        greetings: [
          `Good morning, ${displayName}!`,
          `Rise and shine, ${displayName}!`,
          `Morning, ${displayName}!`,
          `Hello there, ${displayName}!`,
          `Start strong, ${displayName}!`,
          `Fresh start, ${displayName}!`,
          `Ready to tackle today, ${displayName}?`,
          `Morning energy, ${displayName}!`
        ],
        emojis: ["🌅", "☀️", "🌤️", "🌞", "🌻", "🐦", "⭐", "🌈"]
      };
    } else if (hour >= 12 && hour < 17) {
      // Afternoon (12 PM - 5 PM)
      return {
        greetings: [
          `Good afternoon, ${displayName}!`,
          `Hey there, ${displayName}!`,
          `Afternoon focus, ${displayName}!`,
          `Keep going, ${displayName}!`,
          `Productive day, ${displayName}?`,
          `Midday motivation, ${displayName}!`,
          `Stay strong, ${displayName}!`,
          `Power through, ${displayName}!`
        ],
        emojis: ["☀️", "🌤️", "💪", "🎯", "⚡", "🔥", "🌟", "🚀"]
      };
    } else if (hour >= 17 && hour < 21) {
      // Evening (5 PM - 9 PM)
      return {
        greetings: [
          `Good evening, ${displayName}!`,
          `Evening, ${displayName}!`,
          `Winding down, ${displayName}?`,
          `Evening productivity, ${displayName}!`,
          `Almost there, ${displayName}!`,
          `Final stretch, ${displayName}!`,
          `Evening focus, ${displayName}!`,
          `End strong, ${displayName}!`
        ],
        emojis: ["🌅", "🌇", "🌆", "🏙️", "⭐", "🌟", "💫", "🌙"]
      };
    } else {
      // Night (9 PM - 5 AM)
      return {
        greetings: [
          `Good night, ${displayName}!`,
          `Late night work, ${displayName}?`,
          `Night owl, ${displayName}!`,
          `Burning midnight oil, ${displayName}?`,
          `Evening dedication, ${displayName}!`,
          `Night focus, ${displayName}!`,
          `After hours, ${displayName}?`,
          `Night mode, ${displayName}!`
        ],
        emojis: ["🌙", "⭐", "💫", "🌟", "🌃", "🦉", "💤", "🌌"]
      };
    }
  };

  // Update greeting function
  const updateGreeting = () => {
    const { greetings, emojis } = getTimeBasedGreetings();
    const randomIndex = Math.floor(Math.random() * greetings.length);
    const randomEmojiIndex = Math.floor(Math.random() * emojis.length);
    
    setGreeting(greetings[randomIndex]);
    setEmoji(emojis[randomEmojiIndex]);
  };

  // Set random greeting based on time and animate in
  useEffect(() => {
    updateGreeting();
    
    // Animate in after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [firstName]);

  // Update greeting every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      updateGreeting();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [firstName]);

  return (
    <div 
      className={`
        flex items-center gap-2 transition-all duration-700 ease-out
        ${isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-4'
        }
        ${className}
      `}
    >
      <span 
        className="text-2xl"
        style={{ 
          animationDuration: '2s',
          filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.3))'
        }}
      >
        {emoji}
      </span>
      <div className="text-white font-medium text-lg">
        <div 
          style={{ 
            textShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.3)',
            fontFamily: 'inherit'
          }}
        >
          {greeting}
        </div>
      </div>
    </div>
  );
};

export default RandomGreeting;