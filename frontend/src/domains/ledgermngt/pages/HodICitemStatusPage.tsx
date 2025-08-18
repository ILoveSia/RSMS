import { Button, SearchButton, ManagementButtonGroup, ExcelDownloadButton } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { LedgerOrdersHodSelect, CommonCodeSelect } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import Toast from '@/shared/components/ui/feedback/Toast';
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
  const [selectedLedgerOrderId, setSelectedLedgerOrderId] = useState<number | undefined>();
  const [selectedLedgerOrderStatusCd, setSelectedLedgerOrderStatusCd] = useState<string | undefined>();
  const [selectedFieldType, setSelectedFieldType] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rows, setRows] = useState<HodICItemRow[]>([]);

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('view');
  const [selectedItemId, setSelectedItemId] = useState<number | undefined>();
  const [selectedRowApprovalStatus, setSelectedRowApprovalStatus] = useState<string>('');

  // 부서장차수생성 상태
  const [hodGenerating, setHodGenerating] = useState<boolean>(false);
  
  // 부서장 원장차수 새로고침 트리거
  const [hodRefreshTrigger, setHodRefreshTrigger] = useState<number>(0);
  
  // 스낵바 상태
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();

  // 컬럼 정의 - 요청하신 순서대로 변경
  const columns: DataGridColumn<HodICItemRow>[] = [
    {
      field: 'approvalStatus',
      headerName: '결재상태',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => {
        const status = params.row.approvalStatus;
        let statusText = '';
        let statusColor = '#666';

        switch (status) {
          case 'NONE':
            statusText = '미결재';
            statusColor = '#999';
            break;
          case 'SUBMITTED':
              statusText = '상신';
              statusColor = '#2196f3';
              break;  
          case 'IN_PROGRESS':
            statusText = '진행중';
            statusColor = '#ff9800';
            break;
          case 'APPROVED':
            statusText = '승인';
            statusColor = '#4caf50';
            break;
          case 'REJECTED':
            statusText = '반려';
            statusColor = '#f44336';
            break;
          default:
            statusText = status || '미결재';
            statusColor = '#999';
        }

        return (
          <Box
            component="span"
            sx={{
              color: statusColor,
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            {statusText}
          </Box>
        );
      },
    },
    {
      field: 'responsibilityContent',
      headerName: '책무',
      width: 140,
      align: 'left',
      headerAlign: 'center',
      renderCell: params => {
        return (
          <Box
            component="span"
            sx={{
              color: 'var(--bank-primary)',
              textDecoration: 'underline',
              cursor: 'pointer',
              '&:hover': {
                color: 'var(--bank-primary-dark)',
              },
            }}
            onClick={() => handleRowClick(params.row)}
          >
            {params.value}
          </Box>
        );
      },
    },
    {
      field: 'responsibilityDetailContent',
      headerName: '책무세부내용',
      width: 160,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'responsibilityRelEvid',
      headerName: '책무관련근거',
      width: 130,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'fieldTypeName',
      headerName: '항목구분',
      width: 100,
      align: 'left',
      headerAlign: 'center',
      renderCell: params => {
        return params.value || params.row.fieldTypeCd;
      },
    },
    {
      field: 'roleTypeName',
      headerName: '직무구분',
      width: 100,
      align: 'left',
      headerAlign: 'center',
      renderCell: params => {
        return params.value || params.row.roleTypeCd;
      },
    },
    {
      field: 'deptName',
      headerName: '부서명',
      width: 110,
      align: 'left',
      headerAlign: 'center',
      renderCell: params => {
        return params.value || params.row.deptCd;
      },
    },
    {
      field: 'icTask',
      headerName: '내부통제업무',
      width: 140,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'measureDesc',
      headerName: '조치활동',
      width: 130,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'measureType',
      headerName: '조치유형',
      width: 90,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'periodName',
      headerName: '주기',
      width: 80,
      align: 'left',
      headerAlign: 'center',
      renderCell: params => {
        return params.value || params.row.periodCd;
      },
    },
    {
      field: 'supportDoc',
      headerName: '관련근거',
      width: 110,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'checkPeriodName',
      headerName: '점검시기',
      width: 90,
      align: 'left',
      headerAlign: 'center',
      renderCell: params => {
        return params.value || params.row.checkPeriod;
      },
    },
    {
      field: 'checkWay',
      headerName: '점검방법',
      width: 110,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'createdAt',
      headerName: '등록일자',
      width: 110,
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
        selectedLedgerOrder === 'ALL' ? undefined : Number(selectedLedgerOrder),
        selectedFieldType === 'ALL' ? undefined : selectedFieldType
      );
      setRows(data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedLedgerOrder, selectedFieldType]);

  // 부서장 원장차수 목록은 LedgerOrdersHodSelect에서 자동으로 로드됨

  const handleExcelDownload = useCallback(() => {
    // 엑셀 다운로드 로직
  }, [rows]);

  const handleCreateHodOrder = useCallback(async () => {
    if (hodGenerating) return;
    
    try {
      setHodGenerating(true);
      
      // 부서장차수 생성 API 호출
      const response = await hodICItemApi.generateHodLedgerOrder();
      
      // 성공 메시지 표시
      showSuccess(response.message || '부서장차수가 성공적으로 생성되었습니다.');
      
      // LedgerOrdersHodSelect 컴포넌트 새로고침 트리거
      setHodRefreshTrigger(prev => prev + 1);
      
    } catch (error: any) {
      console.error('부서장차수 생성 실패:', error);
      console.log('Error object:', error);
      console.log('Error response:', error?.response);
      console.log('Error response data:', error?.response?.data);
      
      // P6 상태 에러 체크 및 커스텀 메시지 표시  
      const responseData = error?.response?.data;
      const errorDetails = error?.details; // API 클라이언트에서 details에 원본 데이터 저장
      
      // 다양한 경로에서 메시지 추출 시도
      let originalMessage = '';
      if (responseData?.message) {
        originalMessage = responseData.message;
      } else if (errorDetails?.message) {
        originalMessage = errorDetails.message;
      } else if (error?.details?.message) {
        originalMessage = error.details.message;
      } else if (error?.message) {
        originalMessage = error.message;
      }
      
      console.log('Original message:', originalMessage);
      console.log('Error details:', errorDetails);
      
      let errorMessage = '부서장차수 생성 중 오류가 발생했습니다.';
      
      // P6 상태 관련 에러인지 체크
      if (originalMessage.includes('P6') && originalMessage.includes('P7')) {
        errorMessage = '부서장차수를 생성할 수 없습니다. 최신 부서장차수가 부서장확정 상태여야 생성 가능합니다.';
      } else if (originalMessage.includes('P5') && originalMessage.includes('최종확정')) {
        errorMessage = '부서장차수를 생성할 수 없습니다. 원장차수가 최종확정(P5) 상태여야 생성 가능합니다.';
      } else if (originalMessage.includes('이미 존재합니다')) {
        errorMessage = originalMessage; // 중복 에러는 원본 메시지 사용
      } else if (originalMessage) {
        errorMessage = originalMessage; // 기타 에러는 원본 메시지 사용
      }
      
      console.log('Final error message:', errorMessage);
      showError(errorMessage);
    } finally {
      setHodGenerating(false);
    }
  }, [hodGenerating, showSuccess, showError]);

  const handleCreateClick = useCallback(() => {
    // P7 상태(부서장확정) 검증
    if (selectedLedgerOrderStatusCd === 'P7') {
      showError('부서장확정 상태에서는 등록할 수 없습니다.');
      return;
    }
    
    // 부서장차수가 선택되지 않은 경우 검증
    if (!selectedLedgerOrder || selectedLedgerOrder === 'ALL') {
      showError('부서장차수를 선택해주세요.');
      return;
    }
    
    setDialogMode('create');
    setSelectedItemId(undefined);
    setSelectedRowApprovalStatus('NONE'); // create 모드에서는 항상 NONE으로 설정
    setDialogOpen(true);
  }, [selectedLedgerOrderStatusCd, selectedLedgerOrder, showError]);

  const handleRowDoubleClick = useCallback((row: HodICItemRow) => {
    setDialogMode('view');
    setSelectedItemId(row.hodIcItemId);
    setSelectedRowApprovalStatus(row.approvalStatus || '');
    setDialogOpen(true);
  }, []);

  const handleRowClick = useCallback((row: HodICItemRow) => {
    setDialogMode('view');
    setSelectedItemId(row.hodIcItemId);
    setSelectedRowApprovalStatus(row.approvalStatus || '');
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

  // 확정 가능 여부 확인
  const canConfirm = useCallback(() => {
    // 1. LedgerOrdersHodSelect에서 선택된 부서장차수의 status가 P6인지 확인
    if (selectedLedgerOrderStatusCd !== 'P6') {
      return false;
    }
    
    // 2. DataGrid의 모든 행에서 approvalStatus가 APPROVED인지 확인
    if (rows.length === 0) {
      return false;
    }
    
    const allApproved = rows.every(row => row.approvalStatus === 'APPROVED');
    return allApproved;
  }, [selectedLedgerOrderStatusCd, rows]);

  // 확정 처리
  const handleConfirm = useCallback(async () => {
    if (!selectedLedgerOrderId) {
      showError('선택된 부서장차수가 없습니다.');
      return;
    }

    if (!canConfirm()) {
      showError('확정 조건을 만족하지 않습니다. 부서장차수 상태가 P6이고 모든 항목이 승인되어야 합니다.');
      return;
    }

    if (!confirm('선택된 부서장차수를 확정하시겠습니까?\n확정 후에는 수정할 수 없습니다.')) {
      return;
    }

    try {
      setLoading(true);
      
      await hodICItemApi.confirmHodLedgerOrder(selectedLedgerOrderId);
      
      showSuccess('부서장차수가 성공적으로 확정되었습니다.');
      
      // LedgerOrdersHodSelect 컴포넌트 새로고침 트리거
      setHodRefreshTrigger(prev => prev + 1);
      
      // 데이터 새로고침
      await handleSearch();
      
    } catch (error: any) {
      console.error('부서장차수 확정 실패:', error);
      const errorMessage = error?.response?.data?.message || error?.message || '부서장차수 확정 중 오류가 발생했습니다.';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedLedgerOrderId, canConfirm, showSuccess, showError, handleSearch]);

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
        title='[700] 부서장 내부통제 항목 현황'
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
          <LedgerOrdersHodSelect
            value={selectedLedgerOrder}
            onChange={(value, ledgerOrdersHodId, ledgerOrdersHodStatusCd) => {
              setSelectedLedgerOrder(value);
              setSelectedLedgerOrderId(ledgerOrdersHodId);
              setSelectedLedgerOrderStatusCd(ledgerOrdersHodStatusCd);
            }}
            size='small'
            sx={{ minWidth: 150, maxWidth: 200 }}
            refreshTrigger={hodRefreshTrigger}
          />
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>항목</span>
          <CommonCodeSelect
            groupCode="FIELD_TYPE"
            value={selectedFieldType}
            onChange={setSelectedFieldType}
            size='small'
            sx={{ minWidth: 120, maxWidth: 180 }}
          />
          <SearchButton
            onClick={handleSearch}
            loading={loading}
            disabled={loading}
          />
          <Button 
            variant='contained' 
            size='small' 
            color='secondary' 
            disabled={hodGenerating}
            sx={{ 
              marginLeft: '8px',
              height: '32px',
              minWidth: '120px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 1,
            }}
            onClick={handleCreateHodOrder}
          >
            {hodGenerating ? '생성 중...' : '부서장차수생성'}
          </Button>
          <Box sx={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <Button
              variant='contained'
              size='small'
              color='success'
              onClick={handleConfirm}
              disabled={!canConfirm() || loading}
              sx={{
                height: '32px',
                minWidth: '80px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: 1,
              }}
            >
              확정
            </Button>
            
          </Box>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 0.5, 
          gap: 1,
          alignItems: 'center',
          height: '32px',
        }}>
          <ExcelDownloadButton
            onDownload={handleExcelDownload}
            filename="hod_ic_item_status"
            disabled={loading}
            loading={loading}
          />
          <ManagementButtonGroup
            onRegister={handleCreateClick}
            onDelete={handleDelete}
            showRegister={true}
            showDelete={true}
            showEdit={false}
            showRefresh={false}
            registerDisabled={loading || selectedLedgerOrderStatusCd === 'P7' || !selectedLedgerOrder || selectedLedgerOrder === 'ALL'}
            deleteDisabled={loading || selectedIds.length === 0}
            align="right"
            sx={{
              mb: 0,
            }}
          />
        </Box>
        <Box sx={{ width: '100%', flex: 1 }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <DataGrid
            data={rows}
            columns={columns}
            loading={loading}
            height={600} 
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
              height: '600px',
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
        approvalStatus={selectedRowApprovalStatus}
        onSuccess={handleDialogSuccess}
      />

      {/* Toast 알림 */}
      <Toast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </PageContainer>
  );
};

export default HodICitemStatusPage;
