import { Download as DownloadIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import type {
  GridEventListener,
  GridRowParams,
  GridRowSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { DataGrid as MuiDataGrid } from '@mui/x-data-grid';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { BaseComponentProps, DataGridColumn } from '../../../types/common';
import { useLoading } from '../feedback/LoadingProvider';

// 서버 사이드 페이지네이션 응답 타입
export interface ServerResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// 서버 사이드 요청 파라미터 타입
export interface ServerRequest {
  page: number;
  size: number;
  sort?: string[];
  search?: string;
  filters?: Record<string, any>;
}

// API 함수 타입
export interface ServerDataGridApi<T> {
  fetchData: (params: ServerRequest) => Promise<ServerResponse<T>>;
  exportData?: (params: ServerRequest) => Promise<Blob>;
  deleteRows?: (ids: (string | number)[]) => Promise<void>;
}

export interface ServerDataGridProps<T = any> extends BaseComponentProps {
  api: ServerDataGridApi<T>;
  columns: DataGridColumn<T>[];
  initialData?: T[];
  selectable?: boolean;
  multiSelect?: boolean;
  selectedRows?: (string | number)[];
  onRowSelectionChange?: (selectedRows: (string | number)[], selectedData: T[]) => void;
  onRowClick?: (row: T, event: GridRowParams) => void;
  onRowDoubleClick?: (row: T, event: GridRowParams) => void;
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchDebounceMs?: number;
  filterable?: boolean;
  initialFilters?: Record<string, any>;
  sortable?: boolean;
  initialSort?: GridSortModel;
  height?: number | string;
  autoHeight?: boolean;
  density?: 'compact' | 'standard' | 'comfortable';
  exportable?: boolean;
  refreshable?: boolean;
  deletable?: boolean;
  toolbar?: boolean;
  noDataMessage?: string;
  rowIdField?: keyof T;
  onError?: (error: Error) => void;
  loadingMessage?: string;
  autoRefresh?: boolean;
  autoRefreshInterval?: number;
}

/**
 * 서버 사이드 DataGrid 컴포넌트
 *
 * Spring Boot API와 완전히 연동되는 DataGrid 컴포넌트
 * 서버 사이드 페이지네이션, 정렬, 필터링, 검색을 지원
 */
const ServerDataGrid = <T extends Record<string, any>>({
  api,
  columns = [],
  initialData = [],
  selectable = false,
  multiSelect = true,
  selectedRows = [],
  onRowSelectionChange,
  onRowClick,
  onRowDoubleClick,
  initialPage = 0,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50, 100],
  searchable = true,
  searchPlaceholder = '검색...',
  searchDebounceMs = 500,
  filterable = true,
  initialFilters = {},
  sortable = true,
  initialSort = [],
  height = 600,
  autoHeight = false,
  density = 'standard',
  exportable = false,
  refreshable = true,
  deletable = false,
  toolbar = true,
  noDataMessage = '표시할 데이터가 없습니다.',
  rowIdField = 'id' as keyof T,
  onError,
  loadingMessage = '데이터를 불러오는 중...',
  autoRefresh = false,
  autoRefreshInterval = 30000,
  className,
  style,
  id,
  'data-testid': dataTestId,
  sx,
  initialState,
  disableRowSelectionOnClick,
  ...restProps
}: ServerDataGridProps<T> & {
  initialState?: any;
  disableRowSelectionOnClick?: boolean;
}) => {
  // 상태 관리
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortModel, setSortModel] = useState<GridSortModel>(initialSort);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [selectedRowIds, setSelectedRowIds] = useState<(string | number)[]>(selectedRows);

  const { showLoading, hideLoading } = useLoading();

  // 컬럼 변환
  const muiColumns = useMemo(() => {
    return columns.map(col => ({
      field: String(col.field),
      headerName: col.headerName,
      width: col.width,
      minWidth: col.minWidth,
      maxWidth: col.maxWidth,
      flex: col.flex,
      sortable: col.sortable !== false && sortable,
      filterable: col.filterable !== false && filterable,
      editable: col.editable,
      align: col.align,
      headerAlign: col.headerAlign,
      renderCell: col.renderCell
        ? params =>
            col.renderCell?.({
              value: params.value,
              row: params.row,
              field: col.field,
              index: params.api.getRowIndexRelativeToVisibleRows(params.id),
            })
        : undefined,
      renderHeader: col.renderHeader
        ? params =>
            col.renderHeader?.({
              field: col.field,
              headerName: col.headerName,
              sortable: col.sortable,
            })
        : undefined,
    }));
  }, [columns, sortable, filterable]);

  // 행 데이터에 ID 추가
  const processedData = useMemo(() => {
    return data.map((row, index) => ({
      ...row,
      _gridId: row[rowIdField] ?? index,
    }));
  }, [data, rowIdField]);

  // 데이터 가져오기
  const fetchData = useCallback(
    async (showGlobalLoading = false) => {
      try {
        setLoading(true);
        setError(null);

        let loadingId: string | undefined;
        if (showGlobalLoading) {
          loadingId = showLoading(loadingMessage);
        }

        const sortParams = sortModel.map(
          sort => `${sort.field},${sort.sort === 'desc' ? 'desc' : 'asc'}`
        );

        const params: ServerRequest = {
          page,
          size: pageSize,
          sort: sortParams.length > 0 ? sortParams : undefined,
          search: searchText || undefined,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        };

        const response = await api.fetchData(params);

        setData(response.content);
        setTotalElements(response.totalElements);
        setTotalPages(response.totalPages);

        if (loadingId) {
          hideLoading(loadingId);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.';
        setError(errorMessage);
        if (onError) {
          onError(err instanceof Error ? err : new Error(errorMessage));
        }
      } finally {
        setLoading(false);
      }
    },
    [
      page,
      pageSize,
      sortModel,
      searchText,
      filters,
      api,
      showLoading,
      hideLoading,
      loadingMessage,
      onError,
    ]
  );

  // 검색 디바운스
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchText(value);

      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }

      const timer = setTimeout(() => {
        setPage(0);
      }, searchDebounceMs);

      setSearchDebounceTimer(timer);
    },
    [searchDebounceMs, searchDebounceTimer]
  );

  // 이벤트 핸들러
  const handleRowClick: GridEventListener<'rowClick'> = params => {
    if (onRowClick) {
      onRowClick(params.row, params);
    }
  };

  const handleRowDoubleClick: GridEventListener<'rowDoubleClick'> = params => {
    if (onRowDoubleClick) {
      onRowDoubleClick(params.row, params);
    }
  };

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    const ids = newSelection as (string | number)[];
    setSelectedRowIds(ids);

    if (onRowSelectionChange) {
      const selectedData = processedData.filter(row => ids.includes(row._gridId));
      onRowSelectionChange(ids, selectedData);
    }
  };

  const handleSortModelChange = (model: GridSortModel) => {
    setSortModel(model);
    setPage(0);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage - 1);
  };

  const handlePageSizeChange = (event: any) => {
    setPageSize(event.target.value);
    setPage(0);
  };

  // 새로고침
  const handleRefresh = () => {
    fetchData(true);
  };

  // 내보내기
  const handleExport = async () => {
    if (!api.exportData) return;

    try {
      const loadingId = showLoading('데이터를 내보내는 중...');

      const params: ServerRequest = {
        page: 0,
        size: totalElements,
        sort: sortModel.map(sort => `${sort.field},${sort.sort === 'desc' ? 'desc' : 'asc'}`),
        search: searchText || undefined,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      };

      const blob = await api.exportData(params);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      hideLoading(loadingId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '내보내기 중 오류가 발생했습니다.';
      setError(errorMessage);
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    }
  };

  // 선택된 행 삭제
  const handleDeleteSelected = async () => {
    if (!api.deleteRows || selectedRowIds.length === 0) return;

    if (!window.confirm(`선택된 ${selectedRowIds.length}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const loadingId = showLoading('삭제하는 중...');
      await api.deleteRows(selectedRowIds);
      setSelectedRowIds([]);
      await fetchData();
      hideLoading(loadingId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.';
      setError(errorMessage);
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, autoRefreshInterval, fetchData]);

  // 커스텀 툴바
  const CustomToolbar = () => (
    <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 }, minHeight: '64px !important' }}>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        {searchable && (
          <TextField
            size='small'
            placeholder={searchPlaceholder}
            value={searchText}
            onChange={e => handleSearchChange(e.target.value)}
            sx={{ minWidth: 200 }}
          />
        )}

        {refreshable && (
          <Tooltip title='새로고침'>
            <span>
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}

        {exportable && (
          <Tooltip title='내보내기'>
            <span>
              <IconButton onClick={handleExport} disabled={loading}>
                <DownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}

        {deletable && selectedRowIds.length > 0 && (
          <Button
            variant='outlined'
            color='error'
            size='small'
            onClick={handleDeleteSelected}
            disabled={loading}
          >
            선택 삭제 ({selectedRowIds.length})
          </Button>
        )}
      </Box>

      <Typography variant='body2' color='text.secondary'>
        총 {totalElements.toLocaleString()}개
      </Typography>
    </Toolbar>
  );

  // 커스텀 페이지네이션
  const CustomPagination = () => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size='small' sx={{ minWidth: 120 }}>
          <InputLabel>페이지 크기</InputLabel>
          <Select
            value={pageSize}
            label='페이지 크기'
            onChange={handlePageSizeChange}
            disabled={loading}
          >
            {pageSizeOptions.map(size => (
              <MenuItem key={size} value={size}>
                {size}개
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant='body2' color='text.secondary'>
          전체 {totalElements.toLocaleString()}개 중{' '}
          {totalElements > 0 ? (page * pageSize + 1).toLocaleString() : 0}-
          {Math.min((page + 1) * pageSize, totalElements).toLocaleString()}개
        </Typography>
      </Box>

      <Pagination
        count={totalPages}
        page={page + 1}
        onChange={handlePageChange}
        color='primary'
        size='small'
        showFirstButton
        showLastButton
        disabled={loading}
      />
    </Box>
  );

  // 에러 상태
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity='error'
          action={
            <Button color='inherit' size='small' onClick={handleRefresh}>
              다시 시도
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // 데이터 없음 상태
  if (!loading && data.length === 0) {
    return (
      <Paper
        className={className}
        style={style}
        sx={{
          height: autoHeight ? 'auto' : height,
          display: 'flex',
          flexDirection: 'column',
          ...sx,
        }}
        id={id}
        data-testid={dataTestId}
      >
        {/* 최상단 구분선 */}
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
          }}
        />

        {toolbar && <CustomToolbar />}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 200,
          }}
        >
          <Typography variant='body1' color='text.secondary'>
            {noDataMessage}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      className={className}
      style={style}
      sx={{
        height: autoHeight ? 'auto' : height,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
      id={id}
      data-testid={dataTestId}
    >
      {/* 최상단 구분선 */}
      <Box
        sx={{
          borderTop: 1,
          borderColor: 'divider',
        }}
      />

      {toolbar && <CustomToolbar />}

      <Box
        sx={{
          flex: 1,
          position: 'relative',
        }}
      >
        <MuiDataGrid
          rows={processedData}
          columns={muiColumns}
          getRowId={row => row._gridId}
          loading={loading}
          checkboxSelection={selectable}
          disableRowSelectionOnClick={!selectable}
          rowSelection={multiSelect}
          rowSelectionModel={selectedRowIds}
          sortModel={sortModel}
          density={density}
          autoHeight={autoHeight}
          hideFooter
          onRowClick={handleRowClick}
          onRowDoubleClick={handleRowDoubleClick}
          onRowSelectionModelChange={handleSelectionChange}
          onSortModelChange={handleSortModelChange}
          // localeText={koKR.components.MuiDataGrid.defaultProps.localeText}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              borderBottom: '1px solid rgba(224, 224, 224, 1)',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            },
            '& .MuiDataGrid-row.Mui-selected': {
              backgroundColor: 'rgba(25, 118, 210, 0.08)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.12)',
              },
            },
          }}
        />
      </Box>

      <CustomPagination />
    </Paper>
  );
};

export default ServerDataGrid;
