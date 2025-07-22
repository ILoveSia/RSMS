import {
  ErrorOutline as ErrorIcon,
  Inbox as InboxIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Alert, Box, Pagination, Paper, Skeleton, Stack, Typography } from '@mui/material';
import { type ReactNode } from 'react';

interface DataListProps<T> {
  data?: T[] | null;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  renderItem: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  className?: string;
  spacing?: number;
  skeletonCount?: number;
}

/**
 * 새로운 패턴을 사용하는 데이터 목록 컴포넌트
 * - 로딩, 에러, 빈 상태 처리
 * - 페이지네이션 지원
 * - 완전히 재사용 가능한 디자인
 */
function DataList<T>({
  data,
  loading = false,
  error = null,
  onRefresh,
  renderItem,
  emptyMessage = '표시할 데이터가 없습니다.',
  emptyIcon = <InboxIcon sx={{ fontSize: 64, color: 'text.secondary' }} />,
  pagination,
  className,
  spacing = 2,
  skeletonCount = 3,
}: DataListProps<T>) {
  // 로딩 상태
  if (loading) {
    return (
      <Box className={className}>
        <Stack spacing={spacing}>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <Paper key={index} sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Skeleton variant='text' width='60%' height={32} />
                <Skeleton variant='text' width='80%' height={20} />
                <Skeleton variant='text' width='40%' height={20} />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Skeleton variant='rectangular' width={60} height={24} />
                  <Skeleton variant='rectangular' width={80} height={24} />
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Box>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Box className={className}>
        <Alert
          severity='error'
          icon={<ErrorIcon />}
          action={onRefresh && <RefreshIcon sx={{ cursor: 'pointer' }} onClick={onRefresh} />}
        >
          <Typography variant='body2'>
            <strong>데이터 로드 실패:</strong> {error}
          </Typography>
          {onRefresh && (
            <Typography variant='caption' display='block' sx={{ mt: 1 }}>
              새로고침 아이콘을 클릭하여 다시 시도하세요.
            </Typography>
          )}
        </Alert>
      </Box>
    );
  }

  // 빈 데이터 상태
  if (!data || data.length === 0) {
    return (
      <Box className={className}>
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: 'background.default',
          }}
        >
          <Stack spacing={2} alignItems='center'>
            {emptyIcon}
            <Typography variant='h6' color='text.secondary'>
              {emptyMessage}
            </Typography>
            {onRefresh && (
              <Typography
                variant='body2'
                color='primary'
                sx={{ cursor: 'pointer' }}
                onClick={onRefresh}
              >
                새로고침
              </Typography>
            )}
          </Stack>
        </Paper>
      </Box>
    );
  }

  // 데이터 목록 렌더링
  return (
    <Box className={className}>
      <Stack spacing={spacing}>
        {data.map((item, index) => (
          <Box key={index}>{renderItem(item, index)}</Box>
        ))}
      </Stack>

      {/* 페이지네이션 */}
      {pagination && pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={(_, page) => pagination.onPageChange(page)}
            color='primary'
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}

export default DataList;
