import type { TextFieldProps as MuiTextFieldProps, SxProps, Theme } from '@mui/material';
import { TextField as MuiTextField } from '@mui/material';
import React from 'react';

/**
 * 공통 TextField 컴포넌트
 * - MUI TextField를 래핑하여 label, error, helperText, required 등 주요 props를 지원
 * - mode prop을 통해 읽기전용과 수정용을 일관된 디자인으로 통일
 * - label이 있으면 shrink: true로 항상 위에 고정
 * - 나머지 props는 모두 그대로 전달
 */
export interface TextFieldProps extends Omit<MuiTextFieldProps, 'variant' | 'size' | 'sx'> {
  label: string;
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
  /** 읽기전용/수정용 모드 설정 */
  mode: 'readonly' | 'editable';
  /** 읽기전용일 때 표시할 placeholder 텍스트 */
  readonlyPlaceholder?: string;
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
  mode,
  readonlyPlaceholder = '데이터가 없습니다',
  ...props
}) => {
  // 읽기전용 모드일 때 MUI TextField를 disabled 상태로 사용
  if (mode === 'readonly') {
    return (
      <MuiTextField
        label={label}
        value={value || readonlyPlaceholder}
        error={error}
        helperText={helperText}
        required={required}
        disabled={true} // 읽기전용이므로 항상 disabled
        fullWidth={fullWidth}
        variant={variant}
        size={size}
        InputLabelProps={label ? { shrink: true } : undefined}
        // 읽기전용일 때는 onChange 제거
        onChange={undefined}
        // 읽기전용 스타일링
        sx={{
          '& .MuiInputBase-root': {
            backgroundColor: 'var(--bank-surface)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--bank-border)'
            },
            '&.Mui-disabled': {
              backgroundColor: 'var(--bank-bg-secondary) !important',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'var(--bank-border)'
              },
              '& .MuiInputBase-input': {
                color: value ? 'var(--bank-text-primary)' : 'var(--bank-text-secondary)',
                fontStyle: value ? 'normal' : 'italic',
                WebkitTextFillColor: value ? 'var(--bank-text-primary)' : 'var(--bank-text-secondary)',
              },
            },
          },
          '& .MuiInputLabel-root': {
            color: 'var(--bank-text-secondary)'
          },
          ...sx,
        }}
        {...props}
      />
    );
  }

  // 수정용 모드일 때 (기존 MUI TextField 사용)
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
        sx={{
          '& .MuiInputBase-root': {
            backgroundColor: 'var(--bank-surface)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--bank-border)'
            },
          },
          '& .MuiInputBase-input': {
            color: 'var(--bank-text-primary)'
          },
          '& .MuiInputLabel-root': {
            color: 'var(--bank-text-secondary)'
          },
          ...sx,
        }}
      {...props}
    />
  );
};

export default TextField;
