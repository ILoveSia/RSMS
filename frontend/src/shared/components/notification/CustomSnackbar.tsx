import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';

interface CustomSnackbarProps {
  open: boolean;
  mode:'success_load'|"";
  message?: string;
  severity?: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({
  open,
  message="",
  mode,
  severity = 'success',
  onClose,
  autoHideDuration = 2000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      {mode === 'success_load' ? (
        <Alert onClose={onClose} severity={'success'} sx={{ width: '100%' }}>
          {'페이지 로드 성공'}
        </Alert>
      ) : (
        <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
          {message}
        </Alert>
      )}
    </Snackbar>
  );
};

export default CustomSnackbar;
