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
import { Box } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import executiveResponsibilityApi from '../api/executiveResponsibilityApi';

interface IExecutiveResponsibilityStatusPageProps {
  className?: string;
}

interface ExecutiveResponsibilityRow {
  id: number;
  position: string;          // 직책
  jobTitle?: string;         // 직위
  empNo?: string;            // 사번
  executiveName?: string;    // 성명
  responsibility?: string;   // 책무
  responsibilityDetail?: string; // 책무 세부내용
  managementDuty?: string;   // 책무이행을 위한 주요 관리의무
  relatedBasis?: string;     // 관련근거
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
  const positionOptions: SelectOption[] = [
    { value: 'all', label: '전체' },
    { value: 'chairman', label: '이사회 의장' },
    { value: 'president', label: '은행장' },
    { value: 'executive', label: '상임이사' },
  ];

  // 테이블 컬럼 정의
  const columns: DataGridColumn<ExecutiveResponsibilityRow>[] = [
    {
      field: 'position',
      headerName: '직책',
      flex: 1,
      minWidth: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value, row }) => (
        <span
          style={{
            color: '#1976d2',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
          onClick={() => handlePositionClick(row)}
        >
          {value || '해당없음'}
        </span>
      ),
    },
    {
      field: 'jobTitle',
      headerName: '직위',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'empNo',
      headerName: '사번',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'executiveName',
      headerName: '성명',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'responsibility',
      headerName: '책무',
      flex: 1.5,
      minWidth: 150,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'responsibilityDetail',
      headerName: '책무 세부내용',
      flex: 2,
      minWidth: 200,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'managementDuty',
      headerName: '책무이행을 위한 주요 관리의무',
      flex: 2,
      minWidth: 200,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'relatedBasis',
      headerName: '관련근거',
      flex: 1.5,
      minWidth: 150,
      align: 'left',
      headerAlign: 'center',
    },
  ];

  // 데이터 상태 관리
  const [rows, setRows] = useState<ExecutiveResponsibilityRow[]>([]);

  // 데이터 조회
  const fetchExecutiveResponsibility = useCallback(async () => {
    try {
      setIsLoading(true);

      // API 호출 파라미터 구성
      const params = {
        ledgerOrder: selectedRound?.value as string,
        positionId: selectedPosition?.value === 'all' ? undefined : selectedPosition?.value as string
      };

      console.log('조회 조건:', params);

      // 실제 API 호출
      const data = await executiveResponsibilityApi.getAll();
      console.log("백엔드에서 받은 원본 데이터:", data);
      // API 응답을 페이지에서 사용하는 형태로 변환
      const transformedData: ExecutiveResponsibilityRow[] = data.map((item: any) => ({
        id: item.positionsId || 0,
        position: item.positionNameMapped || '해당없음',
        jobTitle: item.jobTitleCd || '해당없음',
        empNo: item.empId || '해당없음',
        executiveName: item.empId || '해당없음', // empId를 이름으로 사용 (실제로는 별도 필드 필요)
        responsibility: '', // 백엔드에 해당 필드가 없음
        responsibilityDetail: '', // 백엔드에 해당 필드가 없음
        managementDuty: '', // 백엔드에 해당 필드가 없음
        relatedBasis: '' // 백엔드에 해당 필드가 없음
      }));

      console.log("변환된 데이터:", transformedData);
      console.log("!@#$!!");
      setRows(transformedData);

    } catch (err) {
      console.error('데이터 조회 실패:', err);
      setErrorMessage('임원별 책무 현황 데이터를 불러오는데 실패했습니다.');
      setErrorDialogOpen(true);
      setRows([]); // 에러 시 빈 배열로 초기화
    } finally {
      setIsLoading(false);
    }
  }, [selectedRound, selectedPosition]);

  useEffect(() => {
    fetchExecutiveResponsibility();
  }, [fetchExecutiveResponsibility]);

  // 직책 클릭 핸들러
  const handlePositionClick = (row: ExecutiveResponsibilityRow) => {
    console.log('선택된 직책 정보:', row);
    // TODO: 직책 상세 정보 다이얼로그 표시 또는 페이지 이동 구현
    alert(`선택된 직책: ${row.position}\n임원: ${row.executiveName}\n책무: ${row.responsibility}`);
  };

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
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>직책</span>
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
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
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
