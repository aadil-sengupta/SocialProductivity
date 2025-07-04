
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiCheck, FiStar, FiSettings, FiBell, FiClock, FiUser, FiImage } from "react-icons/fi";
import { IoIosColorPalette } from "react-icons/io";
import { apiClient } from "@/services/apiClient";

// Components
import FormOption from "@/components/FormOption";
import ColorPicker from "@/components/ColorPicker";
import WallpaperPicker from "@/components/WallpaperPicker";
import { ScrollShadow } from '@heroui/react';

// Contexts
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useAccentColorManager } from "@/contexts/AccentColorContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useNotificationReminders } from "@/contexts/NotificationRemindersContext";
import { useTimer } from "@/contexts/TimerContext";
import { useWallpaper } from "@/contexts/WallpaperContext";



// Onboarding step types
interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  component: React.ReactNode | null;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useDarkMode();
  const { accentColor } = useAccentColorManager();
  const { selectedWallpaper, wallpaperBlur } = useWallpaper();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Ref for scroll container to reset scroll position
  const scrollRef = useRef<HTMLDivElement>(null);

  // Profile setup state
    const {userName} = useProfile();
      useEffect(() => {
        document.title = 'Seika - Onboarding';
        if (!localStorage.getItem('token')) {
          navigate('/login');
        }
        if (localStorage.getItem('onboarded') === 'true') {
          navigate('/dashboard');
        }
      }, []);
  
  // Reset scroll position when step changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);
  


  // Notification settings
  const { soundNotifications, setSoundNotifications, desktopNotifications, setDesktopNotifications } = useNotifications();
  const { breakReminders, setBreakReminders, standUpReminders, setStandUpReminders } = useNotificationReminders();

  // Timer settings


  // Avatar data - memoized to prevent recreation
  const avatarCategories = useMemo(() => [
    { id: "vibrent", name: "Vibrent", emoji: "✨", count: 27 },
    { id: "upstream", name: "Upstream", emoji: "🌊", count: 22 },
    { id: "toon", name: "Toon", emoji: "🎭", count: 10 },
    { id: "teams", name: "Teams", emoji: "👥", count: 9 },
    { id: "3d", name: "3D", emoji: "🎯", count: 5 }
  ], []);



  const getAvatarsForCategory = useCallback((category: string) => {
    const counts = { vibrent: 27, upstream: 22, toon: 10, teams: 9, "3d": 5 };
    const count = counts[category as keyof typeof counts] || 0;
    return Array.from({ length: count }, (_, i) => `/avatars/${category}_${i + 1}.png`);
  }, []);

  // Welcome Step Component
  const WelcomeStep = React.memo(() => {
    
    return (
    <motion.div 
      className="text-center space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="space-y-4 mt-9">
        <div className="relative mx-auto w-32 h-32">
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-30"
            style={{ backgroundColor: accentColor }}
          />
          <div 
            className="relative w-full h-full rounded-full flex items-center justify-center text-6xl shadow-2xl"
            style={{ backgroundColor: `${accentColor}20`, border: `2px solid ${accentColor}40` }}
          >
            🚀
          </div>
        </div>
        
        <h1 
          className="text-4xl font-bold bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(to right, ${accentColor}, ${accentColor}dd, ${accentColor}ff)`
          }}
        >
          Welcome to Seika!
        </h1>
        
        <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Let's personalize your productivity experience. We'll set up your profile, customize your workspace, 
          and configure your perfect focus environment in just a few steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[
          { icon: "🎨", title: "Customize", desc: "Make it yours with themes & colors" },
          { icon: "⚡", title: "Focus", desc: "Set up your perfect work environment" },
          { icon: "🎯", title: "Achieve", desc: "Reach your productivity goals" }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-gray-900/20 border-gray-700/30 hover:border-accent/50' 
                : 'bg-white/20 border-gray-200/30 hover:border-accent/50'
            }`}
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className={`font-semibold text-lg mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              {feature.title}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )});

  // Avatar Selection Step
  const AvatarStep = React.memo(() => {
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    const { 
      profilePhoto, 
      setProfilePhoto, 
      selectedAvatarCategory,
      setSelectedAvatarCategory 
    } = useProfile();
    
    return (
    <motion.div 
      className="space-y-10"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-12 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
        <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            🎨 Choose Your Avatar
          </h2>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Pick a style that represents your unique personality
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Avatar Selection - Enhanced */}
        <motion.div 
          className={`p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500 hover:shadow-2xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-900/40 to-gray-800/30 border-gray-700/50 hover:border-accent/30' 
              : 'bg-gradient-to-br from-white/50 to-gray-50/30 border-gray-200/50 hover:border-accent/30'
          }`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'}`}>
                <span className="text-2xl">🖼️</span>
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Your Visual Identity
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select an avatar that speaks to you
                </p>
              </div>
            </div>
            
            {/* Avatar Preview with Glow Effect */}
            <motion.div 
              className="relative mx-auto w-32 h-32"
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowAvatarPicker(true)}
            >
              <div 
                className="absolute inset-0 rounded-3xl blur-xl opacity-40"
                style={{ backgroundColor: accentColor }}
              />
              <motion.div
                className="relative cursor-pointer group w-full h-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img 
                  src={profilePhoto} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-3xl shadow-2xl transition-all duration-300"
                  style={{ border: `3px solid ${accentColor}40` }}
                />
                <div className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-sm">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileHover={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <FiSettings className="text-white text-2xl" />
                    <span className="text-white text-sm font-medium">Change</span>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            {/* Avatar Picker with Enhanced Animation */}
            <AnimatePresence>
              {showAvatarPicker && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="mt-8"
                >
                  {/* Category Tabs */}
                  <div className="flex gap-3 mb-6 justify-center flex-wrap">
                    {avatarCategories.map((category, index) => (
                      <motion.button
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedAvatarCategory(category.id)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                          selectedAvatarCategory === category.id
                            ? 'text-white shadow-lg transform scale-105'
                            : isDarkMode
                            ? 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/70'
                            : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200/70'
                        }`}
                        style={selectedAvatarCategory === category.id ? {
                          backgroundColor: accentColor,
                          boxShadow: `0 8px 32px ${accentColor}40`
                        } : {}}
                      >
                        <span className="text-lg mr-2">{category.emoji}</span>
                        {category.name}
                        <span className="ml-2 text-xs opacity-70">({category.count})</span>
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Avatar Grid */}
                  <motion.div 
                    className="grid grid-cols-6 gap-4 max-h-64 overflow-y-auto p-4 rounded-2xl"
                    style={{ 
                      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {getAvatarsForCategory(selectedAvatarCategory).slice(0, 18).map((avatarPath, index) => (
                      <motion.div
                        key={avatarPath}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.1, zIndex: 10 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${
                          profilePhoto === avatarPath ? 'ring-3 ring-accent shadow-xl' : 'hover:shadow-lg'
                        }`}
                        onClick={() => {
                          setProfilePhoto(avatarPath);
                          setShowAvatarPicker(false);
                        }}
                      >
                        <img
                          src={avatarPath}
                          alt={`Avatar ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {profilePhoto === avatarPath && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-accent/20 flex items-center justify-center"
                          >
                            <FiCheck className="text-white text-lg" />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Avatar Selection Confirmation */}
        {profilePhoto && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`p-6 rounded-3xl border backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-900/30 to-gray-800/20 border-gray-700/40' 
                : 'bg-gradient-to-br from-white/30 to-gray-50/20 border-gray-200/40'
            }`}
          >
            <div className="flex items-center gap-6">
              <img 
                src={profilePhoto} 
                alt="Selected Avatar" 
                className="w-16 h-16 rounded-2xl object-cover"
                style={{ border: `2px solid ${accentColor}60` }}
              />
              <div>
                <h5 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Perfect Choice! ✨
                </h5>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your avatar is ready to represent you in Seika
                </p>
              </div>
              <motion.div
                className="ml-auto"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
              >
                <FiCheck className="text-green-500 text-2xl" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
    )
  });

  // Username Input Step
  const UsernameStep = React.memo(() => {
    const { userName, setUserName } = useProfile();
    const [tempUserName, setTempUserName] = useState(userName);
    const [isNameFocused, setIsNameFocused] = useState(false);
    
    return (
    <motion.div 
      className="space-y-10"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-12 mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            ✨ What's Your Name?
          </h2>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Tell us what you'd like to be called in Seika
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Name Input - Enhanced */}
        <motion.div 
          className={`p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500 hover:shadow-2xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-900/40 to-gray-800/30 border-gray-700/50' 
              : 'bg-gradient-to-br from-white/50 to-gray-50/30 border-gray-200/50'
          } ${isNameFocused ? 'shadow-2xl' : ''}`}
          style={isNameFocused ? { borderColor: `${accentColor}60` } : {}}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'}`}>
              <span className="text-2xl">👋</span>
            </div>
            <div>
              <h4 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                What should we call you?
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                This will be displayed throughout your Seika experience
              </p>
            </div>
          </div>

          <div className="relative">
            <motion.input
              type="text"
              value={tempUserName}
              onChange={(e) => setTempUserName(e.target.value)}
              onBlur={() => {
                setUserName(tempUserName);
                setIsNameFocused(false);
              }}
              onFocus={() => setIsNameFocused(true)}
              placeholder="Enter your name"
              className={`w-full px-6 py-4 rounded-2xl border-2 transition-all duration-300 text-lg font-medium ${
                isDarkMode
                  ? 'bg-gray-800/50 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white/50 border-gray-300 text-gray-800 placeholder-gray-500'
              } focus:outline-none focus:ring-4 backdrop-blur-sm`}
              style={isNameFocused ? {
                borderColor: accentColor,
                boxShadow: `0 0 0 4px ${accentColor}20`
              } : {}}
              whileFocus={{ scale: 1.02 }}
            />
            
            {/* Name Preview */}
            {tempUserName && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl"
                style={{ backgroundColor: `${accentColor}10` }}
              >
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Preview: "Welcome back, <span className="font-semibold" style={{ color: accentColor }}>{tempUserName}</span>! 🚀"
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Name Suggestions */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-3xl border backdrop-blur-xl ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-900/30 to-gray-800/20 border-gray-700/40' 
              : 'bg-gradient-to-br from-white/30 to-gray-50/20 border-gray-200/40'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'}`}>
              <span className="text-lg">💡</span>
            </div>
            <div>
              <h5 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Quick Suggestions
              </h5>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Or pick one of these popular options
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            {['Alex', 'Sam', 'Jordan', 'Casey', 'Riley', 'Sage'].map((suggestion, index) => (
              <motion.button
                key={suggestion}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() => setTempUserName(suggestion)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  tempUserName === suggestion
                    ? 'text-white shadow-lg'
                    : isDarkMode
                    ? 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/70'
                    : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200/70'
                }`}
                style={tempUserName === suggestion ? {
                  backgroundColor: accentColor,
                  boxShadow: `0 4px 16px ${accentColor}40`
                } : {}}
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </motion.div> */}

        {/* Username Confirmation */}
        {tempUserName && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-6 rounded-3xl border backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-900/30 to-gray-800/20 border-gray-700/40' 
                : 'bg-gradient-to-br from-white/30 to-gray-50/20 border-gray-200/40'
            }`}
          >
            <div className="flex items-center gap-6">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${accentColor}20`, border: `2px solid ${accentColor}60` }}
              >
                👋
              </div>
              <div>
                <h5 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Nice to meet you, {tempUserName}! 
                </h5>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ready to create amazing things together ✨
                </p>
              </div>
              <motion.div
                className="ml-auto"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
              >
                <FiCheck className="text-green-500 text-2xl" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
    )
  });

  // Theme Customization Step
  const ThemeStep = React.memo(() => {
      const { isDarkMode } = useDarkMode();
    return (
    <motion.div 
      className="space-y-8 w-full"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-12 mt-10">
        <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          🎨 Choose Your Style
        </h2>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Pick your theme and accent color preferences
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* Color Picker */}
        <div className={`p-6 rounded-2xl border backdrop-blur-xl ${
          isDarkMode 
            ? 'bg-gray-900/50 border-gray-700/40' 
            : 'bg-white/50 border-gray-200/40'
        }`}>
          <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            🎨 Choose Your Accent Color
          </h3>
          <ColorPicker />
        </div>
        {/* Theme Toggle */}
        <div className={`p-6 rounded-2xl border backdrop-blur-xl mb-10 ${
          isDarkMode 
            ? 'bg-gray-900/50 border-gray-700/40' 
            : 'bg-white/50 border-gray-200/40'
        }`}>
          <FormOption
            title="🌙 Dark Mode"
            description="Use dark theme for better visibility in low light"
            isSelected={isDarkMode}
            onChange={toggleTheme}
          />
        </div>

      </div>
    </motion.div>
  )});

  // Wallpaper Step
  const WallpaperStep = React.memo(() => (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-12 mt-10">
        <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          🖼️ Perfect Your Workspace
        </h2>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Select a beautiful background to inspire your productivity
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <div className={`p-6 rounded-2xl backdrop-blur-xl`}>
          <WallpaperPicker />
        </div>
      </div>
    </motion.div>
  ));

  // Focus Duration Step
  const FocusDurationStep = React.memo(() => {
    const { pomodoroMinutes, setPomodoroMinutes } = useTimer();
    
    return (
      <motion.div 
        className="space-y-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12 mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              🎯 Focus Session Duration
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              How long should your deep work sessions be?
            </p>
          </motion.div>
        </div>

        <div className="max-w-2xl mx-auto space-y-10">
          {/* Focus Duration Card - Enhanced */}
          <motion.div 
            className={`p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500 hover:shadow-2xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-900/40 to-gray-800/30 border-gray-700/50 hover:border-accent/30' 
                : 'bg-gradient-to-br from-white/50 to-gray-50/30 border-gray-200/50 hover:border-accent/30'
            }`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center space-y-8">
              <div className="flex items-center justify-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'}`}>
                  <span className="text-4xl">🎯</span>
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Focus Session
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your main productivity time block
                  </p>
                </div>
              </div>
              
              {/* Large Timer Display */}
              <motion.div 
                className="relative mx-auto w-48 h-48"
                whileHover={{ scale: 1.05 }}
              >
                <div 
                  className="absolute inset-0 rounded-full blur-xl opacity-30"
                  style={{ backgroundColor: accentColor }}
                />
                <div 
                  className="relative w-full h-full rounded-full flex items-center justify-center shadow-2xl border-4"
                  style={{ 
                    backgroundColor: `${accentColor}10`, 
                    borderColor: `${accentColor}40` 
                  }}
                >
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {pomodoroMinutes}
                    </div>
                    <div className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      minutes
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Interactive Controls */}
              <div className="flex items-center justify-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (pomodoroMinutes > 1) setPomodoroMinutes(pomodoroMinutes - 1);
                  }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all ${
                    isDarkMode 
                      ? 'bg-gray-800/70 text-white hover:bg-gray-700' 
                      : 'bg-white/70 text-gray-800 hover:bg-gray-100'
                  }`}
                  style={{ boxShadow: `0 4px 16px ${accentColor}20` }}
                >
                  −
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (pomodoroMinutes < 120) setPomodoroMinutes(pomodoroMinutes + 1);
                  }}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all ${
                    isDarkMode 
                      ? 'bg-gray-800/70 text-white hover:bg-gray-700' 
                      : 'bg-white/70 text-gray-800 hover:bg-gray-100'
                  }`}
                  style={{ boxShadow: `0 4px 16px ${accentColor}20` }}
                >
                  +
                </motion.button>
              </div>

              {/* Quick Presets */}
              <div className="space-y-4">
                <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Popular Durations
                </h4>
                <div className="grid grid-cols-4 gap-3">
                  {[15, 25, 45, 60].map((preset, index) => (
                    <motion.button
                      key={preset}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      onClick={() => setPomodoroMinutes(preset)}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                        pomodoroMinutes === preset
                          ? 'text-white shadow-lg'
                          : isDarkMode
                          ? 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/70'
                          : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200/70'
                      }`}
                      style={pomodoroMinutes === preset ? {
                        backgroundColor: accentColor,
                        boxShadow: `0 4px 16px ${accentColor}40`
                      } : {}}
                    >
                      {preset}m
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Duration Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-6 rounded-3xl border backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-900/30 to-gray-800/20 border-gray-700/40' 
                : 'bg-gradient-to-br from-white/30 to-gray-50/20 border-gray-200/40'
            }`}
          >
            <div className="text-center">
              <h5 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                💡 Tip: Find Your Sweet Spot
              </h5>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {pomodoroMinutes <= 20 
                  ? "Short sessions are great for beginners or when you have trouble focusing."
                  : pomodoroMinutes <= 30 
                  ? "The classic 25-minute Pomodoro technique - proven to boost productivity!"
                  : pomodoroMinutes <= 50
                  ? "Longer sessions work well for deep work and complex tasks."
                  : "Extended sessions for those who can maintain long periods of concentration."
                }
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  });

  // Break Settings Step
  const BreakSettingsStep = React.memo(() => {
    const { 
      shortBreakMinutes, 
      setShortBreakMinutes,
      longBreakMinutes,
      setLongBreakMinutes 
    } = useTimer();
    
    return (
      <motion.div 
        className="space-y-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12 mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              ☕ Break Time Settings
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Configure your rest periods for optimal recovery
            </p>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Short Break Card */}
          <motion.div 
            className={`p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500 hover:shadow-2xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-900/40 to-gray-800/30 border-gray-700/50' 
                : 'bg-gradient-to-br from-white/50 to-gray-50/30 border-gray-200/50'
            }`}
            style={{ 
              borderColor: isDarkMode 
                ? `${accentColor}30` 
                : `${accentColor}30`
            }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-6 mb-6">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}10` }}
              >
                <span className="text-4xl">☕</span>
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Short Break
                </h3>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Quick refresh between focus sessions
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className={`text-6xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {shortBreakMinutes}
                </div>
                <div className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  minutes
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (shortBreakMinutes > 1) setShortBreakMinutes(shortBreakMinutes - 1);
                    }}
                    className="w-12 h-12 rounded-xl font-bold text-xl transition-all"
                    style={{ 
                      backgroundColor: `${accentColor}20`, 
                      color: accentColor
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = `${accentColor}30`}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = `${accentColor}20`}
                  >
                    −
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (shortBreakMinutes < 30) setShortBreakMinutes(shortBreakMinutes + 1);
                    }}
                    className="w-12 h-12 rounded-xl font-bold text-xl transition-all"
                    style={{ 
                      backgroundColor: `${accentColor}20`, 
                      color: accentColor
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = `${accentColor}30`}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = `${accentColor}20`}
                  >
                    +
                  </motion.button>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Quick Presets
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[3, 5, 10, 15].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setShortBreakMinutes(preset)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                        shortBreakMinutes === preset
                          ? 'text-white shadow-lg'
                          : isDarkMode
                          ? 'bg-gray-800/70 text-gray-300'
                          : 'bg-gray-100/70 text-gray-600'
                      }`}
                      style={{
                        backgroundColor: shortBreakMinutes === preset 
                          ? accentColor 
                          : shortBreakMinutes !== preset 
                            ? (isDarkMode ? 'rgba(31, 41, 55, 0.7)' : 'rgba(243, 244, 246, 0.7)')
                            : undefined
                      }}
                      onMouseEnter={(e) => {
                        if (shortBreakMinutes !== preset) {
                          (e.target as HTMLElement).style.backgroundColor = `${accentColor}20`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (shortBreakMinutes !== preset) {
                          (e.target as HTMLElement).style.backgroundColor = isDarkMode ? 'rgba(31, 41, 55, 0.7)' : 'rgba(243, 244, 246, 0.7)';
                        }
                      }}
                    >
                      {preset}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Long Break Card */}
          <motion.div 
            className={`p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500 hover:shadow-2xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-900/40 to-gray-800/30 border-gray-700/50' 
                : 'bg-gradient-to-br from-white/50 to-gray-50/30 border-gray-200/50'
            }`}
            style={{ 
              borderColor: isDarkMode 
                ? `${accentColor}30` 
                : `${accentColor}30`
            }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-6 mb-6">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}10` }}
              >
                <span className="text-4xl">🌴</span>
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Long Break
                </h3>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Extended rest after multiple sessions
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div className={`text-6xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {longBreakMinutes}
                </div>
                <div className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  minutes
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (longBreakMinutes > 1) setLongBreakMinutes(longBreakMinutes - 1);
                    }}
                    className="w-12 h-12 rounded-xl font-bold text-xl transition-all"
                    style={{ 
                      backgroundColor: `${accentColor}20`, 
                      color: accentColor
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = `${accentColor}30`}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = `${accentColor}20`}
                  >
                    −
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (longBreakMinutes < 60) setLongBreakMinutes(longBreakMinutes + 1);
                    }}
                    className="w-12 h-12 rounded-xl font-bold text-xl transition-all"
                    style={{ 
                      backgroundColor: `${accentColor}20`, 
                      color: accentColor
                    }}
                    onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = `${accentColor}30`}
                    onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = `${accentColor}20`}
                  >
                    +
                  </motion.button>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Quick Presets
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[15, 20, 30, 45].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setLongBreakMinutes(preset)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                        longBreakMinutes === preset
                          ? 'text-white shadow-lg'
                          : isDarkMode
                          ? 'bg-gray-800/70 text-gray-300'
                          : 'bg-gray-100/70 text-gray-600'
                      }`}
                      style={{
                        backgroundColor: longBreakMinutes === preset 
                          ? accentColor 
                          : longBreakMinutes !== preset 
                            ? (isDarkMode ? 'rgba(31, 41, 55, 0.7)' : 'rgba(243, 244, 246, 0.7)')
                            : undefined
                      }}
                      onMouseEnter={(e) => {
                        if (longBreakMinutes !== preset) {
                          (e.target as HTMLElement).style.backgroundColor = `${accentColor}20`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (longBreakMinutes !== preset) {
                          (e.target as HTMLElement).style.backgroundColor = isDarkMode ? 'rgba(31, 41, 55, 0.7)' : 'rgba(243, 244, 246, 0.7)';
                        }
                      }}
                    >
                      {preset}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Break Tips */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-6 rounded-3xl border backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-900/30 to-gray-800/20 border-gray-700/40' 
                : 'bg-gradient-to-br from-white/30 to-gray-50/20 border-gray-200/40'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <h5 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  ☕ Short Break Ideas
                </h5>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Stretch, grab water, take deep breaths, or step outside for fresh air
                </p>
              </div>
              <div className="text-center">
                <h5 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  🌴 Long Break Ideas
                </h5>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Take a walk, have a meal, call a friend, or engage in a hobby
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  });

  // Advanced Timer Step
  const AdvancedTimerStep = React.memo(() => {
    const { 
      longBreakInterval,
      setLongBreakInterval,
      countPauseTime,
      setCountPauseTime,
      setPomodoroMinutes,
      setShortBreakMinutes,
      setLongBreakMinutes
    } = useTimer();
    
    return (
      <motion.div 
        className="space-y-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12 mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              ⚙️ Advanced Settings
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Fine-tune your productivity workflow
            </p>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Break Cycle Card */}
          <motion.div 
            className={`p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500 hover:shadow-2xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-900/40 to-gray-800/30 border-gray-700/50' 
                : 'bg-gradient-to-br from-white/50 to-gray-50/30 border-gray-200/50'
            }`}
            style={{ 
              borderColor: isDarkMode 
                ? `${accentColor}30` 
                : `${accentColor}30`
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}10` }}
                >
                  <span className="text-4xl">🔄</span>
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Break Cycle
                  </h3>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Sessions before taking a long break
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-8">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (longBreakInterval > 2) setLongBreakInterval(longBreakInterval - 1);
                  }}
                  className="w-16 h-16 rounded-2xl font-bold text-2xl transition-all"
                  style={{ 
                    backgroundColor: `${accentColor}20`, 
                    color: accentColor
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = `${accentColor}30`}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = `${accentColor}20`}
                >
                  −
                </motion.button>
                
                <div className="text-center">
                  <div className={`text-7xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {longBreakInterval}
                  </div>
                  <div className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    sessions
                  </div>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (longBreakInterval < 10) setLongBreakInterval(longBreakInterval + 1);
                  }}
                  className="w-16 h-16 rounded-2xl font-bold text-2xl transition-all"
                  style={{ 
                    backgroundColor: `${accentColor}20`, 
                    color: accentColor
                  }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.backgroundColor = `${accentColor}30`}
                  onMouseLeave={(e) => (e.target as HTMLElement).style.backgroundColor = `${accentColor}20`}
                >
                  +
                </motion.button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[3, 4, 5, 6].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setLongBreakInterval(preset)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                      longBreakInterval === preset
                        ? 'text-white shadow-lg'
                        : isDarkMode
                        ? 'bg-gray-800/70 text-gray-300'
                        : 'bg-gray-100/70 text-gray-600'
                    }`}
                    style={{
                      backgroundColor: longBreakInterval === preset 
                        ? accentColor 
                        : longBreakInterval !== preset 
                          ? (isDarkMode ? 'rgba(31, 41, 55, 0.7)' : 'rgba(243, 244, 246, 0.7)')
                          : undefined
                    }}
                    onMouseEnter={(e) => {
                      if (longBreakInterval !== preset) {
                        (e.target as HTMLElement).style.backgroundColor = `${accentColor}20`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (longBreakInterval !== preset) {
                        (e.target as HTMLElement).style.backgroundColor = isDarkMode ? 'rgba(31, 41, 55, 0.7)' : 'rgba(243, 244, 246, 0.7)';
                      }
                    }}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Timer Behavior Card */}
          <motion.div 
            className={`p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500 hover:shadow-2xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-900/40 to-gray-800/30 border-gray-700/50' 
                : 'bg-gradient-to-br from-white/50 to-gray-50/30 border-gray-200/50'
            }`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                <span className="text-4xl">⚙️</span>
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Timer Behavior
                </h3>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Customize how your timer works
                </p>
              </div>
            </div>
            
            <FormOption
              title="Paused time counts as break"
              description="Include paused timer duration in break calculations (Highly Recommended)."
              isSelected={countPauseTime}
              onChange={setCountPauseTime}
            />
          </motion.div>

          {/* Quick Presets Section */}
          <motion.div 
            className={`p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500 hover:shadow-2xl ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-900/40 to-gray-800/30 border-gray-700/50' 
                : 'bg-gradient-to-br from-white/50 to-yellow-50/30 border-gray-200/50'
            }`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
                  <span className="text-4xl">⚡</span>
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Quick Presets
                  </h3>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Popular timer configurations
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setPomodoroMinutes(25);
                    setShortBreakMinutes(5);
                    setLongBreakMinutes(15);
                    setLongBreakInterval(4);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    isDarkMode 
                      ? 'border-gray-600 hover:border-accent bg-gray-800/50 text-gray-300 hover:bg-gray-700/50' 
                      : 'border-gray-300 hover:border-accent bg-white/50 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-2">📚</div>
                  <div className="font-bold text-lg mb-1">Classic Pomodoro</div>
                  <div className="text-sm opacity-70">25 • 5 • 15 • 4</div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setPomodoroMinutes(50);
                    setShortBreakMinutes(10);
                    setLongBreakMinutes(20);
                    setLongBreakInterval(3);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    isDarkMode 
                      ? 'border-gray-600 hover:border-accent bg-gray-800/50 text-gray-300 hover:bg-gray-700/50' 
                      : 'border-gray-300 hover:border-accent bg-white/50 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-2">💼</div>
                  <div className="font-bold text-lg mb-1">Deep Work</div>
                  <div className="text-sm opacity-70">50 • 10 • 20 • 3</div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setPomodoroMinutes(15);
                    setShortBreakMinutes(3);
                    setLongBreakMinutes(10);
                    setLongBreakInterval(4);
                  }}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    isDarkMode 
                      ? 'border-gray-600 hover:border-accent bg-gray-800/50 text-gray-300 hover:bg-gray-700/50' 
                      : 'border-gray-300 hover:border-accent bg-white/50 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="font-bold text-lg mb-1">Sprint Mode</div>
                  <div className="text-sm opacity-70">15 • 3 • 10 • 4</div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  });

  // Notifications Step
  const NotificationsStep = React.memo(() => (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-12 mt-10">
        <h2 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          🔔 Stay Informed
        </h2>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Configure how you'd like to receive notifications
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Notifications Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timer Notifications */}
          <div className={`p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:shadow-lg ${
            isDarkMode 
              ? 'bg-gray-900/40 border-gray-700/50 hover:border-accent/50' 
              : 'bg-white/40 border-gray-200/50 hover:border-accent/50'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <span className="text-xl">⏰</span>
              </div>
              <div>
                <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Timer Notifications
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Get notified when sessions complete
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <FormOption
                title="🔊 Sound Notifications"
                description="Play sounds when timers start and end"
                isSelected={soundNotifications}
                onChange={setSoundNotifications}
              />
              <FormOption
                title="💻 Desktop Notifications"
                description="Show notifications on your desktop"
                isSelected={desktopNotifications}
                onChange={setDesktopNotifications}
              />
            </div>
          </div>

          {/* Health Reminders */}
          <div className={`p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 hover:shadow-lg ${
            isDarkMode 
              ? 'bg-gray-900/40 border-gray-700/50 hover:border-accent/50' 
              : 'bg-white/40 border-gray-200/50 hover:border-accent/50'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <span className="text-xl">🌱</span>
              </div>
              <div>
                <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Health Reminders
                </h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Stay healthy while being productive
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <FormOption
                title="🧘 Break Reminders"
                description="Get reminded to take healthy breaks"
                isSelected={breakReminders}
                onChange={setBreakReminders}
              />
              <FormOption
                title="🚶 Stand Up Reminders"
                description="Gentle reminders to stand and stretch"
                isSelected={standUpReminders}
                onChange={setStandUpReminders}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  ));

  // Completion Step
  const CompletionStep = React.memo(() => (
    <motion.div 
      className="text-center space-y-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative">
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                initial={{ 
                  x: Math.random() * 400, 
                  y: -20, 
                  rotate: 0,
                  scale: 0
                }}
                animate={{ 
                  y: 400, 
                  rotate: 360,
                  scale: [0, 1, 0],
                  x: Math.random() * 400
                }}
                transition={{ 
                  duration: 3, 
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              >
                {['🎉', '🎊', '✨', '🌟', '🎈'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="space-y-6 mt-10 mb-10">
          <div className="relative mx-auto w-32 h-32">
            <motion.div 
              className="w-full h-full rounded-full flex items-center justify-center text-6xl shadow-2xl"
              style={{ backgroundColor: `${accentColor}20`, border: `2px solid ${accentColor}` }}
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🎯
            </motion.div>
          </div>
          
          <h1 
            className="text-4xl font-bold bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${accentColor}, ${accentColor}dd, ${accentColor}ff)`
            }}
          >
            You're All Set!
          </h1>
          
          <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Welcome to your personalized productivity workspace, {userName.split(' ')[0] || 'there'}! 
            You're ready to achieve amazing things with Seika.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {[
            { icon: "🎨", title: "Customized", desc: "Your workspace reflects your style" },
            { icon: "⏱️", title: "Configured", desc: "Perfect timer settings for your workflow" },
            { icon: "🔔", title: "Connected", desc: "Notifications set up just how you like" },
            { icon: "🚀", title: "Ready", desc: "Time to boost your productivity!" }
          ].map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={`p-6 rounded-2xl border backdrop-blur-xl ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700/40' 
                  : 'bg-gradient-to-br from-white/50 to-gray-50/30 border-gray-200/40'
              }`}
            >
              <div className="text-3xl mb-3">{achievement.icon}</div>
              <h3 className={`font-semibold text-lg mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {achievement.title}
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {achievement.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  ));

  // Function to render the current step component
  const renderCurrentStep = useCallback(() => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return <WelcomeStep />;
      case 'avatar':
        return <AvatarStep />;
      case 'username':
        return <UsernameStep />;
      case 'theme':
        return <ThemeStep />;
      case 'wallpaper':
        return <WallpaperStep />;
      case 'focus-duration':
        return <FocusDurationStep />;
      case 'break-settings':
        return <BreakSettingsStep />;
      case 'advanced-timer':
        return <AdvancedTimerStep />;
      case 'notifications':
        return <NotificationsStep />;
      case 'complete':
        return <CompletionStep />;
      default:
        return <WelcomeStep />;
    }
  }, [currentStep]);

  // Define onboarding steps with stable references
  const steps: OnboardingStep[] = useMemo(() => [
    {
      id: "welcome",
      title: "Welcome",
      subtitle: "Let's get started",
      icon: <FiStar className="w-5 h-5" />,
      component: null
    },
    {
      id: "avatar",
      title: "Avatar",
      subtitle: "Choose your visual identity",
      icon: <FiUser className="w-5 h-5" />,
      component: null
    },
    {
      id: "username",
      title: "Username",
      subtitle: "Tell us your name",
      icon: <FiUser className="w-5 h-5" />,
      component: null
    },
    {
      id: "wallpaper",
      title: "Background",
      subtitle: "Choose your wallpaper",
      icon: <FiImage className="w-5 h-5" />,
      component: null
    },
    {
      id: "theme",
      title: "Appearance",
      subtitle: "Customize your workspace",
      icon: <IoIosColorPalette className="w-5 h-5" />,
      component: null
    },
    {
      id: "focus-duration",
      title: "Focus Duration",
      subtitle: "Set your main work session length",
      icon: <FiClock className="w-5 h-5" />,
      component: null
    },
    {
      id: "break-settings",
      title: "Break Settings",
      subtitle: "Configure your rest periods",
      icon: <FiClock className="w-5 h-5" />,
      component: null
    },
    {
      id: "advanced-timer",
      title: "Advanced Timer",
      subtitle: "Fine-tune your workflow",
      icon: <FiSettings className="w-5 h-5" />,
      component: null
    },
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Stay in the loop",
      icon: <FiBell className="w-5 h-5" />,
      component: null
    },
    {
      id: "complete",
      title: "Complete",
      subtitle: "You're ready to go!",
      icon: <FiCheck className="w-5 h-5" />,
      component: null
    }
  ], []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(prev => prev + 1);
      
      // Show confetti on completion
      if (currentStep === steps.length - 2) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Get all context values at the top level
  const { profilePhoto, privacySettings } = useProfile();
  const { pomodoroMinutes, shortBreakMinutes, longBreakMinutes, longBreakInterval, countPauseTime } = useTimer();

  const completeOnboarding = useCallback(async () => {
    localStorage.setItem('onboardingCompleted', 'true');
    try {
        
          // POST settings to API
          await apiClient.post('/users/settings/', {
            // Profile settings
            profilePhoto,
            showOnlineStatus: privacySettings.showOnlineStatus,
            showTimeSpendStudying: privacySettings.showTimeSpentStudying,
            
            // Theme settings (map React state to Django field names)
            accentColor,
            wallpaper: selectedWallpaper,
            backgroundBlur: wallpaperBlur,
            //font, not in the onboarding form
            darkMode: isDarkMode,
    
            // Timer settings (map React state to Django field names)
            focusDuration: pomodoroMinutes,
            shortBreakDuration: shortBreakMinutes,
            longBreakDuration: longBreakMinutes,
            longBreakInterval,
            pauseIsBreak: countPauseTime,
            
            // Notification settings (map React state to Django field names)
            desktopNotifications,
            playSoundOnNotification: soundNotifications,
            breakReminders,
            standUpReminders,
          });
          
          console.log("Settings saved successfully");
        } catch (error) {
          console.error("Failed to save settings:", error);
          // Still call onSave to close modal even if API fails, since localStorage is already updated
        }

    navigate('/dashboard');
  }, [navigate, profilePhoto, privacySettings, accentColor, selectedWallpaper, wallpaperBlur, isDarkMode, pomodoroMinutes, shortBreakMinutes, longBreakMinutes, longBreakInterval, countPauseTime, desktopNotifications, soundNotifications, breakReminders, standUpReminders]);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-black">
      {/* Wallpaper Background */}
      {selectedWallpaper && (
        <div className="fixed inset-0 z-0">
          <img
            src={`/wallpapers/${selectedWallpaper}`}
            alt="Wallpaper"
            className="w-full h-full object-cover transition-all duration-500"
            style={{ filter: wallpaperBlur ? 'blur(8px)' : 'blur(4px)' }}
          />
        </div>
      )}

      {/* Main Container */}
      <div className={`relative z-10 w-full max-w-5xl h-[90vh] backdrop-blur-3xl rounded-3xl border-2 border-gray-700 shadow-2xl ${
        isDarkMode 
          ? 'bg-gray-900/60 border-gray-700/40' 
          : 'bg-white/70 border-gray-200/40'
      }`}>
        
        {/* Header */}
        <div className="p-6 border-opacity-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Seika.Fun
              </h1>
              <span className={`text-sm px-3 py-1 rounded-full backdrop-blur-sm ${
                isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100/50 text-gray-600'
              }`}>
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            
            <div className="text-right">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {steps[currentStep].title}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {steps[currentStep].subtitle}
              </p>
            </div>
          </div>
          
          <Progress 
            value={progress} 
            className="h-2"
            color="primary"
            style={{
              '--progress-color': accentColor
            } as React.CSSProperties}
          />
        </div>

        {/* Scrollable Content */}
        <ScrollShadow 
          ref={scrollRef}
          // hideScrollBar 
          className="flex-1 overflow-y-auto h-[calc(90vh-200px)] px-6"
        >
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={steps[currentStep].id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center"
              >
                {renderCurrentStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollShadow>

        {/* Navigation Footer */}
        <div className="p-6 border-opacity-10">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onPress={prevStep}
              isDisabled={currentStep === 0}
              startContent={<FiArrowLeft />}
              className={`backdrop-blur-sm ${isDarkMode ? 'text-gray-300 hover:bg-gray-700/30' : 'text-gray-600 hover:bg-gray-100/30'}`}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-accent w-8'
                      : completedSteps.has(index)
                      ? 'bg-accent/60'
                      : isDarkMode
                      ? 'bg-gray-600'
                      : 'bg-gray-300'
                  }`}
                  layoutId={`indicator-${index}`}
                />
              ))}
            </div>

            {currentStep === steps.length - 1 ? (
              <Button
                className="bg-accent text-accent-foreground font-medium px-6 backdrop-blur-sm"
                onPress={completeOnboarding}
                endContent={<FiCheck />}
              >
                Get Started
              </Button>
            ) : (
              <Button
                className="bg-accent text-accent-foreground font-medium px-6 backdrop-blur-sm"
                onPress={nextStep}
                endContent={<FiArrowRight />}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}