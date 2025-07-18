/**
 * 직책 등록/수정/조회 다이얼로그 컴포넌트
 */
import apiClient from '@/app/common/api/client';
import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
import DepartmentApi, {
  type Department as ApiDepartment,
} from '@/domains/common/api/departmentApi';
import type { EmployeeSearchResult } from '@/domains/common/components/search';
import { DepartmentSearchPopup, type Department } from '@/domains/common/components/search';
import EmployeeSearchPopup from '@/domains/common/components/search/EmployeeSearchPopup';
import {
  MeetingBodySearchDialog,
  type MeetingBodySearchResult,
} from '@/domains/meeting/components';
import { Dialog } from '@/shared/components/modal';
import Button from '@/shared/components/ui/button/Button';
import TextField from '@/shared/components/ui/data-display/TextField';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

// 백엔드 ApiResponse<T> DTO에 대응하는 타입
interface ApiSuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PositionData {
  positionsId: string;
  ledgerOrder: string;
  positionName: string;
  writeDeptCd: string;
  confirmGubunCd: string;
  ownerDepts: Array<{ deptCode: string; deptName: string }>;
  meetings: Array<{
    meetingBodyId: string;
    meetingBodyName: string;
    memberGubun: string;
    meetingPeriod: string;
    deliberationContent: string;
  }>;
  managers: Array<{ empNo: string; empName: string; position: string }>;
}

export interface PositionDialogProps {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  positionId?: number | null;
  onClose: () => void;
  onSave?: (position: PositionData) => void;
  onChangeMode?: (newMode: 'create' | 'edit' | 'view') => void;
}

interface FormData {
  positionName: string;
  writeDeptCd: string;
  writeDeptName?: string; // Optional field to store the department name
}

// 부서 드롭다운 옵션 타입
interface DepartmentOption {
  value: string; // departmentId
  label: string; // departmentName
}

interface OwnerDept {
  id: string;
  deptCode: string;
  deptName: string;
}

interface MeetingData {
  id: string;
  meetingBodyId: string;
  meetingBodyName: string;
  memberGubun: string;
  meetingPeriod: string;
  deliberationContent: string;
}

interface ManagerData {
  id: string;
  empNo: string;
  empName: string;
  position: string;
}

