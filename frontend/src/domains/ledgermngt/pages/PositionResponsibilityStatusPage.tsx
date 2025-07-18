/**
 * 직책별 책무 현황 페이지
 * TestGrid.tsx를 대체하는 실제 업무 페이지
 */
import { Box, Chip } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import type { DialogMode } from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { ComboBox } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import ResponsibilityDialog from '../components/ResponsibilityDialog';
import type { SelectOption } from '@/shared/types/common';
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
const ledgerOrderFilterOptions: SelectOption[] = [
    { value: '2024-001', label: '2024-001' },
    { value: '2024-002', label: '2024-002' },
    { value: '2024-003', label: '2024-003' }
  ];
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
  const [ledgerOrderFilter, setLedgerOrderFilter] = useState<string>('');
  const [positionFilter, setPositionFilter] = useState<string>('');

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
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    size: 20,
    totalElements: 0,
    totalPages: 0
  });

  // 데이터 로드 함수
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // API 호출 대신 목업 데이터 사용
      const response = await fetch('/api/position-responsibilities');
      const data = await response.json();
      console.log('data: ', data);
      const mappedRows: PositionResponsibility[] = data.map((item: any) => ({
        ...item,
        positionName: item.positions_name ?? '',
        responsibilityOverview: item.role_summ ?? '',
        responsibilityStartDate: item.created_at ?? '',
        lastModifiedDate: item.updated_at ?? '',
      }));
      setRows(mappedRows);
      console.log('mappedRows: ', mappedRows);
    } catch (err) {
      console.error('데이터 조회 실패:', err);
      setErrorMessage('데이터를 불러오는 데 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }, [ledgerOrderFilter, positionFilter, pageInfo.page, pageInfo.size]);

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
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>책무번호</span>
          <ComboBox
            value={ledgerOrderFilter}
            options={ledgerOrderFilterOptions}
            onChange={value => setLedgerOrderFilter(value as string)}
            size="small"
            sx={{ width: '130px' }}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333',marginLeft: '16px'  }}>직책</span>
          <ComboBox
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
          <DataGrid<PositionResponsibility>
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
