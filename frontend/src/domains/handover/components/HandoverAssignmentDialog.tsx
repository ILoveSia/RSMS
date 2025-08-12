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
import DatePicker from '@/shared/components/ui/form/DatePicker';
import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
import { getDepartmentNameSync, useDepartments, getEmployeeNameSync } from '@/shared/utils/codeUtils';
import {
  EmployeeSearchPopup,
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
import { CommonCodeSelect, Select } from '@/shared/components/ui/form';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import { TextField } from '@/shared/components/ui/data-display/';
import React, { useCallback, useEffect, useState } from 'react';
import { handoverApi, type HandoverAssignmentDto } from '../api/handoverApi';

// Date를 YYYY-MM-DD 형식의 문자열로 변환하는 유틸리티 함수
const formatDateToString = (date: Date | null): string => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface HandoverAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  assignmentId?: number;
  assignmentData?: HandoverAssignmentDto;
  onSuccess?: () => void;
}

interface FormData {
  // assignmentTitle: string;
  handoverType: string;  // 인수인계 유형 (POSITION, RESPONSIBILITY)
  handoverFromEmpNo: string;
  assignorName: string;
  handoverToEmpNo: string;
  assigneeName: string;
  assignorDeptCd: string;
  assignorDeptName: string;
  assigneeDeptCd: string;
  assigneeDeptName: string;
  plannedStartDate: Date | null;
  plannedEndDate: Date | null;
  description: string;
  status: string;  // 진행 상태 (PLANNED, IN_PROGRESS 등)
}

