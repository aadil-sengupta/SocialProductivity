import React, { createContext, useContext, useState } from 'react';

type PrivacySettings = {
  showTimeSpentStudying: boolean;
  showOnlineStatus: boolean;
};

type ProfileContextType = {
  // Profile Photo
  profilePhoto: string;
  setProfilePhoto: (photo: string) => void;
  
  // User Info
  userName: string;
  setUserName: (name: string) => void;
  
  // Timezone
  selectedTimezone: string;
  setSelectedTimezone: (timezone: string) => void;
  
  // Privacy Settings
  privacySettings: PrivacySettings;
  updatePrivacySetting: (key: keyof PrivacySettings, value: boolean) => void;
  
  // Avatar Category
  selectedAvatarCategory: string;
  setSelectedAvatarCategory: (category: string) => void;
};

// Create a context with default values
const ProfileContext = createContext<ProfileContextType>({
  profilePhoto: "/avatars/vibrent_6.png",
  setProfilePhoto: () => {},
  userName: "User",
  setUserName: () => {},
  selectedTimezone: "America/New_York",
  setSelectedTimezone: () => {},
  privacySettings: {
    showTimeSpentStudying: true,
    showOnlineStatus: false,
  },
  updatePrivacySetting: () => {},
  selectedAvatarCategory: "vibrent",
  setSelectedAvatarCategory: () => {},
});

// Custom hook to use the profile context
export const useProfile = () => useContext(ProfileContext);

// Profile provider component
export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with localStorage values or defaults
  const [profilePhoto, setProfilePhotoState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('profilePhoto') || "/avatars/vibrent_6.png";
    }
    return "/avatars/vibrent_6.png";
  });

  const [userName, setUserNameState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userName') || "User";
    }
    return "User";
  });

  const [selectedTimezone, setSelectedTimezoneState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const savedTimezone = localStorage.getItem('selectedTimezone');
      return savedTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
    return "America/New_York";
  });

  const [privacySettings, setPrivacySettingsState] = useState<PrivacySettings>(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('privacySettings');
      if (savedSettings) {
        try {
          return JSON.parse(savedSettings);
        } catch (error) {
          console.warn('Failed to parse privacy settings from localStorage:', error);
        }
      }
    }
    return {
      showTimeSpentStudying: true,
      showOnlineStatus: false,
    };
  });

  const [selectedAvatarCategory, setSelectedAvatarCategoryState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedAvatarCategory') || "vibrent";
    }
    return "vibrent";
  });

  // Wrapper functions to update localStorage when state changes
  const setProfilePhoto = (photo: string) => {
    setProfilePhotoState(photo);
    if (typeof window !== 'undefined') {
      localStorage.setItem('profilePhoto', photo);
    }
  };

  const setUserName = (name: string) => {
    setUserNameState(name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userName', name);
    }
  };

  const setSelectedTimezone = (timezone: string) => {
    setSelectedTimezoneState(timezone);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedTimezone', timezone);
    }
  };

  const updatePrivacySetting = (key: keyof PrivacySettings, value: boolean) => {
    setPrivacySettingsState(prev => {
      const newSettings = { ...prev, [key]: value };
      if (typeof window !== 'undefined') {
        localStorage.setItem('privacySettings', JSON.stringify(newSettings));
      }
      return newSettings;
    });
  };

  const setSelectedAvatarCategory = (category: string) => {
    setSelectedAvatarCategoryState(category);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedAvatarCategory', category);
    }
  };

  // Context value
  const contextValue = {
    profilePhoto,
    setProfilePhoto,
    userName,
    setUserName,
    selectedTimezone,
    setSelectedTimezone,
    privacySettings,
    updatePrivacySetting,
    selectedAvatarCategory,
    setSelectedAvatarCategory,
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};
