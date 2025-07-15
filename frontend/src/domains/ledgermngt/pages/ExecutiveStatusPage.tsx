/**
 * 임원 현황 페이지
 * 책무구조 원장 관리 - 임원 현황
 */
import apiClient from '@/app/common/api/client'; // axios 인스턴스 등
import { DataGrid } from '@/shared/components/ui/data-display';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn, SelectOption } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import {
  Box,
  Snackbar
} from '@mui/material';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import React, { useCallback, useEffect, useState } from 'react';
import ErrorDialog from '../../../app/components/ErrorDialog';
import ExecutiveDetailDialog from '../../../app/components/ExecutiveDetailDialog';
import '../../../assets/scss/style.css';
import { Button } from '../../../shared/components/ui/button';
import Alert from '../../../shared/components/ui/feedback/Alert';
import { ComboBox } from '../../../shared/components/ui/form';

export interface ExecOfficer {
  id: number;
  positionName: string;
  executiveName: string;
  jobTitle: string;
  appointmentDate: string;
  hasConcurrentPosition: boolean;
  concurrentDetails: string;
}

const execOfficerApi = {
  getAll: async (): Promise<ExecOfficer[]> => {
    const response = await apiClient.get<ExecOfficer[]>('/execofficer');
    return response;
  },
  create: async (data: Omit<ExecOfficer, 'id'>): Promise<ExecOfficer> => {
    const response = await apiClient.post<ExecOfficer>('/execofficer', data);
    return response;
  },
  update: async (id: number, data: Omit<ExecOfficer, 'id'>): Promise<ExecOfficer> => {
    const response = await apiClient.put<ExecOfficer>(`/execofficer/${id}`, data);
    return response;
  },
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/execofficer/${id}`);
  }
};

interface IExecutiveStatusPageProps {
  className?: string;
}

interface ExecutiveStatusRow {
  id: number;
  positionName: string;      // 직책
  executiveName: string;     // 성명
  jobTitle: string;          // 직위
  appointmentDate: string;   // 현 직책 부여일
  hasConcurrentPosition: boolean; // 겸직여부
  concurrentDetails: string;  // 겸직사항
}

const ExecutiveStatusPage: React.FC<IExecutiveStatusPageProps> = (): React.JSX.Element => {
  const [rows, setRows] = useState<ExecutiveStatusRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 필터 상태
  const [ledgerOrderFilter, setLedgerOrderFilter] = useState<string>('전체');

  // 선택된 행
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 원장차수 SelectBox 옵션
  const [ledgerOrderOptions, setLedgerOrderOptions] = useState<{ value: string; label: string }[]>([]);

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

  // 페이징 상태
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });

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

  useEffect(() => {
    // 원장차수 옵션 불러오기
    import('../api/ledgerOrderApi').then(({ fetchLedgerOrderSelectList }) => {
      fetchLedgerOrderSelectList().then(setLedgerOrderOptions);
    });
  }, []);

  const executiveColumns: DataGridColumn<ExecutiveStatusRow>[] = [
    {
      field: 'positionName',
      headerName: '직책',
      width: 200,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <span
          style={{
            color: '#1976d2',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
          onClick={() => handleExecutiveDetail(row)}
        >
          {row.positionName}
        </span>
      ),
    },
    {
      field: 'executiveName',
      headerName: '성명',
      width: 150,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'jobTitle',
      headerName: '직위',
      width: 150,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'appointmentDate',
      headerName: '현 직책 부여일',
      width: 180,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => {
        if (value && typeof value === 'string') {
          const date = new Date(value);
          return date.toLocaleDateString('ko-KR');
        }
        return '';
      }
    },
    {
      field: 'hasConcurrentPosition',
      headerName: '겸직여부',
      width: 120,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <span style={{
          color: value ? '#dc3545' : '#28a745',
          fontWeight: 'bold'
        }}>
          {value ? '있음' : '없음'}
        </span>
      )
    },
    {
      field: 'concurrentDetails',
      headerName: '겸직사항',
      width: 300,
      flex: 2,
      align: 'left',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <span style={{
          color: value ? '#1976d2' : '#6c757d',
          fontStyle: value ? 'normal' : 'italic'
        }}>
          {value || '해당없음'}
        </span>
      )
    }
  ];

  // 필터 변경 핸들러
  const handleLedgerOrderChange = (value: string | SelectOption | SelectOption[] | string[] | null) => {
    if (typeof value === 'string') {
      setLedgerOrderFilter(value);
    } else if (value && !Array.isArray(value) && 'value' in value) {
      setLedgerOrderFilter(String(value.value));
    } else {
      setLedgerOrderFilter('전체');
    }
  };

  // 임원 저장 핸들러 (등록/수정 공통)
  const handleSaveExecutive = async (data: any) => {
    try {
      if (data.id) {
        // 수정
        await execOfficerApi.update(data.id, data);
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
  const handleRowSelectionModelChange = (selectedRows: (string | number)[], selectedData: ExecutiveStatusRow[]) => {
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
        // TODO: 엑셀 파일 업로드 처리 구현
        console.log('엑셀 업로드:', file.name);
        // 임시로 성공 메시지 표시
        setError(null);
        alert(`${file.name} 파일이 선택되었습니다.`);
      }
    };
    input.click();
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

      // 헤더 설정
      const headers = ['직책', '성명', '직위', '현 직책 부여일', '겸직여부', '겸직사항'];
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
          row.positionName,
          row.executiveName,
          row.jobTitle,
          new Date(row.appointmentDate).toLocaleDateString('ko-KR'),
          row.hasConcurrentPosition ? '있음' : '없음',
          row.concurrentDetails || '해당없음'
        ]);
      });

      // 컬럼 너비 자동 조정
      worksheet.columns.forEach((column) => {
        if (column && column.width !== undefined) {
          column.width = Math.max(column.width, 15);
        }
      });

      // 파일 생성 및 다운로드
      const excelBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `임원현황_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
        overflow: 'hidden',
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
            options={ledgerOrderOptions}
            onChange={(value) => setLedgerOrderFilter(value as string)}
            size="small"
            sx={{ minWidth: '200px' }}
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
          gap: '8px',
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
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={handleExcelDownload}
            disabled={loading || rows.length === 0}
          >
            엑셀 다운로드
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleCreateExecutive}
          >
            등록
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleCreateExecutive}
          >
            변경 이력
          </Button>
        </Box>

        {/* 데이터 그리드 */}
        <Box sx={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
          <DataGrid<ExecutiveStatusRow>
            data={rows}
            columns={executiveColumns}
            loading={loading}
            error={error}
            selectable
            multiSelect={false}
            selectedRows={selectedIds}
            // onRowClick={handleRowClick}
            onRowSelectionChange={(selectedRows: (string | number)[], selectedData: ExecutiveStatusRow[]) => {
              setSelectedIds(selectedRows.map(Number));
            }}
            rowIdField="id"
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
          open={dialogOpen}
          onClose={handleCloseDialog}
          executive={selectedExecutive}
          onSave={handleSaveExecutive}
        />
      </PageContent>
    </PageContainer>
  );
};

export default ExecutiveStatusPage;
