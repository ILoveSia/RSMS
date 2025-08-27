import React from 'react';
import Button from '@/shared/components/ui/button/Button';
import { Edit as EditIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material';

export interface EditButtonProps {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  label?: string;
  sx?: any;
}

const EditButton: React.FC<EditButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  size = 'small',
  label = '수정',
  sx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  return (
    <Button
      variant="contained"
      color="warning"
      size={size}
      startIcon={<EditIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      sx={{
        height: '32px',
        minWidth: '80px',
        fontSize: '0.875rem',
        fontWeight: 600,
        borderRadius: 1,
        backgroundColor: isDark ? '#FBBF24' : '#F59E0B', // 연한 주황색 (모던한 색상)
        '&:hover': {
          backgroundColor: isDark ? '#FCD34D' : '#D97706',
        },
        '&:active': {
          backgroundColor: isDark ? '#FDE68A' : '#B45309',
        },
        ...sx,
      }}
    >
      {label}
    </Button>
  );
};

export default EditButton;


