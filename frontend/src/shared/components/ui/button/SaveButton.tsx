import React from 'react';
import Button from '@/shared/components/ui/button/Button';
import { Save as SaveIcon } from '@mui/icons-material';

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
        ...sx,
      }}
    >
      {label}
    </Button>
  );
};

export default SaveButton;


