import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { ReactNode } from 'react';

// 기본 컴포넌트 Props 인터페이스
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
  sx?: SxProps<Theme>;
}

// Badge 컴포넌트 타입
export interface BadgeProps extends BaseComponentProps {
  badgeContent?: ReactNode;
  children: ReactNode;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  variant?: 'standard' | 'dot';
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'right';
  };
  overlap?: 'rectangular' | 'circular';
  invisible?: boolean;
  showZero?: boolean;
  max?: number;
}

// Chip 컴포넌트 타입
export interface ChipProps extends BaseComponentProps {
  label: string;
  avatar?: ReactNode;
  icon?: ReactNode;
  deleteIcon?: ReactNode;
  onDelete?: () => void;
  onClick?: () => void;
  clickable?: boolean;
  variant?: 'filled' | 'outlined';
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  size?: 'small' | 'medium';
  disabled?: boolean;
  href?: string;
  component?: React.ElementType;
}
