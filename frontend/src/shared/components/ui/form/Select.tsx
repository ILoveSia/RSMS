/**
 * 공통 Select 컴포넌트
 * Material-UI Select를 래핑하여 프로젝트 표준 스타일과 기능을 제공합니다.
 *
 * @example
 * ```tsx
 * <Select
 *   label="카테고리"
 *   value={selectedValue}
 *   options={options}
 *   onChange={(value) => setSelectedValue(value)}
 *   placeholder="선택해주세요"
 * />
 * ```
 */
import type { FormComponentProps, SelectOption, Size } from '@/shared/types/common';
import {
  Box,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select as MuiSelect,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import React from 'react';

export interface SelectProps extends FormComponentProps {
  // 데이터 관련
  value?: string | number | string[] | number[];
  options: SelectOption[];

  // 설정
  multiple?: boolean;
  placeholder?: string;
  size?: Size;

  // 이벤트 핸들러
  onChange?: (
    value: string | number | string[] | number[],
    option?: SelectOption | SelectOption[]
  ) => void;
  onOpen?: () => void;
  onClose?: () => void;

  // 스타일 관련
  variant?: 'outlined' | 'filled' | 'standard';

  // 고급 기능
  groupBy?: string;
  clearable?: boolean;
  searchable?: boolean;

  // 렌더링 커스터마이징
  renderValue?: (selected: string | number | string[] | number[]) => React.ReactNode;
  renderOption?: (option: SelectOption, index: number) => React.ReactNode;

  // 추가 설정
  autoWidth?: boolean;
  displayEmpty?: boolean;
  native?: boolean;
}

/**
 * 공통 Select 컴포넌트
 */
const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      value,
      options = [],
      multiple = false,
      placeholder,
      size = 'medium',
      label,
      error = false,
      helperText,
      required = false,
      disabled = false,
      fullWidth = true,
      variant = 'outlined',
      groupBy,
      clearable = false,
      searchable = false,
      renderValue,
      renderOption,
      autoWidth = false,
      displayEmpty = false,
      native = false,
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
    // 그룹핑된 옵션 처리
    const groupedOptions = React.useMemo(() => {
      if (!groupBy) return { '': options };

      return options.reduce((groups, option) => {
        const group = (option as any)[groupBy] || '';
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(option);
        return groups;
      }, {} as Record<string, SelectOption[]>);
    }, [options, groupBy]);

    // 선택된 값에 대한 옵션 찾기
    const getSelectedOptions = React.useCallback(() => {
      if (!value) return [];

      const values = Array.isArray(value) ? value : [value];
      return options.filter(option => values.includes(option.value));
    }, [value, options]);

    // 값 변경 핸들러
    const handleChange = (event: SelectChangeEvent<string | number | string[] | number[]>) => {
      const newValue = event.target.value;

      if (multiple) {
        const selectedOptions = options.filter(option =>
          (newValue as (string | number)[]).includes(option.value)
        );
        onChange?.(newValue as string[] | number[], selectedOptions);
      } else {
        const selectedOption = options.find(option => option.value === newValue);
        onChange?.(newValue as string | number, selectedOption);
      }
    };

    // Multiple 모드에서의 렌더링
    const defaultRenderValue = (selected: string | number | string[] | number[]) => {
      if (!multiple) {
        const option = options.find(opt => opt.value === selected);
        return option ? option.label : '';
      }

      const selectedValues = Array.isArray(selected) ? selected : [];
      if (selectedValues.length === 0) return placeholder || '';

      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selectedValues.map(val => {
            const option = options.find(opt => opt.value === val);
            return option ? <Chip key={val} label={option.label} size='small' /> : null;
          })}
        </Box>
      );
    };

    // 옵션 렌더링
    const renderMenuItems = () => {
      if (Object.keys(groupedOptions).length === 1 && groupedOptions['']) {
        // 그룹이 없는 경우
        return groupedOptions[''].map((option, index) => (
          <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
            {renderOption ? renderOption(option, index) : option.label}
          </MenuItem>
        ));
      }

      // 그룹이 있는 경우
      return Object.entries(groupedOptions)
        .map(([group, groupOptions]) => [
          group && <ListSubheader key={`group-${group}`}>{group}</ListSubheader>,
          ...groupOptions.map((option, index) => (
            <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
              {renderOption ? renderOption(option, index) : option.label}
            </MenuItem>
          )),
        ])
        .flat()
        .filter(Boolean);
    };

    return (
      <FormControl
        ref={ref}
        fullWidth={fullWidth}
        error={error}
        disabled={disabled}
        required={required}
        size={size}
        variant={variant}
        className={className}
        style={style}
        sx={sx}
        {...props}
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
          value={value || (multiple ? [] : '')}
          label={label}
          multiple={multiple}
          displayEmpty={displayEmpty || !!placeholder}
          autoWidth={autoWidth}
          native={native}
          renderValue={renderValue || defaultRenderValue}
          onChange={handleChange}
          onOpen={onOpen}
          onClose={onClose}
          data-testid={dataTestId}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 300,
              },
            },
          }}
        >
          {placeholder && displayEmpty && (
            <MenuItem value='' disabled>
              <em>{placeholder}</em>
            </MenuItem>
          )}
          {renderMenuItems()}
        </MuiSelect>

        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }
);

Select.displayName = 'Select';

export default Select;
