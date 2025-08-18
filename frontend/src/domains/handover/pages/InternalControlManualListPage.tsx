/**
 * 내부통제 업무메뉴얼 목록 페이지
 * 내부통제 업무메뉴얼 목록 조회 및 관리 기능을 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 내부통제 업무메뉴얼 목록 표시만 담당
 * - Open/Closed: 새로운 필터나 액션 추가 시 확장 가능
 * - Liskov Substitution: React 컴포넌트 인터페이스 준수
 * - Interface Segregation: 목록 표시 관련 기능만 제공
 * - Dependency Inversion: 훅과 컴포넌트에 의존
 */

import { SearchButton, ManagementButtonGroup, ExcelDownloadButton, Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { TextField } from '@/shared/components/ui/data-display/';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Description as DocumentIcon, Search as SearchIcon } from '@mui/icons-material';
import { Box, Chip, IconButton, InputAdornment } from '@mui/material';
import EmployeeSearchPopup, { type EmployeeSearchResult } from '@/domains/common/components/search/EmployeeSearchPopup';
import React, { useCallback, useEffect, useState } from 'react';
import { internalControlManualApi, type InternalControlManualDto } from '../api/internalControlManualApi';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import Toast from '@/shared/components/ui/feedback/Toast';
import InternalControlManualDialog from '../components/InternalControlManualDialog';


interface IInternalControlManualListPageProps {
  className?: string;
}


