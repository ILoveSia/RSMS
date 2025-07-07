import MainLayout from '@/shared/components/layout/MainLayout';
import { useQuery } from '@/shared/hooks';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Alert, Box, Button, Divider, Grid, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import { positionApi } from '../api/positionApi';
import PositionCard from '../components/PositionCard';
import PositionDialog from '../components/PositionDialog';

/**
 * 새로운 훅 패턴을 테스트하는 페이지
 * - PositionCard: 새로운 useQuery, useMutation 훅 사용
 * - PositionDialog: 기존 방식 유지 (호환성 확인)
 */
const PositionCardTestPage: React.FC = () => {
  // 새로운 useQuery 훅 사용
  const {
    data: positions,
    loading,
    error,
    refetch,
  } = useQuery(['positions'], positionApi.getStatusList);

  // Dialog 상태 관리
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);

  // 새로고침 핸들러
  const handleRefresh = () => {
    refetch();
  };

  // 생성 핸들러
  const handleCreate = () => {
    setSelectedPositionId(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  // 편집 핸들러
  const handleEdit = (positionId: number) => {
    setSelectedPositionId(positionId);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  // 조회 핸들러
  const handleView = (positionId: number) => {
    setSelectedPositionId(positionId);
    setDialogMode('view');
    setDialogOpen(true);
  };

  // 삭제 핸들러
  const handleDelete = (positionId: number) => {
    // 추가 후처리 로직 (예: 알림 표시)
  };

  // Dialog 닫기
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedPositionId(null);
  };

  // Dialog 저장 후 데이터 새로고침
  const handleDialogSave = () => {
    refetch();
  };

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        {/* 헤더 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant='h4' component='h1' sx={{ fontWeight: 'bold', mb: 2 }}>
            🧪 직책 카드 테스트 페이지
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
            새로운 훅 패턴(useQuery, useMutation)을 사용하는 PositionCard 컴포넌트를 테스트합니다.
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* 액션 버튼 */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button variant='contained' startIcon={<AddIcon />} onClick={handleCreate} size='small'>
              직책 추가
            </Button>
            <Button
              variant='outlined'
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              size='small'
              disabled={loading}
            >
              새로고침
            </Button>
            <Typography variant='body2' color='text.secondary'>
              총 {positions?.length || 0}개의 직책
            </Typography>
          </Box>
        </Paper>

        {/* 패턴 설명 */}
        <Alert severity='info' sx={{ mb: 3 }}>
          <Typography variant='body2'>
            <strong>새로운 패턴:</strong> 각 카드는 useQuery와 useMutation을 사용하여 독립적으로
            데이터를 관리합니다.
            <br />
            <strong>기존 패턴:</strong> 대화창(Dialog)은 기존 방식을 유지하여 호환성을 확인합니다.
          </Typography>
        </Alert>

        {/* 로딩 상태 */}
        {loading && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant='h6' color='text.secondary'>
              데이터 로딩 중...
            </Typography>
          </Paper>
        )}

        {/* 에러 상태 */}
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            <Typography variant='body2'>
              <strong>데이터 로드 실패:</strong> {error}
            </Typography>
          </Alert>
        )}

        {/* 데이터 없음 */}
        {!loading && !error && (!positions || positions.length === 0) && (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant='h6' color='text.secondary'>
              등록된 직책이 없습니다.
            </Typography>
          </Paper>
        )}

        {/* 직책 카드 그리드 */}
        {!loading && !error && positions && positions.length > 0 && (
          <Grid container spacing={3}>
            {positions.map(position => (
              <Grid item xs={12} sm={6} md={4} key={position.positionsId}>
                <PositionCard
                  positionId={position.positionsId}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* 기존 Dialog 컴포넌트 (호환성 확인) */}
        <PositionDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          onSave={handleDialogSave}
          mode={dialogMode}
          positionId={selectedPositionId}
          onChangeMode={setDialogMode}
        />
      </Box>
    </MainLayout>
  );
};

export default PositionCardTestPage;
