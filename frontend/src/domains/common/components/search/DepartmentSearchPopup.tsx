/**
 * 부서검색 팝업 컴포넌트
 * 여러 화면에서 공통으로 사용할 수 있는 부서 검색 및 선택 팝업
 */
import DepartmentApi, {
  type Department as ApiDepartment,
} from '@/domains/common/api/departmentApi';
import { Button } from '@/shared/components/ui/button';
import {
  Alert,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { SearchBox } from '@/shared/components/ui/form';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import React, { useCallback, useEffect, useState } from 'react';

// 부서 타입 정의 (백엔드 API 응답과 일치)
export interface Department {
  id: string;
  deptCode: string;
  deptName: string;
  useYn: string;
  isActive: boolean;
  createdId?: string;
  updatedId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 팝업 Props 타입
export interface DepartmentSearchPopupProps {
  open: boolean;
  title?: string;
  multiSelect?: boolean; // 다중 선택 여부
  onClose: () => void;
  onSelect: (departments: Department | Department[]) => void;
  selectedDepartments?: Department[]; // 기존 선택된 부서들
  availableDepartments?: Department[]; // 사용 가능한 부서 목록 (없으면 모든 활성 부서 사용)
}

// API 부서 데이터를 컴포넌트 부서 타입으로 변환
const convertApiDepartmentToComponent = (apiDept: ApiDepartment): Department => {
  return {
    id: apiDept.departmentId,
    deptCode: apiDept.departmentId,
    deptName: apiDept.departmentName,
    useYn: apiDept.useYn,
    isActive: apiDept.isActive,
    createdId: apiDept.createdId,
    updatedId: apiDept.updatedId,
    createdAt: apiDept.createdAt,
    updatedAt: apiDept.updatedAt,
  };
};

const DepartmentSearchPopup: React.FC<DepartmentSearchPopupProps> = ({
  open,
  title = '부서검색',
  multiSelect = false,
  onClose,
  onSelect,
  selectedDepartments: _selectedDepartments = [], // eslint-disable-line @typescript-eslint/no-unused-vars
  availableDepartments,
}) => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 컬럼 정의 (컴팩트 버전)
  const columns: GridColDef[] = [
    {
      field: 'deptCode',
      headerName: '부서코드',
      width: 120,
      renderCell: params => (
        <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'deptName',
      headerName: '부서명',
      flex: 1,
      minWidth: 200,
      renderCell: params => (
        <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'useYn',
      headerName: '상태',
      width: 70,
      renderCell: params => (
        <Typography
          variant='body2'
          sx={{
            color: params.value === 'Y' ? 'success.main' : 'error.main',
            fontWeight: '500',
          }}
        >
          {params.value === 'Y' ? '사용' : '미사용'}
        </Typography>
      ),
    },
  ];

  // 부서 목록 조회
  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let convertedDepartments: Department[];
      
      if (availableDepartments) {
        // prop으로 전달된 부서 목록 사용
        convertedDepartments = availableDepartments;
      } else {
        // 기존 방식: API에서 모든 활성 부서 조회
      const apiDepartments = await DepartmentApi.getActive();
        convertedDepartments = apiDepartments.map(convertApiDepartmentToComponent);
      }
      
      setDepartments(convertedDepartments);
      setFilteredDepartments(convertedDepartments);
    } catch (err) {
      console.error('부서 목록 조회 실패:', err);
      setError('부서 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [availableDepartments]);

  // 검색 기능
  const handleSearch = useCallback((q?: string) => {
    const keyword = (q ?? searchKeyword).trim().toLowerCase();
    if (!keyword) {
      setFilteredDepartments(departments);
      return;
    }

    const filtered = departments.filter(
      dept =>
        dept.deptCode.toLowerCase().includes(keyword) ||
        dept.deptName.toLowerCase().includes(keyword)
    );
    setFilteredDepartments(filtered);
  }, [searchKeyword, departments]);

  // 검색어 변경 시 자동 검색
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [handleSearch]);

  // 컴포넌트 마운트 시 부서 목록 조회
  useEffect(() => {
    if (open) {
      fetchDepartments();
      // 팝업이 열릴 때마다 선택 초기화
      setSelectedRows([]);
    }
  }, [open, availableDepartments, fetchDepartments]);

  // 행 더블클릭 핸들러 (단일 선택)
  const handleRowDoubleClick = (params: GridRowParams) => {
    if (!multiSelect) {
      const selectedDept = filteredDepartments.find(dept => dept.id === params.id);
      if (selectedDept) {
        onSelect(selectedDept);
        onClose();
      }
    }
  };

  // 선택 완료 핸들러
  const handleSelectComplete = () => {
    if (multiSelect) {
      const selectedDepts = filteredDepartments.filter(dept => selectedRows.includes(dept.id));
      onSelect(selectedDepts);
    } else {
      if (selectedRows.length > 0) {
        const selectedDept = filteredDepartments.find(dept => dept.id === selectedRows[0]);
        if (selectedDept) {
          onSelect(selectedDept);
        }
      }
    }
    onClose();
  };

  return (
    <BaseDialog
      open={open}
      mode='view'
      title={title}
      maxWidth='sm'
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
      contentSx={{ p: 0, px: 2 }}
    >
      <Box sx={{ width: '100%', height: 500, p: 2 }}>
        {/* 검색 영역 */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Box sx={{ flex: 1, minWidth: 120 }}>
            <SearchBox
              placeholder='부서코드, 부서명'
              onSearch={(query: string) => { setSearchKeyword(query); handleSearch(query); }}
              onClear={() => { setSearchKeyword(''); handleSearch(''); }}
            />
          </Box>
        </Box>

        {/* 안내 메시지 */}
        <Box sx={{ mb: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            {multiSelect
              ? '체크박스를 선택하여 여러 부서를 선택할 수 있습니다.'
              : '행을 더블클릭하거나 선택 후 "선택" 버튼을 클릭하세요.'}
          </Typography>
        </Box>

        {/* 에러 메시지 */}
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 로딩 상태 */}
        {loading ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}
          >
            <CircularProgress />
          </Box>
        ) : (
          /* 부서 목록 DataGrid */
          <Box sx={{ height: 350 }}>
            <DataGrid
              rows={filteredDepartments}
              columns={columns}
              checkboxSelection={multiSelect}
              disableRowSelectionOnClick={multiSelect}
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
            총 {filteredDepartments.length}건
          </Typography>
        </Box>
      </Box>
    </BaseDialog>
  );
};

export default DepartmentSearchPopup;
