/**
 * 사원 검색 팝업 컴포넌트
 * UserController의 사용자 목록 조회 API를 사용
 */
import type { ApiResponse } from '@/app/common/api/client';
import apiClient from '@/app/common/api/client';
import {
  Box,
  Button,
  Dialog,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

export interface EmployeeSearchPopupProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (employee: EmployeeSearchResult) => void;
  title?: string;
}

export interface EmployeeSearchResult {
  id: string;
  num: string; // 사번
  username: string; // 성명
  jobRankCd: string; // 직급코드
  jobTitleCd: string; // 직책코드
  deptCd: string; // 부서코드
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

// Local storage에서 공통코드 가져오는 함수
function getCommonCodesFromLocalStorage(): Record<
  string,
  { code: string; codeName: string; groupCode: string }[]
> {
  try {
    const codes = localStorage.getItem('commonCodes');
    if (!codes) return {};
    return JSON.parse(codes);
  } catch (e) {
    console.error('LocalStorage commonCodes 파싱 오류:', e);
    return {};
  }
}

const EmployeeSearchPopup: React.FC<EmployeeSearchPopupProps> = ({
  open,
  onClose,
  onSelect,
  title = '사원 검색',
}) => {
  // 공통코드 Local storage에서 읽기
  const usableGroupedCodes = getCommonCodesFromLocalStorage();

  // 검색 조건 상태
  const [searchConditions, setSearchConditions] = useState({
    username: '',
    num: '',
    deptCd: '',
  });

  // 검색 결과 상태
  const [employees, setEmployees] = useState<EmployeeSearchResult[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSearchResult | null>(null);

  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 코드명 조회 함수 (Local storage 데이터 사용)
  const getCodeName = (groupCode: string, code: string | null | undefined): string => {
    if (!code) return '';
    const codeList = usableGroupedCodes[groupCode];
    if (!codeList || !Array.isArray(codeList)) {
      console.log(`코드 목록 없음 또는 잘못된 형식 - 그룹: ${groupCode}`);
      return code;
    }
    const codeItem = codeList.find(item => item.code === code);
    if (!codeItem) {
      console.log(`매칭되는 코드 없음 - 그룹: ${groupCode}, 코드: ${code}`);
      return code;
    }
    return codeItem.codeName;
  };

  // 다이얼로그 초기화
  useEffect(() => {
    if (open) {
      setSearchConditions({ username: '', num: '', deptCd: '' });
      setEmployees([]);
      setSelectedEmployee(null);
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
      if (searchConditions.deptCd?.trim()) {
        params.append('deptCd', searchConditions.deptCd.trim());
      }

      console.log('사원 검색 API 호출:', params.toString());

      const response = await apiClient.get<ApiResponse<UserResponse[]>>(
        `/users/employees?${params.toString()}`
      );

      console.log('사원 검색 응답:', response.data);

      if (response.data && Array.isArray(response.data)) {
        const transformedEmployees: EmployeeSearchResult[] = response.data.map(
          (user: UserResponse) => ({
            id: user.id,
            num: user.num || '',
            username: user.username,
            jobRankCd: user.jobRankCd || '',
            jobTitleCd: user.jobTitleCd || '',
            deptCd: user.deptCd || '',
            email: user.email,
            mobile: user.mobile,
          })
        );

        setEmployees(transformedEmployees);

        // 검색 결과의 코드값들 로깅
        console.log(
          '변환된 직급/부서 코드:',
          transformedEmployees.map(emp => ({
            jobRank: { code: emp.jobRankCd, name: getCodeName('JOB_RANK', emp.jobRankCd) },
            dept: { code: emp.deptCd, name: getCodeName('DEPT', emp.deptCd) },
          }))
        );
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
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // 사원 선택
  const handleEmployeeSelect = (employee: EmployeeSearchResult) => {
    setSelectedEmployee(employee);
  };

  // 사원 선택 확인
  const handleConfirmSelect = () => {
    if (selectedEmployee && onSelect) {
      onSelect(selectedEmployee);
    }
    onClose();
  };

  // 다이얼로그 액션 버튼
  const renderActions = () => {
    return (
      <>
        <Button onClick={onClose} variant='outlined'>
          취소
        </Button>
        <Button
          onClick={handleConfirmSelect}
          variant='contained'
          disabled={!selectedEmployee}
          sx={{
            backgroundColor: 'var(--bank-primary)',
            '&:hover': { backgroundColor: 'var(--bank-primary-dark)' },
            '&:disabled': { backgroundColor: 'var(--bank-border)' },
          }}
        >
          선택
        </Button>
      </>
    );
  };

  return (
    <Dialog open={open} title={title} maxWidth='md' onClose={onClose} actions={renderActions()}>
      <Box sx={{ mt: 2, minHeight: 500 }}>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 검색 영역 */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size='small'
              label='사번'
              value={searchConditions.num}
              onChange={handleSearchConditionChange('num')}
              onKeyPress={handleKeyPress}
              sx={{ minWidth: 150 }}
            />
            <TextField
              size='small'
              label='성명'
              value={searchConditions.username}
              onChange={handleSearchConditionChange('username')}
              onKeyPress={handleKeyPress}
              sx={{ minWidth: 150 }}
            />
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size='small'
                label='부서코드'
                value={searchConditions.deptCd}
                onChange={handleSearchConditionChange('deptCd')}
                onKeyPress={handleKeyPress}
                sx={{ minWidth: 150 }}
              />
              <Button
                variant='contained'
                onClick={handleSearch}
                disabled={loading}
                sx={{
                  minWidth: 80,
                  height: 40,
                  backgroundColor: '#666',
                  '&:hover': {
                    backgroundColor: '#555',
                  },
                }}
              >
                검색
              </Button>
            </Box>
          </Box>
        </Box>

        {/* 검색 결과 테이블 */}
        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow>
                <TableCell>사번</TableCell>
                <TableCell>성명</TableCell>
                <TableCell>직급</TableCell>
                <TableCell>부서</TableCell>
                <TableCell>이메일</TableCell>
                <TableCell>휴대폰</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    검색된 사원이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map(employee => (
                  <TableRow
                    key={employee.id}
                    onClick={() => handleEmployeeSelect(employee)}
                    selected={selectedEmployee?.id === employee.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{employee.num}</TableCell>
                    <TableCell>{employee.username}</TableCell>
                    <TableCell>{getCodeName('JOB_RANK', employee.jobRankCd)}</TableCell>
                    <TableCell>{getCodeName('DEPT', employee.deptCd)}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.mobile}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Dialog>
  );
};

export default EmployeeSearchPopup;
