/**
 * 책무 검색 팝업 컴포넌트
 * 여러 화면에서 공통으로 사용할 수 있는 책무 검색 및 선택 팝업
 */
import { responsibilityApi } from '@/domains/ledgermngt/api/responsibilityApi';
import { Button } from '@/shared/components/ui/button';
import SearchIcon from '@mui/icons-material/Search';
import { Alert, Box, CircularProgress, InputAdornment, Typography } from '@mui/material';
import { TextField, DataGrid } from '@/shared/components/ui/data-display';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import type { GridRowParams } from '@mui/x-data-grid';
import type { DataGridColumn } from '@/shared/types/common';
import React, { useCallback, useEffect, useState } from 'react';

// 책무 타입 정의 (검색 결과용)
export interface ResponsibilitySearchResult {
  responsibilityId: number;
  responsibilityContent: string;
  responsibility_detail_content: string;
  responsibility_mgt_sts: string;
  responsibility_rel_evid: string;
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
  const columns: DataGridColumn<ResponsibilitySearchResult>[] = [
    {
      field: 'responsibilityId',
      headerName: '책무ID',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: params => (
        <Typography variant='body2' sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
          {params.value as number}
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
          {String(params.value ?? '')}
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
          responsibility_detail_content: resp.responsibilityDetailContent,
          responsibility_mgt_sts: resp.responsibilityMgtSts,
          responsibility_rel_evid: resp.responsibilityRelEvid,
        })
      );
      // 중복된 responsibility_id 제거
      const uniqueResponsibilities = Array.from(
        new Set(convertedResponsibilities.map(item => item.responsibilityId))
      ).map(id =>
        convertedResponsibilities.find(item => item.responsibilityId === id)
      ).filter(Boolean);
      const answer = uniqueResponsibilities as ResponsibilitySearchResult[];
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

  // 행 클릭 핸들러 (단일 선택)
  const handleRowClick = (params: GridRowParams) => {
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
  // 행 ID는 responsibilityId가 고유(중복 제거 후)

  return (
    <BaseDialog
      open={open}
      mode='view'
      title={title}
      maxWidth='md'
      fullWidth
      hideDefaultActions
      onClose={onClose}
      customActions={
        <>
          <Button
            onClick={handleSelectComplete}
            variant='contained'
            color='primary'
            disabled={selectedRows.length === 0}
          >
            선택
          </Button>
          <Button onClick={onClose}>취소</Button>
        </>
      }
      contentSx={{ p: 0 }}
    >
      <Box sx={{ width: '100%', height: 500, p: 3 }}>
        {/* 검색 영역 */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            label=''
            mode='editable'
            fullWidth
            size='small'
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
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
            행을 클릭하거나 선택 후 "선택" 버튼을 클릭하세요.
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
              data={filteredResponsibilities}
              columns={columns}
              rowIdField={'responsibilityId'}
              checkboxSelection={false}
              disableRowSelectionOnClick={false}
              onRowClick={(_, params) => handleRowClick(params)}
              onRowDoubleClick={(_, params) => handleRowDoubleClick(params)}
              onRowSelectionChange={(ids) => setSelectedRows(ids.map(String))}
              pagination={{ page: 1, pageSize: 10, totalItems: filteredResponsibilities.length, onPageChange: () => {}, onPageSizeChange: () => {} }}
            />
          </Box>
        )}
      </Box>
    </BaseDialog>
  );
};

export default ResponsibilitySearchPopup;
