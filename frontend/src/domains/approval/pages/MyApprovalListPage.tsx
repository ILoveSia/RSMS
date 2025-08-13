/**
 * 내 결재 목록 페이지
 * 내가 처리해야 할 결재 및 처리한 결재 목록을 표시합니다.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { DataGrid } from '@/shared/components/ui/data-display';
import { SearchConditionPanel } from '@/shared/components/ui/form';
import { ExcelDownloadButton } from '@/shared/components/ui/button';
import SearchButton from '@/shared/components/ui/button/SearchButton';
import type { DataGridColumn } from '@/shared/types/common';
import approvalApi, {
  type ApprovalListResponse,
  type ApprovalStatusResponse,
} from '../api/approvalApi';
import ApprovalStatusDialog from '@/shared/components/approval/ApprovalStatusDialog';
import InlineApprovalDialog from '@/shared/components/approval/InlineApprovalDialog';
import { useReduxState } from '@/app/store/use-store';
import { useCommonCodes, getCodeNameSync } from '@/shared/utils/codeUtils';
import '../../../assets/scss/style.css';

// 결재 상태 옵션
const STATUS_OPTIONS = [
  { value: 'ALL', label: '전체' },
  { value: 'PENDING', label: '결재 대기' },
  { value: 'APPROVED', label: '승인 완료' },
  { value: 'REJECTED', label: '반려' },
];

// LoginUser 타입 (loginStore용)
interface LoginUser {
  userid: string;
  username: string;
  email: string;
  role?: string;
}

/**
 * 내 결재 목록 페이지
 */
const MyApprovalListPage: React.FC = () => {
  // 로그인 사용자 정보 가져오기
  const { data: loginData } = useReduxState<LoginUser>('loginStore/login');
  const currentUserId = loginData?.userid;

  // 공통코드 가져오기
  const allCodes = useCommonCodes();

  console.log('🔍 MyApprovalListPage - 로그인 사용자 정보:', {
    loginData,
    currentUserId,
    hasLoginData: !!loginData,
  });
  // 상태 관리
  const [approvals, setApprovals] = useState<ApprovalListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // 다이얼로그 상태
  const [selectedApproval, setSelectedApproval] = useState<ApprovalStatusResponse | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [processAction, setProcessAction] = useState<'approve' | 'reject'>('approve');

  // 데이터 로드
  const loadApprovalData = useCallback(async () => {
    // 로그인 사용자 정보가 없으면 로드하지 않음
    if (!currentUserId) {
      console.warn('⚠️ currentUserId가 없어서 결재 목록을 로드하지 않습니다.');
      return;
    }

    try {
      setLoading(true);

      let data: ApprovalListResponse[] = [];
      
      if (selectedStatus === 'ALL') {
        // 전체 조회 - 모든 상태의 결재 목록
        const [pendingData, requestedData] = await Promise.all([
          approvalApi.getMyPendingApprovals(currentUserId),
          approvalApi.getMyRequestedApprovals(currentUserId),
        ]);
        data = [...pendingData, ...requestedData];
      } else if (selectedStatus === 'PENDING') {
        // 결재 대기만 조회
        data = await approvalApi.getMyPendingApprovals(currentUserId);
      } else {
        // 승인 완료 또는 반려만 조회
        const requestedData = await approvalApi.getMyRequestedApprovals(currentUserId);
        data = requestedData.filter(item => item.status === selectedStatus);
      }

      setApprovals(data);
      
      setSuccessMessage('결재 목록을 성공적으로 불러왔습니다.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('결재 목록 로드 실패:', err);
      alert('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [currentUserId, selectedStatus]);

  // 컴포넌트 마운트 시 및 상태 변경 시 데이터 로드
  useEffect(() => {
    loadApprovalData();
  }, [loadApprovalData]);

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = useCallback(async () => {
  }, [selectedStatus, approvals.length]);

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
      loadApprovalData(); // 데이터 새로고침
      
      setSuccessMessage(`결재가 성공적으로 ${processAction === 'approve' ? '승인' : '반려'}되었습니다.`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
    } catch (error) {
      console.error('결재 처리 실패:', error);
      alert(`결재 처리에 실패했습니다: ${error}`);
    }
  };

  // 통합 컬럼 정의 (상태에 따라 동적으로 표시)
  const columns: DataGridColumn<ApprovalListResponse & { actions?: any }>[] = [
    {
      field: 'taskTitle',
      headerName: '업무명',
      width: 280,
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
      width: 120,
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
      field: 'currentStep',
      headerName: '진행단계',
      width: 120,
      renderCell: ({ value, row }) => (
        row.status === 'IN_PROGRESS' ? (
          <Box>
            <Typography variant="caption">
              {value}/{row.totalSteps}차
            </Typography>
            {row.currentApproverName && (
              <Typography variant="caption" color="textSecondary" display="block">
                ({row.currentApproverName})
              </Typography>
            )}
          </Box>
        ) : (
          <Typography variant="caption" color="textSecondary">
            완료
          </Typography>
        )
      ),
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'requestDateTime',
      headerName: '요청일시',
      width: 140,
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
      field: 'urgency',
      headerName: '긴급도',
      width: 80,
      renderCell: ({ value }) => (
        value === 'URGENT' ? (
          <Chip size="small" label="긴급" color="error" />
        ) : (
          <Chip size="small" label="일반" color="default" />
        )
      ),
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'actions',
      headerName: selectedStatus === 'PENDING' ? '처리' : '상세보기',
      width: selectedStatus === 'PENDING' ? 150 : 100,
      renderCell: ({ row }) => (
        selectedStatus === 'PENDING' ? (
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
        ) : (
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleViewDetail(row.approvalId)}
          >
            상세
          </Button>
        )
      ),
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
  ];

  return (
    <PageContainer>      
      <PageHeader 
        title="[결재관리] 내 결재 목록" 
        icon={<AssignmentIcon />}
        description="내가 처리해야 할 결재와 처리한 결재를 관리합니다."
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
          overflow: 'hidden',
          minHeight: 0,
          position: 'relative',
          py: 1,
        }}
      >
        {/* 검색 조건 영역 */}
        <SearchConditionPanel disabled={loading}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>결재 상태</InputLabel>
              <Select
                value={selectedStatus}
                label="결재 상태"
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={loading}
              >
                {STATUS_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <SearchButton
              onClick={loadApprovalData}
              loading={loading}
              disabled={loading}
            />
          </Box>
        </SearchConditionPanel>

        {/* 로그인 정보 확인 알림 */}
        {!currentUserId && (
          <Alert severity="warning" sx={{ mb: 2, mx: 2 }}>
            로그인 정보를 확인 중입니다. 잠시만 기다려주세요.
          </Alert>
        )}

        {/* 데이터 그리드 */}
        <Box sx={{
          width: '100%',
          flex: 1
        }}>
          <DataGrid
            data={approvals}
            columns={columns}
            loading={loading}
            error={null}
            selectable={false}
            multiSelect={false}
            rowIdField='approvalId'
            sx={{
              width: '100%',
              height: '600px',
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

export default MyApprovalListPage;