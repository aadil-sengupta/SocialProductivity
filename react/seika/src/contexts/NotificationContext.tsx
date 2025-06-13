import React, { createContext, useContext, useState, useEffect } from 'react';

type NotificationSettings = {
  soundNotifications: boolean;
  desktopNotifications: boolean;
};

type NotificationContextType = {
  // Sound notifications
  soundNotifications: boolean;
  setSoundNotifications: (enabled: boolean) => void;
  
  // Desktop notifications
  desktopNotifications: boolean;
  setDesktopNotifications: (enabled: boolean) => void;
  
  // Bulk operations
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
};

// Create a context with default values
const NotificationContext = createContext<NotificationContextType>({
  soundNotifications: true,
  setSoundNotifications: () => {},
  desktopNotifications: false,
  setDesktopNotifications: () => {},
  notificationSettings: {
    soundNotifications: true,
    desktopNotifications: false,
  },
  updateNotificationSettings: () => {},
});

// Custom hook to use the notification context
export const useNotifications = () => useContext(NotificationContext);

// Notification provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage values or defaults
  const [soundNotifications, setSoundNotificationsState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('soundNotifications');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [desktopNotifications, setDesktopNotificationsState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('desktopNotifications');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });

  // Update localStorage when sound notifications change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('soundNotifications', soundNotifications.toString());
    }
  }, [soundNotifications]);

  // Update localStorage when desktop notifications change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('desktopNotifications', desktopNotifications.toString());
    }
  }, [desktopNotifications]);

  // Helper functions with localStorage sync
  const setSoundNotifications = (enabled: boolean) => {
    setSoundNotificationsState(enabled);
  };

  const setDesktopNotifications = (enabled: boolean) => {
    setDesktopNotificationsState(enabled);
  };

  // Bulk update function
  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    if (settings.soundNotifications !== undefined) {
      setSoundNotifications(settings.soundNotifications);
    }
    if (settings.desktopNotifications !== undefined) {
      setDesktopNotifications(settings.desktopNotifications);
    }
  };

  // Create notification settings object
  const notificationSettings: NotificationSettings = {
    soundNotifications,
    desktopNotifications,
  };

  // Context value
  const contextValue = {
    soundNotifications,
    setSoundNotifications,
    desktopNotifications,
    setDesktopNotifications,
    notificationSettings,
    updateNotificationSettings,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
