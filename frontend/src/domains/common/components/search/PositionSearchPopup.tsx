/**
 * 직책 검색 팝업 컴포넌트
 * 여러 화면에서 공통으로 사용할 수 있는 직책 검색 및 선택 팝업
 */
import { positionApi } from '@/domains/ledgermngt/api/positionApi';
import { Button } from '@/shared/components/ui/button';
import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import type { GridRowParams } from '@mui/x-data-grid';
import type { DataGridColumn } from '@/shared/types/common';
import { DataGrid } from '@/shared/components/ui/data-display';
import { SearchBox } from '@/shared/components/ui/form';
import React, { useCallback, useEffect, useState } from 'react';
import { useGetDepartmentName } from '@/shared/utils/codeUtils';

// 직책 타입 정의 (검색 결과용)
export interface PositionSearchResult {
  positionsId: number;
  positionsNm: string;
  ledgerOrders: number;
  confirmGubunCd?: string;
  writeDeptCd?: string;
}

// 팝업 Props 타입
export interface PositionSearchPopupProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  onSelect: (position: PositionSearchResult) => void;
  multiSelect?: boolean;
  ledgerOrders?: number; // 특정 원장차수로 필터링
}

const PositionSearchPopup: React.FC<PositionSearchPopupProps> = ({
  open,
  title = '직책 검색',
  onClose,
  onSelect,
  multiSelect = false,
  ledgerOrders,
}) => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [positions, setPositions] = useState<PositionSearchResult[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<PositionSearchResult[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<PositionSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const getDepartmentName = useGetDepartmentName();

  // DataGrid 컬럼 정의
  const columns: DataGridColumn<PositionSearchResult>[] = [
    {
      field: 'positionsId',
      headerName: '직책ID',
      align: 'center',
      width: 100,
      sortable: true,
    },
    {
      field: 'positionsNm',
      headerName: '직책명',
      width: 200,
      align: 'center',
      sortable: true,
      flex: 1,
    },
    {
      field: 'ledgerOrders',
      headerName: '원장차수',
      width: 120,
      sortable: true,
    },
    {
      field: 'confirmGubunCd',
      headerName: '확정구분',
      align: 'center',
      width: 100,
      sortable: true,
    },
    {
      field: 'writeDeptCd',
      headerName: '작성부서',
      width: 100,
      align: 'center',
      sortable: true,
      valueFormatter: ({ value }: { value: string }) => getDepartmentName(value),
    },
  ];

  // 직책 목록 로드
  const loadPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await positionApi.getPositionList(ledgerOrders);
      setPositions(data);
      setFilteredPositions(data);
    } catch (err) {
      console.error('직책 목록 로드 실패:', err);
      setError('직책 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [ledgerOrders]);

  // 검색 필터링
  const handleSearch = useCallback(() => {
    if (!searchKeyword.trim()) {
      setFilteredPositions(positions);
      return;
    }

    const filtered = positions.filter(position =>
      position.positionsNm.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      position.positionsId.toString().includes(searchKeyword) ||
      position.ledgerOrders?.toString().toLowerCase().includes(searchKeyword.toLowerCase())
    );
    setFilteredPositions(filtered);
  }, [searchKeyword, positions]);

  // 검색어 변경시 자동 검색
  useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  // 팝업 열릴 때 데이터 로드
  useEffect(() => {
    if (open) {
      loadPositions();
      setSearchKeyword('');
      setSelectedPositions([]);
    }
  }, [open, loadPositions]);

  // 행 클릭 핸들러 (단일 선택)
  const handleRowClick = (params: GridRowParams) => {
    if (!multiSelect) {
      onSelect(params.row as PositionSearchResult);
      onClose();
    }
  };

  // 행 선택 핸들러 (다중 선택)
  const handleRowSelectionModelChange = (newSelection: readonly any[]) => {
    if (multiSelect) {
      const selectedRows = newSelection.map(id =>
        filteredPositions.find(position => position.positionsId === id)
      ).filter(Boolean) as PositionSearchResult[];
      setSelectedPositions(selectedRows);
    }
  };

  // 선택 확인 핸들러 (다중 선택시)
  const handleConfirmSelection = () => {
    if (multiSelect && selectedPositions.length > 0) {
      onSelect(selectedPositions[0]); // 첫 번째 선택만 반환 (기존 인터페이스 호환)
      onClose();
    }
  };

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
        <Box sx={{ display: 'flex', gap: 1 }}>
          {multiSelect && (
            <Button
              variant='contained'
              onClick={handleConfirmSelection}
              disabled={selectedPositions.length === 0}
            >
              선택 확인
            </Button>
          )}
          <Button variant='outlined' onClick={onClose}>
            닫기
          </Button>
        </Box>
      }
      contentSx={{ p: 0 }}
    >
      {/* 검색 영역 */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 2 }}>
          <SearchBox
            placeholder='직책명, ID 또는 원장차수로 검색'
            value={searchKeyword}
            onSearch={(q) => setSearchKeyword(q)}
            onClear={() => setSearchKeyword('')}
          />
        </Box>

        {/* 결과 영역 */}
        <Box sx={{ height: 400, width: '100%' }}>
          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              data={filteredPositions}
              selectable={true}
              columns={columns}
              rowIdField={'positionsId'}
              onRowClick={(row) => handleRowClick({ row } as any)}
              onRowSelectionChange={(ids) => handleRowSelectionModelChange(ids as any)}
              checkboxSelection={multiSelect}
              disableRowSelectionOnClick={multiSelect}
              pagination={{ page: 1, pageSize: 10, totalItems: filteredPositions.length, onPageChange: () => {}, onPageSizeChange: () => {} }}
              sx={{}}
            />
          )}
        </Box>
      </Box>
    </BaseDialog>
  );
};

export default PositionSearchPopup;