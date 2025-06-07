import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { ScrollShadow } from '@heroui/react';
import { Button } from "@heroui/button";
import FormOption from "@/components/FormOption";
import ColorPicker from "@/components/ColorPicker";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useAccentColorManager } from "@/contexts/AccentColorContext";
import { useTimer } from "@/contexts/TimerContext";
import { apiClient } from "@/services/apiClient";
import WallpaperPicker from "@/components/WallpaperPicker";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [countUp, setCountUp] = React.useState(true);
  const [autoStart, setAutoStart] = React.useState(false);
  const [soundNotifications, setSoundNotifications] = React.useState(true);
  const [desktopNotifications, setDesktopNotifications] = React.useState(false);
  const [font, setFont] = React.useState("Poppins");
  const [wallpaper, setWallpaper] = React.useState("purple-gradient.jpg");
  const [selectedCategory, setSelectedCategory] = React.useState("appearance");
  const [profilePhoto, setProfilePhoto] = React.useState("https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_6.png");
  const [userName, setUserName] = React.useState("Aadil Sengupta");
  
  const { isDarkMode, toggleTheme } = useDarkMode();
  const { accentColor } = useAccentColorManager();
  const { 
    pomodoroMinutes, 
    shortBreakMinutes, 
    longBreakMinutes, 
    longBreakInterval,
    setPomodoroMinutes,
    setShortBreakMinutes,
    setLongBreakMinutes,
    setLongBreakInterval
  } = useTimer();

  const categories = [
   {
      id: "profile",
      name: "Profile",
      icon: "👤",
      description: "User account settings"
    },
    {
      id: "appearance",
      name: "Appearance",
      icon: "🎨",
      description: "Theme and visual settings"
    },
    {
      id: "timer",
      name: "Timer",
      icon: "⏱️",
      description: "Timer behavior settings"
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: "🔔",
      description: "Sound and desktop alerts"
    }
  ];

  // Load settings from localStorage on component mount
  React.useEffect(() => {
    const loadSettings = () => {
      const savedCountUp = localStorage.getItem('countUp');
      const savedAutoStart = localStorage.getItem('autoStart');
      const savedSoundNotifications = localStorage.getItem('soundNotifications');
      const savedDesktopNotifications = localStorage.getItem('desktopNotifications');
      const savedFont = localStorage.getItem('font');
      const savedWallpaper = localStorage.getItem('wallpaper');
      const savedCategory = localStorage.getItem('selectedSettingsCategory');
      const savedProfilePhoto = localStorage.getItem('profilePhoto');
      const savedUserName = localStorage.getItem('userName');

      if (savedCountUp !== null) setCountUp(savedCountUp === 'true');
      if (savedAutoStart !== null) setAutoStart(savedAutoStart === 'true');
      if (savedSoundNotifications !== null) setSoundNotifications(savedSoundNotifications === 'true');
      if (savedDesktopNotifications !== null) setDesktopNotifications(savedDesktopNotifications === 'true');
      if (savedFont) setFont(savedFont);
      if (savedWallpaper) setWallpaper(savedWallpaper);
      if (savedCategory) setSelectedCategory(savedCategory);
      if (savedProfilePhoto) setProfilePhoto(savedProfilePhoto);
      if (savedUserName) setUserName(savedUserName);
    };

    loadSettings();
  }, []);

  // Effects to update localStorage when state changes
  React.useEffect(() => {
    localStorage.setItem('countUp', countUp.toString());
  }, [countUp]);

  React.useEffect(() => {
    localStorage.setItem('autoStart', autoStart.toString());
  }, [autoStart]);

  React.useEffect(() => {
    localStorage.setItem('soundNotifications', soundNotifications.toString());
  }, [soundNotifications]);

  React.useEffect(() => {
    localStorage.setItem('desktopNotifications', desktopNotifications.toString());
  }, [desktopNotifications]);

  React.useEffect(() => {
    localStorage.setItem('font', font);
  }, [font]);

  React.useEffect(() => {
    localStorage.setItem('wallpaper', wallpaper);
  }, [wallpaper]);

  React.useEffect(() => {
    localStorage.setItem('selectedSettingsCategory', selectedCategory);
  }, [selectedCategory]);

  React.useEffect(() => {
    localStorage.setItem('profilePhoto', profilePhoto);
  }, [profilePhoto]);

  React.useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  const renderCategoryContent = () => {
    switch (selectedCategory) {
        case "profile":
          return (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h3 className="text-primary text-2xl font-bold mb-2">
                  👤 Profile Settings
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Customize your profile and privacy settings
                </p>
              </div>
              
              {/* Profile Card */}
              <div className={`p-8 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                isDarkMode ? 'bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-gray-700 hover:border-accent/50' : 'bg-gradient-to-br from-gray-50/50 to-white/50 border-gray-200 hover:border-accent/50'
              }`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <span className="text-2xl">🎭</span>
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Profile Information
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Update your avatar and display name
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center space-y-6">
                  {/* Profile Photo Picker */}
                  <div 
                    className="relative cursor-pointer group"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            const result = e.target?.result as string;
                            setProfilePhoto(result);
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    <div className="relative">
                      <img 
                        src={profilePhoto} 
                        alt="Profile" 
                        className="w-24 h-24 object-cover transition-all duration-300 group-hover:scale-105 shadow-lg"
                        style={{ borderRadius: '20px' }}
                      />
                      <div className={`absolute inset-0 rounded-[20px] bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center`}>
                        <span className="text-white text-sm font-medium">Change Photo</span>
                      </div>
                    </div>
                  </div>

                  {/* Name Field */}
                  <div className="w-full max-w-sm">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-center text-lg font-medium ${
                        isDarkMode 
                          ? 'bg-gray-800/50 border-gray-700 text-white focus:border-accent focus:bg-gray-800' 
                          : 'bg-white/50 border-gray-300 text-gray-900 focus:border-accent focus:bg-white'
                      } focus:outline-none focus:ring-2 focus:ring-accent/20 hover:border-accent/50`}
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div className={`p-6 rounded-2xl border ${
                isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50/30 border-gray-200'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <span className="text-xl">🔒</span>
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Privacy Settings
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Control what others can see about you
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormOption
                    title="Time Spent Studying"
                    description="Display time spent studying today to other users"
                    isSelected={true}
                    onChange={() => {}}
                  />
                  <FormOption
                    title="Show Online Status"
                    description="Display your online status to other users"
                    isSelected={false}
                    onChange={() => {}}
                  />
                </div>
              </div>
            </div>
          );
      case "appearance":
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-primary text-2xl font-bold mb-2">
                🎨 Appearance Settings
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Customize your visual experience and theme preferences
              </p>
            </div>
            
            {/* Theme Settings Card */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl">🌙</span>
                </div>
                <div>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Theme Mode
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Switch between light and dark appearance
                  </p>
                </div>
              </div>
              
              <FormOption
                title="Dark Mode"
                description="Use dark theme for better visibility in low light"
                isSelected={isDarkMode}
                onChange={toggleTheme}
              />
            </div>

            {/* Wallpaper Settings Card */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <span className="text-2xl">🖼️</span>
                </div>
                <div>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Background
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Choose your workspace background
                  </p>
                </div>
              </div>
              
              <WallpaperPicker />
            </div>

            {/* Color Scheme Card */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Accent Color
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Personalize your interface with custom colors
                  </p>
                </div>
              </div>
              
              <ColorPicker />
            </div>
          </div>
        );
       case "timer":
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-primary text-2xl font-bold mb-2">
                ⏱️ Timer Settings
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Customize your focus sessions and break intervals
              </p>
            </div>
            
            {/* Duration Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Focus Duration Card */}
              <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Focus Session
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Deep work time
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button
                    isIconOnly
                    variant="light"
                    size="lg"
                    onPress={() => {
                      if (pomodoroMinutes > 1) setPomodoroMinutes(pomodoroMinutes - 1);
                    }}
                    className={`${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'} transition-colors`}
                  >
                    <span className="text-xl font-bold">−</span>
                  </Button>
                  
                  <div className="flex-1 text-center">
                    <div className={`text-4xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {pomodoroMinutes}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      minutes
                    </div>
                  </div>
                  
                  <Button
                    isIconOnly
                    variant="light"
                    size="lg"
                    onPress={() => {
                      if (pomodoroMinutes < 120) setPomodoroMinutes(pomodoroMinutes + 1);
                    }}
                    className={`${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'} transition-colors`}
                  >
                    <span className="text-xl font-bold">+</span>
                  </Button>
                </div>
                
                <div className="mt-4 flex gap-2">
                  {[15, 25, 45, 60].map((preset) => (
                    <Button
                      key={preset}
                      size="sm"
                      variant={pomodoroMinutes === preset ? "solid" : "bordered"}
                      color={pomodoroMinutes === preset ? "primary" : "default"}
                      onPress={() => setPomodoroMinutes(preset)}
                      className={`flex-1 ${pomodoroMinutes === preset ? 'bg-accent text-accent-foreground' : ''}`}
                    >
                      {preset}m
                    </Button>
                  ))}
                </div>
              </div>

              {/* Short Break Card */}
              <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <span className="text-2xl">☕</span>
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Short Break
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Quick refresh
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button
                    isIconOnly
                    variant="light"
                    size="lg"
                    onPress={() => {
                      if (shortBreakMinutes > 1) setShortBreakMinutes(shortBreakMinutes - 1);
                    }}
                    className={`${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'} transition-colors`}
                  >
                    <span className="text-xl font-bold">−</span>
                  </Button>
                  
                  <div className="flex-1 text-center">
                    <div className={`text-4xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {shortBreakMinutes}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      minutes
                    </div>
                  </div>
                  
                  <Button
                    isIconOnly
                    variant="light"
                    size="lg"
                    onPress={() => {
                      if (shortBreakMinutes < 30) setShortBreakMinutes(shortBreakMinutes + 1);
                    }}
                    className={`${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'} transition-colors`}
                  >
                    <span className="text-xl font-bold">+</span>
                  </Button>
                </div>
                
                <div className="mt-4 flex gap-2">
                  {[3, 5, 10, 15].map((preset) => (
                    <Button
                      key={preset}
                      size="sm"
                      variant={shortBreakMinutes === preset ? "solid" : "bordered"}
                      color={shortBreakMinutes === preset ? "primary" : "default"}
                      onPress={() => setShortBreakMinutes(preset)}
                      className={`flex-1 ${shortBreakMinutes === preset ? 'bg-accent text-accent-foreground' : ''}`}
                    >
                      {preset}m
                    </Button>
                  ))}
                </div>
              </div>

              {/* Long Break Card */}
              <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <span className="text-2xl">🌴</span>
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Long Break
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Extended rest
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button
                    isIconOnly
                    variant="light"
                    size="lg"
                    onPress={() => {
                      if (longBreakMinutes > 1) setLongBreakMinutes(longBreakMinutes - 1);
                    }}
                    className={`${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'} transition-colors`}
                  >
                    <span className="text-xl font-bold">−</span>
                  </Button>
                  
                  <div className="flex-1 text-center">
                    <div className={`text-4xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {longBreakMinutes}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      minutes
                    </div>
                  </div>
                  
                  <Button
                    isIconOnly
                    variant="light"
                    size="lg"
                    onPress={() => {
                      if (longBreakMinutes < 60) setLongBreakMinutes(longBreakMinutes + 1);
                    }}
                    className={`${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'} transition-colors`}
                  >
                    <span className="text-xl font-bold">+</span>
                  </Button>
                </div>
                
                <div className="mt-4 flex gap-2">
                  {[15, 20, 30, 45].map((preset) => (
                    <Button
                      key={preset}
                      size="sm"
                      variant={longBreakMinutes === preset ? "solid" : "bordered"}
                      color={longBreakMinutes === preset ? "primary" : "default"}
                      onPress={() => setLongBreakMinutes(preset)}
                      className={`flex-1 ${longBreakMinutes === preset ? 'bg-accent text-accent-foreground' : ''}`}
                    >
                      {preset}m
                    </Button>
                  ))}
                </div>
              </div>

              {/* Break Interval Card */}
              <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <span className="text-2xl">🔄</span>
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Break Cycle
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Sessions before long break
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button
                    isIconOnly
                    variant="light"
                    size="lg"
                    onPress={() => {
                      if (longBreakInterval > 2) setLongBreakInterval(longBreakInterval - 1);
                    }}
                    className={`${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'} transition-colors`}
                  >
                    <span className="text-xl font-bold">−</span>
                  </Button>
                  
                  <div className="flex-1 text-center">
                    <div className={`text-4xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {longBreakInterval}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      sessions
                    </div>
                  </div>
                  
                  <Button
                    isIconOnly
                    variant="light"
                    size="lg"
                    onPress={() => {
                      if (longBreakInterval < 10) setLongBreakInterval(longBreakInterval + 1);
                    }}
                    className={`${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'} transition-colors`}
                  >
                    <span className="text-xl font-bold">+</span>
                  </Button>
                </div>
                
                <div className="mt-4 flex gap-2">
                  {[3, 4, 5, 6].map((preset) => (
                    <Button
                      key={preset}
                      size="sm"
                      variant={longBreakInterval === preset ? "solid" : "bordered"}
                      color={longBreakInterval === preset ? "primary" : "default"}
                      onPress={() => setLongBreakInterval(preset)}
                      className={`flex-1 ${longBreakInterval === preset ? 'bg-accent text-accent-foreground' : ''}`}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Presets Section */}
            <div className={`p-6 rounded-2xl border ${
              isDarkMode ? 'bg-gradient-to-r from-gray-900/30 to-gray-800/30 border-gray-700' : 'bg-gradient-to-r from-gray-50/30 to-gray-100/30 border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Quick Presets
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Popular timer configurations
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  variant="bordered"
                  size="lg"
                  onPress={() => {
                    setPomodoroMinutes(25);
                    setShortBreakMinutes(5);
                    setLongBreakMinutes(15);
                    setLongBreakInterval(4);
                  }}
                  className={`h-20 flex-col gap-1 ${isDarkMode ? 'border-gray-600 hover:border-accent text-gray-300 hover:bg-gray-800/50' : 'border-gray-300 hover:border-accent text-gray-700 hover:bg-gray-50'} transition-all hover:scale-105`}
                >
                  <div className="font-bold text-lg">Classic Pomodoro</div>
                  <div className="text-xs opacity-70">25 • 5 • 15 • 4</div>
                </Button>
                
                <Button
                  variant="bordered"
                  size="lg"
                  onPress={() => {
                    setPomodoroMinutes(50);
                    setShortBreakMinutes(10);
                    setLongBreakMinutes(20);
                    setLongBreakInterval(3);
                  }}
                  className={`h-20 flex-col gap-1 ${isDarkMode ? 'border-gray-600 hover:border-accent text-gray-300 hover:bg-gray-800/50' : 'border-gray-300 hover:border-accent text-gray-700 hover:bg-gray-50'} transition-all hover:scale-105`}
                >
                  <div className="font-bold text-lg">Deep Work</div>
                  <div className="text-xs opacity-70">50 • 10 • 20 • 3</div>
                </Button>
                
                <Button
                  variant="bordered"
                  size="lg"
                  onPress={() => {
                    setPomodoroMinutes(15);
                    setShortBreakMinutes(3);
                    setLongBreakMinutes(10);
                    setLongBreakInterval(4);
                  }}
                  className={`h-20 flex-col gap-1 ${isDarkMode ? 'border-gray-600 hover:border-accent text-gray-300 hover:bg-gray-800/50' : 'border-gray-300 hover:border-accent text-gray-700 hover:bg-gray-50'} transition-all hover:scale-105`}
                >
                  <div className="font-bold text-lg">Sprint Mode</div>
                  <div className="text-xs opacity-70">15 • 3 • 10 • 4</div>
                </Button>
              </div>
            </div>

            {/* Timer Behavior Section */}
            <div className={`p-6 rounded-2xl border ${
              isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50/30 border-gray-200'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <span className="text-xl">⚙️</span>
                </div>
                <div>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Timer Behavior
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Customize how your timer works
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormOption
                  title="Count Up Timer"
                  description="Start from 0 and count up to the target duration"
                  isSelected={countUp}
                  onChange={setCountUp}
                />
                
                <FormOption
                  title="Auto Start Next Session"
                  description="Automatically begin the next timer when current one ends"
                  isSelected={autoStart}
                  onChange={setAutoStart}
                />
              </div>
            </div>
          </div>
        );
      
      case "notifications":
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-primary text-2xl font-bold mb-2">
                🔔 Notification Settings
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Control how you receive updates and reminders
              </p>
            </div>

            {/* Timer Notifications Card */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <span className="text-2xl">⏰</span>
                </div>
                <div>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Timer Alerts
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Receive notifications when timers complete
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <FormOption
                  title="Desktop Notifications"
                  description="Show notifications when timer sessions end"
                  isSelected={desktopNotifications}
                  onChange={setDesktopNotifications}
                />
                <FormOption
                  title="Play Sound"
                  description="Play alert sound when timer completes"
                  isSelected={soundNotifications}
                  onChange={setSoundNotifications}
                />
              </div>
            </div>

            {/* Break Reminders Card */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <span className="text-2xl">🧘</span>
                </div>
                <div>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Break Reminders
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Get reminded to take healthy breaks
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <FormOption
                  title="Break Time Notifications"
                  description="Remind me when it's time for a break"
                  isSelected={true}
                  onChange={() => {}}
                />
                <FormOption
                  title="Stand Up Reminders"
                  description="Gentle reminders to stretch and move"
                  isSelected={false}
                  onChange={() => {}}
                />
              </div>
            </div>

            {/* Focus Alerts Card */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Focus Mode
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Minimize distractions during work sessions
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <FormOption
                  title="Block Distracting Apps"
                  description="Temporarily block social media and entertainment"
                  isSelected={false}
                  onChange={() => {}}
                />
                <FormOption
                  title="Minimize Notifications"
                  description="Reduce system notifications during focus time"
                  isSelected={true}
                  onChange={() => {}}
                />
              </div>
            </div>

            {/* Notification Schedule Card */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Schedule
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Control when notifications are active
                  </p>
                </div>
              </div>
              
              <FormOption
                title="Do Not Disturb Hours"
                description="Automatically disable notifications during specified hours"
                isSelected={false}
                onChange={() => {}}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleSave = async () => {
    try {
      // POST settings to API
      await apiClient.post('/users/settings/', {
        countUp,
        autoStart,
        // soundNotifications,
        // desktopNotifications,
        font,
        accentColor,
        wallpaper,
        darkMode: isDarkMode,
        profilePhoto,
        userName
      });
      
      console.log("Settings saved successfully");
      onSave();
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Still call onSave to close modal even if API fails, since localStorage is already updated
      onSave();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      size="5xl"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        base: "bg-transparent",
        backdrop: "bg-black/50 backdrop-blur-sm",
      }}
    >
      <ModalContent className={`${isDarkMode ? 'bg-black/95 border border-gray-800' : 'bg-white/95 border border-gray-100'} shadow-2xl backdrop-blur-md h-2/3 `}  >
        <ModalHeader className={`flex flex-col gap-1 ${isDarkMode ? 'border-b border-gray-800' : 'border-b border-gray-100'}`}>
          <h2 className="text-primary text-xl font-semibold">
            Settings
          </h2>
          <p className="text-secondary text-sm">
            Customize your experience
          </p>
        </ModalHeader>
        <ModalBody className={`${isDarkMode ? 'text-white' : 'text-gray-800'} p-0`}>
          <div className="flex h-full">
            {/* Left Sidebar - Categories */}
            <div className={`w-64 ${isDarkMode ? 'bg-black/50 border-r border-gray-800' : 'bg-gray-50 border-r border-gray-200'} p-4`}>
              <h4 className={`text-sm font-medium mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wide`}>
                Categories
              </h4>
              <nav className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                      selectedCategory === category.id
                        ? `bg-accent text-accent-foreground shadow-md`
                        : `${isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <div>
                        <div className="font-medium">
                          {category.name}
                        </div>
                        <div className={`text-xs ${
                          selectedCategory === category.id 
                            ? 'text-accent-foreground/70' 
                            : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {category.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Right Content Area */}
            <div className="flex-1 p-6">
              <ScrollShadow hideScrollBar={true} className="h-full">
                {renderCategoryContent()}
              </ScrollShadow>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className={`${isDarkMode ? 'border-t border-gray-800' : 'border-t border-gray-100'} gap-3`}>
          <Button 
            color="danger" 
            variant="light" 
            onPress={onClose}
            className={`${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'} transition-colors`}
          >
            Cancel
          </Button>
          <Button 
            className="bg-accent hover:bg-accent-600 text-accent-foreground font-medium px-6 transition-all hover:scale-105"
            onPress={handleSave}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