const InternalControlManualListPage: React.FC<IInternalControlManualListPageProps> = (): React.JSX.Element => {
  const [manualTitle, setManualTitle] = useState<string>('');
  const [authorEmpNo, setAuthorEmpNo] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rows, setRows] = useState<InternalControlManualDto[]>([]);
  const [apiResponseData, setApiResponseData] = useState<any>(null);

  // 사원 검색 팝업 상태
  const [authorSearchOpen, setAuthorSearchOpen] = useState(false);

  // 알림 처리
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('view');
  const [selectedManualId, setSelectedManualId] = useState<number | undefined>();
  const [selectedManualApprovalStatus, setSelectedManualApprovalStatus] = useState<string>('NONE');

  // 컬럼 정의
  const columns: DataGridColumn<InternalControlManualDto>[] = [
    {
      field: 'manualTitle',
      headerName: '메뉴얼 제목',
      width: 300,
      align: 'left',
      headerAlign: 'center',
      renderCell: params => {
        return (
          <Box
            component="span"
            sx={{
              color: 'var(--bank-primary)',
              textDecoration: 'underline',
              cursor: 'pointer',
              '&:hover': {
                color: 'var(--bank-primary-dark)',
              },
            }}
            onClick={() => handleRowClick(params.row)}
          >
            {params.value as string}
          </Box>
        );
      },
    },
    {
      field: 'manualVersion',
      headerName: '버전',
      width: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'approvalStatus',
      headerName: '결재상태',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const status = params.row.approvalStatus;
        let statusText = '';
        let statusColor = '#666';

        switch (status) {
          case 'NONE':
            statusText = '미결재';
            statusColor = '#999';
            break;
          case 'SUBMITTED':
              statusText = '상신';
              statusColor = '#2196f3';
              break;  
          case 'IN_PROGRESS':
            statusText = '진행중';
            statusColor = '#ff9800';
            break;
          case 'APPROVED':
            statusText = '승인';
            statusColor = '#4caf50';
            break;
          case 'REJECTED':
            statusText = '반려';
            statusColor = '#f44336';
            break;
          default:
            statusText = status || '미결재';
            statusColor = '#999';
        }

        return (
          <Box
            component="span"
            sx={{
              color: statusColor,
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {statusText}
          </Box>
        );
      },
    },
    {
      field: 'authorName',
      headerName: '작성자',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'attachmentCount',
      headerName: '첨부파일',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const count = params.value as number || 0;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            📎
            <span style={{ fontSize: '0.875rem', color: count > 0 ? 'var(--bank-primary)' : '#999' }}>
              {count}
            </span>
          </Box>
        );
      },
    },
    {
      field: 'effectiveDate',
      headerName: '시행일',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        if (!params.value) return '';
        const date = new Date(params.value as string);
        return date.toLocaleDateString('ko-KR');
      },
    },
    {
      field: 'expiryDate',
      headerName: '만료일',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        if (!params.value) return '';
        const date = new Date(params.value as string);
        return date.toLocaleDateString('ko-KR');
      },
    },
    {
      field: 'createdAt',
      headerName: '등록일자',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        if (!params.value) return '';
        const date = new Date(params.value as string);
        return date.toLocaleDateString('ko-KR');
      },
    },
    {
      field: 'updatedAt',
      headerName: '최종수정일자',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        if (!params.value) return '';
        const date = new Date(params.value as string);
        return date.toLocaleDateString('ko-KR');
      },
    },
  ];



  // 초기 데이터 로드
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = {
        manualTitle: manualTitle.trim() || undefined,
        authorEmpNo: authorEmpNo.trim() || undefined,
      };

      

      // 결재 테이블과 조인하여 검색
      const data = await internalControlManualApi.searchManualsWithApproval(
        searchParams,
        { page: 0, size: 100 }
      );

      
      setRows(data.content);
      setApiResponseData(data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [manualTitle, authorEmpNo]);

  const handleExcelDownload = useCallback(() => {
    // 엑셀 다운로드 로직
  }, [rows]);

  const handleCreateClick = useCallback(() => {
    setDialogMode('create');
    setSelectedManualId(undefined);
    setSelectedManualApprovalStatus('NONE');
    setDialogOpen(true);
  }, []);

  const handleRowDoubleClick = useCallback((row: InternalControlManualDto) => {
    setDialogMode('view');
    setSelectedManualId(row.manualId);
    setSelectedManualApprovalStatus(row.approvalStatus || 'NONE');
    setDialogOpen(true);
  }, []);

  const handleRowClick = useCallback((row: InternalControlManualDto) => {
    setDialogMode('view');
    setSelectedManualId(row.manualId);
    setSelectedManualApprovalStatus(row.approvalStatus || 'NONE');
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (selectedIds.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedIds.length}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setLoading(true);

      for (const id of selectedIds) {
        await internalControlManualApi.deleteManual(id);
      }

      alert('삭제가 완료되었습니다.');
      setSelectedIds([]);
      await handleSearch(); // 데이터 새로고침
    } catch (err) {
      console.error('Failed to delete items:', err);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedIds, handleSearch]);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setSelectedManualId(undefined);
    setSelectedManualApprovalStatus('NONE');
  }, []);

  const handleDialogSuccess = useCallback(async () => {
    await handleSearch(); // 데이터 새로고침
  }, [handleSearch]);

  // 결재 요청 처리
  const handleApprovalStart = useCallback(async (manual: InternalControlManualDto) => {
    if (!manual.manualId) {
      showError('메뉴얼 ID가 없습니다.');
      return;
    }

    try {
      setLoading(true);
      await internalControlManualApi.startApproval(manual.manualId, {
        taskTypeCode: 'internal_control_manuals',
        taskId: manual.manualId,
        title: `내부통제 업무메뉴얼 결재 - ${manual.manualTitle}`,
        description: `내부통제 업무메뉴얼 "${manual.manualTitle}" 결재를 요청합니다.`
      });
      
      showSuccess('결재 요청이 완료되었습니다.');
      await handleSearch(); // 데이터 새로고침
    } catch (error) {
      console.error('결재 요청 실패:', error);
      showError('결재 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError, handleSearch]);

  // 사원 선택 핸들러
  const handleAuthorSelect = useCallback((employee: EmployeeSearchResult) => {
    setAuthorEmpNo(employee.num);
    setAuthorName(employee.username);
    setAuthorSearchOpen(false);
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title='내부통제 업무메뉴얼 관리'
        icon={<DocumentIcon />}
        description='부서별 내부통제 업무메뉴얼을 작성하고 관리합니다.'
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
        <Box
          sx={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            alignItems: 'center',
            backgroundColor: 'var(--bank-bg-secondary)',
            border: '1px solid var(--bank-border)',
            padding: '8px 16px',
            borderRadius: '4px',
          }}
        >
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>메뉴얼제목</span>
          <TextField
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            size="small"
            placeholder="메뉴얼제목을 입력하세요"
            sx={{ minWidth: 150, maxWidth: 200 }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>작성자</span>
          <TextField
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            size="small"
            placeholder="작성자명"
            helperText={authorEmpNo ? `사번: ${authorEmpNo}` : ''}
            sx={{ minWidth: 120, maxWidth: 180 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setAuthorSearchOpen(true)}
                    size="small"
                    edge="end"
                    title="사원 검색"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <SearchButton
            onClick={handleSearch}
            loading={loading}
            disabled={loading}
          />
          <Button
            onClick={() => {
              setManualTitle('');
              setAuthorEmpNo('');
              setAuthorName('');
            }}
            variant="outlined"
            size="small"
          >
            초기화
          </Button>
        </Box>

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
            filename="internal_control_manuals"
            disabled={loading}
            loading={loading}
          />
          <ManagementButtonGroup
            onRegister={handleCreateClick}
            onDelete={handleDelete}
            showRegister={true}
            showDelete={true}
            showEdit={false}
            showRefresh={false}
            registerDisabled={loading}
            deleteDisabled={loading || selectedIds.length === 0}
            align="right"
            sx={{
              mb: 0,
            }}
          />
        </Box>

        <Box sx={{ width: '100%', flex: 1 }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <DataGrid
            data={rows}
            columns={columns}
            loading={loading}
            height={600} 
            selectable={true}
            multiSelect={true}
            selectedRows={selectedIds}
            onRowSelectionChange={selectedRows => {
              setSelectedIds(selectedRows.map(id => Number(id)));
            }}
            onRowClick={handleRowClick}
            onRowDoubleClick={handleRowDoubleClick}
            rowIdField='manualId'
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
      </PageContent>

      {/* 다이얼로그 */}
      <InternalControlManualDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        mode={dialogMode}
        manualId={selectedManualId}
        approvalStatus={selectedManualApprovalStatus}
        onSuccess={handleDialogSuccess}
        apiResponseData={apiResponseData}
      />
      
      {/* 사원 검색 팝업 */}
      <EmployeeSearchPopup
        open={authorSearchOpen}
        onClose={() => setAuthorSearchOpen(false)}
        onSelect={handleAuthorSelect}
        title="작성자 검색"
      />

      {/* 알림 토스트 */}
      <Toast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </PageContainer>
  );
};

export default InternalControlManualListPage;