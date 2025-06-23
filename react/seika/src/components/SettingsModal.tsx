import React from "react";
import { useNavigate } from "react-router-dom";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { ScrollShadow } from '@heroui/react';
import { Button } from "@heroui/button";
import FormOption from "@/components/FormOption";
import ColorPicker from "@/components/ColorPicker";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useAccentColorManager } from "@/contexts/AccentColorContext";
import { useTimer } from "@/contexts/TimerContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useNotificationReminders } from "@/contexts/NotificationRemindersContext";
import { useAppearance, FONT_OPTIONS } from "@/contexts/AppearanceContext";
import { useWallpaper } from "@/contexts/WallpaperContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useOfflineMode } from "@/contexts/OfflineModeContext";
import { apiClient } from "@/services/apiClient";
import WallpaperPicker from "@/components/WallpaperPicker";

// Add custom styles for animations
const avatarAnimationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = avatarAnimationStyles;
  document.head.appendChild(styleSheet);
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = React.useState("profile");
  const [showAvatarPicker, setShowAvatarPicker] = React.useState(false);
  const [showAllFonts, setShowAllFonts] = React.useState(false);
  
  // Use ProfileContext for profile-related state
  const {
    profilePhoto,
    setProfilePhoto,
    userName,
    setUserName,
    setIsLoggedIn,
    selectedTimezone,
    setSelectedTimezone,
    privacySettings,
    updatePrivacySetting,
    selectedAvatarCategory,
    setSelectedAvatarCategory
  } = useProfile();

  // Use NotificationContext for notification settings
  const {
    soundNotifications,
    setSoundNotifications,
    desktopNotifications,
    setDesktopNotifications
  } = useNotifications();

  // Use NotificationRemindersContext for reminder settings
  const {
    breakReminders,
    setBreakReminders,
    standUpReminders,
    setStandUpReminders
  } = useNotificationReminders();

  // Use AppearanceContext for appearance settings
  const {
    font,
    setFont
  } = useAppearance();

  // Use WallpaperContext for wallpaper settings
  const { selectedWallpaper: wallpaper, wallpaperBlur } = useWallpaper();

  // Use WebSocket context for connection management
  const { disconnect } = useWebSocket();

  // Use OfflineMode context for offline functionality
  const { isOfflineMode, toggleOfflineMode } = useOfflineMode();
  
  // Avatar categories and data
  const avatarCategories = [
    {
      id: "vibrent",
      name: "Vibrent",
      emoji: "✨",
      description: "Colorful and vibrant avatars",
      count: 27
    },
    {
      id: "upstream",
      name: "Upstream",
      emoji: "🌊",
      description: "Modern professional avatars",
      count: 22
    },
    {
      id: "toon",
      name: "Toon",
      emoji: "🎭",
      description: "Fun cartoon-style avatars",
      count: 10
    },
    {
      id: "teams",
      name: "Teams",
      emoji: "👥",
      description: "Team collaboration style",
      count: 9
    },
    {
      id: "3d",
      name: "3D",
      emoji: "🎯",
      description: "Three-dimensional avatars",
      count: 5
    }
  ];

  // Generate avatar lists for each category
  const getAvatarsForCategory = (category: string) => {
    const counts = {
      vibrent: 27,
      upstream: 22,
      toon: 10,
      teams: 9,
      "3d": 5
    };
    
    const count = counts[category as keyof typeof counts] || 0;
    return Array.from({ length: count }, (_, i) => `/avatars/${category}_${i + 1}.png`);
  };
  
  const { isDarkMode, toggleTheme } = useDarkMode();
  const { accentColor } = useAccentColorManager();
  const { 
    pomodoroMinutes, 
    shortBreakMinutes, 
    longBreakMinutes, 
    longBreakInterval,
    countPauseTime,
    setPomodoroMinutes,
    setShortBreakMinutes,
    setLongBreakMinutes,
    setLongBreakInterval,
    setCountPauseTime
  } = useTimer();

  // Logout function
  const handleLogout = () => {
    try {
      // Clear all authentication tokens

      apiClient.post('/users/logout/');

      localStorage.removeItem('token');
      localStorage.removeItem('onboarded');
      localStorage.removeItem('userName');
      localStorage.removeItem('seika_users');
      
      // Update profile context
      setIsLoggedIn(false);
      setUserName('User');
      
      // Disconnect WebSocket
      disconnect();
      
      // Close settings modal
      onClose();
      

      // Redirect to login page
      navigate('/login');
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  };

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
    },
    {
      id: "offline",
      name: "Offline Mode",
      icon: "🔌",
      description: "Work without internet"
    }
  ];

  // Load settings from localStorage on component mount
  React.useEffect(() => {
    const loadSettings = () => {
      const savedCategory = localStorage.getItem('selectedSettingsCategory');
      if (savedCategory) setSelectedCategory(savedCategory);
    };

    loadSettings();
  }, []);

  // Effects to update localStorage when state changes
  React.useEffect(() => {
    localStorage.setItem('selectedSettingsCategory', selectedCategory);
  }, [selectedCategory]);

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
                <div className="flex items-center gap-4 mb-8">
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
                  {/* Enhanced Profile Photo Picker */}
                  <div className="flex flex-col items-center space-y-4">
                    <div 
                      className="relative cursor-pointer group"
                      onClick={() => setShowAvatarPicker(true)}
                    >
                      {/* Glow Effect Background */}
                      <div 
                        className="absolute inset-0 rounded-3xl blur-xl opacity-40 transition-all duration-300 group-hover:opacity-60"
                        style={{ backgroundColor: accentColor, transform: 'scale(1.1)' }}
                      />
                      
                      <div className="relative">
                        <img 
                          src={profilePhoto} 
                          alt="Profile" 
                          className="w-32 h-32 object-cover transition-all duration-300 group-hover:scale-105 shadow-2xl"
                          style={{ 
                            borderRadius: '24px',
                            border: `3px solid ${accentColor}60`
                          }}
                        />
                        <div className={`absolute inset-0 rounded-[24px] bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center backdrop-blur-sm`}>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                            style={{ backgroundColor: accentColor }}
                          >
                            <span className="text-white text-xl">✨</span>
                          </div>
                          <span className="text-white text-sm font-medium text-center">Change Avatar</span>
                        </div>
                        <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300"
                          style={{ backgroundColor: accentColor }}
                        >
                          <span className="text-white text-xl">🎭</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        Click to explore our amazing avatar collection
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs px-3 py-1 rounded-full"
                          style={{ 
                            backgroundColor: `${accentColor}20`,
                            color: accentColor
                          }}
                        >
                          {avatarCategories.find(cat => profilePhoto.includes(cat.id))?.name || 'Custom'} Style
                        </span>
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
                    isSelected={privacySettings.showTimeSpentStudying}
                    onChange={(value) => updatePrivacySetting('showTimeSpentStudying', value)}
                  />
                  <FormOption
                    title="Show Online Status"
                    description="Display your online status to other users"
                    isSelected={privacySettings.showOnlineStatus}
                    onChange={(value) => updatePrivacySetting('showOnlineStatus', value)}
                  />
                </div>
              </div>

              {/* Timezone Settings */}
              <div className={`p-6 rounded-2xl border ${
                isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50/30 border-gray-200'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <span className="text-xl">🌍</span>
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Timezone Settings
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Set your preferred timezone for scheduling
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-500/5 to-blue-500/5">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Current Time
                      </p>
                      <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date().toLocaleTimeString('en-US', { 
                          timeZone: selectedTimezone,
                          hour12: true,
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Selected Timezone
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedTimezone.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <select
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-700 text-white focus:border-accent focus:bg-gray-800' 
                        : 'bg-white/50 border-gray-300 text-gray-900 focus:border-accent focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-accent/20 hover:border-accent/50`}
                  >
                    <optgroup label="Popular Timezones">
                      <option value="America/New_York">Eastern Time (New York)</option>
                      <option value="America/Chicago">Central Time (Chicago)</option>
                      <option value="America/Denver">Mountain Time (Denver)</option>
                      <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                      <option value="Europe/London">GMT (London)</option>
                      <option value="Europe/Paris">CET (Paris)</option>
                      <option value="Europe/Berlin">CET (Berlin)</option>
                      <option value="Asia/Tokyo">JST (Tokyo)</option>
                      <option value="Asia/Shanghai">CST (Shanghai)</option>
                      <option value="Asia/Kolkata">IST (India)</option>
                      <option value="Australia/Sydney">AEST (Sydney)</option>
                    </optgroup>
                    <optgroup label="Americas">
                      <option value="America/Toronto">Eastern Time (Toronto)</option>
                      <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                      <option value="America/Mexico_City">Central Time (Mexico City)</option>
                      <option value="America/Sao_Paulo">BRT (São Paulo)</option>
                      <option value="America/Argentina/Buenos_Aires">ART (Buenos Aires)</option>
                    </optgroup>
                    <optgroup label="Europe">
                      <option value="Europe/Madrid">CET (Madrid)</option>
                      <option value="Europe/Rome">CET (Rome)</option>
                      <option value="Europe/Amsterdam">CET (Amsterdam)</option>
                      <option value="Europe/Stockholm">CET (Stockholm)</option>
                      <option value="Europe/Moscow">MSK (Moscow)</option>
                    </optgroup>
                    <optgroup label="Asia & Pacific">
                      <option value="Asia/Dubai">GST (Dubai)</option>
                      <option value="Asia/Singapore">SGT (Singapore)</option>
                      <option value="Asia/Hong_Kong">HKT (Hong Kong)</option>
                      <option value="Asia/Seoul">KST (Seoul)</option>
                      <option value="Australia/Melbourne">AEST (Melbourne)</option>
                      <option value="Pacific/Auckland">NZST (Auckland)</option>
                    </optgroup>
                    <optgroup label="Africa">
                      <option value="Africa/Cairo">EET (Cairo)</option>
                      <option value="Africa/Lagos">WAT (Lagos)</option>
                      <option value="Africa/Johannesburg">SAST (Johannesburg)</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Logout Section */}
              <div className={`p-6 rounded-2xl border ${
                isDarkMode ? 'bg-gray-900/30 border-gray-700' : 'bg-gray-50/30 border-gray-200'
              }`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <span className="text-xl">🚪</span>
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Account Actions
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Manage your session and account
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${
                    isDarkMode ? 'bg-red-900/10 border-red-800/30' : 'bg-red-50/50 border-red-200/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                          Sign Out
                        </h5>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          End your current session and return to login
                        </p>
                      </div>
                      <Button
                        onPress={handleLogout}
                        className={`px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                          isDarkMode 
                            ? 'bg-red-600 hover:bg-red-700 text-white border-red-500' 
                            : 'bg-red-500 hover:bg-red-600 text-white border-red-400'
                        } shadow-lg hover:shadow-xl`}
                        size="sm"
                      >
                        <span className="flex items-center gap-2">
                          <span>🚪</span>
                          Logout
                        </span>
                      </Button>
                    </div>
                  </div>
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

                        {/* Timer Font Settings Card */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <span className="text-2xl">⏱️</span>
                  </div>
                  <div>
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Timer Font
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Choose the font for your main timer display
                    </p>
                  </div>
                </div>
                
                {/* Preview Badge 
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-accent/20 text-accent' : 'bg-accent/10 text-accent'
                }`}>
                  Live Preview
                </div> */}
              </div>
              
              {/* Simple Font Picker */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {(showAllFonts ? FONT_OPTIONS : FONT_OPTIONS.slice(0, 10)).map((fontOption) => (
                  <button
                    key={fontOption.name}
                    onClick={() => setFont(fontOption.name)}
                    className={`group relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                      font === fontOption.name
                        ? 'border-accent bg-accent/10 shadow-lg scale-[1.02]'
                        : `border-transparent ${isDarkMode ? 'bg-gray-800/60 hover:bg-gray-700/60' : 'bg-gray-50/80 hover:bg-gray-100/80'}`
                    }`}
                  >
                    {/* Timer Preview */}
                    <div className={`p-3 rounded-lg mb-3 ${
                      font === fontOption.name 
                        ? 'bg-accent/20' 
                        : `${isDarkMode ? 'bg-gray-900/60' : 'bg-white/80'}`
                    }`}>
                      <div 
                        className={`text-center text-xl font-bold ${
                          font === fontOption.name 
                            ? 'text-accent' 
                            : isDarkMode ? 'text-white' : 'text-gray-800'
                        }`}
                        style={{ fontFamily: fontOption.name }}
                      >
                        25:00
                      </div>
                    </div>
                    
                    {/* Font Name */}
                    <div className="text-center">
                      <h4 className={`text-sm font-medium ${
                        font === fontOption.name 
                          ? 'text-accent' 
                          : isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {fontOption.name}
                      </h4>
                    </div>
                    
                    {/* Selection Indicator */}
                    {font === fontOption.name && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-accent-foreground text-xs font-bold">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Show More/Less Button */}
              {FONT_OPTIONS.length > 10 && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setShowAllFonts(!showAllFonts)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] border ${
                      isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800/50 border-gray-700/50 hover:border-gray-600' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50 border-gray-200/50 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm font-medium">
                      {showAllFonts ? 'Show Less' : `Show ${FONT_OPTIONS.length - 10} More Fonts`}
                    </span>
                    <span className={`transition-transform duration-300 ${showAllFonts ? 'rotate-180' : ''}`}>
                      ↓
                    </span>
                  </button>
                </div>
              )}
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
              
                <FormOption
                  title="Paused time counts as break"
                  description="Include paused timer duration in break calculations (Highly Recommended)."
                  isSelected={countPauseTime}
                  onChange={setCountPauseTime}
                />
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
                  isSelected={breakReminders}
                  onChange={setBreakReminders}
                />
                <FormOption
                  title="Stand Up Reminders"
                  description="Gentle reminders to stretch and move"
                  isSelected={standUpReminders}
                  onChange={setStandUpReminders}
                  comingSoon={true}
                  comingSoonText="Coming Soon!"
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
                  title="Block Distracting Apps & Websites"
                  description="Temporarily block social media and entertainment"
                  isSelected={false}
                  onChange={() => {}}
                  comingSoon={true}
                  comingSoonText="Coming Soon!"
                />
                <FormOption
                  title="Minimize Notifications"
                  description="Reduce system notifications during focus time"
                  isSelected={true}
                  onChange={() => {}}
                  comingSoon={true}
                  comingSoonText="Coming Soon!"
                />
              </div>
            </div>

            {/* Notification Schedule Card */}
            {/* <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
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
            </div> */}
          </div>
        );
      
      case "offline":
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h3 className="text-primary text-2xl font-bold mb-2">
                🔌 Offline Mode Settings
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Work without internet connection when needed
              </p>
            </div>

            {/* Offline Mode Toggle Card */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
              isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isOfflineMode ? 'bg-orange-500/10' : 'bg-green-500/10'
                }`}>
                  <span className="text-2xl">{isOfflineMode ? '🔌' : '🌐'}</span>
                </div>
                <div>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Offline Mode
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isOfflineMode ? 'Currently working offline' : 'Connected and syncing'}
                  </p>
                </div>
              </div>
              
              <FormOption
                title="Enable Offline Mode"
                description="Disable internet connectivity and work locally. Time tracking will be paused."
                isSelected={isOfflineMode}
                onChange={toggleOfflineMode}
              />
            </div>

            {/* Offline Mode Information Card */}
            <div className={`p-6 rounded-2xl border ${
              isDarkMode ? 'bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-amber-800/30' : 'bg-gradient-to-r from-amber-50/50 to-orange-50/50 border-amber-200/50'
            }`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <span className="text-2xl">ℹ️</span>
                </div>
                <div>
                  <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    What happens in Offline Mode?
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Understanding offline functionality
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-500 text-sm">✓</span>
                  </div>
                  <div>
                    <h5 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Timer Functions Continue
                    </h5>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      All timer, break, and settings functionality works normally
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-amber-500 text-sm">⚠</span>
                  </div>
                  <div>
                    <h5 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Time Tracking Paused
                    </h5>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Study time won't be tracked to your account (for now)
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-500 text-sm">🔌</span>
                  </div>
                  <div>
                    <h5 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      No Server Connection
                    </h5>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      WebSocket connection disabled, working purely locally
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            {isOfflineMode && (
              <div className={`p-4 rounded-xl border-l-4 ${
                isDarkMode 
                  ? 'bg-orange-900/20 border-orange-500 text-orange-300' 
                  : 'bg-orange-50 border-orange-400 text-orange-700'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔌</span>
                  <div>
                    <p className="font-medium text-sm">Offline Mode Active</p>
                    <p className="text-xs opacity-75">You're working locally without internet connectivity</p>
                  </div>
                </div>
              </div>
            )}
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
        // Profile settings
        profilePhoto,
        showOnlineStatus: privacySettings.showOnlineStatus,
        showTimeSpendStudying: privacySettings.showTimeSpentStudying,
        timeZone: selectedTimezone,
        
        // Theme settings (map React state to Django field names)
        accentColor,
        wallpaper,
        backgroundBlur: wallpaperBlur,
        font,
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
      onSave();
    } catch (error) {
      console.error("Failed to save settings:", error);
      // Still call onSave to close modal even if API fails, since localStorage is already updated
      onSave();
    }
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onOpenChange={(open) => {
          if (!open) {
            onClose();
          }
        }}
        onClose={handleSave}
        size="5xl"
        backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        base: "bg-transparent",
        backdrop: "bg-black/50 backdrop-blur-sm",
      }}
    >
      <ModalContent className={`${isDarkMode ? 'bg-gray-900/60 border border-gray-800  backdrop-blur-3xl' : 'bg-white/80 border border-gray-100  backdrop-blur-xl'} shadow-2xl h-5/6`}  >
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
            <div className={`w-64 ${isDarkMode ? ' border-r border-gray-800' : 'border-r border-gray-200'} p-4`}>
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
              <ScrollShadow hideScrollBar={true} className="h-full pt-4 pb-7 px-3">
                {renderCategoryContent()}
              </ScrollShadow>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className={`${isDarkMode ? 'border-t border-gray-800' : 'border-t border-gray-100'} gap-3`}>
          {/* <Button 
            color="danger" 
            variant="light" 
            onPress={onClose}
            className={`${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'} transition-colors`}
          >
            Cancel
          </Button> */}
          <Button 
            className="bg-accent hover:bg-accent-600 text-accent-foreground font-medium px-6 transition-all hover:scale-105"
            onPress={handleSave}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>

    {/* Enhanced Avatar Picker Modal */}
    <Modal 
      isOpen={showAvatarPicker} 
      onClose={() => setShowAvatarPicker(false)}
      size="5xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "bg-transparent",
        backdrop: "bg-black/60 backdrop-blur-md",
      }}
    >
      <ModalContent className={`${isDarkMode ? 'bg-black/95 border border-gray-800' : 'bg-white/95 border border-gray-100'} shadow-2xl backdrop-blur-md`}>
        <ModalHeader className="p-8 pb-6">
          <div className="text-center space-y-6 w-full">
            {/* Enhanced Header */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}40)`,
                  border: `2px solid ${accentColor}30`
                }}
              >
                <span className="text-3xl">🎭</span>
              </div>
              <div>
                <h3 className={`text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent`}
                  style={{ backgroundImage: `linear-gradient(135deg, ${accentColor}, ${accentColor}80)` }}
                >
                  Choose Your Avatar
                </h3>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Pick a style that represents your unique personality
                </p>
              </div>
            </div>
            
            {/* Enhanced Avatar Preview with Glow Effect */}
            <div className="relative mx-auto w-32 h-32">
              <div 
                className="absolute inset-0 rounded-3xl blur-xl opacity-60"
                style={{ backgroundColor: accentColor }}
              />
              <div className="relative w-full h-full">
                <img 
                  src={profilePhoto} 
                  alt="Current Avatar" 
                  className="w-full h-full object-cover rounded-3xl shadow-2xl transition-all duration-300"
                  style={{ border: `3px solid ${accentColor}60` }}
                />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  <span className="text-white text-lg">✨</span>
                </div>
              </div>
            </div>
            
            {/* Enhanced Category Tabs */}
            <div className="flex gap-3 justify-center flex-wrap">
              {avatarCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedAvatarCategory(category.id)}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-3 ${
                    selectedAvatarCategory === category.id
                      ? 'text-white shadow-lg transform scale-105'
                      : isDarkMode
                      ? 'bg-gray-800/70 text-gray-300 hover:bg-gray-700/70 border border-gray-700'
                      : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200/70 border border-gray-200'
                  }`}
                  style={selectedAvatarCategory === category.id ? {
                    backgroundColor: accentColor,
                    borderColor: accentColor,
                    boxShadow: `0 8px 32px ${accentColor}40`
                  } : {}}
                >
                  <span className="text-lg">{category.emoji}</span>
                  <span>{category.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    selectedAvatarCategory === category.id
                      ? 'bg-white/20 text-white'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </ModalHeader>
        
        <ModalBody className="px-8 pb-6">
          {/* Enhanced Avatar Grid */}
          <div 
            className="p-6 rounded-2xl max-h-80 overflow-y-auto"
            style={{ 
              backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}
          >
            <div className="grid grid-cols-6 gap-4">
              {getAvatarsForCategory(selectedAvatarCategory).slice(0, 18).map((avatarPath, index) => (
                <div
                  key={avatarPath}
                  className={`relative cursor-pointer group transition-all duration-300 hover:scale-110 hover:z-10 ${
                    profilePhoto === avatarPath ? 'scale-110 z-10' : ''
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: showAvatarPicker ? 'fadeInUp 0.6s ease-out forwards' : 'none'
                  }}
                  onClick={() => {
                    setProfilePhoto(avatarPath);
                    setShowAvatarPicker(false);
                  }}
                >
                  <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                    profilePhoto === avatarPath 
                      ? 'shadow-2xl' 
                      : 'hover:shadow-xl'
                  }`}
                    style={profilePhoto === avatarPath ? {
                      boxShadow: `0 0 0 3px ${accentColor}, 0 12px 32px ${accentColor}40`
                    } : {}}
                  >
                    <img
                      src={avatarPath}
                      alt={`Avatar ${index + 1}`}
                      className="w-full h-full object-cover transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    {profilePhoto === avatarPath && (
                      <div className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: `${accentColor}20` }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: accentColor }}
                        >
                          <span className="text-white text-lg font-bold">✓</span>
                        </div>
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ModalBody>
        
        <ModalFooter className="p-8 pt-4 flex justify-between items-center">
          <Button 
            variant="light" 
            size="lg"
            onPress={() => setShowAvatarPicker(false)}
            className={`${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'} font-medium`}
          >
            Cancel
          </Button>
          
          <div className="flex gap-4">
            {/* Random Avatar Button */}
            <Button
              variant="bordered"
              size="lg"
              onPress={() => {
                const allAvatars = getAvatarsForCategory(selectedAvatarCategory);
                const randomAvatar = allAvatars[Math.floor(Math.random() * allAvatars.length)];
                setProfilePhoto(randomAvatar);
              }}
              className={`font-medium border-2 transition-all hover:scale-105 ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:border-accent hover:text-accent' 
                  : 'border-gray-300 text-gray-600 hover:border-accent hover:text-accent'
              }`}
            >
              🎲 Surprise Me
            </Button>
            
            {/* Done Button */}
            <Button
              size="lg"
              onPress={() => setShowAvatarPicker(false)}
              className="font-medium px-8 transition-all hover:scale-105 text-white shadow-lg"
              style={{ 
                backgroundColor: accentColor,
                boxShadow: `0 4px 20px ${accentColor}40`
              }}
            >
              Perfect! ✨
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
    </>
  );
}
