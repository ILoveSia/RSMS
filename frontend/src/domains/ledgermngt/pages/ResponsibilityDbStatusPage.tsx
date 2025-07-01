/**
 * 책무 DB 현황 페이지 컴포넌트
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Select, MenuItem, FormControl, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import MainLayout from '../../../shared/components/layout/MainLayout';
import ResponsibilityDialog from '../components/ResponsibilityDialog';
import '../../../assets/scss/style.css';
import apiClient from '../../../app/common/api/client';
import type { ApiResponse } from '../../../app/types/common';
import dayjs from 'dayjs';

interface IResponsibilityDbStatusPageProps {
  className?: string;
}

// 백엔드 DTO와 일치하는 타입 정의 (ResponsibilityStatusDto)
interface ResponsibilityRow {
  responsibilityId: number;
  responsibilityContent: string;
  responsibilityDetailId: number;
  responsibilityDetailContent: string;
  responsibilityMgtSts: string;
  responsibilityRelEvid: string;
  createdAt: string;
  updatedAt: string;
}

const ResponsibilityDbStatusPage: React.FC<IResponsibilityDbStatusPageProps> = (): React.JSX.Element => {
  const [rows, setRows] = useState<ResponsibilityRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [ledgerOrder, setLedgerOrder] = useState<string>('2024-001');
  const [searchText, setSearchText] = useState('');

  // 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedResponsibilityId, setSelectedResponsibilityId] = useState<number | null>(null);

  // 데이터 로드 함수
  const fetchResponsibilities = useCallback(async (searchId?: string) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (searchId) {
      params.append('responsibilityId', searchId);
    }
    
    try {
      const response = await apiClient.get<ApiResponse<ResponsibilityRow[]>>(`/api/responsibilities/status?${params.toString()}`);
      if (response && response.data) {
        setRows(response.data);
      } else {
        setRows([]);
      }
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
      cellClassName: 'wrap-text' 
    },
    {
      field: 'responsibilityContent',
      headerName: '책무',
      width: 250,
      flex: 1,
      sortable: false,
      align: 'center',
      cellClassName: 'wrap-text' ,
      renderCell: (params) => (
        <span
          style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            handleResponsibilityCellClick(params.row.responsibilityId);
          }}
        >
          {params.value}
        </span>
      ),
    },
    { field: 'responsibilityDetailId', headerName: '책무 세부내용 ID', width: 150, cellClassName: 'wrap-text'  },
    { field: 'responsibilityDetailContent', headerName: '책무 세부내용', width: 300, flex: 1 , cellClassName: 'wrap-text' },
    { field: 'responsibilityMgtSts', headerName: '책무이행을 위한 주요 관리업무', width: 300, flex: 2, cellClassName: 'wrap-text' },
    { field: 'responsibilityRelEvid', headerName: '관련 근거', width: 200, flex: 1, cellClassName: 'wrap-text' },
    { 
      field: 'createdAt', 
      headerName: '등록일자', 
      width: 90,
      valueFormatter: (value) => dayjs(value).format('YYYY.MM.DD'),
      align: 'center',
      cellClassName: 'wrap-text' 
    },
    { 
      field: 'updatedAt', 
      headerName: '최종수정일자', 
      width: 100,
      valueFormatter: (value) => dayjs(value).format('YYYY.MM.DD'),
      align: 'center',
      cellClassName: 'wrap-text' 
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

  // 수정 버튼 클릭 핸들러
  const handleEditClick = () => {
    if (selectedResponsibilityId) {
      setDialogMode('edit');
      setDialogOpen(true);
    } else {
      alert('수정할 항목을 선택해주세요.');
    }
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

  return (
    <MainLayout>
      <div className="main-content">
        <div className="responsibility-header">
          <h1 className="responsibility-header__title">★ [300] 책무 DB 현황</h1>
        </div>
        <div className="responsibility-divider"></div>

        <div className="responsibility-section" style={{ marginTop: '20px' }}>
          {/* 필터 영역 */}
          <Box sx={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '16px', 
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            padding: '8px 16px',
            borderRadius: '4px'
          }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>
              원장차수
            </span>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={ledgerOrder}
                onChange={(e) => setLedgerOrder(e.target.value)}
                sx={{ backgroundColor: 'white', fontSize: '0.85rem' }}
              >
                <MenuItem value="2024-001" sx={{ fontSize: '0.85rem' }}>2024-001(직책확정)</MenuItem>
              </Select>
            </FormControl>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>
              책무 ID
            </span>
            <TextField 
              size="small"
              variant="outlined"
              placeholder="텍스트 입력"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              sx={{ backgroundColor: 'white' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ flexGrow: 1 }} />
            <Button 
              variant="contained"
              size="small"
              onClick={handleSearch}
              sx={{ 
                backgroundColor: '#333',
                color: 'white',
                '&:hover': { backgroundColor: '#555' }
              }}
            >
              조회
            </Button>
          </Box>
          
          {/* 버튼 영역 */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
              {/* <Button variant="contained" color="success" size="small" sx={{ mr: 1 }}>엑셀 업로드</Button> */}
              <Button variant="contained" color="success" size="small" sx={{ mr: 1 }}>엑셀 다운로드</Button>
              <Button variant="contained" color="warning" size="small" sx={{ mr: 1 }}>변경 이력</Button>
              <Button variant="contained" size="small" sx={{ mr: 1 }} onClick={handleCreateClick}>등록</Button>
              <Button variant="contained" color="error" size="small" sx={{ mr: 1 }}>삭제</Button>
          </Box>

          {/* 데이터 그리드 */}
          <Box sx={{ height: 'calc(100vh - 400px)', width: '100%' }}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <DataGrid
              className="responsibility-grid"
              rows={rows}
              columns={columns}
              loading={loading}
              checkboxSelection
              disableRowSelectionOnClick
              onRowSelectionModelChange={(selectionModel: GridRowSelectionModel) => {
                if (Array.isArray(selectionModel) && selectionModel.length > 0) {
                  const selectedRow = rows.find(row => row.responsibilityDetailId === selectionModel[0]);
                  setSelectedResponsibilityId(selectedRow ? Number(selectedRow.responsibilityId) : null);
                } else {
                  setSelectedResponsibilityId(null);
                }
              }}
              getRowId={(row) => row.responsibilityDetailId}
              sx={{
                '& .MuiDataGrid-cell.wrap-text': {
                  whiteSpace: 'normal',
                  lineHeight: '1.5 !important',
                  wordWrap: 'break-word',
                  py: 1
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
    </MainLayout>
  );
}

export default ResponsibilityDbStatusPage; 