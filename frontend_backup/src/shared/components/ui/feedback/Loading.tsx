import { Backdrop, Box, CircularProgress, LinearProgress, Paper, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { forwardRef } from 'react';

// Loading 컴포넌트 Props 타입
interface LoadingProps {
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

/**
 * Loading 컴포넌트
 *
 * Material-UI Progress를 기반으로 한 로딩 컴포넌트
 * 원형, 선형 로딩 및 오버레이 지원
 *
 * @example
 * ```tsx
 * // 기본 원형 로딩
 * <Loading />
 *
 * // 메시지가 있는 로딩
 * <Loading message="데이터를 불러오는 중..." />
 *
 * // 오버레이 로딩
 * <Loading overlay backdrop message="처리 중..." />
 *
 * // 선형 진행률 로딩
 * <Loading variant="linear" progress={50} />
 * ```
 */
const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  (
    {
      size = 'medium',
      variant = 'circular',
      color = 'primary',
      overlay = false,
      backdrop = false,
      message,
      progress,
      className,
      sx,
      ...props
    },
    ref
  ) => {
    // 크기 값 계산
    const getSize = () => {
      if (typeof size === 'number') return size;

      switch (size) {
        case 'small':
          return 24;
        case 'large':
          return 64;
        case 'medium':
        default:
          return 40;
      }
    };

    // 로딩 요소 렌더링
    const renderProgress = () => {
      if (variant === 'linear') {
        return (
          <LinearProgress
            variant={typeof progress === 'number' ? 'determinate' : 'indeterminate'}
            value={progress}
            color={color}
            sx={{ width: '100%', mb: message ? 2 : 0 }}
          />
        );
      }

      return (
        <CircularProgress
          size={getSize()}
          variant={typeof progress === 'number' ? 'determinate' : 'indeterminate'}
          value={progress}
          color={color}
          sx={{ mb: message ? 2 : 0 }}
        />
      );
    };

    // 메시지 렌더링
    const renderMessage = () => {
      if (!message) return null;

      return (
        <Typography variant='body2' color='text.secondary' sx={{ textAlign: 'center', mt: 1 }}>
          {message}
        </Typography>
      );
    };

    // 로딩 컨텐츠
    const loadingContent = (
      <Box
        ref={ref}
        display='flex'
        flexDirection='column'
        alignItems='center'
        justifyContent='center'
        className={className}
        sx={sx}
        {...props}
      >
        {renderProgress()}
        {renderMessage()}
      </Box>
    );

    // 오버레이 렌더링
    if (overlay) {
      return (
        <Box
          position='absolute'
          top={0}
          left={0}
          right={0}
          bottom={0}
          display='flex'
          alignItems='center'
          justifyContent='center'
          bgcolor='rgba(255, 255, 255, 0.8)'
          zIndex={1000}
        >
          {backdrop ? (
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {loadingContent}
            </Paper>
          ) : (
            loadingContent
          )}
        </Box>
      );
    }

    // 백드롭 렌더링
    if (backdrop) {
      return (
        <Backdrop
          open={true}
          sx={{
            color: '#fff',
            zIndex: theme => theme.zIndex.drawer + 1,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'background.paper',
            }}
          >
            {loadingContent}
          </Paper>
        </Backdrop>
      );
    }

    return loadingContent;
  }
);

Loading.displayName = 'Loading';

export default Loading;
