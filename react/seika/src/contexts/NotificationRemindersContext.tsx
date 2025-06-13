import React, { createContext, useContext, useState, useEffect } from 'react';

type NotificationRemindersSettings = {
  breakReminders: boolean;
  standUpReminders: boolean;
};

type NotificationRemindersContextType = {
  // Break reminders
  breakReminders: boolean;
  setBreakReminders: (enabled: boolean) => void;
  
  // Stand up reminders
  standUpReminders: boolean;
  setStandUpReminders: (enabled: boolean) => void;
  
  // Bulk operations
  notificationRemindersSettings: NotificationRemindersSettings;
  updateNotificationRemindersSettings: (settings: Partial<NotificationRemindersSettings>) => void;
};

// Create a context with default values
const NotificationRemindersContext = createContext<NotificationRemindersContextType>({
  breakReminders: true,
  setBreakReminders: () => {},
  standUpReminders: false,
  setStandUpReminders: () => {},
  notificationRemindersSettings: {
    breakReminders: true,
    standUpReminders: false,
  },
  updateNotificationRemindersSettings: () => {},
});

// Custom hook to use the notification reminders context
export const useNotificationReminders = () => useContext(NotificationRemindersContext);

// Notification reminders provider component
export const NotificationRemindersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage values or defaults
  const [breakReminders, setBreakRemindersState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('breakReminders');
      return saved !== null ? saved === 'true' : true;
    }
    return true;
  });

  const [standUpReminders, setStandUpRemindersState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('standUpReminders');
      return saved !== null ? saved === 'true' : false;
    }
    return false;
  });

  // Update localStorage when break reminders change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('breakReminders', breakReminders.toString());
    }
  }, [breakReminders]);

  // Update localStorage when stand up reminders change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('standUpReminders', standUpReminders.toString());
    }
  }, [standUpReminders]);

  // Helper functions with localStorage sync
  const setBreakReminders = (enabled: boolean) => {
    setBreakRemindersState(enabled);
  };

  const setStandUpReminders = (enabled: boolean) => {
    setStandUpRemindersState(enabled);
  };

  // Bulk update function
  const updateNotificationRemindersSettings = (settings: Partial<NotificationRemindersSettings>) => {
    if (settings.breakReminders !== undefined) {
      setBreakReminders(settings.breakReminders);
    }
    if (settings.standUpReminders !== undefined) {
      setStandUpReminders(settings.standUpReminders);
    }
  };

  // Create notification reminders settings object
  const notificationRemindersSettings: NotificationRemindersSettings = {
    breakReminders,
    standUpReminders,
  };

  // Context value
  const contextValue = {
    breakReminders,
    setBreakReminders,
    standUpReminders,
    setStandUpReminders,
    notificationRemindersSettings,
    updateNotificationRemindersSettings,
  };

  return (
    <NotificationRemindersContext.Provider value={contextValue}>
      {children}
    </NotificationRemindersContext.Provider>
  );
};
