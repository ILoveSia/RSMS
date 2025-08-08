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

import type { SelectOption } from '@/shared/types/common';
import { Search as SearchIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  CircularProgress,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Select } from '@/shared/components/ui/form';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import { TextField } from '@/shared/components/ui/data-display/';
import { DatePicker } from '@/shared/components/ui/form';
import EmployeeSearchPopup, { type EmployeeSearchResult } from '@/domains/common/components/search/EmployeeSearchPopup';
import React, { useCallback, useEffect, useState } from 'react';
import { ResponsibilityDocumentApi, type ResponsibilityDocumentDto, type ResponsibilityDocument } from '../api/responsibilityDocumentApi';

interface ResponsibilityDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  documentId?: number;
  onSuccess?: () => void;
  apiResponseData?: any;
}

interface FormData {
  documentTitle: string;
  documentVersion: string;
  documentContent: string;
  status: string;
  effectiveDate: Date | null;
  expiryDate: Date | null;
  authorEmpNo: string;
  authorName: string;
  reviewerEmpNo: string;
  reviewerName: string;
  approverEmpNo: string;
  approverName: string;
}

const initialFormData: FormData = {
  documentTitle: '',
  documentVersion: 'v1.0',
  documentContent: '',
  status: 'DRAFT',
  effectiveDate: null,
  expiryDate: null,
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

  // 사원 검색 팝업 상태
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
          documentTitle: documentData.documentTitle || '',
          documentVersion: documentData.documentVersion || 'v1.0',
          documentContent: documentData.documentContent || '',
          status: documentData.status || 'DRAFT',
          effectiveDate: parseDate(documentData.effectiveDate),
          expiryDate: parseDate(documentData.expiryDate),
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

  const handleInputChange = (field: keyof FormData, value: string | number | Date | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 날짜 문자열을 Date 객체로 변환하는 헬퍼 함수 (로컬 시간대 유지)
  const parseDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    // YYYY-MM-DD 형식의 문자열을 로컬 시간대로 파싱
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day); // month는 0부터 시작하므로 -1
  };

  // Date 객체를 YYYY-MM-DD 문자열로 변환하는 헬퍼 함수 (로컬 시간대 유지)
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const validateForm = (): boolean => {
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
      const requestData: ResponsibilityDocument = {
        documentTitle: formData.documentTitle,
        documentVersion: formData.documentVersion,
        documentContent: formData.documentContent,
        status: formData.status as 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED',
        effectiveDate: formatDate(formData.effectiveDate),
        expiryDate: formatDate(formData.expiryDate),
        authorEmpNo: formData.authorEmpNo,
        reviewerEmpNo: formData.reviewerEmpNo,
        approverEmpNo: formData.approverEmpNo,
      };

      if (isCreateMode) {
        await ResponsibilityDocumentApi.createDocument(requestData);
      } else if (isEditMode && documentId) {
        await ResponsibilityDocumentApi.updateDocument(documentId, requestData);
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

  // 사원 선택 핸들러
  const handleAuthorSelect = (employee: EmployeeSearchResult) => {
    setFormData(prev => ({
      ...prev,
      authorEmpNo: employee.num,
      authorName: employee.username,
    }));
    setAuthorSearchOpen(false);
  };

  const handleReviewerSelect = (employee: EmployeeSearchResult) => {
    setFormData(prev => ({
      ...prev,
      reviewerEmpNo: employee.num,
      reviewerName: employee.username,
    }));
    setReviewerSearchOpen(false);
  };

  const handleApproverSelect = (employee: EmployeeSearchResult) => {
    setFormData(prev => ({
      ...prev,
      approverEmpNo: employee.num,
      approverName: employee.username,
    }));
    setApproverSearchOpen(false);
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

                {/* 문서 제목 */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='문서 제목 *'
                    value={formData.documentTitle}
                    onChange={e => handleInputChange('documentTitle', e.target.value)}
                    disabled={isViewMode}
                    mode={isViewMode ? "readonly" : "editable"}
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
                    mode={isViewMode ? "readonly" : "editable"}
                  />
                </Grid>

                {/* 상태 */}
                <Grid item xs={12} sm={6}>
                  <Select
                    value={formData.status}
                    label='상태'
                    options={
                      isCreateMode
                        ? [{ value: 'DRAFT', label: '초안' }]
                        : getCommonCodeOptions('RESPONSIBILITY_STATUS')
                    }
                    onChange={(value) => handleInputChange('status', value as string)}
                    disabled={isViewMode || isCreateMode}
                  />
                </Grid>

                {/* 시행일 */}
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label='시행일'
                    fullWidth
                    value={formData.effectiveDate}
                    onChange={(date) => handleInputChange('effectiveDate', date)}
                    disabled={isViewMode}
                    mode={isViewMode ? "readonly" : "editable"}
                  />
                </Grid>

                {/* 만료일 */}
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label='만료일'
                    fullWidth
                    value={formData.expiryDate}
                    onChange={(date) => handleInputChange('expiryDate', date)}
                    disabled={isViewMode}
                    mode={isViewMode ? "readonly" : "editable"}
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
                    mode={isViewMode ? "readonly" : "editable"}
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
                    disabled={isViewMode}
                    mode={isViewMode ? "readonly" : "editable"}
                    helperText={formData.authorEmpNo ? `사번: ${formData.authorEmpNo}` : ''}
                    InputProps={{
                      endAdornment: !isViewMode && (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setAuthorSearchOpen(true)}
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

                {/* 검토자 */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='검토자'
                    value={formData.reviewerName}
                    disabled={isViewMode}
                    mode={isViewMode ? "readonly" : "editable"}
                    helperText={formData.reviewerEmpNo ? `사번: ${formData.reviewerEmpNo}` : ''}
                    InputProps={{
                      endAdornment: !isViewMode && (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setReviewerSearchOpen(true)}
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

                {/* 승인자 */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label='승인자'
                    value={formData.approverName}
                    disabled={isViewMode}
                    mode={isViewMode ? "readonly" : "editable"}
                    helperText={formData.approverEmpNo ? `사번: ${formData.approverEmpNo}` : ''}
                    InputProps={{
                      endAdornment: !isViewMode && (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setApproverSearchOpen(true)}
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

      {/* 사원 검색 팝업들 */}
      <EmployeeSearchPopup
        open={authorSearchOpen}
        onClose={() => setAuthorSearchOpen(false)}
        onSelect={handleAuthorSelect}
        title="작성자 검색"
      />

      <EmployeeSearchPopup
        open={reviewerSearchOpen}
        onClose={() => setReviewerSearchOpen(false)}
        onSelect={handleReviewerSelect}
        title="검토자 검색"
      />

      <EmployeeSearchPopup
        open={approverSearchOpen}
        onClose={() => setApproverSearchOpen(false)}
        onSelect={handleApproverSelect}
        title="승인자 검색"
      />
    </>
  );
};

export default ResponsibilityDocumentDialog;