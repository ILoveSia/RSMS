import { Close as CloseIcon } from '@mui/icons-material';
import { AlertTitle, IconButton, Alert as MuiAlert } from '@mui/material';
import { forwardRef } from 'react';
import { AlertProps } from './types';

/**
 * Alert 컴포넌트
 *
 * Material-UI Alert를 기반으로 한 알림 컴포넌트
 * 성공, 경고, 오류, 정보 등의 상태를 표시
 *
 * @example
 * ```tsx
 * <Alert severity="success" title="성공" closable>
 *   데이터가 성공적으로 저장되었습니다.
 * </Alert>
 *
 * <Alert severity="error" onClose={handleClose}>
 *   오류가 발생했습니다. 다시 시도해주세요.
 * </Alert>
 * ```
 */
const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      severity = 'info',
      variant = 'standard',
      children,
      title,
      onClose,
      closable = false,
      icon,
      action,
      className,
      sx,
      ...props
    },
    ref
  ) => {
    const handleClose = () => {
      if (onClose) {
        onClose();
      }
    };

    // 닫기 버튼 렌더링
    const renderCloseButton = () => {
      if (!closable && !onClose) return null;

      return (
        <IconButton
          aria-label='close'
          color='inherit'
          size='small'
          onClick={handleClose}
          sx={{
            ml: 1,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <CloseIcon fontSize='inherit' />
        </IconButton>
      );
    };

    // 액션 요소 렌더링
    const renderAction = () => {
      if (action) {
        return action;
      }

      return renderCloseButton();
    };

    return (
      <MuiAlert
        ref={ref}
        severity={severity}
        variant={variant}
        icon={icon}
        action={renderAction()}
        className={className}
        sx={sx}
        {...props}
      >
        {title && <AlertTitle sx={{ mb: title && children ? 1 : 0 }}>{title}</AlertTitle>}
        {children}
      </MuiAlert>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
