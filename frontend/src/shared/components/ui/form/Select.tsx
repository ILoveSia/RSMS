import type { FormComponentProps, SelectOption } from '@/shared/types/common';
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select as MuiSelect
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import React from 'react';

const MENU_MAX_HEIGHT = 300;

export interface SelectProps extends FormComponentProps {
  // 데이터 관련
  value?: string | number | string[] | number[];
  options: SelectOption[];

  placeholder?: string;

  // 이벤트 핸들러
  onChange?: (
    value: string | number | string[] | number[],
    option?: SelectOption | SelectOption[]
  ) => void;
  onOpen?: () => void;
  onClose?: () => void;

  // 렌더링 커스터마이징
  renderValue?: (selected: string | number | string[] | number[]) => React.ReactNode;
}

/**
 * 공통 Select 컴포넌트
 */
const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      value,
      options = [],
      placeholder,
      label,
      error = false,
      helperText,
      required = false,
      disabled = false,
      fullWidth = true,
      renderValue,
      onChange,
      onOpen,
      onClose,
      className,
      style,
      id,
      'data-testid': dataTestId,
      sx,
      ...props
    },
    ref
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { displayEmpty, ...restProps } = props as any;

    // 값 변경 핸들러
    const handleChange = (event: SelectChangeEvent<string | number | string[] | number[]>) => {
      const newValue = event.target.value;
      const selectedOption = options.find(option => option.value === newValue);
      onChange?.(newValue as string | number, selectedOption);
    };

    return (
      <FormControl
        ref={ref}
        fullWidth={fullWidth}
        error={error}
        disabled={disabled}
        required={required}
        size='medium'
        variant='outlined'
        className={className}
        style={style}
        sx={sx}
        {...restProps}
      >
        {label && (
          <InputLabel id={`${id}-label`}>
            {label}
            {required && ' *'}
          </InputLabel>
        )}

        <MuiSelect
          labelId={label ? `${id}-label` : undefined}
          id={id}
          value={value || ''}
          label={label}
          displayEmpty={!!placeholder}
          renderValue={renderValue}
          onChange={handleChange}
          onOpen={onOpen}
          onClose={onClose}
          data-testid={dataTestId}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: MENU_MAX_HEIGHT,
              },
            },
          }}
        >
          {placeholder && (
            <MenuItem value='' disabled>
              <em>{placeholder}</em>
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </MenuItem>
          ))}
        </MuiSelect>

        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

Select.displayName = 'Select';

export default Select;
