import { Close as CloseIcon } from '@mui/icons-material';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Typography,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import React, { forwardRef, ReactNode } from 'react';

// Modal 컴포넌트 Props 타입 정의
export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  fullScreen?: boolean;
  disableEscapeKeyDown?: boolean;
  disableBackdropClick?: boolean;
  actions?: ReactNode;
  hideCloseButton?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
  id?: string;
  'data-testid'?: string;
  style?: React.CSSProperties;
}

// 슬라이드 트랜지션 컴포넌트 (타입 문제 해결)
const Transition = forwardRef<unknown, any>((props, ref) => {
  return <Slide direction='up' ref={ref} {...props} />;
});

/**
 * Modal 컴포넌트
 *
 * Material-UI Dialog를 기반으로 한 모달 컴포넌트
 * 타이틀, 컨텐츠, 액션 버튼 등을 제공
 *
 * @example
 * ```tsx
 * <Modal
 *   open={isOpen}
 *   onClose={handleClose}
 *   title="확인"
 *   maxWidth="sm"
 *   actions={
 *     <>
 *       <Button onClick={handleClose}>취소</Button>
 *       <Button onClick={handleConfirm} variant="contained">확인</Button>
 *     </>
 *   }
 * >
 *   <Typography>정말 삭제하시겠습니까?</Typography>
 * </Modal>
 * ```
 */
const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      open,
      onClose,
      title,
      children,
      maxWidth = 'sm',
      fullWidth = true,
      fullScreen = false,
      disableEscapeKeyDown = false,
      disableBackdropClick = false,
      actions,
      hideCloseButton = false,
      className,
      sx,
      ...props
    },
    ref
  ) => {
    const handleClose = (event: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
      if (reason === 'backdropClick' && disableBackdropClick) return;
      if (reason === 'escapeKeyDown' && disableEscapeKeyDown) return;
      onClose();
    };

    return (
      <Dialog
        ref={ref}
        open={open}
        onClose={handleClose}
        maxWidth={maxWidth}
        fullWidth={fullWidth}
        fullScreen={fullScreen}
        TransitionComponent={Transition}
        className={className}
        sx={sx}
        {...props}
      >
        {title && (
          <DialogTitle sx={{ m: 0, p: 2 }}>
            <Typography variant='h6' component='div'>
              {title}
            </Typography>
            {!hideCloseButton && (
              <IconButton
                aria-label='close'
                onClick={onClose}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: theme => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </DialogTitle>
        )}

        <DialogContent dividers>{children}</DialogContent>

        {actions && <DialogActions sx={{ p: 2 }}>{actions}</DialogActions>}
      </Dialog>
    );
  }
);

Modal.displayName = 'Modal';

export default Modal;
