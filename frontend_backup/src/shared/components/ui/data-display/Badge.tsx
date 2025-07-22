import { Badge as MuiBadge, useTheme } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import { ReactNode, forwardRef } from 'react';

// Badge 컴포넌트 Props 타입 정의
interface BadgeProps {
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
  className?: string;
  sx?: SxProps<Theme>;
}

/**
 * Badge 컴포넌트
 *
 * Material-UI Badge를 기반으로 한 배지 컴포넌트
 * 알림, 카운트, 상태 표시 등에 사용
 *
 * @example
 * ```tsx
 * // 기본 배지
 * <Badge badgeContent={4} color="primary">
 *   <MailIcon />
 * </Badge>
 *
 * // 닷 배지
 * <Badge variant="dot" color="error">
 *   <NotificationsIcon />
 * </Badge>
 *
 * // 최대값 제한
 * <Badge badgeContent={1000} max={99} color="secondary">
 *   <MailIcon />
 * </Badge>
 *
 * // 커스텀 위치
 * <Badge
 *   badgeContent="NEW"
 *   color="success"
 *   anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
 * >
 *   <Button>업데이트</Button>
 * </Badge>
 * ```
 */
const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      badgeContent,
      children,
      color = 'default',
      variant = 'standard',
      anchorOrigin = {
        vertical: 'top',
        horizontal: 'right',
      },
      overlap = 'rectangular',
      invisible = false,
      showZero = false,
      max = 99,
      className,
      sx,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    return (
      <MuiBadge
        ref={ref}
        badgeContent={badgeContent}
        color={color}
        variant={variant}
        anchorOrigin={anchorOrigin}
        overlap={overlap}
        invisible={invisible}
        showZero={showZero}
        max={max}
        className={className}
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '0.75rem',
            fontWeight: 600,
            minWidth: variant === 'dot' ? 6 : 20,
            height: variant === 'dot' ? 6 : 20,
            padding: variant === 'dot' ? 0 : '0 6px',
          },
          '& .MuiBadge-colorPrimary': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          },
          '& .MuiBadge-colorSecondary': {
            backgroundColor: theme.palette.secondary.main,
            color: theme.palette.secondary.contrastText,
          },
          '& .MuiBadge-colorError': {
            backgroundColor: theme.palette.error.main,
            color: theme.palette.error.contrastText,
          },
          '& .MuiBadge-colorWarning': {
            backgroundColor: theme.palette.warning.main,
            color: theme.palette.warning.contrastText,
          },
          '& .MuiBadge-colorInfo': {
            backgroundColor: theme.palette.info.main,
            color: theme.palette.info.contrastText,
          },
          '& .MuiBadge-colorSuccess': {
            backgroundColor: theme.palette.success.main,
            color: theme.palette.success.contrastText,
          },
          ...sx,
        }}
        {...props}
      >
        {children}
      </MuiBadge>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