const initialFormData: FormData = {
  // assignmentTitle: '',
  handoverType: '',
  handoverFromEmpNo: '',
  assignorName: '',
  handoverToEmpNo: '',
  assigneeName: '',
  assignorDeptCd: '',
  assignorDeptName: '',
  assigneeDeptCd: '',
  assigneeDeptName: '',
  plannedStartDate: null,
  plannedEndDate: null,
  description: '',
  status: 'PLANNED',  // 기본값: 계획됨
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

        // ListPage에서 이미 사원 정보가 조회되어 전달됨
        const startDateStr = assignmentData.plannedStartDate || '';
        const endDateStr = assignmentData.targetDate || assignmentData.plannedEndDate || '';
        const plannedStartDate = startDateStr ? new Date(startDateStr) : null;
        const plannedEndDate = endDateStr ? new Date(endDateStr) : null;
        setFormData({
          handoverType: assignmentData.handoverType || '',  // 인수인계 유형
          handoverFromEmpNo: assignmentData.handoverFromEmpNo || '',
          assignorName: assignmentData.handoverFromEmpName || assignmentData.handoverFromName || '',
          handoverToEmpNo: assignmentData.handoverToEmpNo || '',
          assigneeName: assignmentData.handoverToEmpName || assignmentData.handoverToName || '',
          assignorDeptCd: assignmentData.assignorDeptCd || '',
          assignorDeptName: assignmentData.assignorDeptName || '',
          assigneeDeptCd: assignmentData.assigneeDeptCd || '',
          assigneeDeptName: assignmentData.assigneeDeptName || '',
          plannedStartDate: plannedStartDate,
          plannedEndDate: plannedEndDate,
          description: assignmentData.description || assignmentData.notes || '',
          status: assignmentData.status || 'PLANNED',  // 진행 상태
        });
        setError(null);
      } else if (initialMode === 'create') {
        setFormData(initialFormData);
        setError(null);
      }
    }
  }, [open, initialMode, assignmentData]);

  const handleInputChange = (field: keyof FormData, value: string | Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    // if (!formData.handoverType) {
    //   setError('인수인계 유형을 선택해주세요.');
    //   return false;
    // }
    if (!formData.handoverFromEmpNo.trim()) {
      setError('인계자를 선택해주세요.');
      return false;
    }
    if (!formData.handoverToEmpNo.trim()) {
      setError('인수자를 선택해주세요.');
      return false;
    }
    if (!formData.plannedStartDate) {
      setError('목표 시작일자를 선택해주세요.');
      return false;
    }
    if (!formData.plannedEndDate) {
      setError('목표 완료일자를 선택해주세요.');
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
        handoverType: formData.handoverType,
        handoverFromEmpNo: formData.handoverFromEmpNo,
        handoverToEmpNo: formData.handoverToEmpNo,
        plannedStartDate: formatDateToString(formData.plannedStartDate),
        plannedEndDate: formatDateToString(formData.plannedEndDate),
        notes: formData.description,
        status: formData.status,
      };

      if (isCreateMode) {
        await handoverApi.createHandoverAssignment(requestData);
      } else if (isEditMode && assignmentId) {
        await handoverApi.updateHandoverAssignment(assignmentId, requestData);
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      // 에러 메시지 추출 및 사용자 친화적 메시지로 변환
      let errorMessage = '저장 중 오류가 발생했습니다.';

      // API 클라이언트에서 오는 에러 구조에 맞게 메시지 추출
      let backendMessage = '';

      // API 클라이언트의 ApiError 구조 확인
      if (err?.details && typeof err.details === 'string') {
        backendMessage = err.details;
      } else if (err?.details && typeof err.details === 'object' && err.details?.message) {
        backendMessage = err.details.message;
      } else if (err?.message && err.message !== 'API 요청이 실패했습니다.') {
        backendMessage = err.message;
      }

      if (backendMessage && typeof backendMessage === 'string') {
        // 중복 관련 에러인지 확인
        if (backendMessage.includes('이미') && (backendMessage.includes('존재') || backendMessage.includes('중복'))) {
          errorMessage = '⚠️ 중복 등록 오류\n\n선택하신 인계자와 인수자 조합으로 이미 등록된 인수인계가 있습니다.\n다른 인계자 또는 인수자를 선택해주세요.';
        } else {
          errorMessage = backendMessage;
        }
      }

      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // 인계자 선택 핸들러
  const handleAssignorSelect = (employee: EmployeeSearchResult) => {
    setFormData(prev => ({
      ...prev,
      handoverFromEmpNo: employee.num,
      assignorName: employee.username,
      assignorDeptCd: employee.deptCd || '',
      assignorDeptName: employee.deptName || '',
    }));

    setAssignorSearchOpen(false);
  };

  // 인수자 선택 핸들러
  const handleAssigneeSelect = (employee: EmployeeSearchResult) => {
    setFormData(prev => ({
      ...prev,
      handoverToEmpNo: employee.num,
      assigneeName: employee.username,
      assigneeDeptCd: employee.deptCd || '',
      assigneeDeptName: employee.deptName || '',
    }));

    setAssigneeSearchOpen(false);
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
          p: 2,
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
                <Alert
                  severity='error'
                  sx={{
                    mb: 2,
                    '& .MuiAlert-message': {
                      whiteSpace: 'pre-line',
                      fontSize: '14px',
                      fontWeight: 500
                    }
                  }}
                >
                  {error}
                </Alert>
              )}

              <Grid container spacing={1.5}>


                {/* 인수인계 유형 */}
                {/* <Grid item xs={12} sm={6}>
                  <CommonCodeSelect
                    minWidth='100%'
                    label='인수인계 유형 *'
                    groupCode='HANDOVER_TYPE'
                    value={formData.handoverType}
                    onChange={value => handleInputChange('handoverType', value)}
                    disabled={isViewMode}
                  />
                </Grid> */}

                {/* 진행 상태 */}
                <Grid item xs={12} sm={6}>
                  <CommonCodeSelect
                    minWidth='100%'
                    groupCode='HANDOVER_STATUS'
                    value={formData.status}
                    onChange={value => handleInputChange('status', value)}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* 목표일자 */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <DatePicker
                      mode={mode === 'view' ? 'readonly' : 'editable'}
                      fullWidth
                      label='목표 시작일자 *'
                      value={formData.plannedStartDate}
                      onChange={(date: Date) => handleInputChange('plannedStartDate', date)}
                      disabled={isViewMode}
                    />
                    <DatePicker
                      mode={mode === 'view' ? 'readonly' : 'editable'}
                      fullWidth
                      label='목표 완료일자 *'
                      value={formData.plannedEndDate}
                      onChange={(date: Date) => handleInputChange('plannedEndDate', date)}
                      disabled={isViewMode}
                    />
                  </Box>
                </Grid>

                {/* 빈 공간 */}
                <Grid item xs={12} sm={6}></Grid>

                {/* 인계자 */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      mode='readonly'
                      label='인계자 *'
                      value={formData.assignorName || `${formData.handoverFromEmpNo}`}
                      disabled
                      placeholder='인계자를 선택하세요'
                      helperText={
                        formData.handoverFromEmpNo ? `사번: ${formData.handoverFromEmpNo}` : ''
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
                    <TextField
                      mode='readonly'
                      fullWidth
                      label='인수자 *'
                      value={formData.assigneeName || `${formData.handoverToEmpNo}`}
                      disabled
                      placeholder='인수자를 선택하세요'
                      helperText={
                        formData.handoverToEmpNo ? `사번: ${formData.handoverToEmpNo}` : ''
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
                  <TextField
                    mode={mode === 'view' ? 'readonly' : 'editable'}
                    fullWidth
                    label='인수인계 설명'
                    value={formData.description}
                    onChange={e => handleInputChange('description', e.target.value)}
                    disabled={isViewMode}
                    multiline
                    rows={4}
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


    </>
  );
};

export default HandoverAssignmentDialog;