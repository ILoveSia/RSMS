/**
 * 인수인계 지정 다이얼로그
 * 인수인계 지정 등록/수정/조회 기능을 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 인수인계 지정 다이얼로그 처리만 담당
 * - Open/Closed: 새로운 필드나 검증 추가 시 확장 가능
 * - Liskov Substitution: React 컴포넌트 인터페이스 준수
 * - Interface Segregation: 다이얼로그 관련 기능만 제공
 * - Dependency Inversion: 훅과 컴포넌트에 의존
 */

import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
import {
  DepartmentSearchPopup,
  EmployeeSearchPopup,
  type Department,
  type Employee,
} from '@/domains/common/components/search';
import type { SelectOption } from '@/shared/types/common';
import { Search as SearchIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  CircularProgress,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import { Select } from '@/shared/components/ui/form';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import { TextField } from '@/shared/components/ui/data-display/';
import React, { useCallback, useEffect, useState } from 'react';
import { handoverApi, type HandoverAssignmentDto } from '../api/handoverApi';

interface HandoverAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  assignmentId?: number;
  onSuccess?: () => void;
}

interface FormData {
  assignmentTitle: string;
  assignmentType: string;
  assignorEmpNo: string;
  assignorName: string;
  assigneeEmpNo: string;
  assigneeName: string;
  deptCd: string;
  deptName: string;
  positionCd: string;
  positionName: string;
  targetDate: string;
  description: string;
}

const initialFormData: FormData = {
  assignmentTitle: '',
  assignmentType: '',
  assignorEmpNo: '',
  assignorName: '',
  assigneeEmpNo: '',
  assigneeName: '',
  deptCd: '',
  deptName: '',
  positionCd: '',
  positionName: '',
  targetDate: '',
  description: '',
};

