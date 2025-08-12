import React from 'react';
import MuiButton from '@/shared/components/ui/button/Button';
import { Refresh as RefreshIcon } from '@mui/icons-material';

export interface RefreshButtonProps {
  onClick: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  height?: string;
  label?: string;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  size = 'small',
  height = '32px',
  label = '새로고침',
}) => {
  return (
    <MuiButton
      variant="outlined"
      size={size}
      startIcon={<RefreshIcon />}
      onClick={onClick}
      disabled={disabled || loading}
      loading={loading}
      sx={{ height }}
    >
      {label}
    </MuiButton>
  );
};

export default RefreshButton;


