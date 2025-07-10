/**
 * 공통 DataGrid 컴포넌트
 * Material-UI DataGrid를 래핑하여 프로젝트 표준 스타일과 기능을 제공합니다.
 *
 * @example
 * ```tsx
 * <DataGrid
 *   data={users}
 *   columns={userColumns}
 *   onRowClick={(row) => console.log('Row clicked:', row)}
 *   pagination={{
 *     page: 1,
 *     pageSize: 10,
 *     totalItems: 100,
 *     onPageChange: (page) => setPage(page)
 *   }}
 * />
 * ```
 */
import type { BaseComponentProps, DataGridColumn, PaginationProps } from '@/shared/types/common';
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import type {
  GridColDef,
  GridEventListener,
  GridFilterModel,
  GridRowParams,
  GridRowSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { GridToolbar, DataGrid as MuiDataGrid } from '@mui/x-data-grid';
// import { koKR } from '@mui/x-data-grid/locales';
import React from 'react';

export interface DataGridProps<T = any> extends BaseComponentProps {
  // 데이터 관련
  data: T[];
  columns: DataGridColumn<T>[];
  loading?: boolean;
  error?: string | null;

  // 선택 관련
  selectable?: boolean;
  multiSelect?: boolean;
  selectedRows?: (string | number)[];

  // 이벤트 핸들러
  onRowClick?: (row: T, event: GridRowParams) => void;
  onRowDoubleClick?: (row: T, event: GridRowParams) => void;
  onRowSelectionChange?: (selectedRows: (string | number)[], selectedData: T[]) => void;
  onSortChange?: (sortModel: GridSortModel) => void;
  onFilterChange?: (filterModel: GridFilterModel) => void;

  // 페이지네이션
  pagination?: Partial<PaginationProps>;
  serverSide?: boolean;

  // 스타일 및 레이아웃
  height?: number | string;
  maxHeight?: number | string;
  autoHeight?: boolean;
  density?: 'compact' | 'standard' | 'comfortable';

  // 기능 설정
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  exportable?: boolean;

  // 커스터마이징
  toolbar?: boolean | React.ComponentType<any>;
  noDataMessage?: string;
  rowIdField?: keyof T;

  // 가상화
  virtualization?: boolean;

  // 추가 props
  disableColumnMenu?: boolean;
  disableColumnFilter?: boolean;
  disableColumnSort?: boolean;
  disableRowSelectionOnClick?: boolean;
  hideFooter?: boolean;
  hideFooterPagination?: boolean;
}

/**
 * DataGrid 컬럼을 MUI GridColDef로 변환
 */
const convertColumnsToMuiFormat = <T,>(columns: DataGridColumn<T>[]): GridColDef[] => {
  return columns.map(col => ({
    field: String(col.field),
    headerName: col.headerName,
    width: col.width,
    minWidth: col.minWidth,
    maxWidth: col.maxWidth,
    flex: col.flex,
    sortable: col.sortable,
    filterable: col.filterable,
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
};

/**
 * 공통 DataGrid 컴포넌트
 */
const DataGrid = <T extends Record<string, any>>({
  data = [],
  columns = [],
  loading = false,
  error = null,
  selectable = false,
  multiSelect = true,
  selectedRows = [],
  onRowClick,
  onRowDoubleClick,
  onRowSelectionChange,
  onSortChange,
  onFilterChange,
  pagination,
  serverSide = false,
  height = 400,
  maxHeight,
  autoHeight = false,
  density = 'standard',
  searchable = true,
  filterable = true,
  sortable = true,
  exportable = false,
  toolbar = true,
  noDataMessage = '표시할 데이터가 없습니다.',
  rowIdField = 'id' as keyof T,
  virtualization = true,
  disableColumnMenu = false,
  disableColumnFilter = false,
  disableColumnSort = false,
  disableRowSelectionOnClick = false,
  hideFooter = false,
  hideFooterPagination = false,
  className,
  style,
  id,
  'data-testid': dataTestId,
  sx,
  ...props
}: DataGridProps<T>) => {
  // 상태 관리
  const [sortModel, setSortModel] = React.useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = React.useState<GridFilterModel>({ items: [] });
  const [currentPage, setCurrentPage] = React.useState(pagination?.page || 1);
  const [pageSize, setPageSize] = React.useState(pagination?.pageSize || 10);

  // 컬럼 변환
  const muiColumns = React.useMemo(() => convertColumnsToMuiFormat(columns), [columns]);

  // 행 데이터에 ID 추가
  const processedData = React.useMemo(() => {
    return data.map((row, index) => ({
      ...row,
      _gridId: row[rowIdField] ?? index,
    }));
  }, [data, rowIdField]);

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
    if (onRowSelectionChange) {
      const selectedData = processedData.filter(row => newSelection.includes(row._gridId));
      onRowSelectionChange(newSelection as (string | number)[], selectedData);
    }
  };

  const handleSortModelChange = (model: GridSortModel) => {
    setSortModel(model);
    onSortChange?.(model);
  };

  const handleFilterModelChange = (model: GridFilterModel) => {
    setFilterModel(model);
    onFilterChange?.(model);
  };

  // 페이지네이션 핸들러
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    pagination?.onPageChange?.(page);
  };

  const handlePageSizeChange = (event: any) => {
    const newPageSize = event.target.value;
    setPageSize(newPageSize);
    pagination?.onPageSizeChange?.(newPageSize);
  };

  // 커스텀 페이지네이션 컴포넌트
  const CustomPagination = () => {
    if (!pagination || hideFooter || hideFooterPagination) return null;

    const { totalItems = 0, totalPages = 0, pageSizeOptions = [5, 10, 25, 50] } = pagination;

    return (
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
            <Select value={pageSize} label='페이지 크기' onChange={handlePageSizeChange}>
              {pageSizeOptions.map(size => (
                <MenuItem key={size} value={size}>
                  {size}개
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant='body2' color='text.secondary'>
            전체 {totalItems}개 중 {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, totalItems)}개
          </Typography>
        </Box>

        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color='primary'
          size='small'
          showFirstButton
          showLastButton
        />
      </Box>
    );
  };

  // 에러 상태
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity='error'>{error}</Alert>
      </Box>
    );
  }

  // 로딩 상태
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: typeof height === 'number' ? height : 200,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 데이터 없음 상태
  if (!data.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: typeof height === 'number' ? height : 200,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Typography variant='body1' color='text.secondary'>
          {noDataMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Paper
      className={className}
      style={style}
      sx={{
        height: autoHeight ? 'auto' : height,
        maxHeight,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
      id={id}
      data-testid={dataTestId}
      {...props}
    >
      {/* 최상단 구분선 */}
      <Box
        sx={{
          borderTop: 1,
          borderColor: 'divider',
        }}
      />

      <MuiDataGrid
        rows={processedData}
        columns={muiColumns}
        getRowId={row => row._gridId}
        loading={loading}
        checkboxSelection={selectable}
        disableRowSelectionOnClick={disableRowSelectionOnClick || !selectable}
        rowSelection={multiSelect}
        rowSelectionModel={selectedRows}
        sortModel={sortModel}
        filterModel={filterModel}
        density={density}
        autoHeight={autoHeight}
        disableColumnMenu={disableColumnMenu}
        disableColumnFilter={disableColumnFilter}
        disableColumnSorting={disableColumnSort}
        hideFooter={hideFooter || !!pagination}
        hideFooterPagination={hideFooterPagination}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        onRowSelectionModelChange={handleSelectionChange}
        onSortModelChange={handleSortModelChange}
        onFilterModelChange={handleFilterModelChange}
        slots={{
          toolbar: toolbar === true ? GridToolbar : toolbar || undefined,
          pagination: CustomPagination,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: searchable,
          },
        }}
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

      <CustomPagination />
    </Paper>
  );
};

export default DataGrid;
