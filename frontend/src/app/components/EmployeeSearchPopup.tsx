/**
 * 사원 검색 팝업 컴포넌트
 * UserController의 사용자 목록 조회 API를 사용
 */
import apiClient from '@/app/common/api/client';
import DepartmentApi from '@/domains/common/api/departmentApi';
import { Dialog } from '@/shared/components/modal';
import { Button } from '@/shared/components/ui/button';
import {
  Box,
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

  // 코드명 조회 함수 (Local storage 데이터 사용 - 직급용)
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

  // 부서명 조회 함수 (DepartmentApi 사용)
  const getDepartmentName = async (deptCd: string): Promise<string> => {
    if (!deptCd) return '';
    try {
      const result = await DepartmentApi.getName(deptCd);

      // 결과가 문자열인지 확인
      if (typeof result === 'string') {
        return result;
      }

      // 객체인 경우 data 필드 확인
      if (typeof result === 'object' && result !== null) {
        const obj = result as Record<string, unknown>;
        if ('data' in obj && typeof obj.data === 'string') {
          return obj.data;
        }
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

        // 검색 결과의 코드값들 로깅
        console.log(
          '변환된 직급/부서 정보:',
          transformedEmployees.map(emp => ({
            jobRank: { code: emp.jobRankCd, name: getCodeName('JOB_RANK', emp.jobRankCd) },
            dept: { code: emp.deptCd, name: emp.deptName },
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

  // 선택 확인
  const handleConfirmSelect = () => {
    if (selectedEmployee && onSelect) {
      onSelect(selectedEmployee);
    }
    onClose();
  };

  const renderActions = () => {
    return (
      <>
        <Button
          onClick={handleConfirmSelect}
          variant='contained'
          color='primary'
          disabled={!selectedEmployee}
        >
          선택
        </Button>
        <Button onClick={onClose}>
          취소
        </Button>
      </>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      maxWidth='lg'
      actions={renderActions()}
    >
      <Box sx={{ height: '80vh', display: 'flex', flexDirection: 'column' }}>
        {/* 검색 영역 */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label='성명'
              value={searchConditions.username}
              onChange={handleSearchConditionChange('username')}
              onKeyPress={handleKeyPress}
              size='small'
              sx={{ minWidth: 120 }}
            />
            <TextField
              label='사번'
              value={searchConditions.num}
              onChange={handleSearchConditionChange('num')}
              onKeyPress={handleKeyPress}
              size='small'
              sx={{ minWidth: 120 }}
            />
            <TextField
              label='부서코드'
              value={searchConditions.deptCd}
              onChange={handleSearchConditionChange('deptCd')}
              onKeyPress={handleKeyPress}
              size='small'
              sx={{ minWidth: 120 }}
            />
            <Button
              onClick={handleSearch}
              variant='contained'
              color='secondary'
              disabled={loading}
            >
              {loading ? '검색중...' : '검색'}
            </Button>
          </Box>
        </Box>

        {/* 에러 메시지 */}
        {error && <Box sx={{ mb: 2, color: 'error.main', fontSize: '0.875rem' }}>{error}</Box>}

        {/* 검색 결과 테이블 */}
        <TableContainer component={Paper} sx={{ flexGrow: 1, mb: 2 }}>
          <Table stickyHeader size='small'>
            <TableHead>
              <TableRow>
                <TableCell>사번</TableCell>
                <TableCell>성명</TableCell>
                <TableCell>직급</TableCell>
                <TableCell>부서</TableCell>
                <TableCell>이메일</TableCell>
                <TableCell>연락처</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map(emp => (
                <TableRow
                  key={emp.id}
                  onClick={() => handleEmployeeSelect(emp)}
                  selected={selectedEmployee?.id === emp.id}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' },
                  }}
                >
                  <TableCell>{emp.num || ''}</TableCell>
                  <TableCell>{emp.username || ''}</TableCell>
                  <TableCell>{getCodeName('JOB_RANK', emp.jobRankCd) || ''}</TableCell>
                  <TableCell>
                    {typeof emp.deptName === 'string' ? emp.deptName : emp.deptCd || ''}
                  </TableCell>
                  <TableCell>{emp.email || ''}</TableCell>
                  <TableCell>{emp.mobile || ''}</TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align='center'>
                    검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 하단 액션 버튼 제거 */}
      </Box>
    </Dialog>
  );
};

export default EmployeeSearchPopup;
