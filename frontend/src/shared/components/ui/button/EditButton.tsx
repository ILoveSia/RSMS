import React from 'react';
import Button from '@/shared/components/ui/button/Button';
import { Edit as EditIcon } from '@mui/icons-material';

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
        color: 'var(--bank-text-primary)',
        '& .MuiSvgIcon-root': { color: 'var(--bank-text-primary)' },
        ...sx,
      }}
    >
      {label}
    </Button>
  );
};

export default EditButton;


