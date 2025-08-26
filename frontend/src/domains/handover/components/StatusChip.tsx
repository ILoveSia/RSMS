/**
 * 상태 표시 칩 컴포넌트
 * 인수인계 및 문서 상태를 일관된 UI로 표시합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 상태 표시만 담당
 * - Open/Closed: 새로운 상태 타입 추가 시 확장 가능
 * - Liskov Substitution: Chip 컴포넌트 인터페이스 준수
 * - Interface Segregation: 상태 표시 관련 기능만 제공
 * - Dependency Inversion: Material-UI Chip에 의존
 */

import React from 'react';
import { Chip, ChipProps, useTheme } from '@mui/material';

// 지원하는 상태 타입
export type StatusType = 
  // 인수인계 상태
  | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  // 문서 상태
  | 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: StatusType;
  variant?: 'filled' | 'outlined';
}

// 상태별 설정 - 금융권 적합 색상 (라이트/다크 모드)
const getStatusConfig = (isDark: boolean): Record<StatusType, {
  label: string;
  color?: ChipProps['color'];
  customColor?: string;
  bgColor?: string;
}> => ({
  // 인수인계 상태
  PLANNED: { 
    label: '계획', 
    customColor: isDark ? '#94A3B8' : '#64748B',  // 다크모드: 밝은 그레이
    bgColor: isDark ? '#334155' : '#F1F5F9' 
  },
  IN_PROGRESS: { 
    label: '진행중', 
    customColor: isDark ? '#06B6D4' : '#0891B2',  // 다크모드: 밝은 하늘색
    bgColor: isDark ? '#164E63' : '#E0F2FE' 
  },
  COMPLETED: { 
    label: '완료', 
    customColor: isDark ? '#10B981' : '#059669',  // 다크모드: 밝은 초록색
    bgColor: isDark ? '#064E3B' : '#D1FAE5' 
  },
  CANCELLED: { 
    label: '취소', 
    customColor: isDark ? '#EF4444' : '#DC2626',  // 다크모드: 밝은 빨강
    bgColor: isDark ? '#7F1D1D' : '#FEE2E2' 
  },
  
  // 문서 상태
  DRAFT: { 
    label: '초안', 
    customColor: isDark ? '#94A3B8' : '#64748B',
    bgColor: isDark ? '#334155' : '#F1F5F9' 
  },
  REVIEW: { 
    label: '검토중', 
    customColor: isDark ? '#F59E0B' : '#D97706',  // 다크모드: 밝은 주황
    bgColor: isDark ? '#92400E' : '#FED7AA' 
  },
  APPROVED: { 
    label: '승인됨', 
    customColor: isDark ? '#06B6D4' : '#0891B2',
    bgColor: isDark ? '#164E63' : '#E0F2FE' 
  },
  PUBLISHED: { 
    label: '발행됨', 
    customColor: isDark ? '#10B981' : '#059669',
    bgColor: isDark ? '#064E3B' : '#D1FAE5' 
  },
});

const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  variant = 'filled',
  size = 'small',
  ...props 
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const statusConfig = getStatusConfig(isDark);
  const config = statusConfig[status];
  
  if (!config) {
    return (
      <Chip 
        label={status} 
        color="default" 
        variant={variant}
        size={size}
        {...props} 
      />
    );
  }

  // 금융권 적합 색상 적용
  const chipStyles = {
    ...(config.customColor && variant === 'filled' && {
      backgroundColor: config.bgColor,
      color: config.customColor,
      fontWeight: 600,
      '& .MuiChip-label': {
        fontSize: '0.75rem',
      },
    }),
    ...(config.customColor && variant === 'outlined' && {
      borderColor: config.customColor,
      color: config.customColor,
      fontWeight: 600,
      '& .MuiChip-label': {
        fontSize: '0.75rem',
      },
    }),
  };

  return (
    <Chip
      label={config.label}
      color={config.color}
      variant={variant}
      size={size}
      sx={chipStyles}
      {...props}
    />
  );
};

export default StatusChip;