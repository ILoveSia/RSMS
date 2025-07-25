/**
 * 임원별 책무 현황 페이지
 * 책무구조 원장 관리 - 임원별 책무 현황
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import LedgerOrderSelect from '@/shared/components/ui/form/LedgerOrderSelect';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Box } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import executiveResponsibilityApi from '../api/executiveResponsibilityApi';
import ExecutiveResponsibilityDialog from '../components/ExecutiveResponsibilityDialog';
import PositionSelect from '@/shared/components/ui/form/PositionSelect';
import type { PositionSearchResult } from '@/domains/ledgermngt/api/positionApi';
interface IExecutiveResponsibilityStatusPageProps {
  className?: string;
}

// 개별 데이터 항목
interface ExecutiveResponsibilityItem {
  id: number;
  position: string;          // 직책
  jobTitle?: string;         // 직위
  empNo?: string;            // 사번
  executiveName?: string;    // 성명
  jobRank?: string;          // 직위
  responsibility?: string;   // 책무
  responsibilityDetail?: string; // 책무 세부내용
  managementDuty?: string;   // 책무이행을 위한 주요 관리의무
  relatedBasis?: string;     // 관련근거
  execofficer_dt?: string;   // 임원 일자
}

// 그룹화된 데이터
interface ExecutiveResponsibilityRow {
  id: string;                // 그룹 ID (position 기반)
  position: string;          // 직책
  items: ExecutiveResponsibilityItem[]; // 해당 직책의 모든 데이터
  count: number;             // 데이터 개수
}


const ExecutiveResponsibilityStatusPage: React.FC<IExecutiveResponsibilityStatusPageProps> = () => {
  // 상태 관리
  const [selectedPosition, setSelectedPosition] = useState<PositionSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogData, setDialogData] = useState<any>(null);
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('ALL');

  // 그룹화 함수
  const groupDataByPosition = (data: ExecutiveResponsibilityItem[]): ExecutiveResponsibilityRow[] => {
    const groupMap = new Map<string, ExecutiveResponsibilityItem[]>();

    data.forEach(item => {
      const position = item.position || '해당없음';
      if (!groupMap.has(position)) {
        groupMap.set(position, []);
      }
      groupMap.get(position)!.push(item);
    });

    return Array.from(groupMap.entries()).map(([position, items]) => ({
      id: position,
      position,
      items,
      count: items.length
    }));
  };

  // 배열 값을 표시하는 헬퍼 함수
  const renderArrayValue = (items: ExecutiveResponsibilityItem[], field: keyof ExecutiveResponsibilityItem): string => {
    const values = items.map(item => item[field]).filter(Boolean);
    const uniqueValues = [...new Set(values)];

    if (uniqueValues.length === 0) return '해당없음';
    if (uniqueValues.length === 1) return String(uniqueValues[0]);
    return `${uniqueValues[0]} 외 ${uniqueValues.length - 1}개`;
  };

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
          {String(value || '해당없음')}
        </span>
      ),
    },
    {
      field: 'jobRank' as keyof ExecutiveResponsibilityRow,
      headerName: '직위',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => renderArrayValue(row.items, 'jobRank'),
    },
    {
      field: 'empNo' as keyof ExecutiveResponsibilityRow,
      headerName: '사번',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => renderArrayValue(row.items, 'empNo'),
    },
    {
      field: 'executiveName' as keyof ExecutiveResponsibilityRow,
      headerName: '성명',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => renderArrayValue(row.items, 'executiveName'),
    },
    {
      field: 'responsibility' as keyof ExecutiveResponsibilityRow,
      headerName: '책무',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => renderArrayValue(row.items, 'responsibility'),
    },
    {
      field: 'responsibilityDetail' as keyof ExecutiveResponsibilityRow,
      headerName: '책무 세부내용',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => renderArrayValue(row.items, 'responsibilityDetail'),
    },
    {
      field: 'managementDuty' as keyof ExecutiveResponsibilityRow,
      headerName: '책무이행을 위한 주요 관리의무',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => renderArrayValue(row.items, 'managementDuty'),
    },
    {
      field: 'relatedBasis' as keyof ExecutiveResponsibilityRow,
      headerName: '관련근거',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => renderArrayValue(row.items, 'relatedBasis'),
    },
  ];

  // 데이터 상태 관리
  const [rows, setRows] = useState<ExecutiveResponsibilityRow[]>([]);

  // 데이터 조회
  const fetchExecutiveResponsibility = useCallback(async () => {
    try {
      setIsLoading(true);

      // API 호출 파라미터 구성
      let data = null;
      if (selectedPosition === null) {
        // 실제 API 호출
        data = await executiveResponsibilityApi.getAll();
      } else {
        data = await executiveResponsibilityApi.getByPositionId(selectedPosition.positionsId);
      }

      // API 응답을 개별 항목 형태로 변환
      const transformedItems: ExecutiveResponsibilityItem[] = data.map((item: any) => ({
        id: item.positionsId || 0,
        position: item.positionNameMapped || '해당없음',
        jobTitle: item.jobTitleCd || '해당없음',
        empNo: item.num || '해당없음',
        executiveName: item.empId || '해당없음', // empId를 이름으로 사용 (실제로는 별도 필드 필요)
        responsibility: item.responsibilityContent || '해당없음',
        responsibilityDetail: item.responsibilityDetailContent || '해당없음',
        managementDuty: item.responsibilityMgtSts || '해당없음',
        relatedBasis: item.responsibilityRelEvid || '해당없음',
        jobRank: item.jobRankCd || '해당없음',
        execofficer_dt: item.execofficer_dt || '해당없음'
      }));

      // 직책별로 그룹화
      const groupedData = groupDataByPosition(transformedItems);
      setRows(groupedData);

    } catch (err) {
      console.error('데이터 조회 실패:', err);
      setErrorMessage('임원별 책무 현황 데이터를 불러오는데 실패했습니다.');
      setErrorDialogOpen(true);
      setRows([]); // 에러 시 빈 배열로 초기화
    } finally {
      setIsLoading(false);
    }
  }, [selectedPosition]);

  useEffect(() => {
    fetchExecutiveResponsibility();
  }, [fetchExecutiveResponsibility]);

  // 직책 클릭 핸들러
  const handlePositionClick = (row: ExecutiveResponsibilityRow) => {
    // TODO: 직책 상세 정보 다이얼로그 표시 또는 페이지 이동 구현
    setDialogData(row);
    setDialogOpen(true);
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
          minHeight: 0,
          position: 'relative', // 좌우 패딩을 3으로 수정
          py: 1,
          px: 0,
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
          <LedgerOrderSelect
            value={selectedLedgerOrder}
            onChange={setSelectedLedgerOrder}
            size='small'
            sx={{ minWidth: 150, maxWidth: 200 }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>직책</span>
          <PositionSelect
            value={selectedPosition}
            onChange={setSelectedPosition}
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
      <ExecutiveResponsibilityDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setDialogData(null);
        }}
        data={dialogData}
      />
    </PageContainer>
  );
};

export default ExecutiveResponsibilityStatusPage;
