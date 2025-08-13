/**
 * 결재 대시보드 페이지
 * 결재 현황 요약과 중요한 결재 목록을 한눈에 확인할 수 있는 대시보드입니다.
 */
import React, { useState, useEffect, useCallback } from 'react';
import ManagementButtonGroup from '@/shared/components/ui/button/ManagementButtonGroup';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  Snackbar,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { DataGrid } from '@/shared/components/ui/data-display';
import { SearchConditionPanel } from '@/shared/components/ui/form';
import type { DataGridColumn } from '@/shared/types/common';
import approvalApi, {
  type ApprovalSummaryResponse,
  type ApprovalListResponse,
} from '../api/approvalApi';
import ApprovalStatusDialog from '@/shared/components/approval/ApprovalStatusDialog';
import InlineApprovalDialog from '@/shared/components/approval/InlineApprovalDialog';
import { useReduxState } from '@/app/store/use-store';
import { useCommonCodes, getCodeNameSync } from '@/shared/utils/codeUtils';
import '../../../assets/scss/style.css';

// LoginUser 타입 (loginStore용)
interface LoginUser {
  userid: string;
  username: string;
  email: string;
  role?: string;
}

/**
 * 결재 대시보드 페이지
 */
const ApprovalDashboardPage: React.FC = () => {
  // 로그인 사용자 정보 가져오기
  const { data: loginData } = useReduxState<LoginUser>('loginStore/login');
  const currentUserId = loginData?.userid;

  // 공통코드 가져오기
  const allCodes = useCommonCodes();

  console.log('🔍 ApprovalDashboardPage - 로그인 사용자 정보:', {
    loginData,
    currentUserId,
    hasLoginData: !!loginData,
  });

  // 상태 관리
  const [summary, setSummary] = useState<ApprovalSummaryResponse | null>(null);
  const [urgentApprovals, setUrgentApprovals] = useState<ApprovalListResponse[]>([]);
  const [myPendingApprovals, setMyPendingApprovals] = useState<ApprovalListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 다이얼로그 상태
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processAction, setProcessAction] = useState<'approve' | 'reject'>('approve');

  // 대시보드 데이터 로드
  const loadDashboardData = useCallback(async () => {
    // 로그인 사용자 정보가 없으면 로드하지 않음
    if (!currentUserId) {
      console.warn('⚠️ currentUserId가 없어서 대시보드 데이터를 로드하지 않습니다.');
      setError('로그인 정보를 불러올 수 없습니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📊 대시보드 데이터 로드 시작 - currentUserId:', currentUserId);

      // 병렬로 대시보드 데이터 로드
      const [summaryData, pendingData, allData] = await Promise.all([
        approvalApi.getApprovalSummary(currentUserId),
        approvalApi.getMyPendingApprovals(currentUserId),
        approvalApi.getAllApprovals(),
      ]);

      console.log('📊 API 응답 데이터:', {
        summaryData,
        pendingDataCount: pendingData?.length || 0,
        pendingData,
        allDataCount: allData?.length || 0
      });

      setSummary(summaryData);
      setMyPendingApprovals(pendingData || []);
      
      // 긴급 결재만 필터링 (최근 5건)
      const urgentData = (allData || [])
        .filter(item => item.urgency === 'URGENT')
        .slice(0, 5);
      setUrgentApprovals(urgentData);
      
      setSuccessMessage('대시보드 데이터를 성공적으로 불러왔습니다.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('대시보드 데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);


  // 결재 상세 보기
  const handleViewDetail = async (approvalId: number) => {
    try {
      const detail = await approvalApi.getApprovalDetail(approvalId);
      setSelectedApproval(detail);
      setStatusDialogOpen(true);
    } catch (err) {
      console.error('결재 상세 조회 실패:', err);
      alert('결재 상세 정보를 불러오는데 실패했습니다.');
    }
  };

  // 인라인 결재 처리
  const handleInlineProcess = async (approvalId: number, action: 'approve' | 'reject') => {
    try {
      const detail = await approvalApi.getApprovalDetail(approvalId);
      setSelectedApproval(detail);
      setProcessAction(action);
      setProcessDialogOpen(true);
    } catch (err) {
      console.error('결재 상세 조회 실패:', err);
      alert('결재 정보를 불러오는데 실패했습니다.');
    }
  };

  // 결재 처리 확인
  const handleProcessConfirm = async (comments: string) => {
    if (!selectedApproval) return;

    try {
      // 내가 처리해야 할 단계 찾기
      const myStep = selectedApproval.steps.find(
        step => step.approverId === currentUserId && step.status === 'PENDING'
      );
      
      if (!myStep?.stepId) {
        throw new Error('처리할 수 있는 결재 단계를 찾을 수 없습니다.');
      }

      // 결재 처리 API 호출
      await approvalApi.processApproval({
        stepId: myStep.stepId,
        action: processAction,
        comments: comments,
      });

      setProcessDialogOpen(false);
      loadDashboardData(); // 데이터 새로고침
      
      setSuccessMessage(`결재가 성공적으로 ${processAction === 'approve' ? '승인' : '반려'}되었습니다.`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
    } catch (error) {
      console.error('결재 처리 실패:', error);
      alert(`결재 처리에 실패했습니다: ${error}`);
    }
  };

  // 요약 카드 데이터
  const summaryCards = summary ? [
    {
      title: '내 결재 대기',
      value: summary.myPendingCount,
      color: 'warning' as const,
      icon: <NotificationsIcon />,
      description: '처리해야 할 결재',
    },
    {
      title: '전체 결재',
      value: summary.totalCount,
      color: 'info' as const,
      icon: <AssignmentIcon />,
      description: '전체 결재 건수',
    },
    {
      title: '승인 완료',
      value: summary.approvedCount,
      color: 'success' as const,
      icon: <CheckCircleIcon />,
      description: '승인된 결재',
    },
    {
      title: '반려',
      value: summary.rejectedCount,
      color: 'error' as const,
      icon: <CancelIcon />,
      description: '반려된 결재',
    },
  ] : [];

  // 내 결재 대기 목록 컬럼
  const pendingColumns: DataGridColumn<ApprovalListResponse>[] = [
    {
      field: 'taskTitle',
      headerName: '업무명',
      width: 250,
      renderCell: ({ value, row }) => {
        // taskTitle을 TASK_TYPE 공통코드로 변환
        const taskTypeName = getCodeNameSync(allCodes, 'TASK_TYPE', row.taskTypeCd || value);
        return (
          <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#1976d2', cursor: 'pointer' }}>
            {taskTypeName}
          </Typography>
        );
      },
      flex: 1,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'requesterName',
      headerName: '요청자',
      width: 100,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'currentStep',
      headerName: '단계',
      width: 80,
      renderCell: ({ value, row }) => (
        <Chip
          size="small"
          label={`${value}/${row.totalSteps}차`}
          color="warning"
        />
      ),
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'requestDateTime',
      headerName: '요청일시',
      width: 120,
      renderCell: ({ value }) => (
        <Typography variant="caption">
          {value ? new Date(value).toLocaleDateString() : '해당없음'}
        </Typography>
      ),
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: '처리',
      width: 140,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={() => handleInlineProcess(row.approvalId, 'approve')}
          >
            승인
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => handleInlineProcess(row.approvalId, 'reject')}
          >
            반려
          </Button>
        </Box>
      ),
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
  ];

  // 긴급 결재 목록 컬럼
  const urgentColumns: DataGridColumn<ApprovalListResponse>[] = [
    {
      field: 'taskTitle',
      headerName: '업무명',
      width: 200,
      renderCell: ({ value, row }) => {
        // taskTitle을 TASK_TYPE 공통코드로 변환
        const taskTypeName = getCodeNameSync(allCodes, 'TASK_TYPE', row.taskTypeCd || value);
        return (
          <Typography 
            variant="body2" 
            sx={{ fontWeight: 'medium', cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }}
            onClick={() => handleViewDetail(row.approvalId)}
          >
            {taskTypeName}
          </Typography>
        );
      },
      flex: 1,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'requesterName',
      headerName: '요청자',
      width: 100,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'statusName',
      headerName: '상태',
      width: 100,
      renderCell: ({ value, row }) => {
        const getColor = (status: string) => {
          switch (status) {
            case 'SUBMITTED':
            case 'IN_PROGRESS':
              return 'warning';
            case 'APPROVED':
              return 'success';
            case 'REJECTED':
              return 'error';
            case 'CANCELLED':
              return 'default';
            default:
              return 'info';
          }
        };
        return (
          <Chip
            size="small"
            label={value}
            color={getColor(row.status) as any}
          />
        );
      },
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'requestDateTime',
      headerName: '요청일시',
      width: 120,
      renderCell: ({ value }) => (
        <Typography variant="caption">
          {value && typeof value === 'string' ? new Date(value).toLocaleDateString() : '해당없음'}
        </Typography>
      ),
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: '상세보기',
      width: 80,
      renderCell: ({ row }) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleViewDetail(row.approvalId)}
        >
          상세
        </Button>
      ),
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
  ];

  return (
    <PageContainer
      sx={{
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
      }}
    >
      <PageHeader
        title="[결재관리] 결재 대시보드"
        icon={<DashboardIcon />}
        description="결재 현황을 한눈에 확인하고 관리합니다."
        elevation={false}
        sx={{
          position: 'relative',
          zIndex: 1,
          flexShrink: 0,
        }}
      />

      <PageContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
          minHeight: 0,
          position: 'relative',
          py: 1,
        }}
      >

        {error && (
          <Alert severity="error" sx={{ mb: 2, mx: 2 }}>
            {error}
          </Alert>
        )}

        {!currentUserId && (
          <Alert severity="warning" sx={{ mb: 2, mx: 2 }}>
            로그인 정보를 확인 중입니다. 잠시만 기다려주세요.
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              데이터를 불러오는 중...
            </Typography>
          </Box>
        ) : (
          <>
            {/* 요약 카드 영역 */}
            <Box sx={{ px: 2, mb: 3 }}>
              <Grid container spacing={1.5}>
                {summaryCards.map((card, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card 
                      sx={{ 
                        border: '1px solid var(--bank-border)',
                        borderRadius: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          boxShadow: 2,
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <CardContent sx={{ p: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box>
                            <Typography 
                              variant="h5" 
                              color={`${card.color}.main`}
                              sx={{ fontWeight: 'bold' }}
                            >
                              {card.value.toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              {card.title}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {card.description}
                            </Typography>
                          </Box>
                          <Box sx={{ color: `${card.color}.main`, fontSize: 32 }}>
                            {card.icon}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* 내 결재 대기 목록 */}
            <Box sx={{ px: 2, mb: 3 }}>
              <Card sx={{ border: '1px solid var(--bank-border)', borderRadius: 2 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HourglassEmptyIcon color="warning" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        내 결재 대기 목록
                      </Typography>
                    </Box>
                    <Chip
                      label={`${myPendingApprovals.length}건`}
                      color="warning"
                      size="small"
                    />
                  </Box>
                  <Divider sx={{ mb: 1.5 }} />
                  
                  {myPendingApprovals.length > 0 ? (
                    <DataGrid
                      data={myPendingApprovals}
                      columns={pendingColumns}
                      loading={loading}
                      error={null}
                      selectable={false}
                      multiSelect={false}
                      rowIdField="approvalId"
                      sx={{
                        width: '100%',
                        height: '200px',
                        '& .MuiDataGrid-columnHeaders': {
                          backgroundColor: 'var(--bank-bg-secondary) !important',
                          fontWeight: 'bold',
                        },
                        '& .MuiDataGrid-row': {
                          cursor: 'pointer',
                        },
                      }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <HourglassEmptyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body1" color="textSecondary" gutterBottom>
                        결재 대기 중인 항목이 없습니다
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        새로운 결재 요청이 있으면 여기에 표시됩니다.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* 긴급 결재 목록 */}
            <Box sx={{ px: 2, mb: 1 }}>
              <Card sx={{ border: '1px solid var(--bank-border)', borderRadius: 2 }}>
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon color="error" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        긴급 결재 목록
                      </Typography>
                    </Box>
                    <Chip
                      label={`${urgentApprovals.length}건`}
                      color="error"
                      size="small"
                    />
                  </Box>
                  <Divider sx={{ mb: 1.5 }} />
                  
                  {urgentApprovals.length > 0 ? (
                    <DataGrid
                      data={urgentApprovals}
                      columns={urgentColumns}
                      loading={loading}
                      error={null}
                      selectable={false}
                      multiSelect={false}
                      rowIdField="approvalId"
                      sx={{
                        width: '100%',
                        height: '220px',
                        '& .MuiDataGrid-columnHeaders': {
                          backgroundColor: 'var(--bank-bg-secondary) !important',
                          fontWeight: 'bold',
                        },
                        '& .MuiDataGrid-row': {
                          cursor: 'pointer',
                        },
                      }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <WarningIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                      <Typography variant="body1" color="textSecondary" gutterBottom>
                        긴급 결재가 없습니다
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        긴급 결재가 있으면 여기에 표시됩니다.
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </>
        )}

        {/* 결재 상세 다이얼로그 */}
        {selectedApproval && (
          <ApprovalStatusDialog
            open={statusDialogOpen}
            approvalData={selectedApproval}
            onClose={() => {
              setStatusDialogOpen(false);
              setSelectedApproval(null);
            }}
          />
        )}

        {/* 인라인 결재 처리 다이얼로그 */}
        {selectedApproval && (
          <InlineApprovalDialog
            open={processDialogOpen}
            approvalData={selectedApproval}
            action={processAction}
            onClose={() => {
              setProcessDialogOpen(false);
              setSelectedApproval(null);
            }}
            onConfirm={handleProcessConfirm}
          />
        )}

        {/* 성공 알림 */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={2000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success">
            {successMessage}
          </Alert>
        </Snackbar>
      </PageContent>
    </PageContainer>
  );
};

export default ApprovalDashboardPage;