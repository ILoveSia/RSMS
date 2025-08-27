import React from 'react';
import Button from './Button';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material';

export interface RefreshButtonProps {
  onClick: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  height?: string;
  sx?: any;
  label?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  size = 'small',
  sx,
  label = '새로고침',
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Button
      variant="outlined"
      color="secondary"
      size={size}
      startIcon={<RefreshIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      sx={{
        height: '32px',
        minWidth: '80px',
        fontSize: '0.875rem',
        fontWeight: 600,
        px: 1.5,
        lineHeight: 1,
        borderRadius: 1,
        borderColor: isDark ? '#A78BFA' : '#8B5CF6', // 연한 보라색 테두리 (모던한 색상)
        color: isDark ? '#A78BFA' : '#8B5CF6',
        '&:hover': {
          borderColor: isDark ? '#C4B5FD' : '#7C3AED',
          color: isDark ? '#C4B5FD' : '#7C3AED',
          backgroundColor: isDark ? 'rgba(167, 139, 250, 0.1)' : 'rgba(139, 92, 246, 0.1)',
        },
        '&:active': {
          borderColor: isDark ? '#DDD6FE' : '#6D28D9',
          color: isDark ? '#DDD6FE' : '#6D28D9',
        },
        ...sx,
      }}
    >
      {label}
    </Button>
  );
};

export default RefreshButton;


