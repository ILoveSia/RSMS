/**
 * 직책 등록/수정/조회 다이얼로그 컴포넌트
 */
import apiClient from '@/app/common/api/client';
import { useCommonCodes, getCodeNameSync } from '@/shared/utils/codeUtils';
import DepartmentApi from '@/domains/common/api/departmentApi';
import type { EmployeeSearchResult } from '@/domains/common/components/search';
import { DepartmentSearchPopup, type Department } from '@/domains/common/components/search';
import EmployeeSearchPopup from '@/domains/common/components/search/EmployeeSearchPopup';
import {
  MeetingBodySearchPopup,
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
// (removed unused ApiSuccessResponse)

export interface PositionData {
  positionsId: string;
  ledgerOrder: number; // 백엔드 엔티티에 맞춰 단수형으로 변경
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
  selectedLedgerOrder?: string; // 선택된 원장차수 전달
  onClose: () => void;
  onSave?: (position: PositionData) => void;
  onChangeMode?: (newMode: 'create' | 'edit' | 'view') => void;
}

interface FormData {
  positionName: string;
  writeDeptCd: string;
  writeDeptName?: string; // Optional field to store the department name
}

// (removed unused DepartmentOption)

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
  selectedLedgerOrder,
  onClose,
  onSave,
  onChangeMode,
}) => {
  // 공통코드 가져오기
  const allCodes = useCommonCodes();

  // 부서 데이터 상태
  const [departments, setDepartments] = useState<Array<{ value: string; label: string }>>([]);
  

  // Hook 결과를 컴포넌트 최상위에서 미리 계산 (조건부 Hook 호출 방지)
  const mebGubunCodes = React.useMemo(() => {
    return allCodes
      .filter(code => code.groupCode === 'MEB_GUBUN' && code.useYn === 'Y')
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [allCodes]);

  // (removed unused deptCodes)

  // 코드명 조회 함수를 useMemo로 안정화
  const getCodeNameStable = React.useCallback((groupCode: string, codeValue: string) => {
    return getCodeNameSync(allCodes, groupCode, codeValue);
  }, [allCodes]);

  // (removed unused getMebGubunCodes)

  // 부서 데이터 가져오기
  const fetchDepartments = async () => {
    try {
      const apiDepartments = await DepartmentApi.getActive();

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
        } catch (cacheError) {
          console.warn('부서 데이터 캐싱 실패:', cacheError);
          // 캐싱 실패는 치명적이지 않으므로 에러 상태로 설정하지 않음
        }
      } else {
        console.warn('부서 API 응답이 예상과 다릅니다:', apiDepartments);
      }
    } catch (err) {
      console.error('부서 목록 조회 실패:', err);
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
  const [writeDeptSearchOpen, setWriteDeptSearchOpen] = useState(false);
  // (removed unused convertApiDepartmentToComponent)
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

  // 컴포넌트 마운트 시 부서 데이터 캐싱
  useEffect(() => {
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
  }, []);

  // 폼 데이터 초기화 및 상세 데이터 로드
  useEffect(() => {
    const fetchPositionDetails = async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        const positionData: PositionData = await apiClient.get(`/positions/${id}`);
        if (positionData) {
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
                } else if (typeof deptName === 'object' && deptName !== null && 'departmentName' in deptName) {
                  writeDeptName = (deptName as any).departmentName || '';
                }
              } catch (deptErr) {
                console.warn('부서명 조회 실패:', deptErr);
                // 부서명 조회 실패 시 공통코드에서 찾기
                writeDeptName = getCodeNameStable('DEPT', positionData.writeDeptCd);
              }
            }
          }

          setFormData({
            positionName: positionData.positionName || '',
            writeDeptCd: positionData.writeDeptCd || '',
            writeDeptName: writeDeptName,
          });

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
                memberGubun: convertMemberGubun(m.memberGubun), // 데이터 변환
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
  }, [open, mode, positionId, departments]);

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

    // 사번 입력 시 자동으로 사원 정보 조회
    if (field === 'empNo' && value.trim()) {
      fetchEmployeeInfo(id, value.trim());
    }
  };

  // 사번으로 사원 정보 조회
  const fetchEmployeeInfo = async (managerId: string, empNo: string) => {
    try {
      const response = await apiClient.get(`/users/num/${empNo}`);
      if (response && typeof response === 'object') {
        const userData = response as any;
        // 직급 코드를 직급명으로 변환
        const positionName = getJobRankName(userData.jobRankCd);

        setManagers(prev =>
          prev.map(manager =>
            manager.id === managerId
              ? {
                ...manager,
                empName: userData.username || '',
                position: positionName,
              }
              : manager
          )
        );
      }
    } catch (err) {
      console.error('사원 정보 조회 실패:', err);
      // 사원 정보 조회 실패 시 empName과 position을 초기화
      setManagers(prev =>
        prev.map(manager =>
          manager.id === managerId
            ? {
              ...manager,
              empName: '',
              position: '',
            }
            : manager
        )
      );
    }
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
      // 직급 코드를 직급명으로 변환
      const positionName = getJobRankName(selectedEmployee.jobRankCd);

      setManagers(prev =>
        prev.map(manager =>
          manager.id === currentManagerId
            ? {
              ...manager,
              empNo: selectedEmployee.num,
              empName: selectedEmployee.username,
              position: positionName,
            }
            : manager
        )
      );
    }
    handleEmployeeSearchClose();
  };

  // 직급 코드를 직급명으로 변환하는 함수
  const getJobRankName = React.useCallback((jobRankCd: string): string => {
    if (!jobRankCd) return '';
    return getCodeNameStable('JOB_RANK', jobRankCd);
  }, [getCodeNameStable]);

  // memberGubun 코드 변환 함수
  const convertMemberGubun = (memberGubun: string): string => {
    if (!memberGubun) return '';
    
    // 기존 코드 매핑
    const codeMapping: Record<string, string> = {
      'GUBUN01': 'MG01',
      'GB01': 'MG01',
      'GB02': 'MG02',
      // 필요에 따라 추가 매핑
    };
    
    // 매핑된 코드가 있으면 변환, 없으면 원래 값 반환
    return codeMapping[memberGubun] || memberGubun;
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

  const openWriteDeptSearch = () => {
    setWriteDeptSearchOpen(true);
  };

  const closeWriteDeptSearch = () => {
    setWriteDeptSearchOpen(false);
  };

  const handleWriteDeptSelect = (selected: Department | Department[]) => {
    const dept = Array.isArray(selected) ? selected[0] : selected;
    if (dept) {
      setFormData(prev => ({
        ...prev,
        writeDeptCd: dept.deptCode,
        writeDeptName: dept.deptName,
      }));
    }
    closeWriteDeptSearch();
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

    try {
      let positionRequestData: any = {
        positionName: formData.positionName,
        writeDeptCd: formData.writeDeptCd,
        ownerDeptCds: ownerDepts.map(d => d.deptCode).filter(Boolean),
        meetingBodyIds: meetings.map(m => m.meetingBodyId).filter(Boolean),
        adminIds: managers.map(m => m.empNo).filter(Boolean),
      };

      // 신규 등록 시에만 selectedLedgerOrder로 ledger_orders_id 조회하여 추가
      if (mode === 'create' && selectedLedgerOrder && selectedLedgerOrder !== 'ALL') {
        try {
          // positionApi import 필요
          const { positionApi } = await import('../api/positionApi');
          const ledgerOrdersId = await positionApi.getLedgerOrdersIdByTitle(selectedLedgerOrder);
          positionRequestData.ledgerOrder = ledgerOrdersId; // 백엔드 DTO에 맞춰 ledgerOrder로 변경
        } catch (ledgerOrderError) {
          console.error('❌ ledger_orders_id 조회 실패:', ledgerOrderError);
          setError(`원장차수 정보 조회에 실패했습니다: ${selectedLedgerOrder}`);
          return;
        }
      }

      let response: PositionData;
      if (mode === 'create') {
        response = await apiClient.post('/positions', positionRequestData);
      } else {
        response = await apiClient.put(`/positions/${positionId}`, positionRequestData);
      }
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
      maxWidth='md'
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
              mode={mode === 'view' ? 'readonly' : 'editable'}
              placeholder='직책명을 입력하세요'
            />
          </Box>

          {/* 책무기술서 작성 부서 */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField
                label='작성부서 *'
                fullWidth
                size='small'
                value={formData.writeDeptName || ''}
                mode='readonly'
                readonlyPlaceholder='부서를 선택하세요'
              />
              {mode !== 'view' && (
                <Button
                  size='small'
                  variant='outlined'
                  onClick={openWriteDeptSearch}
                  sx={{ minWidth: 80, fontSize: '0.75rem' }}
                >
                  검색
                </Button>
              )}
            </Box>
            {validationErrors.writeDeptCd && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                {validationErrors.writeDeptCd}
              </Box>
            )}
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
                            label=""
                            fullWidth
                            size='small'
                            value={dept.deptCode}
                            mode="readonly"
                            readonlyPlaceholder="부서를 선택하세요"
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
                          label=""
                          fullWidth
                          size='small'
                          value={dept.deptName}
                          mode="readonly"
                          readonlyPlaceholder="부서를 선택하면 자동 입력됩니다"
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
                            label=""
                            fullWidth
                            size='small'
                            value={meeting.meetingBodyName}
                            mode="readonly"
                            readonlyPlaceholder="회의체를 검색하여 선택하세요"
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
                            value={(() => {
                              const hasValue = mebGubunCodes.some(code => code.code === meeting.memberGubun);
                              return hasValue ? meeting.memberGubun : '';
                            })()}
                            onChange={e =>
                              handleMeetingChange(meeting.id, 'memberGubun', e.target.value)
                            }
                            disabled={mode === 'view'}
                            displayEmpty
                          >
                            <MenuItem value=''>선택하세요</MenuItem>
                            {mebGubunCodes.map(code => (
                              <MenuItem key={code.code} value={code.code}>
                                {code.codeName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell sx={{ width: 120 }}>
                        <TextField
                          label=""
                          size='small'
                          value={getCodeNameStable('PERIOD', meeting.meetingPeriod)}
                          mode="readonly"
                          readonlyPlaceholder="자동 입력"
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          label=""
                          fullWidth
                          size='small'
                          value={meeting.deliberationContent}
                          mode="readonly"
                          readonlyPlaceholder="자동 입력"
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
                            label=""
                            fullWidth
                            size='small'
                            value={manager.empNo}
                            onChange={e => handleManagerChange(manager.id, 'empNo', e.target.value)}
                            mode={mode === 'view' ? 'readonly' : 'editable'}
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
                          label=""
                          fullWidth
                          size='small'
                          value={manager.empName}
                          mode="readonly"
                          readonlyPlaceholder="자동 입력"
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          label=""
                          fullWidth
                          size='small'
                          value={manager.position}
                          mode="readonly"
                          readonlyPlaceholder="자동 입력"
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

      {/* 작성부서 검색 다이얼로그 */}
      <DepartmentSearchPopup
        open={writeDeptSearchOpen}
        onClose={closeWriteDeptSearch}
        onSelect={handleWriteDeptSelect}
        title='작성부서 검색'
        multiSelect={false}
      />

      {/* 회의체 검색 다이얼로그 */}
      <MeetingBodySearchPopup
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
