/**
 * 책무 DB 현황 페이지 컴포넌트
 */
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import React, { useCallback, useEffect, useState } from 'react';
import '../../../assets/scss/style.css';
import { responsibilityApi, type ResponsibilityRow } from '../api/responsibilityApi';
import ResponsibilityDialog from '../components/ResponsibilityDialog';

interface IResponsibilityDbStatusPageProps {
  className?: string;
}

const ResponsibilityDbStatusPage: React.FC<
  IResponsibilityDbStatusPageProps
> = (): React.JSX.Element => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ResponsibilityRow[]>([]);
  const [selectedResponsibilityId, setSelectedResponsibilityId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('view');

  // 검색 조건 상태
  const [ledgerOrder, setLedgerOrder] = useState<string>('2024-001');
  const [searchText, setSearchText] = useState<string>('');

  // 책무 목록 조회
  const fetchResponsibilities = useCallback(async (searchId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await responsibilityApi.getStatusList(searchId);
      setRows(data);
    } catch (err) {
      setError('책무 DB 현황 데이터를 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResponsibilities();
  }, [fetchResponsibilities]);

  // 컬럼 정의
  const columns: GridColDef<ResponsibilityRow>[] = [
    {
      field: 'responsibilityId',
      headerName: '책무 ID',
      width: 100,
      sortable: false,
      align: 'center',
      cellClassName: 'wrap-text',
    },
    {
      field: 'responsibilityContent',
      headerName: '책무',
      width: 250,
      flex: 1,
      sortable: false,
      align: 'center',
      cellClassName: 'wrap-text',
      renderCell: params => (
        <span
          style={{ color: 'var(--bank-primary)', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={e => {
            e.stopPropagation();
            handleResponsibilityCellClick(params.row.responsibilityId);
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: 'responsibilityDetailId',
      headerName: '책무 세부내용 ID',
      width: 150,
      cellClassName: 'wrap-text',
    },
    {
      field: 'responsibilityDetailContent',
      headerName: '책무 세부내용',
      width: 300,
      flex: 1,
      cellClassName: 'wrap-text',
    },
    {
      field: 'responsibilityMgtSts',
      headerName: '책무이행을 위한 주요 관리업무',
      width: 300,
      flex: 2,
      cellClassName: 'wrap-text',
    },
    {
      field: 'responsibilityRelEvid',
      headerName: '관련 근거',
      width: 200,
      flex: 1,
      cellClassName: 'wrap-text',
    },
    {
      field: 'createdAt',
      headerName: '등록일자',
      width: 90,
      valueFormatter: value => dayjs(value).format('YYYY.MM.DD'),
      align: 'center',
      cellClassName: 'wrap-text',
    },
    {
      field: 'updatedAt',
      headerName: '최종수정일자',
      width: 100,
      valueFormatter: value => dayjs(value).format('YYYY.MM.DD'),
      align: 'center',
      cellClassName: 'wrap-text',
    },
  ];

  // 조회 버튼 클릭 핸들러
  const handleSearch = () => {
    fetchResponsibilities(searchText);
  };

  // 등록 버튼 클릭 핸들러
  const handleCreateClick = () => {
    setSelectedResponsibilityId(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  // '책무' 셀 클릭 시 상세조회 다이얼로그 오픈
  const handleResponsibilityCellClick = (responsibilityId: number) => {
    setSelectedResponsibilityId(responsibilityId);
    setDialogMode('view');
    setDialogOpen(true);
  };

  // selectedResponsibilityId와 dialogMode가 변경된 후 다이얼로그를 엽니다.
  useEffect(() => {
    if (dialogMode === 'view' && selectedResponsibilityId !== null) {
      setDialogOpen(true);
    }
  }, [selectedResponsibilityId, dialogMode]);

  // 다이얼로그 닫기
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedResponsibilityId(null);
  };

  // 다이얼로그 저장
  const handleDialogSave = () => {
    console.log('Saved!');
    handleDialogClose();
    fetchResponsibilities(); // 목록 새로고침
  };

  // 다이얼로그 모드 변경
  const handleModeChange = (newMode: 'create' | 'edit' | 'view') => {
    setDialogMode(newMode);
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
      const worksheet = workbook.addWorksheet('책무 DB 현황');

      // 헤더 설정
      const headers = [
        '책무 ID',
        '책무',
        '책무 세부내용 ID',
        '책무 세부내용',
        '책무이행을 위한 주요 관리업무',
        '관련 근거',
        '등록일자',
        '최종수정일자',
      ];
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
          row.responsibilityId,
          row.responsibilityContent,
          row.responsibilityDetailId,
          row.responsibilityDetailContent,
          row.responsibilityMgtSts,
          row.responsibilityRelEvid,
          dayjs(row.createdAt).format('YYYY.MM.DD'),
          dayjs(row.updatedAt).format('YYYY.MM.DD'),
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
      saveAs(blob, `책무_DB_현황_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      setError('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className='main-content'>
      <div className='responsibility-header'>
        <h1 className='responsibility-header__title'>★ [300] 책무 DB 현황</h1>
      </div>
      <div className='responsibility-divider'></div>

      <div className='responsibility-section' style={{ marginTop: '20px' }}>
        {/* 필터 영역 */}
        <Box
          sx={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            padding: '8px 16px',
            borderRadius: '4px',
          }}
        >
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>원장차수</span>
          <FormControl size='small' sx={{ minWidth: 150 }}>
            <Select
              value={ledgerOrder}
              onChange={e => setLedgerOrder(e.target.value)}
              sx={{ backgroundColor: 'white', fontSize: '0.85rem' }}
            >
              <MenuItem value='2024-001' sx={{ fontSize: '0.85rem' }}>
                2024-001(직책확정)
              </MenuItem>
            </Select>
          </FormControl>
          <span
            style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}
          >
            책무 ID
          </span>
          <TextField
            size='small'
            variant='outlined'
            placeholder='텍스트 입력'
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            sx={{ backgroundColor: 'white' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant='contained'
            size='small'
            onClick={handleSearch}
            sx={{
              backgroundColor: 'var(--bank-primary)',
              color: 'white',
              '&:hover': { backgroundColor: 'var(--bank-primary-dark)' },
            }}
          >
            조회
          </Button>
        </Box>

        {/* 버튼 영역 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          {/* <Button variant="contained" color="success" size="small" sx={{ mr: 1 }}>엑셀 업로드</Button> */}
          <Button
            variant='contained'
            size='small'
            sx={{
              mr: 1,
              backgroundColor: 'var(--bank-success)',
              '&:hover': { backgroundColor: 'var(--bank-success-dark)' },
            }}
            onClick={handleExcelDownload}
          >
            엑셀 다운로드
          </Button>
          <Button
            variant='contained'
            size='small'
            sx={{
              mr: 1,
              backgroundColor: 'var(--bank-warning)',
              '&:hover': { backgroundColor: 'var(--bank-warning-dark)' },
            }}
          >
            변경 이력
          </Button>
          <Button
            variant='contained'
            size='small'
            sx={{
              mr: 1,
              backgroundColor: 'var(--bank-primary)',
              '&:hover': { backgroundColor: 'var(--bank-primary-dark)' },
            }}
            onClick={handleCreateClick}
          >
            등록
          </Button>
          <Button
            variant='contained'
            size='small'
            sx={{
              mr: 1,
              backgroundColor: 'var(--bank-error)',
              '&:hover': { backgroundColor: 'var(--bank-error-dark)' },
            }}
          >
            삭제
          </Button>
        </Box>

        {/* 데이터 그리드 */}
        <Box sx={{ height: 600, width: '100%', display: 'flex', flexDirection: 'column' }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <DataGrid
            className='responsibility-grid'
            rows={rows}
            columns={columns}
            loading={loading}
            checkboxSelection
            disableRowSelectionOnClick
            onRowSelectionModelChange={(selectionModel: GridRowSelectionModel) => {
              if (Array.isArray(selectionModel) && selectionModel.length > 0) {
                const selectedRow = rows.find(
                  row => row.responsibilityDetailId === selectionModel[0]
                );
                setSelectedResponsibilityId(
                  selectedRow ? Number(selectedRow.responsibilityId) : null
                );
              } else {
                setSelectedResponsibilityId(null);
              }
            }}
            getRowId={row => row.responsibilityDetailId}
            sx={{
              height: '100%',
              '& .MuiDataGrid-cell.wrap-text': {
                whiteSpace: 'normal',
                lineHeight: '1.5 !important',
                wordWrap: 'break-word',
                py: 1,
              },
              '& .MuiDataGrid-columnHeader': {
                textAlign: 'center',
                justifyContent: 'center',
                alignItems: 'center',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              },
              '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                outline: 'none',
              },
            }}
            getRowHeight={() => 'auto'}
          />
        </Box>
      </div>
      <ResponsibilityDialog
        open={dialogOpen}
        mode={dialogMode}
        responsibilityId={selectedResponsibilityId}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        onChangeMode={handleModeChange}
      />
    </div>
  );
};

export default ResponsibilityDbStatusPage;
