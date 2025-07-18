/**
 * 책무 검색 팝업 컴포넌트
 * 여러 화면에서 공통으로 사용할 수 있는 책무 검색 및 선택 팝업
 */
import { responsibilityApi } from '@/domains/ledgermngt/api/responsibilityApi';
import { Button } from '@/shared/components/ui/button';
import { Close as CloseIcon } from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import React, { useCallback, useEffect, useState } from 'react';

// 책무 타입 정의 (검색 결과용)
export interface ResponsibilitySearchResult {
  responsibilityId: number;
  responsibilityContent: string;
}

// 팝업 Props 타입
export interface ResponsibilitySearchPopupProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  onSelect: (responsibility: ResponsibilitySearchResult) => void;
}

const ResponsibilitySearchPopup: React.FC<ResponsibilitySearchPopupProps> = ({
  open,
  title = '책무 검색',
  onClose,
  onSelect,
}) => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [responsibilities, setResponsibilities] = useState<ResponsibilitySearchResult[]>([]);
  const [filteredResponsibilities, setFilteredResponsibilities] = useState<
    ResponsibilitySearchResult[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 컬럼 정의
  const columns: GridColDef[] = [
    {
      field: 'responsibilityId',
      headerName: '책무ID',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => (
        <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'responsibilityContent',
      headerName: '책무내용',
      width: 400,
      flex: 1,
      renderCell: params => (
        <Typography variant='body2' sx={{ lineHeight: 1.4 }}>
          {params.value}
        </Typography>
      ),
    },
  ];

  // 책무 목록 조회
  const fetchResponsibilities = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiResponsibilities = await responsibilityApi.getStatusList();
      const convertedResponsibilities: ResponsibilitySearchResult[] = apiResponsibilities.map(
        resp => ({
          responsibilityId: resp.responsibilityId,
          responsibilityContent: resp.responsibilityContent,
        })
      );
      // 중복된 responsibility_id 제거
      const uniqueResponsibilities = Array.from(
        new Set(convertedResponsibilities.map(item => item.responsibilityId))
      ).map(id =>
        convertedResponsibilities.find(item => item.responsibilityId === id)
      ).filter(Boolean);
      const answer = uniqueResponsibilities as ResponsibilitySearchResult[];
      console.log('answer: ', answer);
      setResponsibilities(answer);
      setFilteredResponsibilities(answer);
    } catch (err) {
      console.error('책무 목록 조회 실패:', err);
      setError('책무 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 기능
  const handleSearch = useCallback(() => {
    if (!searchKeyword.trim()) {
      setFilteredResponsibilities(responsibilities);
      return;
    }

    const filtered = responsibilities.filter(
      resp =>
        resp.responsibilityId.toString().includes(searchKeyword) ||
        resp.responsibilityContent.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    setFilteredResponsibilities(filtered);
  }, [searchKeyword, responsibilities]);

  // 검색어 변경 시 자동 검색
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [handleSearch]);

  // 컴포넌트 마운트 시 책무 목록 조회
  useEffect(() => {
    if (open) {
      fetchResponsibilities();
      setSelectedRows([]);
      setSearchKeyword('');
    }
  }, [open]);

  // 행 더블클릭 핸들러
  const handleRowDoubleClick = (params: GridRowParams) => {
    const rowId = params.id.toString();
    const idParts = rowId.split('_');
    const responsibilityId = parseInt(idParts[0], 10);

    const selectedResp = filteredResponsibilities.find(
      resp => resp.responsibilityId === responsibilityId
    );
    if (selectedResp) {
      onSelect(selectedResp);
      onClose();
    }
  };

  // 선택 완료 핸들러
  const handleSelectComplete = () => {
    if (selectedRows.length > 0) {
      const rowId = selectedRows[0];
      const idParts = rowId.split('_');
      const responsibilityId = parseInt(idParts[0], 10);

      const selectedResp = filteredResponsibilities.find(
        resp => resp.responsibilityId === responsibilityId
      );
      if (selectedResp) {
        onSelect(selectedResp);
      }
    }
    onClose();
  };
  // 각 행에 고유 ID 생성
  const getRowsWithUniqueIds = () => {
    return filteredResponsibilities.map((resp, index) => ({
      ...resp,
      id: `${resp.responsibilityId}_${index}`,
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      aria-labelledby='responsibility-search-dialog-title'
    >
      <DialogTitle id='responsibility-search-dialog-title'>
        <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', height: 500 }}>
          {/* 검색 영역 */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth
              size='small'
              placeholder='책무ID, 책무내용으로 검색'
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <Button onClick={handleSearch} variant='contained' color='secondary' size='medium'>
              검색
            </Button>
          </Box>

          {/* 안내 메시지 */}
          <Box sx={{ mb: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              행을 더블클릭하거나 선택 후 "선택" 버튼을 클릭하세요.
            </Typography>
          </Box>

          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* 로딩 상태 */}
          {loading ? (
            <Box
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}
            >
              <CircularProgress />
            </Box>
          ) : (
            /* 책무 목록 DataGrid */
            <Box sx={{ height: 350 }}>
              <DataGrid
                rows={getRowsWithUniqueIds()}
                columns={columns}
                checkboxSelection={false}
                disableRowSelectionOnClick={false}
                rowSelectionModel={selectedRows}
                onRowSelectionModelChange={newSelection => {
                  setSelectedRows(Array.from(newSelection) as string[]);
                }}
                onRowDoubleClick={handleRowDoubleClick}
                getRowHeight={() => 45}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  '& .MuiDataGrid-cell': {
                    fontSize: '0.875rem',
                    borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f5f5f5',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  },
                  '& .MuiDataGrid-row': {
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: '#f0f7ff',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#e3f2fd',
                      '&:hover': {
                        backgroundColor: '#bbdefb',
                      },
                    },
                  },
                }}
              />
            </Box>
          )}

          {/* 결과 개수 */}
          <Box sx={{ mt: 1, textAlign: 'right' }}>
            <Typography variant='caption' color='text.secondary'>
              총 {filteredResponsibilities.length}건
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleSelectComplete}
          variant='contained'
          color='primary'
          disabled={selectedRows.length === 0}
        >
          선택
        </Button>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResponsibilitySearchPopup;
