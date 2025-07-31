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

import { Groups as GroupsIcon } from '@mui/icons-material';
import { Box } from '@mui/material';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import executiveResponsibilityApi from '../api/executiveResponsibilityApi';
import ExecutiveResponsibilityDialog from '../components/ExecutiveResponsibilityDialog';
import PositionSelect from '@/shared/components/ui/form/PositionSelect';
import type { PositionSearchResult } from '@/domains/ledgermngt/api/positionApi';
import {
  getCodeName,
  extractCommonCodes,
  type CommonCode
} from '@/shared/utils/codeUtils';
import { useReduxState } from '@/app/store/use-store';
interface IExecutiveResponsibilityStatusPageProps {
  className?: string;
}

// 개별 데이터 항목
interface ExecutiveResponsibilityItem {
  id: number;
  position: string;          // 직책
  jobTitle?: string;         // 직위
  empNo?: string;            // 사번
  empName?: string;          // 성명
  responsibility?: string;   // 책무 내용
  responsibilityOverview?: string; // 책무 개요
  responsibilityDetail?: string; // 책무 세부내용
  managementDuty?: string;   // 책무이행을 위한 주요 관리의무
  relatedBasis?: string;     // 관련근거
}

// 그룹화된 데이터
interface ExecutiveResponsibilityRow {
  id: string;                // 그룹 ID (position 기반)
  position: string;          // 직책
  items: ExecutiveResponsibilityItem[]; // 해당 직책의 모든 데이터
  count: number;             // 데이터 개수
  empName: string;
}


const ExecutiveResponsibilityStatusPage: React.FC<IExecutiveResponsibilityStatusPageProps> = () => {
  // 상태 관리
  const [selectedPosition, setSelectedPosition] = useState<PositionSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogData, setDialogData] = useState<any>(null);

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
      count: items.length,
      empName: items[0].empName || '해당없음'
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
      renderCell: ({ row }) => renderArrayValue(row.items, 'jobTitle'),
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
      field: 'empName' as keyof ExecutiveResponsibilityRow,
      headerName: '성명',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => renderArrayValue(row.items, 'empName'),
    },
    {
      field: 'responsibility' as keyof ExecutiveResponsibilityRow,
      headerName: '책무 내용',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => renderArrayValue(row.items, 'responsibility'),
    },
    {
      field: 'responsibilityOverview' as keyof ExecutiveResponsibilityRow,
      headerName: '책무 개요',
      flex: 1,
      minWidth: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => renderArrayValue(row.items, 'responsibilityOverview'),
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
  const [allExecutiveData, setAllExecutiveData] = useState<ExecutiveResponsibilityItem[]>([]);

  // Redux에서 공통코드 가져오기 (AuditItemStatusPage 방식 참고)
  const { data: allCodesData } = useReduxState<{ data: CommonCode[] } | CommonCode[]>('codeStore/allCodes');

  // 공통코드 배열 추출
  const currentAllCodes = useMemo(() => extractCommonCodes(allCodesData), [allCodesData]);

  // API 데이터를 변환하는 함수
  const transformApiData = useCallback((data: any[]): ExecutiveResponsibilityItem[] => {
    return data.map((item: any) => {
      const jobTitleCode = item.jobTitleCd || item.positionCode;
      const jobTitleName = getCodeName(currentAllCodes, 'JOB_RANK', jobTitleCode);

      return {
        id: item.positionsId || 0,
        position: item.positionsNm || '해당없음',
        jobTitle: jobTitleName || jobTitleCode || '해당없음',
        empNo: item.empNo || '해당없음',
        empName: item.empName || '해당없음',
        responsibility: item.responsibilityContent || '해당없음',
        responsibilityOverview: item.roleSumm || '해당없음',
        responsibilityDetail: item.responsibilityDetailContent || '해당없음',
        managementDuty: item.responsibilityMgtSts || '해당없음',
        relatedBasis: item.responsibilityRelEvid || '해당없음'
      };
    });
  }, [currentAllCodes]);

  // 에러 처리 함수
  const handleError = useCallback((error: any, message: string) => {
    console.error('데이터 조회 실패:', error);
    setErrorMessage(message);
    setErrorDialogOpen(true);
  }, []);

  // 모든 데이터 로드
  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await executiveResponsibilityApi.getAll();
      const transformedItems = transformApiData(data);
      setAllExecutiveData(transformedItems);
    } catch (err) {
      handleError(err, '임원별 책무 현황 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [transformApiData, handleError]);

  // 데이터 그룹핑 및 표시 함수
  const updateDisplayData = useCallback((data: ExecutiveResponsibilityItem[]) => {
    const groupedData = groupDataByPosition(data);
    setRows(groupedData);
  }, []);

  // 필터링 및 데이터 업데이트
  const applyFiltersAndUpdate = useCallback(() => {
    let filtered = allExecutiveData;

    // 직책 필터링
    if (selectedPosition?.positionsId) {
      filtered = filtered.filter(item => item.position === selectedPosition.positionsNm);
    }

    updateDisplayData(filtered);
  }, [allExecutiveData, selectedPosition, updateDisplayData]);

  // 다이얼로그 관련 함수들
  const handlePositionClick = useCallback((row: ExecutiveResponsibilityRow) => {
    setDialogData(row);
    setDialogOpen(true);
  }, []);

  const handleErrorDialogClose = useCallback(() => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setDialogData(null);
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    if (allExecutiveData.length > 0) {
      applyFiltersAndUpdate();
    }
  }, [applyFiltersAndUpdate, allExecutiveData]);

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
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>직책</span>
          <PositionSelect
            value={selectedPosition}
            onChange={setSelectedPosition}
            size="small"
            sx={{ minWidth: '200px' }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={applyFiltersAndUpdate}
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
        onClose={handleDialogClose}
        data={dialogData}
      />
    </PageContainer>
  );
};

export default ExecutiveResponsibilityStatusPage;
