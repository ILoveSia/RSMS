/**
 * RadioGroup 컴포넌트
 * 
 * Material-UI RadioGroup을 기반으로 한 라디오 버튼 그룹 컴포넌트
 * 여러 옵션 중 하나를 선택할 수 있는 기능 제공
 */
import React from 'react';
import {
  RadioGroup as MuiRadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
} from '@mui/material';
import type { BaseComponentProps } from '@/shared/types/common';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps extends BaseComponentProps {
  // 필수 props
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];

  // 선택적 props
  label?: string;
  name?: string;
  row?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  
  // 스타일링
  size?: 'small' | 'medium';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onChange,
  options,
  label,
  name,
  row = false,
  disabled = false,
  required = false,
  error = false,
  helperText,
  size = 'medium',
  color = 'primary',
  className,
  sx,
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl
      error={error}
      disabled={disabled}
      required={required}
      className={className}
      sx={sx}
      {...props}
    >
      {label && (
        <FormLabel component="legend" sx={{ mb: 1 }}>
          {label}
          {required && ' *'}
        </FormLabel>
      )}
      
      <MuiRadioGroup
        name={name}
        value={value}
        onChange={handleChange}
        row={row}
        sx={{
          gap: row ? 2 : 0.5,
        }}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            disabled={disabled || option.disabled}
            control={
              <Radio
                size={size}
                color={color}
                sx={{
                  '&.Mui-checked': {
                    color: error ? 'error.main' : undefined,
                  },
                }}
              />
            }
            label={option.label}
            sx={{
              '& .MuiFormControlLabel-label': {
                fontSize: size === 'small' ? '0.875rem' : '1rem',
                color: disabled || option.disabled ? 'text.disabled' : 'text.primary',
              },
            }}
          />
        ))}
      </MuiRadioGroup>
      
      {helperText && (
        <FormHelperText sx={{ mt: 0.5 }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default RadioGroup;