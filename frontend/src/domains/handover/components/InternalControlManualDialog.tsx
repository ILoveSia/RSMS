/**
 * 내부통제 업무메뉴얼 다이얼로그
 * 내부통제 업무메뉴얼 등록/수정/조회 기능을 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 내부통제 업무메뉴얼 다이얼로그 처리만 담당
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
  Tab,
  Tabs,
  Typography,
  Chip,
} from '@mui/material';
import { Select } from '@/shared/components/ui/form';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import { TextField } from '@/shared/components/ui/data-display/';
import React, { useCallback, useEffect, useState } from 'react';
import { internalControlManualApi, type InternalControlManualDto } from '../api/internalControlManualApi';

interface InternalControlManualDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  manualId?: number;
  onSuccess?: () => void;
}

interface FormData {
  assignmentId: number | '';
  manualTitle: string;
  manualContent: string;
  manualVersion: string;
  status: string;
  deptCd: string;
  deptName: string;
  authorEmpNo: string;
  authorName: string;
  reviewerEmpNo: string;
  reviewerName: string;
  approverEmpNo: string;
  approverName: string;
  effectiveDate: string;
  expiryDate: string;
}

const initialFormData: FormData = {
  assignmentId: '',
  manualTitle: '',
  manualContent: '',
  manualVersion: 'v1.0',
  status: 'DRAFT',
  deptCd: '',
  deptName: '',
  authorEmpNo: '',
  authorName: '',
  reviewerEmpNo: '',
  reviewerName: '',
  approverEmpNo: '',
  approverName: '',
  effectiveDate: '',
  expiryDate: '',
};

const InternalControlManualDialog: React.FC<InternalControlManualDialogProps> = ({
  open,
  onClose,
  mode: initialMode,
  manualId,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>(initialMode);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // 팝업 상태들
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false);
  const [authorSearchOpen, setAuthorSearchOpen] = useState(false);
  const [reviewerSearchOpen, setReviewerSearchOpen] = useState(false);
  const [approverSearchOpen, setApproverSearchOpen] = useState(false);

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

      // 인수인계 지정 처리
      if (groupCode === 'ASSIGNMENT') {
        return [
          { value: '1', label: '정보기술부 부서장 인수인계' },
          { value: '2', label: '경영관리부 팀장 인수인계' },
          { value: '3', label: '리스크관리부 선임 인수인계' },
        ];
      }

      // 상태 코드 처리
      if (groupCode === 'MANUAL_STATUS') {
        return [
          { value: 'DRAFT', label: '초안' },
          { value: 'REVIEW', label: '검토중' },
          { value: 'APPROVED', label: '승인됨' },
          { value: 'PUBLISHED', label: '발행됨' },
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

  // 상태 표시 함수
  const getStatusChip = (status: string) => {
    const statusConfig = {
      DRAFT: { label: '초안', color: 'default' as const },
      REVIEW: { label: '검토중', color: 'warning' as const },
      APPROVED: { label: '승인됨', color: 'info' as const },
      PUBLISHED: { label: '발행됨', color: 'success' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: 'default' as const };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  // 데이터 로드 함수
  const loadManualData = useCallback(async () => {
    if (!manualId) return;

    setLoading(true);
    setError(null);
    try {
      // TODO: 실제 API 호출로 대체
      // const data = await internalControlManualApi.getManual(manualId);
      
      // Mock 데이터
      const mockData: InternalControlManualDto = {
        manualId,
        assignmentId: 1,
        manualTitle: '정보기술부 내부통제 업무메뉴얼',
        manualContent: `# 정보기술부 내부통제 업무메뉴얼

## 1. 개요
정보기술부의 내부통제 업무에 대한 상세 메뉴얼입니다.

## 2. 주요 업무
- IT 거버넌스
- 정보보안 관리
- 시스템 운영 관리
- 데이터 품질 관리

## 3. 업무 절차
### 3.1 IT 거버넌스
1. IT 전략 수립
2. IT 투자 계획 및 예산 관리
3. IT 성과 측정 및 평가

### 3.2 정보보안 관리
1. 보안 정책 수립 및 운영
2. 접근권한 관리
3. 보안 감사 및 모니터링

### 3.3 시스템 운영 관리
1. 시스템 가용성 관리
2. 성능 모니터링
3. 변경관리 프로세스

## 4. 점검 항목
- IT 거버넌스 체계 운영 현황
- 정보보안 정책 준수 현황
- 시스템 운영 효율성
- 데이터 품질 관리 현황

## 5. 관련 문서
- IT 거버넌스 정책서
- 정보보안 운영절차서
- 시스템 운영 매뉴얼`,
        manualVersion: 'v1.0',
        status: 'PUBLISHED',
        deptCd: 'IT001',
        deptName: '정보기술부',
        authorEmpNo: 'E001',
        authorName: '김작성',
        reviewerEmpNo: 'E002',
        reviewerName: '이검토',
        approverEmpNo: 'E003',
        approverName: '박승인',
        effectiveDate: '2024-01-01',
        expiryDate: '2024-12-31',
        isValid: true,
        isExpiring: false,
        daysUntilExpiry: 300,
        workflowStatus: '발행됨',
        attachmentCount: 3,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
      };

      setFormData({
        assignmentId: mockData.assignmentId || '',
        manualTitle: mockData.manualTitle,
        manualContent: mockData.manualContent,
        manualVersion: mockData.manualVersion,
        status: mockData.status,
        deptCd: mockData.deptCd,
        deptName: mockData.deptName || '',
        authorEmpNo: mockData.authorEmpNo || '',
        authorName: mockData.authorName || '',
        reviewerEmpNo: mockData.reviewerEmpNo || '',
        reviewerName: mockData.reviewerName || '',
        approverEmpNo: mockData.approverEmpNo || '',
        approverName: mockData.approverName || '',
        effectiveDate: mockData.effectiveDate || '',
        expiryDate: mockData.expiryDate || '',
      });

    } catch (err) {
      console.error('Failed to load manual data:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [manualId]);

  // initialMode이 변경될 때 내부 mode 상태 업데이트
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // 데이터 로드
  useEffect(() => {
    if (open && manualId && (isEditMode || isViewMode)) {
      loadManualData();
    } else if (open && isCreateMode) {
      setFormData(initialFormData);
      setError(null);
    }
  }, [
    open,
    manualId,
    mode,
    isEditMode,
    isViewMode,
    isCreateMode,
    loadManualData,
  ]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.assignmentId) {
      setError('인수인계 지정을 선택해주세요.');
      return false;
    }
    if (!formData.manualTitle.trim()) {
      setError('메뉴얼 제목을 입력해주세요.');
      return false;
    }
    if (!formData.manualContent.trim()) {
      setError('메뉴얼 내용을 입력해주세요.');
      return false;
    }
    if (!formData.deptCd) {
      setError('부서를 선택해주세요.');
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
        assignmentId: formData.assignmentId as number,
        manualTitle: formData.manualTitle,
        manualContent: formData.manualContent,
        manualVersion: formData.manualVersion,
        status: formData.status,
        deptCd: formData.deptCd,
        authorEmpNo: formData.authorEmpNo,
        reviewerEmpNo: formData.reviewerEmpNo,
        approverEmpNo: formData.approverEmpNo,
        effectiveDate: formData.effectiveDate,
        expiryDate: formData.expiryDate,
      };

      if (isCreateMode) {
        // TODO: 실제 API 호출로 대체
        // await internalControlManualApi.createManual(requestData);
      } else if (isEditMode && manualId) {
        // TODO: 실제 API 호출로 대체
        // await internalControlManualApi.updateManual(manualId, requestData);
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save manual:', err);
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

  // 직원 선택 핸들러들
  const handleAuthorSelect = (employee: Employee) => {
    setFormData(prev => ({
      ...prev,
      authorEmpNo: employee.empNo,
      authorName: employee.empName,
    }));
    setAuthorSearchOpen(false);
  };

  const handleReviewerSelect = (employee: Employee) => {
    setFormData(prev => ({
      ...prev,
      reviewerEmpNo: employee.empNo,
      reviewerName: employee.empName,
    }));
    setReviewerSearchOpen(false);
  };

  const handleApproverSelect = (employee: Employee) => {
    setFormData(prev => ({
      ...prev,
      approverEmpNo: employee.empNo,
      approverName: employee.empName,
    }));
    setApproverSearchOpen(false);
  };

  const handleClose = () => {
    if (saving) return;
    onClose();
  };

  const handleModeChange = (newMode: 'create' | 'edit' | 'view') => {
    setMode(newMode);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
        title={mode === 'create' ? '내부통제 업무메뉴얼 등록' : mode === 'edit' ? '내부통제 업무메뉴얼 수정' : '내부통제 업무메뉴얼 조회'}
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

              <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                <Tab label="기본 정보" />
                <Tab label="메뉴얼 내용" />
                <Tab label="승인 정보" />
              </Tabs>

              {/* 기본 정보 탭 */}
              {tabValue === 0 && (
                <Grid container spacing={2}>
                  {/* 인수인계 지정 */}
                  <Grid item xs={12} sm={6}>
                    <Select
                      value={formData.assignmentId}
                      label='인수인계 지정 *'
                      options={[
                        { value: '', label: '선택하세요' },
                        ...getCommonCodeOptions('ASSIGNMENT')
                      ]}
                      onChange={(value) => handleInputChange('assignmentId', Number(value))}
                      disabled={isViewMode}
                    />
                  </Grid>

                  {/* 상태 */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Select
                        value={formData.status}
                        label='상태'
                        options={[
                          { value: '', label: '선택하세요' },
                          ...getCommonCodeOptions('MANUAL_STATUS')
                        ]}
                        onChange={(value) => handleInputChange('status', value as string)}
                        disabled={isViewMode}
                        sx={{ flex: 1 }}
                      />
                      {isViewMode && getStatusChip(formData.status)}
                    </Box>
                  </Grid>

                  {/* 메뉴얼 제목 */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='메뉴얼 제목 *'
                      value={formData.manualTitle}
                      onChange={e => handleInputChange('manualTitle', e.target.value)}
                      disabled={isViewMode}
                    />
                  </Grid>

                  {/* 메뉴얼 버전 */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='메뉴얼 버전'
                      value={formData.manualVersion}
                      onChange={e => handleInputChange('manualVersion', e.target.value)}
                      disabled={isViewMode}
                    />
                  </Grid>

                  {/* 부서 */}
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        label='부서 *'
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

                  {/* 시행일 */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='시행일'
                      type='date'
                      value={formData.effectiveDate}
                      onChange={e => handleInputChange('effectiveDate', e.target.value)}
                      disabled={isViewMode}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>

                  {/* 만료일 */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='만료일'
                      type='date'
                      value={formData.expiryDate}
                      onChange={e => handleInputChange('expiryDate', e.target.value)}
                      disabled={isViewMode}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                </Grid>
              )}

              {/* 메뉴얼 내용 탭 */}
              {tabValue === 1 && (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='메뉴얼 내용 *'
                      value={formData.manualContent}
                      onChange={e => handleInputChange('manualContent', e.target.value)}
                      disabled={isViewMode}
                      multiline
                      rows={20}
                      placeholder='내부통제 업무메뉴얼의 상세 내용을 마크다운 형식으로 작성하세요.'
                      sx={{
                        '& .MuiInputBase-input': {
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              )}

              {/* 승인 정보 탭 */}
              {tabValue === 2 && (
                <Grid container spacing={2}>
                  {/* 작성자 */}
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        label='작성자'
                        value={formData.authorName || `${formData.authorEmpNo}`}
                        disabled
                        placeholder='작성자를 선택하세요'
                        helperText={formData.authorEmpNo ? `사번: ${formData.authorEmpNo}` : ''}
                      />
                      {!isViewMode && (
                        <Button
                          variant='outlined'
                          onClick={() => setAuthorSearchOpen(true)}
                          sx={{ minWidth: 100 }}
                          startIcon={<SearchIcon />}
                        >
                          조회
                        </Button>
                      )}
                    </Box>
                  </Grid>

                  {/* 검토자 */}
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        label='검토자'
                        value={formData.reviewerName || `${formData.reviewerEmpNo}`}
                        disabled
                        placeholder='검토자를 선택하세요'
                        helperText={formData.reviewerEmpNo ? `사번: ${formData.reviewerEmpNo}` : ''}
                      />
                      {!isViewMode && (
                        <Button
                          variant='outlined'
                          onClick={() => setReviewerSearchOpen(true)}
                          sx={{ minWidth: 100 }}
                          startIcon={<SearchIcon />}
                        >
                          조회
                        </Button>
                      )}
                    </Box>
                  </Grid>

                  {/* 승인자 */}
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        label='승인자'
                        value={formData.approverName || `${formData.approverEmpNo}`}
                        disabled
                        placeholder='승인자를 선택하세요'
                        helperText={formData.approverEmpNo ? `사번: ${formData.approverEmpNo}` : ''}
                      />
                      {!isViewMode && (
                        <Button
                          variant='outlined'
                          onClick={() => setApproverSearchOpen(true)}
                          sx={{ minWidth: 100 }}
                          startIcon={<SearchIcon />}
                        >
                          조회
                        </Button>
                      )}
                    </Box>
                  </Grid>

                  {/* 추가 정보 표시 (조회 모드에서만) */}
                  {isViewMode && manualId && (
                    <>
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                          추가 정보
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="textSecondary">
                          첨부파일: 3개
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="textSecondary">
                          등록일: 2024.01.01
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="textSecondary">
                          최종수정일: 2024.01.15
                        </Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              )}
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

      {/* 작성자 조회 팝업 */}
      <EmployeeSearchPopup
        open={authorSearchOpen}
        onClose={() => setAuthorSearchOpen(false)}
        onSelect={handleAuthorSelect}
        title='작성자 조회'
      />

      {/* 검토자 조회 팝업 */}
      <EmployeeSearchPopup
        open={reviewerSearchOpen}
        onClose={() => setReviewerSearchOpen(false)}
        onSelect={handleReviewerSelect}
        title='검토자 조회'
      />

      {/* 승인자 조회 팝업 */}
      <EmployeeSearchPopup
        open={approverSearchOpen}
        onClose={() => setApproverSearchOpen(false)}
        onSelect={handleApproverSelect}
        title='승인자 조회'
      />
    </>
  );
};

export default InternalControlManualDialog;