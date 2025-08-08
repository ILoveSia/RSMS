/**
 * 사업계획 점검 다이얼로그
 * 사업계획 점검 등록/수정/조회 기능을 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사업계획 점검 다이얼로그 처리만 담당
 * - Open/Closed: 새로운 필드나 검증 추가 시 확장 가능
 * - Liskov Substitution: React 컴포넌트 인터페이스 준수
 * - Interface Segregation: 다이얼로그 관련 기능만 제공
 * - Dependency Inversion: 훅과 컴포넌트에 의존
 */
import DatePicker from '@/shared/components/ui/form/DatePicker';
import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
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
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Select } from '@/shared/components/ui/form';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import { TextField } from '@/shared/components/ui/data-display/';
import React, { useCallback, useEffect, useState } from 'react';
import { businessPlanInspectionApi, type BusinessPlanInspectionDto } from '../api/businessPlanInspectionApi';

interface BusinessPlanInspectionDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  inspectionId?: number;
  inspectionData?: BusinessPlanInspectionDto;
  onSuccess?: () => void;
}

interface FormData {
  inspectionId?: number;
  deptCd: string;
  deptName: string; // 조회용 (DB에 없음)
  inspectionYear: number;
  inspectionQuarter?: number;
  inspectionTitle: string;
  inspectionType: string;
  plannedStartDate: string;
  plannedEndDate: string;
  inspectionScope: string;
  inspectionCriteria: string;
  actualStartDate: string;
  actualEndDate: string;
  status: string;
  inspectorEmpNo: string;
  inspectorName: string; // 조회용 (DB에 없음)
}

const initialFormData: FormData = {
  deptCd: '',
  deptName: '',
  inspectionYear: new Date().getFullYear(),
  inspectionQuarter: undefined,
  inspectionTitle: '',
  inspectionType: 'QUARTERLY',
  plannedStartDate: '',
  plannedEndDate: '',
  inspectionScope: '',
  inspectionCriteria: '',
  actualStartDate: '',
  actualEndDate: '',
  status: 'PLANNED',
  inspectorEmpNo: '',
  inspectorName: '',
};

