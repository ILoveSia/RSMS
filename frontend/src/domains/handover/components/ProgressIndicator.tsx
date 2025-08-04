/**
 * 진행률 표시 컴포넌트
 * 인수인계 진행률을 시각적으로 표시합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 진행률 표시만 담당
 * - Open/Closed: 새로운 스타일이나 옵션 추가 시 확장 가능
 * - Liskov Substitution: React 컴포넌트 인터페이스 준수
 * - Interface Segregation: 진행률 표시 관련 기능만 제공
 * - Dependency Inversion: Material-UI 컴포넌트에 의존
 */

import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  LinearProgressProps,
} from '@mui/material';
import { StatusType } from './StatusChip';

interface ProgressIndicatorProps {
  value: number;
  status?: StatusType;
  showPercentage?: boolean;
  variant?: LinearProgressProps['variant'];
  color?: LinearProgressProps['color'];
  height?: number;
  size?: 'small' | 'medium' | 'large';
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  status,
  showPercentage = true,
  variant = 'determinate',
  color,
  height,
  size = 'medium',
}) => {
  // 크기별 설정
  const sizeConfig = {
    small: { height: 4, fontSize: '0.75rem' },
    medium: { height: 6, fontSize: '0.875rem' },
    large: { height: 8, fontSize: '1rem' },
  };

  const config = sizeConfig[size];
  const progressHeight = height || config.height;

  // 상태에 따른 색상 결정
  const getProgressColor = (): LinearProgressProps['color'] => {
    if (color) return color;
    
    if (status) {
      switch (status) {
        case 'COMPLETED':
        case 'PUBLISHED':
          return 'success';
        case 'CANCELLED':
          return 'error';
        case 'IN_PROGRESS':
        case 'REVIEW':
          return value < 30 ? 'error' : value < 70 ? 'warning' : 'info';
        default:
          return 'primary';
      }
    }
    
    // 기본 진행률 기반 색상
    if (value < 30) return 'error';
    if (value < 70) return 'warning';
    return 'info';
  };

  // 진행률 값 정규화 (0-100 범위)
  const normalizedValue = Math.max(0, Math.min(100, value || 0));

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <LinearProgress
        variant={variant}
        value={normalizedValue}
        color={getProgressColor()}
        sx={{
          flexGrow: 1,
          height: progressHeight,
          borderRadius: progressHeight / 2,
          backgroundColor: 'grey.200',
          '& .MuiLinearProgress-bar': {
            borderRadius: progressHeight / 2,
          },
        }}
      />
      {showPercentage && (
        <Typography
          variant="caption"
          sx={{
            minWidth: size === 'small' ? 30 : 35,
            fontSize: config.fontSize,
            fontWeight: 'medium',
          }}
        >
          {normalizedValue}%
        </Typography>
      )}
    </Box>
  );
};

export default ProgressIndicator;