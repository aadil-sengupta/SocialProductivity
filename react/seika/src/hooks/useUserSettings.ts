import { useCallback } from 'react';
import { useProfile } from '@/contexts/ProfileContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAccentColorManager } from '@/contexts/AccentColorContext';
import { useWallpaper } from '@/contexts/WallpaperContext';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useTimer } from '@/contexts/TimerContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNotificationReminders } from '@/contexts/NotificationRemindersContext';
import { apiClient } from '@/services';

/**
 * Custom hook for managing user settings
 * Provides functions to load settings from server and apply them to contexts
 */
export const useUserSettings = () => {
  // Profile context
  const { setProfilePhoto, setSelectedTimezone, updatePrivacySetting } = useProfile();
  
  // Appearance contexts
  const { setTheme } = useDarkMode();
  const { setAccentColor } = useAccentColorManager();
  const { setSelectedWallpaper, setWallpaperBlur } = useWallpaper();
  const { setFont } = useAppearance();
  
  // Timer context
  const { 
    setPomodoroMinutes,
    setShortBreakMinutes,
    setLongBreakMinutes,
    setLongBreakInterval,
    setCountPauseTime
  } = useTimer();
  
  // Notification contexts
  const { setSoundNotifications, setDesktopNotifications } = useNotifications();
  const { setBreakReminders, setStandUpReminders } = useNotificationReminders();

  /**
   * Load user settings from a settings object and apply them to all contexts
   * @param settings - The settings object to load
   */
  const loadUserSettings = useCallback((settings: any) => {
    if (!settings) return;
    
    try {
      // Profile settings
      if (settings.profilePhoto) setProfilePhoto(settings.profilePhoto);
      if (settings.timeZone) setSelectedTimezone(settings.timeZone);
      if (typeof settings.showOnlineStatus !== 'undefined') {
        updatePrivacySetting('showOnlineStatus', settings.showOnlineStatus);
      }
      if (typeof settings.showTimeSpendStudying !== 'undefined') {
        updatePrivacySetting('showTimeSpentStudying', settings.showTimeSpendStudying);
      }
      
      // Appearance settings
      if (settings.darkMode !== undefined) setTheme(settings.darkMode ? 'dark' : 'light');
      if (settings.accentColor) setAccentColor(settings.accentColor);
      if (settings.wallpaper) setSelectedWallpaper(settings.wallpaper);
      if (settings.backgroundBlur !== undefined) setWallpaperBlur(settings.backgroundBlur);
      if (settings.font) setFont(settings.font);
      
      // Timer settings
      if (settings.focusDuration) setPomodoroMinutes(settings.focusDuration);
      if (settings.shortBreakDuration) setShortBreakMinutes(settings.shortBreakDuration);
      if (settings.longBreakDuration) setLongBreakMinutes(settings.longBreakDuration);
      if (settings.longBreakInterval) setLongBreakInterval(settings.longBreakInterval);
      if (settings.pauseIsBreak !== undefined) setCountPauseTime(settings.pauseIsBreak);
      
      // Notification settings
      if (settings.desktopNotifications !== undefined) setDesktopNotifications(settings.desktopNotifications);
      if (settings.playSoundOnNotification !== undefined) setSoundNotifications(settings.playSoundOnNotification);
      if (settings.breakReminders !== undefined) setBreakReminders(settings.breakReminders);
      if (settings.standUpReminders !== undefined) setStandUpReminders(settings.standUpReminders);
      
      console.log('✅ User settings loaded successfully');
    } catch (error) {
      console.error('❌ Error loading user settings:', error);
    }
  }, [
    setProfilePhoto,
    setSelectedTimezone,
    updatePrivacySetting,
    setTheme,
    setAccentColor,
    setSelectedWallpaper,
    setWallpaperBlur,
    setFont,
    setPomodoroMinutes,
    setShortBreakMinutes,
    setLongBreakMinutes,
    setLongBreakInterval,
    setCountPauseTime,
    setDesktopNotifications,
    setSoundNotifications,
    setBreakReminders,
    setStandUpReminders
  ]);

  /**
   * Fetch user settings from the API and apply them to contexts
   */
  const fetchUserSettings = useCallback(async () => {
    try {
      const settings = await apiClient.get('/users/settings/');
      loadUserSettings(settings);
    } catch (error) {
      console.error('❌ Error fetching user settings:', error);
      // Don't throw error, just log it - user can still use the app with default settings
    }
  }, [loadUserSettings]);

  return {
    loadUserSettings,
    fetchUserSettings
  };
};

export default useUserSettings;
