import { useMutation, useQuery } from '@/shared/hooks';
import {
  Assignment as AssignmentIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { Box, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';
import { responsibilityApi } from '../api/responsibilityApi';

interface ResponsibilityCardProps {
  responsibilityId: number;
  onEdit?: (id: number) => void;
  onView?: (id: number) => void;
  onDelete?: (id: number) => void;
  className?: string;
}

/**
 * 새로운 훅을 사용하는 책무 카드 컴포넌트
 * - useQuery를 사용한 데이터 fetching
 * - useMutation을 사용한 삭제 기능
 */
const ResponsibilityCard: React.FC<ResponsibilityCardProps> = ({
  responsibilityId,
  onEdit,
  onView,
  onDelete,
  className,
}) => {
  // 새로운 useQuery 훅 사용
  const {
    data: responsibilities,
    loading,
    error,
    refetch,
  } = useQuery(['responsibilities'], responsibilityApi.getStatusList);

  // 새로운 useMutation 훅 사용
  const {
    mutate: deleteResponsibility,
    loading: deleting,
    error: deleteError,
  } = useMutation(responsibilityApi.delete, {
    onSuccess: () => {
      refetch();
      onDelete?.(responsibilityId);
    },
  });

  // 현재 책무 찾기
  const responsibility = responsibilities?.find(r => r.responsibilityId === responsibilityId);

  // 로딩 상태
  if (loading) {
    return (
      <Card className={className} sx={{ minHeight: 200 }}>
        <CardContent>
          <Typography variant='body2' color='text.secondary'>
            책무 정보 로딩 중...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card className={className} sx={{ minHeight: 200, borderColor: 'error.main' }}>
        <CardContent>
          <Typography variant='body2' color='error'>
            책무 데이터 로드 실패: {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // 책무를 찾을 수 없음
  if (!responsibility) {
    return (
      <Card className={className} sx={{ minHeight: 200, borderColor: 'warning.main' }}>
        <CardContent>
          <Typography variant='body2' color='warning.main'>
            책무 정보를 찾을 수 없습니다. (ID: {responsibilityId})
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // 삭제 핸들러
  const handleDelete = () => {
    if (window.confirm(`"${responsibility.responsibilityContent}" 책무를 삭제하시겠습니까?`)) {
      deleteResponsibility(responsibility.responsibilityId);
    }
  };

  // 진행 상태에 따른 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'warning';
      case 'PENDING':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Card
      className={className}
      sx={{
        minHeight: 200,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        {/* 헤더 */}
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
        >
          <Typography
            variant='h6'
            component='h3'
            sx={{ fontWeight: 'bold', color: 'primary.main' }}
          >
            <AssignmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            {responsibility.responsibilityContent}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size='small'
              onClick={() => onView?.(responsibility.responsibilityId)}
              sx={{ color: 'primary.main' }}
            >
              <ViewIcon fontSize='small' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => onEdit?.(responsibility.responsibilityId)}
              sx={{ color: 'warning.main' }}
            >
              <EditIcon fontSize='small' />
            </IconButton>
            <IconButton
              size='small'
              onClick={handleDelete}
              disabled={deleting}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize='small' />
            </IconButton>
          </Box>
        </Box>

        {/* 책무 정보 */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant='body2' color='text.secondary'>
            <strong>상세 내용:</strong>{' '}
            {responsibility.responsibilityDetailContent || '상세 내용 없음'}
          </Typography>

          <Typography variant='body2' color='text.secondary'>
            <strong>관련 증거:</strong> {responsibility.responsibilityRelEvid || '관련 증거 없음'}
          </Typography>

          <Typography variant='body2' color='text.secondary'>
            <strong>등록일:</strong> {new Date(responsibility.createdAt).toLocaleDateString()}
          </Typography>

          <Typography variant='body2' color='text.secondary'>
            <strong>수정일:</strong> {new Date(responsibility.updatedAt).toLocaleDateString()}
          </Typography>
        </Stack>

        {/* 상태 및 통계 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={responsibility.responsibilityMgtSts}
              size='small'
              color={getStatusColor(responsibility.responsibilityMgtSts)}
              variant='outlined'
            />
            <Chip
              label={`상세 ID: ${responsibility.responsibilityDetailId}`}
              size='small'
              variant='outlined'
              color='info'
            />
          </Box>

          <Typography variant='caption' color='text.secondary'>
            ID: {responsibility.responsibilityId}
          </Typography>
        </Box>

        {/* 에러 메시지 */}
        {deleteError && (
          <Typography variant='body2' color='error' sx={{ mt: 1 }}>
            삭제 실패: {deleteError}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ResponsibilityCard;
