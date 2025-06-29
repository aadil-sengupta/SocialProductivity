// API response interfaces for profile data

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  last_login: string | null;
  is_active: boolean;
}

export interface UserData {
  id: number;
  user: User;
  isOnline: boolean;
  timeZone: string;
  onboarded: boolean;
  profilePhoto: string;
  showOnlineStatus: boolean;
  showTimeSpendStudying: boolean;
  accentColor: string;
  wallpaper: string;
  backgroundBlur: boolean;
  font: string;
  darkMode: boolean;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  pauseIsBreak: boolean;
  dailyGoal: number;
  desktopNotifications: boolean;
  playSoundOnNotification: boolean;
  breakReminders: boolean;
  standUpReminders: boolean;
  experiencePoints: number;
  level: number;
  streak: number;
  lastWorked: string | null;
  maxStreak: number;
}

export interface ProfileApiResponse {
  userData: UserData;
  totalSessions: number;
  totalActiveTime: number; // in minutes
  nextLevelExp: number;
}

// For the profile modal component
export interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  totalStudyTime: number; // in minutes
  totalSessions: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experience: number;
  nextLevelExp: number;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }>;
  weeklyStats: Array<{
    day: string;
    minutes: number;
  }>;
  monthlyGoal: number;
  monthlyProgress: number;
  rank: number;
  totalUsers: number;
}
