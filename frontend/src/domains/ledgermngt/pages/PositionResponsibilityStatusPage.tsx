/**
 * 직책별 책무 현황 페이지
 * TestGrid.tsx를 대체하는 실제 업무 페이지
 */
import { Box, Chip, Typography } from '@mui/material';
import type { GridCallbackDetails, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';
import React, { useCallback, useEffect, useState } from 'react';

import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { Dialog } from '@/shared/components/modal/Dialog';
import { Button } from '@/shared/components/ui/button';
import { ComboBox } from '@/shared/components/ui/form';
import type { GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';

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
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDetailData, setSelectedDetailData] = useState<PositionResponsibility | null>(null);

  // 오류 다이얼로그 상태
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 페이징 상태
  const [paginationModel, setPaginationModel] = useState({
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
    setDetailDialogOpen(true);
  };

  // 수정 핸들러
  const handleEditResponsibility = (row: PositionResponsibility) => {
    setSelectedDetailData(row);
    setEditDialogOpen(true);
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
    <div className='main-content'>
      {/* 페이지 제목 */}
      <div className='responsibility-header'>
        <h1 className='responsibility-header__title'>★ [400] 직책별 책무 현황</h1>
      </div>

      {/* 노란색 구분선 */}
      <div className='responsibility-divider'></div>

      {/* 메인 콘텐츠 영역 */}
      <div className='responsibility-section' style={{ marginTop: '20px' }}>
        {/* 검색 필터 영역 */}
        <div
          style={{
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
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            원장차수
          </Typography>
          <ComboBox
            value={ledgerOrderFilter}
            onChange={(newValue) => setLedgerOrderFilter(newValue as string || '전체')}
            options={[
              { value: '전체', label: '전체' },
              { value: '1', label: '1차' },
              { value: '2', label: '2차' },
              { value: '3', label: '3차' }
            ]}
            size="small"
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', ml: 2 }}>
            직책
          </Typography>
          <ComboBox
            value={positionFilter}
            onChange={(newValue) => setPositionFilter(newValue as string || '전체')}
            options={[
              { value: '전체', label: '전체' },
              { value: '팀장', label: '팀장' },
              { value: '부장', label: '부장' },
              { value: '과장', label: '과장' }
            ]}
            size="small"
          />

          <Button
            variant="contained"
            size="small"
            onClick={fetchData}
            color="primary"
          >
            조회
          </Button>
        </div>

        {/* 버튼 영역 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleExcelUpload}
            color="success"
            sx={{ mr: 1 }}
          >
            엑셀 업로드
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleExcelDownload}
            color="success"
            sx={{ mr: 1 }}
          >
            엑셀 다운로드
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleChangeHistory}
            color="primary"
          >
            변경이력
          </Button>
        </Box>

        {/* 데이터 그리드 */}
        <Box sx={{ height: 600, width: '100%', display: 'flex', flexDirection: 'column' }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            rowCount={totalCount}
            paginationMode="server"
            pageSizeOptions={[10, 20, 50]}
            paginationModel={{
              page: paginationModel.page,
              pageSize: paginationModel.pageSize,
            }}
            onPaginationModelChange={(model: GridPaginationModel) =>
              setPaginationModel({ ...model })
            }
            checkboxSelection
            rowSelectionModel={selectedIds}
            onRowSelectionModelChange={handleRowSelectionModelChange}
            sx={{
              height: '100%',
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

        {/* 상세 정보 다이얼로그 */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          title="책무 상세 정보"
          maxWidth="md"
          fullWidth
        >
          {selectedDetailData && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">구분</Typography>
                <Chip
                  label={selectedDetailData.classification}
                  size="small"
                  color={
                    selectedDetailData.classification === '핵심' ? 'error' :
                    selectedDetailData.classification === '중요' ? 'warning' :
                    selectedDetailData.classification === '일반' ? 'default' : 'default'
                  }
                />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
                <div>
                  <Typography variant="subtitle2">직책 ID</Typography>
                  <Typography>{selectedDetailData.positionId}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2">직책명</Typography>
                  <Typography>{selectedDetailData.positionName}</Typography>
                </div>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2">책무 개요</Typography>
                <Typography style={{ whiteSpace: 'pre-wrap' }}>
                  {selectedDetailData.responsibilityOverview || '미작성'}
                </Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <div>
                  <Typography variant="subtitle2">책무 시작일</Typography>
                  <Typography>{selectedDetailData.responsibilityStartDate}</Typography>
                </div>
                <div>
                  <Typography variant="subtitle2">최종 수정일</Typography>
                  <Typography>{selectedDetailData.lastModifiedDate}</Typography>
                </div>
              </Box>
            </Box>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={() => setDetailDialogOpen(false)}>닫기</Button>
          </Box>
        </Dialog>

        {/* 에러 다이얼로그 */}
        <ErrorDialog
          open={errorDialogOpen}
          errorMessage={errorMessage}
          onClose={handleCloseErrorDialog}
        />
      </div>
    </div>
  );
};

export default PositionResponsibilityStatusPage;
