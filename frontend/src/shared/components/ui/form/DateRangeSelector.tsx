/**
 * 기간 선택 컴포넌트
 * 
 * 단일 책임 원칙(SRP): 기간 선택 UI와 로직만 담당
 * 개방-폐쇄 원칙(OCP): 새로운 기간 선택 옵션 추가 시 확장 가능
 * 리스코프 치환 원칙(LSP): React.FC 인터페이스를 준수
 * 인터페이스 분리 원칙(ISP): 필요한 props만 정의
 * 의존성 역전 원칙(DIP): DatePicker 컴포넌트 인터페이스에 의존
 */

import { Button } from '@/shared/components/ui/button';
import { DatePicker } from '@/shared/components/ui/form';
import { Box, Typography } from '@mui/material';
import React from 'react';

/**
 * 기간 선택 컴포넌트 Props 인터페이스
 */
export interface DateRangeSelectorProps {
  /** 시작일 */
  startDate: Date | null;
  /** 종료일 */
  endDate: Date | null;
  /** 시작일 변경 핸들러 */
  onStartDateChange: (date: Date | null) => void;
  /** 종료일 변경 핸들러 */
  onEndDateChange: (date: Date | null) => void;
  /** 조회 버튼 클릭 핸들러 */
  onSearch: () => void;
  /** 시작일 라벨 */
  startLabel?: string;
  /** 종료일 라벨 */
  endLabel?: string;
  /** 조회 버튼 라벨 */
  searchLabel?: string;
  /** 컴포넌트 비활성화 여부 */
  disabled?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 시작일 입력 필드 너비 */
  startDateWidth?: string;
  /** 종료일 입력 필드 너비 */
  endDateWidth?: string;
  /** CSS 클래스명 */
  className?: string;
  /** 추가 스타일 */
  sx?: object;
}

/**
 * 기간 선택 컴포넌트
 * 
 * 주요 기능:
 * - 시작일/종료일 선택 UI 제공
 * - 자동 유효성 검증 (시작일 ≤ 종료일)
 * - 조회 버튼 통합 제공
 * - 커스텀 라벨 지원
 * - 반응형 레이아웃 지원
 */
const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSearch,
  startLabel = '시작일',
  endLabel = '종료일',
  disabled = false,
  loading = false,
  className,
  sx = {},
}) => {
  /**
   * 시작일 변경 핸들러
   * 시작일이 종료일보다 늦은 경우 종료일을 시작일로 자동 조정
   */
  const handleStartDateChange = (date: Date | null) => {
    onStartDateChange(date);
    
    // 시작일이 종료일보다 늦은 경우 종료일을 시작일로 조정
    if (date && endDate && date > endDate) {
      onEndDateChange(date);
    }
  };

  /**
   * 종료일 변경 핸들러
   * 종료일이 시작일보다 이른 경우 시작일을 종료일로 자동 조정
   */
  const handleEndDateChange = (date: Date | null) => {
    onEndDateChange(date);
    
    // 종료일이 시작일보다 이른 경우 시작일을 종료일로 조정
    if (date && startDate && date < startDate) {
      onStartDateChange(date);
    }
  };

  return (
    <Box
      className={className}
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        flexWrap: 'wrap',
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <DatePicker
          label={startLabel}
          value={startDate}
          onChange={handleStartDateChange}
          maxDate={endDate ?? undefined}
          size="small"
          disabled={disabled || loading}
        />
        <Typography sx={{ 
          color: 'var(--bank-text-primary)', 
          fontWeight: 600,
          userSelect: 'none'
        }}>
          ~
        </Typography>
        <DatePicker
          label={endLabel}
          minDate={startDate ?? undefined}
          value={endDate}
          onChange={handleEndDateChange}
          size="small"
          disabled={disabled || loading}
        />
      </Box>
      <Button
        preset="search"
        onClick={onSearch}
        loading={loading}
        disabled={disabled || loading}
      />
    </Box>
  );
};

export default DateRangeSelector;