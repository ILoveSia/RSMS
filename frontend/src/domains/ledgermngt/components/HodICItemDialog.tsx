import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
import {
  DepartmentSearchPopup,
  ResponsibilitySearchPopup,
  type Department,
  type ResponsibilitySearchResult,
} from '@/domains/common/components/search';
import { FileUpload } from '@/shared/components/ui/form';
import type { SelectOption } from '@/shared/types/common';
import { attachmentApi, type AttachmentResponse, type AttachmentUploadResult } from '@/shared/api/attachmentApi';
import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import type { HodICItemCreateRequest } from '../api/hodIcItemApi';
import { hodICItemApi } from '../api/hodIcItemApi';

interface HodICItemDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  itemId?: number;
  onSuccess?: () => void;
}

interface FormData {
  // 책무ID 관련
  responsibilityId: number | '';
  responsibilityContent: string; // 책무내용 표시용

  // 부서 관련
  deptCd: string;
  deptName: string; // 부서명 표시용

  // 공통코드 관련 필드들
  fieldTypeCd: string; // 항목구분
  roleTypeCd: string; // 직무구분
  periodCd: string; // 주기
  checkPeriod: string; // 점검시기

  // 텍스트 필드들
  icTask: string; // 내부통제업무
  measureDesc: string; // 조치활동
  measureType: string; // 조치유형
  supportDoc: string; // 관련근거
  checkWay: string; // 점검방법

  // 파일 관련 필드들
  evidenceFiles: File[]; // 증빙자료 파일들 (업로드 대기)
  attachments: AttachmentResponse[]; // 업로드된 첨부파일들
}

const initialFormData: FormData = {
  responsibilityId: '',
  responsibilityContent: '',
  deptCd: '',
  deptName: '',
  fieldTypeCd: '',
  roleTypeCd: '',
  periodCd: '',
  checkPeriod: '',
  icTask: '',
  measureDesc: '',
  measureType: '',
  supportDoc: '',
  checkWay: '',
  evidenceFiles: [],
  attachments: [],
};

