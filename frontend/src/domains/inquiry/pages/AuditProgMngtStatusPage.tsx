/**
 * 점검 계획 관리 페이지
 * 점검 계획을 조회하고 관리합니다.
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { DatePicker } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Search as SearchIcon } from '@mui/icons-material';
import { Box, Chip } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

// 점검 계획 데이터 인터페이스
interface AuditProgRow {
  id: number;
  auditPlanCode: string;     // 점검계획코드
  auditMemberName: string;   // 점검 회자명
  auditPeriod: string;       // 점검기간
  targetItemCount: number;   // 대상 점검항목 수
  isModified: boolean;       // 수정여부
  progressStatus: string;    // 진행상태
  remarks?: string;          // 비고
}

interface IAuditProgMngtStatusPageProps {
  className?: string;
}

const AuditProgMngtStatusPage: React.FC<IAuditProgMngtStatusPageProps> = (): React.JSX.Element => {
  // 기본 날짜 계산 (3개월 전 ~ 오늘)
  const getDefaultDates = () => {
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    return { startDate: threeMonthsAgo, endDate: today };
  };

  // 기간 선택 상태
  const [startDate, setStartDate] = useState<Date | null>(getDefaultDates().startDate);
  const [endDate, setEndDate] = useState<Date | null>(getDefaultDates().endDate);

  // 점검 계획 데이터
  const [auditRows, setAuditRows] = useState<AuditProgRow[]>([]);
  const [selectedAuditIds, setSelectedAuditIds] = useState<number[]>([]);

  // 등록 모드
  const [isRegistrationMode, setIsRegistrationMode] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<AuditProgRow | null>(null);

  // 에러 다이얼로그 상태
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 데이터 그리드 컬럼 정의
  const columns: DataGridColumn<AuditProgRow>[] = [
    {
      field: 'auditPlanCode',
      headerName: '점검계획코드',
      width: 150,
    },
    {
      field: 'auditMemberName',
      headerName: '점검 회자명',
      width: 150,
    },
    {
      field: 'auditPeriod',
      headerName: '점검기간',
      width: 200,
    },
    {
      field: 'targetItemCount',
      headerName: '대상 점검항목 수',
      width: 150,
      align: 'center' as const,
    },
    {
      field: 'isModified',
      headerName: '수정여부',
      width: 100,
      renderCell: ({ value }) => (
        <Chip
          label={value ? '수정' : '원본'}
          color={value ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'progressStatus',
      headerName: '진행상태',
      width: 120,
      renderCell: ({ value }) => (
        <Chip
          label={value}
          color={
            value === '완료' ? 'success' :
            value === '진행중' ? 'primary' :
            value === '대기' ? 'default' : 'warning'
          }
          size="small"
        />
      ),
    },
    {
      field: 'remarks',
      headerName: '비고',
      width: 200,
    },
  ];

  // 점검 계획 조회 (임시 데이터)
  const handleFetchAuditPrograms = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 임시 데이터 - 실제 API 호출로 교체 필요
      const mockData: AuditProgRow[] = [
        {
          id: 1,
          auditPlanCode: 'AUDIT-2024-001',
          auditMemberName: '김점검',
          auditPeriod: '2024-01-01 ~ 2024-01-31',
          targetItemCount: 15,
          isModified: false,
          progressStatus: '완료',
          remarks: '정기 점검 완료'
        },
        {
          id: 2,
          auditPlanCode: 'AUDIT-2024-002',
          auditMemberName: '이감사',
          auditPeriod: '2024-02-01 ~ 2024-02-28',
          targetItemCount: 22,
          isModified: true,
          progressStatus: '진행중',
          remarks: '추가 점검 항목 발견'
        },
        {
          id: 3,
          auditPlanCode: 'AUDIT-2024-003',
          auditMemberName: '박검사',
          auditPeriod: '2024-03-01 ~ 2024-03-31',
          targetItemCount: 8,
          isModified: false,
          progressStatus: '대기',
          remarks: ''
        }
      ];
      
      setAuditRows(mockData);
    } catch (error) {
      setErrorMessage('점검 계획 조회 중 오류가 발생했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  // 초기 로드 시 자동 조회
  useEffect(() => {
    handleFetchAuditPrograms();
  }, [handleFetchAuditPrograms]);

  // 행 선택 변경 핸들러
  const handleAuditRowSelectionModelChange = (
    selectedRows: (string | number)[]
  ) => {
    setSelectedAuditIds(selectedRows.map(id => Number(id)));
  };

  // 행 클릭 핸들러 (상세보기)
  const handleAuditRowClick = (row: AuditProgRow) => {
    if (isRegistrationMode) {
      return;
    }
    setSelectedItem(row);
    setDialogMode('view');
    setIsRegistrationMode(true);
  };

  // 등록 모드 전환
  const handleRegistrationModeToggle = () => {
    setIsRegistrationMode(!isRegistrationMode);
    if (!isRegistrationMode) {
      setDialogMode('create');
      setSelectedItem(null);
    }
  };

  // 모달 닫기 핸들러
  const handleDialogClose = () => {
    setIsRegistrationMode(false);
    setSelectedItem(null);
    setDialogMode('create');
  };

  // 점검 계획 등록/수정 (임시 구현)
  const handleSubmit = async (data: any): Promise<{ id: number }> => {
    try {
      setIsLoading(true);
      
      // 임시 구현 - 실제 API 호출로 교체 필요
      console.log('점검 계획 저장:', data);
      
      handleDialogClose();
      handleFetchAuditPrograms();
      
      return { id: Math.floor(Math.random() * 1000) };
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
      setErrorDialogOpen(true);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 모드 변경 핸들러
  const handleModeChange = (mode: 'create' | 'edit' | 'view') => {
    setDialogMode(mode);
  };

  // 점검 계획 삭제 (임시 구현)
  const handleDelete = async () => {
    if (!selectedAuditIds.length) {
      setErrorMessage('삭제할 점검 계획을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      
      // 임시 구현 - 실제 API 호출로 교체 필요
      console.log('점검 계획 삭제:', selectedAuditIds);
      
      setSelectedAuditIds([]);
      handleFetchAuditPrograms();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="[900] 점검 계획"
        icon={<SearchIcon />}
        description="점검 계획을 조회하고 관리합니다."
        elevation={false}
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
        {/* 기간 선택 영역 */}
        <Box sx={{
          display: 'flex',
          gap: '8px',
          padding: '8px 16px',
          mb: 2,
          bgcolor: 'var(--bank-bg-secondary)',
          borderRadius: 1,
          border: '1px solid var(--bank-border)',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <DatePicker
              label="시작일"
              value={startDate}
              onChange={setStartDate}
              maxDate={endDate ?? undefined}
              size="small"
              sx={{ width: '200px' }}
            />
            <span style={{ color: 'var(--bank-text-primary)' }}>~</span>
            <DatePicker
              label="종료일"
              minDate={startDate ?? undefined}
              value={endDate}
              onChange={setEndDate}
              size="small"
              sx={{ width: '200px' }}
            />
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={handleFetchAuditPrograms}
            color="primary"
          >
            조회
          </Button>
        </Box>

        {/* 버튼 영역 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleRegistrationModeToggle}
            color="success"
            sx={{ mr: 1 }}
            disabled={isLoading}
          >
            등록
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleDelete}
            disabled={!selectedAuditIds.length || isLoading}
            color="primary"
            style={{ color: 'white' }}
          >
            삭제
          </Button>
        </Box>

        {/* 데이터 그리드 */}
        <Box sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <DataGrid
            data={auditRows}
            columns={columns}
            loading={isLoading}
            error={null}
            onRowClick={handleAuditRowClick}
            onRowSelectionChange={handleAuditRowSelectionModelChange}
            checkboxSelection={true}
            rowSelectionModel={selectedAuditIds}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 }
              }
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            sx={{
              height: '650px',
              '& .MuiDataGrid-virtualScroller': {
                overflow: 'auto'
              }
            }}
          />
        </Box>

        {/* TODO: 점검 계획 등록/수정 다이얼로그 추가 필요 */}
        {/* 
        {isRegistrationMode && (
          <AuditProgMngtDialog
            open={isRegistrationMode}
            onClose={handleDialogClose}
            onSubmit={handleSubmit}
            loading={isLoading}
            mode={dialogMode}
            itemId={selectedItem?.id}
            initialData={selectedItem}
            onModeChange={handleModeChange}
          />
        )}
        */}

        {/* 에러 다이얼로그 */}
        <ErrorDialog
          open={errorDialogOpen}
          errorMessage={errorMessage}
          onClose={() => setErrorDialogOpen(false)}
        />
      </PageContent>
    </PageContainer>
  );
};

export default AuditProgMngtStatusPage;