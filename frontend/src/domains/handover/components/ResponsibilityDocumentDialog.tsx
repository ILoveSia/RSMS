/**
 * 책무기술서 다이얼로그
 * 책무기술서 등록/수정/조회 기능을 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 책무기술서 다이얼로그 처리만 담당
 * - Open/Closed: 새로운 필드나 검증 추가 시 확장 가능
 * - Liskov Substitution: React 컴포넌트 인터페이스 준수
 * - Interface Segregation: 다이얼로그 관련 기능만 제공
 * - Dependency Inversion: 훅과 컴포넌트에 의존
 */

import { useReduxState } from '@/app/store/use-store';
import type { CommonCode } from '@/app/types/common';
import {
  ResponsibilitySearchPopup,
  type ResponsibilitySearchResult,
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
import { type ResponsibilityDocumentDto } from '../api/responsibilityDocumentApi';

interface ResponsibilityDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  documentId?: number;
  onSuccess?: () => void;
  apiResponseData?: any;
}

interface FormData {
  positionId: number | '';
  positionName: string;
  responsibilityId: number | '';
  responsibilityContent: string;
  documentTitle: string;
  documentVersion: string;
  documentContent: string;
  status: string;
  effectiveDate: string;
  expiryDate: string;
  authorEmpNo: string;
  authorName: string;
  reviewerEmpNo: string;
  reviewerName: string;
  approverEmpNo: string;
  approverName: string;
}

const initialFormData: FormData = {
  positionId: '',
  positionName: '',
  responsibilityId: '',
  responsibilityContent: '',
  documentTitle: '',
  documentVersion: 'v1.0',
  documentContent: '',
  status: 'DRAFT',
  effectiveDate: '',
  expiryDate: '',
  authorEmpNo: '',
  authorName: '',
  reviewerEmpNo: '',
  reviewerName: '',
  approverEmpNo: '',
  approverName: '',
};

