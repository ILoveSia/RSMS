/**
 * 사업계획 점검 목록 페이지
 * 사업계획 점검 목록 조회 및 관리 기능을 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사업계획 점검 목록 표시만 담당
 * - Open/Closed: 새로운 필터나 액션 추가 시 확장 가능
 * - Liskov Substitution: React 컴포넌트 인터페이스 준수
 * - Interface Segregation: 목록 표시 관련 기능만 제공
 * - Dependency Inversion: 훅과 컴포넌트에 의존
 */

import { SearchButton, ManagementButtonGroup, ExcelDownloadButton } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { CommonCodeSelect } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Assessment as InspectionIcon } from '@mui/icons-material';
import { Box, Chip } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { businessPlanInspectionApi, type BusinessPlanInspectionDto } from '../api/businessPlanInspectionApi';
import BusinessPlanInspectionDialog from '../components/BusinessPlanInspectionDialog';

interface IBusinessPlanInspectionListPageProps {
  className?: string;
}

const BusinessPlanInspectionListPage: React.FC<IBusinessPlanInspectionListPageProps> = (): React.JSX.Element => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rows, setRows] = useState<BusinessPlanInspectionDto[]>([]);

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('view');
  const [selectedInspectionId, setSelectedInspectionId] = useState<number | undefined>();
  const [selectedInspectionData, setSelectedInspectionData] = useState<BusinessPlanInspectionDto | undefined>();



  // 상태 표시 함수
  const getStatusChip = (status: string, statusName: string) => {
    const statusConfig = {
      PLANNED: { color: 'default' as const },
      IN_PROGRESS: { color: 'warning' as const },
      COMPLETED: { color: 'success' as const },
      CANCELLED: { color: 'error' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default' as const };
    return <Chip label={statusName} color={config.color} size="small" />;
  };

  // 점검 유형 표시 함수
  const getTypeChip = (type: string, typeName: string) => {
    const typeConfig = {
      QUARTERLY: { color: 'primary' as const },
      SEMI_ANNUAL: { color: 'secondary' as const },
      ANNUAL: { color: 'info' as const },
      SPECIAL: { color: 'warning' as const },
    };
    const config = typeConfig[type as keyof typeof typeConfig] || { color: 'default' as const };
    return <Chip label={typeName} color={config.color} size="small" variant="outlined" />;
  };



  // 컬럼 정의
  const columns: DataGridColumn<BusinessPlanInspectionDto>[] = [
    {
      field: 'inspectionType',
      headerName: '유형',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => getTypeChip(params.value as string, params.row.inspectionTypeName || params.value as string),
    },
    {
      field: 'inspectionTitle',
      headerName: '점검 제목',
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
      field: 'deptName',
      headerName: '대상부서',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'status',
      headerName: '상태',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => getStatusChip(params.value as string, params.row.statusName || params.value as string),
    },
    {
      field: 'inspectionYear',
      headerName: '점검연도',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => `${params.value}년`,
    },
    {
      field: 'inspectionQuarter',
      headerName: '분기',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => params.value ? `${params.value}분기` : '-',
    },
    {
      field: 'inspectorName',
      headerName: '점검자',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'plannedStartDate',
      headerName: '시작일',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        return params.value ? new Date(params.value as string).toLocaleDateString('ko-KR') : '';
      },
    },
    {
      field: 'plannedEndDate',
      headerName: '종료일',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        return params.value ? new Date(params.value as string).toLocaleDateString('ko-KR') : '';
      },
    },
    {
      field: 'createdAt',
      headerName: '등록일자',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        return params.value ? new Date(params.value as string).toLocaleDateString('ko-KR') : '';
      },
    },
    {
      field: 'updatedAt',
      headerName: '최종수정일자',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        return params.value ? new Date(params.value as string).toLocaleDateString('ko-KR') : '';
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
      // 실제 API 호출
      const searchParams = {
        inspectionType: selectedType === 'ALL' ? undefined : selectedType,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus
      };

      const response = await businessPlanInspectionApi.searchInspections(
        searchParams,
        { page: 0, size: 100 }
      );
      setRows(response.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedStatus]);

  const handleExcelDownload = useCallback(() => {
    // 엑셀 다운로드 로직
  }, [rows]);

  const handleCreateClick = useCallback(() => {
    setDialogMode('create');
    setSelectedInspectionId(undefined);
    setSelectedInspectionData(undefined);
    setDialogOpen(true);
  }, []);

  

  const handleRowDoubleClick = useCallback((row: BusinessPlanInspectionDto) => {
    setDialogMode('view');
    setSelectedInspectionId(row.inspectionId);
    setSelectedInspectionData(row);
    setDialogOpen(true);
  }, []);

  const handleRowClick = useCallback((row: BusinessPlanInspectionDto) => {
    setDialogMode('view');
    setSelectedInspectionId(row.inspectionId);
    setSelectedInspectionData(row);
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
        await businessPlanInspectionApi.deleteInspection(id);
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
    setSelectedInspectionId(undefined);
    setSelectedInspectionData(undefined);
  }, []);

  const handleDialogSuccess = useCallback(async () => {
    await handleSearch(); // 데이터 새로고침
  }, [handleSearch]);

  return (
    <PageContainer>
      <PageHeader
        title='사업계획 점검 관리'
        icon={<InspectionIcon />}
        description='부서별 사업계획 점검을 계획하고 실행합니다.'
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
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--bank-text-primary)' }}>유형</span>
          <CommonCodeSelect
            groupCode="INSPECTION_TYPE"
            value={selectedType}
            onChange={setSelectedType}
            size='small'
            sx={{ minWidth: 120, maxWidth: 180 }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--bank-text-primary)', marginLeft: '16px' }}>상태</span>
          <CommonCodeSelect
            groupCode="HANDOVER_STATUS"
            value={selectedStatus}
            onChange={setSelectedStatus}
            size='small'
            sx={{ minWidth: 120, maxWidth: 180 }}
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
            filename="business_plan_inspections"
            disabled={loading}
            loading={loading}
          />
          <ManagementButtonGroup
            onRegister={handleCreateClick}
            onDelete={handleDelete}
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
            rowIdField='inspectionId'
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
      <BusinessPlanInspectionDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        mode={dialogMode}
        inspectionId={selectedInspectionId}
        inspectionData={selectedInspectionData}
        onSuccess={handleDialogSuccess}
      />
    </PageContainer>
  );
};

export default BusinessPlanInspectionListPage;