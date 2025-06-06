import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { ScrollShadow } from '@heroui/react';
import { Button } from "@heroui/button";
import FormOption from "@/components/FormOption";
import ColorPicker from "@/components/ColorPicker";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useAccentColorManager } from "@/contexts/AccentColorContext";
import { apiClient } from "@/services/apiClient";

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
  
  const { isDarkMode, toggleTheme } = useDarkMode();
  const { accentColor } = useAccentColorManager();

  // Load settings from localStorage on component mount
  React.useEffect(() => {
    const loadSettings = () => {
      const savedCountUp = localStorage.getItem('countUp');
      const savedAutoStart = localStorage.getItem('autoStart');
      const savedSoundNotifications = localStorage.getItem('soundNotifications');
      const savedDesktopNotifications = localStorage.getItem('desktopNotifications');
      const savedFont = localStorage.getItem('font');
      const savedWallpaper = localStorage.getItem('wallpaper');

      if (savedCountUp !== null) setCountUp(savedCountUp === 'true');
      if (savedAutoStart !== null) setAutoStart(savedAutoStart === 'true');
      if (savedSoundNotifications !== null) setSoundNotifications(savedSoundNotifications === 'true');
      if (savedDesktopNotifications !== null) setDesktopNotifications(savedDesktopNotifications === 'true');
      if (savedFont) setFont(savedFont);
      if (savedWallpaper) setWallpaper(savedWallpaper);
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

  const handleSave = async () => {
    try {
      // POST settings to API
      await apiClient.post('/users/settings', {
        countUp,
        autoStart,
        soundNotifications,
        desktopNotifications,
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
      size="3xl"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        base: "bg-transparent",
        backdrop: "bg-black/50 backdrop-blur-sm",
      }}
    >
      <ModalContent className={`${isDarkMode ? 'bg-black border border-gray-700' : 'bg-white border border-gray-200'} shadow-2xl`}>
        <ModalHeader className="flex flex-col gap-1 border-b border-gray-300 dark:border-gray-600">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Timer Settings
          </h2>
        </ModalHeader>
        <ModalBody className={isDarkMode ? 'text-white' : 'text-gray-800'}>
          <ScrollShadow hideScrollBar={true} className="max-h-96">
            <div className="space-y-6">
              {/* Color Theme Section */}
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold border-b pb-2 ${
                  isDarkMode ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-800'
                }`}>
                  Appearance
                </h3>
                <div className="space-y-4">
                  <FormOption
                    title="Dark Mode"
                    description="Switch between light and dark theme"
                    isSelected={isDarkMode}
                    onChange={toggleTheme}
                  />
                  <ColorPicker />
                </div>
              </div>

              {/* Timer Settings Section */}
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold border-b pb-2 ${
                  isDarkMode ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-800'
                }`}>
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

              {/* Notification Settings Section */}
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold border-b pb-2 ${
                  isDarkMode ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-800'
                }`}>
                  Notifications
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
            </div>
          </ScrollShadow>
        </ModalBody>
        <ModalFooter className={`border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
          <Button 
            color="danger" 
            variant="light" 
            onPress={onClose}
            className={isDarkMode ? 'text-red-400' : ''}
          >
            Cancel
          </Button>
          <Button 
            className="bg-accent hover:bg-accent-600 text-accent-foreground"
            onPress={handleSave}
          >
            Save Settings
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
