/**
 * 직책별 책무 현황 페이지
 * TestGrid.tsx를 대체하는 실제 업무 페이지
 */
import { Box, Chip } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import LedgerOrderSelect from '@/shared/components/ui/form/LedgerOrderSelect';
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import type { DialogMode } from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import PositionSelect from '@/shared/components/ui/form/PositionSelect';
import type { PositionSearchResult } from '@/domains/ledgermngt/api/positionApi';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn, SelectOption } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import PositionResponsibilityDialog from '../components/PositionResponsibilityDialog';
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

const PositionResponsibilityStatusPage: React.FC<IPositionResponsibilityStatusPageProps> = (): React.JSX.Element => {
  const [rows, setRows] = useState<PositionResponsibility[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 필터 상태
  const [selectedPosition, setSelectedPosition] = useState<PositionSearchResult | null>(null);

  // 선택된 행
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>('view');
  const [selectedDetailData, setSelectedDetailData] = useState<PositionResponsibility | null>(null);
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('ALL');
  // 오류 다이얼로그 상태
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 페이징 상태
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    size: 20,
    totalElements: 0,
    totalPages: 0
  });

  // 데이터 로드 함수
  const fetchData = useCallback(async () => {
    console.log("fetchdata in")
    setLoading(true);
    setError(null);

    try {
      let response = null;
      if(selectedPosition===null){
        response = await fetch('/api/position-responsibilities');
      }
      else{
        console.log("selectedPosition.positionsId",selectedPosition.positionsId)
        response = await fetch(`/api/position-responsibilities/${selectedPosition.positionsId}`);
      }
      
      const data = await response.json();
      const mappedRows: PositionResponsibility[] = data.map((item: any) => ({
        ...item,
        positionName: item.positions_name ?? '',
        responsibilityOverview: item.role_summ ?? '',
        responsibilityStartDate: item.created_at ?? '',
        lastModifiedDate: item.updated_at ?? '',
        // 새로운 필드들 추가
        responsibility_mgt_sts: item.responsibility_mgt_sts ?? '',
        responsibility_rel_evid: item.responsibility_rel_evid ?? '',
      }));
      
      setRows(mappedRows);
    }
    catch (err) {
      console.error('데이터 조회 실패:', err);
      setErrorMessage('데이터를 불러오는 데 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }, [selectedPosition,pageInfo.page, pageInfo.size]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 컬럼 정의
  const columns: DataGridColumn<PositionResponsibility>[] = [
    {
      field: 'classification',
      headerName: '구분',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Chip
          label={value}
          size="small"
          color={
            value === '핵심' ? 'error' :
              value === '중요' ? 'warning' :
                value === '일반' ? 'default' : 'default'
          }
        />
      )
    },
    {
      field: 'positionName',
      headerName: '직책',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value, row }) => (
        <span
          style={{ color: 'var(--bank-primary)', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            handleViewDetail(row);
          }}
        >
          {value}
        </span>
      )
    },
    {
      field: 'responsibilityOverview',
      headerName: '책무 개요',
      width: 300,
      flex: 1,
      align: 'left',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Box sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}>
          {value || '해당 없음'}
        </Box>
      )
    },
    {
      field: 'responsibilityStartDate',
      headerName: '책무 시작일',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Box sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}>
          {value || '해당 없음'}
        </Box>
      )
    },
    {
      field: 'lastModifiedDate',
      headerName: '최종 수정일자',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Box sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%'
        }}>
          {value || '해당 없음'}
        </Box>
      )
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
  const handleRowSelectionChange = (selectedRowIds: (string | number)[], selectedData: PositionResponsibility[]) => {
    setSelectedIds(selectedRowIds.map(Number));
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
          {/* <ComboBox
            value={positionFilter}
            onChange={(value) => setPositionFilter(value as string)}
            size="small"
            sx={{ minWidth: '200px' }}
          /> */}
          <PositionSelect
            value={selectedPosition}
            onChange={setSelectedPosition}
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
          {/* <Button
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
          </Button> */}
        </Box>

        {/* 그리드 영역 */}
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
            loading={loading}
            error={error}
            selectable
            multiSelect={false}
            selectedRows={selectedIds}
            onRowSelectionChange={(selectedRows: (string | number)[], selectedData: PositionResponsibility[]) => {
              setSelectedIds(selectedRows.map(Number));
            }}
            rowIdField="id"
          />
        </Box>
      </PageContent>

      {/* 상세 다이얼로그 */}
      <PositionResponsibilityDialog
        open={dialogOpen}
        positionName={selectedDetailData?.positionName || ''}
        onClose={() => setDialogOpen(false)}
        mode={dialogMode}
        responsibilityId={selectedDetailData?.id || null}
        rowData={selectedDetailData} // row 데이터 전달
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
