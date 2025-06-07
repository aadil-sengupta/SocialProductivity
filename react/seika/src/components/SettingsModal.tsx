import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { ScrollShadow } from '@heroui/react';
import { Button } from "@heroui/button";
import FormOption from "@/components/FormOption";
import ColorPicker from "@/components/ColorPicker";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useAccentColorManager } from "@/contexts/AccentColorContext";
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
            <div className="space-y-6">
                <h3 className="text-primary text-lg font-semibold mb-6">
                Profile Settings
                </h3>
                
                {/* Profile Photo and Name Section */}
                <div className="flex flex-col items-center space-y-3 py-6">
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
                    <img 
                      src={profilePhoto} 
                      alt="Profile" 
                      className="w-20 h-20 object-cover transition-transform duration-200 group-hover:scale-105"
                      style={{ borderRadius: '15px' }}
                    />
                  </div>

                  {/* Name Field */}
                  <div className="w-full max-w-[200px]">
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-md border transition-all duration-200 text-center mt-1 text-large font-medium ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700 text-white focus:border-accent' 
                          : 'bg-white border-gray-300 text-gray-900 focus:border-accent'
                      } focus:outline-none focus:ring-1 focus:ring-accent/30`}
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                <FormOption
                    title="Time Spent Studying"
                    description="Display time spent studying today to other users"
                    isSelected={true} // Placeholder, implement actual logic
                    onChange={() => {}}
                />
                <FormOption
                    title="Show Online Status"
                    description="Display your online status to other users"
                    isSelected={false} // Placeholder, implement actual logic
                    onChange={() => {}}
                />
                </div>
            </div>
            );
      case "appearance":
        return (
          <div className="space-y-4">
            <h3 className="text-primary text-lg font-semibold mb-4">
              Appearance Settings
            </h3>
            <div className="space-y-4">
              <FormOption
                title="Dark Mode"
                description="Switch between light and dark theme"
                isSelected={isDarkMode}
                onChange={toggleTheme}
              />
              <WallpaperPicker />
              <ColorPicker />
            </div>
          </div>
        );
      
      case "timer":
        return (
          <div className="space-y-4">
            <h3 className="text-primary text-lg font-semibold mb-4">
              Timer Settings
            </h3>
            <div className="space-y-4">
              <FormOption
                title="Count Up"
                description="Start the timer from 0 and count up to a specified duration"
                isSelected={countUp}
                onChange={setCountUp}
              />
              
              <FormOption
                title="Auto Start Next Timer"
                description="Automatically start the next timer session when current one ends"
                isSelected={autoStart}
                onChange={setAutoStart}
              />
            </div>
          </div>
        );
      
      case "notifications":
        return (
          <div className="space-y-4">
            <h3 className="text-primary text-lg font-semibold mb-4">
              Notification Settings
            </h3>
            <div className="space-y-4">
              <FormOption
                title="Sound Notifications"
                description="Play sound when timer starts, pauses, and ends"
                isSelected={soundNotifications}
                onChange={setSoundNotifications}
              />
              
              <FormOption
                title="Desktop Notifications"
                description="Show browser notifications for timer events"
                isSelected={desktopNotifications}
                onChange={setDesktopNotifications}
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
