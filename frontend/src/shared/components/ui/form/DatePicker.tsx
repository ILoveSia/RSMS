// import type { DatePickerProps } from '@/shared/components/ui/form/types';
import {
  CalendarToday as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  InputAdornment,
  Paper,
  Popover,
  Typography,
  useTheme,
} from '@mui/material';
import TextField from '@/shared/components/ui/data-display/textfield';
import React, { forwardRef, useState } from 'react';
import type { DatePickerProps as DatePickerPropsType } from './types';

// DatePicker 컴포넌트 자체 Props 타입 정의
export interface DatePickerProps extends DatePickerPropsType {}

/**
 * DatePicker 컴포넌트
 *
 * Material-UI TextField를 기반으로 한 날짜 선택 컴포넌트
 * 달력 팝오버를 통한 날짜 선택 기능 제공
 *
 * @example
 * ```tsx
 * // 기본 날짜 선택기
 * <DatePicker
 *   value={selectedDate}
 *   onChange={setSelectedDate}
 *   label="날짜 선택"
 * />
 *
 * // 제한된 날짜 범위
 * <DatePicker
 *   value={selectedDate}
 *   onChange={setSelectedDate}
 *   label="예약 날짜"
 *   minDate={new Date()}
 *   disablePast
 *   format="yyyy년 MM월 dd일"
 * />
 *
 * // 커스텀 포맷
 * <DatePicker
 *   value={selectedDate}
 *   onChange={setSelectedDate}
 *   label="생년월일"
 *   format="yyyy-MM-dd"
 *   views={['year', 'month', 'day']}
 * />
 * ```
 */
const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      format = 'yyyy-MM-dd',
      views = ['year', 'month', 'day'],
      openTo = 'day',
      minDate,
      maxDate,
      disableFuture = false,
      disablePast = false,
      shouldDisableDate,
      showDaysOutsideCurrentMonth = true,
      placeholder = '날짜를 선택하세요',
      readOnly = false,
      variant = 'outlined',
      size = 'medium',
      inputFormat,
      mask,
      renderInput,
      label,
      error = false,
      helperText,
      required = false,
      disabled = false,
      fullWidth = false,
      className,
      sx,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [viewDate, setViewDate] = useState<Date>(value || new Date());
    const [currentView, setCurrentView] = useState<'year' | 'month' | 'day'>(openTo);

    const open = Boolean(anchorEl);

    // 날짜 포맷팅
    const formatDate = (date: Date | null) => {
      if (!date) return '';

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return format.replace('yyyy', String(year)).replace('MM', month).replace('dd', day);
    };

    // 입력 필드 클릭 핸들러
    const handleInputClick = (event: React.MouseEvent<HTMLElement>) => {
      if (!disabled && !readOnly) {
        setAnchorEl(event.currentTarget);
      }
    };

    // 팝오버 닫기
    const handleClose = () => {
      setAnchorEl(null);
    };

    // 날짜 선택 핸들러
    const handleDateSelect = (date: Date) => {
      onChange(date);
      handleClose();
    };

    // 날짜 비활성화 체크
    const isDateDisabled = (date: Date) => {
      if (disableFuture && date > new Date()) return true;
      if (disablePast && date < new Date()) return true;
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      if (shouldDisableDate && shouldDisableDate(date)) return true;
      return false;
    };

    // 달력 렌더링
    const renderCalendar = () => {
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());

      const days = [];
      const currentDate = new Date(startDate);

      // 6주 * 7일 = 42일 렌더링
      for (let i = 0; i < 42; i++) {
        const date = new Date(currentDate);
        const isCurrentMonth = date.getMonth() === month;
        const isSelected = value && date.toDateString() === value.toDateString();
        const isToday = date.toDateString() === new Date().toDateString();
        const isDisabled = isDateDisabled(date);

        days.push(
          <Box
            key={i}
            sx={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isDisabled ? 'default' : 'pointer',
              borderRadius: 1,
              color: isCurrentMonth ? 'text.primary' : 'text.disabled',
              backgroundColor: isSelected ? 'primary.main' : 'transparent',
              ...(isToday && !isSelected ? { border: `1px solid ${theme.palette.primary.main}` } : {}),
              ...(isDisabled ? { color: 'text.disabled', backgroundColor: 'transparent' } : {}),
              ...(isDisabled
                ? {}
                : !isSelected
                  ? { '&:hover': { backgroundColor: 'action.hover' } }
                  : {}),
            }}
            onClick={() => !isDisabled && handleDateSelect(date)}
          >
            <Typography
              variant='body2'
              sx={{
                color: isSelected ? 'primary.contrastText' : 'inherit',
              }}
            >
              {date.getDate()}
            </Typography>
          </Box>
        );
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return days;
    };

    // 월 변경
    const handleMonthChange = (increment: number) => {
      const newDate = new Date(viewDate);
      newDate.setMonth(newDate.getMonth() + increment);
      setViewDate(newDate);
    };

    // 기본 입력 필드
    const inputField = (
      <TextField
        ref={ref}
        value={formatDate(value ?? null)}
        label={label}
        inputProps={{
          readOnly: true,
        }}
        InputLabelProps={{
          shrink: true,
        }}
        placeholder={placeholder}
        error={error}
        helperText={helperText}
        required={required}
        disabled={disabled}
        fullWidth={fullWidth}
        variant={variant}
        size={size}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position='end'>
              <IconButton onClick={handleInputClick} disabled={disabled}>
                <CalendarIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        onClick={handleInputClick}
        className={className}
        sx={{ ...sx, cursor: 'pointer', '& input': { cursor: 'pointer' } }}
        {...props}
      />
    );

    if (renderInput) {
      return renderInput({
        value: formatDate(value ?? null),
        onClick: handleInputClick,
        disabled,
        error,
        helperText,
        label,
        placeholder,
      });
    }

    return (
      <>
        {inputField}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <Paper sx={{ p: 2, minWidth: 280 }}>
            {/* 헤더 */}
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
            >
              <IconButton size='small' onClick={() => handleMonthChange(-1)}>
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
              </Typography>
              <IconButton size='small' onClick={() => handleMonthChange(1)}>
                <ChevronRightIcon />
              </IconButton>
            </Box>

            {/* 요일 헤더 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
              {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                <Box
                  key={day}
                  sx={{
                    width: 36,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant='caption' color='text.secondary' sx={{ fontWeight: 600 }}>
                    {day}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* 날짜 그리드 */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
              {renderCalendar()}
            </Box>
          </Paper>
        </Popover>
      </>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;
