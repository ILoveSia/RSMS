import { Close as CloseIcon } from '@mui/icons-material';
import { Chip as MuiChip, useTheme } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/system';
import React, { forwardRef, ReactNode } from 'react';

// Chip 컴포넌트 Props 타입 정의
interface ChipProps {
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
  className?: string;
  sx?: SxProps<Theme>;
}

/**
 * Chip 컴포넌트
 *
 * Material-UI Chip을 기반으로 한 칩 컴포넌트
 * 태그, 라벨, 선택 가능한 항목 표시에 사용
 *
 * @example
 * ```tsx
 * // 기본 칩
 * <Chip label="기본" />
 *
 * // 아이콘과 함께
 * <Chip
 *   icon={<FaceIcon />}
 *   label="아이콘 칩"
 *   color="primary"
 * />
 *
 * // 아바타와 함께
 * <Chip
 *   avatar={<Avatar>M</Avatar>}
 *   label="아바타 칩"
 *   variant="outlined"
 * />
 *
 * // 삭제 가능한 칩
 * <Chip
 *   label="삭제 가능"
 *   onDelete={handleDelete}
 *   color="secondary"
 * />
 *
 * // 클릭 가능한 칩
 * <Chip
 *   label="클릭 가능"
 *   onClick={handleClick}
 *   clickable
 *   color="success"
 * />
 * ```
 */
const Chip = forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      label,
      avatar,
      icon,
      deleteIcon = <CloseIcon />,
      onDelete,
      onClick,
      clickable = false,
      variant = 'filled',
      color = 'default',
      size = 'medium',
      disabled = false,
      href,
      component,
      className,
      sx,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();

    // 클릭 가능 여부 결정
    const isClickable = clickable || !!onClick || !!href;

    return (
      <MuiChip
        ref={ref}
        label={label}
        avatar={avatar}
        icon={icon}
        deleteIcon={deleteIcon}
        onDelete={onDelete}
        onClick={onClick}
        clickable={isClickable}
        variant={variant}
        color={color}
        size={size}
        disabled={disabled}
        href={href}
        component={component}
        className={className}
        sx={{
          fontSize: size === 'small' ? '0.75rem' : '0.875rem',
          fontWeight: 500,
          '& .MuiChip-label': {
            paddingLeft: size === 'small' ? 8 : 12,
            paddingRight: size === 'small' ? 8 : 12,
          },
          '& .MuiChip-icon': {
            fontSize: size === 'small' ? '1rem' : '1.25rem',
            marginLeft: size === 'small' ? 4 : 8,
          },
          '& .MuiChip-avatar': {
            width: size === 'small' ? 20 : 24,
            height: size === 'small' ? 20 : 24,
            fontSize: size === 'small' ? '0.75rem' : '0.875rem',
          },
          '& .MuiChip-deleteIcon': {
            fontSize: size === 'small' ? '1rem' : '1.25rem',
            marginRight: size === 'small' ? 4 : 8,
            '&:hover': {
              color: theme.palette.action.active,
            },
          },
          ...(isClickable && {
            cursor: 'pointer',
            '&:hover': {
              backgroundColor:
                variant === 'outlined'
                  ? theme.palette.action.hover
                  : color === 'default'
                  ? theme.palette.grey[300]
                  : `${theme.palette[color].main}15`,
            },
            '&:focus': {
              backgroundColor:
                variant === 'outlined'
                  ? theme.palette.action.focus
                  : color === 'default'
                  ? theme.palette.grey[400]
                  : `${theme.palette[color].main}25`,
            },
          }),
          ...(variant === 'outlined' && {
            backgroundColor: 'transparent',
            borderColor: color === 'default' ? theme.palette.grey[400] : theme.palette[color].main,
            color: color === 'default' ? theme.palette.text.primary : theme.palette[color].main,
          }),
          ...sx,
        }}
        {...props}
      />
    );
  }
);

Chip.displayName = 'Chip';

export default Chip;
