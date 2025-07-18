import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { ReactNode } from 'react';

// AlertColor 타입을 직접 정의 (MUI import 이슈 방지)
type AlertColor = 'error' | 'warning' | 'info' | 'success';

// 기본 컴포넌트 Props 인터페이스
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
  sx?: SxProps<Theme>;
}

// Toast 컴포넌트 타입 - 단순화된 버전
export interface ToastProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  autoHideDuration?: number;
  onClose?: () => void;
  position?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  action?: ReactNode;
  className?: string;
  sx?: SxProps<Theme>;
}

// Loading 컴포넌트 타입
export interface LoadingProps extends BaseComponentProps {
  loading?: boolean;
  size?: number | string;
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  variant?: 'circular' | 'linear';
  overlay?: boolean;
  backdrop?: boolean;
  message?: string;
  progress?: number;
  className?: string;
  sx?: SxProps<Theme>;
}

// 글로벌 Toast 관리를 위한 타입
export interface ToastMessage {
  id: string;
  message: string;
  severity?: AlertColor;
  autoHideDuration?: number;
  position?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  action?: ReactNode;
  timestamp: number;
}

export interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: Omit<ToastMessage, 'id' | 'timestamp'>) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
  defaultPosition?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  defaultAutoHideDuration?: number;
}

// Loading 관리를 위한 타입
export interface LoadingState {
  id: string;
  message?: string;
  progress?: number;
  timestamp: number;
}

export interface LoadingContextType {
  loadingStates: LoadingState[];
  showLoading: (id: string, message?: string) => void;
  hideLoading: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  updateMessage: (id: string, message: string) => void;
  clearAllLoading: () => void;
  isLoading: (id?: string) => boolean;
}

export interface LoadingProviderProps {
  children: React.ReactNode;
  maxLoadingStates?: number;
}
