import type { AlertColor } from '@mui/material/Alert';
import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import CustomSnackbar from '../components/notification/CustomSnackbar';

interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
  mode: 'success_load' | '';
}

interface NotificationContextType {
  showNotification: (message: string, severity?: AlertColor) => void;
  showSuccessLoad: () => void;
  hideNotification: () => void;
  notification: NotificationState;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
    mode: '',
  });

  const showNotification = useCallback((message: string, severity: AlertColor = 'info') => {
    setNotification({
      open: true,
      message,
      severity,
      mode: '',
    });
  }, []);

  const showSuccessLoad = useCallback(() => {
    setNotification({
      open: true,
      message: '',
      severity: 'success',
      mode: 'success_load',
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      open: false,
    }));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        showSuccessLoad,
        hideNotification,
        notification,
      }}
    >
      {children}
      <CustomSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        mode={notification.mode}
        onClose={hideNotification}
        autoHideDuration={1000}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
