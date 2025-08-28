import React from 'react';
import { Box } from '@mui/material';
import TextField from '@/shared/components/ui/data-display/TextField';
import { Button } from '@/shared/components/ui/button'; // Modified import

export interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  label?: string;
  placeholder?: string;
  minRows?: number;
  size?: 'small' | 'medium';
  registerLabel?: string;
  cancelLabel?: string;
}

const CommentInput: React.FC<CommentInputProps> = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  loading = false,
  label = '댓글',
  placeholder = '댓글을 입력하세요',
  minRows = 3,
  size = 'small',
  registerLabel = '등록',
  cancelLabel = '취소',
}) => {
  const disabled = !value.trim() || loading;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <TextField
        multiline
        minRows={minRows}
        size={size}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        mode="editable"
        fullWidth
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          preset="register" // Modified
          size={size}
          onClick={onSubmit}
          disabled={disabled}
          loading={loading}
        />
        {onCancel && (
          <Button preset="cancel" size={size} onClick={onCancel} disabled={loading} />
        )}
      </Box>
    </Box>
  );
};

export default CommentInput;
