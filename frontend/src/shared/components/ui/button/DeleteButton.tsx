import React from 'react';
import Button from './Button';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material';

export interface DeleteButtonProps {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  label?: string;
  sx?: any;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  size = 'small',
  label = '삭제',
  sx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Button
      variant="contained"
      color="error"
      size={size}
      startIcon={<DeleteIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      sx={{
        height: '32px',
        minWidth: '80px',
        fontSize: '0.875rem',
        fontWeight: 600,
        borderRadius: 1,
        backgroundColor: isDark ? '#F87171' : '#EF4444', // 연한 빨간색 (모던한 색상)
        '&:hover': {
          backgroundColor: isDark ? '#FCA5A5' : '#DC2626',
        },
        '&:active': {
          backgroundColor: isDark ? '#FEB2B2' : '#B91C1C',
        },
        ...sx,
      }}
    >
      {label}
    </Button>
  );
};

export default DeleteButton;


