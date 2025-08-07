/**
 * 사원 검색 팝업 컴포넌트
 * UserController의 사용자 목록 조회 API를 사용
 * 부서검색 팝업과 통일된 디자인 적용
 */
import apiClient from '@/app/common/api/client';
import DepartmentApi from '@/domains/common/api/departmentApi';
import { Button } from '@/shared/components/ui/button';
import { getCodeName, useCommonCodes } from '@/shared/utils/codeUtils';
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

export interface EmployeeSearchPopupProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (employee: EmployeeSearchResult) => void;
  title?: string;
  selectedEmployee?: EmployeeSearchResult;
}

export interface EmployeeSearchResult {
  id: string;
  num: string; // 사번
  username: string; // 성명
  jobRankCd: string; // 직급코드
  jobTitleCd: string; // 직책코드
  deptCd: string; // 부서코드
  deptName?: string; // 부서명 (추가)
  email: string;
  mobile: string;
}

interface UserResponse {
  id: string;
  username: string;
  email: string;
  address: string;
  mobile: string;
  deptCd: string;
  num: string;
  jobRankCd: string;
  jobTitleCd: string;
  createdAt: string;
  updatedAt: string;
}

const EmployeeSearchPopup: React.FC<EmployeeSearchPopupProps> = ({
  open,
  onClose,
  onSelect,
  title = '사원 검색',
}) => {
  // 공통코드 훅 사용
  const allCodes = useCommonCodes();

  // 검색 조건 상태
  const [searchConditions, setSearchConditions] = useState({
    username: '',
    num: '',
  });

  // 검색 결과 상태
  const [employees, setEmployees] = useState<EmployeeSearchResult[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSearchResult | null>(null);

  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 코드명 조회 함수 (Local storage 데이터 사용 - 직급용)
  // const getCodeName = (groupCode: string, code: string | null | undefined): string => {
  //   if (!code) return '';
  //   const codeList = usableGroupedCodes[groupCode];
  //   if (!codeList || !Array.isArray(codeList)) {
  //     return code;
  //   }
  //   const codeItem = codeList.find(item => item.code === code);
  //   if (!codeItem) {
  //     return code;
  //   }
  //   return codeItem.codeName;
  // };

  // 부서명 조회 함수 (DepartmentApi 사용)
  const getDepartmentName = async (deptCd: string): Promise<string> => {
    if (!deptCd) return '';
    try {
      const result = await DepartmentApi.getName(deptCd);

      // 결과가 문자열인지 확인
      if (typeof result === 'string') {
        return result;
      }

      // 객체인 경우 필드 확인
      if (typeof result === 'object' && result !== null) {
        const obj = result as Record<string, unknown>;
        
        // message 필드 확인 (백엔드 표준 응답 형태)
        if ('message' in obj && typeof obj.message === 'string') {
          return obj.message;
        }
        
        // data 필드 확인
        if ('data' in obj && typeof obj.data === 'string') {
          return obj.data;
        }
        
        // departmentName 필드 확인
        if ('departmentName' in obj && typeof obj.departmentName === 'string') {
          return obj.departmentName;
        }
      }

      console.warn('부서명 조회 결과가 예상과 다름:', result);
      return deptCd; // 예상과 다른 결과일 때 코드 반환
    } catch (error) {
      console.warn('부서명 조회 실패:', deptCd, error);
      return deptCd; // 조회 실패 시 코드 반환
    }
  };

  // 다이얼로그 초기화
  useEffect(() => {
    if (open) {
      setSearchConditions({ username: '', num: '' });
      setEmployees([]);
      setSelectedEmployee(null);
      setSelectedRows([]);
      setError(null);

      // 초기 데이터 로드
      handleSearch();
    }
  }, [open]);

  // 사원 목록 검색
  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: '100', // 최대 100명까지 조회
      });

      // 검색 조건 추가
      if (searchConditions.username?.trim()) {
        params.append('username', searchConditions.username.trim());
      }
      if (searchConditions.num?.trim()) {
        params.append('num', searchConditions.num.trim());
      }

      const response = await apiClient.get<UserResponse[]>(`/users/employees?${params.toString()}`);

      if (response && Array.isArray(response)) {
        const transformedEmployees: EmployeeSearchResult[] = await Promise.all(
          response.map(async (user: UserResponse) => {
            // 부서명 비동기 조회
            const deptName = await getDepartmentName(user.deptCd);

            return {
              id: user.id,
              num: user.num || '',
              username: user.username,
              jobRankCd: user.jobRankCd || '',
              jobTitleCd: user.jobTitleCd || '',
              deptCd: user.deptCd || '',
              deptName: deptName,
              email: user.email,
              mobile: user.mobile,
            };
          })
        );

        setEmployees(transformedEmployees);

      } else {
        setEmployees([]);
      }
    } catch (err) {
      console.error('사원 검색 중 오류:', err);
      setError('사원 목록을 불러오는데 실패했습니다.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 조건 변경
  const handleSearchConditionChange =
    (field: keyof typeof searchConditions) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchConditions(prev => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  // 엔터키 검색
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };


  // 컬럼 정의 (부서검색과 동일한 스타일)
  const columns: GridColDef[] = [
    {
      field: 'num',
      headerName: '사번',
      width: 100,
      renderCell: params => (
        <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'username',
      headerName: '성명',
      width: 120,
      renderCell: params => (
        <Typography variant='body2' sx={{ fontWeight: 'bold' }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'deptName',
      headerName: '부서',
      flex: 1,
      minWidth: 150,
      renderCell: params => (
        <Typography variant='body2'>
          {params.value || params.row.deptCd}
        </Typography>
      ),
    },
    {
      field: 'jobRankCd',
      headerName: '직급',
      width: 80,
      renderCell: params => (
        <Typography variant='body2'>
          {getCodeName(allCodes, 'JOB_RANK', params.value) || params.value}
        </Typography>
      ),
    },
  ];

  // 행 더블클릭 핸들러 (단일 선택)
  const handleRowDoubleClick = (params: GridRowParams) => {
    const selectedEmp = employees.find(emp => emp.id === params.id);
    if (selectedEmp && onSelect) {
      onSelect(selectedEmp);
      onClose();
    }
  };

  // 선택된 행 상태 관리
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 선택 완료 핸들러
  const handleSelectComplete = () => {
    if (selectedRows.length > 0) {
      const selectedEmp = employees.find(emp => emp.id === selectedRows[0]);
      if (selectedEmp && onSelect) {
        onSelect(selectedEmp);
      }
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      aria-labelledby='employee-search-dialog-title'
    >
      <DialogTitle id='employee-search-dialog-title'>
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
          <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size='small'
              placeholder='성명'
              value={searchConditions.username}
              onChange={handleSearchConditionChange('username')}
              onKeyDown={handleKeyDown}
              sx={{ minWidth: 100 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              size='small'
              placeholder='사번'
              value={searchConditions.num}
              onChange={handleSearchConditionChange('num')}
              onKeyDown={handleKeyDown}
              sx={{ minWidth: 100 }}
            />
            <Button onClick={handleSearch} variant='contained' color='secondary' size='medium' disabled={loading}>
              검색
            </Button>
          </Box>

          {/* 안내 메시지 */}
          <Box sx={{ mb: 1 }}>
            <Typography variant='body2' color='text.secondary'>
              행을 더블클릭하거나 선택 후 "선택" 버튼을 클릭하세요.
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
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}
            >
              <CircularProgress />
            </Box>
          ) : (
            /* 사원 목록 DataGrid */
            <Box sx={{ height: 350 }}>
              <DataGrid
                rows={employees}
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
              총 {employees.length}건
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

export default EmployeeSearchPopup;
