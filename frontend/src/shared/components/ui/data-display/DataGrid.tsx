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
  checkboxSelection?: boolean;
  rowSelectionModel?: GridRowSelectionModel;

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
    headerAlign: col.headerAlign || 'center', // 기본값을 중앙정렬로 설정
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
 * 페이지네이션 설정 생성
 */
const createPaginationConfig = (
  data: any[],
  page: number,
  pageSize: number,
  pagination?: Partial<PaginationProps>
) => {
  const defaultPagination = {
    page,
    pageSize,
    pageSizeOptions: [5, 10, 20, 30],
    totalItems: data.length,
    totalPages: Math.ceil(data.length / pageSize),
    onPageChange: () => {},
    onPageSizeChange: () => {}
  };

  return pagination || defaultPagination;
};

/**
 * 페이지네이션된 데이터 계산
 */
const calculatePaginatedData = (
  data: any[],
  page: number,
  pageSize: number,
  serverSide: boolean,
  pagination?: Partial<PaginationProps>
) => {
  if (serverSide || pagination) return data;

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return data.slice(start, end);
};

/**
 * 행 데이터에 ID 추가
 */
const processRowData = <T,>(data: T[], rowIdField: keyof T) => {
  return data.map((row, index) => ({
    ...row,
    _gridId: row[rowIdField] ?? index,
  }));
};

/**
 * 커스텀 페이지네이션 컴포넌트
 */
