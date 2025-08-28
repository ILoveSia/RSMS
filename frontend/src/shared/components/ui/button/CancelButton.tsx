import React from 'react';
import Button from '@/shared/components/ui/button/Button';
import { Cancel as CancelIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material';

export interface CancelButtonProps {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  label?: string;
  sx?: any;
}

const CancelButton: React.FC<CancelButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  size = 'small',
  label = '취소',
  sx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Button
      variant="outlined"
      color="secondary"
      size={size}
      startIcon={<CancelIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      sx={{
        height: '32px',
        minWidth: '80px',
        fontSize: '0.875rem',
        fontWeight: 600,
        borderRadius: 1,
        borderColor: isDark ? '#9CA3AF' : '#6B7280', // 연한 회색 테두리 (모던한 색상)
        color: isDark ? '#9CA3AF' : '#6B7280',
        '&:hover': {
          borderColor: isDark ? '#D1D5DB' : '#4B5563',
          color: isDark ? '#D1D5DB' : '#4B5563',
          backgroundColor: isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(107, 114, 128, 0.1)',
        },
        '&:active': {
          borderColor: isDark ? '#F3F4F6' : '#374151',
          color: isDark ? '#F3F4F6' : '#374151',
        },
        ...sx,
      }}
    >
      {label}
    </Button>
  );
};

export default CancelButton;