const HandoverAssignmentDialog: React.FC<HandoverAssignmentDialogProps> = ({
  open,
  onClose,
  mode: initialMode,
  assignmentId,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>(initialMode);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 팝업 상태들
  const [assignorSearchOpen, setAssignorSearchOpen] = useState(false);
  const [assigneeSearchOpen, setAssigneeSearchOpen] = useState(false);
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false);

  // 공통코드 Store에서 데이터 가져오기
  const { data: allCodes } = useReduxState<{ data: CommonCode[] } | CommonCode[]>(
    'codeStore/allCodes'
  );

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';

  // 공통코드 배열 추출 함수
  const getCodesArray = useCallback((): CommonCode[] => {
    if (!allCodes) return [];
    if (Array.isArray(allCodes)) {
      return allCodes;
    }
    if (typeof allCodes === 'object' && 'data' in allCodes && Array.isArray(allCodes.data)) {
      return allCodes.data;
    }
    return [];
  }, [allCodes]);

  // 공통코드 옵션 생성 함수
  const getCommonCodeOptions = useCallback(
    (groupCode: string): SelectOption[] => {
      const codes = getCodesArray();

      // 인수인계 유형 처리
      if (groupCode === 'ASSIGNMENT_TYPE') {
        return [
          { value: 'POSITION_CHANGE', label: '직위변경' },
          { value: 'DEPARTMENT_CHANGE', label: '부서이동' },
          { value: 'RETIREMENT', label: '퇴직' },
          { value: 'NEW_ASSIGNMENT', label: '신규배치' },
        ];
      }

      // 직위 코드 처리
      if (groupCode === 'POSITION') {
        return [
          { value: 'POS001', label: '부서장' },
          { value: 'POS002', label: '팀장' },
          { value: 'POS003', label: '선임' },
          { value: 'POS004', label: '대리' },
          { value: 'POS005', label: '사원' },
        ];
      }

      // 기타 공통코드 처리
      const filteredCodes = codes.filter(
        code => code.groupCode === groupCode && code.useYn === 'Y'
      );

      const options = filteredCodes
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(code => ({
          value: code.code,
          label: code.codeName,
        }));

      return options;
    },
    [getCodesArray]
  );

  // 데이터 로드 함수
  const loadAssignmentData = useCallback(async () => {
    if (!assignmentId) return;

    setLoading(true);
    setError(null);
    try {
      // TODO: 실제 API 호출로 대체
      // const data = await handoverApi.getAssignment(assignmentId);
      
      // Mock 데이터
      const mockData: HandoverAssignmentDto = {
        assignmentId,
        assignmentTitle: '정보기술부 부서장 인수인계',
        assignmentType: 'POSITION_CHANGE',
        assignorEmpNo: 'E001',
        assignorName: '김인계',
        assigneeEmpNo: 'E002',
        assigneeName: '이인수',
        deptCd: 'IT001',
        deptName: '정보기술부',
        positionCd: 'POS001',
        positionName: '부서장',
        status: 'IN_PROGRESS',
        targetDate: '2024-02-01',
        description: 'IT부서장 직위 변경에 따른 인수인계',
        assignorApprovalStatus: 'APPROVED',
        assigneeApprovalStatus: 'PENDING',
        managerApprovalStatus: 'PENDING',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
      };

      setFormData({
        assignmentTitle: mockData.assignmentTitle,
        assignmentType: mockData.assignmentType,
        assignorEmpNo: mockData.assignorEmpNo,
        assignorName: mockData.assignorName || '',
        assigneeEmpNo: mockData.assigneeEmpNo,
        assigneeName: mockData.assigneeName || '',
        deptCd: mockData.deptCd,
        deptName: mockData.deptName || '',
        positionCd: mockData.positionCd || '',
        positionName: mockData.positionName || '',
        targetDate: mockData.targetDate || '',
        description: mockData.description || '',
      });

    } catch (err) {
      console.error('Failed to load assignment data:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  // initialMode이 변경될 때 내부 mode 상태 업데이트
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // 데이터 로드
  useEffect(() => {
    if (open && assignmentId && (isEditMode || isViewMode)) {
      loadAssignmentData();
    } else if (open && isCreateMode) {
      setFormData(initialFormData);
      setError(null);
    }
  }, [
    open,
    assignmentId,
    mode,
    isEditMode,
    isViewMode,
    isCreateMode,
    loadAssignmentData,
  ]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.assignmentTitle.trim()) {
      setError('인수인계 제목을 입력해주세요.');
      return false;
    }
    if (!formData.assignmentType) {
      setError('인수인계 유형을 선택해주세요.');
      return false;
    }
    if (!formData.assignorEmpNo.trim()) {
      setError('인계자를 선택해주세요.');
      return false;
    }
    if (!formData.assigneeEmpNo.trim()) {
      setError('인수자를 선택해주세요.');
      return false;
    }
    if (!formData.deptCd.trim()) {
      setError('부서를 선택해주세요.');
      return false;
    }
    if (!formData.targetDate.trim()) {
      setError('목표일자를 선택해주세요.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      const requestData = {
        assignmentTitle: formData.assignmentTitle,
        assignmentType: formData.assignmentType,
        assignorEmpNo: formData.assignorEmpNo,
        assigneeEmpNo: formData.assigneeEmpNo,
        deptCd: formData.deptCd,
        positionCd: formData.positionCd,
        targetDate: formData.targetDate,
        description: formData.description,
        status: 'PENDING',
      };

      if (isCreateMode) {
        // TODO: 실제 API 호출로 대체
        // await handoverApi.createAssignment(requestData);
      } else if (isEditMode && assignmentId) {
        // TODO: 실제 API 호출로 대체
        // await handoverApi.updateAssignment(assignmentId, requestData);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save assignment:', err);
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 인계자 선택 핸들러
  const handleAssignorSelect = (employee: Employee) => {
    setFormData(prev => ({
      ...prev,
      assignorEmpNo: employee.empNo,
      assignorName: employee.empName,
    }));
    setAssignorSearchOpen(false);
  };

  // 인수자 선택 핸들러
  const handleAssigneeSelect = (employee: Employee) => {
    setFormData(prev => ({
      ...prev,
      assigneeEmpNo: employee.empNo,
      assigneeName: employee.empName,
    }));
    setAssigneeSearchOpen(false);
  };

  // 부서 선택 핸들러
  const handleDepartmentSelect = (department: Department | Department[]) => {
    const dept = Array.isArray(department) ? department[0] : department;
    setFormData(prev => ({
      ...prev,
      deptCd: dept.deptCode,
      deptName: dept.deptName,
    }));
    setDepartmentSearchOpen(false);
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleModeChange = (newMode: 'create' | 'edit' | 'view') => {
    setMode(newMode);
  };

  return (
    <>
      <BaseDialog
        open={open}
        onClose={handleClose}
        onSave={handleSave}
        onModeChange={handleModeChange}
        maxWidth='md'
        mode={mode}
        title={mode === 'create' ? '인수인계 지정 등록' : mode === 'edit' ? '인수인계 지정 수정' : '인수인계 지정 조회'}
      >
        <DialogContent sx={{ 
          p: 3,
          // view 모드에서 텍스트 스타일 진하게 통일
          ...(isViewMode && {
            '& .MuiInputBase-input[disabled]': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            },
            '& .MuiInputBase-input.Mui-disabled': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            },
            '& .MuiTextField-root .MuiInputBase-input': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            },
            '& .MuiSelect-select.Mui-disabled': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            },
            '& .MuiSelect-select[disabled]': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            },
            '& .MuiInputBase-inputMultiline[disabled]': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            },
            '& .MuiInputBase-inputMultiline.Mui-disabled': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            },
            '& .MuiInputLabel-root.Mui-disabled': {
              color: '#666 !important',
              opacity: '1 !important',
            },
            '& .MuiFormHelperText-root': {
              color: '#999 !important',
              opacity: '1 !important',
            },
            '& .MuiOutlinedInput-input[disabled]': {
              fontWeight: '600 !important',
              color: '#1a1a1a !important',
              WebkitTextFillColor: '#1a1a1a !important',
              opacity: '1 !important',
            }
          })
        }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {error && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={2}>
                {/* 인수인계 제목 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='인수인계 제목 *'
                    value={formData.assignmentTitle}
                    onChange={e => handleInputChange('assignmentTitle', e.target.value)}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* 인수인계 유형 */}
                <Grid item xs={12} sm={6}>
                  <Select
                    value={formData.assignmentType}
                    label='인수인계 유형 *'
                    options={[
                      { value: '', label: '선택하세요' },
                      ...getCommonCodeOptions('ASSIGNMENT_TYPE')
                    ]}
                    onChange={(value) => handleInputChange('assignmentType', value as string)}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* 목표일자 */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='목표일자 *'
                    type='date'
                    value={formData.targetDate}
                    onChange={e => handleInputChange('targetDate', e.target.value)}
                    disabled={isViewMode}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                {/* 인계자 */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label='인계자 *'
                      value={formData.assignorName || `${formData.assignorEmpNo}`}
                      disabled
                      placeholder='인계자를 선택하세요'
                      helperText={
                        formData.assignorEmpNo ? `사번: ${formData.assignorEmpNo}` : ''
                      }
                    />
                    {!isViewMode && (
                      <Button
                        variant='outlined'
                        onClick={() => setAssignorSearchOpen(true)}
                        sx={{ minWidth: 100 }}
                        startIcon={<SearchIcon />}
                      >
                        조회
                      </Button>
                    )}
                  </Box>
                </Grid>

                {/* 인수자 */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label='인수자 *'
                      value={formData.assigneeName || `${formData.assigneeEmpNo}`}
                      disabled
                      placeholder='인수자를 선택하세요'
                      helperText={
                        formData.assigneeEmpNo ? `사번: ${formData.assigneeEmpNo}` : ''
                      }
                    />
                    {!isViewMode && (
                      <Button
                        variant='outlined'
                        onClick={() => setAssigneeSearchOpen(true)}
                        sx={{ minWidth: 100 }}
                        startIcon={<SearchIcon />}
                      >
                        조회
                      </Button>
                    )}
                  </Box>
                </Grid>

                {/* 부서명 */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label='부서명 *'
                      value={formData.deptName}
                      disabled
                      placeholder='부서를 선택하세요'
                      helperText={formData.deptCd ? `부서코드: ${formData.deptCd}` : ''}
                    />
                    {!isViewMode && (
                      <Button
                        variant='outlined'
                        onClick={() => setDepartmentSearchOpen(true)}
                        sx={{ minWidth: 100 }}
                        startIcon={<SearchIcon />}
                      >
                        조회
                      </Button>
                    )}
                  </Box>
                </Grid>

                {/* 직위 */}
                <Grid item xs={12} sm={6}>
                  <Select
                    value={formData.positionCd}
                    label='직위'
                    options={[
                      { value: '', label: '선택하세요' },
                      ...getCommonCodeOptions('POSITION')
                    ]}
                    onChange={(value) => handleInputChange('positionCd', value as string)}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* 설명 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='인수인계 설명'
                    value={formData.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    disabled={isViewMode}
                    multiline
                    rows={3}
                    placeholder='인수인계에 대한 상세 설명을 입력하세요.'
                  />
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
            {/* 추가 액션 버튼이 필요한 경우 여기에 추가 */}
          </Box>
        </DialogActions>
      </BaseDialog>

      {/* 인계자 조회 팝업 */}
      <EmployeeSearchPopup
        open={assignorSearchOpen}
        onClose={() => setAssignorSearchOpen(false)}
        onSelect={handleAssignorSelect}
        title='인계자 조회'
      />

      {/* 인수자 조회 팝업 */}
      <EmployeeSearchPopup
        open={assigneeSearchOpen}
        onClose={() => setAssigneeSearchOpen(false)}
        onSelect={handleAssigneeSelect}
        title='인수자 조회'
      />

      {/* 부서 조회 팝업 */}
      <DepartmentSearchPopup
        open={departmentSearchOpen}
        onClose={() => setDepartmentSearchOpen(false)}
        onSelect={handleDepartmentSelect}
        title='부서 조회'
        multiSelect={false}
      />
    </>
  );
};

export default HandoverAssignmentDialog;