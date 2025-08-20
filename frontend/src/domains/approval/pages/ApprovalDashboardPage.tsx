/**
 * 결재 대시보드 페이지
 * 결재 현황 요약과 중요한 결재 목록을 한눈에 확인할 수 있는 대시보드입니다.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ApprovalSummaryCards } from '@/shared/components/ui/data-display/';
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
import { useApiWithNotification } from '@/shared/hooks';
import '../../../assets/scss/style.css';

// LoginUser 타입 (loginStore용)
interface LoginUser {
  userid: string;
  username: string;
  email: string;
  empNo: string;     // 사번 (employee.emp_no)
  deptCd: string;    // 부서코드 (employee.dept_code)
  positionCode: string; // 직급코드 (employee.position_code)
  role?: string;
  accessibleMenus?: any[];
}

// 결재 단계 타입 정의
interface ApprovalStep {
  stepId: number;
  approverId: string;
  status: string;
}

// 결재 상세 데이터 타입 정의
interface ApprovalDetail {
  approvalId: number;
  steps: ApprovalStep[];
  [key: string]: any;
}

/**
 * 결재 대시보드 페이지
 */
const ApprovalDashboardPage: React.FC = () => {
  // API 알림 훅
  const { callApiWithNotification } = useApiWithNotification({
    showSuccessOnLoad: true,
    errorMessage: '대시보드 데이터를 불러오는 중 오류가 발생했습니다.',
  });

  // 로그인 사용자 정보 가져오기
  const { data: loginData } = useReduxState<LoginUser>('loginStore/login');
  const currentUserId = loginData?.userid;

  // 공통코드 가져오기
  const allCodes = useCommonCodes();

  // 상태 관리
  const [summary, setSummary] = useState<ApprovalSummaryResponse | null>(null);
  const [urgentApprovals, setUrgentApprovals] = useState<ApprovalListResponse[]>([]);
  const [myPendingApprovals, setMyPendingApprovals] = useState<ApprovalListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 다이얼로그 상태
  const [selectedApproval, setSelectedApproval] = useState<ApprovalDetail | null>(null);
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

    setLoading(true);
    setError(null);

    try {
      // 병렬로 대시보드 데이터 로드
      const [summaryData, pendingData, allData] = await callApiWithNotification(
        async () => {
          const results = await Promise.all([
            approvalApi.getApprovalSummary(currentUserId),
            approvalApi.getMyPendingApprovals(currentUserId),
            approvalApi.getAllApprovals(),
          ]);
          return results;
        },
        'success_load'
      );

      if (summaryData && pendingData && allData) {
        setSummary(summaryData);
        setMyPendingApprovals(pendingData || []);
        
        // 긴급 결재만 필터링 (최근 5건)
        const urgentData = (allData || [])
          .filter(item => item.urgency === 'URGENT')
          .slice(0, 5);
        setUrgentApprovals(urgentData);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUserId, callApiWithNotification]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // 결재 상세 보기
  const handleViewDetail = async (approvalId: number) => {
    const detail = await callApiWithNotification(
      () => approvalApi.getApprovalDetail(approvalId),
      'custom'
    );
    
    if (detail) {
      setSelectedApproval(detail);
      setStatusDialogOpen(true);
    }
  };

  // 인라인 결재 처리
  const handleInlineProcess = async (approvalId: number, action: 'approve' | 'reject') => {
    const detail = await callApiWithNotification(
      () => approvalApi.getApprovalDetail(approvalId),
      'custom'
    );
    
    if (detail) {
      setSelectedApproval(detail);
      setProcessAction(action);
      setProcessDialogOpen(true);
    }
  };

  // 결재 처리 확인
  const handleProcessConfirm = async (comments: string) => {
    if (!selectedApproval || !currentUserId) return;

    try {
      // 내가 처리해야 할 단계 찾기
      const myStep = selectedApproval.steps.find(
        (step: ApprovalStep) => step.approverId === currentUserId && step.status === 'PENDING'
      );
      
      if (!myStep?.stepId) {
        await callApiWithNotification(
          () => Promise.reject(new Error('처리할 수 있는 결재 단계를 찾을 수 없습니다.')),
          'custom'
        );
        return;
      }

      // 결재 처리 API 호출
      await callApiWithNotification(
        () => approvalApi.processApproval({
          stepId: myStep.stepId,
          action: processAction,
          comments: comments,
        }),
        'custom'
      );

      setProcessDialogOpen(false);
      loadDashboardData(); // 데이터 새로고침
      
    } catch (error) {
      // 에러는 callApiWithNotification에서 자동 처리됨
      console.error('결재 처리 실패:', error);
    }
  };

  // 내 결재 대기 목록 컬럼
  const pendingColumns: DataGridColumn<ApprovalListResponse>[] = [
    {
      field: 'taskTitle',
      headerName: '업무명',
      width: 250,
      renderCell: ({ value, row }) => {
        // taskTitle을 TASK_TYPE 공통코드로 변환
        const taskTypeCd = row.taskTypeCd || '';
        const taskTypeName = getCodeNameSync(allCodes, 'TASK_TYPE', String(taskTypeCd));
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
          {value && typeof value === 'string' ? new Date(value).toLocaleDateString() : '해당없음'}
        </Typography>
      ),
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'approvalId',
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
        const taskTypeCd = row.taskTypeCd || '';
        const taskTypeName = getCodeNameSync(allCodes, 'TASK_TYPE', String(taskTypeCd));
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
      field: 'approvalId',
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
            <ApprovalSummaryCards summary={summary} />

            {/* 결재 목록 영역 - 양옆 배치 */}
            <Box sx={{ px: 2, mb: 1 }}>
              <Grid container spacing={2}>
                {/* 내 결재 대기 목록 - 왼쪽 */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ border: '1px solid var(--bank-border)', borderRadius: 2, height: '100%' }}>
                    <CardContent sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                        <Box sx={{ flex: 1, minHeight: 500 }}>
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
                              height: '100%',
                              minHeight: 500,
                              '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: 'var(--bank-bg-secondary) !important',
                                fontWeight: 'bold',
                              },
                              '& .MuiDataGrid-row': {
                                cursor: 'pointer',
                              },
                            }}
                          />
                        </Box>
                      ) : (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 4, 
                          flex: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: 500 
                        }}>
                          <HourglassEmptyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1, alignSelf: 'center' }} />
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
                </Grid>

                {/* 긴급 결재 목록 - 오른쪽 */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ border: '1px solid var(--bank-border)', borderRadius: 2, height: '100%' }}>
                    <CardContent sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                        <Box sx={{ flex: 1, minHeight: 500 }}>
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
                              height: '100%',
                              minHeight: 500,
                              '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: 'var(--bank-bg-secondary) !important',
                                fontWeight: 'bold',
                              },
                              '& .MuiDataGrid-row': {
                                cursor: 'pointer',
                              },
                            }}
                          />
                        </Box>
                      ) : (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 4, 
                          flex: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: 500 
                        }}>
                          <WarningIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1, alignSelf: 'center' }} />
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
                </Grid>
              </Grid>
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
      </PageContent>
    </PageContainer>
  );
};

export default ApprovalDashboardPage;