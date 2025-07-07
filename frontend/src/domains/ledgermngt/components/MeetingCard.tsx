import { useMutation, useQuery } from '@/shared/hooks';
import {
  Category as CategoryIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { Avatar, Box, Card, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material';
import React from 'react';
import { meetingStatusApi } from '../api/meetingStatusApi';

interface MeetingCardProps {
  meetingBodyId: string;
  onEdit?: (id: string) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

/**
 * 새로운 훅을 사용하는 회의체 카드 컴포넌트
 * - useQuery를 사용한 데이터 fetching
 * - useMutation을 사용한 삭제 기능
 */
const MeetingCard: React.FC<MeetingCardProps> = ({
  meetingBodyId,
  onEdit,
  onView,
  onDelete,
  className,
}) => {
  // 새로운 useQuery 훅 사용
  const {
    data: meetings,
    loading,
    error,
    refetch,
  } = useQuery(['meetings'], meetingStatusApi.getAll);

  // 새로운 useMutation 훅 사용
  const {
    mutate: deleteMeeting,
    loading: deleting,
    error: deleteError,
  } = useMutation(meetingStatusApi.delete, {
    onSuccess: () => {
      refetch();
      onDelete?.(meetingBodyId);
    },
  });

  // 현재 회의체 찾기
  const meeting = meetings?.find(m => m.meetingBodyId === meetingBodyId);

  // 로딩 상태
  if (loading) {
    return (
      <Card className={className} sx={{ minHeight: 200 }}>
        <CardContent>
          <Typography variant='body2' color='text.secondary'>
            회의체 정보 로딩 중...
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
            회의체 데이터 로드 실패: {error}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // 회의체를 찾을 수 없음
  if (!meeting) {
    return (
      <Card className={className} sx={{ minHeight: 200, borderColor: 'warning.main' }}>
        <CardContent>
          <Typography variant='body2' color='warning.main'>
            회의체 정보를 찾을 수 없습니다. (ID: {meetingBodyId})
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // 삭제 핸들러
  const handleDelete = () => {
    if (window.confirm(`"${meeting.meetingName}" 회의체를 삭제하시겠습니까?`)) {
      deleteMeeting(meeting.meetingBodyId);
    }
  };

  // 구분에 따른 색상
  const getGubunColor = (gubun: string) => {
    switch (gubun) {
      case '정기회의':
        return 'primary';
      case '임시회의':
        return 'warning';
      case '긴급회의':
        return 'error';
      case '상설회의':
        return 'success';
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
              <GroupIcon fontSize='small' />
            </Avatar>
            <Typography
              variant='h6'
              component='h3'
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              {meeting.meetingName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton
              size='small'
              onClick={() => onView?.(meeting.meetingBodyId)}
              sx={{ color: 'primary.main' }}
            >
              <ViewIcon fontSize='small' />
            </IconButton>
            <IconButton
              size='small'
              onClick={() => onEdit?.(meeting.meetingBodyId)}
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

        {/* 회의체 정보 */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon fontSize='small' color='action' />
            <Typography variant='body2' color='text.secondary'>
              <strong>구분:</strong> {meeting.gubun}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon fontSize='small' color='action' />
            <Typography variant='body2' color='text.secondary'>
              <strong>개최주기:</strong> {meeting.meetingPeriod}
            </Typography>
          </Box>

          <Typography variant='body2' color='text.secondary'>
            <strong>내용:</strong> {meeting.content || '내용 정보 없음'}
          </Typography>

          <Typography variant='body2' color='text.secondary'>
            <strong>등록일:</strong> {new Date(meeting.createdAt).toLocaleDateString()}
          </Typography>

          <Typography variant='body2' color='text.secondary'>
            <strong>수정일:</strong> {new Date(meeting.updatedAt).toLocaleDateString()}
          </Typography>
        </Stack>

        {/* 상태 및 정보 */}
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
              label={meeting.gubun}
              size='small'
              color={getGubunColor(meeting.gubun)}
              variant='filled'
            />
            <Chip label={meeting.meetingPeriod} size='small' color='info' variant='outlined' />
          </Box>

          <Typography variant='caption' color='text.secondary'>
            ID: {meeting.meetingBodyId}
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

export default MeetingCard;
