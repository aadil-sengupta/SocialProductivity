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
  
  const { isDarkMode, toggleTheme } = useDarkMode();
  const { accentColor } = useAccentColorManager();

  const categories = [
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

      if (savedCountUp !== null) setCountUp(savedCountUp === 'true');
      if (savedAutoStart !== null) setAutoStart(savedAutoStart === 'true');
      if (savedSoundNotifications !== null) setSoundNotifications(savedSoundNotifications === 'true');
      if (savedDesktopNotifications !== null) setDesktopNotifications(savedDesktopNotifications === 'true');
      if (savedFont) setFont(savedFont);
      if (savedWallpaper) setWallpaper(savedWallpaper);
      if (savedCategory) setSelectedCategory(savedCategory);
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

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case "appearance":
        return (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
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
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
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
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
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
        darkMode: isDarkMode
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
      <ModalContent className={`${isDarkMode ? 'bg-black/95 border border-gray-800' : 'bg-white/95 border border-gray-100'} shadow-2xl backdrop-blur-md`}>
        <ModalHeader className={`flex flex-col gap-1 ${isDarkMode ? 'border-b border-gray-800' : 'border-b border-gray-100'}`}>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Settings
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Customize your experience
          </p>
        </ModalHeader>
        <ModalBody className={`${isDarkMode ? 'text-white' : 'text-gray-800'} p-0`}>
          <div className="flex h-96">
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
