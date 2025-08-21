/**
 * DeptStatusPage 전용 DataGridV2 컴포넌트
 * 헤더와 데이터 열 너비 정렬 문제 해결 - 복잡한 헤더 구조 지원
 */
import type { DataGridColumn } from '@/shared/types/common';
import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Alert
} from '@mui/material';
import React, { useState, useMemo } from 'react';

export interface DataGridV2Props<T = any> {
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
  onRowClick?: (row: T) => void;
  onRowSelectionChange?: (selectedRows: (string | number)[], selectedData: T[]) => void;

  // 스타일 및 레이아웃
  height?: number | string;
  maxHeight?: number | string;

  // 커스터마이징
  noDataMessage?: string;
  rowIdField?: keyof T;

  // DeptStatusPage 전용 설정
  showComplexHeaders?: boolean;

  // 스타일링
  sx?: any;
}

/**
 * DeptStatusPage 전용 DataGridV2 컴포넌트
 */
const DataGridV2 = <T extends Record<string, any>>({
  data = [],
  columns = [],
  loading = false,
  error = null,
  selectable = false,
  multiSelect = true,
  selectedRows = [],
  onRowClick,
  onRowSelectionChange,
  height = 500,
  maxHeight,
  noDataMessage = '표시할 데이터가 없습니다.',
  rowIdField = 'id' as keyof T,
  showComplexHeaders = true,
  sx,
}: DataGridV2Props<T>) => {
  // 내부 상태 관리
  const [internalSelectedRows, setInternalSelectedRows] = useState<(string | number)[]>(selectedRows);

  // 행 데이터에 ID 추가
  const processedData = useMemo(() => {
    return data.map((row, index) => ({
      ...row,
      _gridId: row[rowIdField] ?? index,
    }));
  }, [data, rowIdField]);

  // 선택 상태 업데이트
  React.useEffect(() => {
    setInternalSelectedRows(selectedRows);
  }, [selectedRows]);

  // 체크박스 변경 처리
  const handleRowSelectionChange = (rowId: string | number, checked: boolean) => {
    let newSelection: (string | number)[];
    
    if (multiSelect) {
      if (checked) {
        newSelection = [...internalSelectedRows, rowId];
      } else {
        newSelection = internalSelectedRows.filter(id => id !== rowId);
      }
    } else {
      newSelection = checked ? [rowId] : [];
    }

    setInternalSelectedRows(newSelection);
    
    // 선택된 데이터 찾기
    const selectedData = processedData.filter(row => newSelection.includes(row._gridId));
    onRowSelectionChange?.(newSelection, selectedData);
  };

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    const newSelection = checked ? processedData.map(row => row._gridId) : [];
    setInternalSelectedRows(newSelection);
    
    const selectedData = checked ? processedData : [];
    onRowSelectionChange?.(newSelection, selectedData);
  };

  // 행 클릭 처리
  const handleRowClick = (row: T) => {
    onRowClick?.(row);
  };

  // 전체 선택 상태 확인
  const isAllSelected = processedData.length > 0 && internalSelectedRows.length === processedData.length;
  const isIndeterminate = internalSelectedRows.length > 0 && internalSelectedRows.length < processedData.length;

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: height,
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary">
          데이터를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  // DeptStatusPage 전용 복잡한 헤더 렌더링
  const renderComplexHeaders = () => {
    if (!showComplexHeaders) return null;

    return (
      <TableHead>
        {/* 그룹 헤더 행 */}
        <TableRow>
          <TableCell 
            rowSpan={2}
            align="center" 
            sx={{ 
              width: '60px', 
              maxWidth: '60px',
              minWidth: '60px',
              backgroundColor: 'var(--bank-bg-secondary) !important',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              border: '1px solid var(--bank-border)',
              padding: '8px !important',
            }}
          >
            {/* 체크박스 */}
          </TableCell>
          <TableCell 
            rowSpan={2}
            align="center" 
            sx={{ 
              width: '120px',
              maxWidth: '120px',
              minWidth: '120px',
              backgroundColor: 'var(--bank-bg-secondary) !important',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              border: '1px solid var(--bank-border)',
              padding: '8px !important',
            }}
          >
            부서명
          </TableCell>
          <TableCell 
            colSpan={5} 
            align="center"
            sx={{ 
              backgroundColor: 'var(--bank-bg-secondary) !important',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              border: '1px solid var(--bank-border)',
              padding: '8px !important',
            }}
          >
            점검결과
          </TableCell>
          <TableCell 
            colSpan={4} 
            align="center"
            sx={{ 
              backgroundColor: 'var(--bank-bg-secondary) !important',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              border: '1px solid var(--bank-border)',
              padding: '8px !important',
            }}
          >
            개선계획 및 이행현황
          </TableCell>
          <TableCell 
            rowSpan={2}
            align="center" 
            sx={{ 
              width: '100px',
              maxWidth: '100px', 
              minWidth: '100px',
              backgroundColor: 'var(--bank-bg-secondary) !important',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              border: '1px solid var(--bank-border)',
              padding: '8px !important',
            }}
          >
            결재상태
          </TableCell>
          <TableCell 
            rowSpan={2}
            align="center" 
            sx={{ 
              width: '200px',
              maxWidth: '200px',
              minWidth: '200px',
              backgroundColor: 'var(--bank-bg-secondary) !important',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              border: '1px solid var(--bank-border)',
              padding: '8px !important',
            }}
          >
            결재 상신
          </TableCell>
        </TableRow>
        {/* 세부 컬럼 헤더 행 */}
        <TableRow>
          <TableCell 
            align="center" 
            sx={{ 
              width: '80px',
              maxWidth: '80px', 
              minWidth: '80px',
              backgroundColor: 'var(--bank-bg-secondary) !important',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              border: '1px solid var(--bank-border)',
              padding: '8px !important',
            }}
          >
            전체
          </TableCell>
          <TableCell 
            align="center" 
            sx={{ 
              width: '80px',
              maxWidth: '80px',
              minWidth: '80px',
              backgroundColor: 'var(--bank-bg-secondary) !important',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              border: '1px solid var(--bank-border)',
              padding: '8px !important',
            }}
          >
            적정
          </TableCell>
          <TableCell 
            align="center" 
            sx={{ 
              width: '80px',
              maxWidth: '80px',
              minWidth: '80px',
              backgroundColor: 'var(--bank-bg-secondary) !important',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              border: '1px solid var(--bank-border)',
              padding: '8px !important',
            }}
          >
            미흡
          </TableCell>
          <TableCell 
            align="center" 
            sx={{ 
              width: '100px',
              maxWidth: '100px',
              minWidth: '100px',
              backgroundColor: 'var(--bank-bg-secondary) !important',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              border: '1px solid var(--bank-border)',
              padding: '8px !important',
            }}
          >
            점검제외
          </TableCell>
          <TableCell 
            align="center" 
            sx={{ 
              width: '120px',
              maxWidth: '120px',
              minWidth: '120px',
              backgroundColor: 'var(--bank-bg-secondary) !important',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              border: '1px solid var(--bank-border)',
              padding: '8px !important',
            }}
          >
            적정수행율(%)
          </TableCell>
          <TableCell 
            align="center" 
            sx={{ 
              width: '120px',
              maxWidth: '120px',
              minWidth: '120px',
              backgroundColor: 'var(--bank-bg-secondary) !important',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              border: '1px solid var(--bank-border)',
              padding: '8px !important',
            }}
          >
            개선계획작성
          </TableCell>
          <TableCell 
            align="center" 
            sx={{ 
              width: '120px',
              maxWidth: '120px',
              minWidth: '120px',
              backgroundColor: 'var(--bank-bg-secondary) !important',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              border: '1px solid var(--bank-border)',
              padding: '8px !important',
            }}
          >
            이행결과작성
          </TableCell>
          <TableCell 
            align="center" 
            sx={{ 
              width: '140px',
              maxWidth: '140px',
              minWidth: '140px',
              backgroundColor: 'var(--bank-bg-secondary) !important',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              border: '1px solid var(--bank-border)',
              padding: '8px !important',
            }}
          >
            이행결과결재완료
          </TableCell>
          <TableCell 
            align="center" 
            sx={{ 
              width: '100px',
              maxWidth: '100px',
              minWidth: '100px',
              backgroundColor: 'var(--bank-bg-secondary) !important',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              border: '1px solid var(--bank-border)',
              padding: '8px !important',
            }}
          >
            이행완료율
          </TableCell>
        </TableRow>
      </TableHead>
    );
  };

  // 일반 헤더 렌더링
  const renderSimpleHeaders = () => {
    if (showComplexHeaders) return null;

    return (
      <TableHead>
        <TableRow>
          {selectable && (
            <TableCell 
              padding="checkbox"
              sx={{ 
                width: '60px',
                maxWidth: '60px',
                minWidth: '60px',
                backgroundColor: 'var(--bank-bg-secondary) !important',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                border: '1px solid var(--bank-border)',
                padding: '8px !important',
              }}
            >
              {multiSelect && (
                <Checkbox
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  size="small"
                />
              )}
            </TableCell>
          )}
          {columns.map((column) => (
            <TableCell
              key={String(column.field)}
              align={column.headerAlign || column.align || 'center'}
              sx={{
                width: column.width ? `${column.width}px` : undefined,
                maxWidth: column.maxWidth ? `${column.maxWidth}px` : column.width ? `${column.width}px` : undefined,
                minWidth: column.minWidth ? `${column.minWidth}px` : column.width ? `${column.width}px` : undefined,
                backgroundColor: 'var(--bank-bg-secondary) !important',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                border: '1px solid var(--bank-border)',
                padding: '8px !important',
              }}
            >
              {column.renderHeader ? 
                column.renderHeader({
                  field: column.field,
                  headerName: column.headerName,
                  sortable: column.sortable,
                }) : 
                column.headerName
              }
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: height,
        maxHeight: maxHeight,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
    >
      <Paper sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <TableContainer sx={{ 
          flex: 1, 
          overflow: 'auto',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '4px' },
        }}>
          <Table stickyHeader size="small" sx={{
            tableLayout: 'fixed',
            width: '100%',
            '& .MuiTableBody-root .MuiTableRow-root:last-child .MuiTableCell-root': {
              borderBottom: '1px solid var(--bank-border)',
            },
          }}>
            {/* 헤더 렌더링 */}
            {renderComplexHeaders()}
            {renderSimpleHeaders()}

            {/* 테이블 바디 */}
            <TableBody>
              {processedData.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={columns.length + (selectable ? 1 : 0)} 
                    align="center"
                    sx={{ 
                      padding: '40px',
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                    }}
                  >
                    {noDataMessage}
                  </TableCell>
                </TableRow>
              ) : (
                processedData.map((row, index) => {
                  const isSelected = internalSelectedRows.includes(row._gridId);
                  
                  return (
                    <TableRow
                      key={row._gridId}
                      hover
                      selected={isSelected}
                      onClick={() => handleRowClick(row)}
                      sx={{
                        cursor: 'pointer',
                        minHeight: '40px !important',
                        maxHeight: '40px !important',
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
                      }}
                    >
                      {selectable && (
                        <TableCell 
                          sx={{
                            width: '60px !important',
                            maxWidth: '60px !important',
                            minWidth: '60px !important',
                            borderRight: '1px solid var(--bank-border)',
                            borderBottom: '1px solid var(--bank-border)',
                            padding: '8px !important',
                            textAlign: 'center',
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleRowSelectionChange(row._gridId, e.target.checked);
                            }}
                            size="small"
                          />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell
                          key={String(column.field)}
                          align={column.align || 'center'}
                          sx={{
                            width: column.width ? `${column.width}px !important` : undefined,
                            maxWidth: column.maxWidth ? `${column.maxWidth}px !important` : column.width ? `${column.width}px !important` : undefined,
                            minWidth: column.minWidth ? `${column.minWidth}px !important` : column.width ? `${column.width}px !important` : undefined,
                            borderRight: '1px solid var(--bank-border)',
                            borderBottom: '1px solid var(--bank-border)',
                            padding: '8px !important',
                            fontSize: '0.875rem',
                          }}
                        >
                          {column.renderCell ? 
                            column.renderCell({
                              value: row[column.field],
                              row: row,
                              field: column.field,
                              index: index,
                            }) : 
                            row[column.field]
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DataGridV2;