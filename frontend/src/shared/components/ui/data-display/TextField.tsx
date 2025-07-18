import type { TextFieldProps as MuiTextFieldProps, SxProps, Theme } from '@mui/material';
import { TextField as MuiTextField } from '@mui/material';
import React from 'react';

/**
 * 공통 TextField 컴포넌트
 * - MUI TextField를 래핑하여 label, error, helperText, required 등 주요 props를 지원
 * - label이 있으면 shrink: true로 항상 위에 고정
 * - 나머지 props는 모두 그대로 전달
 */
export interface TextFieldProps extends Omit<MuiTextFieldProps, 'variant' | 'size' | 'sx'> {
  label?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  helperText?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
  sx?: SxProps<Theme>;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = false,
  variant = 'outlined',
  size = 'medium',
  sx,
  ...props
}) => {
  return (
    <MuiTextField
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      variant={variant}
      size={size}
      InputLabelProps={label ? { shrink: true } : undefined}
      sx={sx}
      {...props}
    />
  );
};

export default TextField;
