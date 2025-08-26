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
import ApprovalActionButton from '@/shared/components/approval/ApprovalActionButton';
import { DatePicker } from '@/shared/components/ui/form';
import EmployeeSearchPopup, { type EmployeeSearchResult } from '@/domains/common/components/search/EmployeeSearchPopup';
import DepartmentSearchPopup, { type Department } from '@/domains/common/components/search/DepartmentSearchPopup';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { internalControlManualApi, type InternalControlManualDto, type ApprovalStartRequestDto } from '../api/internalControlManualApi';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import Toast from '@/shared/components/ui/feedback/Toast';
import { uploadAttachment, getAttachments, downloadAttachment, deleteAttachment } from '@/domains/common/api/attachmentApi';
import FileUpload, { type FileUploadHandle } from '@/shared/components/ui/form/FileUpload';
import type { AttachmentType } from '@/domains/report/pages/types';

interface InternalControlManualDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  manualId?: number;
  approvalStatus?: string;
  onSuccess?: () => void;
  apiResponseData?: any;
}


interface FormData {
  manualTitle: string;
  manualVersion: string;
  manualContent: string;
  effectiveDate: Date | null;
  expiryDate: Date | null;
  authorEmpNo: string;
  authorName: string;
  deptCd: string;
  deptName: string;
}

