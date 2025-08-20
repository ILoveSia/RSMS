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

import { ApprovalStatusBadge, AttachmentBadge } from '@/shared/components/ui/badge';
import { SearchButton, ManagementButtonGroup } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { TextField } from '@/shared/components/ui/data-display/';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Description as DocumentIcon, Search as SearchIcon } from '@mui/icons-material';
import { Box, Chip, IconButton, InputAdornment } from '@mui/material';
import EmployeeSearchPopup, { type EmployeeSearchResult } from '@/domains/common/components/search/EmployeeSearchPopup';
import TitleSearch from '@/domains/admin/components/TitleSearch';
import React, { useCallback, useEffect, useState } from 'react';
import { internalControlManualApi, type InternalControlManualDto } from '../api/internalControlManualApi';
import { useApiWithNotification } from '@/shared/hooks';
import InternalControlManualDialog from '../components/InternalControlManualDialog';


interface IInternalControlManualListPageProps {
  className?: string;
}


const InternalControlManualListPage: React.FC<IInternalControlManualListPageProps> = (): React.JSX.Element => {
  // API 알림 훅
  const { callApiWithNotification } = useApiWithNotification({
    showSuccessOnLoad: true,
    errorMessage: '데이터를 불러오는 중 오류가 발생했습니다.',
  });

  // 상태 관리
  const [manualTitle, setManualTitle] = useState<string>('');
  const [authorEmpNo, setAuthorEmpNo] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rows, setRows] = useState<InternalControlManualDto[]>([]);
  const [apiResponseData, setApiResponseData] = useState<any>(null);

  // 사원 검색 팝업 상태
  const [authorSearchOpen, setAuthorSearchOpen] = useState(false);

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
      renderCell: params => <ApprovalStatusBadge status={params.row.approvalStatus} />,
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
      renderCell: params => <AttachmentBadge count={params.value as number} />,
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
    
    const data = await callApiWithNotification(
      () => internalControlManualApi.searchManualsWithApproval(
        {
          manualTitle: manualTitle.trim() || undefined,
          authorEmpNo: authorEmpNo.trim() || undefined,
        },
        { page: 0, size: 100 }
      ),
      'success_load'
    );
    
    if (data) {
      setRows(data.content);
      setApiResponseData(data);
    } else {
      setRows([]);
    }
    
    setLoading(false);
  }, [manualTitle, authorEmpNo, callApiWithNotification]);

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
      callApiWithNotification(
        () => Promise.reject(new Error('삭제할 항목을 선택해주세요.')),
        'custom'
      );
      return;
    }

    if (!confirm(`선택한 ${selectedIds.length}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    setLoading(true);

    try {
      for (const id of selectedIds) {
        await callApiWithNotification(
          () => internalControlManualApi.deleteManual(id),
          'custom'
        );
      }

      setSelectedIds([]);
      await handleSearch(); // 데이터 새로고침
    } finally {
      setLoading(false);
    }
  }, [selectedIds, handleSearch, callApiWithNotification]);

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
      callApiWithNotification(
        () => Promise.reject(new Error('메뉴얼 ID가 없습니다.')),
        'custom'
      );
      return;
    }

    setLoading(true);
    
    try {
      await callApiWithNotification(
        () => internalControlManualApi.startApproval(manual.manualId, {
          taskTypeCode: 'internal_control_manuals',
          taskId: manual.manualId,
          title: `내부통제 업무메뉴얼 결재 - ${manual.manualTitle}`,
          description: `내부통제 업무메뉴얼 "${manual.manualTitle}" 결재를 요청합니다.`
        }),
        'custom'
      );
      
      await handleSearch(); // 데이터 새로고침
    } finally {
      setLoading(false);
    }
  }, [handleSearch, callApiWithNotification]);

  // 사원 선택 핸들러
  const handleAuthorSelect = useCallback((employee: EmployeeSearchResult) => {
    setAuthorEmpNo(employee.num);
    setAuthorName(employee.username);
    setAuthorSearchOpen(false);
  }, []);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    setManualTitle('');
    setAuthorEmpNo('');
    setAuthorName('');
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
        <TitleSearch
          value={manualTitle}
          onChange={setManualTitle}
          onEnter={handleSearch}
          disabled={loading}
          after={
            <>
              <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>작성자</span>
              <TextField
                label=""
                mode="editable"
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
            </>
          }
        />

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 0.5, 
          gap: 1,
          alignItems: 'center',
          height: '32px',
        }}>
          <ManagementButtonGroup
            onRegister={handleCreateClick}
            onDelete={handleDelete}
            onExcelDownload={handleExcelDownload}
            filename="internal_control_manuals"
            showRegister={true}
            showDelete={true}
            showEdit={false}
            showRefresh={false}
            showExcelDownload={true}
            registerDisabled={loading}
            deleteDisabled={loading || selectedIds.length === 0}
            align="right"
            sx={{
              mb: 0,
            }}
          />
        </Box>

        <Box sx={{ width: '100%', flex: 1 }}>
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
    </PageContainer>
  );
};

export default InternalControlManualListPage;