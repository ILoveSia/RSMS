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

import { Button, SearchButton, ManagementButtonGroup, ExcelDownloadButton } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { CommonCodeSelect } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Description as DocumentIcon } from '@mui/icons-material';
import { Box, Chip } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { internalControlManualApi, type InternalControlManualDto } from '../api/internalControlManualApi';
import InternalControlManualDialog from '../components/InternalControlManualDialog';
import { useGetDepartmentName, useGetEmployeeName } from '@/shared/utils/codeUtils';

interface IInternalControlManualListPageProps {
  className?: string;
}


const InternalControlManualListPage: React.FC<IInternalControlManualListPageProps> = (): React.JSX.Element => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rows, setRows] = useState<InternalControlManualDto[]>([]);
  
  // 부서명 변환 함수
  const getDepartmentName = useGetDepartmentName();
  // 직원명 변환 함수
  const getEmployeeName = useGetEmployeeName();

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('view');
  const [selectedManualId, setSelectedManualId] = useState<number | undefined>();
  const [selectedManualData, setSelectedManualData] = useState<InternalControlManualDto | undefined>();

  // 상태 표시 함수
  const getStatusChip = (status: string) => {
    const statusConfig = {
      DRAFT: { label: '초안', color: 'default' as const },
      REVIEW: { label: '검토중', color: 'warning' as const },
      APPROVED: { label: '승인됨', color: 'info' as const },
      PUBLISHED: { label: '발행됨', color: 'success' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  // 컬럼 정의
  const columns: DataGridColumn<InternalControlManualDto>[] = [
         {
       field: 'deptName',
       headerName: '부서',
       width: 120,
       align: 'center',
       headerAlign: 'center',
       renderCell: params => {
         return <span>{params.value || params.row.deptCd}</span>;
       },
     },
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
            {params.value}
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
      field: 'status',
      headerName: '상태',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => getStatusChip(params.value as string),
    },
         {
       field: 'authorName',
       headerName: '작성자',
       width: 120,
       align: 'center',
       headerAlign: 'center',
       renderCell: params => {
         return <span>{params.value || params.row.authorEmpNo}</span>;
       },
     },
    {
      field: 'effectiveDate',
      headerName: '시행일',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        return params.value && typeof params.value === 'string' ? new Date(params.value).toLocaleDateString('ko-KR') : '';
      },
    },
    {
      field: 'expiryDate',
      headerName: '만료일',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        return params.value && typeof params.value === 'string' ? new Date(params.value).toLocaleDateString('ko-KR') : '';
      },
    },
    {
      field: 'createdAt',
      headerName: '등록일자',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        return params.value && typeof params.value === 'string' ? new Date(params.value).toLocaleDateString('ko-KR') : '';
      },
    },
    {
      field: 'updatedAt',
      headerName: '최종수정일자',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        return params.value && typeof params.value === 'string' ? new Date(params.value).toLocaleDateString('ko-KR') : '';
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
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        deptCd: selectedDept !== 'ALL' ? selectedDept : undefined,
      };

      const paginationParams = {
        page: 0,
        size: 100,
      };

      const response = await internalControlManualApi.searchManuals(searchParams, paginationParams);
      
             // API 응답 데이터에 부서명과 직원명 추가
       const enrichedData = await Promise.all(response.content.map(async item => {
         const deptName = getDepartmentName(item.deptCd || '');
         const authorName = await getEmployeeName(item.authorEmpNo || '');
         return {
           ...item,
           deptName: deptName,
           authorName: authorName,
         };
       }));
      setRows(enrichedData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
     }, [selectedStatus, selectedDept, getDepartmentName, getEmployeeName]);

  const handleExcelDownload = useCallback(() => {
    // 엑셀 다운로드 로직
  }, [rows]);

  const handleCreateClick = useCallback(() => {
    setDialogMode('create');
    setSelectedManualId(undefined);
    setDialogOpen(true);
  }, []);

  const handleRowDoubleClick = useCallback((row: InternalControlManualDto) => {
    setDialogMode('view');
    setSelectedManualId(row.manualId);
    setSelectedManualData(row);
    setDialogOpen(true);
  }, []);

  const handleRowClick = useCallback((row: InternalControlManualDto) => {
    setDialogMode('view');
    setSelectedManualId(row.manualId);
    setSelectedManualData(row);
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
    setSelectedManualData(undefined);
  }, []);

  const handleDialogSuccess = useCallback(async () => {
    await handleSearch(); // 데이터 새로고침
  }, [handleSearch]);

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
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>상태</span>
          <CommonCodeSelect
            groupCode="MANUAL_STATUS"
            value={selectedStatus}
            onChange={setSelectedStatus}
            size='small'
            sx={{ minWidth: 120, maxWidth: 180 }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>부서</span>
          <CommonCodeSelect
            groupCode="DEPARTMENT"
            value={selectedDept}
            onChange={setSelectedDept}
            size='small'
            sx={{ minWidth: 150, maxWidth: 200 }}
          />
          <SearchButton
            onClick={handleSearch}
            loading={loading}
            disabled={loading}
          />
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
        manualData={selectedManualData}
        onSuccess={handleDialogSuccess}
      />
    </PageContainer>
  );
};

export default InternalControlManualListPage;