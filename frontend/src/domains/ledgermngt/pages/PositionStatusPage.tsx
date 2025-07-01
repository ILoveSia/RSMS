import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Select, MenuItem, FormControl } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import MainLayout from '../../../shared/components/layout/MainLayout';
import PositionDialog from '../components/PositionDialog';
import '../../../assets/scss/style.css';
import apiClient from '../../../app/common/api/client';
import type { ApiResponse } from '../../../app/types/common';
import Confirm from '@/app/components/Confirm';
import { deleteBulkPositions } from '../api/positionApi';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface IPositionStatusPageProps {
  className?: string;
}

interface PositionStatusRow {
  positionsId: number;
  positionsNm: string;
  writeDeptNm: string;
  ownerDeptNms: string;
  adminCount: number;
}

const PositionStatusPage: React.FC<IPositionStatusPageProps> = (): React.JSX.Element => {
  const [rows, setRows] = useState<PositionStatusRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterDivision, setFilterDivision] = useState<string>('전체');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<number[] | null>(null);

  const [positionDialogOpen, setPositionDialogOpen] = useState(false);
  const [positionDialogMode, setPositionDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPositionId, setSelectedPositionId] = useState<number | null>(null);

  const fetchPositionStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ApiResponse<PositionStatusRow[]>>('/positions/status-list');
      if (response && response.data) {
        setRows(response.data);
      } else {
        setRows([]);
      }
    } catch (err) {
      setError('직책 현황 데이터를 불러오는 데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPositionStatus();
  }, [fetchPositionStatus]);

  // 원장차수+진행상태 SelectBox 옵션
  const [ledgerOrderOptions, setLedgerOrderOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('');

  useEffect(() => {
    // 원장차수+진행상태 옵션 불러오기
    import('../api/ledgerOrderApi').then(({ fetchLedgerOrderSelectList }) => {
      fetchLedgerOrderSelectList().then(setLedgerOrderOptions);
    });
  }, []);

  const divisionOptions = [
    { value: 'EXEC', label: '임원' },
    { value: 'MANAGER', label: '관리자' },
    { value: 'STAFF', label: '직원' }
  ];

  const positionColumns: GridColDef[] = [
    {
      field: 'positionsNm',
      headerName: '직책명',
      width: 200,
      flex: 1,
      renderCell: (params) => (
        <span
          style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={(e) => {
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
    { field: 'ownerDeptNms', headerName: '소관부서', width: 300, flex: 2 },
    { field: 'writeDeptNm', headerName: '책무기술서 작성 부서', width: 200, flex: 2 },
    { field: 'adminCount', headerName: '관리자 수', type: 'number', width: 120, align: 'center', headerAlign: 'center' }
  ];

  const handleSearch = () => {
    fetchPositionStatus();
  };

  const handleCreateClick = () => {
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

  const handlePositionModeChange = (newMode: 'create' | 'edit' | 'view') => {
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
      await deleteBulkPositions(pendingDelete);
      setSelectedIds([]); // 선택 초기화
      fetchPositionStatus(); // 목록 새로고침
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message?: string }).message === 'string') {
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

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = () => {
    if (!rows || rows.length === 0) {
      setError('엑셀로 내보낼 데이터가 없습니다.');
      return;
    }
    // 컬럼명 매핑 (한글)
    const headerMap: Record<string, string> = {
      positionsId: '직책ID',
      positionsNm: '직책명',
      writeDeptNm: '책무기술서 작성 부서',
      ownerDeptNms: '소관부서',
      adminCount: '관리자 수',
    };
    // 데이터 변환
    const excelData = rows.map(row => ({
      [headerMap.positionsId]: row.positionsId,
      [headerMap.positionsNm]: row.positionsNm,
      [headerMap.writeDeptNm]: row.writeDeptNm,
      [headerMap.ownerDeptNms]: row.ownerDeptNms,
      [headerMap.adminCount]: row.adminCount,
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '직책 현황');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `직책_현황_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <MainLayout>
      <div className="main-content">
        <div className="responsibility-header">
          <h1 className="responsibility-header__title">★ [200] 직책 현황</h1>
        </div>
        <div className="responsibility-divider"></div>
        <div className="responsibility-section" style={{ marginTop: '20px' }}>
          <div style={{ 
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
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={selectedLedgerOrder}
                onChange={(e) => setSelectedLedgerOrder(e.target.value)}
                displayEmpty
                sx={{ backgroundColor: 'white', fontSize: '0.85rem' }}
              >
                <MenuItem value="" sx={{ fontSize: '0.85rem' }}>전체</MenuItem>
                {ledgerOrderOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.85rem' }}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            <Button 
              variant="contained"
              size="small"
              onClick={() => console.log('차수생성 버튼 클릭됨 - 로직 미구현')}
              sx={{ 
                backgroundColor: '#28a745',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#218838'
                }
              }}
            >
              차수생성
            </Button>
            <Box sx={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <Button 
                variant="contained"
                size="small"
                onClick={() => console.log('확정 버튼 클릭됨 - 로직 미구현')}
                sx={{ 
                  backgroundColor: '#28a745',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#218838'
                  }
                }}
              >
                확정
              </Button>
              <Button 
                variant="contained"
                size="small"
                onClick={() => console.log('확정취소 버튼 클릭됨 - 로직 미구현')}
                sx={{ 
                  backgroundColor: '#dc3545',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#c82333'
                  }
                }}
              >
                확정취소
              </Button>
            </Box>
          </div>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
              <Button variant="contained" color="success" size="small" onClick={handleExcelDownload} sx={{ mr: 1 }}>엑셀 다운로드</Button>
              <Button variant="contained" size="small" onClick={handleCreateClick} sx={{ mr: 1 }}>등록</Button>
              <Button variant="contained" color="error" size="small" onClick={handleDelete}>삭제</Button>
          </Box>
          <Box sx={{ height: 'calc(100vh - 400px)', width: '100%' }}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <DataGrid
              rows={rows}
              columns={positionColumns}
              loading={loading}
              getRowId={(row) => row.positionsId}
              checkboxSelection
              onRowSelectionModelChange={handleRowSelectionChange}
              rowSelectionModel={selectedIds}
              disableRowSelectionOnClick
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#b0c4de !important',
                  fontWeight: 'bold',
                },
                '& .MuiDataGrid-row': {
                  cursor: 'pointer'
                }
              }}
            />
          </Box>
        </div>
      </div>
      <PositionDialog
        open={positionDialogOpen}
        onClose={handlePositionDialogClose}
        onSave={handlePositionSave}
        mode={positionDialogMode}
        positionId={selectedPositionId}
        onChangeMode={handlePositionModeChange}
      />
      <Confirm
        open={confirmOpen}
        title="삭제 확인"
        message="정말로 선택한 직책을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleConfirmDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDelete(null); }}
      />
    </MainLayout>
  );
};

export default PositionStatusPage;
