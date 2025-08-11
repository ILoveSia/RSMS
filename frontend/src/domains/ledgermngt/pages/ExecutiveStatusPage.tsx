/**
 * 임원 현황 페이지
 * 책무구조 원장 관리 - 임원 현황
 */
import { useCommonCodes, type CommonCode } from '@/shared/utils/codeUtils';
import { DataGrid } from '@/shared/components/ui/data-display';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn, SelectOption } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import LedgerOrderSelect from '@/shared/components/ui/form/LedgerOrderSelect';
import { Box, Snackbar } from '@mui/material';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import React, { useCallback, useEffect, useState } from 'react';
import ErrorDialog from '../../../app/components/ErrorDialog';
import '../../../assets/scss/style.css';
import { Button, SearchButton, ManagementButtonGroup, ExcelDownloadButton, PermissionButton } from '../../../shared/components/ui/button';
import Alert from '../../../shared/components/ui/feedback/Alert';
import { ComboBox } from '../../../shared/components/ui/form';
import ExecutiveDetailDialog from '../components/ExecutiveDetailDialog';
import execOfficerApi, { type ExecOfficer } from '../api/executivestatusApi';
import { Confirm } from '@/shared/components/modal';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import Toast from '@/shared/components/ui/feedback/Toast';
import positionApi from '@/domains/ledgermngt/api/positionApi';

interface IExecutiveStatusPageProps {
  className?: string;
}

type ExecutiveStatusRow = ExecOfficer;


