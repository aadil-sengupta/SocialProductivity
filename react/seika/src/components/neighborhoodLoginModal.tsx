import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from '@heroui/react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useAccentColorManager } from '@/contexts/AccentColorContext';
import { useProfile } from '@/contexts/ProfileContext';

interface NeighborhoodLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type ModalStep = 'email' | 'otp';

export default function NeighborhoodLoginModal({ isOpen, onClose, onSuccess }: NeighborhoodLoginModalProps) {
  const [step, setStep] = useState<ModalStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { isDarkMode } = useDarkMode();
  const { accentColor } = useAccentColorManager();
  const { setNeighborhoodToken } = useProfile();

  const handleEmailSubmit = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call to request OTP
      console.log('🏘️ Requesting OTP for email:', email);
      

      const response = await fetch("/neighborhoodApi/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

        if (response.ok) {      
          setError("");
          console.log("OTP sent successfully:", data.message);
            console.log('✅ OTP sent successfully');
            setStep('otp');
        } else {
          setError(data.message || "Error sending OTP");
            console.error("Error requesting OTP:", data);
        }

    } catch (error) {
      console.error('❌ Error requesting OTP:', error);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp || otp.length < 6) {
      setError('Please enter a valid OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate API call to verify OTP
      console.log('🏘️ Verifying OTP for email:', email, 'OTP:', otp);
      
      console.log("Verifying OTP for email:", email);
      const response = await fetch("/neighborhoodApi/verifyOTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      if (response.ok) {

        // Save the token and update state
        const token = data.token || `neighborhood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setNeighborhoodToken(token);

        console.log('✅ OTP verified successfully');
        console.log("Login successful:", data.message);

        // Reset modal state
        setStep('email');
        setEmail('');
        setOtp('');
        setError('');
        
        // Call success callback
        onSuccess();
        onClose();

      } else {
        setError(data.message || "Invalid OTP");
        console.log("Login failed:", data.message);
      }

      

    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setOtp('');
    setError('');
    onClose();
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setError('');
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      size="md"
      backdrop="blur"
      classNames={{
        base: "bg-transparent",
        backdrop: "bg-black/50 backdrop-blur-sm",
      }}
    >
      <ModalContent className={`${isDarkMode ? 'bg-gray-900/90 border border-gray-800 backdrop-blur-xl' : 'bg-white/90 border border-gray-200 backdrop-blur-xl'} shadow-2xl`}>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center ring-2 ring-orange-500/30">
              <span className="text-2xl">🏘️</span>
            </div>
            <div>
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Join HackClub Neighborhood
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {step === 'email' ? 'Enter your email to get started' : 'Enter the OTP sent to your email'}
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          {step === 'email' ? (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: `${isDarkMode ? 'text-white' : 'text-gray-900'}`,
                    inputWrapper: `${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600 focus-within:border-orange-500' 
                        : 'bg-white/50 border-gray-300 hover:border-gray-400 focus-within:border-orange-500'
                    }`
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleEmailSubmit();
                    }
                  }}
                />
              </div>

              <div className={`p-4 rounded-xl border ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-orange-900/10 to-red-900/10 border-orange-800/20' 
                  : 'bg-gradient-to-r from-orange-50/80 to-red-50/80 border-orange-200/40'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">ℹ️</span>
                  </div>
                  <div>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-orange-400/80' : 'text-orange-600/80'}`}>
                      We'll send you a verification code to confirm your email and join the HackClub Neighborhood event.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Verification Code
                </label>
                <Input
                  type="text"
                  placeholder="Enter 6-character code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6))}
                  variant="bordered"
                  size="lg"
                  maxLength={6}
                  classNames={{
                    input: `${isDarkMode ? 'text-white' : 'text-gray-900'} text-center text-xl font-mono tracking-widest`,
                    inputWrapper: `${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600 focus-within:border-orange-500' 
                        : 'bg-white/50 border-gray-300 hover:border-gray-400 focus-within:border-orange-500'
                    }`
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleOtpSubmit();
                    }
                  }}
                />
              </div>

              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50/50'
              }`}>
                <p className={`text-xs text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Code sent to: <span className="font-medium">{email}</span>
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={handleBackToEmail}
                  className={`text-sm transition-colors ${
                    isDarkMode 
                      ? 'text-orange-400 hover:text-orange-300' 
                      : 'text-orange-600 hover:text-orange-700'
                  }`}
                >
                  Use a different email address
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className={`p-3 rounded-lg border-l-4 ${
              isDarkMode 
                ? 'bg-red-900/20 border-red-500 text-red-300' 
                : 'bg-red-50 border-red-400 text-red-700'
            }`}>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            variant="light"
            onPress={handleClose}
            disabled={isLoading}
            className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Cancel
          </Button>
          <Button
            onPress={step === 'email' ? handleEmailSubmit : handleOtpSubmit}
            isLoading={isLoading}
            disabled={
              isLoading || 
              (step === 'email' && (!email || !email.includes('@'))) ||
              (step === 'otp' && (!otp || otp.length < 6))
            }
            className="font-medium shadow-lg"
            style={{ 
              backgroundColor: accentColor,
              color: 'white'
            }}
          >
            {isLoading 
              ? (step === 'email' ? 'Sending...' : 'Verifying...')
              : (step === 'email' ? 'Send Code' : 'Verify & Join')
            }
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
