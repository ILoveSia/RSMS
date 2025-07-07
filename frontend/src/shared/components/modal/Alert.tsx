/**
 * 공통 Alert 컴포넌트
 * MUI Alert를 기반으로 한 재사용 가능한 알림 컴포넌트
 */
import React from 'react';
import { Alert as MuiAlert, AlertTitle, Snackbar } from '@mui/material';
import type { AlertColor } from '@mui/material';

export interface AlertProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  title?: string;
  autoHideDuration?: number;
  onClose: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  open,
  message,
  severity = 'info',
  title,
  autoHideDuration = 6000,
  onClose,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <MuiAlert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </MuiAlert>
    </Snackbar>
  );
};

export default Alert; 