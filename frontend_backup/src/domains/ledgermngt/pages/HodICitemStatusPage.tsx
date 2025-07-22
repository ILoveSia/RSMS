import { Button } from '@/shared/components/ui';
import { DataGrid } from '@/shared/components/ui/data-display';
import { LedgerOrderSelect } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Box } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { hodICItemApi, type HodICItemRow } from '../api/hodIcItemApi';
import HodICItemDialog from '../components/HodICItemDialog';

interface IHodICitemStatusPageProps {
  className?: string;
}

const HodICitemStatusPage: React.FC<IHodICitemStatusPageProps> = (): React.JSX.Element => {
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rows, setRows] = useState<HodICItemRow[]>([]);

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('view');
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>();

  // 원장차수 관련 상태는 LedgerOrderSelect에서 자동 관리됨

  // 컬럼 정의 - API 응답 구조에 맞게 수정
  const columns: DataGridColumn<HodICItemRow>[] = [
    {
      field: 'responsibilityId',
      headerName: '책무ID',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'responsibilityContent',
      headerName: '책무내용',
      width: 200,
      flex: 1,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'deptCd',
      headerName: '부서명',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'fieldTypeCd',
      headerName: '항목구분',
      width: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'roleTypeCd',
      headerName: '직무구분',
      width: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'icTask',
      headerName: '내부통제 업무',
      width: 150,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'measureDesc',
      headerName: '조치활동',
      width: 150,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'measureType',
      headerName: '조치유형',
      width: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'periodCd',
      headerName: '주기',
      width: 80,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'supportDoc',
      headerName: '관련근거',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'checkPeriod',
      headerName: '점검시기',
      width: 100,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'checkWay',
      headerName: '점검방법',
      width: 120,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'createdAt',
      headerName: '등록일자',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        return params.value ? new Date(params.value).toLocaleDateString('ko-KR') : '';
      },
    },
    {
      field: 'updatedAt',
      headerName: '최종수정일자',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        return params.value ? new Date(params.value).toLocaleDateString('ko-KR') : '';
      },
    },
  ];

  // 초기 데이터 로드
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await hodICItemApi.getHodICItemStatusList(
        selectedLedgerOrder === 'ALL' ? undefined : selectedLedgerOrder
      );
      setRows(data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedLedgerOrder]);

  // 원장차수 목록은 LedgerOrderSelect에서 자동으로 로드됨

  const handleExcelDownload = useCallback(() => {
    // 엑셀 다운로드 로직
    console.log('엑셀 다운로드');
  }, [rows]);

  const handleCreateClick = useCallback(() => {
    setDialogMode('create');
    setSelectedItemId(undefined);
    setDialogOpen(true);
  }, []);

  const handleRowDoubleClick = useCallback((row: HodICItemRow) => {
    setDialogMode('view');
    setSelectedItemId(row.hodIcItemId);
    setDialogOpen(true);
  }, []);

  const handleRowClick = useCallback((row: HodICItemRow) => {
    setDialogMode('view');
    setSelectedItemId(row.hodIcItemId);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async () => {
    if (selectedIds.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!confirm(`선택한 ${selectedIds.length}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setLoading(true);

      if (selectedIds.length === 1) {
        await hodICItemApi.deleteHodICItem(selectedIds[0]);
      } else {
        await hodICItemApi.deleteMultipleHodICItems(selectedIds);
      }

      alert('삭제가 완료되었습니다.');
      setSelectedIds([]);
      await handleSearch(); // 데이터 새로고침
    } catch (err) {
      console.error('Failed to delete items:', err);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedIds, handleSearch]);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setSelectedItemId(undefined);
  }, []);

  const handleDialogSuccess = useCallback(async () => {
    await handleSearch(); // 데이터 새로고침
  }, [handleSearch]);

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
        title='[200] 부서장 내부통제 항목 현황'
        icon={<GroupsIcon />}
        description='부서장 내부통제 항목별 현황을 조회하고 관리합니다.'
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
        <Box
          sx={{
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
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>책무번호</span>
          <LedgerOrderSelect
            value={selectedLedgerOrder}
            onChange={setSelectedLedgerOrder}
            size='small'
            sx={{ minWidth: 150, maxWidth: 200 }}
          />
          <Button variant='contained' size='small' onClick={handleSearch} color='primary'>
            조회
          </Button>
          <Box sx={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <Button
              variant='contained'
              size='small'
              color='success'
              onClick={() => {
                /* 확정 로직 미구현 */
              }}
            >
              확정
            </Button>
            <Button
              variant='contained'
              size='small'
              color='error'
              onClick={() => {
                /* 확정취소 로직 미구현 */
              }}
            >
              확정취소
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
          <Button
            variant='contained'
            size='small'
            color='success'
            onClick={handleExcelDownload}
            sx={{ mr: 1 }}
          >
            엑셀 다운로드
          </Button>
          <Button
            variant='contained'
            size='small'
            color='primary'
            onClick={handleCreateClick}
            sx={{ mr: 1 }}
          >
            등록
          </Button>
          <Button variant='contained' size='small' onClick={handleDelete} color='error'>
            삭제
          </Button>
        </Box>
        <Box sx={{ width: '100%', flex: 1 }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <DataGrid
            data={rows}
            columns={columns}
            loading={loading}
            selectable={true}
            multiSelect={true}
            selectedRows={selectedIds}
            onRowSelectionChange={selectedRows => {
              setSelectedIds(selectedRows.map(id => Number(id)));
            }}
            onRowClick={handleRowClick}
            onRowDoubleClick={handleRowDoubleClick}
            rowIdField='hodIcItemId'
            sx={{
              width: '100%',
              height: '100%',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'var(--bank-bg-secondary) !important',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
              },
            }}
          />
        </Box>
      </PageContent>

      {/* 다이얼로그 */}
      <HodICItemDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        mode={dialogMode}
        itemId={selectedItemId}
        onSuccess={handleDialogSuccess}
      />
    </PageContainer>
  );
};

export default HodICitemStatusPage;
