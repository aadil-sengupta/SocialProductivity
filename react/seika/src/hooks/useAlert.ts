import { useState, useCallback } from 'react';
import { AlertType } from '@/components/AlertModal';

interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
  onConfirm?: () => void;
}

interface AlertState extends AlertOptions {
  isOpen: boolean;
}

export const useAlert = () => {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertState({
      ...options,
      isOpen: true,
      type: options.type || 'info',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Cancel',
      showCancel: options.showCancel || false,
      size: options.size || 'md'
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Convenience methods for different alert types
  const showSuccess = useCallback((title: string, message: string, options?: Partial<AlertOptions>) => {
    showAlert({ ...options, title, message, type: 'success' });
  }, [showAlert]);

  const showError = useCallback((title: string, message: string, options?: Partial<AlertOptions>) => {
    showAlert({ ...options, title, message, type: 'error' });
  }, [showAlert]);

  const showWarning = useCallback((title: string, message: string, options?: Partial<AlertOptions>) => {
    showAlert({ ...options, title, message, type: 'warning' });
  }, [showAlert]);

  const showInfo = useCallback((title: string, message: string, options?: Partial<AlertOptions>) => {
    showAlert({ ...options, title, message, type: 'info' });
  }, [showAlert]);

  const showFun = useCallback((title: string, message: string, options?: Partial<AlertOptions>) => {
    showAlert({ ...options, title, message, type: 'fun' });
  }, [showAlert]);

  const showCelebration = useCallback((title: string, message: string, options?: Partial<AlertOptions>) => {
    showAlert({ ...options, title, message, type: 'celebration' });
  }, [showAlert]);

  const showConfirm = useCallback((
    title: string, 
    message: string, 
    onConfirm: () => void,
    options?: Partial<AlertOptions>
  ) => {
    showAlert({ 
      ...options, 
      title, 
      message, 
      type: options?.type || 'warning',
      showCancel: true,
      onConfirm 
    });
  }, [showAlert]);

  return {
    alertState,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showFun,
    showCelebration,
    showConfirm
  };
};
