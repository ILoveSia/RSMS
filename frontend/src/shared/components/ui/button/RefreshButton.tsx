import React from 'react';
import Button from './Button';
import { Refresh as RefreshIcon } from '@mui/icons-material';

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
  return (
    <Button
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
        ...sx,
      }}
    >
      {label}
    </Button>
  );
};

export default RefreshButton;


