import React from 'react';
import Button from '@/shared/components/ui/button/Button';
import { Save as SaveIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material';

export interface SaveButtonProps {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  label?: string;
  sx?: any;
}

const SaveButton: React.FC<SaveButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  size = 'small',
  label = '저장',
  sx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Button
      variant="contained"
      color="success"
      size={size}
      startIcon={<SaveIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      sx={{
        height: '32px',
        minWidth: '80px',
        fontSize: '0.875rem',
        fontWeight: 600,
        borderRadius: 1,
        backgroundColor: isDark ? '#34D399' : '#10B981', // 연한 초록색 (모던한 색상)
        '&:hover': {
          backgroundColor: isDark ? '#6EE7B7' : '#059669',
        },
        '&:active': {
          backgroundColor: isDark ? '#A7F3D0' : '#047857',
        },
        ...sx,
      }}
    >
      {label}
    </Button>
  );
};

export default SaveButton;


