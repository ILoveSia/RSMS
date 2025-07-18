import { Close as CloseIcon } from '@mui/icons-material';
import { Alert, IconButton, Slide, Snackbar } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import type { SlideProps } from '@mui/material/Slide';
import type { SxProps } from '@mui/system';
import type { Theme } from '@mui/material/styles';
import React, { ReactNode, forwardRef } from 'react';

// Toast 컴포넌트 Props 타입 정의
interface ToastProps {
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

// 슬라이드 트랜지션 컴포넌트
const SlideTransition = forwardRef<unknown, SlideProps>((props, ref) => {
  return <Slide {...props} ref={ref} direction='up' />;
});

/**
 * Toast 컴포넌트
 *
 * Material-UI Snackbar를 기반으로 한 토스트 알림 컴포넌트
 * 다양한 위치, 자동 숨김, 액션 버튼 등을 제공
 *
 * @example
 * ```tsx
 * // 기본 토스트
 * <Toast
 *   open={isOpen}
 *   message="저장되었습니다."
 *   onClose={handleClose}
 * />
 *
 * // 성공 토스트
 * <Toast
 *   open={isOpen}
 *   message="작업이 완료되었습니다."
 *   severity="success"
 *   onClose={handleClose}
 * />
 *
 * // 커스텀 위치 토스트
 * <Toast
 *   open={isOpen}
 *   message="오류가 발생했습니다."
 *   severity="error"
 *   position={{ vertical: 'top', horizontal: 'center' }}
 *   onClose={handleClose}
 * />
 * ```
 */
const Toast = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      open,
      message,
      severity = 'info',
      autoHideDuration = 6000,
      onClose,
      position = { vertical: 'bottom', horizontal: 'left' },
      action,
      className,
      sx,
      ...props
    },
    ref
  ) => {
    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
      if (reason === 'clickaway') {
        return;
      }

      if (onClose) {
        onClose();
      }
    };

    // 기본 액션 버튼 (닫기)
    const defaultAction = (
      <IconButton size='small' aria-label='close' color='inherit' onClick={handleClose}>
        <CloseIcon fontSize='small' />
      </IconButton>
    );

    // severity가 있는 경우 Alert 컴포넌트 사용
    if (severity) {
      return (
        <Snackbar
          ref={ref}
          open={open}
          autoHideDuration={autoHideDuration}
          onClose={handleClose}
          anchorOrigin={position}
          TransitionComponent={SlideTransition}
          className={className}
          sx={sx}
          {...props}
        >
          <Alert onClose={handleClose} severity={severity} action={action} sx={{ width: '100%' }}>
            {message}
          </Alert>
        </Snackbar>
      );
    }

    // 일반 텍스트 메시지
    return (
      <Snackbar
        ref={ref}
        open={open}
        autoHideDuration={autoHideDuration}
        onClose={handleClose}
        anchorOrigin={position}
        TransitionComponent={SlideTransition}
        message={message}
        action={action || defaultAction}
        className={className}
        sx={sx}
        {...props}
      />
    );
  }
);

Toast.displayName = 'Toast';

export default Toast;