const ResponsibilityDocumentDialog: React.FC<ResponsibilityDocumentDialogProps> = ({
  open,
  onClose,
  mode: initialMode,
  documentId,
  onSuccess,
  apiResponseData,
}) => {
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>(initialMode);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 팝업 상태들
  const [responsibilitySearchOpen, setResponsibilitySearchOpen] = useState(false);

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

      // 공통코드 처리
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
  const loadDocumentData = useCallback(async () => {
    if (!documentId) return;

    setLoading(true);
    setError(null);
    try {
      let documentData: ResponsibilityDocumentDto | null = null;

      // API 응답 데이터에서 해당 문서 찾기
      if (apiResponseData?.content && Array.isArray(apiResponseData.content)) {
        documentData = apiResponseData.content.find(
          (doc: ResponsibilityDocumentDto) => doc.documentId === documentId
        );
      }

      // 문서 데이터를 폼에 매핑
      if (documentData) {
        setFormData({
          positionId: documentData.positionId || '',
          positionName: documentData.positionName || '',
          responsibilityId: documentData.responsibilityId || '',
          responsibilityContent: '',
          documentTitle: documentData.documentTitle || '',
          documentVersion: documentData.documentVersion || 'v1.0',
          documentContent: documentData.documentContent || '',
          status: documentData.status || 'DRAFT',
          effectiveDate: documentData.effectiveDate || '',
          expiryDate: documentData.expiryDate || '',
          authorEmpNo: documentData.authorEmpNo || '',
          authorName: documentData.authorName || '',
          reviewerEmpNo: documentData.reviewerEmpNo || '',
          reviewerName: documentData.reviewerName || '',
          approverEmpNo: documentData.approverEmpNo || '',
          approverName: documentData.approverName || '',
        });
      }

    } catch (err) {
      console.error('Failed to load document data:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [documentId, apiResponseData]);

  // initialMode이 변경될 때 내부 mode 상태 업데이트
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // 데이터 로드
  useEffect(() => {
    if (open && documentId && (isEditMode || isViewMode)) {
      loadDocumentData();
    } else if (open && isCreateMode) {
      setFormData(initialFormData);
      setError(null);
    }
  }, [
    open,
    documentId,
    mode,
    isEditMode,
    isViewMode,
    isCreateMode,
    loadDocumentData,
    apiResponseData,
  ]);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.positionId) {
      setError('직위를 선택해주세요.');
      return false;
    }
    if (!formData.responsibilityId) {
      setError('책무를 선택해주세요.');
      return false;
    }
    if (!formData.documentTitle.trim()) {
      setError('문서 제목을 입력해주세요.');
      return false;
    }
    if (!formData.documentContent.trim()) {
      setError('문서 내용을 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError(null);

    try {
      if (isCreateMode) {
        // TODO: 실제 API 호출로 대체
      } else if (isEditMode && documentId) {
        // TODO: 실제 API 호출로 대체
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save document:', err);
      setError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
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
        maxWidth='lg'
        mode={mode}
        title={mode === 'create' ? '책무기술서 등록' : mode === 'edit' ? '책무기술서 수정' : '책무기술서 조회'}
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
                {/* 직위 */}
                <Grid item xs={12} sm={6}>
                  <Select
                    value={formData.positionId}
                    label='직위 *'
                    options={[
                      { value: '', label: '선택하세요' },
                      ...getCommonCodeOptions('POSITION_TYPE')
                    ]}
                    onChange={(value) => {
                      const positionId = value as string;
                      const positionName = getCommonCodeOptions('POSITION_TYPE').find(opt => opt.value === positionId)?.label || '';
                      handleInputChange('positionId', Number(positionId));
                      handleInputChange('positionName', positionName);
                    }}
                    disabled={isViewMode}
                  />
                </Grid>

                {/* 책무 */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label='책무 *'
                      value={formData.responsibilityContent || `${formData.responsibilityId}`}
                      disabled
                      placeholder='책무를 선택하세요'
                      helperText={
                        formData.responsibilityId ? `책무ID: ${formData.responsibilityId}` : ''
                      }
                      mode="view"
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

                {/* 문서 제목 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='문서 제목 *'
                    value={formData.documentTitle}
                    onChange={e => handleInputChange('documentTitle', e.target.value)}
                    disabled={isViewMode}
                    mode={isViewMode ? "view" : "edit"}
                  />
                </Grid>

                {/* 문서 버전 */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='문서 버전'
                    value={formData.documentVersion}
                    onChange={e => handleInputChange('documentVersion', e.target.value)}
                    disabled={isViewMode}
                    mode={isViewMode ? "view" : "edit"}
                  />
                </Grid>

                {/* 상태 */}
                <Grid item xs={12} sm={6}>
                  <Select
                    value={formData.status}
                    label='상태'
                    options={[
                      { value: '', label: '선택하세요' },
                      ...getCommonCodeOptions('RESPONSIBILITY_STATUS')
                    ]}
                    onChange={(value) => handleInputChange('status', value as string)}
                    disabled={isViewMode}
                  />
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
                    mode={isViewMode ? "view" : "edit"}
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
                    mode={isViewMode ? "view" : "edit"}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                {/* 문서 내용 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='문서 내용 *'
                    value={formData.documentContent}
                    onChange={e => handleInputChange('documentContent', e.target.value)}
                    disabled={isViewMode}
                    mode={isViewMode ? "view" : "edit"}
                    multiline
                    rows={12}
                    placeholder='문서의 상세 내용을 마크다운 형식으로 작성하세요.'
                  />
                </Grid>

                {/* 작성자 */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='작성자'
                    value={formData.authorName}
                    disabled
                    mode="view"
                    helperText={formData.authorEmpNo ? `사번: ${formData.authorEmpNo}` : ''}
                  />
                </Grid>

                {/* 검토자 */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='검토자'
                    value={formData.reviewerName}
                    disabled
                    mode="view"
                    helperText={formData.reviewerEmpNo ? `사번: ${formData.reviewerEmpNo}` : ''}
                  />
                </Grid>

                {/* 승인자 */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='승인자'
                    value={formData.approverName}
                    disabled
                    mode="view"
                    helperText={formData.approverEmpNo ? `사번: ${formData.approverEmpNo}` : ''}
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

      {/* 책무 조회 팝업 */}
      <ResponsibilitySearchPopup
        open={responsibilitySearchOpen}
        onClose={() => setResponsibilitySearchOpen(false)}
        onSelect={handleResponsibilitySelect}
        title='책무 조회'
      />
    </>
  );
};

export default ResponsibilityDocumentDialog;