const CustomPagination = ({
  paginationConfig,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  hideFooter,
  hideFooterPagination
}: {
  paginationConfig: any;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  hideFooter?: boolean;
  hideFooterPagination?: boolean;
}) => {
  if (hideFooter || hideFooterPagination) return null;

  const { totalItems = 0, totalPages = 0, pageSizeOptions = [5, 10, 20, 30] } = paginationConfig;

  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    onPageChange(newPage);
  };

  const handlePageSizeChange = (event: any) => {
    const newPageSize = Number(event.target.value);
    onPageSizeChange(newPageSize);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 3,
        backgroundColor: 'rgba(248, 249, 250, 0.95)',
        borderTop: '1px solid rgba(82, 122, 138, 0.2)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <FormControl 
          size='small' 
          sx={{ 
            minWidth: 140, 
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '& fieldset': {
                borderColor: 'rgba(82, 122, 138, 0.3)',
                borderWidth: '1px',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(82, 122, 138, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#527a8a',
                borderWidth: '2px',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(45, 67, 73, 0.7)',
              fontSize: '0.875rem',
              '&.Mui-focused': {
                color: '#527a8a',
              },
            },
          }}
        >
          <InputLabel>페이지 크기</InputLabel>
          <Select 
            value={pageSize} 
            label='페이지 크기' 
            onChange={handlePageSizeChange}
            sx={{
              fontSize: '0.875rem',
              '& .MuiSelect-select': {
                fontSize: '0.875rem',
                color: '#2d4349',
              },
            }}
          >
            {pageSizeOptions.map((size: number) => (
              <MenuItem 
                key={size} 
                value={size}
                sx={{
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: 'rgba(82, 122, 138, 0.08)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(82, 122, 138, 0.15)',
                    '&:hover': {
                      backgroundColor: 'rgba(82, 122, 138, 0.2)',
                    },
                  },
                }}
              >
                {size}개씩 보기
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            backgroundColor: 'rgba(82, 122, 138, 0.08)',
            borderRadius: '8px',
            border: '1px solid rgba(82, 122, 138, 0.15)',
          }}
        >
          <Typography variant='body2' sx={{ color: '#2d4349', fontWeight: 500, fontSize: '0.875rem' }}>
            총 <span style={{ fontWeight: 700, color: '#527a8a' }}>{totalItems}</span>개 항목
          </Typography>
        </Box>
      </Box>
      <Pagination
        count={totalPages}
        page={page}
        onChange={handlePageChange}
        color='primary'
        size='small'
        sx={{
          '& .MuiPaginationItem-root': {
            borderRadius: '8px',
            border: '1px solid rgba(82, 122, 138, 0.2)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            color: '#2d4349',
            fontWeight: 500,
            fontSize: '0.875rem',
            margin: '0 2px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'rgba(82, 122, 138, 0.08)',
              borderColor: 'rgba(82, 122, 138, 0.4)',
            },
            '&.Mui-selected': {
              backgroundColor: '#527a8a',
              color: 'white',
              borderColor: '#527a8a',
              fontWeight: 700,
              '&:hover': {
                backgroundColor: '#3e5b66',
                borderColor: '#3e5b66',
              },
            },
            '&.MuiPaginationItem-ellipsis': {
              border: 'none',
              backgroundColor: 'transparent',
            },
          },
          '& .MuiPaginationItem-previousNext': {
            fontWeight: 600,
          },
        }}
      />
    </Box>
  );
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
  checkboxSelection = false,
  rowSelectionModel,
  onRowClick,
  onRowDoubleClick,
  onRowSelectionChange,
  onSortChange,
  onFilterChange,
  pagination,
  serverSide = false,
  height = 800,
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

  // 페이지네이션 설정
  const paginationConfig = useMemo(() => 
    createPaginationConfig(data, page, pageSize, pagination), 
    [data.length, page, pageSize, pagination]
  );

  // 페이지네이션된 데이터 계산
  const paginatedData = useMemo(() => 
    calculatePaginatedData(data, page, pageSize, serverSide, pagination), 
    [data, page, pageSize, serverSide, pagination]
  );

  // 컬럼 변환
  const muiColumns = useMemo(() => convertColumnsToMuiFormat(columns), [columns]);

  // 행 데이터에 ID 추가
  const processedData = useMemo(() => 
    processRowData(paginatedData, rowIdField), 
    [paginatedData, rowIdField]
  );

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
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    paginationConfig.onPageChange?.(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    paginationConfig.onPageSizeChange?.(newPageSize);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: autoHeight ? 'auto' : height,
        maxHeight,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.12)',
        overflow: 'hidden',
        ...sx,
      }}
      className={className}
      style={style}
      id={id}
      data-testid={dataTestId}
    >
      {error ? (
        <Alert 
          severity='error' 
          sx={{ 
            m: 3,
            borderRadius: '12px',
            border: '1px solid rgba(244, 67, 54, 0.2)',
            backgroundColor: 'rgba(255, 235, 238, 0.8)',
            backdropFilter: 'blur(10px)',
            '& .MuiAlert-icon': {
              color: '#d32f2f',
            },
            '& .MuiAlert-message': {
              fontSize: '0.875rem',
              color: '#d32f2f',
              fontWeight: 500,
            },
          }}
        >
          {error}
        </Alert>
      ) : loading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            gap: 2,
          }}
        >
          <CircularProgress 
            size={48}
            thickness={3}
            sx={{
              color: '#527a8a',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <Typography 
            variant='body2' 
            sx={{ 
              color: 'rgba(45, 67, 73, 0.7)',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            데이터를 불러오는 중...
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <MuiDataGrid
              rows={processedData}
              columns={muiColumns}
              getRowId={row => row._gridId}
              checkboxSelection={checkboxSelection || selectable}
              disableRowSelectionOnClick={disableRowSelectionOnClick}
              rowSelectionModel={rowSelectionModel || selectedRows}
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
                backgroundColor: 'transparent',
                '& .MuiDataGrid-root': {
                  fontSize: '0.875rem',
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: 'rgba(82, 122, 138, 0.08)',
                  borderBottom: '1px solid rgba(82, 122, 138, 0.2)',
                  minHeight: '52px !important',
                  '& .MuiDataGrid-columnHeader': {
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: '#2d4349',
                    '&:focus': {
                      outline: 'none',
                    },
                    '&:focus-within': {
                      outline: 'none',
                    },
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  },
                  '& .MuiDataGrid-iconSeparator': {
                    color: 'rgba(82, 122, 138, 0.3)',
                  },
                  '& .MuiDataGrid-sortIcon': {
                    color: '#527a8a',
                  },
                },
                '& .MuiDataGrid-row': {
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:nth-of-type(even)': {
                    backgroundColor: 'rgba(248, 249, 250, 0.5)',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(82, 122, 138, 0.08) !important',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(82, 122, 138, 0.15) !important',
                    '&:hover': {
                      backgroundColor: 'rgba(82, 122, 138, 0.2) !important',
                    },
                  },
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: 'none',
                  fontSize: '0.875rem',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  '&:focus': {
                    outline: 'none',
                  },
                  '&:focus-within': {
                    outline: 'none',
                  },
                },
                '& .MuiDataGrid-cellContent': {
                  fontSize: '0.875rem',
                },
                '& .MuiDataGrid-columnSeparator': {
                  visibility: 'hidden',
                },
                '& .MuiCheckbox-root': {
                  color: '#527a8a',
                  '&.Mui-checked': {
                    color: '#527a8a',
                  },
                },
                '& .MuiDataGrid-footerContainer': {
                  borderTop: '1px solid rgba(82, 122, 138, 0.2)',
                  backgroundColor: 'rgba(248, 249, 250, 0.8)',
                  minHeight: '60px',
                },
                '& .MuiDataGrid-virtualScrollerContent .MuiDataGrid-row:last-child .MuiDataGrid-cell': {
                  borderBottom: 'none',
                },
              }}
              {...props}
            />
          </Box>
          <CustomPagination
            paginationConfig={paginationConfig}
            page={page}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            hideFooter={hideFooter}
            hideFooterPagination={hideFooterPagination}
          />
        </>
      )}
    </Box>
  );
};

export default DataGrid;
