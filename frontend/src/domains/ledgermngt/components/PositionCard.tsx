import { useMutation, useQuery } from '@/shared/hooks';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { Box, Card, CardContent, Chip, IconButton, Typography } from '@mui/material';
import React from 'react';
import { positionApi } from '../api/positionApi';

interface PositionCardProps {
  positionId: number;
  onEdit?: (positionId: number) => void;
  onView?: (positionId: number) => void;
  onDelete?: (positionId: number) => void;
  className?: string;
}

/**
 * 새로운 훅을 사용하는 Position 카드 컴포넌트
 * - useQuery를 사용한 데이터 fetching
 * - useMutation을 사용한 삭제 기능
 */
const PositionCard: React.FC<PositionCardProps> = ({
  positionId,
  onEdit,
  onView,
  onDelete,
  className,
}) => {
  // 새로운 useQuery 훅 사용
  const {
    data: positions,
    loading,
    error,
    refetch,
  } = useQuery(['positions'], positionApi.getStatusList);

  // 새로운 useMutation 훅 사용
  const {
    mutate: deletePosition,
    loading: deleting,
    error: deleteError,
  } = useMutation(positionApi.deleteBulk, {
    onSuccess: () => {
      refetch(); // 삭제 후 목록 새로고침
      onDelete?.(positionId);
    },
  });

  // 현재 포지션 찾기
  const position = positions?.find(p => p.positionsId === positionId);

  // 로딩 상태
  if (loading) {
    return (
      <Card className={className} sx={{ minHeight: 150 }}>
        <CardContent>
          <Typography variant='body2' color='text.secondary'>
            로딩 중...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <Card className={className} sx={{ minHeight: 150, borderColor: 'error.main' }}>
        <CardContent>
          <Typography variant='body2' color='error'>
            데이터 로드 실패: {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // 포지션을 찾을 수 없음
  if (!position) {
    return (
      <Card className={className} sx={{ minHeight: 150, borderColor: 'warning.main' }}>
        <CardContent>
          <Typography variant='body2' color='warning.main'>
            직책 정보를 찾을 수 없습니다. (ID: {positionId})
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // 삭제 핸들러
  const handleDelete = () => {
    if (window.confirm(`"${position.positionsNm}" 직책을 삭제하시겠습니까?`)) {
      deletePosition([position.positionsId]);
    }
  };

  return (
    <Card
      className={className}
      sx={{
        minHeight: 150,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
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
            {position.positionsNm}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size='small'
              onClick={() => onView?.(position.positionsId)}
              sx={{ color: 'primary.main' }}
            >
              <ViewIcon fontSize='small' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => onEdit?.(position.positionsId)}
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

        {/* 정보 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            <strong>작성부서:</strong> {position.writeDeptNm}
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            <strong>소관부서:</strong> {position.ownerDeptNms}
          </Typography>
        </Box>

        {/* 통계 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            label={`관리자 ${position.adminCount}명`}
            size='small'
            variant='outlined'
            color={position.adminCount > 0 ? 'success' : 'default'}
          />
          <Typography variant='caption' color='text.secondary'>
            ID: {position.positionsId}
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

export default PositionCard;
