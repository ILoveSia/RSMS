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
import type { SelectChangeEvent } from '@mui/material/Select';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../../../assets/scss/style.css';
import { responsibilityApi, type ResponsibilityRow } from '../api/responsibilityApi';
import ResponsibilityDialog from '../components/ResponsibilityDialog';

interface IResponsibilityDbStatusPageProps {
  className?: string;
}

const ResponsibilityDbStatusPage: React.FC<IResponsibilityDbStatusPageProps> = React.memo(
  (): React.JSX.Element => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [rows, setRows] = useState<ResponsibilityRow[]>([]);
    const [selectedResponsibilityId, setSelectedResponsibilityId] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('view');

    // 검색 조건 상태
    const [ledgerOrder, setLedgerOrder] = useState<string>('2024-001');
    const [searchText, setSearchText] = useState<string>('');

    // 책무 목록 조회 (성능 최적화)
    const fetchResponsibilities = useCallback(async (searchId?: string) => {
      console.log('[ResponsibilityDbStatusPage] fetchResponsibilities 호출 - searchId:', searchId);
      setLoading(true);
      setError(null);

      try {
        const data = await responsibilityApi.getStatusList(searchId);
        console.log('[ResponsibilityDbStatusPage] 책무 데이터 로드 완료:', data);
        setRows(data);
      } catch (err) {
        console.error('[ResponsibilityDbStatusPage] 책무 데이터 로드 실패:', err);
        const errorMessage = '책무 DB 현황 데이터를 불러오는 데 실패했습니다.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      console.log('[ResponsibilityDbStatusPage] 컴포넌트 마운트 - 초기 데이터 로드');
      fetchResponsibilities();
    }, [fetchResponsibilities]);

    // 컬럼 정의 (성능 최적화)
    const columns: GridColDef<ResponsibilityRow>[] = useMemo(
      () => [
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
              style={{
                color: 'var(--bank-primary)',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
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
      ],
      []
    );

    // 조회 버튼 클릭 핸들러 (성능 최적화)
    const handleSearch = useCallback(() => {
      console.log('[ResponsibilityDbStatusPage] 검색 버튼 클릭 - searchText:', searchText);
      fetchResponsibilities(searchText);
    }, [searchText, fetchResponsibilities]);

    // 등록 버튼 클릭 핸들러 (성능 최적화)
    const handleCreateClick = useCallback(() => {
      console.log('[ResponsibilityDbStatusPage] 등록 버튼 클릭');
      setSelectedResponsibilityId(null);
      setDialogMode('create');
      setDialogOpen(true);
    }, []);

    // '책무' 셀 클릭 시 상세조회 다이얼로그 오픈 (성능 최적화)
    const handleResponsibilityCellClick = useCallback((responsibilityId: number) => {
      console.log(
        '[ResponsibilityDbStatusPage] 책무 셀 클릭 - responsibilityId:',
        responsibilityId
      );
      setSelectedResponsibilityId(responsibilityId);
      setDialogMode('view');
      setDialogOpen(true);
    }, []);

    // selectedResponsibilityId와 dialogMode가 변경된 후 다이얼로그를 엽니다.
    useEffect(() => {
      if (dialogMode === 'view' && selectedResponsibilityId !== null) {
        console.log(
          '[ResponsibilityDbStatusPage] 다이얼로그 열기 - responsibilityId:',
          selectedResponsibilityId,
          'mode:',
          dialogMode
        );
        setDialogOpen(true);
      }
    }, [selectedResponsibilityId, dialogMode]);

    // 다이얼로그 닫기 (성능 최적화)
    const handleDialogClose = useCallback(() => {
      console.log('[ResponsibilityDbStatusPage] 다이얼로그 닫기');
      setDialogOpen(false);
      setSelectedResponsibilityId(null);
    }, []);

    // 다이얼로그 저장 (성능 최적화)
    const handleDialogSave = useCallback(() => {
      console.log('[ResponsibilityDbStatusPage] 다이얼로그 저장');
      handleDialogClose();
      fetchResponsibilities(); // 목록 새로고침
    }, [handleDialogClose, fetchResponsibilities]);

    // 다이얼로그 모드 변경 (성능 최적화)
    const handleModeChange = useCallback((newMode: 'create' | 'edit' | 'view') => {
      console.log('[ResponsibilityDbStatusPage] 다이얼로그 모드 변경 - newMode:', newMode);
      setDialogMode(newMode);
    }, []);

    // 엑셀 다운로드 핸들러 (성능 최적화)
    const handleExcelDownload = useCallback(async () => {
      console.log('[ResponsibilityDbStatusPage] 엑셀 다운로드 시작 - rows 개수:', rows.length);

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

        console.log('[ResponsibilityDbStatusPage] 엑셀 다운로드 완료');
      } catch (error) {
        console.error('[ResponsibilityDbStatusPage] 엑셀 다운로드 실패:', error);
        setError('엑셀 다운로드 중 오류가 발생했습니다.');
      }
    }, [rows]);

    // 행 선택 핸들러 (성능 최적화)
    const handleRowSelectionChange = useCallback(
      (selectionModel: GridRowSelectionModel) => {
        console.log('[ResponsibilityDbStatusPage] 행 선택 변경 - selectionModel:', selectionModel);

        if (Array.isArray(selectionModel) && selectionModel.length > 0) {
          const selectedRow = rows.find(row => row.responsibilityDetailId === selectionModel[0]);
          const newSelectedId = selectedRow ? Number(selectedRow.responsibilityId) : null;
          console.log('[ResponsibilityDbStatusPage] 선택된 책무 ID:', newSelectedId);
          setSelectedResponsibilityId(newSelectedId);
        } else {
          setSelectedResponsibilityId(null);
        }
      },
      [rows]
    );

    // 검색 텍스트 변경 핸들러 (성능 최적화)
    const handleSearchTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
    }, []);

    // 원장차수 변경 핸들러 (성능 최적화)
    const handleLedgerOrderChange = useCallback((e: SelectChangeEvent<string>) => {
      setLedgerOrder(e.target.value);
    }, []);

    console.log(
      '[ResponsibilityDbStatusPage] 렌더링 - rows 개수:',
      rows.length,
      'loading:',
      loading,
      'error:',
      error
    );

    return (
      <div
        className='main-content'
        style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <div className='responsibility-header'>
          <h1 className='responsibility-header__title'>★ [300] 책무 DB 현황</h1>
        </div>
        <div className='responsibility-divider'></div>

        <div
          className='responsibility-section'
          style={{ marginTop: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}
        >
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
                onChange={handleLedgerOrderChange}
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
              onChange={handleSearchTextChange}
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
          <Box
            sx={{
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 400,
            }}
          >
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <DataGrid
              className='responsibility-grid'
              rows={rows}
              columns={columns}
              loading={loading}
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={handleRowSelectionChange}
              getRowId={row => row.responsibilityDetailId}
              sx={{
                flex: 1,
                minHeight: 400,
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
  }
);

ResponsibilityDbStatusPage.displayName = 'ResponsibilityDbStatusPage';

export default ResponsibilityDbStatusPage;
