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
import { Autocomplete, Box, Chip, CircularProgress } from '@mui/material';
import TextField from '@/shared/components/ui/data-display/TextField';
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
 * 옵션 값 반환
 */
const getOptionValue = (option: SelectOption | string): SelectOption | string => {
  if (typeof option === 'string') return option;
  return option.value !== undefined ? option.value : option;
};

/**
 * 현재 값 반환
 */
const getCurrentValue = (value: ComboBoxProps['value'], multiple: boolean) => {
  if (value === null || value === undefined) return multiple ? [] : null;
  return value;
};

/**
 * 옵션 라벨 반환
 */
const getOptionLabel = (option: SelectOption | string): string => {
  if (typeof option === 'string') return option;
  return option.label || String(option.value);
};

/**
 * 옵션 동등성 비교
 */
const isOptionEqualToValue = (
  option: SelectOption | string,
  value: SelectOption | string
): boolean => {
  const optionValue = getOptionValue(option);
  const valueToCompare = getOptionValue(value);
  
  if (typeof optionValue === 'object' && typeof valueToCompare === 'object') {
    return optionValue.value === valueToCompare.value;
  }
  
  return optionValue === valueToCompare;
};

/**
 * 기본 태그 렌더링
 */
const defaultRenderTags = (value: (SelectOption | string)[], getTagProps: any) => {
  return value.map((option, index) => {
    const label = getOptionLabel(option);
    return (
      <Chip
        key={index}
        label={label}
        size="small"
        {...getTagProps({ index })}
      />
    );
  });
};

/**
 * 기본 입력 렌더링
 */
const defaultRenderInput = (params: any, props: ComboBoxProps) => {
  return (
    <TextField
      {...params}
      label={props.label}
      error={props.error}
      helperText={props.helperText}
      required={props.required}
      disabled={props.disabled}
      fullWidth={props.fullWidth}
      variant={props.variant}
      size={props.size}
      placeholder={props.placeholder}
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <>
            {props.loading ? <CircularProgress color="inherit" size={20} /> : null}
            {params.InputProps.endAdornment}
          </>
        ),
      }}
    />
  );
};

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
      disableCloseOnSelect = false,
      includeInputInList = false,
      limitTags,
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
    /**
     * 변경 핸들러
     */
    const handleChange = (
      event: React.SyntheticEvent,
      newValue: SelectOption | SelectOption[] | string | string[] | null
    ) => {
      onChange?.(newValue);
    };

    /**
     * 입력 변경 핸들러
     */
    const handleInputChange = (event: React.SyntheticEvent, value: string, reason: string) => {
      onInputChange?.(value);
    };

    const currentValue = getCurrentValue(value, multiple);

    return (
      <Autocomplete
        ref={ref}
        value={currentValue}
        options={options}
        multiple={multiple}
        freeSolo={freeSolo}
        loading={loading}
        disabled={disabled}
        fullWidth={fullWidth}
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        filterOptions={filterOptions}
        noOptionsText={noOptionsText}
        loadingText={loadingText}
        renderOption={renderOption}
        renderTags={renderTags || defaultRenderTags}
        renderInput={renderInput || ((params) => defaultRenderInput(params, { label, error, helperText, required, disabled, fullWidth, variant, size, placeholder, loading }))}
        onChange={handleChange}
        onInputChange={handleInputChange}
        onOpen={onOpen}
        onClose={onClose}
        autoComplete={autoComplete}
        autoHighlight={autoHighlight}
        autoSelect={autoSelect}
        clearOnEscape={clearOnEscape}
        clearOnBlur={clearOnBlur}
        disableClearable={disableClearable}
        disableCloseOnSelect={disableCloseOnSelect}
        includeInputInList={includeInputInList}
        limitTags={limitTags}
        openOnFocus={openOnFocus}
        selectOnFocus={selectOnFocus}
        className={className}
        style={style}
        id={id}
        data-testid={dataTestId}
        sx={sx}
        {...props}
      />
    );
  }
);

ComboBox.displayName = 'ComboBox';

export default ComboBox;
