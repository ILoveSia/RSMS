/**
 * 미흡상황 현황 페이지 컴포넌트
 * 컴플라이언스 체크 - 미흡상황 현황 관리
 */
import '@/assets/scss/style.css';
import { Button } from '@/shared/components/ui/button';
import { Modal } from '@/shared/components/ui/feedback';
import { Select } from '@/shared/components/ui/form';
import { Box, Typography } from '@mui/material';
import { DataGrid, type GridColDef, type GridRowId } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';

interface IDeficiencyStatusPageProps {
  className?: string;
}

// 미흡상황 데이터 타입 정의
interface DeficiencyRow {
  deficiencyId: number;
  improvementPlan: string;
  implementationResult: string;
  inspector: string;
  deficiencyContent: string;
  writeDate: string;
}

const DeficiencyStatusPage: React.FC<IDeficiencyStatusPageProps> = (): React.JSX.Element => {
  const [rows, setRows] = useState<DeficiencyRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [inspectionRound, setInspectionRound] = useState<string>('2024-001');
  const [departmentFilter, setDepartmentFilter] = useState<string>('전체');
  const [selectedIds, setSelectedIds] = useState<GridRowId[]>([]);

  // 오류 다이얼로그 상태
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 데이터 로드 함수
  const fetchDeficiencies = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (departmentFilter !== '전체') {
      params.append('department', departmentFilter);
    }

    try {
      // 임시 테스트 데이터 (실제 구현 시 API 호출로 대체)
      const mockData: DeficiencyRow[] = [
        {
          deficiencyId: 1,
          improvementPlan: '일일 리스크 보고서 작성 프로세스 재정비 및 체크리스트 구축',
          implementationResult: '진행중 (75% 완료)',
          inspector: '김점검',
          deficiencyContent: '시장리스크 모니터링 보고서 미제출',
          writeDate: '2024-01-15'
        },
        {
          deficiencyId: 2,
          improvementPlan: '월간 준법점검 절차 매뉴얼 재작성 및 담당자 교육 실시',
          implementationResult: '계획수립 완료',
          inspector: '이감사',
          deficiencyContent: '준법점검 절차서 미비 및 점검 주기 불일치',
          writeDate: '2024-01-20'
        },
        {
          deficiencyId: 3,
          improvementPlan: '내부통제 평가 기준 재정립 및 평가지표 개선',
          implementationResult: '완료',
          inspector: '박감독',
          deficiencyContent: '통제활동 평가 기준 미달 및 문서화 부족',
          writeDate: '2024-01-10'
        }
      ];

      setRows(mockData);
    } catch (err) {
      setError('미흡상황 현황 데이터를 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [departmentFilter]);

  useEffect(() => {
    fetchDeficiencies();
  }, [fetchDeficiencies]);

  // 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'improvementPlan',
      headerName: '개선계획',
      width: 300,
      flex: 2,
      renderCell: (params) => (
        <span
          style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            handleDeficiencyClick(params.row.deficiencyId);
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: 'implementationResult',
      headerName: '이행결과',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const stringValue = String(params.value);
        return (
          <span
            style={{
              color: stringValue.includes('완료') ? '#2e7d32' :
                     stringValue.includes('진행중') ? '#ed6c02' : '#1976d2',
              fontWeight: 'bold'
            }}
          >
            {params.value}
          </span>
        );
      }
    },
    {
      field: 'inspector',
      headerName: '점검자',
      width: 120,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'deficiencyContent',
      headerName: '미흡사항',
      width: 250,
      flex: 1
    },
    {
      field: 'writeDate',
      headerName: '작성일자',
      width: 110,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: ({ value }) => dayjs(value).format('YYYY.MM.DD')
    },
  ];

  // 조회 버튼 클릭 핸들러
  const handleSearch = () => {
    fetchDeficiencies();
  };

  // 개선계획 셀 클릭 핸들러
  const handleDeficiencyClick = (deficiencyId: number) => {
    console.log('미흡상황 상세조회:', deficiencyId);
    // TODO: 상세조회 다이얼로그 구현
  };

  // 개선계획 변경 버튼 클릭 핸들러
  const handleImprovementPlanChange = () => {
    if (selectedIds.length === 0) {
      setErrorMessage('개선계획을 변경할 항목을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }
    console.log('개선계획 변경:', selectedIds);
    // TODO: 개선계획 변경 다이얼로그 구현
  };

  // 이행결과 작성 버튼 클릭 핸들러
  const handleImplementationWrite = () => {
    if (selectedIds.length === 0) {
      setErrorMessage('이행결과를 작성할 항목을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }
    console.log('이행결과 작성:', selectedIds);
    // TODO: 이행결과 작성 다이얼로그 구현
  };

  // 승인하기 버튼 클릭 핸들러
  const handleApproval = () => {
    if (selectedIds.length === 0) {
      setErrorMessage('승인할 항목을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }
    console.log('승인하기:', selectedIds);
    // TODO: 승인 다이얼로그 구현
  };

  // 오류 다이얼로그 닫기
  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

  const inspectionRoundOptions = [
    { value: '2024-001', label: '2024-001' },
    { value: '2024-002', label: '2024-002' },
    { value: '2024-003', label: '2024-003' },
  ];

  const departmentOptions = [
    { value: '전체', label: '전체' },
    { value: '영업부', label: '영업부' },
    { value: '인사부', label: '인사부' },
    { value: '재무부', label: '재무부' },
  ];

  return (
    <div className="main-content">
      <div className="responsibility-header">
        <h1 className="responsibility-header__title">★ [1200] 미흡상황 현황</h1>
      </div>
      <div className="responsibility-divider"></div>

      <div className="responsibility-section" style={{ marginTop: '20px' }}>
        {/* 필터 영역 */}
        <Box sx={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          alignItems: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          padding: '8px 16px',
          borderRadius: '4px'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>
            점검회차
          </span>
          <Select
            value={inspectionRound}
            onChange={(value) => setInspectionRound(value as string)}
            options={inspectionRoundOptions}
            size="small"
            style={{ width: 120 }}
          />

          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>
            부서
          </span>
          <Select
            value={departmentFilter}
            onChange={(value) => setDepartmentFilter(value as string)}
            options={departmentOptions}
            size="small"
            style={{ width: 120 }}
          />

          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleSearch}
            style={{ marginLeft: '8px' }}
          >
            조회
          </Button>
        </Box>

        {/* 버튼 영역 */}
        <Box sx={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          justifyContent: 'flex-end'
        }}>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleImprovementPlanChange}
          >
            개선계획 변경
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleImplementationWrite}
          >
            이행결과 작성
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={handleApproval}
          >
            승인하기
          </Button>
        </Box>

        {/* 그리드 영역 */}
        <Box sx={{ width: '100%', height: 400 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(row: DeficiencyRow) => row.deficiencyId}
            checkboxSelection
            disableRowSelectionOnClick
            disableMultipleRowSelection={true}
            onRowSelectionModelChange={(newSelection) => {
              // 단일 선택만 허용하므로 마지막 선택된 항목만 사용
              const selectedId = newSelection[newSelection.length - 1];
              setSelectedIds(selectedId ? [selectedId] : []);
            }}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10 }
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            localeText={{
              noRowsLabel: '표시할 데이터가 없습니다.',
              MuiTablePagination: {
                labelRowsPerPage: '페이지당 행 수:',
                labelDisplayedRows: ({ from, to, count }) =>
                  `${from}-${to} / ${count}`,
              },
              columnMenuLabel: '메뉴',
              columnMenuShowColumns: '열 표시',
              columnMenuFilter: '필터',
              columnMenuHideColumn: '숨기기',
              columnMenuUnsort: '정렬 해제',
              columnMenuSortAsc: '오름차순 정렬',
              columnMenuSortDesc: '내림차순 정렬',
            }}
          />
        </Box>

        {/* 오류 다이얼로그 */}
        <Modal
          open={errorDialogOpen}
          onClose={handleCloseErrorDialog}
          title="알림"
        >
          <Typography>{errorMessage}</Typography>
        </Modal>
      </div>
    </div>
  );
};

export default DeficiencyStatusPage;
