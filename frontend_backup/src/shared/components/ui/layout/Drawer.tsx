import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Divider,
  IconButton,
  Drawer as MuiDrawer,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { forwardRef } from 'react';

// DrawerProps 타입 정의
export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  variant?: 'permanent' | 'persistent' | 'temporary';
  width?: number | string;
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  hideCloseButton?: boolean;
  disableBackdropClick?: boolean;
  elevation?: number;
  keepMounted?: boolean;
  className?: string;
  sx?: any;
}

/**
 * Drawer 컴포넌트
 *
 * Material-UI Drawer를 기반으로 한 드로어 컴포넌트
 * 다양한 위치, 제목, 액션 버튼 등을 제공
 *
 * @example
 * ```tsx
 * // 기본 드로어
 * <Drawer
 *   open={isOpen}
 *   onClose={handleClose}
 *   title="설정"
 * >
 *   <Typography>드로어 내용</Typography>
 * </Drawer>
 *
 * // 오른쪽 드로어
 * <Drawer
 *   open={isOpen}
 *   onClose={handleClose}
 *   anchor="right"
 *   width={400}
 *   title="상세 정보"
 *   actions={<Button>저장</Button>}
 * >
 *   <Typography>상세 내용</Typography>
 * </Drawer>
 * ```
 */
const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      onClose,
      anchor = 'left',
      variant = 'temporary',
      width = 300,
      title,
      children,
      actions,
      hideCloseButton = false,
      disableBackdropClick = false,
      elevation = 16,
      keepMounted = false,
      className,
      sx,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // 백드롭 클릭 처리
    const handleBackdropClick = (event: React.MouseEvent) => {
      if (disableBackdropClick) return;
      onClose();
    };

    // 드로어 너비 계산
    const getDrawerWidth = () => {
      if (isMobile && (anchor === 'left' || anchor === 'right')) {
        return '100vw';
      }
      return typeof width === 'number' ? `${width}px` : width;
    };

    // 드로어 높이 계산
    const getDrawerHeight = () => {
      if (anchor === 'top' || anchor === 'bottom') {
        return typeof width === 'number' ? `${width}px` : width;
      }
      return '100vh';
    };

    // 헤더 렌더링
    const renderHeader = () => {
      if (!title && !actions && hideCloseButton) return null;

      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            minHeight: 56,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {title && (
              <Typography variant='h6' component='h2' sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {actions}
            {!hideCloseButton && (
              <IconButton onClick={onClose} sx={{ ml: 1 }} aria-label='close'>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      );
    };

    // 컨텐츠 렌더링
    const renderContent = () => {
      return (
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            pt: title || actions || !hideCloseButton ? 0 : 2,
          }}
        >
          {children}
        </Box>
      );
    };

    // 드로어 스타일
    const drawerSx = {
      width: anchor === 'left' || anchor === 'right' ? getDrawerWidth() : '100%',
      height: anchor === 'top' || anchor === 'bottom' ? getDrawerHeight() : '100%',
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: anchor === 'left' || anchor === 'right' ? getDrawerWidth() : '100%',
        height: anchor === 'top' || anchor === 'bottom' ? getDrawerHeight() : '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
      },
      ...sx,
    };

    return (
      <MuiDrawer
        ref={ref}
        open={open}
        onClose={onClose}
        anchor={anchor}
        variant={variant}
        elevation={elevation}
        keepMounted={keepMounted}
        className={className}
        sx={drawerSx}
        ModalProps={{
          keepMounted: keepMounted,
          ...(disableBackdropClick && {
            onBackdropClick: handleBackdropClick,
          }),
        }}
        {...props}
      >
        {renderHeader()}
        {(title || actions || !hideCloseButton) && <Divider />}
        {renderContent()}
      </MuiDrawer>
    );
  }
);

Drawer.displayName = 'Drawer';

export default Drawer;