const BusinessPlanInspectionDialog: React.FC<BusinessPlanInspectionDialogProps> = ({
  open,
  onClose,
  mode: initialMode,
  inspectionId,
  inspectionData,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>(initialMode);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // 팝업 상태들
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false);
  const [inspectorSearchOpen, setInspectorSearchOpen] = useState(false);

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



      // 점검 유형 처리
      if (groupCode === 'INSPECTION_TYPE') {
        return [
          { value: 'QUARTERLY', label: '분기별' },
          { value: 'SEMI_ANNUAL', label: '반기별' },
          { value: 'ANNUAL', label: '연간' },
          { value: 'SPECIAL', label: '특별점검' },
        ];
      }

      // 상태 코드 처리
      if (groupCode === 'INSPECTION_STATUS') {
        return [
          { value: 'PLANNED', label: '계획됨' },
          { value: 'IN_PROGRESS', label: '진행중' },
          { value: 'COMPLETED', label: '완료' },
          { value: 'CANCELLED', label: '취소' },
        ];
      }

      // 연도 처리
      if (groupCode === 'YEAR') {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear + 1; year >= currentYear - 5; year--) {
          years.push({ value: year.toString(), label: `${year}년` });
        }
        return years;
      }

      // 분기 처리
      if (groupCode === 'QUARTER') {
        return [
          { value: '1', label: '1분기' },
          { value: '2', label: '2분기' },
          { value: '3', label: '3분기' },
          { value: '4', label: '4분기' },
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
  const loadInspectionData = useCallback(async () => {
    // inspectionData가 있으면 API 호출 없이 바로 사용
    if (inspectionData) {
      setFormData({
        inspectionId: inspectionData.inspectionId,
        deptCd: inspectionData.deptCd || '',
        deptName: inspectionData.deptName || '',
        inspectionYear: inspectionData.inspectionYear ?? new Date().getFullYear(),
        inspectionQuarter: inspectionData.inspectionQuarter ?? undefined,
        inspectionTitle: inspectionData.inspectionTitle || '',
        inspectionType: inspectionData.inspectionType || 'QUARTERLY',
        plannedStartDate: inspectionData.plannedStartDate || '',
        plannedEndDate: inspectionData.plannedEndDate || '',
        inspectionScope: inspectionData.inspectionScope || '',
        inspectionCriteria: inspectionData.inspectionCriteria || '',
        actualStartDate: inspectionData.actualStartDate || '',
        actualEndDate: inspectionData.actualEndDate || '',
        status: inspectionData.status || 'PLANNED',
        inspectorEmpNo: inspectionData.inspectorEmpNo || '',
        inspectorName: inspectionData.inspectorName || '',
      });
      return;
    }

    if (!inspectionId) return;

    setLoading(true);
    setError(null);
  }, [inspectionId, inspectionData]);

  // initialMode이 변경될 때 내부 mode 상태 업데이트
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // 데이터 로드
  useEffect(() => {
    if (open && (inspectionData || inspectionId) && (isEditMode || isViewMode)) {
      loadInspectionData();
    } else if (open && isCreateMode) {
      setFormData(initialFormData);
      setError(null);
    }
  }, [
    open,
    inspectionId,
    inspectionData,
    mode,
    isEditMode,
    isViewMode,
    isCreateMode,
    loadInspectionData,
  ]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.inspectionTitle.trim()) {
      setError('점검 제목을 입력해주세요.');
      return false;
    }
    if (!formData.inspectionScope.trim()) {
      setError('점검 범위를 입력해주세요.');
      return false;
    }
    if (!formData.inspectionCriteria.trim()) {
      setError('점검 기준을 입력해주세요.');
      return false;
    }
    if (!formData.deptCd) {
      setError('대상부서를 선택해주세요.');
      return false;
    }
    if (!formData.inspectorEmpNo) {
      setError('점검자를 선택해주세요.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      const requestData: Partial<BusinessPlanInspectionDto> = {
        deptCd: formData.deptCd,
        inspectionYear: formData.inspectionYear,
        inspectionQuarter: formData.inspectionQuarter || undefined,
        inspectionTitle: formData.inspectionTitle,
        inspectionType: formData.inspectionType as 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL' | 'SPECIAL',
        plannedStartDate: formData.plannedStartDate,
        plannedEndDate: formData.plannedEndDate,
        inspectionScope: formData.inspectionScope,
        inspectionCriteria: formData.inspectionCriteria,
        status: formData.status as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
        inspectorEmpNo: formData.inspectorEmpNo || undefined,
      };

      if (isCreateMode) {
        await businessPlanInspectionApi.createInspection(requestData as Omit<BusinessPlanInspectionDto, 'inspectionId'>);
      } else if (isEditMode && inspectionId) {
        await businessPlanInspectionApi.updateInspection(inspectionId, requestData);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save inspection:', err);
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
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

  // 직원 선택 핸들러
  const handleInspectorSelect = (employee: EmployeeSearchResult) => {
    setFormData(prev => ({
      ...prev,
      inspectorEmpNo: employee.num,
      inspectorName: employee.username,
    }));
    setInspectorSearchOpen(false);
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleModeChange = (newMode: 'create' | 'edit' | 'view' | 'onlyRead') => {
    if (newMode === 'onlyRead') {
      setMode('view');
    } else {
      setMode(newMode);
    }
  };



  return (
    <>
      <BaseDialog
        open={open}
        onClose={handleClose}
        onSave={handleSave}
        onModeChange={handleModeChange}
        maxWidth='xl'
        mode={mode}
        title={mode === 'create' ? '사업계획 점검 등록' : mode === 'edit' ? '사업계획 점검 수정' : '사업계획 점검 조회'}
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
                {/* 기본 정보 섹션 */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                    기본 정보
                  </Typography>
                </Grid>

                {/* 점검 제목 */}
                <Grid item xs={12}>
                  <TextField
                    mode={mode === 'view' ? 'readonly' : 'editable'}
                    fullWidth
                    label='점검 제목 *'
                    value={formData.inspectionTitle}
                    onChange={e => handleInputChange('inspectionTitle', e.target.value)}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* 점검 연도 */}
                <Grid item xs={12} sm={4}>
                  <Select
                    value={formData.inspectionYear ? formData.inspectionYear.toString() : ''}
                    label='점검 연도 *'
                    options={getCommonCodeOptions('YEAR')}
                    onChange={(value) => handleInputChange('inspectionYear', Number(value))}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* 점검 유형 */}
                <Grid item xs={12} sm={4}>
                  <Select
                    value={formData.inspectionType}
                    label='점검 유형 *'
                    options={getCommonCodeOptions('INSPECTION_TYPE')}
                    onChange={(value) => handleInputChange('inspectionType', value as string)}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* 분기 (분기별 점검일 때만) */}
                {formData.inspectionType === 'QUARTERLY' && (
                  <Grid item xs={12} sm={4}>
                    <Select
                      value={formData.inspectionQuarter ? formData.inspectionQuarter.toString() : ''}
                      label='점검 분기 *'
                      options={getCommonCodeOptions('QUARTER')}
                      onChange={(value) => handleInputChange('inspectionQuarter', Number(value))}
                      disabled={isViewMode}
                    />
                  </Grid>
                )}

                {/* 상태 */}
                <Grid item xs={12} sm={4}>
                  <Select
                    value={formData.status}
                    label='상태'
                    options={
                      isCreateMode
                        ? [{ value: 'PLANNED', label: '계획됨' }]
                        : getCommonCodeOptions('INSPECTION_STATUS')
                    }
                    onChange={(value) => handleInputChange('status', value as string)}
                    disabled={isViewMode || isCreateMode}
                  />
                </Grid>
                {/* 대상부서 */}
                <Grid item xs={12}>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      mode='readonly'
                      label='대상부서 *'
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

                {/* 계획 시작일 */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    mode={mode === 'view' ? 'readonly' : 'editable'}
                    label='계획 시작일'
                    type='date'
                    value={formData.plannedStartDate}
                    onChange={e => handleInputChange('plannedStartDate', e.target.value)}
                    disabled={isViewMode}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                {/* 계획 종료일 */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    mode={mode === 'view' ? 'readonly' : 'editable'}
                    label='계획 종료일'
                    type='date'
                    value={formData.plannedEndDate}
                    onChange={e => handleInputChange('plannedEndDate', e.target.value)}
                    disabled={isViewMode}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                {/* 상태 */}
                <Grid item xs={12} sm={6}>
                </Grid>

                {/* 점검 내용 섹션 */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 'bold', color: 'primary.main' }}>
                    점검 내용
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    mode={mode === 'view' ? 'readonly' : 'editable'}
                    label='점검 범위 *'
                    value={formData.inspectionScope}
                    onChange={e => handleInputChange('inspectionScope', e.target.value)}
                    disabled={isViewMode}
                    multiline
                    rows={6}
                    placeholder='점검 대상, 점검 영역, 주요 점검 포인트 등을 상세히 작성해주세요.'
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    mode={mode === 'view' ? 'readonly' : 'editable'}
                    label='점검 기준 *'
                    value={formData.inspectionCriteria}
                    onChange={e => handleInputChange('inspectionCriteria', e.target.value)}
                    disabled={isViewMode}
                    multiline
                    rows={6}
                    placeholder='평가 기준, 배점 체계, 등급 기준 등을 작성해주세요.'
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    mode={mode === 'view' ? 'readonly' : 'editable'}
                    label='점검 항목'
                    value={formData.inspectionTitle}
                    onChange={e => handleInputChange('inspectionTitle', e.target.value)}
                    disabled={isViewMode}
                    placeholder='주요 점검 항목을 쉼표로 구분하여 입력하세요.'
                  />
                </Grid>

                {/* 담당자 정보 섹션 */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 'bold', color: 'primary.main' }}>
                    담당자 정보
                  </Typography>
                </Grid>

                {/* 점검자 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='점검자 *'
                    value={formData.inspectorName}
                    disabled={isViewMode}
                    mode={isViewMode ? "readonly" : "editable"}
                    helperText={formData.inspectorEmpNo ? `사번: ${formData.inspectorEmpNo}` : ''}
                    InputProps={{
                      endAdornment: !isViewMode && (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setInspectorSearchOpen(true)}
                            size="small"
                            edge="end"
                          >
                            <SearchIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>



                {/* 진행 현황 섹션 (조회 모드에서만) */}
                {/* {isViewMode && (
                  <>

                    {formData.actualStartDate && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          mode='readonly'
                          label='실제 시작일'
                          value={formData.actualStartDate}
                          disabled
                        />
                      </Grid>
                    )}

                    {formData.actualEndDate && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          mode='readonly'
                          label='실제 종료일'
                          value={formData.actualEndDate}
                          disabled
                        />
                      </Grid>
                    )}
                  </>
                )} */}
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

      {/* 부서 조회 팝업 */}
      <DepartmentSearchPopup
        open={departmentSearchOpen}
        onClose={() => setDepartmentSearchOpen(false)}
        onSelect={handleDepartmentSelect}
        title='부서 조회'
        multiSelect={false}
      />

      {/* 점검자 조회 팝업 */}
      <EmployeeSearchPopup
        open={inspectorSearchOpen}
        onClose={() => setInspectorSearchOpen(false)}
        onSelect={handleInspectorSelect}
        title='점검자 조회'
      />


    </>
  );
};

export default BusinessPlanInspectionDialog;