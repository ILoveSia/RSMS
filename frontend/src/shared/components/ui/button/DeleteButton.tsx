import React from 'react';
import Button from '@/shared/components/ui/button/Button';
import { Delete as DeleteIcon } from '@mui/icons-material';

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
        ...sx,
      }}
    >
      {label}
    </Button>
  );
};

export default DeleteButton;