const HodICItemDialog: React.FC<HodICItemDialogProps> = ({
  open,
  onClose,
  mode,
  itemId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestingApproval, setRequestingApproval] = useState(false);
  const [canRequestApproval, setCanRequestApproval] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  // 팝업 상태들
  const [responsibilitySearchOpen, setResponsibilitySearchOpen] = useState(false);
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false);

  // 공통코드 Store에서 데이터 가져오기
  const { data: allCodes } = useReduxState<{ data: CommonCode[] } | CommonCode[]>(
    'codeStore/allCodes'
  );

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';

  const title = {
    create: '부서장 내부통제항목 등록',
    edit: '부서장 내부통제항목 수정',
    view: '부서장 내부통제항목 상세보기',
  }[mode];

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

  // 항목구분 공통코드 가져오기
  const getFieldTypeCodes = useCallback(() => {
    const codes = getCodesArray();
    console.log('전체 공통코드:', codes);
    console.log('항목구분 코드 요청');

    // 공통코드에서 FIELD_TYPE 필터링
    const filteredCodes = codes
      .filter(code => code.groupCode === 'FIELD_TYPE' && code.useYn === 'Y')
      .sort((a, b) => a.sortOrder - b.sortOrder);

    console.log('필터링된 항목구분 코드:', filteredCodes);

    // 필터링된 코드가 없으면 하드코딩된 기본값 반환
    if (filteredCodes.length === 0) {
      console.log('항목구분 코드가 없어 하드코딩된 값 사용');
      return [
        { code: 'CRT', codeName: '공통항목', groupCode: 'FIELD_TYPE', useYn: 'Y', sortOrder: 1 },
        { code: 'URT', codeName: '고유항목', groupCode: 'FIELD_TYPE', useYn: 'Y', sortOrder: 2 },
      ];
    }

    return filteredCodes;
  }, [getCodesArray]);

  // 공통코드 옵션 생성 함수
  const getCommonCodeOptions = useCallback(
    (groupCode: string): SelectOption[] => {
      const codes = getCodesArray();
      console.log(`${groupCode} 공통코드 옵션 요청`);

      // 항목구분인 경우 별도 처리
      if (groupCode === 'FIELD_TYPE') {
        const fieldTypeCodes = getFieldTypeCodes();
        const options = fieldTypeCodes.map(code => ({
          value: code.code,
          label: code.codeName,
        }));
        console.log('항목구분 최종 옵션:', options);
        return options;
      }

      // 주기(PERIOD) 코드 처리
      if (groupCode === 'PERIOD') {
        const filteredCodes = codes.filter(
          code => code.groupCode === groupCode && code.useYn === 'Y'
        );

        console.log('필터링된 주기 코드:', filteredCodes);

        // 필터링된 코드가 없으면 하드코딩된 기본값 반환
        if (filteredCodes.length === 0) {
          console.log('주기 코드가 없어 하드코딩된 값 사용');
          return [
            { value: 'PERIOD01', label: '일별' },
            { value: 'PERIOD02', label: '주별' },
            { value: 'PERIOD03', label: '월별' },
            { value: 'PERIOD04', label: '분기별' },
            { value: 'PERIOD05', label: '반기별' },
            { value: 'PERIOD06', label: '연간' },
          ];
        }

        const options = filteredCodes
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(code => ({
            value: code.code,
            label: code.codeName,
          }));

        return options;
      }

      // 점검시기(MONTH) 코드 처리
      if (groupCode === 'MONTH') {
        const filteredCodes = codes.filter(
          code => code.groupCode === groupCode && code.useYn === 'Y'
        );

        console.log('필터링된 점검시기 코드:', filteredCodes);

        // 필터링된 코드가 없으면 하드코딩된 기본값 반환
        if (filteredCodes.length === 0) {
          console.log('점검시기 코드가 없어 하드코딩된 값 사용');
          return [
            { value: 'MONTH01', label: '1월' },
            { value: 'MONTH02', label: '2월' },
            { value: 'MONTH03', label: '3월' },
            { value: 'MONTH04', label: '4월' },
            { value: 'MONTH05', label: '5월' },
            { value: 'MONTH06', label: '6월' },
            { value: 'MONTH07', label: '7월' },
            { value: 'MONTH08', label: '8월' },
            { value: 'MONTH09', label: '9월' },
            { value: 'MONTH10', label: '10월' },
            { value: 'MONTH11', label: '11월' },
            { value: 'MONTH12', label: '12월' },
          ];
        }

        const options = filteredCodes
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(code => ({
            value: code.code,
            label: code.codeName,
          }));

        return options;
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
    [getCodesArray, getFieldTypeCodes]
  );

  // 직무구분 옵션 - 항목구분에 따라 동적 변경
  const getRoleTypeOptions = useCallback((): SelectOption[] => {
    console.log('직무구분 옵션 요청, 현재 항목구분:', formData.fieldTypeCd);

    // 공통항목(CRT)인 경우
    if (formData.fieldTypeCd === 'CRT') {
      const options = getCommonCodeOptions('COM_ROLE_TYPE');
      console.log('COM_ROLE_TYPE 옵션:', options);

      // 옵션이 없으면 하드코딩된 기본값 반환
      if (options.length === 0) {
        console.log('COM_ROLE_TYPE 코드가 없어 하드코딩된 값 사용');
        return [
          { value: 'CRT01', label: '내부통제 공통(준법)' },
          { value: 'CRT02', label: '내부통제 공통(HR)' },
          { value: 'CRT03', label: '내부통제 공통(감사)' },
          { value: 'CRT03', label: '내부통제 공통(공시)' },
        ];
      }
      return options;
    }
    // 고유항목(URT)인 경우
    else if (formData.fieldTypeCd === 'URT') {
      const options = getCommonCodeOptions('UNI_ROLE_TYPE');
      console.log('UNI_ROLE_TYPE 옵션:', options);

      // 옵션이 없으면 하드코딩된 기본값 반환
      if (options.length === 0) {
        console.log('UNI_ROLE_TYPE 코드가 없어 하드코딩된 값 사용');
        return [
          { value: 'URT01', label: '부서고유' },
          { value: 'URT02', label: '부서별 (공통)' },
        ];
      }
      return options;
    }

    return [];
  }, [formData.fieldTypeCd, getCommonCodeOptions]);

  // 첨부파일 로드 함수
  const loadAttachments = useCallback(async () => {
    if (!itemId) return;

    setLoadingAttachments(true);
    try {
      const attachments = await attachmentApi.getAttachmentsByEntity('hod_ic_item', itemId);
      setFormData(prev => ({ ...prev, attachments }));
    } catch (err) {
      console.error('Failed to load attachments:', err);
      // 첨부파일 로딩 실패는 전체 로딩을 막지 않음
    } finally {
      setLoadingAttachments(false);
    }
  }, [itemId]);

  // 데이터 로드 함수
  const loadItemData = useCallback(async () => {
    if (!itemId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await hodICItemApi.getHodICItemById(itemId);
      setFormData({
        responsibilityId: data.responsibilityId,
        responsibilityContent: data.responsibilityContent || '',
        deptCd: data.deptCd,
        deptName: '', // 부서명은 별도로 조회해야 함
        fieldTypeCd: data.fieldTypeCd,
        roleTypeCd: data.roleTypeCd,
        periodCd: data.periodCd,
        checkPeriod: data.checkPeriod,
        icTask: data.icTask,
        measureDesc: data.measureDesc,
        measureType: data.measureType,
        supportDoc: data.supportDoc,
        checkWay: data.checkWay,
        evidenceFiles: [], // 새로 업로드할 파일들
        attachments: [], // 기존 첨부파일들은 별도 로딩
      });

      // 첨부파일 로드
      await loadAttachments();
    } catch (err) {
      console.error('Failed to load item data:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [itemId, loadAttachments]);

  // 승인 권한 확인 함수
  const checkApprovalPermission = useCallback(async () => {
    if (!itemId) return;

    try {
      const canRequest = await hodICItemApi.isCreatedBy(itemId);
      setCanRequestApproval(canRequest);
    } catch (err) {
      console.error('Failed to check approval permission:', err);
    }
  }, [itemId]);

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
        console.log('localStorage에서 공통코드 복원:', parsedCodes);
        // 여기서 setAllCodes를 사용할 수 없으므로 Redux 액션을 통해 업데이트해야 함
      } catch (error) {
        console.error('localStorage 공통코드 복원 실패:', error);
        localStorage.removeItem('commonCodes');
      }
    }
  }, [allCodes]);

  // 데이터 로드
  useEffect(() => {
    if (open && itemId && (isEditMode || isViewMode)) {
      loadItemData();
      if (isViewMode) {
        checkApprovalPermission();
      }
    } else if (open && isCreateMode) {
      setFormData(initialFormData);
      setError(null);
    }
  }, [
    open,
    itemId,
    mode,
    isEditMode,
    isViewMode,
    isCreateMode,
    loadItemData,
    checkApprovalPermission,
  ]);

  // 항목구분 변경시 직무구분 초기화
  useEffect(() => {
    if (formData.fieldTypeCd) {
      const newRoleOptions = getRoleTypeOptions();
      // 현재 선택된 직무구분이 새로운 옵션에 없으면 초기화
      if (
        formData.roleTypeCd &&
        !newRoleOptions.some(option => option.value === formData.roleTypeCd)
      ) {
        setFormData(prev => ({ ...prev, roleTypeCd: '' }));
      }
    }
  }, [formData.fieldTypeCd, formData.roleTypeCd, getRoleTypeOptions]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 파일 선택 핸들러
  const handleFileSelect = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      evidenceFiles: files,
    }));
  };

  // 파일 제거 핸들러 (새로 추가한 파일)
  const handleFileRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter((_, i) => i !== index),
    }));
  };

  // 기존 첨부파일 삭제 핸들러
  const handleAttachmentDelete = async (attachmentId: number) => {
    if (!confirm('이 첨부파일을 삭제하시겠습니까?')) return;

    try {
      await attachmentApi.deleteAttachment(attachmentId, 'current_user'); // 실제 사용자 ID로 변경 필요
      
      // 로컬 상태에서도 제거
      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.filter(att => att.attachId !== attachmentId),
      }));

      console.log('첨부파일 삭제 완료:', attachmentId);
    } catch (err) {
      console.error('첨부파일 삭제 실패:', err);
      setError('첨부파일 삭제에 실패했습니다.');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.responsibilityId) {
      setError('책무ID를 선택해주세요.');
      return false;
    }
    if (!formData.deptCd || !formData.deptCd.trim()) {
      setError('부서명을 선택해주세요.');
      return false;
    }
    if (!formData.fieldTypeCd || !formData.fieldTypeCd.trim()) {
      setError('항목구분을 선택해주세요.');
      return false;
    }
    if (!formData.roleTypeCd || !formData.roleTypeCd.trim()) {
      setError('직무구분을 선택해주세요.');
      return false;
    }
    if (!formData.icTask || !formData.icTask.trim()) {
      setError('내부통제업무를 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      // 1. HodICItem 데이터 저장
      const requestData: HodICItemCreateRequest = {
        responsibilityId: formData.responsibilityId as number,
        deptCd: formData.deptCd,
        fieldTypeCd: formData.fieldTypeCd,
        roleTypeCd: formData.roleTypeCd,
        icTask: formData.icTask,
        measureDesc: formData.measureDesc,
        measureType: formData.measureType,
        periodCd: formData.periodCd,
        supportDoc: formData.supportDoc,
        checkPeriod: formData.checkPeriod,
        checkWay: formData.checkWay,
        proofDoc: [...formData.attachments.map(att => att.originalFilename), ...formData.evidenceFiles.map(file => file.name)].join(', '),
      };

      let savedItemId: number;
      if (isCreateMode) {
        savedItemId = await hodICItemApi.createHodICItem(requestData);
      } else if (isEditMode && itemId) {
        await hodICItemApi.updateHodICItem(itemId, requestData);
        savedItemId = itemId;
      } else {
        throw new Error('Invalid save mode');
      }

      // 2. 새 파일들 업로드 (evidenceFiles)
      if (formData.evidenceFiles.length > 0) {
        setUploadingFiles(true);
        try {
          const uploadResults = await attachmentApi.uploadFiles(
            formData.evidenceFiles,
            {
              entityType: 'hod_ic_item',
              entityId: savedItemId,
              uploadedBy: 'current_user', // 실제 사용자 ID로 변경 필요
            }
          );

          // 업로드 성공한 파일들 확인
          const successfulUploads = uploadResults.filter((result: AttachmentUploadResult) => result.attachId);
          console.log(`파일 업로드 완료: ${successfulUploads.length}/${uploadResults.length}`);

          // 실패한 파일들이 있으면 경고 표시
          const failedUploads = uploadResults.filter((result: AttachmentUploadResult) => !result.attachId);
          if (failedUploads.length > 0) {
            console.warn('일부 파일 업로드 실패:', failedUploads);
            setError(`일부 파일 업로드에 실패했습니다: ${failedUploads.map((f: AttachmentUploadResult) => f.originalFilename).join(', ')}`);
          }
        } catch (uploadErr) {
          console.error('파일 업로드 중 오류:', uploadErr);
          setError('파일 업로드 중 오류가 발생했습니다.');
        } finally {
          setUploadingFiles(false);
        }
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save item:', err);
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleApprovalRequest = async () => {
    if (!itemId) return;

    setRequestingApproval(true);
    setError(null);

    try {
      await hodICItemApi.requestApproval(itemId);
      alert('승인요청이 완료되었습니다.');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to request approval:', err);
      setError('승인요청 중 오류가 발생했습니다.');
    } finally {
      setRequestingApproval(false);
    }
  };

  // 책무 선택 핸들러
  const handleResponsibilitySelect = (responsibility: ResponsibilitySearchResult) => {
    setFormData(prev => ({
      ...prev,
      responsibilityId: responsibility.responsibilityId,
      responsibilityContent: responsibility.responsibilityContent,
    }));
    setResponsibilitySearchOpen(false);
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
    if (saving || requestingApproval) return;
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth='lg'
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '700px',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle
          component='div'
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--bank-border)',
            pb: 2,
          }}
        >
          <Typography variant='h6'>{title}</Typography>
          <Button
            onClick={handleClose}
            sx={{ minWidth: 'auto', p: 1 }}
            disabled={saving || requestingApproval}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
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
                {/* 책무ID */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label='책무ID *'
                      value={formData.responsibilityContent || `${formData.responsibilityId}`}
                      disabled
                      placeholder='책무를 선택하세요'
                      helperText={
                        formData.responsibilityId ? `책무ID: ${formData.responsibilityId}` : ''
                      }
                    />
                    {!isViewMode && (
                      <Button
                        variant='outlined'
                        onClick={() => setResponsibilitySearchOpen(true)}
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

                {/* 항목구분 */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>항목구분 *</InputLabel>
                    <Select
                      value={formData.fieldTypeCd}
                      label='항목구분 *'
                      onChange={e => handleInputChange('fieldTypeCd', e.target.value)}
                      disabled={isViewMode}
                    >
                      <MenuItem value=''>선택하세요</MenuItem>
                      {getFieldTypeCodes().map(code => (
                        <MenuItem key={code.code} value={code.code}>
                          {code.codeName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* 직무구분 */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>직무구분 *</InputLabel>
                    <Select
                      value={formData.roleTypeCd}
                      label='직무구분 *'
                      onChange={e => handleInputChange('roleTypeCd', e.target.value)}
                      disabled={isViewMode || !formData.fieldTypeCd}
                    >
                      <MenuItem value=''>선택하세요</MenuItem>
                      {getRoleTypeOptions().map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* 내부통제업무 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='내부통제업무 *'
                    value={formData.icTask}
                    onChange={e => handleInputChange('icTask', e.target.value)}
                    disabled={isViewMode}
                    multiline
                    rows={3}
                  />
                </Grid>

                {/* 조치활동 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='조치활동'
                    value={formData.measureDesc}
                    onChange={e => handleInputChange('measureDesc', e.target.value)}
                    disabled={isViewMode}
                    multiline
                    rows={2}
                  />
                </Grid>

                {/* 조치유형 */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='조치유형'
                    value={formData.measureType}
                    onChange={e => handleInputChange('measureType', e.target.value)}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* 주기 */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>주기</InputLabel>
                    <Select
                      value={formData.periodCd}
                      label='주기'
                      onChange={e => handleInputChange('periodCd', e.target.value)}
                      disabled={isViewMode}
                    >
                      <MenuItem value=''>선택하세요</MenuItem>
                      {getCommonCodeOptions('PERIOD').map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* 점검시기 */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>점검시기</InputLabel>
                    <Select
                      value={formData.checkPeriod}
                      label='점검시기'
                      onChange={e => handleInputChange('checkPeriod', e.target.value)}
                      disabled={isViewMode}
                    >
                      <MenuItem value=''>선택하세요</MenuItem>
                      {getCommonCodeOptions('MONTH').map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* 관련근거 */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='관련근거'
                    value={formData.supportDoc}
                    onChange={e => handleInputChange('supportDoc', e.target.value)}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* 점검방법 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='점검방법'
                    value={formData.checkWay}
                    onChange={e => handleInputChange('checkWay', e.target.value)}
                    disabled={isViewMode}
                    multiline
                    rows={2}
                  />
                </Grid>

                {/* 증빙자료 - 기존 첨부파일 목록 */}
                {formData.attachments.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant='subtitle2' sx={{ mb: 1 }}>
                      기존 첨부파일
                    </Typography>
                    <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2 }}>
                      {loadingAttachments ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                          <CircularProgress size={20} />
                          <Typography variant='body2' sx={{ ml: 1 }}>첨부파일 로딩중...</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {formData.attachments.map((attachment) => (
                            <Box
                              key={attachment.attachId}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 1,
                                border: '1px solid #f0f0f0',
                                borderRadius: 1,
                                backgroundColor: '#fafafa',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                <Typography variant='body2' sx={{ fontWeight: 500 }}>
                                  {attachment.originalFilename}
                                </Typography>
                                <Typography variant='caption' sx={{ ml: 2, color: 'text.secondary' }}>
                                  ({(attachment.fileSize / 1024).toFixed(1)}KB)
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size='small'
                                  variant='outlined'
                                  href={attachmentApi.getDownloadUrl(attachment.attachId)}
                                  target='_blank'
                                  sx={{ minWidth: 60 }}
                                >
                                  다운로드
                                </Button>
                                {!isViewMode && (
                                  <Button
                                    size='small'
                                    variant='outlined'
                                    color='error'
                                    onClick={() => handleAttachmentDelete(attachment.attachId)}
                                    sx={{ minWidth: 60 }}
                                  >
                                    삭제
                                  </Button>
                                )}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Grid>
                )}

                {/* 증빙자료 - 새 파일 업로드 */}
                {!isViewMode && (
                  <Grid item xs={12}>
                    <FileUpload
                      label={formData.attachments.length > 0 ? '새 파일 추가' : '증빙자료'}
                      files={formData.evidenceFiles}
                      onFileSelect={handleFileSelect}
                      onFileRemove={handleFileRemove}
                      disabled={isViewMode}
                      multiple
                      maxFiles={5}
                      maxSize={10 * 1024 * 1024} // 10MB
                      accept='.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif'
                      allowedFileTypes={[
                        'pdf',
                        'doc',
                        'docx',
                        'xls',
                        'xlsx',
                        'jpg',
                        'jpeg',
                        'png',
                        'gif',
                      ]}
                      helperText='PDF, Word, Excel, 이미지 파일만 업로드 가능합니다. (최대 10MB)'
                      variant='dropzone'
                      preview
                      showFileList
                      sx={{
                        '& .MuiDropzone-root': {
                          height: '120px',
                          minHeight: 'auto',
                        },
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid var(--bank-border)' }}>
          <Box sx={{ display: 'flex', gap: 1, width: '100%', justifyContent: 'flex-end' }}>
            {isViewMode && canRequestApproval && (
              <Button
                variant='contained'
                color='warning'
                onClick={handleApprovalRequest}
                disabled={requestingApproval}
              >
                {requestingApproval ? '처리중...' : '승인요청'}
              </Button>
            )}

            <Button onClick={handleClose} disabled={saving || requestingApproval}>
              {isViewMode ? '닫기' : '취소'}
            </Button>

            {!isViewMode && (
              <Button variant='contained' onClick={handleSave} disabled={saving || loading}>
                {saving ? '저장중...' : '저장'}
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* 책무 조회 팝업 */}
      <ResponsibilitySearchPopup
        open={responsibilitySearchOpen}
        onClose={() => setResponsibilitySearchOpen(false)}
        onSelect={handleResponsibilitySelect}
        title='책무 조회'
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

export default HodICItemDialog;