const PositionDialog: React.FC<PositionDialogProps> = ({
  open,
  mode,
  positionId,
  onClose,
  onSave,
  onChangeMode,
}) => {
  // 공통코드 Store에서 데이터 가져오기
  const { data: allCodes, setData: setAllCodes } = useReduxState<
    { data: CommonCode[] } | CommonCode[]
  >('codeStore/allCodes');

  // 부서 데이터 상태
  const [departments, setDepartments] = useState<Array<{ value: string; label: string }>>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState<boolean>(false);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);

  // 공통코드 배열 추출 함수
  const getCodesArray = (): CommonCode[] => {
    if (!allCodes) return [];
    if (Array.isArray(allCodes)) {
      return allCodes;
    }
    if (typeof allCodes === 'object' && 'data' in allCodes && Array.isArray(allCodes.data)) {
      return allCodes.data;
    }
    return [];
  };

  // 공통코드 헬퍼 함수
  const getDeptCodes = () => {
    // 부서 API에서 데이터를 가져온 경우 해당 데이터 사용
    if (departments.length > 0) {
      return departments.map(dept => ({
        code: dept.value,
        codeName: dept.label,
        groupCode: 'DEPT',
        useYn: 'Y',
        sortOrder: 0,
      }));
    }

    // 기존 공통코드 로직 (폴백용)
    const codes = getCodesArray();
    return codes
      .filter(code => code.groupCode === 'DEPT' && code.useYn === 'Y')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const getMebGubunCodes = () => {
    const codes = getCodesArray();
    return codes
      .filter(code => code.groupCode === 'MEB_GUBUN' && code.useYn === 'Y')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  // 부서 데이터 가져오기
  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    setDepartmentsError(null);

    try {
      const apiDepartments = await DepartmentApi.getActive();
      console.log('API 부서 데이터:', apiDepartments);

      if (apiDepartments && Array.isArray(apiDepartments)) {
        // API 응답을 드롭다운에 맞는 형식으로 변환
        const departmentOptions = apiDepartments.map(dept => ({
          value: dept.departmentId,
          label: dept.departmentName,
        }));

        // 부서 데이터 상태 업데이트
        setDepartments(departmentOptions);

        // 부서 데이터 캐싱 (localStorage)
        try {
          localStorage.setItem('cachedDepartments', JSON.stringify(departmentOptions));
          localStorage.setItem('departmentsCacheTimestamp', String(new Date().getTime()));
          console.log('부서 데이터 캐시 저장 완료:', departmentOptions.length);
        } catch (cacheError) {
          console.warn('부서 데이터 캐싱 실패:', cacheError);
          // 캐싱 실패는 치명적이지 않으므로 에러 상태로 설정하지 않음
        }
      } else {
        console.warn('부서 API 응답이 예상과 다릅니다:', apiDepartments);
        setDepartmentsError('부서 데이터 형식이 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('부서 목록 조회 실패:', err);
      setDepartmentsError('부서 목록을 불러오는데 실패했습니다.');
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const [formData, setFormData] = useState<FormData>({
    positionName: '',
    writeDeptCd: '',
  });

  // 소관부서 목록
  const [ownerDepts, setOwnerDepts] = useState<OwnerDept[]>([
    { id: '1', deptCode: '', deptName: '' },
  ]);

  // 주관회의체 목록
  const [meetings, setMeetings] = useState<MeetingData[]>([
    {
      id: '1',
      meetingBodyId: '',
      meetingBodyName: '',
      memberGubun: '',
      meetingPeriod: '',
      deliberationContent: '',
    },
  ]);

  // 책무기술서 작성 관리자 목록
  const [managers, setManagers] = useState<ManagerData[]>([
    { id: '1', empNo: '', empName: '', position: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 회의체 검색 다이얼로그 상태
  const [meetingSearchOpen, setMeetingSearchOpen] = useState(false);
  const [currentMeetingId, setCurrentMeetingId] = useState<string>('');

  // 사원 검색 다이얼로그 상태
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);
  const [currentManagerId, setCurrentManagerId] = useState<string>('');

  // 부서 검색 다이얼로그 상태
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false);
  const [currentOwnerDeptId, setCurrentOwnerDeptId] = useState<string>('');
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
  // 다이얼로그 제목 설정
  const getDialogTitle = () => {
    switch (mode) {
      case 'create':
        return '직책 등록';
      case 'edit':
        return '직책 수정';
      case 'view':
        return '직책 상세조회';
      default:
        return '직책';
    }
  };

  // 컴포넌트 마운트 시 localStorage에서 공통코드 복원 및 부서 데이터 캐싱
  useEffect(() => {
    const storedCommonCodes = localStorage.getItem('commonCodes');

    if (
      storedCommonCodes &&
      (!allCodes ||
        (Array.isArray(allCodes) && allCodes.length === 0) ||
        (typeof allCodes === 'object' &&
          'data' in allCodes &&
          (!allCodes.data || allCodes.data.length === 0)))
    ) {
      try {
        const parsedCodes = JSON.parse(storedCommonCodes);
        setAllCodes(parsedCodes);
      } catch (error) {
        console.error('localStorage 공통코드 복원 실패:', error);
        localStorage.removeItem('commonCodes');
      }
    }

    // 부서 데이터 캐싱 처리
    const cachedDepartments = localStorage.getItem('cachedDepartments');
    const cacheTimestamp = localStorage.getItem('departmentsCacheTimestamp');
    const currentTime = new Date().getTime();

    // 캐시 유효 시간: 1시간 (3600000 밀리초)
    const cacheValidityPeriod = 3600000;

    if (
      cachedDepartments &&
      cacheTimestamp &&
      currentTime - parseInt(cacheTimestamp) < cacheValidityPeriod
    ) {
      try {
        const parsedDepartments = JSON.parse(cachedDepartments);
        console.log('부서 데이터 캐시에서 로드:', parsedDepartments.length);
        setDepartments(parsedDepartments);
      } catch (error) {
        console.error('캐시된 부서 데이터 복원 실패:', error);
        localStorage.removeItem('cachedDepartments');
        localStorage.removeItem('departmentsCacheTimestamp');
        // 캐시 복원 실패 시 API에서 다시 로드
        fetchDepartments();
      }
    } else {
      // 캐시가 없거나 만료된 경우 API에서 로드
      fetchDepartments();
    }
  }, [allCodes, setAllCodes]);

  // 폼 데이터 초기화 및 상세 데이터 로드
  useEffect(() => {
    const fetchPositionDetails = async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const positionData: PositionData = await apiClient.get(`/positions/${id}`);
        console.log(positionData, 'test 1');
        if (positionData) {
          console.log(positionData, 'test 2');

          // 부서 코드에 해당하는 부서명 찾기
          let writeDeptName = '';
          if (positionData.writeDeptCd) {
            const matchingDept = departments.find(dept => dept.value === positionData.writeDeptCd);
            if (matchingDept) {
              writeDeptName = matchingDept.label;
            } else {
              // API에서 부서명 조회 시도
              try {
                const deptName = await DepartmentApi.getName(positionData.writeDeptCd);
                if (typeof deptName === 'string') {
                  writeDeptName = deptName;
                } else if (typeof deptName === 'object' && deptName !== null) {
                  writeDeptName = deptName.departmentName || '';
                }
              } catch (deptErr) {
                console.warn('부서명 조회 실패:', deptErr);
                // 부서명 조회 실패 시 공통코드에서 찾기
                const deptCode = getCodesArray().find(
                  code => code.groupCode === 'DEPT' && code.code === positionData.writeDeptCd
                );
                writeDeptName = deptCode ? deptCode.codeName : positionData.writeDeptCd;
              }
            }
          }

          setFormData({
            positionName: positionData.positionName || '',
            writeDeptCd: positionData.writeDeptCd || '',
            writeDeptName: writeDeptName,
          });

          console.log('test 3');
          const ownerDeptsData = positionData.ownerDepts || [];
          const meetingsData = positionData.meetings || [];
          const managersData = positionData.managers || [];

          setOwnerDepts(
            ownerDeptsData.length > 0
              ? ownerDeptsData.map((d: any, i: any) => ({ id: String(i + 1), ...d }))
              : [{ id: '1', deptCode: '', deptName: '' }]
          );
          setMeetings(
            meetingsData.length > 0
              ? meetingsData.map((m: any, i: any) => ({
                  id: String(i + 1),
                  ...m,
                  memberGubun: m.memberGubun === 'GUBUN01' ? 'MEG01' : m.memberGubun, // 데이터 임시 보정
                }))
              : [
                  {
                    id: '1',
                    meetingBodyId: '',
                    meetingBodyName: '',
                    memberGubun: '',
                    meetingPeriod: '',
                    deliberationContent: '',
                  },
                ]
          );
          setManagers(
            managersData.length > 0
              ? managersData.map((m: any, i: any) => ({ id: String(i + 1), ...m }))
              : [{ id: '1', empNo: '', empName: '', position: '' }]
          );
        } else {
          setError('상세 정보를 불러오는데 실패했습니다.');
        }
      } catch (err) {
        setError('상세 정보를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      setError(null);
      setValidationErrors({});

      if ((mode === 'edit' || mode === 'view') && positionId) {
        fetchPositionDetails(positionId);
      } else {
        // create 모드
        setFormData({
          positionName: '',
          writeDeptCd: '',
        });
        setOwnerDepts([{ id: '1', deptCode: '', deptName: '' }]);
        setMeetings([
          {
            id: '1',
            meetingBodyId: '',
            meetingBodyName: '',
            memberGubun: '',
            meetingPeriod: '',
            deliberationContent: '',
          },
        ]);
        setManagers([{ id: '1', empNo: '', empName: '', position: '' }]);
      }
    }
  }, [open, mode, positionId]);

  // 입력값 변경 핸들러
  const handleInputChange =
    (field: keyof FormData) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | { target: { value: string } }
    ) => {
      const value = event.target.value;

      // 부서 선택 시 부서명도 함께 저장
      if (field === 'writeDeptCd') {
        const selectedDept = departments.find(dept => dept.value === value);
        setFormData(prev => ({
          ...prev,
          [field]: value,
          writeDeptName: selectedDept ? selectedDept.label : '',
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: value,
        }));
      }

      if (validationErrors[field]) {
        setValidationErrors(prev => ({
          ...prev,
          [field]: '',
        }));
      }
    };

  // 소관부서 추가
  const addOwnerDept = () => {
    const newId = Date.now().toString();
    setOwnerDepts(prev => [...prev, { id: newId, deptCode: '', deptName: '' }]);
  };

  // 소관부서 삭제
  const removeOwnerDept = (id: string) => {
    if (ownerDepts.length > 1) {
      setOwnerDepts(prev => prev.filter(dept => dept.id !== id));
    }
  };

  // 회의체 추가
  const addMeeting = () => {
    const newId = Date.now().toString();
    setMeetings(prev => [
      ...prev,
      {
        id: newId,
        meetingBodyId: '',
        meetingBodyName: '',
        memberGubun: '',
        meetingPeriod: '',
        deliberationContent: '',
      },
    ]);
  };

  // 회의체 삭제
  const removeMeeting = (id: string) => {
    if (meetings.length > 1) {
      setMeetings(prev => prev.filter(meeting => meeting.id !== id));
    }
  };

  // 회의체 변경
  const handleMeetingChange = (id: string, field: keyof MeetingData, value: string) => {
    setMeetings(prev =>
      prev.map(meeting =>
        meeting.id === id
          ? {
              ...meeting,
              [field]: value,
            }
          : meeting
      )
    );
  };

  // 회의체 검색 팝업 열기
  const handleMeetingSearchClick = (id: string) => {
    setCurrentMeetingId(id);
    setMeetingSearchOpen(true);
  };

  // 회의체 검색 팝업 닫기
  const handleMeetingSearchClose = () => {
    setMeetingSearchOpen(false);
    setCurrentMeetingId('');
  };

  // 회의체 선택 완료
  const handleMeetingBodySelect = (selectedMeeting: MeetingBodySearchResult) => {
    if (currentMeetingId) {
      setMeetings(prev =>
        prev.map(meeting =>
          meeting.id === currentMeetingId
            ? {
                ...meeting,
                meetingBodyId: selectedMeeting.id,
                meetingBodyName: selectedMeeting.name,
                meetingPeriod: selectedMeeting.period || '',
                deliberationContent: selectedMeeting.content || '',
              }
            : meeting
        )
      );
    }
    handleMeetingSearchClose();
  };

  // 관리자 추가
  const addManager = () => {
    const newId = Date.now().toString();
    setManagers(prev => [...prev, { id: newId, empNo: '', empName: '', position: '' }]);
  };

  // 관리자 삭제
  const removeManager = (id: string) => {
    if (managers.length > 1) {
      setManagers(prev => prev.filter(manager => manager.id !== id));
    }
  };

  // 관리자 변경
  const handleManagerChange = (id: string, field: keyof ManagerData, value: string) => {
    setManagers(prev =>
      prev.map(manager => (manager.id === id ? { ...manager, [field]: value } : manager))
    );
  };

  // 사원 검색 팝업 열기
  const handleEmployeeSearch = (id: string) => {
    setCurrentManagerId(id);
    setEmployeeSearchOpen(true);
  };

  // 사원 검색 팝업 닫기
  const handleEmployeeSearchClose = () => {
    setEmployeeSearchOpen(false);
    setCurrentManagerId('');
  };

  // 사원 선택 완료
  const handleEmployeeSelect = (selectedEmployee: EmployeeSearchResult) => {
    if (currentManagerId) {
      setManagers(prev =>
        prev.map(manager =>
          manager.id === currentManagerId
            ? {
                ...manager,
                empNo: selectedEmployee.num,
                empName: selectedEmployee.username,
                position: selectedEmployee.jobRankCd,
              }
            : manager
        )
      );
    }
    handleEmployeeSearchClose();
  };

  // 부서 검색 팝업 열기
  const handleDepartmentSearchClick = (id: string) => {
    setCurrentOwnerDeptId(id);
    setDepartmentSearchOpen(true);
  };

  // 부서 검색 팝업 닫기
  const handleDepartmentSearchClose = () => {
    setDepartmentSearchOpen(false);
    setCurrentOwnerDeptId('');
  };

  // 부서 선택 완료
  const handleDepartmentSelect = (departments: Department | Department[]) => {
    if (currentOwnerDeptId) {
      // 단일 선택이므로 첫 번째 요소 또는 단일 객체 사용
      const selectedDepartment = Array.isArray(departments) ? departments[0] : departments;

      if (selectedDepartment) {
        setOwnerDepts(prev =>
          prev.map(dept =>
            dept.id === currentOwnerDeptId
              ? {
                  ...dept,
                  deptCode: selectedDepartment.deptCode,
                  deptName: selectedDepartment.deptName,
                }
              : dept
          )
        );
      }
    }
    handleDepartmentSearchClose();
  };

  // 폼 검증
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.positionName.trim()) {
      errors.positionName = '직책명을 입력해주세요.';
    }

    if (!formData.writeDeptCd.trim()) {
      errors.writeDeptCd = '작성부서를 선택해주세요.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 저장 핸들러
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    // 저장 전 폼 데이터 로깅 (디버깅용)
    console.log('저장할 폼 데이터:', formData);
    console.log('선택된 부서:', {
      코드: formData.writeDeptCd,
      이름: formData.writeDeptName,
    });

    const positionRequestData = {
      positionName: formData.positionName,
      writeDeptCd: formData.writeDeptCd,
      ownerDeptCds: ownerDepts.map(d => d.deptCode).filter(Boolean),
      meetingBodyIds: meetings.map(m => m.meetingBodyId).filter(Boolean),
      adminIds: managers.map(m => m.empNo).filter(Boolean),
    };

    try {
      let response: PositionData;
      console.log(positionRequestData, mode, 'test 4');
      if (mode === 'create') {
        response = await apiClient.post('/positions', positionRequestData);
      } else {
        response = await apiClient.put(`/positions/${positionId}`, positionRequestData);
      }
      console.log(response, 'test 5');
      if (onSave) {
        onSave(response); // ← 백엔드 응답 객체를 넘김
      }
      onClose();
    } catch (err) {
      setError('저장 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 수정 모드로 전환 핸들러
  const handleEditMode = () => {
    if (onChangeMode) {
      onChangeMode('edit');
    }
  };

  // 다이얼로그 액션 버튼
  const renderActions = () => {
    if (mode === 'view') {
      return (
        <>
          <Button
            onClick={handleEditMode}
            variant='contained'
            sx={{
              backgroundColor: 'var(--bank-warning)',
              '&:hover': { backgroundColor: 'var(--bank-warning-dark)' },
            }}
          >
            수정
          </Button>
          <Button onClick={onClose} variant='outlined'>
            닫기
          </Button>
        </>
      );
    }

    return (
      <>
        <Button onClick={onClose} variant='outlined' disabled={loading}>
          취소
        </Button>
        <Button
          onClick={handleSave}
          variant='contained'
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {mode === 'create' ? '등록' : '저장'}
        </Button>
      </>
    );
  };

  return (
    <Dialog
      open={open}
      title={getDialogTitle()}
      maxWidth='lg'
      onClose={onClose}
      disableBackdropClick={loading}
      actions={renderActions()}
    >
      <Box sx={{ mt: 2 }}>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* 직책 */}
          <Box>
            <TextField
              fullWidth
              label='직책명 *'
              value={formData.positionName}
              onChange={handleInputChange('positionName')}
              error={!!validationErrors.positionName}
              helperText={validationErrors.positionName}
              disabled={mode === 'view'}
              placeholder='직책명을 입력하세요'
            />
          </Box>

          {/* 책무기술서 작성 부서 */}
          <Box>
            <FormControl fullWidth error={!!validationErrors.writeDeptCd}>
              <InputLabel>작성부서 *</InputLabel>
              <Select
                value={formData.writeDeptCd}
                label='작성부서 *'
                onChange={handleInputChange('writeDeptCd')}
                disabled={mode === 'view' || departmentsLoading}
              >
                <MenuItem value=''>선택하세요</MenuItem>
                {departmentsLoading ? (
                  <MenuItem disabled>로딩 중...</MenuItem>
                ) : departments.length > 0 ? (
                  departments.map(dept => (
                    <MenuItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </MenuItem>
                  ))
                ) : (
                  getDeptCodes().map(code => (
                    <MenuItem key={code.code} value={code.code}>
                      {code.codeName}
                    </MenuItem>
                  ))
                )}
              </Select>
              {departmentsError && (
                <Box sx={{ color: 'warning.main', fontSize: '0.75rem', mt: 0.5 }}>
                  {departmentsError} (공통코드 사용 중)
                </Box>
              )}
              {validationErrors.writeDeptCd && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                  {validationErrors.writeDeptCd}
                </Box>
              )}
            </FormControl>
          </Box>

          {/* 소관부서 */}
          <Box>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
            >
              <Box sx={{ fontWeight: 'bold', fontSize: '1rem' }}>소관부서</Box>
              {mode !== 'view' && (
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<AddIcon />}
                  onClick={addOwnerDept}
                  sx={{ minWidth: 'auto' }}
                >
                  추가
                </Button>
              )}
            </Box>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', width: 430 }}>부서코드</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>부서명</TableCell>
                    {mode !== 'view' && (
                      <TableCell sx={{ fontWeight: 'bold', width: 80 }}>작업</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ownerDepts.map(dept => (
                    <TableRow key={dept.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            fullWidth
                            size='small'
                            value={dept.deptCode}
                            disabled
                            placeholder='부서를 선택하세요'
                          />
                          {mode !== 'view' && (
                            <Button
                              size='small'
                              variant='outlined'
                              onClick={() => handleDepartmentSearchClick(dept.id)}
                              sx={{ minWidth: 80, fontSize: '0.75rem' }}
                            >
                              검색
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size='small'
                          value={dept.deptName}
                          disabled
                          placeholder='부서를 선택하면 자동 입력됩니다'
                        />
                      </TableCell>
                      {mode !== 'view' && (
                        <TableCell>
                          <IconButton
                            size='small'
                            onClick={() => removeOwnerDept(dept.id)}
                            disabled={ownerDepts.length === 1}
                            color='error'
                          >
                            <RemoveIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* 주관회의체 */}
          <Box>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
            >
              <Box sx={{ fontWeight: 'bold', fontSize: '1rem' }}>주관회의체</Box>
              {mode !== 'view' && (
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<AddIcon />}
                  onClick={addMeeting}
                  sx={{ minWidth: 'auto' }}
                >
                  추가
                </Button>
              )}
            </Box>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>회의체</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>위원장/위원</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>개최주기</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>주요 심의·의결사항</TableCell>
                    {mode !== 'view' && (
                      <TableCell sx={{ fontWeight: 'bold', width: 80 }}>작업</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {meetings.map(meeting => (
                    <TableRow key={meeting.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            fullWidth
                            size='small'
                            value={meeting.meetingBodyName}
                            onChange={e =>
                              handleMeetingChange(meeting.id, 'meetingBodyName', e.target.value)
                            }
                            disabled={mode === 'view'}
                            placeholder='회의체명을 입력하세요'
                          />
                          {mode !== 'view' && (
                            <Button
                              size='small'
                              variant='outlined'
                              onClick={() => handleMeetingSearchClick(meeting.id)}
                              sx={{ minWidth: 80, fontSize: '0.75rem' }}
                            >
                              검색
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <FormControl fullWidth size='small'>
                          <Select
                            value={meeting.memberGubun}
                            onChange={e =>
                              handleMeetingChange(meeting.id, 'memberGubun', e.target.value)
                            }
                            disabled={mode === 'view'}
                            displayEmpty
                          >
                            <MenuItem value=''>선택하세요</MenuItem>
                            {getMebGubunCodes().map(code => (
                              <MenuItem key={code.code} value={code.code}>
                                {code.codeName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell sx={{ width: 120 }}>
                        <TextField
                          size='small'
                          value={meeting.meetingPeriod}
                          disabled
                          placeholder='자동 입력'
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size='small'
                          value={meeting.deliberationContent}
                          disabled
                          placeholder='자동 입력'
                        />
                      </TableCell>
                      {mode !== 'view' && (
                        <TableCell>
                          <IconButton
                            size='small'
                            onClick={() => removeMeeting(meeting.id)}
                            disabled={meetings.length === 1}
                            color='error'
                          >
                            <RemoveIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* 책무기술서 작성 관리자 */}
          <Box>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
            >
              <Box sx={{ fontWeight: 'bold', fontSize: '1rem' }}>책무기술서 작성 관리자</Box>
              {mode !== 'view' && (
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<AddIcon />}
                  onClick={addManager}
                  sx={{ minWidth: 'auto' }}
                >
                  추가
                </Button>
              )}
            </Box>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>사번</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>성명</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>직급</TableCell>
                    {mode !== 'view' && (
                      <TableCell sx={{ fontWeight: 'bold', width: 80 }}>작업</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {managers.map(manager => (
                    <TableRow key={manager.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            fullWidth
                            size='small'
                            value={manager.empNo}
                            onChange={e => handleManagerChange(manager.id, 'empNo', e.target.value)}
                            disabled={mode === 'view'}
                            placeholder='사번을 입력하세요'
                          />
                          {mode !== 'view' && (
                            <Button
                              size='small'
                              variant='outlined'
                              onClick={() => handleEmployeeSearch(manager.id)}
                              sx={{ minWidth: 80, fontSize: '0.75rem' }}
                            >
                              검색
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size='small'
                          value={manager.empName}
                          disabled
                          placeholder='자동 입력'
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          fullWidth
                          size='small'
                          value={manager.position}
                          disabled
                          placeholder='자동 입력'
                        />
                      </TableCell>
                      {mode !== 'view' && (
                        <TableCell>
                          <IconButton
                            size='small'
                            onClick={() => removeManager(manager.id)}
                            disabled={managers.length === 1}
                            color='error'
                          >
                            <RemoveIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>

      {/* 부서 검색 다이얼로그 */}
      <DepartmentSearchPopup
        open={departmentSearchOpen}
        onClose={handleDepartmentSearchClose}
        onSelect={handleDepartmentSelect}
        title='소관부서 검색'
        multiSelect={false}
      />

      {/* 회의체 검색 다이얼로그 */}
      <MeetingBodySearchDialog
        open={meetingSearchOpen}
        onClose={handleMeetingSearchClose}
        onSelect={handleMeetingBodySelect}
      />

      {/* 사원 검색 다이얼로그 */}
      <EmployeeSearchPopup
        open={employeeSearchOpen}
        onClose={handleEmployeeSearchClose}
        onSelect={handleEmployeeSelect}
      />
    </Dialog>
  );
};

export default PositionDialog;
