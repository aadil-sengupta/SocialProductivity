import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight, FiCheck, FiX } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useProfile } from '@/contexts/ProfileContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAccentColorManager } from '@/contexts/AccentColorContext';
import { useWallpaper } from '@/contexts/WallpaperContext';
import { apiClient } from '@/services';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const { accentColor } = useAccentColorManager();
  const { selectedWallpaper, wallpaperBlur } = useWallpaper();
  const { setIsLoggedIn, setUserName } = useProfile();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  useEffect(() => {
    document.title = 'Seika - Login';
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
        console.log('Submitting login with:', formData);
        const response = await apiClient.post('/users/login/', {
            email: formData.email,
            password: formData.password
        }) as { 
            user: { 
                user: { 
                    first_name: string; 
                    username: string;
                    email: string;
                }
            }, 
            token: string 
        };

        const user = response.user;
        const token = response.token;
        if (token) {
            // Store token in localStorage
            localStorage.setItem('token', token);
        }
        console.log('Login response:', response);
      if (user) {
        setSuccess(true);
        // Access firstName from the nested user object
        setUserName(user.user.first_name || user.user.username);
        setIsLoggedIn(true);
        
        // Redirect after success animation
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err instanceof Error) {
        setError(err.message || 'Login failed. Please try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // try {
    //   setIsLoading(true);
    //   setError('');
      
    //   // Simulate Google OAuth flow
    //   await new Promise(resolve => setTimeout(resolve, 1000));
      
    //   // Mock Google user data (in real app, this would come from Google OAuth)
    //   const googleUser = {
    //     name: 'Google User', // This would come from Google profile
    //     email: 'user@gmail.com', // This would come from Google profile
    //   };

    //   // Get existing users from localStorage
    //   const existingUsers = JSON.parse(localStorage.getItem('seika_users') || '[]');
      
    //   // Find existing user or create if doesn't exist
    //   let user = existingUsers.find((u: any) => u.email === googleUser.email);
      
    //   if (!user) {
    //     // Create new Google user
    //     user = {
    //       id: `google_${Date.now()}`,
    //       name: googleUser.name,
    //       email: googleUser.email,
    //       googleId: 'google_oauth_id_' + Date.now(),
    //       createdAt: new Date().toISOString(),
    //       provider: 'google'
    //     };
        
    //     const updatedUsers = [...existingUsers, user];
    //     localStorage.setItem('seika_users', JSON.stringify(updatedUsers));
    //   }

    //   setSuccess(true);
    //   setUserName(user.name);
    //   setIsLoggedIn(true);
      
    //   // Redirect after success animation
    //   setTimeout(() => {
    //     navigate('/dashboard');
    //   }, 1500);
    // } catch (err) {
    //   setError('Google login failed. Please try again.');
    // } finally {
    //   setIsLoading(false);
    // }
    alert('Google login is not available at the moment. Please use email and password to log in.');
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-black">
      {/* Wallpaper Background */}
      {selectedWallpaper && (
        <div className="fixed inset-0 z-0">
          <img
            src={`/wallpapers/${selectedWallpaper}`}
            alt="Wallpaper"
            className="w-full h-full object-cover transition-all duration-500"
            style={{ filter: wallpaperBlur ? 'blur(8px)' : 'blur(4px)' }}
          />
        </div>
      )}

      {/* Main Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="relative mx-auto w-16 h-16 mb-6 mt-10">
            <div 
              className="absolute inset-0 rounded-2xl blur-xl opacity-40"
              style={{ backgroundColor: accentColor }}
            />
            <div 
              className="relative w-full h-full rounded-2xl flex items-center justify-center text-2xl text-white shadow-2xl"
              style={{ backgroundColor: accentColor }}
            >
              ✨
            </div>
          </div>
          
          <h1 className={`text-3xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Welcome Back
          </h1>
          <p className={`text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Sign in to continue your productivity journey
          </p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-8 rounded-3xl border backdrop-blur-3xl shadow-2xl ${
            isDarkMode 
              ? 'bg-gray-900/60 border-gray-700/40' 
              : 'bg-white/70 border-gray-200/40'
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Input
                type="email"
                // label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                startContent={<FiMail className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />}
                variant="flat"
                isInvalid={error.includes('email')}
                size="lg"
                radius="lg"
                classNames={{
                  input: `text-lg ${isDarkMode ? 'text-white placeholder:text-gray-400' : 'text-gray-900 placeholder:text-gray-500'} font-medium`,
                  inputWrapper: `h-16 px-4 transition-all duration-300 backdrop-blur-md border-2 ${
                    isDarkMode 
                      ? 'bg-gray-800/80 border-gray-700/60 hover:border-gray-600/80 focus-within:!border-opacity-100 shadow-lg' 
                      : 'bg-white/90 border-gray-200/60 hover:border-gray-300/80 focus-within:!border-opacity-100 shadow-lg'
                  }`,
                  label: `text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`,
                  base: "mb-1"
                }}
                style={{
                  '--focus-border-color': accentColor
                } as React.CSSProperties}
              />
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Input
                type={isPasswordVisible ? "text" : "password"}
                // label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                startContent={<FiLock className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                  >
                    {isPasswordVisible ? <FiEyeOff /> : <FiEye />}
                  </button>
                }
                variant="flat"
                isInvalid={error.includes('password')}
                size="lg"
                radius="lg"
                classNames={{
                  input: `text-lg ${isDarkMode ? 'text-white placeholder:text-gray-400' : 'text-gray-900 placeholder:text-gray-500'} font-medium`,
                  inputWrapper: `h-16 px-4 transition-all duration-300 backdrop-blur-md border-2 ${
                    isDarkMode 
                      ? 'bg-gray-800/80 border-gray-700/60 hover:border-gray-600/80 focus-within:!border-opacity-100 shadow-lg' 
                      : 'bg-white/90 border-gray-200/60 hover:border-gray-300/80 focus-within:!border-opacity-100 shadow-lg'
                  }`,
                  label: `text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`,
                  base: "mb-1"
                }}
                style={{
                  '--focus-border-color': accentColor
                } as React.CSSProperties}
              />
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center gap-2 p-3 rounded-xl border backdrop-blur-sm ${
                    isDarkMode 
                      ? 'bg-red-900/20 border-red-800/50' 
                      : 'bg-red-50/80 border-red-200/60'
                  }`}
                >
                  <FiX className="text-red-500" />
                  <span className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {error}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`flex items-center gap-2 p-3 rounded-xl border backdrop-blur-sm ${
                    isDarkMode 
                      ? 'bg-green-900/20 border-green-800/50' 
                      : 'bg-green-50/80 border-green-200/60'
                  }`}
                >
                  <FiCheck className="text-green-500" />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Login successful! Redirecting...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                type="submit"
                isLoading={isLoading}
                isDisabled={success}
                className="w-full text-white font-semibold text-lg py-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                style={{ 
                  backgroundColor: accentColor,
                  boxShadow: `0 4px 20px ${accentColor}40`
                }}
                endContent={!isLoading && !success && <FiArrowRight />}
              >
                {isLoading ? 'Signing In...' : success ? 'Success!' : 'Sign In'}
              </Button>
            </motion.div>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="relative flex items-center justify-center py-4"
            >
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                }`} />
              </div>
              <div className={`relative px-4 text-sm backdrop-blur-sm ${
                isDarkMode ? 'bg-gray-900/50 text-gray-400' : 'bg-white/50 text-gray-500'
              }`}>
                or continue with
              </div>
            </motion.div>

            {/* Google Login Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="button"
                onClick={handleGoogleLogin}
                isLoading={isLoading}
                isDisabled={success}
                className={`w-full border transition-all duration-200 shadow-md hover:shadow-lg rounded-xl py-6 backdrop-blur-sm ${
                  isDarkMode 
                    ? 'bg-gray-800/50 hover:bg-gray-700/60 border-gray-600 hover:border-gray-500 text-white' 
                    : 'bg-white/50 hover:bg-white/70 border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
                startContent={!isLoading && <FcGoogle className="text-xl" />}
              >
                {isLoading ? 'Connecting...' : 'Continue with Google'}
              </Button>
            </motion.div>

            {/* Forgot Password Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="text-center pt-2"
            >
              <Link
                to="/forgot-password"
                className={`text-sm hover:underline transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                style={{ 
                  color: isDarkMode ? undefined : undefined,
                  '--hover-color': accentColor
                } as React.CSSProperties}
              >
                Forgot your password?
              </Link>
            </motion.div>
          </form>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className={`text-center mt-6 p-4 rounded-2xl backdrop-blur-xl ${
            isDarkMode ? 'bg-gray-800/30' : 'bg-white/30'
          }`}
        >
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Don't have an account?{' '}
          </span>
          <Link
            to="/signup"
            className="text-sm font-semibold hover:underline transition-colors"
            style={{ color: accentColor }}
          >
            Sign up here
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
