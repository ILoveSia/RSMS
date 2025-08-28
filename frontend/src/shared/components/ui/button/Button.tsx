import type { BaseComponentProps, Color, Size, Variant } from '@/shared/types/common';
import { CircularProgress, Button as MuiButton, useTheme } from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import React from 'react';
import {
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

export interface ButtonProps extends BaseComponentProps {
  children?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  color?: Color;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  form?: string;
  preset?: 'cancel' | 'delete' | 'edit' | 'refresh' | 'register' | 'save' | 'search';
}

const createModernStyle = (main: string, hover: string, active: string) => ({
  backgroundColor: main,
  '&:hover': {
    backgroundColor: hover,
  },
  '&:active': {
    backgroundColor: active,
  },
});

const colorStyles = {
  primary: createModernStyle('#3B82F6', '#2563EB', '#1D4ED8'),
  secondary: createModernStyle('#8B5CF6', '#7C3AED', '#6D28D9'),
  success: createModernStyle('#10B981', '#059669', '#047857'),
  warning: createModernStyle('#F59E0B', '#D97706', '#B45309'),
  error: createModernStyle('#EF4444', '#DC2626', '#B91C1C'),
};

interface PresetProps {
  variant?: Variant;
  color?: Color;
  startIcon?: React.ReactNode;
  label?: string;
  sx?: MuiButtonProps['sx'];
}

const getPresetProps = (preset: ButtonProps['preset'], isDark: boolean): PresetProps => {
  switch (preset) {
    case 'cancel':
      return {
        variant: 'outlined',
        color: 'secondary',
        startIcon: <CancelIcon />,
        label: '취소',
        sx: {
          borderColor: isDark ? '#9CA3AF' : '#6B7280',
          color: isDark ? '#9CA3AF' : '#6B7280',
          '&:hover': {
            borderColor: isDark ? '#D1D5DB' : '#4B5563',
            color: isDark ? '#D1D5DB' : '#4B5563',
            backgroundColor: isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(107, 114, 128, 0.1)',
          },
          '&:active': {
            borderColor: isDark ? '#F3F4F6' : '#374151',
            color: isDark ? '#F3F4F6' : '#374151',
          },
        },
      };
    case 'delete':
      return {
        variant: 'contained',
        color: 'error',
        startIcon: <DeleteIcon />,
        label: '삭제',
        sx: {
          backgroundColor: isDark ? '#F87171' : '#EF4444',
          '&:hover': {
            backgroundColor: isDark ? '#FCA5A5' : '#DC2626',
          },
          '&:active': {
            backgroundColor: isDark ? '#FEB2B2' : '#B91C1C',
          },
        },
      };
    case 'edit':
      return {
        variant: 'contained',
        color: 'warning',
        startIcon: <EditIcon />,
        label: '수정',
        sx: {
          backgroundColor: isDark ? '#FBBF24' : '#F59E0B',
          '&:hover': {
            backgroundColor: isDark ? '#FCD34D' : '#D97706',
          },
          '&:active': {
            backgroundColor: isDark ? '#FDE68A' : '#B45309',
          },
        },
      };
    case 'refresh':
      return {
        variant: 'outlined',
        color: 'secondary',
        startIcon: <RefreshIcon />,
        label: '새로고침',
        sx: {
          borderColor: isDark ? '#A78BFA' : '#8B5CF6',
          color: isDark ? '#A78BFA' : '#8B5CF6',
          '&:hover': {
            borderColor: isDark ? '#C4B5FD' : '#7C3AED',
            color: isDark ? '#C4B5FD' : '#7C3AED',
            backgroundColor: isDark ? 'rgba(167, 139, 250, 0.1)' : 'rgba(139, 92, 246, 0.1)',
          },
          '&:active': {
            borderColor: isDark ? '#DDD6FE' : '#6D28D9',
            color: isDark ? '#DDD6FE' : '#6D28D9',
          },
        },
      };
    case 'register':
      return {
        variant: 'contained',
        color: 'primary',
        startIcon: <AddIcon />,
        label: '등록',
        sx: {
          backgroundColor: isDark ? '#60A5FA' : '#3B82F6',
          '&:hover': {
            backgroundColor: isDark ? '#7CC3FC' : '#2563EB',
          },
          '&:active': {
            backgroundColor: isDark ? '#93C5FD' : '#1D4ED8',
          },
        },
      };
    case 'save':
      return {
        variant: 'contained',
        color: 'success',
        startIcon: <SaveIcon />,
        label: '저장',
        sx: {
          backgroundColor: isDark ? '#34D399' : '#10B981',
          '&:hover': {
            backgroundColor: isDark ? '#6EE7B7' : '#059669',
          },
          '&:active': {
            backgroundColor: isDark ? '#A7F3D0' : '#047857',
          },
        },
      };
    case 'search':
      return {
        variant: 'contained',
        color: 'primary',
        startIcon: <SearchIcon />,
        label: '조회',
        sx: {
          backgroundColor: isDark ? '#60A5FA' : '#3B82F6',
          '&:hover': {
            backgroundColor: isDark ? '#7CC3FC' : '#2563EB',
          },
          '&:active': {
            backgroundColor: isDark ? '#93C5FD' : '#1D4ED8',
          },
        },
      };
    default:
      return {};
  }
};

/**
 * 공통 Button 컴포넌트
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      preset,
      variant: propVariant,
      size = 'medium',
      color: propColor,
      fullWidth = false,
      disabled = false,
      loading = false,
      startIcon: propStartIcon,
      endIcon,
      onClick,
      onMouseEnter,
      onMouseLeave,
      form,
      className,
      style,
      id,
      'data-testid': dataTestId,
      sx: propSx,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const presetDefaults = getPresetProps(preset, isDark);

    const variant = propVariant ?? presetDefaults.variant ?? 'contained';
    const color = propColor ?? presetDefaults.color ?? 'primary';
    const startIcon = propStartIcon ?? presetDefaults.startIcon;
    const label = presetDefaults.label;
    const finalChildren = children ?? label;

    const finalSx = {
      // Common base styles for all buttons
      height: '32px',
      minWidth: '80px',
      fontSize: '0.875rem',
      fontWeight: 600,
      borderRadius: 1,
      lineHeight: 1,
      textTransform: 'none',
      letterSpacing: '0.02em',

      // Loading state style
      ...(loading && {
        pointerEvents: 'none',
      }),
      // Bank project style enhancement (general color styles)
      ...(variant === 'contained' && color === 'primary' && !preset && {
        '&.MuiButton-containedPrimary': colorStyles.primary,
      }),
      ...(variant === 'contained' && color === 'secondary' && !preset && {
        '&.MuiButton-containedSecondary': colorStyles.secondary,
      }),
      ...(variant === 'contained' && color === 'success' && !preset && {
        '&.MuiButton-containedSuccess': colorStyles.success,
      }),
      ...(variant === 'contained' && color === 'warning' && !preset && {
        '&.MuiButton-containedWarning': colorStyles.warning,
      }),
      ...(variant === 'contained' && color === 'error' && !preset && {
        '&.MuiButton-containedError': colorStyles.error,
      }),
      // Preset specific styles (override common base styles if defined)
      ...presetDefaults.sx,
      // User-defined styles (highest precedence)
      ...propSx,
    };

    const loadingSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

    const processedStartIcon = loading ? (
      <CircularProgress size={loadingSize} color="inherit" />
    ) : (
      startIcon
    );

    const processedEndIcon =
      loading && !startIcon ? <CircularProgress size={loadingSize} color="inherit" /> : endIcon;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    const muiProps: MuiButtonProps = {
      variant,
      size,
      color,
      fullWidth,
      disabled: disabled || loading,
      startIcon: processedStartIcon,
      endIcon: processedEndIcon,
      onClick: handleClick,
      onMouseEnter,
      onMouseLeave,
      form,
      className,
      style,
      id,
      sx: finalSx,
      ...props,
    };

    return (
      <MuiButton ref={ref} {...muiProps}>
        {finalChildren}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
