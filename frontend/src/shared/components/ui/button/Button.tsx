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
  // 무채색 스타일 정의
  const monochromeStyle = {
    backgroundColor: isDark ? '#4B5563' : '#6B7280',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: isDark ? '#374151' : '#4B5563',
    },
    '&:active': {
      backgroundColor: isDark ? '#1F2937' : '#374151',
    },
  };

  const monochromeOutlinedStyle = {
    borderColor: isDark ? '#6B7280' : '#6B7280',
    color: isDark ? '#9CA3AF' : '#6B7280',
    '&:hover': {
      borderColor: isDark ? '#4B5563' : '#4B5563',
      color: isDark ? '#D1D5DB' : '#4B5563',
      backgroundColor: isDark ? 'rgba(107, 114, 128, 0.1)' : 'rgba(107, 114, 128, 0.1)',
    },
    '&:active': {
      borderColor: isDark ? '#374151' : '#374151',
      color: isDark ? '#F3F4F6' : '#374151',
    },
  };

  switch (preset) {
    case 'cancel':
      return {
        variant: 'outlined',
        color: 'secondary',
        startIcon: <CancelIcon />,
        label: '취소',
        sx: monochromeOutlinedStyle,
      };
    case 'delete':
      return {
        variant: 'outlined',
        color: 'error',
        startIcon: <DeleteIcon />,
        label: '삭제',
        sx: monochromeOutlinedStyle,
      };
    case 'edit':
      return {
        variant: 'outlined',
        color: 'warning',
        startIcon: <EditIcon />,
        label: '수정',
        sx: monochromeOutlinedStyle,
      };
    case 'refresh':
      return {
        variant: 'outlined',
        color: 'secondary',
        startIcon: <RefreshIcon />,
        label: '새로고침',
        sx: monochromeOutlinedStyle,
      };
    case 'register':
      return {
        variant: 'outlined',
        color: 'primary',
        startIcon: <AddIcon />,
        label: '등록',
        sx: monochromeOutlinedStyle,
      };
    case 'save':
      return {
        variant: 'outlined',
        color: 'success',
        startIcon: <SaveIcon />,
        label: '저장',
        sx: monochromeOutlinedStyle,
      };
    case 'search':
      return {
        variant: 'outlined',
        color: 'primary',
        startIcon: <SearchIcon />,
        label: '조회',
        sx: monochromeOutlinedStyle,
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
      // Modern button styles inspired by ApprovalDashboard
      height: '32px !important',
      minWidth: '60px !important',
      fontSize: '0.75rem !important',
      fontWeight: '600 !important',
      borderRadius: '4px !important',
      padding: '4px 8px !important',
      lineHeight: 1,
      textTransform: 'none',
      letterSpacing: '0.02em',
      // Enhanced hover and focus states
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      '&:active': {
        transform: 'translateY(0px)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      },

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
