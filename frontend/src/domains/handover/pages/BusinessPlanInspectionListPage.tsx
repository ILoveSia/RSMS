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

import { Button, SearchButton, ManagementButtonGroup, ExcelDownloadButton } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { CommonCodeSelect } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Assessment as InspectionIcon, TrendingUp as ProgressIcon } from '@mui/icons-material';
import { Box, Chip, Avatar, Typography, LinearProgress } from '@mui/material';
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

  // 점검 유형 표시 함수
  const getTypeChip = (type: string) => {
    const typeConfig = {
      QUARTERLY: { label: '분기별', color: 'primary' as const },
      SEMI_ANNUAL: { label: '반기별', color: 'secondary' as const },
      ANNUAL: { label: '연간', color: 'info' as const },
      SPECIAL: { label: '특별점검', color: 'warning' as const },
    };
    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size="small" variant="outlined" />;
  };

  // 진행률 표시 함수
  const getProgressBar = (value: number | undefined) => {
    if (value === undefined) return '-';
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
        <Box sx={{ width: 80 }}>
          <LinearProgress variant="determinate" value={value} />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 30 }}>
          {value}%
        </Typography>
      </Box>
    );
  };

  // 컬럼 정의
  const columns: DataGridColumn<BusinessPlanInspectionDto>[] = [
    {
      field: 'inspectionType',
      headerName: '유형',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => getTypeChip(params.value),
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
      field: 'targetDeptName',
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
      renderCell: params => getStatusChip(params.value),
    },
    {
      field: 'progressRate',
      headerName: '진행률',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => getProgressBar(params.value),
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
        return params.value ? new Date(params.value).toLocaleDateString('ko-KR') : '';
      },
    },
    {
      field: 'plannedEndDate',
      headerName: '종료일',
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

  // Mock 데이터
  const mockInspections: BusinessPlanInspectionDto[] = [
    {
      inspectionId: 1,
      assignmentId: 1,
      inspectionTitle: '2024년 1분기 IT부서 사업계획 점검',
      inspectionType: 'QUARTERLY',
      status: 'IN_PROGRESS',
      planYear: 2024,
      planQuarter: 1,
      targetDept: 'IT001',
      targetDeptName: '정보기술부',
      inspectionScope: 'IT 인프라 구축 및 시스템 개발 프로젝트',
      inspectionCriteria: '사업계획 대비 진행률, 예산 집행률, 품질 기준 충족도',
      inspectionItems: 'IT 거버넌스, 정보보안, 시스템 개발 관리',
      plannedStartDate: '2024-01-15',
      plannedEndDate: '2024-01-31',
      actualStartDate: '2024-01-15',
      inspectorEmpNo: 'E001',
      inspectorName: '김점검',
      managerEmpNo: 'E002',
      managerName: '이관리',
      progressRate: 65,
      currentPhase: '현장점검',
      phaseDescription: '각 부서별 업무 프로세스 점검 진행 중',
      overallScore: 85,
      overallGrade: 'B+',
      totalIssueCount: 5,
      criticalIssueCount: 0,
      majorIssueCount: 2,
      minorIssueCount: 3,
      attachmentCount: 8,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-20',
    },
    {
      inspectionId: 2,
      assignmentId: 2,
      inspectionTitle: '2024년 상반기 경영관리부 특별점검',
      inspectionType: 'SPECIAL',
      status: 'COMPLETED',
      planYear: 2024,
      targetDept: 'MGMT001',
      targetDeptName: '경영관리부',
      inspectionScope: '예산 집행 및 인사관리 프로세스',
      inspectionCriteria: '내부통제 기준, 규정 준수도, 효율성 평가',
      inspectionItems: '예산관리, 인사관리, 성과관리',
      plannedStartDate: '2024-02-01',
      plannedEndDate: '2024-02-15',
      actualStartDate: '2024-02-01',
      actualEndDate: '2024-02-14',
      inspectorEmpNo: 'E003',
      inspectorName: '박점검',
      managerEmpNo: 'E004',
      managerName: '최관리',
      progressRate: 100,
      currentPhase: '완료',
      phaseDescription: '점검 완료 및 결과 보고서 작성',
      overallScore: 92,
      overallGrade: 'A',
      totalIssueCount: 2,
      criticalIssueCount: 0,
      majorIssueCount: 1,
      minorIssueCount: 1,
      completionReport: '전반적으로 우수한 내부통제 체계를 유지하고 있음',
      recommendations: '예산 승인 프로세스 개선 필요',
      followUpActions: '분기별 모니터링 실시',
      attachmentCount: 12,
      createdAt: '2024-01-25',
      updatedAt: '2024-02-15',
    },
    {
      inspectionId: 3,
      assignmentId: 3,
      inspectionTitle: '2024년 리스크관리부 연간점검 계획',
      inspectionType: 'ANNUAL',
      status: 'PLANNED',
      planYear: 2024,
      targetDept: 'RISK001',
      targetDeptName: '리스크관리부',
      inspectionScope: '리스크 식별, 평가, 관리 체계 전반',
      inspectionCriteria: 'Basel III 기준, 내부 리스크관리 규정',
      inspectionItems: '신용리스크, 시장리스크, 운영리스크 관리',
      plannedStartDate: '2024-03-01',
      plannedEndDate: '2024-03-31',
      inspectorEmpNo: 'E005',
      inspectorName: '정점검',
      managerEmpNo: 'E006',
      managerName: '한관리',
      progressRate: 0,
      currentPhase: '계획수립',
      phaseDescription: '점검 계획 수립 및 점검팀 구성 중',
      attachmentCount: 3,
      createdAt: '2024-02-01',
      updatedAt: '2024-02-10',
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
      // TODO: 실제 API 호출로 대체
      // const data = await businessPlanInspectionApi.searchInspections(searchParams, { page: 0, size: 100 });
      
      // Mock 데이터 필터링
      let filteredData = mockInspections;
      if (selectedType !== 'ALL') {
        filteredData = filteredData.filter(item => item.inspectionType === selectedType);
      }
      if (selectedStatus !== 'ALL') {
        filteredData = filteredData.filter(item => item.status === selectedStatus);
      }

      setRows(filteredData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
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
    setDialogOpen(true);
  }, []);

  const handleRowDoubleClick = useCallback((row: BusinessPlanInspectionDto) => {
    setDialogMode('view');
    setSelectedInspectionId(row.inspectionId);
    setDialogOpen(true);
  }, []);

  const handleRowClick = useCallback((row: BusinessPlanInspectionDto) => {
    setDialogMode('view');
    setSelectedInspectionId(row.inspectionId);
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
  }, []);

  const handleDialogSuccess = useCallback(async () => {
    await handleSearch(); // 데이터 새로고침
  }, [handleSearch]);

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
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>유형</span>
          <CommonCodeSelect
            groupCode="INSPECTION_TYPE"
            value={selectedType}
            onChange={setSelectedType}
            size='small'
            sx={{ minWidth: 120, maxWidth: 180 }}
            options={[
              { value: 'ALL', label: '전체' },
              { value: 'QUARTERLY', label: '분기별' },
              { value: 'SEMI_ANNUAL', label: '반기별' },
              { value: 'ANNUAL', label: '연간' },
              { value: 'SPECIAL', label: '특별점검' },
            ]}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>상태</span>
          <CommonCodeSelect
            groupCode="INSPECTION_STATUS"
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
            showRegister={true}
            showDelete={true}
            showEdit={false}
            showRefresh={false}
            registerDisabled={loading}
            deleteDisabled={loading || selectedIds.length === 0}
            registerLabel="신규 점검"
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
        onSuccess={handleDialogSuccess}
      />
    </PageContainer>
  );
};

export default BusinessPlanInspectionListPage;