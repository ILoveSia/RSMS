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
  Select,
  Typography
} from '@mui/material';
import type {
  GridColDef,
  GridEventListener,
  GridFilterModel,
  GridRowParams,
  GridRowSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { DataGrid as MuiDataGrid } from '@mui/x-data-grid';
// import { koKR } from '@mui/x-data-grid/locales';
import React, { useMemo, useState } from 'react';

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
  outline?: boolean;

  // 기능 설정
  sortable?: boolean;

  // 커스터마이징
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
    filterable: false, // 필터 기능 비활성화
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
  sortable = true,
  noDataMessage = '표시할 데이터가 없습니다.',
  rowIdField = 'id' as keyof T,
  virtualization = true,
  disableColumnMenu = true,
  disableColumnFilter = true,
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
  // 내부 상태 관리
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });

  // 기본 페이지네이션 설정
  const defaultPagination = useMemo(() => ({
    page,
    pageSize,
    pageSizeOptions: [5, 10, 20, 30],
    totalItems: data.length,
    totalPages: Math.ceil(data.length / pageSize),
    onPageChange: (newPage: number) => setPage(newPage),
    onPageSizeChange: (newPageSize: number) => {
      setPageSize(newPageSize);
      setPage(1);
    }
  }), [data.length, page, pageSize]);

  // 실제 사용할 페이지네이션 설정
  const paginationConfig = pagination || defaultPagination;

  // 페이지네이션된 데이터 계산
  const paginatedData = useMemo(() => {
    if (serverSide || pagination) return data;

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
  }, [data, page, pageSize, serverSide, pagination]);

  // 컬럼 변환
  const muiColumns = useMemo(() => convertColumnsToMuiFormat(columns), [columns]);

  // 행 데이터에 ID 추가
  const processedData = useMemo(() => {
    return paginatedData.map((row, index) => ({
      ...row,
      _gridId: row[rowIdField] ?? index,
    }));
  }, [paginatedData, rowIdField]);

  // 이벤트 핸들러
  const handleRowClick: GridEventListener<'rowClick'> = params => {
    onRowClick?.(params.row, params);
  };

  const handleRowDoubleClick: GridEventListener<'rowDoubleClick'> = params => {
    onRowDoubleClick?.(params.row, params);
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
  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    paginationConfig.onPageChange?.(newPage);
  };

  const handlePageSizeChange = (event: any) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    paginationConfig.onPageSizeChange?.(newPageSize);
  };

  // 커스텀 페이지네이션 컴포넌트
  const CustomPagination = () => {
    if (hideFooter || hideFooterPagination) return null;

    const { totalItems = 0, totalPages = 0, pageSizeOptions = [5, 10, 20, 30] } = paginationConfig;

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size='small' sx={{ minWidth: 120, '& .MuiOutlinedInput-notchedOutline': { borderWidth: '1px' } }}>
            <InputLabel>페이지 크기</InputLabel>
            <Select value={pageSize} label='페이지 크기' onChange={handlePageSizeChange}>
              {pageSizeOptions.map(size => (
                <MenuItem key={size} value={size}>
                  {size}개씩 보기
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant='body2' color='text.secondary'>
            총 {totalItems}개 항목
          </Typography>
        </Box>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color='primary'
          size='small'
        />
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: autoHeight ? 'auto' : height,
        maxHeight,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        ...sx,
      }}
      className={className}
      style={style}
      id={id}
      data-testid={dataTestId}
    >
      {error ? (
        <Alert severity='error' sx={{ m: 2 }}>
          {error}
        </Alert>
      ) : loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <MuiDataGrid
              rows={processedData}
              columns={muiColumns}
              getRowId={row => row._gridId}
              checkboxSelection={selectable}
              disableRowSelectionOnClick={disableRowSelectionOnClick}
              disableMultipleRowSelection={!multiSelect}
              rowSelectionModel={selectedRows}
              onRowClick={handleRowClick}
              onRowDoubleClick={handleRowDoubleClick}
              onRowSelectionModelChange={handleSelectionChange}
              sortModel={sortModel}
              onSortModelChange={handleSortModelChange}
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
              density={density}
              disableColumnMenu={disableColumnMenu}
              disableColumnFilter={disableColumnFilter}
              disableColumnSorting={disableColumnSort}
              hideFooter
              hideFooterPagination
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
              }}
              {...props}
            />
          </Box>
          <CustomPagination />
        </>
      )}
    </Box>
  );
};

export default DataGrid;
