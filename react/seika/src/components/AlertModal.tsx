import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { useAccentColorManager } from "@/contexts/AccentColorContext";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiXCircle, 
  FiInfo,
  FiZap,
  FiStar
} from "react-icons/fi";
import { RiSparklingFill } from "react-icons/ri";

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'fun' | 'celebration';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
}

const alertConfig = {
  success: {
    icon: FiCheckCircle,
    iconColor: 'text-green-500',
    lightBg: 'from-green-50/90 via-emerald-50/60 to-green-25/30',
    darkBg: 'from-green-900/40 via-emerald-900/20 to-green-800/10',
    primaryColor: 'success',
    animation: 'animate-bounce-gentle',
    emoji: '✨',
    particles: ['💚', '✅', '🌟']
  },
  error: {
    icon: FiXCircle,
    iconColor: 'text-red-500',
    lightBg: 'from-red-50/90 via-rose-50/60 to-red-25/30',
    darkBg: 'from-red-900/40 via-rose-900/20 to-red-800/10',
    primaryColor: 'danger',
    animation: 'animate-shake',
    emoji: '⚠️',
    particles: ['❌', '💥', '🚨']
  },
  warning: {
    icon: FiAlertTriangle,
    iconColor: 'text-amber-500',
    lightBg: 'from-amber-50/90 via-yellow-50/60 to-orange-25/30',
    darkBg: 'from-amber-900/40 via-yellow-900/20 to-orange-800/10',
    primaryColor: 'warning',
    animation: 'animate-pulse-gentle',
    emoji: '⚠️',
    particles: ['⚡', '🔔', '⚠️']
  },
  info: {
    icon: FiInfo,
    iconColor: 'text-blue-500',
    lightBg: 'from-blue-50/90 via-cyan-50/60 to-blue-25/30',
    darkBg: 'from-blue-900/40 via-cyan-900/20 to-blue-800/10',
    primaryColor: 'primary',
    animation: 'animate-float',
    emoji: 'ℹ️',
    particles: ['💎', '🔮', '💫']
  },
  fun: {
    icon: FiZap,
    iconColor: 'text-purple-500',
    lightBg: 'from-purple-50/90 via-pink-50/60 to-purple-25/30',
    darkBg: 'from-purple-900/40 via-pink-900/20 to-purple-800/10',
    primaryColor: 'secondary',
    animation: 'animate-wiggle',
    emoji: '🎉',
    particles: ['🎮', '🚀', '⚡']
  },
  celebration: {
    icon: FiStar,
    iconColor: 'text-yellow-500',
    lightBg: 'from-yellow-50/90 via-orange-50/60 to-yellow-25/30',
    darkBg: 'from-yellow-900/40 via-orange-900/20 to-yellow-800/10',
    primaryColor: 'warning',
    animation: 'animate-sparkle',
    emoji: '🎊',
    particles: ['🎉', '🌟', '✨']
  }
};

