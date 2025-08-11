/**
 * 임원 현황 페이지 (결재 시스템 통합 예제)
 * 책무구조 원장 관리 - 임원 현황 + 결재 기능
 */
import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
import DataGrid from '@/shared/components/ui/data-display/DataGrid';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn, SelectOption } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import LedgerOrderSelect from '@/shared/components/ui/form/LedgerOrderSelect';
import { Box, Snackbar, Divider } from '@mui/material';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import React, { useCallback, useEffect, useState } from 'react';
import ErrorDialog from '../../../app/components/ErrorDialog';
import '../../../assets/scss/style.css';
import { Button, ExcelDownloadButton } from '../../../shared/components/ui/button';
import Alert from '../../../shared/components/ui/feedback/Alert';
import { ComboBox } from '../../../shared/components/ui/form';
import ExecutiveDetailDialog from '../components/ExecutiveDetailDialog';
import execOfficerApi, { type ExecOfficer } from '../api/executivestatusApi';

// 결재 시스템 컴포넌트 import
import ApprovalActionButton from '@/shared/components/approval/ApprovalActionButton';

interface IExecutiveStatusPageProps {
  className?: string;
}

type ExecutiveStatusRow = ExecOfficer;

// 임시 사용자 정보 (실제 구현 시 context에서 가져오기)
const CURRENT_USER_ID = 'user001';

