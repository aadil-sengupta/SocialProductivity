import React, { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Button } from "@heroui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAccentColorManager } from "@/contexts/AccentColorContext";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { 
  FiUser, 
  FiClock, 
  FiTarget, 
  FiTrendingUp, 
//  FiCalendar,
  FiAward,
  FiZap,
//  FiHeart,
//  FiStar,
  FiActivity,
  FiX,
  FiShare2,
  FiMessageCircle
} from "react-icons/fi";
//import { apiClient } from "@/services/apiClient";
import { apiClient } from "@/services/apiClient";
import type { ProfileApiResponse, ProfileData } from '@/types/profile';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userId }) => {
  const { colorVariations, accentColor } = useAccentColorManager();
  const { isDarkMode } = useDarkMode();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'stats'>('overview');

  // Load profile data when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      loadProfileData();
    }
  }, [isOpen, userId]);

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the actual API
      const isCurrentUser = userId === 'current-user';
      const apiUrl = isCurrentUser ? '/users/profile/' : `/users/profile/?id=${userId}`;
      
      const response = await apiClient.get<ProfileApiResponse>(apiUrl);
      
      // Transform API response to ProfileData format
      const userData = response.userData;
      const user = userData.user;
      
      const profileData: ProfileData = {
        id: user.id.toString(),
        name: user.first_name || user.username,
        email: user.email,
        avatar: userData.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        joinDate: user.date_joined,
        totalStudyTime: response.totalActiveTime,
        totalSessions: response.totalSessions,
        currentStreak: userData.streak,
        longestStreak: userData.maxStreak,
        level: userData.level,
        experience: userData.experiencePoints,
        nextLevelExp: response.nextLevelExp,
        // Mock data for features not yet implemented
        achievements: [],
        weeklyStats: response.weeklyStats || [
          { day: "Mon", minutes: 0 },
          { day: "Tue", minutes: 0 },
          { day: "Wed", minutes: 0 },
          { day: "Thu", minutes: 0 },
          { day: "Fri", minutes: 0 },
          { day: "Sat", minutes: 0 },
          { day: "Sun", minutes: 0 }
        ],
        monthlyGoal: userData.dailyGoal * 30, // Convert daily to monthly
        monthlyProgress: Math.min(response.totalActiveTime, userData.dailyGoal * 30),
        rank: 0, // Not implemented yet
        totalUsers: 0 // Not implemented yet
      };
      
      setProfileData(profileData);
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Profile loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabVariants = {
    inactive: { scale: 1, opacity: 0.7 },
    active: { scale: 1.05, opacity: 1 }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      backdrop="blur"
      classNames={{
        base: "bg-transparent",
        backdrop: "bg-black/50 backdrop-blur-sm",
      }}
      motionProps={{
        variants: {
          enter: {
            scale: 1,
            opacity: 1,
            transition: {
              duration: 0.4,
              ease: [0.25, 0.46, 0.45, 0.94]
            }
          },
          exit: {
            scale: 0.95,
            opacity: 0,
            transition: {
              duration: 0.3,
              ease: [0.55, 0.085, 0.68, 0.53]
            }
          }
        }
      }}
    >
      <ModalContent 
        className={`relative overflow-hidden border shadow-2xl ${
          isDarkMode ? 'bg-gray-900/60 border-gray-800 backdrop-blur-3xl' : 'bg-white/80 border-gray-100 backdrop-blur-xl'
        }`}
      >
        {(onClose) => (
          <>
            {/* Header */}
            <ModalHeader className="relative z-10 p-8 pb-4">
              <div className="flex items-center justify-between w-full">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  {profileData ? `${profileData.name}'s Profile` : 'User Profile'}
                </motion.h2>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex gap-2"
                >
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className={`${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
                  >
                    <FiShare2 size={18} />
                  </Button>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className={`${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
                  >
                    <FiMessageCircle size={18} />
                  </Button>
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={onClose}
                    className={`${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
                  >
                    <FiX size={18} />
                  </Button>
                </motion.div>
              </div>
            </ModalHeader>

            <ModalBody className="relative z-10 px-8 pb-8">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className={`w-16 h-16 rounded-full border-4 border-t-transparent animate-spin ${
                    isDarkMode ? 'border-gray-600' : 'border-gray-300'
                  }`} style={{ borderTopColor: accentColor }} />
                  <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Loading profile...
                  </p>
                </motion.div>
              ) : error ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-20"
                >
                  <div className={`p-4 rounded-full ${
                    isDarkMode ? 'bg-red-900/20' : 'bg-red-100'
                  } mb-4`}>
                    <FiX className="text-red-500" size={32} />
                  </div>
                  <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Failed to load profile
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {error}
                  </p>
                  <Button
                    onPress={loadProfileData}
                    className="text-white font-medium"
                    style={{ backgroundColor: accentColor }}
                  >
                    Try Again
                  </Button>
                </motion.div>
              ) : profileData ? (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`p-6 rounded-2xl border ${
                      isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-50/50 border-gray-200/50'
                    } backdrop-blur-sm`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <img
                          src={profileData.avatar}
                          alt={profileData.name}
                          className="w-20 h-20 rounded-2xl shadow-lg"
                        />
                        <div 
                          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                          style={{ backgroundColor: accentColor }}
                        >
                          {profileData.level}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                          {profileData.name}
                        </h3>
                        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                          Joined {formatDate(profileData.joinDate)}
                        </p>
                        
                        {/* Experience Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Level {profileData.level}
                            </span>
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {profileData.experience} / {profileData.nextLevelExp} XP
                            </span>
                          </div>
                          <div className={`w-full h-2 rounded-full ${
                            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                          } overflow-hidden`}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(profileData.experience / profileData.nextLevelExp) * 100}%` }}
                              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ 
                                background: `linear-gradient(90deg, ${accentColor}, ${colorVariations[600]})`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {profileData.rank > 0 && profileData.totalUsers > 0 && (
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            #{profileData.rank}
                          </div>
                          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            of {profileData.totalUsers.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Tab Navigation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex space-x-1 p-1 rounded-xl"
                    style={{ backgroundColor: isDarkMode ? '#374151' : '#f3f4f6' }}
                  >
                    {[
                      { id: 'overview', label: 'Overview', icon: FiUser },
                      { id: 'achievements', label: 'Achievements', icon: FiAward },
                      { id: 'stats', label: 'Statistics', icon: FiActivity }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <motion.button
                          key={tab.id}
                          variants={tabVariants}
                          animate={activeTab === tab.id ? 'active' : 'inactive'}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                            activeTab === tab.id
                              ? 'text-white shadow-lg'
                              : isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                          }`}
                          style={activeTab === tab.id ? { backgroundColor: accentColor } : {}}
                        >
                          <Icon size={18} />
                          {tab.label}
                        </motion.button>
                      );
                    })}
                  </motion.div>

                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                      <motion.div
                        key="overview"
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                      >
                        {/* Stats Cards */}
                        {[
                          {
                            icon: FiClock,
                            label: 'Total Study Time',
                            value: formatTime(profileData.totalStudyTime),
                            color: 'text-blue-500',
                            bg: 'from-blue-500/20 to-blue-600/20'
                          },
                          {
                            icon: FiTarget,
                            label: 'Total Sessions',
                            value: profileData.totalSessions.toString(),
                            color: 'text-green-500',
                            bg: 'from-green-500/20 to-green-600/20'
                          },
                          {
                            icon: FiZap,
                            label: 'Current Streak',
                            value: `${profileData.currentStreak} days`,
                            color: 'text-orange-500',
                            bg: 'from-orange-500/20 to-orange-600/20'
                          },
                          {
                            icon: FiTrendingUp,
                            label: 'Best Streak',
                            value: `${profileData.longestStreak} days`,
                            color: 'text-purple-500',
                            bg: 'from-purple-500/20 to-purple-600/20'
                          }
                        ].map((stat, index) => {
                          const Icon = stat.icon;
                          return (
                            <motion.div
                              key={stat.label}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.1 * index }}
                              className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                                isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.bg} flex items-center justify-center mb-3`}>
                                <Icon className={stat.color} size={20} />
                              </div>
                              <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                                {stat.value}
                              </div>
                              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                {stat.label}
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}

                    {activeTab === 'achievements' && (
                      <motion.div
                        key="achievements"
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="flex flex-col items-center justify-center py-20"
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className={`p-8 rounded-2xl border ${
                            isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-gray-50/50 border-gray-200/50'
                          } backdrop-blur-sm text-center max-w-md`}
                        >
                          <div className="text-6xl mb-4">🏆</div>
                          <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                            Achievements Coming Soon!
                          </h3>
                          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                            We're working on an exciting achievement system to celebrate your productivity milestones.
                          </p>
                          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                            isDarkMode ? 'bg-gray-700/50' : 'bg-gray-200/50'
                          }`}>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              In Development
                            </span>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {activeTab === 'stats' && (
                      <motion.div
                        key="stats"
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-6"
                      >
                        {/* Weekly Chart */}
                        <div className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                          isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
                        }`}>
                          <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                            This Week's Activity
                          </h4>
                          <div className="flex items-end justify-between gap-2 h-32 mb-4">
                            {profileData.weeklyStats.map((day, index) => {
                              const maxMinutes = Math.max(...profileData.weeklyStats.map(d => d.minutes));
                              const barHeight = Math.max((day.minutes / maxMinutes) * 128, 4); // 128px = h-32, minimum 4px
                              
                              return (
                                <div key={day.day} className="flex flex-col items-center flex-1">
                                  <div className="w-full flex flex-col justify-end" style={{ height: '128px' }}>
                                    <motion.div
                                      initial={{ height: 0 }}
                                      animate={{ height: `${barHeight}px` }}
                                      transition={{ delay: 0.1 * index, duration: 0.8, ease: "easeOut" }}
                                      className="w-full rounded-t-lg"
                                      style={{ 
                                        backgroundColor: accentColor,
                                        minHeight: '4px'
                                      }}
                                    />
                                  </div>
                                  <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {day.day}
                                  </span>
                                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {day.minutes}m
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Monthly Progress */}
                        <div className={`p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                          isDarkMode ? 'bg-gray-900/50 border-gray-700 hover:border-accent/50' : 'bg-gray-50/50 border-gray-200 hover:border-accent/50'
                        }`}>
                          <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                            Monthly Goal Progress
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {formatTime(profileData.monthlyProgress)} / {formatTime(profileData.monthlyGoal)}
                              </span>
                              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {Math.round((profileData.monthlyProgress / profileData.monthlyGoal) * 100)}%
                              </span>
                            </div>
                            <div className={`w-full h-3 rounded-full ${
                              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                            } overflow-hidden`}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(profileData.monthlyProgress / profileData.monthlyGoal) * 100}%` }}
                                transition={{ delay: 0.3, duration: 1.5, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{ 
                                  background: `linear-gradient(90deg, ${accentColor}, ${colorVariations[600]})`
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : null}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ProfileModal;