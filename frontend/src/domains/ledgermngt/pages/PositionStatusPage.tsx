/**
 * 직책책 현황 페이지 컴포넌트
 * PositionStatusPage.tsx 
 */
import {
  DepartmentSearchPopup,
  EmployeeSearchPopup,
  type Department,
  type EmployeeSearchResult,
} from '@/domains/common/components/search';
import { Confirm } from '@/shared/components/modal';
import { DataGrid } from '@/shared/components/ui';
import { Button, SearchButton, ManagementButtonGroup, ExcelDownloadButton, PermissionButton } from '@/shared/components/ui/button';
import { LedgerOrderSelect } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import { usePermission } from '@/shared/hooks/usePermission';
import Toast from '@/shared/components/ui/feedback/Toast';
import type { DataGridColumn } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { useGetCodeName } from '@/shared/utils/codeUtils';
import { 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions 
} from '@mui/material';
import { type GridRowSelectionModel } from '@mui/x-data-grid';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import React, { useCallback, useEffect, useState } from 'react';
import '../../../assets/scss/style.css';
import { positionApi, type PositionStatusRow, type LedgerOrdersGenerateResponse, type LedgerOrdersStatusCheckResponse } from '../api/positionApi';
import PositionDialog from '../components/PositionDialog';

type DialogMode = 'create' | 'edit' | 'view';

interface IPositionStatusPageProps {
  className?: string;
}

