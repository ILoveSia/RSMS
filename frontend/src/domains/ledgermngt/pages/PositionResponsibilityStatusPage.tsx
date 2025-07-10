/**
 * 직책별 책무 현황 페이지
 * TestGrid.tsx를 대체하는 실제 업무 페이지
 */
import { Box, Chip } from '@mui/material';
import type { GridCallbackDetails, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';
import React, { useCallback, useEffect, useState } from 'react';

import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import type { DialogMode } from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import { ComboBox } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { Groups as GroupsIcon } from '@mui/icons-material';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import ResponsibilityDialog from '../components/ResponsibilityDialog';

interface IPositionResponsibilityStatusPageProps {
  className?: string;
}

interface PositionResponsibility {
  id: number;
  classification: string;
  positionId: string;
  positionName: string;
  responsibilityOverview: string;
  responsibilityStartDate: string;
  lastModifiedDate: string;
  createdAt: string;
  updatedAt: string;
}

// 테스트 데이터
const mockData: PositionResponsibility[] = [
  {
    id: 1,
    classification: '핵심',
    positionId: 'P001',
    positionName: '부장',
    responsibilityOverview: '부서 전반적인 업무 총괄 및 리스크 관리',
    responsibilityStartDate: '2024-01-01',
    lastModifiedDate: '2024-03-20',
    createdAt: '2024-01-01',
    updatedAt: '2024-03-20'
  },
  {
    id: 2,
    classification: '중요',
    positionId: 'P002',
    positionName: '차장',
    responsibilityOverview: '팀 실무 관리 및 성과 모니터링',
    responsibilityStartDate: '2024-01-01',
    lastModifiedDate: '2024-03-19',
    createdAt: '2024-01-01',
    updatedAt: '2024-03-19'
  },
  {
    id: 3,
    classification: '일반',
    positionId: 'P003',
    positionName: '과장',
    responsibilityOverview: '일상적인 업무 수행 및 보고',
    responsibilityStartDate: '2024-01-01',
    lastModifiedDate: '2024-03-18',
    createdAt: '2024-01-01',
    updatedAt: '2024-03-18'
  },
  {
    id: 4,
    classification: '핵심',
    positionId: 'P004',
    positionName: '팀장',
    responsibilityOverview: '팀 업무 총괄 및 인력 관리',
    responsibilityStartDate: '2024-01-01',
    lastModifiedDate: '2024-03-17',
    createdAt: '2024-01-01',
    updatedAt: '2024-03-17'
  },
  {
    id: 5,
    classification: '중요',
    positionId: 'P005',
    positionName: '수석',
    responsibilityOverview: '전문 분야 기술 검토 및 자문',
    responsibilityStartDate: '2024-01-01',
    lastModifiedDate: '2024-03-16',
    createdAt: '2024-01-01',
    updatedAt: '2024-03-16'
  }
];

const PositionResponsibilityStatusPage: React.FC<IPositionResponsibilityStatusPageProps> = (): React.JSX.Element => {
  const [rows, setRows] = useState<PositionResponsibility[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 필터 상태
  const [ledgerOrderFilter, setLedgerOrderFilter] = useState<string>('전체');
  const [positionFilter, setPositionFilter] = useState<string>('전체');

  // 선택된 행
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('view');
  const [selectedDetailData, setSelectedDetailData] = useState<PositionResponsibility | null>(null);

  // 오류 다이얼로그 상태
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 페이징 상태
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [totalCount, setTotalCount] = useState(0);

  // 데이터 로드 함수
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // API 호출 대신 목업 데이터 사용
      const filteredData = mockData.filter(item => {
        const matchesLedgerOrder = ledgerOrderFilter === '전체' || true; // 원장차수는 임시로 모두 통과
        const matchesPosition = positionFilter === '전체' || item.positionName === positionFilter;
        return matchesLedgerOrder && matchesPosition;
      });

      // 페이지네이션 처리
      const start = paginationModel.page * paginationModel.pageSize;
      const end = start + paginationModel.pageSize;
      const paginatedData = filteredData.slice(start, end);

      setRows(paginatedData);
      setTotalCount(filteredData.length);
    } catch (err) {
      console.error('데이터 조회 실패:', err);
      setErrorMessage('데이터를 불러오는 데 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }, [ledgerOrderFilter, positionFilter, paginationModel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 컬럼 정의
  const columns: GridColDef<PositionResponsibility>[] = [
    {
      field: 'classification',
      headerName: '구분',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === '핵심' ? 'error' :
            params.value === '중요' ? 'warning' :
            params.value === '일반' ? 'default' : 'default'
          }
        />
      )
    },
    {
      field: 'positionId',
      headerName: '직책 ID',
      width: 100,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'positionName',
      headerName: '직책',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <span
          style={{ color: 'var(--bank-primary)', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetail(params.row);
          }}
        >
          {params.value}
        </span>
      )
    },
    {
      field: 'responsibilityOverview',
      headerName: '책무 개요',
      flex: 1,
      minWidth: 300,
      align: 'left',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}>
          {params.value || '미작성'}
        </Box>
      )
    },
    {
      field: 'responsibilityStartDate',
      headerName: '책무 시작일',
      width: 120,
      align: 'center',
      headerAlign: 'center'
    },
    {
      field: 'lastModifiedDate',
      headerName: '최종 수정일자',
      width: 120,
      align: 'center',
      headerAlign: 'center'
    }
  ];

  // 상세보기 핸들러
  const handleViewDetail = (row: PositionResponsibility) => {
    setSelectedDetailData(row);
    setDialogMode('view');
    setDialogOpen(true);
  };

  // 수정 저장 핸들러
  const handleSave = async () => {
    try {
      // TODO: API 호출로 데이터 저장
      console.log('저장된 데이터:', selectedDetailData);

      // 목록 새로고침
      await fetchData();
    } catch (err) {
      setErrorMessage('데이터 저장에 실패했습니다.');
      setErrorDialogOpen(true);
    }
  };

  // 엑셀 업로드 핸들러
  const handleExcelUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        // 임시로 성공 메시지만 표시
        console.log('엑셀 파일 선택됨:', file.name);
        alert('엑셀 업로드가 완료되었습니다. (테스트용)');
      }
    };
    input.click();
  };

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = async () => {
    try {
      // 임시로 성공 메시지만 표시
      alert('엑셀 다운로드가 완료되었습니다. (테스트용)');
    } catch (err) {
      setErrorMessage('엑셀 다운로드에 실패했습니다.');
      setErrorDialogOpen(true);
    }
  };

  // 변경이력 핸들러
  const handleChangeHistory = async () => {
    if (selectedIds.length === 0) {
      setErrorMessage('변경이력을 확인할 항목을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    // 임시로 성공 메시지만 표시
    alert('변경이력 조회가 완료되었습니다. (테스트용)');
  };

  // 행 선택 핸들러
  const handleRowSelectionModelChange = (
    rowSelectionModel: GridRowSelectionModel,
    details: GridCallbackDetails
  ) => {
    setSelectedIds(rowSelectionModel.map(id => Number(id)));
  };

  // 오류 다이얼로그 닫기
  const handleCloseErrorDialog = () => {
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
        title="[400] 직책별 책무 현황"
        icon={<GroupsIcon />}
        description="직책별 책무 현황을 조회하고 관리합니다."
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
            label="원장차수"
            value={ledgerOrderFilter}
            options={[
              { value: '전체', label: '전체' },
              { value: '1차', label: '1차' },
              { value: '2차', label: '2차' },
              { value: '3차', label: '3차' }
            ]}
            onChange={(value) => setLedgerOrderFilter(value as string)}
            size="small"
            sx={{ minWidth: '200px' }}
          />
          <ComboBox
            label="직책"
            value={positionFilter}
            options={[
              { value: '전체', label: '전체' },
              { value: '부장', label: '부장' },
              { value: '차장', label: '차장' },
              { value: '과장', label: '과장' },
              { value: '팀장', label: '팀장' },
              { value: '수석', label: '수석' }
            ]}
            onChange={(value) => setPositionFilter(value as string)}
            size="small"
            sx={{ minWidth: '200px' }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={fetchData}
            color="primary"
          >
            조회
          </Button>
        </Box>

        {/* 액션 버튼 영역 */}
        <Box
          sx={{
            display: 'flex',
            gap: '8px',
            marginBottom: '6px',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={handleExcelUpload}
            color="success"
          >
            엑셀 업로드
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleExcelDownload}
            color="success"
          >
            엑셀 다운로드
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleChangeHistory}
            color="warning"
          >
            변경 이력
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setDialogMode('create');
              setSelectedDetailData(null);
              setDialogOpen(true);
            }}
            color="primary"
          >
            등록
          </Button>
        </Box>

        {/* 그리드 영역 */}
        <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            checkboxSelection
            disableRowSelectionOnClick
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
            rowCount={totalCount}
            rowSelectionModel={selectedIds}
            onRowSelectionModelChange={handleRowSelectionModelChange}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'var(--bank-primary-bg) !important',
                fontWeight: 'bold',
                color: 'var(--bank-text-primary)',
              },
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
              },
            }}
          />
        </Box>
      </PageContent>

      {/* 상세 다이얼로그 */}
      <ResponsibilityDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
        responsibilityId={selectedDetailData?.id || null}
        onSave={handleSave}
        onChangeMode={setDialogMode}
      />

      {/* 오류 다이얼로그 */}
      <ErrorDialog
        open={errorDialogOpen}
        onClose={handleCloseErrorDialog}
        errorMessage={errorMessage}
      />
    </PageContainer>
  );
};

export default PositionResponsibilityStatusPage;