const ExecutiveStatusPage: React.FC<IExecutiveStatusPageProps> = (): React.JSX.Element => {
  const [rows, setRows] = useState<ExecutiveStatusRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('ALL');
  const [ledgerOrdersId, setLedgerOrdersId] = useState<number | undefined>(undefined);
  // LedgerOrder 옵션 목록을 저장할 state
  const [ledgerOrderOptions, setLedgerOrderOptions] = useState<Array<{value: string, label: string, ledgerOrdersId: number}>>([]);

  // 선택된 행
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 오류 다이얼로그 상태
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 임원 상세 다이얼로그 상태 통합
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('view');
  const [selectedExecutive, setSelectedExecutive] = useState<ExecutiveStatusRow | null>(null);

  // 성공 알림 상태
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  // 공통코드 가져오기
  const allCodes = useCommonCodes();

  // 확정/확정취소/최종확정 관련 상태
  const [confirmConfirmOpen, setConfirmConfirmOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [finalConfirmOpen, setFinalConfirmOpen] = useState(false);
  
  // LedgerOrderSelect 새로고침 트리거
  const [ledgerOrderRefreshTrigger, setLedgerOrderRefreshTrigger] = useState<number>(0);

  // Toast 알림을 위한 snackbar 훅
  const { snackbar, showSuccess: showToastSuccess, showError, hideSnackbar } = useSnackbar();


  const fetchExecutiveStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📊 임원 현황 조회 - ledgerOrdersId:', ledgerOrdersId);
      const data = await execOfficerApi.getAll(ledgerOrdersId);
      setRows(data);
    } catch (err) {
      setError('임원 현황 데이터를 불러오는 데 실패했습니다.');
      setErrorMessage('임원 현황 데이터를 불러오는 데 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }, [ledgerOrdersId]);

  useEffect(() => {
    fetchExecutiveStatus();
  }, [fetchExecutiveStatus]);

  const executiveColumns: DataGridColumn<ExecutiveStatusRow>[] = [
    {
      field: 'positionsNm',
      headerName: '직책명',
      width: 200,
      renderCell: ({ value, row }) => (
        <span
          style={{
            color: '#1976d2',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
          onClick={() => handleExecutiveDetail(row)}
        >
          {value || '해당없음'}
        </span>
      ),
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'empName',
      headerName: '성명 ',
      width: 120,
      renderCell: ({ value }) => value || '해당없음',
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },

    {
      field: 'execofficer_dt',
      headerName: '직책부여일',
      width: 150,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => value || '해당없음',
    },
    {
      field: 'dualYn',
      headerName: '겸직여부',
      width: 120,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
          <span style={{
            color: value === 'Y' ? 'var(--bank-error)' : value === 'N' ? 'var(--bank-success)' : 'var(--bank-text-primary)',
            fontWeight: 'normal'
          }}>
          {value === 'Y' ? '있음' : value === 'N' ? '없음 ' : value || '해당없음'}
        </span>
      )
    },
    {
      field: 'dualDetails',
      headerName: '겸직사항',
      width: 300,
      flex: 2,
      align: 'left',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <span style={{
          color: 'var(--bank-text-primary)',
          fontStyle: value ? 'normal' : 'italic'
        }}>
          {value || '해당없음'}
        </span>
      )
    }
  ];


  // 임원 저장 핸들러 (등록/수정 공통)
  const handleSaveExecutive = async (data: ExecOfficer) => {
    try {
      if (data.execofficerId) {
        // 수
        await execOfficerApi.update(data.execofficerId, data);
        setSuccessMessage('임원 정보가 성공적으로 수정되었습니다.');
      } else {
        // 등록
        await execOfficerApi.create(data);
        setSuccessMessage('임원 정보가 성공적으로 등록되었습니다.');
      }
      await fetchExecutiveStatus();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      setDialogOpen(false);
    } catch (error) {
      setErrorMessage('임원 정보 저장 중 오류가 발생했습니다.');
      setErrorDialogOpen(true);
    }
  };

  // 임원 상세 정보 핸들러
  const handleExecutiveDetail = (executive: ExecutiveStatusRow) => {
    setSelectedExecutive(executive);
    setDialogMode('view');
    setDialogOpen(true);
  };

  // 다이얼로그 닫기 핸들러
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedExecutive(null);
  };

  // DataGrid 체크박스 선택 핸들러
  const handleRowSelectionModelChange = (selectedRows: (string | number)[]) => {
    setSelectedIds(selectedRows.map(Number));
  };

  // 행 클릭 핸들러
  const handleRowClick = (row: ExecutiveStatusRow) => {
    handleExecutiveDetail(row);
  };

  // 엑셀 업로드
  const handleExcelUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setError(null);
      }
    };
    input.click();
  };

  // 엑셀 워크시트 설정
  const setupWorksheet = (worksheet: ExcelJS.Worksheet) => {
    // 헤더 설정
    const headers = ['직책', '사원ID', '직책부여일', '겸직여부', '겸직사항'];
    worksheet.addRow(headers);

    // 헤더 스타일 설정
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFB0C4DE' }, // lightsteelblue
    };
  };

  // 엑셀 데이터 추가
  const addDataToWorksheet = (worksheet: ExcelJS.Worksheet, data: ExecutiveStatusRow[]) => {
    data.forEach(row => {
      worksheet.addRow([
        row.positionsNm,
        row.empId,
        row.execofficer_dt,
        row.dualYn === 'Y' ? '있음' : '없음',
        row.dualDetails || '해당없음'
      ]);
    });
  };

  // 엑셀 컬럼 너비 조정
  const adjustColumnWidths = (worksheet: ExcelJS.Worksheet) => {
    worksheet.columns.forEach((column) => {
      if (column && column.width !== undefined) {
        column.width = Math.max(column.width, 15);
      }
    });
  };

  // 엑셀 파일 생성 및 다운로드
  const downloadExcelFile = async (workbook: ExcelJS.Workbook, filename: string) => {
    const excelBuffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, filename);
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
      const worksheet = workbook.addWorksheet('임원현황');

      // 워크시트 설정
      setupWorksheet(worksheet);
      
      // 데이터 추가
      addDataToWorksheet(worksheet, rows);
      
      // 컬럼 너비 조정
      adjustColumnWidths(worksheet);

      // 파일 생성 및 다운로드
      const filename = `임원현황_${new Date().toISOString().slice(0, 10)}.xlsx`;
      await downloadExcelFile(workbook, filename);
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      setError('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };

  // 오류 다이얼로그 닫기
  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

  // LedgerOrderSelect 새로고침 함수
  const refreshLedgerOrderSelect = useCallback(() => {
    setLedgerOrderRefreshTrigger(prev => prev + 1);
    console.log('📋 LedgerOrderSelect 새로고침 트리거:', ledgerOrderRefreshTrigger + 1);
  }, [ledgerOrderRefreshTrigger]);

  // 확정 버튼 클릭 핸들러
  const handleConfirmClick = useCallback(() => {
    // 1. LedgerOrderSelect 선택 검증
    if (!selectedLedgerOrder || selectedLedgerOrder === 'ALL') {
      showError('원장차수를 선택해주세요.');
      return;
    }

    // 2. "직책별책무확정" 상태 검증 (P3 상태이어야 함)
    const selectedOption = ledgerOrderOptions.find(option => option.value === selectedLedgerOrder);
    if (!selectedOption) {
      showError('선택된 원장차수 정보를 찾을 수 없습니다.');
      return;
    }

    // label에서 상태 정보 추출하여 "직책별책무확정" 여부 확인
    let statusInfo = '';
    if (selectedOption.label.includes('(') && selectedOption.label.includes(')')) {
      const statusMatch = selectedOption.label.match(/\(([^)]+)\)/);
      if (statusMatch) {
        statusInfo = statusMatch[1];
      }
    }

    if (statusInfo !== '직책별책무확정') {
      showError('직책별책무확정 상태의 원장차수만 확정 가능합니다.');
      return;
    }

    console.log('📋 임원 확정 조건 검증 통과:', {
      selectedLedgerOrder,
      statusInfo
    });

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
      console.log('📋 임원 확정 처리 시작:', {
        selectedLedgerOrder
      });

      // 임원 확정 전용 API 사용 (P3 → P4)
      const response = await positionApi.confirmExecutive(selectedLedgerOrder);
      showToastSuccess(response.message || '임원이 확정되었습니다.');
      
      // 1. LedgerOrderSelect 새로고침
      refreshLedgerOrderSelect();
      
      // 2. DataGrid 새로고침
      await fetchExecutiveStatus();
      
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
  }, [selectedLedgerOrder, showToastSuccess, showError, fetchExecutiveStatus, refreshLedgerOrderSelect]);

  // 확정취소 버튼 클릭 핸들러
  const handleCancelConfirmClick = useCallback(() => {
    // 1. LedgerOrderSelect 선택 검증
    if (!selectedLedgerOrder || selectedLedgerOrder === 'ALL') {
      showError('원장차수를 선택해주세요.');
      return;
    }

    // 2. "임원확정" 상태 검증 (P4 상태이어야 함)
    const selectedOption = ledgerOrderOptions.find(option => option.value === selectedLedgerOrder);
    if (!selectedOption) {
      showError('선택된 원장차수 정보를 찾을 수 없습니다.');
      return;
    }

    // label에서 상태 정보 추출하여 "임원확정" 여부 확인
    let statusInfo = '';
    if (selectedOption.label.includes('(') && selectedOption.label.includes(')')) {
      const statusMatch = selectedOption.label.match(/\(([^)]+)\)/);
      if (statusMatch) {
        statusInfo = statusMatch[1];
      }
    }

    if (statusInfo !== '임원확정') {
      showError('임원확정 상태의 원장차수만 확정취소 가능합니다.');
      return;
    }

    console.log('🔄 임원 확정취소 조건 검증 통과:', {
      selectedLedgerOrder,
      statusInfo
    });

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
      console.log('🔄 임원 확정취소 처리 시작:', {
        selectedLedgerOrder
      });

      // 임원 확정취소 전용 API 사용 (P4 → P3)
      const response = await positionApi.cancelExecutive(selectedLedgerOrder);
      showToastSuccess(response.message || '임원 확정이 취소되었습니다.');
      
      // 1. LedgerOrderSelect 새로고침
      refreshLedgerOrderSelect();
      
      // 2. DataGrid 새로고침
      await fetchExecutiveStatus();
      
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
  }, [selectedLedgerOrder, showToastSuccess, showError, fetchExecutiveStatus, refreshLedgerOrderSelect]);

  // 최종확정 버튼 클릭 핸들러
  const handleFinalConfirmClick = useCallback(() => {
    // 1. LedgerOrderSelect 선택 검증
    if (!selectedLedgerOrder || selectedLedgerOrder === 'ALL') {
      showError('원장차수를 선택해주세요.');
      return;
    }

    // 2. "임원확정" 상태 검증 (P4 상태이어야 함)
    const selectedOption = ledgerOrderOptions.find(option => option.value === selectedLedgerOrder);
    if (!selectedOption) {
      showError('선택된 원장차수 정보를 찾을 수 없습니다.');
      return;
    }

    // label에서 상태 정보 추출하여 "임원확정" 여부 확인
    let statusInfo = '';
    if (selectedOption.label.includes('(') && selectedOption.label.includes(')')) {
      const statusMatch = selectedOption.label.match(/\(([^)]+)\)/);
      if (statusMatch) {
        statusInfo = statusMatch[1];
      }
    }

    if (statusInfo !== '임원확정') {
      showError('임원확정 상태의 원장차수만 최종확정 가능합니다.');
      return;
    }

    console.log('🎯 임원 최종확정 조건 검증 통과:', {
      selectedLedgerOrder,
      statusInfo
    });

    // 최종확정 confirm 창 표시
    setFinalConfirmOpen(true);
  }, [selectedLedgerOrder, ledgerOrderOptions, showError]);

  // 최종확정 처리 핸들러
  const handleFinalConfirmLedgerOrder = useCallback(async () => {
    if (!selectedLedgerOrder) {
      setFinalConfirmOpen(false);
      return;
    }

    setLoading(true);
    try {
      console.log('🎯 임원 최종확정 처리 시작:', {
        selectedLedgerOrder
      });

      // 임원 최종확정 전용 API 사용 (P4 → P5)
      const response = await positionApi.finalConfirmExecutive(selectedLedgerOrder);
      showToastSuccess(response.message || '임원이 최종확정되었습니다.');
      
      // 1. LedgerOrderSelect 새로고침
      refreshLedgerOrderSelect();
      
      // 2. DataGrid 새로고침
      await fetchExecutiveStatus();
      
    } catch (err: unknown) {
      let errorMessage = '최종확정 처리 중 오류가 발생했습니다.';
      
      if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      showError(errorMessage);
      console.error('최종확정 처리 실패:', err);
    } finally {
      setLoading(false);
      setFinalConfirmOpen(false);
    }
  }, [selectedLedgerOrder, showToastSuccess, showError, fetchExecutiveStatus, refreshLedgerOrderSelect]);

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
        title="[500] 임원 현황"
        icon={<GroupsIcon />}
        description="임원 직책을 조회하고 관리합니다."
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
            onChange={useCallback((value: string, ledgerOrdersId?: number) => {
              setSelectedLedgerOrder(value);
              setLedgerOrdersId(ledgerOrdersId);
              console.log('LedgerOrder 선택 변경:', { value, ledgerOrdersId });
            }, [])}
            size='small'
            sx={{ minWidth: 150, maxWidth: 200 }}
            refreshTrigger={ledgerOrderRefreshTrigger}
            onLoadComplete={useCallback((options: Array<{value: string, label: string, ledgerOrdersId: number}>) => {
              setLedgerOrderOptions(options);
              console.log('LedgerOrder 옵션 로드 완료:', options);
            }, [])}
          />
          <SearchButton
            onClick={useCallback(() => {
              console.log('🔍 검색 버튼 클릭 - 선택된 ledgerOrdersId:', ledgerOrdersId);
              fetchExecutiveStatus();
            }, [fetchExecutiveStatus, ledgerOrdersId])}
            loading={loading}
            disabled={loading}
          />
          <Box sx={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <PermissionButton
              menuCode="LEDGER_MGMT_EXECUTIVE"
              permission="write"
              variant="contained"
              color="success"
              size="small"
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
              menuCode="LEDGER_MGMT_EXECUTIVE"
              permission="write"
              variant="contained"
              color="error"
              size="small"
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
            <PermissionButton
              menuCode="LEDGER_MGMT_EXECUTIVE"
              permission="write"
              variant="contained"
              color="primary"
              size="small"
              onClick={handleFinalConfirmClick}
              disabled={loading}
              hideWhenNoPermission={true}
              noPermissionTooltip="최종확정 권한이 없습니다"
              sx={{
                height: '32px',
                minWidth: '80px',
                fontSize: '0.875rem',
                fontWeight: 600,
                borderRadius: 1,
              }}
            >
              최종확정
            </PermissionButton>
          </Box>
        </Box>

        {/* 버튼 영역 */}
        <Box sx={{
          display: 'flex',
          gap: 1,
          marginBottom: '6px',
          justifyContent: 'flex-end',
          alignItems: 'center',
          height: '32px',
        }}>
          {/* <Button
            variant="contained"
            color="success"
            size="small"
            onClick={handleExcelUpload}
            sx={{
              height: '32px',
              minWidth: '80px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 1,
            }}
          >
            엑셀 업로드
          </Button> */}
          <ExcelDownloadButton
            onDownload={handleExcelDownload}
            filename="executive_status"
            disabled={loading || rows.length === 0}
            loading={loading}
          />
        </Box>

        {/* 데이터 그리드 */}
        <Box sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: '100%' // 높이 추가
        }}>
          <DataGrid
            data={rows}
            columns={executiveColumns}
            loading={loading}
            height={600} 
            error={error}
            selectable
            multiSelect={false}
            selectedRows={selectedIds}
            // onRowClick={handleRowClick}
            onRowSelectionChange={handleRowSelectionModelChange}
            rowIdField="positionsNm"
          />
        </Box>

        {/* 성공 알림 */}
        <Snackbar
          open={showSuccess}
          autoHideDuration={2000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success">
            {successMessage}
          </Alert>
        </Snackbar>

        {/* 다이얼로그들 */}
        <ErrorDialog
          open={errorDialogOpen}
          onClose={handleCloseErrorDialog}
          errorMessage={errorMessage}
        />

        <ExecutiveDetailDialog
          mode={dialogMode}
          open={dialogOpen}
          onChangeMode={setDialogMode}
          onClose={handleCloseDialog}
          executive={selectedExecutive}
          onSave={handleSaveExecutive}
        />

        {/* 확정 확인 다이얼로그 */}
        <Confirm
          open={confirmConfirmOpen}
          title="확정 확인"
          message={`${selectedLedgerOrder} 차수의 임원을 확정하시겠습니까?`}
          confirmText="확정"
          cancelText="취소"
          onConfirm={handleConfirmLedgerOrder}
          onCancel={() => {
            setConfirmConfirmOpen(false);
          }}
        />
        
        {/* 확정취소 확인 다이얼로그 */}
        <Confirm
          open={cancelConfirmOpen}
          title="확정취소 확인"
          message={`${selectedLedgerOrder} 차수의 임원을 확정취소하시겠습니까?`}
          confirmText="확정취소"
          cancelText="취소"
          onConfirm={handleCancelConfirmLedgerOrder}
          onCancel={() => {
            setCancelConfirmOpen(false);
          }}
        />

        {/* 최종확정 확인 다이얼로그 */}
        <Confirm
          open={finalConfirmOpen}
          title="최종확정 확인"
          message={`${selectedLedgerOrder} 차수의 임원을 최종확정하시겠습니까?`}
          confirmText="최종확정"
          cancelText="취소"
          onConfirm={handleFinalConfirmLedgerOrder}
          onCancel={() => {
            setFinalConfirmOpen(false);
          }}
        />

        {/* Toast 알림 */}
        <Toast
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={hideSnackbar}
        />
      </PageContent>
    </PageContainer>
  );
};

export default ExecutiveStatusPage;