const initialFormData: FormData = {
  manualTitle: '',
  manualVersion: 'v1.0',
  manualContent: '',
  effectiveDate: null,
  expiryDate: null,
  authorEmpNo: '',
  authorName: '',
  deptCd: '',
  deptName: '',
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

const InternalControlManualDialog: React.FC<InternalControlManualDialogProps> = ({
  open,
  onClose,
  mode: initialMode,
  manualId,
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
  
  // 부서 검색 팝업 상태
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false);
  
  // 첨부파일 상태
  const [attachments, setAttachments] = useState<AttachmentType | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    return (approvalStatus === 'NONE' || !approvalStatus) && manualId;
  };

  // 결재현황 버튼 표시 여부 판단 (결재가 진행중일 때)
  const shouldShowApprovalStatusButton = () => {
    return approvalStatus !== 'NONE' && approvalStatus && manualId;
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
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map(code => ({
          value: code.detailCode,
          label: code.detailCodeName,
        }));

      return options;
    },
    [getCodesArray]
  );

  // 폼 데이터 업데이트 함수
  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // 날짜 문자열을 Date 객체로 변환하는 헬퍼 함수 (로컬 시간대 유지)
  const parseDate = (dateString: string | null | undefined): Date | null => {
    if (!dateString) return null;
    // YYYY-MM-DD 형식의 문자열을 로컬 시간대로 파싱
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day); // month는 0부터 시작하므로 -1
  };

  // 메뉴얼 데이터 로드
  const loadManualData = useCallback(async () => {
    if (!manualId) return;

    setLoading(true);
    setError(null);
    try {
      let manualData: InternalControlManualDto | null = null;

      // API 응답 데이터에서 해당 메뉴얼 찾기
      if (apiResponseData?.content && Array.isArray(apiResponseData.content)) {
        manualData = apiResponseData.content.find(
          (manual: InternalControlManualDto) => manual.manualId === manualId
        );
      }

      // 메뉴얼 데이터를 폼에 매핑
      if (manualData) {
        setFormData({
          manualTitle: manualData.manualTitle || '',
          manualVersion: manualData.manualVersion || 'v1.0',
          manualContent: manualData.manualContent || '',
          effectiveDate: parseDate(manualData.effectiveDate),
          expiryDate: parseDate(manualData.expiryDate),
          authorEmpNo: manualData.authorEmpNo || '',
          authorName: manualData.authorName || '',
          deptCd: manualData.deptCd || '',
          deptName: manualData.deptName || '',
        });
      }
    } catch (err) {
      console.error('메뉴얼 데이터 로드 실패:', err);
      setError('메뉴얼 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [manualId, apiResponseData]);

  // 첨부파일 로드
  const loadAttachments = useCallback(async () => {
    if (!manualId) return;
    try {
      const attachmentList = await getAttachments('internal_control_manuals', manualId);
      setAttachments(attachmentList || null);
    } catch (err) {
      console.error('첨부파일 로드 실패:', err);
      // 첨부파일 로드 실패는 무시 (선택사항)
    }
  }, [manualId]);

  // initialMode이 변경될 때 내부 mode 상태 업데이트
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // 다이얼로그 열릴 때 데이터 로드
  useEffect(() => {
    if (open) {
      // 다이얼로그가 열릴 때 mode를 initialMode로 리셋
      setMode(initialMode);
      
      if (manualId && (initialMode === 'edit' || initialMode === 'view')) {
        loadManualData();
      } else if (initialMode === 'create') {
        setFormData(initialFormData);
        setError(null);
        setAttachments(null);
      }
    }
  }, [open, manualId, initialMode, loadManualData, apiResponseData]);

  // 첨부파일 로드 (manualId가 있을 때만)
  useEffect(() => {
    if (open && manualId && (mode === 'edit' || mode === 'view')) {
      loadAttachments();
    }
  }, [open, manualId, mode]);

  // 다이얼로그 닫힐 때 초기화
  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setMode(initialMode);
      setError(null);
      setAttachments(null);
      setSelectedFile(null);
    }
  }, [open, initialMode]);

  // 생성 모드에서 현재 로그인 사용자로 작성자 설정
  useEffect(() => {
    if (isCreateMode && currentUserId) {
      setFormData(prev => ({
        ...prev,
        authorEmpNo: currentUserId,
        // 여기서 사용자명도 설정할 수 있지만, 별도 API 호출이 필요할 수 있음
      }));
    }
  }, [isCreateMode, currentUserId]);

  // 저장 함수
  const handleSave = useCallback(async () => {
    if (!formData.manualTitle.trim()) {
      setError('메뉴얼 제목을 입력해주세요.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const saveData: any = {
        manualTitle: formData.manualTitle.trim(),
        manualContent: formData.manualContent || '',
        manualVersion: formData.manualVersion || 'v1.0',
        deptCd: formData.deptCd,
        effectiveDate: formData.effectiveDate ? formData.effectiveDate.toISOString().split('T')[0] : null,
        expiryDate: formData.expiryDate ? formData.expiryDate.toISOString().split('T')[0] : null,
        authorEmpNo: formData.authorEmpNo || currentUserId,
        createdId: currentUserId,
        updatedId: currentUserId,
      };

      if (isCreateMode) {
        const result = await internalControlManualApi.createManual(saveData);
        await fileUploadRef.current?.handleSubmit(result.manualId!, 'create');
        showSuccess('메뉴얼이 성공적으로 생성되었습니다.');
      } else {
        await internalControlManualApi.updateManual(manualId!, saveData);        
        await fileUploadRef.current?.handleSubmit(manualId!, 'edit');
        showSuccess('메뉴얼이 성공적으로 수정되었습니다.');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('저장 실패:', err);
      setError('저장 중 오류가 발생했습니다.');
      showError('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  }, [formData, isCreateMode, manualId, currentUserId, onSuccess, onClose, showSuccess, showError]);

  // 수정 모드로 전환
  const handleEdit = useCallback(() => {
    if (!shouldShowEditButton()) {
      showError('결재 진행 중인 문서는 수정할 수 없습니다.');
      return;
    }
    setMode('edit');
    setError(null);
  }, [shouldShowEditButton, showError]);

  // 취소 함수
  const handleCancel = useCallback(() => {
    if (isEditMode && manualId) {
      setMode('view');
      loadManualData(); // 원래 데이터로 복원
    } else {
      onClose();
    }
  }, [isEditMode, manualId, loadManualData, onClose]);

  // 모드 변경 핸들러
  const handleModeChange = (newMode: 'create' | 'edit' | 'view' | 'onlyRead') => {
    if (newMode === 'onlyRead') {
      setMode('view');
    } else {
      setMode(newMode);
    }
  };

  // 결재 상신 처리
  const handleApprovalStart = useCallback(async () => {
    if (!manualId) {
      showError('메뉴얼 ID가 없습니다.');
      return;
    }

    if (!shouldShowApprovalButton()) {
      showError('결재를 시작할 수 없는 상태입니다.');
      return;
    }

    try {
      const approvalRequest: ApprovalStartRequestDto = {
        taskTypeCode: 'internal_control_manuals',
        taskId: manualId,
        title: `내부통제 업무메뉴얼 결재 - ${formData.manualTitle}`,
        description: `내부통제 업무메뉴얼 "${formData.manualTitle}" 결재를 요청합니다.`
      };

      await internalControlManualApi.startApproval(manualId, approvalRequest);
      showSuccess('결재 요청이 완료되었습니다.');
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('결재 요청 실패:', error);
      showError('결재 요청 중 오류가 발생했습니다.');
    }
  }, [manualId, formData.manualTitle, shouldShowApprovalButton, showSuccess, showError, onSuccess, onClose]);

  // 사원 선택 핸들러
  const handleAuthorSelect = useCallback((employee: EmployeeSearchResult) => {
    updateFormData('authorEmpNo', employee.empNo);
    updateFormData('authorName', employee.username);
    setAuthorSearchOpen(false);
  }, [updateFormData]);

  // 부서 선택 핸들러
  const handleDepartmentSelect = useCallback((departments: Department | Department[]) => {
    const department = Array.isArray(departments) ? departments[0] : departments;
    if (department) {
      updateFormData('deptCd', department.deptCode);
      updateFormData('deptName', department.deptName);
      setDepartmentSearchOpen(false);
    }
  }, [updateFormData]);

  const renderCustomActions = () => {
    const actions = [];

    // 결재 상신 버튼 (approvalStatus가 NONE이고 manualId가 있을 때)
    if (shouldShowApprovalButton() && manualId) {
      actions.push(
        <ApprovalActionButton
          key="approval-submit"
          taskType="internal_control_manuals"
          taskId={manualId}
          taskTitle={`내부통제 업무메뉴얼 - ${formData.manualTitle || '메뉴얼명'}`}
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

    // 결재현황 버튼 (approvalStatus가 NONE이 아니고 manualId가 있을 때 - 결재가 진행중)
    if (shouldShowApprovalStatusButton() && manualId) {
      actions.push(
        <ApprovalActionButton
          key="approval-status"
          taskType="internal_control_manuals"
          taskId={manualId}
          taskTitle={`내부통제 업무메뉴얼 - ${formData.manualTitle || '메뉴얼명'}`}
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

  if (loading) {
    return (
      <BaseDialog
        mode={mode}
        open={open}
        onClose={onClose}
        title="내부통제 업무메뉴얼"
        maxWidth="md"
        showEditButton={false}
        showSaveButton={false}
      >
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        </DialogContent>
      </BaseDialog>
    );
  }

  return (
    <>
      <BaseDialog
        open={open}
        onClose={onClose}
        onSave={handleSave}
        onModeChange={handleModeChange}
        maxWidth="md"
        mode={mode}
        title={(() => {
          if (mode === 'create') return '내부통제 업무메뉴얼 등록';
          if (mode === 'edit') return '내부통제 업무메뉴얼 수정';
          return '내부통제 업무메뉴얼 조회';
        })()}
        customActions={renderCustomActions()}
        showEditButton={shouldShowEditButton()}
        showSaveButton={shouldShowSaveButton()}
      >
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* 메뉴얼 제목 */}
            <Grid item xs={12}>
              <TextField
                mode={mode==='view' ? 'readonly' : 'editable'}
                label="메뉴얼 제목"
                value={formData.manualTitle}
                onChange={(e) => updateFormData('manualTitle', e.target.value)}
                fullWidth
                required
                disabled={isViewMode}
                error={!formData.manualTitle.trim() && formData.manualTitle !== ''}
                helperText={!formData.manualTitle.trim() && formData.manualTitle !== '' ? '메뉴얼 제목을 입력해주세요.' : ''}
              />
            </Grid>

            {/* 메뉴얼 버전 */}
            <Grid item xs={12} sm={6}>
              <TextField
                mode={mode==='view' ? 'readonly' : 'editable'}
                label="메뉴얼 버전"
                value={formData.manualVersion}
                onChange={(e) => updateFormData('manualVersion', e.target.value)}
                fullWidth
                disabled={isViewMode}
              />
            </Grid>

            {/* 부서 */}
            <Grid item xs={12} sm={6}>
              <TextField
                mode={mode==='view' ? 'readonly' : 'editable'}
                fullWidth
                label='부서'
                value={formData.deptName}
                disabled={isViewMode}
                helperText={formData.deptCd ? `부서코드: ${formData.deptCd}` : ''}
                InputProps={{
                  endAdornment: !isViewMode && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setDepartmentSearchOpen(true)}
                        size="small"
                        edge="end"
                        title="부서 검색"
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
                label="시행일"
                fullWidth
                value={formData.effectiveDate}
                onChange={(date) => updateFormData('effectiveDate', date)}
                disabled={isViewMode}
              />
            </Grid>

            {/* 만료일 */}
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="만료일"
                fullWidth
                value={formData.expiryDate}
                onChange={(date) => updateFormData('expiryDate', date)}
                disabled={isViewMode}
              />
            </Grid>

            {/* 작성자 */}
            <Grid item xs={12} sm={6}>
              <TextField
                mode={mode==='view' ? 'readonly' : 'editable'}
                fullWidth
                label='작성자'
                value={formData.authorName}
                disabled={isViewMode}
                helperText={formData.authorEmpNo ? `사번: ${formData.authorEmpNo}` : ''}
                InputProps={{
                  endAdornment: !isViewMode && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setAuthorSearchOpen(true)}
                        size="small"
                        edge="end"
                        title="사원 검색"
                      >
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* 메뉴얼 내용 */}
            <Grid item xs={12}>
              <TextField
                mode={mode==='view' ? 'readonly' : 'editable'}
                label="메뉴얼 내용"
                value={formData.manualContent}
                onChange={(e) => updateFormData('manualContent', e.target.value)}
                fullWidth
                multiline
                rows={6}
                disabled={isViewMode}
              />
            </Grid>
            <Grid item xs={12}>
              <FileUpload
                ref={fileUploadRef}
                existingFiles={attachments}
                onSubmit={handleFileSubmit}
                entityType="internal_control_manuals"
                uploadedBy="system"
                entityId={manualId}
                readonly={isViewMode}
            />
            </Grid>

          </Grid>
        </DialogContent>
      </BaseDialog>

      {/* 사원 검색 팝업 */}
      <EmployeeSearchPopup
        open={authorSearchOpen}
        onClose={() => setAuthorSearchOpen(false)}
        onSelect={handleAuthorSelect}
        title="작성자 검색"
      />
      
      {/* 부서 검색 팝업 */}
      <DepartmentSearchPopup
        open={departmentSearchOpen}
        onClose={() => setDepartmentSearchOpen(false)}
        onSelect={handleDepartmentSelect}
        title="부서 검색"
      />

      {/* 알림 토스트 */}
      <Toast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={hideSnackbar}
      />
    </>
  );
};

export default InternalControlManualDialog;