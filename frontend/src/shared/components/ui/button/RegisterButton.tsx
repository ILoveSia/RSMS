import React from 'react';
import Button from '@/shared/components/ui/button/Button';
import { Add as AddIcon } from '@mui/icons-material';

export interface RegisterButtonProps {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  label?: string;
  sx?: any;
}

const RegisterButton: React.FC<RegisterButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  size = 'small',
  label = '등록',
  sx,
}) => {
  return (
    <Button
      variant="contained"
      color="success"
      size={size}
      startIcon={<AddIcon />}
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

export default RegisterButton;


