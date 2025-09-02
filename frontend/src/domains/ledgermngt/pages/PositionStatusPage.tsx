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
import { Confirm, ModernAlert } from '@/shared/components/modal';
import { DataGrid } from '@/shared/components/ui';
import { Button, ManagementButtonGroup, PermissionButton } from '@/shared/components/ui/button';
import { LedgerOrderSelect } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import { usePermission } from '@/shared/hooks/usePermission';
import { useDialog } from '@/shared/hooks/useDialog';
import Toast from '@/shared/components/ui/feedback/Toast';
import type { DataGridColumn } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { useGetCodeName } from '@/shared/utils/codeUtils';
import { Box } from '@mui/material';
import { type GridRowSelectionModel } from '@mui/x-data-grid';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import React, { useCallback, useEffect, useState } from 'react';
import '../../../assets/scss/style.css';
import { positionApi, type PositionStatusRow, type LedgerOrdersGenerateResponse, type LedgerOrdersStatusCheckResponse } from '../api/positionApi';
import { useApiWithNotification } from '@/shared/hooks/useApiWithNotification';
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

  // 데이터 상태
  const [rows, setRows] = useState<PositionStatusRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('ALL');
  const [selectedLedgerOrderId, setSelectedLedgerOrderId] = useState<number | undefined>(undefined);
  const [ledgerOrderOptions, setLedgerOrderOptions] = useState<Array<{value: string, label: string, ledgerOrdersId: number}>>([]);
  const [ledgerOrderRefreshTrigger, setLedgerOrderRefreshTrigger] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // 다이얼로그 상태 관리 훅
  const { dialogOpen: positionDialogOpen, dialogMode, dialogData: selectedPositionId, openDialog: openPositionDialog, closeDialog: closePositionDialog, setDialogMode: setPositionDialogMode } = useDialog<number>();
  const { dialogOpen: departmentSearchOpen, dialogData: selectedPosition, openDialog: openDepartmentSearch, closeDialog: closeDepartmentSearch } = useDialog<PositionStatusRow>();
  const { dialogOpen: employeeSearchOpen, openDialog: openEmployeeSearch, closeDialog: closeEmployeeSearch } = useDialog();
  const { dialogOpen: deleteConfirmOpen, dialogData: pendingDelete, openDialog: openDeleteConfirm, closeDialog: closeDeleteConfirm } = useDialog<number[]>();
  const { dialogOpen: statusAlertOpen, dialogData: statusAlertMessage, openDialog: openStatusAlert, closeDialog: closeStatusAlert } = useDialog<string>();
  const { dialogOpen: confirmConfirmOpen, openDialog: openConfirmConfirm, closeDialog: closeConfirmConfirm } = useDialog();
  const { dialogOpen: cancelConfirmOpen, openDialog: openCancelConfirm, closeDialog: closeCancelConfirm } = useDialog();
  const { dialogOpen: generateConfirmOpen, openDialog: openGenerateConfirm, closeDialog: closeGenerateConfirm } = useDialog();

  // 공통코드 훅 사용
  const getCodeNameFn = useGetCodeName();

  // 직원 선택 핸들러
  const handleEmployeeSelect = (employee: EmployeeSearchResult) => {
    if (selectedPosition) {
      // TODO: API 호출하여 선택된 직원 정보 업데이트
    }
    closeEmployeeSearch();
  };
   const { callApiWithNotification } = useApiWithNotification({
     showSuccessOnLoad: true,
     errorMessage: '데이터 로드 중 오류가 발생했습니다.'
  });
  // 직책 현황 조회
  const fetchPositionStatus = useCallback(async (ledgerOrdersId?: number) => {
    const searchLedgerOrdersId = ledgerOrdersId || selectedLedgerOrderId;
    const data = await callApiWithNotification(
      () => positionApi.getStatusList(searchLedgerOrdersId),
      'success_load'
    );
    if (data) {
      setRows(data);
    } else {
      setRows([]);
    }
  }, [selectedLedgerOrderId, callApiWithNotification]);

  // 초기 데이터 로드 - LedgerOrderSelect 자동 선택 후에만 로드
  useEffect(() => {
    // selectedLedgerOrderId가 있을 때만 데이터 로드 (자동 선택 후)
    if (selectedLedgerOrderId) {
      fetchPositionStatus();
    }
  }, [selectedLedgerOrderId, fetchPositionStatus]);

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
    const statusCheck: LedgerOrdersStatusCheckResponse | null = await callApiWithNotification(
      () => positionApi.checkLedgerOrderStatus(),
      'custom'
    );

    if (!statusCheck) return;

    if (!statusCheck.canGenerate) {
      openStatusAlert('view', statusCheck.message);
      return;
    }

    // 생성 조건에 적합하면 confirm 창 띄우기
    openGenerateConfirm();
  }, [callApiWithNotification, openStatusAlert, openGenerateConfirm]);

  // 책무번호 생성 확인 후 실행
  const handleConfirmGenerateLedgerOrder = useCallback(async () => {
    closeGenerateConfirm();
    
    const response: LedgerOrdersGenerateResponse | null = await callApiWithNotification(
      () => positionApi.generateLedgerOrder(),
      'custom'
    );

    if (response) {
      showSuccess(`${response.message}`);
      await fetchPositionStatus();
      setLedgerOrderRefreshTrigger(prev => prev + 1);
    }
  }, [closeGenerateConfirm, showSuccess, fetchPositionStatus, callApiWithNotification]);

  // 확정 버튼 클릭 핸들러
  const handleConfirmClick = useCallback(() => {
    if (!selectedLedgerOrder || selectedLedgerOrder === 'ALL') {
      showError('원장차수를 선택해주세요.');
      return;
    }
    const selectedOption = ledgerOrderOptions.find(option => option.value === selectedLedgerOrder);
    if (!selectedOption) {
      showError('선택된 원장차수 정보를 찾을 수 없습니다.');
      return;
    }
    let statusInfo = '';
    if (selectedOption.label.includes('(') && selectedOption.label.includes(')')) {
      const statusMatch = selectedOption.label.match(/\(([^)]+)\)/);
      if (statusMatch) statusInfo = statusMatch[1];
    }
    if (statusInfo !== '신규') {
      showError('신규 상태의 원장차수만 확정 가능합니다.');
      return;
    }
    openConfirmConfirm();
  }, [selectedLedgerOrder, ledgerOrderOptions, showError, openConfirmConfirm]);

  // 확정 처리 핸들러
  const handleConfirmLedgerOrder = useCallback(async () => {
    closeConfirmConfirm();
    if (!selectedLedgerOrder) return;

    const response = await callApiWithNotification(
      () => positionApi.confirmLedgerOrder(selectedLedgerOrder),
      'custom'
    );

    if (response) {
      showSuccess(response.message || '확정되었습니다.');
      await fetchPositionStatus();
      setLedgerOrderRefreshTrigger(prev => prev + 1);
      setSnackbarOpen(true);
    }
  }, [selectedLedgerOrder, showSuccess, fetchPositionStatus, callApiWithNotification, closeConfirmConfirm]);

  // 확정취소 버튼 클릭 핸들러
  const handleCancelConfirmClick = useCallback(() => {
    if (!selectedLedgerOrder || selectedLedgerOrder === 'ALL') {
      showError('원장차수를 선택해주세요.');
      return;
    }
    const selectedOption = ledgerOrderOptions.find(option => option.value === selectedLedgerOrder);
    if (!selectedOption) {
      showError('선택된 원장차수 정보를 찾을 수 없습니다.');
      return;
    }
    let statusInfo = '';
    if (selectedOption.label.includes('(') && selectedOption.label.includes(')')) {
      const statusMatch = selectedOption.label.match(/\(([^)]+)\)/);
      if (statusMatch) statusInfo = statusMatch[1];
    }
    if (statusInfo !== '직책확정') {
      showError('직책확정 상태의 원장차수만 확정취소 가능합니다.');
      return;
    }
    openCancelConfirm();
  }, [selectedLedgerOrder, ledgerOrderOptions, showError, openCancelConfirm]);

  // 확정취소 처리 핸들러
  const handleCancelConfirmLedgerOrder = useCallback(async () => {
    closeCancelConfirm();
    if (!selectedLedgerOrder) return;

    const response = await callApiWithNotification(
      () => positionApi.cancelConfirmLedgerOrder(selectedLedgerOrder),
      'custom'
    );

    if (response) {
      showSuccess(response.message || '확정취소되었습니다.');
      await fetchPositionStatus();
      setLedgerOrderRefreshTrigger(prev => prev + 1);
    }
  }, [selectedLedgerOrder, showSuccess, fetchPositionStatus, callApiWithNotification, closeCancelConfirm]);

  // 부서 선택 핸들러
  const handleDepartmentSelect = (departments: Department | Department[]) => {
    if (selectedPosition) {
      const department = Array.isArray(departments) ? departments[0] : departments;
      // TODO: API 호출하여 선택된 부서 정보 업데이트
    }
    closeDepartmentSearch();
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
            openDepartmentSearch('view', params.row);
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
            openEmployeeSearch('view', params.row);
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
    if (!selectedLedgerOrder || selectedLedgerOrder === 'ALL') {
      showError('원장차수를 선택해주세요.');
      return;
    }
    const selectedOption = ledgerOrderOptions.find(option => option.value === selectedLedgerOrder);
    if (!selectedOption) {
      showError('선택된 원장차수 정보를 찾을 수 없습니다.');
      return;
    }
    let statusInfo = '';
    if (selectedOption.label.includes('(') && selectedOption.label.includes(')')) {
      const statusMatch = selectedOption.label.match(/\(([^)]+)\)/);
      if (statusMatch) statusInfo = statusMatch[1];
    }
    if (statusInfo !== '신규') {
      showError('신규 상태의 원장차수만 등록 가능합니다.');
      return;
    }
    openPositionDialog('create');
  };

  const handlePositionSave = () => {
    fetchPositionStatus();
  };

  const handleRowSelectionChange = (newSelection: GridRowSelectionModel) => {
    setSelectedIds(Array.isArray(newSelection) ? newSelection.map(Number) : []);
  };

  const handleDelete = () => {
    if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
      showError('삭제할 항목을 선택하세요.');
      return;
    }
    openDeleteConfirm('view', selectedIds);
  };

  const handleConfirmDelete = async () => {
    closeDeleteConfirm();
    if (!pendingDelete || pendingDelete.length === 0) return;

    const success = await callApiWithNotification(
      () => positionApi.deleteBulk(pendingDelete),
      'custom'
    );

    if (success) {
      setSelectedIds([]);
      fetchPositionStatus();
    }
  };

  const handleRowClick = (positionsId: number) => {
    openPositionDialog('view', positionsId);
  };

  const handleExcelDownload = async () => {
    if (!rows || rows.length === 0) {
      showError('엑셀로 내보낼 데이터가 없습니다.');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('직책 현황');
      const headers = ['직책ID', '직책명', '책무번호', '진행상태', '책무기술서 작성 부서', '소관부서', '관리자 수'];
      worksheet.addRow(headers);
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB0C4DE' },
      };
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
      worksheet.columns.forEach(column => {
        column.width = Math.max(column.width || 0, 15);
      });
      const excelBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `직책_현황_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      showError('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title='[200] 직책 현황'
        icon={<GroupsIcon />}
        description='직책별 현황을 조회하고 관리합니다.'
        elevation={false}
        sx={{ position: 'relative', zIndex: 1, flexShrink: 0 }}
      />
      <PageContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, position: 'relative', py: 1 }}>
        <Box sx={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center', backgroundColor: 'var(--bank-bg-secondary)', border: '1px solid var(--bank-border)', padding: '8px 16px', borderRadius: '4px' }}>
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
            includeAll={false}
            onLoadComplete={useCallback((options: Array<{value: string, label: string, ledgerOrdersId: number}>) => {
              setLedgerOrderOptions(options);
            }, [])}
          />
          <PermissionButton
            menuCode="LEDGER_MGMT_POSITION"
            permission="write"
            variant='outlined'
            color='success'
            onClick={handleGenerateLedgerOrder}
            hideWhenNoPermission={true}
            noPermissionTooltip="책무번호 생성 권한이 없습니다"
          >
            책무번호생성
          </PermissionButton>
          <Box sx={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <PermissionButton
              menuCode="LEDGER_MGMT_POSITION"
              permission="write"
              variant='outlined'
              color='success'
              onClick={handleConfirmClick}
              hideWhenNoPermission={true}
              noPermissionTooltip="확정 권한이 없습니다"
            >
              확정
            </PermissionButton>
            <PermissionButton
              menuCode="LEDGER_MGMT_POSITION"
              permission="write"
              variant='outlined'
              color='error'
              onClick={handleCancelConfirmClick}
              hideWhenNoPermission={true}
              noPermissionTooltip="확정취소 권한이 없습니다"
            >
              확정취소
            </PermissionButton>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, flexShrink: 0, gap: 1, alignItems: 'center', height: '32px' }}>
          <ManagementButtonGroup
            filename="position_status"
            onExcelDownload={handleExcelDownload}
            onRegister={handleCreateClick}
            onDelete={handleDelete}
            align="right"
            sx={{ mb: 0, alignSelf: 'center' }}
          />
        </Box>
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <DataGrid
            data={rows}
            columns={positionColumns.map(col => ({ ...col }))}
            height={600}
            selectable={true}
            multiSelect={true}
            selectedRows={selectedIds}
            onRowSelectionChange={handleRowSelectionChange}
            rowIdField='positionsId'
          />
        </Box>
      </PageContent>
      <PositionDialog
        open={positionDialogOpen}
        mode={dialogMode}
        positionId={selectedPositionId}
        selectedLedgerOrder={dialogMode === 'create' ? selectedLedgerOrder : undefined}
        isReadOnly={selectedPositionId ? rows.find(row => row.positionsId === selectedPositionId)?.ledgerOrdersStatusCd === 'P5' : false}
        onClose={closePositionDialog}
        onSave={handlePositionSave}
        onChangeMode={setPositionDialogMode}
      />
      <DepartmentSearchPopup
        open={departmentSearchOpen}
        onClose={closeDepartmentSearch}
        onSelect={handleDepartmentSelect}
        multiSelect={false}
        title='책무기술서 작성 부서 선택'
      />
      <EmployeeSearchPopup
        open={employeeSearchOpen}
        onClose={closeEmployeeSearch}
        onSelect={handleEmployeeSelect}
        title='관리자 선택'
      />
      <Confirm
        open={deleteConfirmOpen}
        type="error"
        title='삭제 확인'
        message='정말로 선택한 직책을 삭제하시겠습니까?'
        confirmText='삭제'
        cancelText='취소'
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteConfirm}
      />
      <Confirm
        open={confirmConfirmOpen}
        type="success"
        title='확정 확인'
        message={`${selectedLedgerOrder} 차수의 직책을 확정하시겠습니까?`}
        confirmText='확정'
        cancelText='취소'
        onConfirm={handleConfirmLedgerOrder}
        onCancel={closeConfirmConfirm}
      />
      <Confirm
        open={cancelConfirmOpen}
        type="warning"
        title='확정취소 확인'
        message={`${selectedLedgerOrder} 차수의 직책을 확정취소하시겠습니까?`}
        confirmText='확정취소'
        cancelText='취소'
        onConfirm={handleCancelConfirmLedgerOrder}
        onCancel={closeCancelConfirm}
      />
      <Confirm
        open={generateConfirmOpen}
        type="info"
        title='책무번호 생성 확인'
        message='새로운 책무번호를 생성하시겠습니까?'
        confirmText='생성'
        cancelText='취소'
        onConfirm={handleConfirmGenerateLedgerOrder}
        onCancel={closeGenerateConfirm}
      />
      {/* 모던 알림 다이얼로그 */}
      <ModernAlert
        open={statusAlertOpen}
        severity="warning"
        title="알림"
        message={statusAlertMessage}
        onConfirm={closeStatusAlert}
        onClose={closeStatusAlert}
      />
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
