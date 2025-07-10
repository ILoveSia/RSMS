/**
 * 직책 등록/수정/조회 다이얼로그 컴포넌트
 */
import apiClient from '@/app/common/api/client';
import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
import type { EmployeeSearchResult } from '@/domains/common/components/search';
import {
  DepartmentSearchPopup,
  EmployeeSearchPopup,
  type Department,
} from '@/domains/common/components/search';
import { MeetingBodySearchDialog } from '@/domains/common/components/search';
import type { MeetingBodySearchResult } from '@/domains/common/components/search';
import { Dialog } from '@/shared/components/modal';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
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
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';

// ApiSuccessResponse 인터페이스 제거 - apiClient가 이미 unwrap함

export interface PositionData {
  positionsId: string;
  positionName: string;
  writeDeptCd: string;
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

  const [formData, setFormData] = useState<FormData>({
    positionName: '',
    writeDeptCd: '',
  });

  // 소관부서 목록
  const [ownerDepts, setOwnerDepts] = useState<OwnerDept[]>([
    { id: '1', deptCode: '', deptName: '' },
  ]);

  // 책무기술서 작성 부서
  const [writeDept, setWriteDept] = useState<{ deptCode: string; deptName: string }>({
    deptCode: '',
    deptName: '',
  });

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

  // 부서 검색 다이얼로그 상태 (소관부서용)
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false);
  const [currentOwnerDeptId, setCurrentOwnerDeptId] = useState<string>('');

  // 부서 검색 다이얼로그 상태 (작성부서용)
  const [writeDeptSearchOpen, setWriteDeptSearchOpen] = useState(false);

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

  // 컴포넌트 마운트 시 localStorage에서 공통코드 복원
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
  }, [allCodes, setAllCodes]);

  // 폼 데이터 초기화 및 상세 데이터 로드
  useEffect(() => {
    const fetchPositionDetails = async (id: number) => {
      setLoading(true);
      setError(null);
      try {
        console.log('직책 상세조회 요청:', id);
        const positionData: PositionData = await apiClient.get(`/positions/${id}`);
        console.log('직책 상세조회 응답:', positionData);

        setFormData({
          positionName: positionData.positionName || '',
          writeDeptCd: positionData.writeDeptCd || '',
        });

        // 작성부서 정보 설정
        const writeDeptCode = positionData.writeDeptCd || '';
        const writeDeptName =
          getDeptCodes().find(code => code.code === writeDeptCode)?.codeName || '';
        console.log('작성부서 설정:', { writeDeptCode, writeDeptName, allCodes: getDeptCodes() });
        setWriteDept({
          deptCode: writeDeptCode,
          deptName: writeDeptName,
        });
        const ownerDeptsData = positionData.ownerDepts || [];
        const meetingsData = positionData.meetings || [];
        const managersData = positionData.managers || [];

        setOwnerDepts(
          ownerDeptsData.length > 0
            ? ownerDeptsData.map((d, i) => ({ id: String(i + 1), ...d }))
            : [{ id: '1', deptCode: '', deptName: '' }]
        );
        setMeetings(
          meetingsData.length > 0
            ? meetingsData.map((m, i) => {
                // memberGubun 값 매핑 (백엔드 데이터와 프론트엔드 코드 불일치 해결)
                let mappedMemberGubun = m.memberGubun;
                if (m.memberGubun === 'GUBUN01' || m.memberGubun === 'GB01') {
                  mappedMemberGubun = 'MG01'; // 위원장으로 매핑
                } else if (m.memberGubun === 'GUBUN02' || m.memberGubun === 'GB02') {
                  mappedMemberGubun = 'MG02'; // 위원으로 매핑
                } else if (!getMebGubunCodes().find(code => code.code === m.memberGubun)) {
                  mappedMemberGubun = ''; // 매칭되지 않는 값은 빈 값으로 설정
                }

                console.log('회의체 memberGubun 매핑:', {
                  original: m.memberGubun,
                  mapped: mappedMemberGubun,
                  availableCodes: getMebGubunCodes().map(c => c.code),
                });

                return {
                  id: String(i + 1),
                  ...m,
                  memberGubun: mappedMemberGubun,
                };
              })
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
            ? managersData.map((m, i) => ({ id: String(i + 1), ...m }))
            : [{ id: '1', empNo: '', empName: '', position: '' }]
        );
      } catch (err) {
        console.error('직책 상세조회 오류:', err);
        setError('상세 정보를 불러오는 중 오류가 발생했습니다.');
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
        setWriteDept({ deptCode: '', deptName: '' });
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
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));

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

  // 부서 선택 완료 (소관부서용)
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

  // 작성부서 검색 팝업 닫기
  const handleWriteDeptSearchClose = () => {
    setWriteDeptSearchOpen(false);
  };

  // 작성부서 선택 완료
  const handleWriteDeptSelect = (departments: Department | Department[]) => {
    // 단일 선택이므로 첫 번째 요소 또는 단일 객체 사용
    const selectedDepartment = Array.isArray(departments) ? departments[0] : departments;

    if (selectedDepartment) {
      console.log('작성부서 선택:', selectedDepartment);
      setWriteDept({
        deptCode: selectedDepartment.deptCode,
        deptName: selectedDepartment.deptName,
      });
      // formData도 동기화
      setFormData(prev => ({
        ...prev,
        writeDeptCd: selectedDepartment.deptCode,
      }));
      // 유효성 검사 오류 제거
      if (validationErrors.writeDeptCd) {
        setValidationErrors(prev => ({
          ...prev,
          writeDeptCd: '',
        }));
      }
    }
    handleWriteDeptSearchClose();
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

    const positionRequestData = {
      positionsNm: formData.positionName,
      writeDeptCd: formData.writeDeptCd,
      ownerDeptCds: ownerDepts.map(d => d.deptCode).filter(Boolean),
      meetingBodyIds: meetings.map(m => m.meetingBodyId).filter(Boolean),
      adminIds: managers.map(m => m.empNo).filter(Boolean),
    };

    try {
      console.log('직책 저장 요청:', { mode, positionId, data: positionRequestData });
      let responseData: PositionData;
      if (mode === 'create') {
        responseData = await apiClient.post('/positions', positionRequestData);
      } else {
        responseData = await apiClient.put(`/positions/${positionId}`, positionRequestData);
      }
      console.log('직책 저장 응답:', responseData);

      if (onSave) {
        onSave(responseData);
      }
      onClose();
    } catch (err) {
      console.error('직책 저장 오류:', err);
      setError('저장 중 오류가 발생했습니다.');
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
          <Button onClick={onClose} variant='outlined'>
            닫기
          </Button>
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
            <Box sx={{ fontWeight: 'bold', fontSize: '1rem', mb: 1 }}>직책</Box>
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
            <Box sx={{ fontWeight: 'bold', fontSize: '1rem', mb: 1 }}>책무기술서 작성 부서</Box>
            <TableContainer component={Paper} variant='outlined'>
              <Table size='small'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold', width: 430 }}>부서코드</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>부서명</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          fullWidth
                          size='small'
                          value={writeDept.deptCode}
                          disabled
                          placeholder='부서를 선택하세요'
                          error={!!validationErrors.writeDeptCd}
                        />
                        {mode !== 'view' && (
                          <Button
                            size='small'
                            variant='outlined'
                            onClick={() => setWriteDeptSearchOpen(true)}
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
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size='small'
                        value={writeDept.deptName}
                        disabled
                        placeholder='부서를 선택하면 자동 입력됩니다'
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
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
                            value={
                              getMebGubunCodes().find(code => code.code === meeting.memberGubun)
                                ? meeting.memberGubun
                                : ''
                            }
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

      {/* 소관부서 검색 다이얼로그 */}
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
        onClose={handleWriteDeptSearchClose}
        onSelect={handleWriteDeptSelect}
        title='작성부서 검색'
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
