/**
 * 책무기술서 다이얼로그
 * 책무기술서 등록/수정/조회 기능을 제공합니다.
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
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import { TextField } from '@/shared/components/ui/data-display/';
import ApprovalActionButton from '@/shared/components/approval/ApprovalActionButton';
import { DatePicker } from '@/shared/components/ui/form';
import EmployeeSearchPopup, { type EmployeeSearchResult } from '@/domains/common/components/search/EmployeeSearchPopup';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { ResponsibilityDocumentApi, type ResponsibilityDocumentDto, type ResponsibilityDocument } from '../api/responsibilityDocumentApi';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import Toast from '@/shared/components/ui/feedback/Toast';
import FileUpload ,{type FileUploadHandle} from '@/shared/components/ui/form/FileUpload';
import { getAttachments } from '@/domains/common/api/attachmentApi';
import type { AttachmentType } from '@/domains/report/pages/types';

interface ResponsibilityDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  documentId?: number;
  approvalStatus?: string;
  onSuccess?: () => void;
  apiResponseData?: any;
}

// CommonAttachmentInfo를 그대로 사용
type AttachmentInfo = AttachmentType;

interface FormData {
  documentTitle: string;
  documentVersion: string;
  documentContent: string;
  effectiveDate: Date | null;
  expiryDate: Date | null;
  authorEmpNo: string;
  authorName: string;
}

const initialFormData: FormData = {
  documentTitle: '',
  documentVersion: 'v1.0',
  documentContent: '',
  effectiveDate: null,
  expiryDate: null,
  authorEmpNo: '',
  authorName: '',
};

// LoginUser 타입 (loginStore용)
interface LoginUser {
  userid: string;
  username: string;
  email: string;
  empNo: string;     // 사번 (employee.emp_no)
  deptCd: string;    // 부서코드 (employee.dept_code)
  positionCode: string; // 직급코드 (employee.position_code)
  role?: string;
  accessibleMenus?: any[];
}

const ResponsibilityDocumentDialog: React.FC<ResponsibilityDocumentDialogProps> = ({
  open,
  onClose,
  mode: initialMode,
  documentId,
  approvalStatus,
  onSuccess,
  apiResponseData,
}) => {
  const [mode, setMode] = useState<'create' | 'edit' | 'view'>(initialMode);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로그인 사용자 정보 가져오기
  const { data: loginData } = useReduxState<LoginUser>('loginStore/login');
  const currentUserId = loginData?.userid || null;

  // 사원 검색 팝업 상태
  const [authorSearchOpen, setAuthorSearchOpen] = useState(false);
  
  // 첨부파일 상태
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<AttachmentType | null>(null);
  // 알림 처리
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const [uploadedAttachId, setUploadedAttachId] = useState<number | null>(null);
  const handleFileSubmit = useCallback((attachId: number | null) => {
    setUploadedAttachId(attachId);
  }, []);

  // 공통코드 Store에서 데이터 가져오기
  const { data: allCodes } = useReduxState<{ data: CommonCode[] } | CommonCode[]>(
    'codeStore/allCodes'
  );

  const isViewMode = mode === 'view';
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';

  // 결재 상신 버튼 표시 여부 판단
  const shouldShowApprovalButton = () => {
    return (approvalStatus === 'NONE' || !approvalStatus) && documentId;
  };

  // 결재현황 버튼 표시 여부 판단 (결재가 진행중일 때)
  const shouldShowApprovalStatusButton = () => {
    return approvalStatus !== 'NONE' && approvalStatus && documentId;
  };

  // 수정 버튼 표시 여부 판단 - 결재상태가 NONE일 때만 수정 가능
  const shouldShowEditButton = () => {
    return approvalStatus === 'NONE' || approvalStatus === null || approvalStatus === undefined;
  };

  // 저장 버튼 표시 여부 판단 - 결재상태가 NONE이고 편집모드 또는 생성모드일 때 저장 가능
  const shouldShowSaveButton = () => {
    return (approvalStatus === 'NONE' || approvalStatus === null || approvalStatus === undefined) && (isEditMode || isCreateMode);
  };

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
          effectiveDate: parseDate(documentData.effectiveDate),
          expiryDate: parseDate(documentData.expiryDate),
          authorEmpNo: documentData.authorEmpNo || '',
          authorName: documentData.authorName || '',
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
    if (open) {
      // 다이얼로그가 열릴 때 mode를 initialMode로 리셋
      setMode(initialMode);
      
      if (documentId && (initialMode === 'edit' || initialMode === 'view')) {
        loadDocumentData();
        // loadAttachments는 loadDocumentData 완료 후 별도 useEffect에서 호출
      } else if (initialMode === 'create') {
        setFormData(initialFormData);
        setError(null);
        setAttachments(null);
      }
    }
  }, [
    open,
    documentId,
    initialMode,
    loadDocumentData,
    apiResponseData,
  ]);

  // 첨부파일 로드
  const loadAttachments = useCallback(async () => {
    if (!documentId) return;
    try {
      const attachmentList = await getAttachments('responsibility_documents', documentId);
      setAttachments(attachmentList || null);
    } catch (err) {
      console.error('첨부파일 로드 실패:', err);
      // 첨부파일 로드 실패는 무시 (선택사항)
    }
  }, [documentId]);

  // 첨부파일 로드 (documentId가 있을 때만)
  useEffect(() => {
    if (open && documentId && (mode === 'edit' || mode === 'view')) {
      loadAttachments();
    }
  }, [open, documentId, mode, loadAttachments]);

  // 생성 모드에서 현재 로그인 사용자로 작성자 설정
  useEffect(() => {
    if (isCreateMode && currentUserId) {
      setFormData(prev => ({
        ...prev,
        authorEmpNo: currentUserId,
        // 사용자명은 별도 API 호출이 필요하므로 여기서는 설정하지 않음
      }));
    }
  }, [isCreateMode, currentUserId]);

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
        effectiveDate: formatDate(formData.effectiveDate),
        expiryDate: formatDate(formData.expiryDate),
        authorEmpNo: formData.authorEmpNo || currentUserId || '',
        status: 'DRAFT', // 기본값으로 DRAFT 설정
      };

      if (isCreateMode) {
        const result = await ResponsibilityDocumentApi.createDocument(requestData);
        // 파일 업로드 처리
        await fileUploadRef.current?.handleSubmit(result.documentId!, 'create');
        showSuccess('문서가 성공적으로 생성되었습니다.');
      } else if (isEditMode && documentId) {
        await ResponsibilityDocumentApi.updateDocument(documentId, requestData);
        // 파일 업로드 처리
        await fileUploadRef.current?.handleSubmit(documentId, 'edit');
        showSuccess('문서가 성공적으로 수정되었습니다.');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to save document:', err);
      setError('저장 중 오류가 발생했습니다.');
      showError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };



  const handleClose = () => {
    if (saving) return;
    // 다이얼로그 닫힐 때 mode를 initialMode로 리셋
    setMode(initialMode);
    // 파일 상태 초기화
    setSelectedFile(null);
    setUploadingFiles(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      authorEmpNo: employee.empNo,
      authorName: employee.username,
    }));
    setAuthorSearchOpen(false);
  };

  // 커스텀 액션 버튼들 생성
  const renderCustomActions = () => {
    const actions = [];

    // 결재 상신 버튼 (approvalStatus가 NONE이고 documentId가 있을 때)
    if (shouldShowApprovalButton() && documentId) {
      actions.push(
        <ApprovalActionButton
          key="approval-submit"
          taskType="responsibility_documents"
          taskId={documentId}
          taskTitle={`책무기술서 - ${formData.documentTitle || '문서명'}`}
          currentUserId={currentUserId || ''}
          onApprovalStateChange={() => {
            onSuccess?.(); // 부모 컴포넌트에 상태 변경 알림
          }}
          size="medium"
          variant="contained"
          disabled={loading || !currentUserId}
        />
      );
    }

    // 결재현황 버튼 (approvalStatus가 NONE이 아니고 documentId가 있을 때 - 결재가 진행중)
    if (shouldShowApprovalStatusButton() && documentId) {
      actions.push(
        <ApprovalActionButton
          key="approval-status"
          taskType="responsibility_documents"
          taskId={documentId}
          taskTitle={`책무기술서 - ${formData.documentTitle || '문서명'}`}
          currentUserId={currentUserId || ''}
          onApprovalStateChange={() => {
            onSuccess?.(); // 부모 컴포넌트에 상태 변경 알림
          }}
          size="medium"
          variant="outlined"
          disabled={loading || !currentUserId}
        />
      );
    }

    return actions.length > 0 ? actions : undefined;
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
        title={(() => {
          if (mode === 'create') return '책무기술서 등록';
          if (mode === 'edit') return '책무기술서 수정';
          return '책무기술서 조회';
        })()}
        customActions={renderCustomActions()}
        showEditButton={shouldShowEditButton()}
        showSaveButton={shouldShowSaveButton()}
      >
        <DialogContent sx={{
          p: 3,
          // view 모드에서 텍스트 스타일 진하게 통일
          ...(isViewMode && {
            '& .MuiInputBase-input[disabled]': {
              fontWeight: '600 !important',
              color: 'var(--bank-text-primary) !important',
              WebkitTextFillColor: 'var(--bank-text-primary) !important',
              opacity: '1 !important',
            },
            '& .MuiInputBase-input.Mui-disabled': {
              fontWeight: '600 !important',
              color: 'var(--bank-text-primary) !important',
              WebkitTextFillColor: 'var(--bank-text-primary) !important',
              opacity: '1 !important',
            },
            '& .MuiTextField-root .MuiInputBase-input': {
              fontWeight: '600 !important',
              color: 'var(--bank-text-primary) !important',
              WebkitTextFillColor: 'var(--bank-text-primary) !important',
              opacity: '1 !important',
            },
            '& .MuiSelect-select.Mui-disabled': {
              fontWeight: '600 !important',
              color: 'var(--bank-text-primary) !important',
              WebkitTextFillColor: 'var(--bank-text-primary) !important',
              opacity: '1 !important',
            },
            '& .MuiSelect-select[disabled]': {
              fontWeight: '600 !important',
              color: 'var(--bank-text-primary) !important',
              WebkitTextFillColor: 'var(--bank-text-primary) !important',
              opacity: '1 !important',
            },
            '& .MuiInputBase-inputMultiline[disabled]': {
              fontWeight: '600 !important',
              color: 'var(--bank-text-primary) !important',
              WebkitTextFillColor: 'var(--bank-text-primary) !important',
              opacity: '1 !important',
            },
            '& .MuiInputBase-inputMultiline.Mui-disabled': {
              fontWeight: '600 !important',
              color: 'var(--bank-text-primary) !important',
              WebkitTextFillColor: 'var(--bank-text-primary) !important',
              opacity: '1 !important',
            },
            '& .MuiInputLabel-root.Mui-disabled': {
              color: 'var(--bank-text-secondary) !important',
              opacity: '1 !important',
            },
            '& .MuiFormHelperText-root': {
              color: 'var(--bank-text-secondary) !important',
              opacity: '1 !important',
            },
            '& .MuiOutlinedInput-input[disabled]': {
              fontWeight: '600 !important',
              color: 'var(--bank-text-primary) !important',
              WebkitTextFillColor: 'var(--bank-text-primary) !important',
              opacity: '1 !important',
            },
            // placeholder 색 가시성 유지
            '& .MuiInputBase-input::placeholder': {
              color: 'var(--bank-text-secondary) !important',
              opacity: '1 !important',
            },
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

                {/* 작성자 */}
                <Grid item xs={12} sm={6}>
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

                

                {/* 첨부파일 섹션 */}
                <Grid item xs={12}>
                <FileUpload
                ref={fileUploadRef}
                existingFiles={attachments}
                onSubmit={handleFileSubmit}
                entityType="responsibility_documents"
                uploadedBy="system"
                entityId={documentId}
                readonly={isViewMode}
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

      {/* Toast 알림 */}
      <Toast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </>
  );
};

export default ResponsibilityDocumentDialog;