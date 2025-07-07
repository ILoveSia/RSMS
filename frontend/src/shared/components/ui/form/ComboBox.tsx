/**
 * 공통 ComboBox 컴포넌트
 * Material-UI Autocomplete를 래핑하여 검색 가능한 선택 컴포넌트를 제공합니다.
 *
 * @example
 * ```tsx
 * <ComboBox
 *   label="사용자 선택"
 *   options={userOptions}
 *   value={selectedUser}
 *   onChange={(value) => setSelectedUser(value)}
 *   placeholder="사용자를 검색하세요"
 *   freeSolo
 * />
 * ```
 */
import type { FormComponentProps, SelectOption, Size } from '@/shared/types/common';
import { Autocomplete, Box, Chip, CircularProgress, TextField } from '@mui/material';
import type { AutocompleteProps } from '@mui/material/Autocomplete';
import React from 'react';

export interface ComboBoxProps extends FormComponentProps {
  // 데이터 관련
  value?: SelectOption | SelectOption[] | string | string[] | null;
  options: SelectOption[];

  // 설정
  multiple?: boolean;
  freeSolo?: boolean;
  placeholder?: string;
  size?: Size;

  // 로딩 상태
  loading?: boolean;

  // 이벤트 핸들러
  onChange?: (value: SelectOption | SelectOption[] | string | string[] | null) => void;
  onInputChange?: (inputValue: string) => void;
  onOpen?: () => void;
  onClose?: () => void;

  // 스타일 관련
  variant?: 'outlined' | 'filled' | 'standard';

  // 필터링 및 검색
  filterOptions?: (options: SelectOption[], params: any) => SelectOption[];
  noOptionsText?: string;
  loadingText?: string;

  // 렌더링 커스터마이징
  renderOption?: (props: any, option: SelectOption, state: any) => React.ReactNode;
  renderTags?: (value: SelectOption[], getTagProps: any) => React.ReactNode;
  renderInput?: (params: any) => React.ReactNode;

  // 추가 설정
  autoComplete?: boolean;
  autoHighlight?: boolean;
  autoSelect?: boolean;
  clearOnEscape?: boolean;
  clearOnBlur?: boolean;
  disableClearable?: boolean;
  disableCloseOnSelect?: boolean;
  includeInputInList?: boolean;
  limitTags?: number;
  openOnFocus?: boolean;
  selectOnFocus?: boolean;
}

/**
 * 공통 ComboBox 컴포넌트
 */
const ComboBox = React.forwardRef<HTMLDivElement, ComboBoxProps>(
  (
    {
      value,
      options = [],
      multiple = false,
      freeSolo = false,
      placeholder,
      size = 'medium',
      loading = false,
      label,
      error = false,
      helperText,
      required = false,
      disabled = false,
      fullWidth = true,
      variant = 'outlined',
      filterOptions,
      noOptionsText = '옵션이 없습니다',
      loadingText = '로딩 중...',
      renderOption,
      renderTags,
      renderInput,
      autoComplete = true,
      autoHighlight = false,
      autoSelect = false,
      clearOnEscape = true,
      clearOnBlur = false,
      disableClearable = false,
      disableCloseOnSelect,
      includeInputInList = false,
      limitTags = -1,
      openOnFocus = false,
      selectOnFocus = false,
      onChange,
      onInputChange,
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
    // 값 변환 헬퍼 함수
    const getOptionValue = (option: SelectOption | string): SelectOption | string => {
      if (typeof option === 'string') {
        return freeSolo ? option : options.find(opt => opt.value === option) || option;
      }
      return option;
    };

    // 현재 값을 Autocomplete 형식으로 변환
    const getCurrentValue = () => {
      if (!value) return multiple ? [] : null;

      if (multiple) {
        const values = Array.isArray(value) ? value : [value];
        return values.map(getOptionValue);
      }

      return getOptionValue(value as SelectOption | string);
    };

    // 옵션 레이블 가져오기
    const getOptionLabel = (option: SelectOption | string): string => {
      if (typeof option === 'string') {
        if (freeSolo) return option;
        const foundOption = options.find(opt => opt.value === option);
        return foundOption ? foundOption.label : option;
      }
      return option.label || String(option.value);
    };

    // 옵션 비교 함수
    const isOptionEqualToValue = (
      option: SelectOption | string,
      value: SelectOption | string
    ): boolean => {
      if (typeof option === 'string' && typeof value === 'string') {
        return option === value;
      }
      if (typeof option === 'object' && typeof value === 'object') {
        return option.value === value.value;
      }
      if (typeof option === 'string' && typeof value === 'object') {
        return option === String(value.value);
      }
      if (typeof option === 'object' && typeof value === 'string') {
        return String(option.value) === value;
      }
      return false;
    };

    // 값 변경 핸들러
    const handleChange = (
      event: React.SyntheticEvent,
      newValue: SelectOption | SelectOption[] | string | string[] | null
    ) => {
      onChange?.(newValue);
    };

    // 입력 값 변경 핸들러
    const handleInputChange = (event: React.SyntheticEvent, value: string, reason: string) => {
      if (reason === 'input') {
        onInputChange?.(value);
      }
    };

    // 기본 태그 렌더링
    const defaultRenderTags = (value: (SelectOption | string)[], getTagProps: any) => {
      return value.map((option, index) => (
        <Chip
          variant='outlined'
          label={getOptionLabel(option)}
          size={size === 'small' ? 'small' : 'medium'}
          {...getTagProps({ index })}
          key={typeof option === 'string' ? option : option.value}
        />
      ));
    };

    // 기본 입력 렌더링
    const defaultRenderInput = (params: any) => (
      <TextField
        {...params}
        label={label}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        required={required}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        InputProps={{
          ...params.InputProps,
          endAdornment: (
            <>
              {loading ? <CircularProgress color='inherit' size={20} /> : null}
              {params.InputProps.endAdornment}
            </>
          ),
        }}
      />
    );

    // Autocomplete props
    const autocompleteProps: Partial<
      AutocompleteProps<SelectOption | string, boolean, boolean, boolean>
    > = {
      multiple,
      freeSolo,
      loading,
      disabled,
      autoComplete,
      autoHighlight,
      autoSelect,
      clearOnEscape,
      clearOnBlur,
      disableClearable,
      disableCloseOnSelect: disableCloseOnSelect ?? (multiple ? true : false),
      includeInputInList,
      limitTags,
      openOnFocus,
      selectOnFocus,
      noOptionsText,
      loadingText,
      filterOptions,
    };

    return (
      <Box
        ref={ref}
        className={className}
        style={style}
        sx={sx}
        data-testid={dataTestId}
        {...props}
      >
        <Autocomplete
          {...autocompleteProps}
          options={options}
          value={getCurrentValue()}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          renderOption={renderOption}
          renderTags={renderTags || defaultRenderTags}
          renderInput={renderInput || defaultRenderInput}
          onChange={handleChange}
          onInputChange={handleInputChange}
          onOpen={onOpen}
          onClose={onClose}
          id={id}
        />
      </Box>
    );
  }
);

ComboBox.displayName = 'ComboBox';

export default ComboBox;
