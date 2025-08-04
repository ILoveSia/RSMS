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
import { Chip, ChipProps } from '@mui/material';

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

// 상태별 설정
const statusConfig: Record<StatusType, {
  label: string;
  color: ChipProps['color'];
}> = {
  // 인수인계 상태
  PLANNED: { label: '계획', color: 'default' },
  IN_PROGRESS: { label: '진행중', color: 'info' },
  COMPLETED: { label: '완료', color: 'success' },
  CANCELLED: { label: '취소', color: 'error' },
  
  // 문서 상태
  DRAFT: { label: '초안', color: 'default' },
  REVIEW: { label: '검토중', color: 'warning' },
  APPROVED: { label: '승인됨', color: 'info' },
  PUBLISHED: { label: '발행됨', color: 'success' },
};

const StatusChip: React.FC<StatusChipProps> = ({ 
  status, 
  variant = 'filled',
  size = 'small',
  ...props 
}) => {
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

  return (
    <Chip
      label={config.label}
      color={config.color}
      variant={variant}
      size={size}
      {...props}
    />
  );
};

export default StatusChip;