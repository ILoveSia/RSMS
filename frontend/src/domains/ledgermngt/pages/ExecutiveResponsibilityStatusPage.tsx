/**
 * 임원별 책무 현황 페이지
 * 책무구조 원장 관리 - 임원별 책무 현황
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { ComboBox } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn, SelectOption } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Box, Chip } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

interface IExecutiveResponsibilityStatusPageProps {
  className?: string;
}

interface ExecutiveResponsibilityRow {
  id: number;
  executiveName: string;     // 임원명
  position: string;          // 직책
  jobTitle: string;          // 직위
  totalCount: number;        // 총 책무 수
  mainCount: number;         // 주책무 수
  subCount: number;          // 부책무 수
  status: string;           // 상태
  lastUpdateDate: string;   // 최종 수정일
}
  const ledgerOrderOptions: SelectOption[] = [
    { value: '2024-001', label: '2024-001' },
    { value: '2024-002', label: '2024-002' },
    { value: '2024-003', label: '2024-003' }
  ];
const ExecutiveResponsibilityStatusPage: React.FC<IExecutiveResponsibilityStatusPageProps> = () => {
  // 상태 관리
  const [selectedRound, setSelectedRound] = useState<SelectOption | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<SelectOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 옵션 데이터
  const roundOptions: SelectOption[] = [
    { value: '2024-001', label: '2024년 1차' },
    { value: '2024-002', label: '2024년 2차' },
  ];

  const positionOptions: SelectOption[] = [
    { value: 'all', label: '전체' },
    { value: 'chairman', label: '이사회 의장' },
    { value: 'president', label: '은행장' },
    { value: 'executive', label: '상임이사' },
  ];

  // 테이블 컬럼 정의
  const columns: DataGridColumn<ExecutiveResponsibilityRow>[] = [
    {
      field: 'executiveName',
      headerName: '임원명',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'position',
      headerName: '직책',
      flex: 1,
      minWidth: 150,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'jobTitle',
      headerName: '직위',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'totalCount',
      headerName: '총 책무 수',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => `${value}개`
    },
    {
      field: 'mainCount',
      headerName: '주책무 수',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => `${value}개`
    },
    {
      field: 'subCount',
      headerName: '부책무 수',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => `${value}개`
    },
    {
      field: 'status',
      headerName: '상태',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => {
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

        switch (value) {
          case '검토중':
            color = 'warning';
            break;
          case '확정':
            color = 'success';
            break;
          case '미작성':
            color = 'error';
            break;
          default:
            color = 'default';
        }

        return (
          <Chip
            label={value}
            color={color}
            size="small"
          />
        );
      }
    },
    {
      field: 'lastUpdateDate',
      headerName: '최종 수정일',
      flex: 1,
      minWidth: 150,
      align: 'center',
      headerAlign: 'center',
    },
  ];

  // 임시 데이터
  const [rows, setRows] = useState<ExecutiveResponsibilityRow[]>([
    {
      id: 1,
      executiveName: '홍길동',
      position: '이사회 의장',
      jobTitle: '회장',
      totalCount: 15,
      mainCount: 10,
      subCount: 5,
      status: '확정',
      lastUpdateDate: '2024-03-15'
    },
    {
      id: 2,
      executiveName: '김철수',
      position: '은행장',
      jobTitle: '행장',
      totalCount: 20,
      mainCount: 12,
      subCount: 8,
      status: '검토중',
      lastUpdateDate: '2024-03-20'
    },
    {
      id: 3,
      executiveName: '이영희',
      position: '상임이사',
      jobTitle: '이사',
      totalCount: 0,
      mainCount: 0,
      subCount: 0,
      status: '미작성',
      lastUpdateDate: '-'
    },
  ]);

  // 데이터 조회
  const fetchExecutiveResponsibility = useCallback(async () => {
    try {
      setIsLoading(true);
      // TODO: API 호출 구현
      console.log('조회 조건:', { selectedRound, selectedPosition });
    } catch (err) {
      console.error('데이터 조회 실패:', err);
      setErrorMessage('데이터 조회에 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRound, selectedPosition]);

  useEffect(() => {
    fetchExecutiveResponsibility();
  }, [fetchExecutiveResponsibility]);

  const handleErrorDialogClose = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

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
        title="[600] 임원별 책무 현황"
        icon={<GroupsIcon />}
        description="임원별 책무 현황을 조회합니다."
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
          height: 'calc(100vh - 64px)' // 헤더 높이를 제외한 전체 높이
        }}
      >
        {/* 필터 영역 */}
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
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>책무번호</span>
          <ComboBox
            options={ledgerOrderOptions}
            onChange={value => setSelectedRound(value as SelectOption)}
            size="small"
            sx={{ width: '130px' }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>
            직책
          </span>
          <ComboBox
            value={selectedPosition}
            onChange={(value) => setSelectedPosition(value as SelectOption)}
            options={positionOptions}
            size="small"
            sx={{ minWidth: '200px' }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={fetchExecutiveResponsibility}
            color="primary"
          >
            조회
          </Button>
        </Box>

        {/* 데이터 그리드 */}
        <Box sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
          position: 'relative',
        }}>
          <DataGrid
            data={rows}
            columns={columns}
            loading={isLoading}
            error={null}
            rowIdField="id"
            disableRowSelectionOnClick
            noDataMessage="데이터가 없습니다."
          />
        </Box>
      </PageContent>

      {/* 에러 다이얼로그 */}
      <ErrorDialog
        open={errorDialogOpen}
        errorMessage={errorMessage}
        onClose={handleErrorDialogClose}
      />
    </PageContainer>
  );
};

export default ExecutiveResponsibilityStatusPage;
