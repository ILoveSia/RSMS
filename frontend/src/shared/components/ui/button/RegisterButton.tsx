import React from 'react';
import Button from '@/shared/components/ui/button/Button';
import { Add as AddIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material';

export interface RegisterButtonProps {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  label?: string;
  sx?: any;
}

const RegisterButton: React.FC<RegisterButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  size = 'small',
  label = '등록',
  sx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Button
      variant="contained"
      color="primary"
      size={size}
      startIcon={<AddIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      sx={{
        height: '32px',
        minWidth: '80px',
        fontSize: '0.875rem',
        fontWeight: 600,
        borderRadius: 1,
        backgroundColor: isDark ? '#60A5FA' : '#3B82F6', // 연한 파란색 (모던한 색상)
        '&:hover': {
          backgroundColor: isDark ? '#7CC3FC' : '#2563EB',
        },
        '&:active': {
          backgroundColor: isDark ? '#93C5FD' : '#1D4ED8',
        },
        ...sx,
      }}
    >
      {label}
    </Button>
  );
};

export default RegisterButton;


