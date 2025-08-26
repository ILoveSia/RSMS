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
        backgroundColor: isDark ? '#DC2626' : '#B91C1C', // 다크모드 대응
        '&:hover': {
          backgroundColor: isDark ? '#B91C1C' : '#991B1B',
        },
        '&:active': {
          backgroundColor: isDark ? '#991B1B' : '#7F1D1D',
        },
        ...sx,
      }}
    >
      {label}
    </Button>
  );
};

export default DeleteButton;


