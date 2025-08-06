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
import { getDepartmentNameSync, useDepartments, getEmployeeNameSync } from '@/shared/utils/codeUtils';
import {
  DepartmentSearchPopup,
  EmployeeSearchPopup,
  type Department,
  type EmployeeSearchResult,
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
import apiClient from '@/app/common/api/client';

interface HandoverAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  assignmentId?: number;
  onSuccess?: () => void;
}

interface FormData {
  // assignmentTitle: string;
  assignmentType: string;
  assignorEmpNo: string;
  assignorName: string;
  assigneeEmpNo: string;
  assigneeName: string;
  assignorDeptCd: string;
  assignorDeptName: string;
  assigneeDeptCd: string;
  assigneeDeptName: string;
  assignorPositionCd: string;
  assigneePositionCd: string;
  targetDate: string;
  description: string;
}

const initialFormData: FormData = {
  // assignmentTitle: '',
  assignmentType: '',
  assignorEmpNo: '',
  assignorName: '',
  assigneeEmpNo: '',
  assigneeName: '',
  assignorDeptCd: '',
  assignorDeptName: '',
  assigneeDeptCd: '',
  assigneeDeptName: '',
  assignorPositionCd: '',
  assigneePositionCd: '',
  targetDate: '',
  description: '',
};

const HandoverAssignmentDialog: React.FC<HandoverAssignmentDialogProps> = ({
  open,
  onClose,
  mode: initialMode,
  assignmentId,
  assignmentData,
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

  // 부서 정보 가져오기
  const departments = useDepartments();

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

  // initialMode 또는 assignmentData가 변경될 때 상태 업데이트
  useEffect(() => {
    setMode(initialMode);
    if (open) {
      if ((initialMode === 'edit' || initialMode === 'view') && assignmentData) {
        console.log(assignmentData)
        setLoading(true);
        
        // 사원 정보 비동기 조회
        const loadEmployeeInfo = async () => {
          try {
            const [assignorResponse, assigneeResponse] = await Promise.all([
              apiClient.get(`/users/num/${assignmentData.assignorEmpNo}`),
              apiClient.get(`/users/num/${assignmentData.assigneeEmpNo}`)
            ]);
            console.log(assignorResponse)
            console.log(assigneeResponse)
            setFormData({
              assignmentType: assignmentData.assignmentType,
              assignorEmpNo: assignmentData.assignorEmpNo,
              assignorName:assignmentData.assignorName || '',
              assigneeEmpNo: assignmentData.assigneeEmpNo,
              assigneeName:assignmentData.assigneeName || '',
              assignorDeptCd: assignorResponse?.deptCd || assignmentData.deptCode || '',
              assignorDeptName: '',
              assigneeDeptCd: assigneeResponse?.deptCd || assignmentData.deptCode || '',
              assigneeDeptName: '',
              assignorPositionCd: assignorResponse?.jobTitleCd || assignmentData.positionCd || '',
              assigneePositionCd: assigneeResponse?.jobTitleCd || assignmentData.positionCd || '',
              targetDate: assignmentData.targetDate || '',
              description: assignmentData.description || '',
            });
          } catch (error) {
            console.error('사원명 조회 실패:', error);
            // 사원명 조회 실패 시 기본값 사용
            setFormData({
              assignmentType: assignmentData.assignmentType,
              assignorEmpNo: assignmentData.assignorEmpNo,
              assignorName: assignmentData.assignorName || '',
              assigneeEmpNo: assignmentData.assigneeEmpNo,
              assigneeName: assignmentData.assigneeName || '',
              deptCd: assignmentData.deptCode || '',
              deptName: assignmentData.deptName || '',
              positionCd: assignmentData.positionCd || '',
              positionName: assignmentData.positionName || '',
              targetDate: assignmentData.targetDate || '',
              description: assignmentData.description || '',
            });
          } finally {
            setLoading(false);
          }
        };

        loadEmployeeInfo();
        setError(null);
      } else if (initialMode === 'create') {
        setFormData(initialFormData);
        setError(null);
      }
    }
  }, [open, initialMode, assignmentData]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    console.log(formData)
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
        // assignmentTitle: formData.assignmentTitle,
        assignmentType: formData.assignmentType,
        assignorEmpNo: formData.assignorEmpNo,
        assigneeEmpNo: formData.assigneeEmpNo,
        assignorDeptCd: formData.assignorDeptCd,
        assigneeDeptCd: formData.assigneeDeptCd,
        assignorPositionCd: formData.assignorPositionCd,
        assigneePositionCd: formData.assigneePositionCd,
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
  const handleAssignorSelect = (employee: EmployeeSearchResult) => {
    setFormData(prev => ({
      ...prev,
      assignorEmpNo: employee.num,
      assignorName: employee.username,
      assignorDeptCd: employee.deptCd || '',
      assignorDeptName: employee.deptName || '',
      assignorPositionCd: employee.jobTitleCd || '',
    }));
    
    setAssignorSearchOpen(false);
  };

  // 인수자 선택 핸들러
  const handleAssigneeSelect = (employee: EmployeeSearchResult) => {
    setFormData(prev => ({
      ...prev,
      assigneeEmpNo: employee.num,
      assigneeName: employee.username,
      assigneeDeptCd: employee.deptCd || '',
      assigneeDeptName: employee.deptName || '',
      assigneePositionCd: employee.jobTitleCd || '',
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
                    mode={mode === 'view' ? 'readonly' : 'editable'}
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
                      mode='readonly'
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
                      mode='readonly'
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
                <Grid item xs={12} >
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      mode='readonly'
                      label='인계자 부서'
                      value={formData.assignorDeptCd ? getDepartmentNameSync(departments, formData.assignorDeptCd) : formData.assignorDeptName}
                    />
                {/* <Box sx={{ fontWeight: 'bold', fontSize: '2rem', minWidth: '60px', textAlign: 'center'}}>→</Box> */}
                    
                    <TextField
                      fullWidth
                      mode='readonly'
                      label='인수자 부서'
                      value={formData.assigneeDeptCd ? getDepartmentNameSync(departments, formData.assigneeDeptCd) : formData.assigneeDeptName}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                    <TextField
                      fullWidth
                      value={formData.assignorPositionCd}
                      label='인계자 직위'
                      disabled={isViewMode}
                      mode='readonly'
                    />
                    {/* <Box sx={{ fontWeight: 'bold', fontSize: '2rem', minWidth: '60px', textAlign: 'center'}}>→</Box> */}
                    <TextField
                      fullWidth
                      value={formData.assigneePositionCd}
                      label='인수자 직위'
                      disabled={isViewMode}
                      mode='readonly'
                    />
                    </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    mode={mode === 'view' ? 'readonly' : 'editable'}
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