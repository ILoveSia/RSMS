/**
 * 임원 현황 페이지
 * 책무구조 원장 관리 - 임원 현황
 */
import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
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
import { Button, ExcelDownloadButton } from '../../../shared/components/ui/button';
import Alert from '../../../shared/components/ui/feedback/Alert';
import { ComboBox } from '../../../shared/components/ui/form';
import ExecutiveDetailDialog from '../components/ExecutiveDetailDialog';
import execOfficerApi, { type ExecOfficer } from '../api/executivestatusApi';

interface IExecutiveStatusPageProps {
  className?: string;
}

type ExecutiveStatusRow = ExecOfficer;


const ExecutiveStatusPage: React.FC<IExecutiveStatusPageProps> = (): React.JSX.Element => {
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
  const { data: allCodes, setData: setAllCodes } = useReduxState<
    { data: CommonCode[] } | CommonCode[]
  >('codeStore/allCodes');


  // 공통코드 배열 추출 함수
  const getCodesArray = (): CommonCode[] => {
    if (!allCodes) return [];
    if (Array.isArray(allCodes)) {
      return allCodes;
    }
    if (typeof allCodes === 'object' && 'data' in allCodes && Array.isArray(allCodes.data)) {
      return allCodes.data;
    }
    return [];
  };


  const fetchExecutiveStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await execOfficerApi.getAll();
      setRows(data);
    } catch (err) {
      setError('임원 현황 데이터를 불러오는 데 실패했습니다.');
      setErrorMessage('임원 현황 데이터를 불러오는 데 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExecutiveStatus();
  }, [fetchExecutiveStatus]);

  const executiveColumns: DataGridColumn<ExecutiveStatusRow>[] = [
    {
      field: 'positionNameMapped',
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
      field: 'empId',
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
          color: value === 'Y' ? '#dc3545' : value === 'N' ? '#28a745' : '#000000',
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
          color: "#000000",
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
        row.positionNameMapped,
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

        {/* 버튼 영역 */}
        <Box sx={{
          display: 'flex',
          gap: 1,
          marginBottom: '6px',
          justifyContent: 'flex-end'
        }}>
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
            error={error}
            selectable
            multiSelect={false}
            selectedRows={selectedIds}
            // onRowClick={handleRowClick}
            onRowSelectionChange={handleRowSelectionModelChange}
            rowIdField="positionNameMapped"
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
      </PageContent>
    </PageContainer>
  );
};

export default ExecutiveStatusPage;
