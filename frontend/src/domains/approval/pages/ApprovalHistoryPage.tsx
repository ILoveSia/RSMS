/**
 * 결재 히스토리 페이지
 * 전체 결재 현황과 이력을 조회합니다.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  InputAdornment,
} from '@mui/material';
import {
  History as HistoryIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { DataGrid } from '@/shared/components/ui/data-display';
import { ExcelDownloadButton, SearchButton } from '@/shared/components/ui/button';
import { SearchConditionPanel } from '@/shared/components/ui/form';
import type { DataGridColumn } from '@/shared/types/common';
import approvalApi, { type ApprovalListResponse } from '../api/approvalApi';
import ApprovalStatusDialog from '@/shared/components/approval/ApprovalStatusDialog';
import '../../../assets/scss/style.css';

// 검색 조건 인터페이스
interface SearchCriteria {
  taskTitle?: string;
  requesterName?: string;
  status?: string;
  taskType?: string;
}

// 상태 옵션
const STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'SUBMITTED', label: '상신' },
  { value: 'IN_PROGRESS', label: '진행중' },
  { value: 'APPROVED', label: '승인' },
  { value: 'REJECTED', label: '반려' },
  { value: 'CANCELLED', label: '취소' },
];

// 업무 유형 옵션 (실제 구현 시 API에서 가져오기)
const TASK_TYPE_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'EXECUTIVE_STATUS', label: '임원현황' },
  { value: 'POSITION_STATUS', label: '직위현황' },
  { value: 'MEETING_STATUS', label: '회의체현황' },
  { value: 'RESPONSIBILITY_STATUS', label: '책임현황' },
];

/**
 * 결재 히스토리 페이지
 */
const ApprovalHistoryPage: React.FC = () => {
  // 상태 관리
  const [approvals, setApprovals] = useState<ApprovalListResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // 다이얼로그 상태
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  // 데이터 로드
  const loadApprovalHistory = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      // 실제 검색 API 구현 필요
      // 임시로 전체 목록 조회 사용
      const data = await approvalApi.getAllApprovals();
      
      // 클라이언트 사이드 필터링 (실제로는 서버에서 처리)
      let filteredData = data;
      
      if (searchCriteria.taskTitle) {
        filteredData = filteredData.filter(item => 
          item.taskTitle.toLowerCase().includes(searchCriteria.taskTitle!.toLowerCase())
        );
      }
      
      if (searchCriteria.requesterName) {
        filteredData = filteredData.filter(item => 
          item.requesterName.toLowerCase().includes(searchCriteria.requesterName!.toLowerCase())
        );
      }
      
      if (searchCriteria.status) {
        filteredData = filteredData.filter(item => item.status === searchCriteria.status);
      }

      if (searchCriteria.taskType) {
        filteredData = filteredData.filter(item => item.taskType === searchCriteria.taskType);
      }

      setApprovals(filteredData);
      setTotalItems(filteredData.length);
      setCurrentPage(page);
      
      setSuccessMessage('결재 히스토리를 성공적으로 불러왔습니다.');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      console.error('결재 히스토리 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [searchCriteria]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadApprovalHistory();
  }, []);

  // 검색 실행
  const handleSearch = () => {
    loadApprovalHistory(1);
  };

  // 검색 조건 초기화
  const handleResetSearch = () => {
    setSearchCriteria({});
    setCurrentPage(1);
  };

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = useCallback(async () => {
  }, [searchCriteria, approvals.length]);

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

  // 검색 조건이 있는지 확인
  const hasSearchCriteria = Object.values(searchCriteria).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  // 컬럼 정의
  const columns: DataGridColumn<ApprovalListResponse>[] = [
    {
      field: 'approvalId',
      headerName: 'ID',
      width: 80,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'taskTitle',
      headerName: '업무명',
      width: 280,
      renderCell: ({ value, row }) => (
        <Box>
          <Typography 
            variant="body2" 
            sx={{ fontWeight: 'medium', cursor: 'pointer', color: '#1976d2', textDecoration: 'underline' }}
            onClick={() => handleViewDetail(row.approvalId)}
          >
            {value}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {row.taskTypeName}
          </Typography>
        </Box>
      ),
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
      headerName: '상세보기',
      width: 100,
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
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <PageHeader 
        title="[결재관리] 결재 히스토리" 
        icon={<HistoryIcon />}
        description="전체 결재 현황과 이력을 조회하고 관리합니다."
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
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="업무명"
              value={searchCriteria.taskTitle || ''}
              onChange={(e) => setSearchCriteria(prev => ({ 
                ...prev, 
                taskTitle: e.target.value 
              }))}
              sx={{ minWidth: 150 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              size="small"
              label="요청자"
              value={searchCriteria.requesterName || ''}
              onChange={(e) => setSearchCriteria(prev => ({ 
                ...prev, 
                requesterName: e.target.value 
              }))}
              sx={{ minWidth: 120 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>상태</InputLabel>
              <Select
                value={searchCriteria.status || ''}
                label="상태"
                onChange={(e) => setSearchCriteria(prev => ({ 
                  ...prev, 
                  status: e.target.value 
                }))}
              >
                {STATUS_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>업무 유형</InputLabel>
              <Select
                value={searchCriteria.taskType || ''}
                label="업무 유형"
                onChange={(e) => setSearchCriteria(prev => ({ 
                  ...prev, 
                  taskType: e.target.value 
                }))}
              >
                {TASK_TYPE_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <SearchButton
              onClick={handleSearch}
              loading={loading}
              disabled={loading}
            />
          </Box>
        </SearchConditionPanel>

        {/* 버튼 영역 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 0.5, 
          gap: 1,
          alignItems: 'center',
          height: '32px',
        }}>
          <ExcelDownloadButton
            onDownload={handleExcelDownload}
            filename="approval_history"
            disabled={loading || approvals.length === 0}
            loading={loading}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, mx: 2 }}>
            {error}
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

export default ApprovalHistoryPage;