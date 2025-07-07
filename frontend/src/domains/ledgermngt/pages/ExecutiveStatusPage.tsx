/**
 * 임원 현황 페이지
 * 책무구조 원장 관리 - 임원 현황
 */
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select
} from '@mui/material';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import React, { useCallback, useEffect, useState } from 'react';
import ErrorDialog from '../../../app/components/ErrorDialog';
import type { ExecutiveRegistrationData } from '../../../app/components/ExecutiveRegistrationDialog';
import ExecutiveRegistrationDialog from '../../../app/components/ExecutiveRegistrationDialog';
import '../../../assets/scss/style.css';

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

  // 임원 등록 다이얼로그 상태
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);

  // 페이징 상태
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });

  const fetchExecutiveStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: 실제 API 엔드포인트로 변경 필요
      // const response = await apiClient.get<ApiResponse<ExecutiveStatusRow[]>>('/executives/status-list');

      // 임시 테스트 데이터
      const testData: ExecutiveStatusRow[] = [
        {
          id: 1,
          positionName: '대표이사',
          executiveName: '김대표',
          jobTitle: 'CEO',
          appointmentDate: '2024-01-15',
          hasConcurrentPosition: true,
          concurrentDetails: '이사회 의장'
        },
        {
          id: 2,
          positionName: '리스크관리부장',
          executiveName: '이부장',
          jobTitle: '상무이사',
          appointmentDate: '2024-02-01',
          hasConcurrentPosition: false,
          concurrentDetails: ''
        },
        {
          id: 3,
          positionName: '준법지원부장',
          executiveName: '박부장',
          jobTitle: '상무이사',
          appointmentDate: '2024-01-20',
          hasConcurrentPosition: true,
          concurrentDetails: '컴플라이언스위원회 위원장'
        },
        {
          id: 4,
          positionName: '내부통제부장',
          executiveName: '최부장',
          jobTitle: '이사',
          appointmentDate: '2024-03-01',
          hasConcurrentPosition: false,
          concurrentDetails: ''
        },
        {
          id: 5,
          positionName: '감사부장',
          executiveName: '정부장',
          jobTitle: '이사',
          appointmentDate: '2024-02-15',
          hasConcurrentPosition: true,
          concurrentDetails: '감사위원회 위원'
        }
      ];

      // 필터링 적용
      let filteredData = testData;

      if (ledgerOrderFilter !== '전체') {
        // 원장차수 필터링 로직 (실제 구현 시 필요)
        filteredData = filteredData.filter(item => true); // 임시
      }

      setRows(filteredData);
    } catch (err) {
      const errorMsg = '임원 현황 데이터를 불러오는 데 실패했습니다.';
      setError(errorMsg);
      setErrorMessage(errorMsg);
      setErrorDialogOpen(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [ledgerOrderFilter]);

  useEffect(() => {
    fetchExecutiveStatus();
  }, [fetchExecutiveStatus]);

  useEffect(() => {
    // 원장차수 옵션 불러오기
    import('../api/ledgerOrderApi').then(({ fetchLedgerOrderSelectList }) => {
      fetchLedgerOrderSelectList().then(setLedgerOrderOptions);
    });
  }, []);

  const executiveColumns: GridColDef[] = [
    {
      field: 'positionName',
      headerName: '직책',
      width: 200,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
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
      renderCell: (params) => {
        if (params.value) {
          const date = new Date(params.value);
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
      renderCell: (params) => (
        <span style={{
          color: params.value ? '#dc3545' : '#28a745',
          fontWeight: 'bold'
        }}>
          {params.value ? '있음' : '없음'}
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
      renderCell: (params) => (
        <span style={{
          color: params.value ? '#1976d2' : '#6c757d',
          fontStyle: params.value ? 'normal' : 'italic'
        }}>
          {params.value || '해당없음'}
        </span>
      )
    },
    {
      field: 'actions',
      headerName: '작업',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          height: '100%',
          width: '100%'
        }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleHistoryView(params.row.id)}
            sx={{
              fontSize: '0.75rem',
              minWidth: '60px',
              height: '28px'
            }}
          >
            변경이력
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleEditExecutive(params.row)}
            sx={{
              fontSize: '0.75rem',
              minWidth: '60px',
              height: '28px'
            }}
          >
            수정
          </Button>
        </Box>
      )
    }
  ];

  // 필터 변경 핸들러
  const handleLedgerOrderChange = (event: any) => {
    setLedgerOrderFilter(event.target.value);
  };

  // 임원 수정 핸들러
  const handleEditExecutive = (executive: ExecutiveStatusRow) => {
    // TODO: 수정 다이얼로그 구현
    console.log('수정할 임원:', executive);
    alert(`${executive.executiveName} 임원의 수정 기능을 구현 예정입니다.`);
  };

  // 임원 등록 핸들러
  const handleCreateExecutive = () => {
    setRegistrationDialogOpen(true);
  };

  // 임원 등록 다이얼로그 닫기 핸들러
  const handleCloseRegistrationDialog = () => {
    setRegistrationDialogOpen(false);
  };

  // 임원 등록 저장 핸들러
  const handleSaveExecutive = async (data: ExecutiveRegistrationData) => {
    try {
      console.log('임원 등록 데이터:', data);

      // TODO: 실제 API 호출로 변경
      // const response = await apiClient.post('/executives', data);

      // 임시로 성공 처리
      alert('임원 정보가 성공적으로 등록되었습니다.');

      // 목록 새로고침
      await fetchExecutiveStatus();

    } catch (error) {
      console.error('임원 등록 오류:', error);
      setErrorMessage('임원 등록 중 오류가 발생했습니다.');
      setErrorDialogOpen(true);
    }
  };

  // DataGrid 체크박스 선택 핸들러
  const handleRowSelectionModelChange = (newSelection: GridRowSelectionModel) => {
    if (Array.isArray(newSelection)) {
      setSelectedIds(newSelection.map(Number));
    } else {
      setSelectedIds([]);
    }
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
      worksheet.columns.forEach(column => {
        column.width = Math.max(column.width || 0, 15);
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

  // 변경이력 조회
  const handleHistoryView = (id: number) => {
    // TODO: 변경이력 조회 기능 구현
    console.log('변경이력 조회:', id);

    // 임시로 메시지 표시
    const targetRow = rows.find(row => row.id === id);
    if (targetRow) {
      alert(`${targetRow.executiveName} 임원의 변경이력을 조회합니다.`);
    }
  };

  // 오류 다이얼로그 닫기
  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

  return (
    <div className="main-content">
      {/* 페이지 제목 */}
      <div className="responsibility-header">
        <h1 className="responsibility-header__title">★ [500] 임원 현황</h1>
      </div>

      {/* 노란색 구분선 */}
      <div className="responsibility-divider"></div>

      <div className="responsibility-section" style={{ marginTop: '20px' }}>
        {/* 필터 영역 */}
        <Box sx={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          alignItems: 'center',
          backgroundColor: 'var(--bank-bg-secondary)',
          border: '1px solid var(--bank-border)',
          padding: '8px 16px',
          borderRadius: '4px'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--bank-text-primary)' }}>
            원장차수
          </span>
          <FormControl size="small">
            <Select
              value={ledgerOrderFilter}
              onChange={handleLedgerOrderChange}
              sx={{
                backgroundColor: 'white',
                fontSize: '0.85rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--bank-border)',
                },
              }}
            >
              <MenuItem value="전체" sx={{ fontSize: '0.85rem' }}>전체</MenuItem>
              {ledgerOrderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.85rem' }}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* 버튼 영역 */}
        <Box sx={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          justifyContent: 'flex-end'
        }}>
          <Button
            variant="contained"
            onClick={handleExcelUpload}
            sx={{
              backgroundColor: 'var(--bank-success)',
              '&:hover': { backgroundColor: 'var(--bank-success-dark)' },
              fontSize: '0.85rem'
            }}
          >
            엑셀 업로드
          </Button>
          <Button
            variant="contained"
            onClick={handleExcelDownload}
            disabled={loading || rows.length === 0}
            sx={{
              backgroundColor: 'var(--bank-primary)',
              '&:hover': { backgroundColor: 'var(--bank-primary-dark)' },
              fontSize: '0.85rem'
            }}
          >
            엑셀 다운로드
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateExecutive}
            sx={{
              backgroundColor: 'var(--bank-success)',
              '&:hover': { backgroundColor: 'var(--bank-success-dark)' },
              fontSize: '0.85rem'
            }}
          >
            등록
          </Button>
        </Box>

        {/* 데이터 그리드 */}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={executiveColumns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            loading={loading}
            pageSizeOptions={[20, 50, 100]}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={handleRowSelectionModelChange}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'var(--bank-bg-secondary)',
                fontWeight: 'bold',
                fontSize: '0.85rem',
              },
              '& .MuiDataGrid-cell': {
                fontSize: '0.85rem',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'var(--bank-bg-hover)',
              },
            }}
          />
        </Box>

        {/* 다이얼로그들 */}
        <ErrorDialog
          open={errorDialogOpen}
          onClose={handleCloseErrorDialog}
          errorMessage={errorMessage}
        />

        <ExecutiveRegistrationDialog
          open={registrationDialogOpen}
          onClose={handleCloseRegistrationDialog}
          onSave={handleSaveExecutive}
        />
      </div>
    </div>
  );
};

