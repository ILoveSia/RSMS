/**
 * 공통 Button 컴포넌트
 * Material-UI Button을 래핑하여 프로젝트 표준 스타일과 기능을 제공합니다.
 *
 * @example
 * ```tsx
 * <Button variant="contained" color="primary" onClick={() => console.log('clicked')}>
 *   클릭하세요
 * </Button>
 * ```
 */
import type { BaseComponentProps, Color, Size, Variant } from '@/shared/types/common';
import { CircularProgress, Button as MuiButton } from '@mui/material';
import type { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import React from 'react';

export interface ButtonProps extends BaseComponentProps {
  // 필수 props
  children: React.ReactNode;

  // 선택적 props
  variant?: Variant;
  size?: Size;
  color?: Color;
  fullWidth?: boolean;

  // 상태 관련
  disabled?: boolean;
  loading?: boolean;

  // 아이콘 관련
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;

  // 이벤트 핸들러
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  // HTML button 속성
  type?: 'button' | 'submit' | 'reset';
  form?: string;

  // 접근성
  'aria-label'?: string;
  'aria-describedby'?: string;

  // 추가 MUI props
  disableElevation?: boolean;
  disableRipple?: boolean;
  href?: string;
  target?: string;
}

/**
 * 공통 Button 컴포넌트
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'contained',
      size = 'medium',
      color = 'primary',
      fullWidth = false,
      disabled = false,
      loading = false,
      startIcon,
      endIcon,
      onClick,
      onMouseEnter,
      onMouseLeave,
      type = 'button',
      form,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      disableElevation = false,
      disableRipple = false,
      href,
      target,
      className,
      style,
      id,
      'data-testid': dataTestId,
      sx,
      ...props
    },
    ref
  ) => {
    // 로딩 상태일 때 스타일 처리
    const loadingSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

    // 로딩 중일 때 아이콘 처리
    const processedStartIcon = loading ? (
      <CircularProgress size={loadingSize} color='inherit' />
    ) : (
      startIcon
    );

    const processedEndIcon =
      loading && !startIcon ? <CircularProgress size={loadingSize} color='inherit' /> : endIcon;

    // 이벤트 핸들러
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
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
      type,
      form,
      disableElevation,
      disableRipple,
      href,
      target,
      className,
      style,
      id,
      'data-testid': dataTestId,
      'aria-label': ariaLabel || (typeof children === 'string' ? children : undefined),
      'aria-describedby': ariaDescribedBy,
      'aria-busy': loading,
      sx: {
        // 기본 스타일
        textTransform: 'none',
        fontWeight: 500,
        borderRadius: 2,
        // 로딩 상태 스타일
        ...(loading && {
          pointerEvents: 'none',
        }),
        // 사용자 정의 스타일
        ...sx,
      },
      ...props,
    };

    return (
      <MuiButton ref={ref} {...muiProps}>
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = 'Button';

export default Button;
