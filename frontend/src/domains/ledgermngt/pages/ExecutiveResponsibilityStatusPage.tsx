/**
 * 임원별 책무 현황 페이지
 * 책무구조 원장 관리 - 임원별 책무 현황
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { Button } from '@/shared/components/ui/button';
import { ComboBox } from '@/shared/components/ui/form';
import type { SelectOption } from '@/shared/types/common';
import { Box, Card, CardContent, Chip } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
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
  const columns: GridColDef[] = [
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
      renderCell: (params) => `${params.value}개`
    },
    {
      field: 'mainCount',
      headerName: '주책무 수',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => `${params.value}개`
    },
    {
      field: 'subCount',
      headerName: '부책무 수',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => `${params.value}개`
    },
    {
      field: 'status',
      headerName: '상태',
      flex: 1,
      minWidth: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';

        switch (params.value) {
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
            label={params.value}
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
    <div className='main-content'>
      {/* 페이지 제목 */}
      <div className='responsibility-header'>
        <h1 className='responsibility-header__title'>★ [600] 임원별 책무 현황</h1>
      </div>

      {/* 노란색 구분선 */}
      <div className='responsibility-divider'></div>

      {/* 메인 콘텐츠 영역 */}
      <div className='responsibility-section' style={{ marginTop: '20px' }}>
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
          <ComboBox
            value={selectedRound}
            onChange={(value) => setSelectedRound(value as SelectOption)}
            options={roundOptions}
            placeholder="원장 차수 선택"
            size="small"
            sx={{ minWidth: '200px' }}
          />
          <ComboBox
            value={selectedPosition}
            onChange={(value) => setSelectedPosition(value as SelectOption)}
            options={positionOptions}
            placeholder="직책 선택"
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
        <Card>
          <CardContent>
            <DataGrid
              rows={rows}
              columns={columns}
              loading={isLoading}
              disableRowSelectionOnClick
              autoHeight
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
              }}
              localeText={{
                noRowsLabel: '데이터가 없습니다.',
                columnMenuLabel: '메뉴',
                columnMenuShowColumns: '열 표시',
                columnMenuFilter: '필터',
                columnMenuHideColumn: '열 숨기기',
                columnMenuUnsort: '정렬 해제',
                columnMenuSortAsc: '오름차순 정렬',
                columnMenuSortDesc: '내림차순 정렬',
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* 에러 다이얼로그 */}
      <ErrorDialog
        open={errorDialogOpen}
        errorMessage={errorMessage}
        onClose={handleErrorDialogClose}
      />
    </div>
  );
};

export default ExecutiveResponsibilityStatusPage;