export default ExecutiveStatusPage;

/**
 * 임원 현황 페이지
 * 책무구조 원장 관리 - 임원 현황
 */
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Snackbar
} from '@mui/material';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import React, { useCallback, useEffect, useState } from 'react';
import ErrorDialog from '../../../app/components/ErrorDialog';
import ExecutiveDetailDialog from '../../../app/components/ExecutiveDetailDialog';
import '../../../assets/scss/style.css';
import Alert from '../../../shared/components/ui/feedback/Alert';

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
      // TODO: 실제 API 엔드포인트로 변경 필요
      // const response = await apiClient.get<ApiResponse<ExecutiveStatusRow[]>>('/executives/status-list');

      // 임시 테스트 데이터
      const testData: ExecutiveStatusRow[] = [
        {
          id: 1,
          positionName: '대표이사',
          executiveName: '김대표',
          jobTitle: 'CEO',
          appointmentDate: '2024-01-15',
          hasConcurrentPosition: true,
          concurrentDetails: '이사회 의장'
        },
        {
          id: 2,
          positionName: '리스크관리부장',
          executiveName: '이부장',
          jobTitle: '상무이사',
          appointmentDate: '2024-02-01',
          hasConcurrentPosition: false,
          concurrentDetails: ''
        },
        {
          id: 3,
          positionName: '준법지원부장',
          executiveName: '박부장',
          jobTitle: '상무이사',
          appointmentDate: '2024-01-20',
          hasConcurrentPosition: true,
          concurrentDetails: '컴플라이언스위원회 위원장'
        },
        {
          id: 4,
          positionName: '내부통제부장',
          executiveName: '최부장',
          jobTitle: '이사',
          appointmentDate: '2024-03-01',
          hasConcurrentPosition: false,
          concurrentDetails: ''
        },
        {
          id: 5,
          positionName: '감사부장',
          executiveName: '정부장',
          jobTitle: '이사',
          appointmentDate: '2024-02-15',
          hasConcurrentPosition: true,
          concurrentDetails: '감사위원회 위원'
        }
      ];

      // 필터링 적용
      let filteredData = testData;

      if (ledgerOrderFilter !== '전체') {
        // 원장차수 필터링 로직 (실제 구현 시 필요)
        filteredData = filteredData.filter(item => true); // 임시
      }

      setRows(filteredData);
    } catch (err) {
      const errorMsg = '임원 현황 데이터를 불러오는 데 실패했습니다.';
      setError(errorMsg);
      setErrorMessage(errorMsg);
      setErrorDialogOpen(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [ledgerOrderFilter]);

  useEffect(() => {
    fetchExecutiveStatus();
  }, [fetchExecutiveStatus]);

  useEffect(() => {
    // 원장차수 옵션 불러오기
    import('../api/ledgerOrderApi').then(({ fetchLedgerOrderSelectList }) => {
      fetchLedgerOrderSelectList().then(setLedgerOrderOptions);
    });
  }, []);

  const executiveColumns: GridColDef[] = [
    {
      field: 'positionName',
      headerName: '직책',
      width: 200,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <span
          style={{
            color: '#1976d2',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
          onClick={() => handleExecutiveDetail(params.row)}
        >
          {params.value}
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
      renderCell: (params) => {
        if (params.value) {
          const date = new Date(params.value);
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
      renderCell: (params) => (
        <span style={{
          color: params.value ? '#dc3545' : '#28a745',
          fontWeight: 'bold'
        }}>
          {params.value ? '있음' : '없음'}
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
      renderCell: (params) => (
        <span style={{
          color: params.value ? '#1976d2' : '#6c757d',
          fontStyle: params.value ? 'normal' : 'italic'
        }}>
          {params.value || '해당없음'}
        </span>
      )
    }
  ];

  // 필터 변경 핸들러
  const handleLedgerOrderChange = (event: any) => {
    setLedgerOrderFilter(event.target.value);
  };

  // 임원 저장 핸들러 (등록/수정 공통)
  const handleSaveExecutive = async (data: any) => {
    try {
      if (data.id) {
        // 수정
        // TODO: 실제 API 호출로 변경
        // const response = await apiClient.put(`/executives/${data.id}`, data);
        console.log('수정할 데이터:', data);

        // 임시로 성공 처리
        const updatedRows = rows.map(row =>
          row.id === data.id ? { ...data } : row
        );
        setRows(updatedRows);
        setSuccessMessage('임원 정보가 성공적으로 수정되었습니다.');
      } else {
        // 등록
        // TODO: 실제 API 호출로 변경
        // const response = await apiClient.post('/executives', data);
        console.log('등록할 데이터:', data);

        // 임시로 성공 처리
        const newExecutive = {
          ...data,
          id: rows.length + 1 // 임시 ID 생성
        };
        setRows([...rows, newExecutive]);
        setSuccessMessage('임원 정보가 성공적으로 등록되었습니다.');
      }

      // 성공 메시지 표시
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // 다이얼로그 닫기
      if (data.id) {
        setDialogOpen(false);
      } else {
        setDialogOpen(false);
      }

    } catch (error) {
      console.error('임원 저장 오류:', error);
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
  const handleRowSelectionModelChange = (newSelection: GridRowSelectionModel) => {
    if (Array.isArray(newSelection)) {
      setSelectedIds(newSelection.map(Number));
    } else {
      setSelectedIds([]);
    }
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
      worksheet.columns.forEach(column => {
        column.width = Math.max(column.width || 0, 15);
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
    <div className="main-content">
      {/* 페이지 제목 */}
      <div className="responsibility-header">
        <h1 className="responsibility-header__title">★ [500] 임원 현황</h1>
      </div>

      {/* 노란색 구분선 */}
      <div className="responsibility-divider"></div>

      <div className="responsibility-section" style={{ marginTop: '20px' }}>
        {/* 필터 영역 */}
        <Box sx={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          alignItems: 'center',
          backgroundColor: 'var(--bank-bg-secondary)',
          border: '1px solid var(--bank-border)',
          padding: '8px 16px',
          borderRadius: '4px'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--bank-text-primary)' }}>
            원장차수
          </span>
          <FormControl size="small">
            <Select
              value={ledgerOrderFilter}
              onChange={handleLedgerOrderChange}
              sx={{
                backgroundColor: 'white',
                fontSize: '0.85rem',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--bank-border)',
                },
              }}
            >
              <MenuItem value="전체" sx={{ fontSize: '0.85rem' }}>전체</MenuItem>
              {ledgerOrderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.85rem' }}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* 버튼 영역 */}
        <Box sx={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          justifyContent: 'flex-end'
        }}>
          <Button
            variant="contained"
            onClick={handleExcelUpload}
            sx={{
              backgroundColor: 'var(--bank-success)',
              '&:hover': { backgroundColor: 'var(--bank-success-dark)' },
              fontSize: '0.85rem'
            }}
          >
            엑셀 업로드
          </Button>
          <Button
            variant="contained"
            onClick={handleExcelDownload}
            disabled={loading || rows.length === 0}
            sx={{
              backgroundColor: 'var(--bank-primary)',
              '&:hover': { backgroundColor: 'var(--bank-primary-dark)' },
              fontSize: '0.85rem'
            }}
          >
            엑셀 다운로드
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateExecutive}
            sx={{
              backgroundColor: 'var(--bank-success)',
              '&:hover': { backgroundColor: 'var(--bank-success-dark)' },
              fontSize: '0.85rem'
            }}
          >
            등록
          </Button>
        </Box>

        {/* 데이터 그리드 */}
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={executiveColumns}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            loading={loading}
            pageSizeOptions={[20, 50, 100]}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={handleRowSelectionModelChange}
            sx={{
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'var(--bank-bg-secondary)',
                fontWeight: 'bold',
                fontSize: '0.85rem',
              },
              '& .MuiDataGrid-cell': {
                fontSize: '0.85rem',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'var(--bank-bg-hover)',
              },
            }}
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
      </div>
    </div>
  );
};

export default ExecutiveStatusPage;