export default function AlertModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  showCancel = false,
  size = "md"
}: AlertModalProps) {
  const { colorVariations } = useAccentColorManager();
  const { isDarkMode } = useDarkMode();
  const config = alertConfig[type];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        size={size}
        classNames={{
          backdrop: "bg-black/60 backdrop-blur-md",
          wrapper: "items-center justify-center",
          base: "relative overflow-hidden",
          header: "flex flex-col gap-1",
          body: "py-6",
          footer: "flex gap-2 justify-end"
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
              scale: 0.9,
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
          className={`relative overflow-hidden border-2 shadow-2xl ${
            isDarkMode ? 'bg-black' : 'bg-white'
          }`}
          style={{
            borderColor: isDarkMode 
              ? `${colorVariations[600]}99` // 60% opacity
              : `${colorVariations[300]}B3`  // 70% opacity
          }}
        >
          {(onClose) => (
            <>
              
              {/* Magic sparkle overlay for celebration type */}
              {type === 'celebration' && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <RiSparklingFill
                      key={i}
                      className="absolute text-yellow-400 animate-pulse"
                      size={Math.random() * 10 + 8}
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animation: `sparkle-float ${2 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`,
                        opacity: Math.random() * 0.8 + 0.2
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Fun Floating Particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {config.particles.map((particle, i) => (
                  <div
                    key={i}
                    className="absolute text-lg opacity-30 animate-bounce"
                    style={{
                      left: `${15 + (i * 15)}%`,
                      top: `${20 + (i % 4) * 15}%`,
                      animation: `particle-float ${4 + (i * 0.8)}s ease-in-out infinite ${i * 0.3}s`,
                      fontSize: `${12 + Math.random() * 8}px`
                    }}
                  >
                    {particle}
                  </div>
                ))}
              </div>

              {/* Glass morphism overlay */}
              <div className={`absolute inset-0 ${
                isDarkMode ? 'bg-black' : 'bg-white'
              }`} />

              <ModalHeader className="relative z-10 flex items-center gap-4 px-8 pt-8 pb-2">
                <div className={`relative p-4 rounded-2xl ${
                  isDarkMode 
                    ? 'bg-gray-800 border border-gray-600' 
                    : 'bg-gray-100 border border-gray-300'
                } shadow-lg ${config.animation}`}>
                  <IconComponent 
                    size={36} 
                    className={`${config.iconColor} drop-shadow-lg`}
                  />
                  
                  {/* Fun emoji overlay */}
                  <div className="absolute -top-2 -right-2 text-xl animate-bounce">
                    {config.emoji}
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <h1 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-black'
                  } drop-shadow-sm`}>
                    {title}
                  </h1>
                  
                  {/* Fun subtitle based on type */}
                  {type === 'celebration' && (
                    <p className={`text-sm ${
                      isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                    } font-medium animate-pulse`}>
                      🎉 Awesome! 🎉
                    </p>
                  )}
                  {type === 'fun' && (
                    <p className={`text-sm ${
                      isDarkMode ? 'text-purple-300' : 'text-purple-700'
                    } font-medium`}>
                      ✨ Something exciting! ✨
                    </p>
                  )}
                </div>
              </ModalHeader>

              <ModalBody className="relative z-10 px-8">
                <p className={`text-lg leading-relaxed font-medium ${
                  isDarkMode ? 'text-white' : 'text-black'
                }`}>
                  {message}
                </p>
                
                {/* Fun progress bar for certain types */}
                {(type === 'success' || type === 'celebration') && (
                  <div className={`mt-4 w-full h-2 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
                  } rounded-full overflow-hidden`}>
                    <div 
                      className={`h-full ${config.iconColor.replace('text-', 'bg-')} rounded-full animate-pulse`}
                      style={{
                        width: '100%',
                        animation: 'progress-fill 1.5s ease-out'
                      }}
                    />
                  </div>
                )}
              </ModalBody>

              <ModalFooter className="relative z-10 px-8 pb-8">
                {/* For warnings, prioritize cancel button */}
                {type === 'warning' && showCancel ? (
                  <>
                    <Button 
                      variant="ghost" 
                      onPress={handleConfirm}
                      className={`${
                        isDarkMode 
                          ? 'text-white hover:text-gray-300 hover:bg-gray-800' 
                          : 'text-black hover:text-gray-700 hover:bg-gray-100'
                      } transition-all duration-200`}
                    >
                      {confirmText}
                    </Button>
                    <Button 
                      variant="solid"
                      color="danger"
                      onPress={onClose}
                      className="font-semibold px-8 py-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${colorVariations[500]}, ${colorVariations[600]})`,
                        border: 'none'
                      }}
                    >
                      <span className="relative z-10">{cancelText}</span>
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                    </Button>
                  </>
                ) : (
                  <>
                    {showCancel && (
                      <Button 
                        variant="ghost" 
                        onPress={onClose}
                        className={`${
                          isDarkMode 
                            ? 'text-white hover:text-gray-300 hover:bg-gray-800' 
                            : 'text-black hover:text-gray-700 hover:bg-gray-100'
                        } transition-all duration-200`}
                      >
                        {cancelText}
                      </Button>
                    )}
                    <Button 
                      variant="solid"
                      color={config.primaryColor as any}
                      onPress={handleConfirm}
                      className={`font-semibold px-8 py-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 ${
                        type === 'celebration' ? 'animate-pulse' : ''
                      } relative overflow-hidden`}
                      style={{
                        background: `linear-gradient(135deg, ${colorVariations[500]}, ${colorVariations[600]})`,
                        border: 'none'
                      }}
                    >
                      <span className="relative z-10">{confirmText}</span>
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                    </Button>
                  </>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        
        @keyframes pulse-gentle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-6px) rotate(2deg); }
          50% { transform: translateY(-12px) rotate(0deg); }
          75% { transform: translateY(-6px) rotate(-2deg); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-5deg) scale(1.05); }
          75% { transform: rotate(5deg) scale(1.05); }
        }
        
        @keyframes sparkle {
          0%, 100% { 
            transform: scale(1) rotate(0deg); 
            filter: brightness(1) hue-rotate(0deg);
          }
          25% { 
            transform: scale(1.2) rotate(90deg); 
            filter: brightness(1.3) hue-rotate(45deg);
          }
          50% { 
            transform: scale(1.1) rotate(180deg); 
            filter: brightness(1.5) hue-rotate(90deg);
          }
          75% { 
            transform: scale(1.3) rotate(270deg); 
            filter: brightness(1.2) hue-rotate(135deg);
          }
        }
        
        @keyframes particle-float {
          0%, 100% { 
            transform: translateY(0) translateX(0) rotate(0deg); 
            opacity: 0.3;
          }
          25% { 
            transform: translateY(-20px) translateX(10px) rotate(90deg); 
            opacity: 0.6;
          }
          50% { 
            transform: translateY(-15px) translateX(-5px) rotate(180deg); 
            opacity: 0.4;
          }
          75% { 
            transform: translateY(-25px) translateX(15px) rotate(270deg); 
            opacity: 0.7;
          }
        }
        
        @keyframes sparkle-float {
          0%, 100% { 
            transform: translateY(0) scale(0.8) rotate(0deg); 
            opacity: 0.4;
          }
          50% { 
            transform: translateY(-30px) scale(1.2) rotate(180deg); 
            opacity: 0.8;
          }
        }
        
        @keyframes progress-fill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s infinite;
        }
        
        .animate-shake {
          animation: shake 0.6s ease-in-out;
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 2s infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
}
