/**
 * 인수인계 지정 관리 페이지
 * 인수인계 지정 목록 조회 및 관리 기능을 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 인수인계 지정 목록 표시만 담당
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
import { Assignment as AssignmentIcon } from '@mui/icons-material';
import { Box, Chip } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { handoverApi, type HandoverAssignmentDto } from '../api/handoverApi';
import HandoverAssignmentDialog from '../components/HandoverAssignmentDialog';

interface IHandoverAssignmentListPageProps {
  className?: string;
}

const HandoverAssignmentListPage: React.FC<IHandoverAssignmentListPageProps> = (): React.JSX.Element => {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAssignmentType, setSelectedAssignmentType] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rows, setRows] = useState<HandoverAssignmentDto[]>([]);

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('view');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | undefined>();
  const [selectedAssignmentData, setSelectedAssignmentData] = useState<HandoverAssignmentDto | undefined>();

  // 상태 표시 함수
  const getStatusChip = (status: string) => {
    const statusConfig = {
      PLANNED: { label: '계획됨', color: 'default' as const },
      IN_PROGRESS: { label: '진행중', color: 'warning' as const },
      COMPLETED: { label: '완료', color: 'success' as const },
      CANCELLED: { label: '취소', color: 'error' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  // 컬럼 정의
  const columns: DataGridColumn<HandoverAssignmentDto>[] = [
    {
      field: 'assignorName',
      headerName: '인계자',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'assigneeName',
      headerName: '인수자',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'assignmentType',
      headerName: '유형',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const typeMap = {
          POSITION: '직책',
          RESPONSIBILITY: '책무',
        };
        return typeMap[params.value as keyof typeof typeMap] || params.value;
      },
    },
    {
      field: 'deptName',
      headerName: '부서',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'status',
      headerName: '상태',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => getStatusChip(params.value),
    },
    {
      field: 'targetDate',
      headerName: '목표일자',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        return params.value ? new Date(params.value).toLocaleDateString('ko-KR') : '';
      },
    },
    {
      field: 'createdAt',
      headerName: '등록일자',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        return params.value ? new Date(params.value).toLocaleDateString('ko-KR') : '';
      },
    },
    {
      field: 'updatedAt',
      headerName: '최종수정일자',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        return params.value ? new Date(params.value).toLocaleDateString('ko-KR') : '';
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
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        handoverType: selectedAssignmentType === 'ALL' ? undefined : selectedAssignmentType
      };

      const response = await handoverApi.searchAssignments(
        searchParams,
        { page: 0, size: 100 }
      );

      console.log('HandoverAssignment API Response:', response.data);
      setRows(response.data || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, selectedAssignmentType]);

  const handleExcelDownload = useCallback(() => {
    // 엑셀 다운로드 로직
  }, [rows]);

  const handleCreateClick = useCallback(() => {
    setDialogMode('create');
    setSelectedAssignmentId(undefined);
    setSelectedAssignmentData(undefined);
    setDialogOpen(true);
  }, []);

  const handleRowDoubleClick = useCallback((row: HandoverAssignmentDto) => {
    setDialogMode('view');
    setSelectedAssignmentId(row.assignmentId);
    setSelectedAssignmentData(row);
    setDialogOpen(true);
  }, []);

  const handleRowClick = useCallback((row: HandoverAssignmentDto) => {
    setDialogMode('view');
    setSelectedAssignmentId(row.assignmentId);
    setSelectedAssignmentData(row);
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
        await handoverApi.deleteAssignment(id);
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
    setSelectedAssignmentId(undefined);
    setSelectedAssignmentData(undefined);
  }, []);

  const handleDialogSuccess = useCallback(async () => {
    await handleSearch(); // 데이터 새로고침
  }, [handleSearch]);

  return (
    <PageContainer>
      <PageHeader
        title='인수인계 지정 관리'
        icon={<AssignmentIcon />}
        description='인수인계 지정 현황을 조회하고 관리합니다.'
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
            groupCode="ASSIGNMENT_STATUS"
            value={selectedStatus}
            onChange={setSelectedStatus}
            size='small'
            sx={{ minWidth: 120, maxWidth: 180 }}
            options={[
              { value: 'ALL', label: '전체' },
              { value: 'PLANNED', label: '계획됨' },
              { value: 'IN_PROGRESS', label: '진행중' },
              { value: 'COMPLETED', label: '완료' },
              { value: 'CANCELLED', label: '취소' },
            ]}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>유형</span>
          <CommonCodeSelect
            groupCode="ASSIGNMENT_TYPE"
            value={selectedAssignmentType}
            onChange={setSelectedAssignmentType}
            size='small'
            sx={{ minWidth: 150, maxWidth: 200 }}
            options={[
              { value: 'ALL', label: '전체' },
              { value: 'POSITION', label: '직책' },
              { value: 'RESPONSIBILITY', label: '책무' },
            ]}
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
            filename="handover_assignments"
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
            registerLabel="신규 지정"
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
            rowIdField='assignmentId'
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
      <HandoverAssignmentDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        mode={dialogMode}
        assignmentId={selectedAssignmentId}
        assignmentData={selectedAssignmentData}
        onSuccess={handleDialogSuccess}
      />
    </PageContainer>
  );
};

export default HandoverAssignmentListPage;