const PositionStatusPage: React.FC<IPositionStatusPageProps> = React.memo((): React.JSX.Element => {
  // Toast 알림을 위한 snackbar hook
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  
  // 권한 체크 훅
  const { hasMenuPermission, permissions, loading: permissionLoading } = usePermission();

  // 기존 상태 관리 방식
  const [rows, setRows] = useState<PositionStatusRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로컬 UI 상태
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<number[] | null>(null);

  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [positionDialogMode, setPositionDialogMode] = useState<DialogMode>('create');
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('ALL');
  const [selectedLedgerOrderId, setSelectedLedgerOrderId] = useState<number | undefined>(undefined);
  // LedgerOrder 옵션 목록을 저장할 state (상세 정보 조회용)
  const [ledgerOrderOptions, setLedgerOrderOptions] = useState<Array<{value: string, label: string, ledgerOrdersId: number}>>([]);

  // 부서 검색 팝업 상태
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<PositionStatusRow | null>(null);

  // 직원 검색 팝업 상태
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);

  // LedgerOrderSelect 새로고침을 위한 트리거
  const [ledgerOrderRefreshTrigger, setLedgerOrderRefreshTrigger] = useState(0);

  // 상태 확인 Alert 상태
  const [statusAlertOpen, setStatusAlertOpen] = useState(false);
  const [statusAlertMessage, setStatusAlertMessage] = useState('');
  
  // 확정 confirm 상태
  const [confirmConfirmOpen, setConfirmConfirmOpen] = useState(false);
  
  // 확정취소 confirm 상태
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  // 공통코드 훅 사용
  const getCodeNameFn = useGetCodeName();

  // 직원 선택 핸들러
  const handleEmployeeSelect = (employee: EmployeeSearchResult) => {
    if (selectedPosition) {
      // TODO: API 호출하여 선택된 직원 정보 업데이트
    }
    setEmployeeSearchOpen(false);
  };

  // 직책 현황 조회
  const fetchPositionStatus = useCallback(async (ledgerOrdersId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const searchLedgerOrdersId = ledgerOrdersId || selectedLedgerOrderId;
      const data = await positionApi.getStatusList(searchLedgerOrdersId);
      setRows(data);
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: string }).message === 'string'
      ) {
        setError((err as { message: string }).message);
      } else {
        setError('직책 현황을 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedLedgerOrderId]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchPositionStatus();
  }, [fetchPositionStatus]);

  // 권한 디버깅
  useEffect(() => {
    if (!permissionLoading && permissions.length > 0) {
      // 직책 관련 메뉴 코드들 확인
      const positionRelatedMenus = permissions.filter(p => 
        p.menuCode.includes('POSITION') || 
        p.menuName.includes('직책') ||
        p.menuUrl?.includes('position')
      );
    }
  }, [permissions, permissionLoading, hasMenuPermission]);

  // 책무번호 생성 핸들러
  const handleGenerateLedgerOrder = useCallback(async () => {
    setLoading(true);
    try {
      // 1. 먼저 상태 확인
      const statusCheck: LedgerOrdersStatusCheckResponse = await positionApi.checkLedgerOrderStatus();
      
      // 2. P5 상태가 아니면 Alert 표시
      if (!statusCheck.canGenerate) {
        setStatusAlertMessage(statusCheck.message);
        setStatusAlertOpen(true);
        return;
      }
      
      // 3. P5 상태이면 생성 진행
      const response: LedgerOrdersGenerateResponse = await positionApi.generateLedgerOrder();
      
      showSuccess(`${response.message}`);
      
      // 생성 후 데이터 새로고침
      await fetchPositionStatus();
      
      // LedgerOrderSelect 새로고침 트리거
      setLedgerOrderRefreshTrigger(prev => prev + 1);
      
    } catch (err: unknown) {
      let errorMessage = '책무번호 생성 중 오류가 발생했습니다.';
      
      if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      showError(errorMessage);
      console.error('책무번호 생성 실패:', err);
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError, fetchPositionStatus]);

  // 확정 버튼 클릭 핸들러
  const handleConfirmClick = useCallback(() => {
    // 1. LedgerOrderSelect 선택 검증
    if (!selectedLedgerOrder || selectedLedgerOrder === 'ALL') {
      showError('원장차수를 선택해주세요.');
      return;
    }

    // 2. "신규" 상태 검증
    const selectedOption = ledgerOrderOptions.find(option => option.value === selectedLedgerOrder);
    if (!selectedOption) {
      showError('선택된 원장차수 정보를 찾을 수 없습니다.');
      return;
    }

    // label에서 상태 정보 추출하여 "신규" 여부 확인
    let statusInfo = '';
    if (selectedOption.label.includes('(') && selectedOption.label.includes(')')) {
      const statusMatch = selectedOption.label.match(/\(([^)]+)\)/);
      if (statusMatch) {
        statusInfo = statusMatch[1];
      }
    }

    if (statusInfo !== '신규') {
      showError('신규 상태의 원장차수만 확정 가능합니다.');
      return;
    }

    // 3. 확정 confirm 창 표시
    setConfirmConfirmOpen(true);
  }, [selectedLedgerOrder, ledgerOrderOptions, showError]);

  // 확정 처리 핸들러
  const handleConfirmLedgerOrder = useCallback(async () => {
    if (!selectedLedgerOrder) {
      setConfirmConfirmOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await positionApi.confirmLedgerOrder(selectedLedgerOrder);
      showSuccess(response.message || '확정되었습니다.');
      
      // 데이터 새로고침
      await fetchPositionStatus();
      
      // LedgerOrderSelect 새로고침 트리거
      setLedgerOrderRefreshTrigger(prev => prev + 1);
      
    } catch (err: unknown) {
      let errorMessage = '확정 처리 중 오류가 발생했습니다.';
      
      if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      showError(errorMessage);
      console.error('확정 처리 실패:', err);
    } finally {
      setLoading(false);
      setConfirmConfirmOpen(false);
    }
  }, [selectedLedgerOrder, showSuccess, showError, fetchPositionStatus]);

  // 확정취소 버튼 클릭 핸들러
  const handleCancelConfirmClick = useCallback(() => {
    // 1. LedgerOrderSelect 선택 검증
    if (!selectedLedgerOrder || selectedLedgerOrder === 'ALL') {
      showError('원장차수를 선택해주세요.');
      return;
    }

    // 2. "직책확정" 상태 검증
    const selectedOption = ledgerOrderOptions.find(option => option.value === selectedLedgerOrder);
    if (!selectedOption) {
      showError('선택된 원장차수 정보를 찾을 수 없습니다.');
      return;
    }

    // label에서 상태 정보 추출하여 "직책확정" 여부 확인
    let statusInfo = '';
    if (selectedOption.label.includes('(') && selectedOption.label.includes(')')) {
      const statusMatch = selectedOption.label.match(/\(([^)]+)\)/);
      if (statusMatch) {
        statusInfo = statusMatch[1];
      }
    }

    if (statusInfo !== '직책확정') {
      showError('직책확정 상태의 원장차수만 확정취소 가능합니다.');
      return;
    }

    // 3. 확정취소 confirm 창 표시
    setCancelConfirmOpen(true);
  }, [selectedLedgerOrder, ledgerOrderOptions, showError]);

  // 확정취소 처리 핸들러
  const handleCancelConfirmLedgerOrder = useCallback(async () => {
    if (!selectedLedgerOrder) {
      setCancelConfirmOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await positionApi.cancelConfirmLedgerOrder(selectedLedgerOrder);
      showSuccess(response.message || '확정취소되었습니다.');
      
      // 데이터 새로고침
      await fetchPositionStatus();
      
      // LedgerOrderSelect 새로고침 트리거
      setLedgerOrderRefreshTrigger(prev => prev + 1);
      
    } catch (err: unknown) {
      let errorMessage = '확정취소 처리 중 오류가 발생했습니다.';
      
      if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      showError(errorMessage);
      console.error('확정취소 처리 실패:', err);
    } finally {
      setLoading(false);
      setCancelConfirmOpen(false);
    }
  }, [selectedLedgerOrder, showSuccess, showError, fetchPositionStatus]);

  // 부서 선택 핸들러
  const handleDepartmentSelect = (departments: Department | Department[]) => {
    if (selectedPosition) {
      // 단일 부서만 처리
      const department = Array.isArray(departments) ? departments[0] : departments;
      // TODO: API 호출하여 선택된 부서 정보 업데이트
    }
    setDepartmentSearchOpen(false);
  };

  const positionColumns: DataGridColumn<PositionStatusRow>[] = [
    {
      field: 'positionsNm',
      headerName: '직책명',
      width: 200,
      flex: 1,
      renderCell: params => (
        <span
          style={{ color: 'var(--bank-primary)', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={e => {
            e.stopPropagation();
            handleRowClick(params.row.positionsId);
          }}
        >
          {params.value}
        </span>
      ),
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'ledgerOrdersTitle',
      headerName: '책무번호',
      width: 200,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => params.value || '-',
    },
    {
      field: 'ledgerOrdersStatusCd',
      headerName: '진행상태',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => getCodeNameFn('ORDER_STATUS', (value as string) || ''),
    },
    {
      field: 'ownerDeptNms',
      headerName: '소관부서',
      width: 300,
      align: 'center',
      headerAlign: 'center',
      flex: 2,
      renderCell: params => params.value || '-',
    },
    {
      field: 'writeDeptNm',
      headerName: '책무기술서 작성 부서',
      width: 200,
      flex: 2,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => (
        <span
          style={{ color: 'var(--bank-primary)', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={e => {
            e.stopPropagation();
            setSelectedPosition(params.row);
            setDepartmentSearchOpen(true);
          }}
        >
          {params.value || '부서 선택'}
        </span>
      ),
    },
    {
      field: 'adminCount',
      headerName: '관리자 수',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => (
        <span
          style={{ color: 'var(--bank-primary)', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={e => {
            e.stopPropagation();
            setSelectedPosition(params.row);
            setEmployeeSearchOpen(true);
          }}
        >
          {params.value || '0'}
        </span>
      ),
    },
  ];

  const handleSearch = () => {
    fetchPositionStatus(selectedLedgerOrderId);
  };

  const handleCreateClick = () => {
    // 1. LedgerOrderSelect 선택 검증
    if (!selectedLedgerOrder || selectedLedgerOrder === 'ALL') {
      showError('원장차수를 선택해주세요.');
      return;
    }

    // 2. "신규" 상태 검증
    const selectedOption = ledgerOrderOptions.find(option => option.value === selectedLedgerOrder);
    if (!selectedOption) {
      showError('선택된 원장차수 정보를 찾을 수 없습니다.');
      return;
    }

    // label에서 상태 정보 추출하여 "신규" 여부 확인
    let statusInfo = '';
    if (selectedOption.label.includes('(') && selectedOption.label.includes(')')) {
      const statusMatch = selectedOption.label.match(/\(([^)]+)\)/);
      if (statusMatch) {
        statusInfo = statusMatch[1];
      }
    }

    if (statusInfo !== '신규') {
      showError('신규 상태의 원장차수만 등록 가능합니다.');
      return;
    }

    // 3. PositionDialog 열기
    setSelectedPositionId(null);
    setPositionDialogMode('create');
    setPositionDialogOpen(true);
  };

  const handlePositionDialogClose = () => {
    setPositionDialogOpen(false);
    setSelectedPositionId(null);
  };

  const handlePositionSave = () => {
    fetchPositionStatus();
  };

  const handlePositionModeChange = (newMode: DialogMode) => {
    setPositionDialogMode(newMode);
  };

  // DataGrid 체크박스 선택 핸들러
  const handleRowSelectionChange = (newSelection: GridRowSelectionModel) => {
    if (Array.isArray(newSelection)) {
      setSelectedIds(newSelection.map(Number));
    } else {
      setSelectedIds([]);
    }
  };

  // 삭제 버튼 클릭 시: 모달만 띄움
  const handleDelete = () => {
    if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
      setError('삭제할 항목을 선택하세요.');
      return;
    }
    setPendingDelete(selectedIds);
    setConfirmOpen(true);
  };

  // 삭제 확인 모달에서 "확인" 클릭 시 실제 삭제
  const handleConfirmDelete = async () => {
    if (!pendingDelete || pendingDelete.length === 0) {
      setConfirmOpen(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await positionApi.deleteBulk(pendingDelete);
      setSelectedIds([]); // 선택 초기화
      fetchPositionStatus(); // 목록 새로고침
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: string }).message === 'string'
      ) {
        setError((err as { message: string }).message);
      } else {
        setError('삭제 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  const handleRowClick = (positionsId: number) => {
    setSelectedPositionId(positionsId);
    setPositionDialogMode('view');
    setPositionDialogOpen(true);
  };

  // 엑셀 다운로드 핸들러 (ExcelJS 사용)
  const handleExcelDownload = async () => {
    if (!rows || rows.length === 0) {
      setError('엑셀로 내보낼 데이터가 없습니다.');
      return;
    }

    try {
      // ExcelJS 워크북 생성
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('직책 현황');

      // 헤더 설정
      const headers = ['직책ID', '직책명', '책무번호', '진행상태', '책무기술서 작성 부서', '소관부서', '관리자 수'];
      worksheet.addRow(headers);

      // 헤더 스타일 설정
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB0C4DE' }, // lightsteelblue
      };

      // 데이터 추가
      rows.forEach(row => {
        worksheet.addRow([
          row.positionsId,
          row.positionsNm,
          row.ledgerOrdersTitle,
          row.ledgerOrdersStatusCd,
          row.writeDeptNm,
          row.ownerDeptNms,
          row.adminCount,
        ]);
      });

      // 컬럼 너비 자동 조정
      worksheet.columns.forEach(column => {
        column.width = Math.max(column.width || 0, 15);
      });

      // 파일 생성 및 다운로드
      const excelBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `직책_현황_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      setError('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <PageContainer
    >
      <PageHeader
        title='[200] 직책 현황'
        icon={<GroupsIcon />}
        description='직책별 현황을 조회하고 관리합니다.'
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
            onChange={useCallback((value: string, ledgerOrdersId?: number) => {
              setSelectedLedgerOrder(value);
              setSelectedLedgerOrderId(ledgerOrdersId);
            }, [])}
            size='small'
            sx={{ minWidth: 150, maxWidth: 200 }}
            refreshTrigger={ledgerOrderRefreshTrigger}
            onLoadComplete={useCallback((options: Array<{value: string, label: string, ledgerOrdersId: number}>) => {
              setLedgerOrderOptions(options);
            }, [])}
          />
          <SearchButton
            onClick={handleSearch}
            loading={loading}
            disabled={loading}
          />
          <PermissionButton
            menuCode="LEDGER_MGMT_POSITION"
            permission="write"
            variant='contained'
            size='small'
            color='success'
            onClick={handleGenerateLedgerOrder}
            disabled={loading}
            hideWhenNoPermission={true}
            noPermissionTooltip="책무번호 생성 권한이 없습니다"
            sx={{
              height: '32px',
              minWidth: '80px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 1,
            }}
          >
            책무번호생성
          </PermissionButton>
          <Box sx={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <PermissionButton
              menuCode="LEDGER_MGMT_POSITION"
              permission="write"
              variant='contained'
              size='small'
              color='success'
              onClick={handleConfirmClick}
              disabled={loading}
              hideWhenNoPermission={true}
              noPermissionTooltip="확정 권한이 없습니다"
              sx={{
                height: '32px',
                minWidth: '80px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: 1,
              }}
            >
              확정
            </PermissionButton>
            <PermissionButton
              menuCode="LEDGER_MGMT_POSITION"
              permission="write"
              variant='contained'
              size='small'
              color='error'
              onClick={handleCancelConfirmClick}
              disabled={loading}
              hideWhenNoPermission={true}
              noPermissionTooltip="확정취소 권한이 없습니다"
              sx={{
                height: '32px',
                minWidth: '80px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: 1,
              }}
            >
              확정취소
            </PermissionButton>
          </Box>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 1, 
          flexShrink: 0, 
          gap: 1, 
          alignItems: 'center',
          height: '32px',
        }}>
          <ExcelDownloadButton
            onDownload={handleExcelDownload}
            filename="position_status"
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
            registerDisabled={loading}
            deleteDisabled={loading || selectedIds.length === 0}
            align="right"
            sx={{
              mb: 0,
              alignSelf: 'center',
            }}
          />
        </Box>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <DataGrid
            data={rows}
            columns={positionColumns.map(col => ({
              field: col.field,
              headerName: col.headerName,
              width: col.width,
              flex: col.flex,
              sortable: col.sortable,
              align: col.align,
              renderCell: col.renderCell,
            }))}
            loading={loading}
            height={600}
            selectable={true}
            multiSelect={true}
            selectedRows={selectedIds}
            onRowSelectionChange={selectedRows => {
              setSelectedIds(selectedRows.map(id => Number(id)));
            }}
            rowIdField='positionsId'
          // sx={{
          //   width: '100%',
          //   '& .MuiDataGrid-columnHeaders': {
          //     backgroundColor: 'var(--bank-bg-secondary) !important',
          //     fontWeight: 'bold',
          //   },
          //   '& .MuiDataGrid-row': {
          //     cursor: 'pointer',
          //   },
          // }}
          />
        </Box>
      </PageContent>
      <PositionDialog
        open={positionDialogOpen}
        mode={positionDialogMode}
        positionId={selectedPositionId}
        selectedLedgerOrder={positionDialogMode === 'create' ? selectedLedgerOrder : undefined}
        onClose={handlePositionDialogClose}
        onSave={handlePositionSave}
        onChangeMode={handlePositionModeChange}
      />
      <DepartmentSearchPopup
        open={departmentSearchOpen}
        onClose={() => setDepartmentSearchOpen(false)}
        onSelect={handleDepartmentSelect}
        multiSelect={false}
        title='책무기술서 작성 부서 선택'
      />
      <EmployeeSearchPopup
        open={employeeSearchOpen}
        onClose={() => setEmployeeSearchOpen(false)}
        onSelect={handleEmployeeSelect}
        title='관리자 선택'
      />
      <Confirm
        open={confirmOpen}
        title='삭제 확인'
        message='정말로 선택한 직책을 삭제하시겠습니까?'
        confirmText='삭제'
        cancelText='취소'
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
      />
      
      <Confirm
        open={confirmConfirmOpen}
        title='확정 확인'
        message={`${selectedLedgerOrder} 차수의 직책을 확정하시겠습니까?`}
        confirmText='확정'
        cancelText='취소'
        onConfirm={handleConfirmLedgerOrder}
        onCancel={() => {
          setConfirmConfirmOpen(false);
        }}
      />
      
      <Confirm
        open={cancelConfirmOpen}
        title='확정취소 확인'
        message={`${selectedLedgerOrder} 차수의 직책을 확정취소하시겠습니까?`}
        confirmText='확정취소'
        cancelText='취소'
        onConfirm={handleCancelConfirmLedgerOrder}
        onCancel={() => {
          setCancelConfirmOpen(false);
        }}
      />

      {/* 상태 확인 Alert 다이얼로그 */}
      <Dialog
        open={statusAlertOpen}
        onClose={() => setStatusAlertOpen(false)}
        aria-labelledby="status-alert-title"
        aria-describedby="status-alert-description"
      >
        <DialogTitle id="status-alert-title">알림</DialogTitle>
        <DialogContent>
          <DialogContentText id="status-alert-description">
            {statusAlertMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '8px 16px', justifyContent: 'center' }}>
          <Button
            onClick={() => setStatusAlertOpen(false)}
            variant="contained"
            color="primary"
            size="small"
          >
            확인
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast 알림 */}
      <Toast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </PageContainer>
  );
});

export default PositionStatusPage;
