import React from 'react';
import Button from '@/shared/components/ui/button/Button';
import { Cancel as CancelIcon } from '@mui/icons-material';

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
        ...sx,
      }}
    >
      {label}
    </Button>
  );
};

export default CancelButton;


