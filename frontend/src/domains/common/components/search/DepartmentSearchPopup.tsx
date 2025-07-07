/**
 * 부서검색 팝업 컴포넌트
 * 여러 화면에서 공통으로 사용할 수 있는 부서 검색 및 선택 팝업
 */
import { Dialog } from '@/shared/components/modal';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import React, { useEffect, useState } from 'react';

// 부서 타입 정의
export interface Department {
  id: number;
  deptCode: string;
  deptName: string;
  parentDeptCode?: string;
  parentDeptName?: string;
  deptLevel: number;
  sortOrder: number;
  managerName?: string;
  phoneNumber?: string;
  description?: string;
  isActive: boolean;
}

// 팝업 Props 타입
export interface DepartmentSearchPopupProps {
  open: boolean;
  title?: string;
  multiSelect?: boolean; // 다중 선택 여부
  onClose: () => void;
  onSelect: (departments: Department | Department[]) => void;
  selectedDepartments?: Department[]; // 기존 선택된 부서들
}

// 더미 데이터 (실제로는 API에서 가져와야 함)
const DUMMY_DEPARTMENTS: Department[] = [
  {
    id: 1,
    deptCode: 'DEPT001',
    deptName: '경영기획본부',
    deptLevel: 1,
    sortOrder: 1,
    managerName: '김부장',
    phoneNumber: '02-1234-5678',
    isActive: true,
  },
  {
    id: 2,
    deptCode: 'DEPT002',
    deptName: '경영기획팀',
    parentDeptCode: 'DEPT001',
    parentDeptName: '경영기획본부',
    deptLevel: 2,
    sortOrder: 1,
    managerName: '이팀장',
    phoneNumber: '02-1234-5679',
    isActive: true,
  },
  {
    id: 3,
    deptCode: 'DEPT003',
    deptName: '전략기획팀',
    parentDeptCode: 'DEPT001',
    parentDeptName: '경영기획본부',
    deptLevel: 2,
    sortOrder: 2,
    managerName: '박팀장',
    phoneNumber: '02-1234-5680',
    isActive: true,
  },
  {
    id: 4,
    deptCode: 'DEPT004',
    deptName: '인사총무본부',
    deptLevel: 1,
    sortOrder: 2,
    managerName: '최부장',
    phoneNumber: '02-1234-5681',
    isActive: true,
  },
  {
    id: 5,
    deptCode: 'DEPT005',
    deptName: '인사팀',
    parentDeptCode: 'DEPT004',
    parentDeptName: '인사총무본부',
    deptLevel: 2,
    sortOrder: 1,
    managerName: '정팀장',
    phoneNumber: '02-1234-5682',
    isActive: true,
  },
  {
    id: 6,
    deptCode: 'DEPT006',
    deptName: '총무팀',
    parentDeptCode: 'DEPT004',
    parentDeptName: '인사총무본부',
    deptLevel: 2,
    sortOrder: 2,
    managerName: '강팀장',
    phoneNumber: '02-1234-5683',
    isActive: true,
  },
  {
    id: 7,
    deptCode: 'DEPT007',
    deptName: 'IT개발본부',
    deptLevel: 1,
    sortOrder: 3,
    managerName: '송부장',
    phoneNumber: '02-1234-5684',
    isActive: true,
  },
  {
    id: 8,
    deptCode: 'DEPT008',
    deptName: '시스템개발팀',
    parentDeptCode: 'DEPT007',
    parentDeptName: 'IT개발본부',
    deptLevel: 2,
    sortOrder: 1,
    managerName: '윤팀장',
    phoneNumber: '02-1234-5685',
    isActive: true,
  },
];

const DepartmentSearchPopup: React.FC<DepartmentSearchPopupProps> = ({
  open,
  title = '부서검색',
  multiSelect = false,
  onClose,
  onSelect,
  selectedDepartments = [],
}) => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  // 컬럼 정의
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
      width: 200,
      flex: 1,
      renderCell: params => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* 들여쓰기로 계층 구조 표현 */}
          <Box sx={{ ml: (params.row.deptLevel - 1) * 2 }}>
            {params.row.deptLevel > 1 && '└ '}
            <Typography
              variant='body2'
              sx={{ fontWeight: params.row.deptLevel === 1 ? 'bold' : 'normal' }}
            >
              {params.value}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'parentDeptName',
      headerName: '상위부서',
      width: 150,
      renderCell: params => (
        <Typography variant='body2' color='text.secondary'>
          {params.value || '-'}
        </Typography>
      ),
    },
    {
      field: 'managerName',
      headerName: '부서장',
      width: 100,
      renderCell: params => <Typography variant='body2'>{params.value || '-'}</Typography>,
    },
    {
      field: 'phoneNumber',
      headerName: '연락처',
      width: 130,
      renderCell: params => (
        <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
          {params.value || '-'}
        </Typography>
      ),
    },
  ];

  // 부서 목록 조회 (더미 데이터 사용)
  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);

    try {
      // 실제로는 API 호출
      // const response = await departmentApi.getAll();

      // 더미 데이터 사용
      await new Promise(resolve => setTimeout(resolve, 500)); // 로딩 시뮬레이션
      setDepartments(DUMMY_DEPARTMENTS);
      setFilteredDepartments(DUMMY_DEPARTMENTS);
    } catch (err) {
      console.error('부서 목록 조회 실패:', err);
      setError('부서 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색 기능
  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      setFilteredDepartments(departments);
      return;
    }

    const filtered = departments.filter(
      dept =>
        dept.deptCode.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        dept.deptName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (dept.managerName && dept.managerName.toLowerCase().includes(searchKeyword.toLowerCase()))
    );
    setFilteredDepartments(filtered);
  };

  // 검색어 변경 시 자동 검색
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword, departments]); // eslint-disable-line react-hooks/exhaustive-deps

  // 컴포넌트 마운트 시 부서 목록 조회
  useEffect(() => {
    if (open) {
      fetchDepartments();
      // 기존 선택된 부서들 설정
      const selectedIds = selectedDepartments.map(dept => dept.id);
      setSelectedRows(selectedIds);
    }
  }, [open, selectedDepartments]);

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

  // 액션 버튼들
  const renderActions = () => (
    <>
      <Button onClick={onClose} variant='outlined'>
        취소
      </Button>
      <Button
        onClick={handleSelectComplete}
        variant='contained'
        disabled={selectedRows.length === 0}
      >
        선택 ({selectedRows.length})
      </Button>
    </>
  );

  return (
    <Dialog open={open} title={title} maxWidth='lg' onClose={onClose} actions={renderActions()}>
      <Box sx={{ width: '100%', height: 600 }}>
        {/* 검색 영역 */}
        <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            size='small'
            placeholder='부서코드, 부서명, 부서장명으로 검색'
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
          <Button
            variant='contained'
            onClick={handleSearch}
            sx={{
              minWidth: 80,
              backgroundColor: 'var(--bank-secondary)',
              '&:hover': { backgroundColor: 'var(--bank-secondary-dark)' },
            }}
          >
            검색
          </Button>
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
          <Box sx={{ height: 450 }}>
            <DataGrid
              rows={filteredDepartments}
              columns={columns}
              checkboxSelection={multiSelect}
              disableRowSelectionOnClick={multiSelect}
              rowSelectionModel={selectedRows}
              onRowSelectionModelChange={newSelection => {
                setSelectedRows(Array.from(newSelection) as number[]);
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
            총 {filteredDepartments.length}개 부서
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
};

export default DepartmentSearchPopup;