const ExecutiveStatusPageWithApproval: React.FC<IExecutiveStatusPageProps> = (): React.JSX.Element => {
  const [rows, setRows] = useState<ExecutiveStatusRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('ALL');

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

  // Redux 상태
  const { common } = useReduxState((state) => ({
    common: state.common.commonCodes,
  }));

  // 공통코드 옵션 생성
  const ledgerOrderOptions: SelectOption[] = [
    { value: 'ALL', label: '전체' },
    ...common
      .filter((code: CommonCode) => code.codeId.startsWith('LEDGER_ORDER'))
      .map((code: CommonCode) => ({
        value: code.code,
        label: code.codeName,
      })),
  ];

  // 데이터 조회
  const fetchExecutiveStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = selectedLedgerOrder === 'ALL' 
        ? await execOfficerApi.findAll()
        : await execOfficerApi.findByLedgerOrder(selectedLedgerOrder);
      
      setRows(data);
    } catch (err) {
      console.error('임원 현황 조회 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');
      setErrorMessage('임원 현황 조회 중 오류가 발생했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }, [selectedLedgerOrder]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchExecutiveStatus();
  }, [fetchExecutiveStatus]);

  // DataGrid 컬럼 정의
  const columns: DataGridColumn<ExecutiveStatusRow>[] = [
    {
      field: 'positionName', 
      headerName: '직책',
      width: 140,
      flex: 1,
      align: 'left',
      headerAlign: 'center',
    },
    {
      field: 'empId',
      headerName: '사원ID',
      width: 120,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'assignmentDate',
      headerName: '직책부여일',
      width: 140,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => value ? new Date(value).toLocaleDateString() : '',
    },
    {
      field: 'concurrentJobYn',
      headerName: '겸직여부',
      width: 100,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => value === 'Y' ? '겸직' : '전담',
    },
    {
      field: 'concurrentJobDetails',
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
        // 수정
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

  // 임원 등록 핸들러
  const handleCreateExecutive = () => {
    setSelectedExecutive(null);
    setDialogMode('create');
    setDialogOpen(true);
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

  // 엑셀 다운로드
  const handleExcelDownload = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('임원현황');
      
      setupWorksheet(worksheet);
      addDataToWorksheet(worksheet, rows);
      
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      saveAs(blob, `executive_status_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      setErrorMessage('엑셀 다운로드 중 오류가 발생했습니다.');
      setErrorDialogOpen(true);
    }
  };

  // 엑셀 워크시트 설정
  const setupWorksheet = (worksheet: ExcelJS.Worksheet) => {
    const headers = ['직책', '사원ID', '직책부여일', '겸직여부', '겸직사항'];
    worksheet.addRow(headers);

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFB0C4DE' },
    };
  };

  // 엑셀 데이터 추가
  const addDataToWorksheet = (worksheet: ExcelJS.Worksheet, data: ExecutiveStatusRow[]) => {
    data.forEach(row => {
      worksheet.addRow([
        row.positionName,
        row.empId,
        row.assignmentDate ? new Date(row.assignmentDate).toLocaleDateString() : '',
        row.concurrentJobYn === 'Y' ? '겸직' : '전담',
        row.concurrentJobDetails || '해당없음'
      ]);
    });
  };

  // 결재 상태 변경 핸들러
  const handleApprovalStateChange = () => {
  };

  return (
    <PageContainer
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <PageHeader
        title="[500] 임원 현황 (결재 통합)"
        icon={<GroupsIcon />}
        description="임원 직책을 조회하고 관리하며, 결재 시스템을 통해 승인 프로세스를 진행합니다."
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
          gap: 1,
          position: 'relative',
        }}
      >
        {/* 조회 조건 */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          alignItems: 'center',
          marginBottom: '6px' 
        }}>
          <LedgerOrderSelect
            value={selectedLedgerOrder}
            onChange={setSelectedLedgerOrder}
            size='small'
            sx={{ minWidth: 150, maxWidth: 200 }}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={fetchExecutiveStatus}
          >
            조회
          </Button>
        </Box>

        {/* 기존 버튼 영역 */}
        <Box sx={{
          display: 'flex',
          gap: 1,
          marginBottom: '6px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* 좌측: 결재 관련 버튼 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ApprovalActionButton
              taskType="EXECUTIVE_STATUS"
              taskId={1} // 실제로는 해당 업무의 고유 ID
              taskTitle="임원 현황 관리"
              currentUserId={CURRENT_USER_ID}
              onApprovalStateChange={handleApprovalStateChange}
              size="small"
              variant="contained"
            />
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
          </Box>

          {/* 우측: 기존 관리 버튼들 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained" 
              color="secondary"
              size="small"
              onClick={handleCreateExecutive}
            >
              임원 등록
            </Button>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={handleExcelUpload}
            >
              엑셀 업로드
            </Button>
            <ExcelDownloadButton
              onDownload={handleExcelDownload}
              filename="executive_status"
              disabled={loading || rows.length === 0}
              loading={loading}
            />
          </Box>
        </Box>

        {/* 데이터 그리드 */}
        <Box sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          {error && (
            <Alert 
              severity="error" 
              sx={{ marginBottom: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          
          <DataGrid<ExecutiveStatusRow>
            data={rows}
            columns={columns}
            loading={loading}
            checkboxSelection
            onRowSelectionModelChange={handleRowSelectionModelChange}
            onRowClick={handleRowClick}
            pagination={{
              page: 1,
              pageSize: 20,
              totalItems: rows.length,
            }}
            sx={{
              flex: 1,
              '& .MuiDataGrid-cell': {
                color: 'var(--bank-text-primary)'
              },
              '& .MuiDataGrid-columnHeaders, & .MuiDataGrid-columnHeaderTitle': {
                color: 'var(--bank-text-primary)'
              },
              '& .MuiDataGrid-row:hover': {
                cursor: 'pointer',
              }
            }}
          />
        </Box>
      </PageContent>

      {/* 임원 상세/등록 다이얼로그 */}
      <ExecutiveDetailDialog
        open={dialogOpen}
        mode={dialogMode}
        executive={selectedExecutive}
        onClose={handleCloseDialog}
        onSave={handleSaveExecutive}
      />

      {/* 오류 다이얼로그 */}
      <ErrorDialog
        open={errorDialogOpen}
        message={errorMessage}
        onClose={() => setErrorDialogOpen(false)}
      />

      {/* 성공 알림 */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={2000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};

export default ExecutiveStatusPageWithApproval;