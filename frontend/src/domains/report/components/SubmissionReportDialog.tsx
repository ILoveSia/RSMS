import { downloadAttachment } from '@/domains/common/api/attachmentApi';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import TextField from '@/shared/components/ui/data-display/TextField';
import DatePicker from '@/shared/components/ui/form/DatePicker';
import FileUpload, { type FileUploadHandle } from '@/shared/components/ui/form/FileUpload';
import { useApiWithNotification } from '@/shared/hooks/useApiWithNotification';
import {
  Alert,
  Box
} from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { submissionReportApi } from '../api/submissionReportApi';
import type { SubmissionReportRow } from '../pages/SubmissionReportPage';
import type { AttachmentType } from '../pages/types';

interface SubmissionReportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'create' | 'edit' | 'view';
  reportId?: number;
  dialogData?: SubmissionReportRow | null;
  initialData?: AttachmentType[];
  initialAttachment?: AttachmentType;
  onModeChange?: (mode: 'create' | 'edit' | 'view') => void;
  loading?: boolean;
}

const SubmissionReportDialog: React.FC<SubmissionReportDialogProps> = ({
  open,
  onClose,
  onSuccess,
  mode = 'create',
  reportId,
  dialogData,
  initialData,
  onModeChange,
  loading = false,
}) => {
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [targetInstitution, setTargetInstitution] = useState('');
  const [existingAttachments, setExistingAttachments] = useState<AttachmentType[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<AttachmentType | null>(null);
  const [uploadedAttachId, setUploadedAttachId] = useState<number | null>(null); // FileUpload에서 전달받은 attachId
  const fileUploadRef = useRef<FileUploadHandle>(null);

  // 초기 데이터 설정
  useEffect(() => {
    if (initialData) {
      setExistingAttachments(initialData);
    } else if (mode === 'create') {
      setBaseDate(new Date());
      setTargetInstitution('');
      setExistingAttachments([]);
    }
    
    // dialogData가 있을 경우 baseDate와 targetInstitution 설정
      if (dialogData) {
        setBaseDate(new Date(dialogData.baseDate));
        setTargetInstitution(dialogData.targetInstitution);
        
        // rowIndex 값을 로그로 출력하거나 다른 용도로 사용
        if (dialogData.rowIndex !== undefined) {
        }
      
      if(dialogData.attachments && dialogData.attachments.length > 0){
        setAttachment(dialogData.attachments[0]);
      }
    }
  }, [initialData, mode, dialogData, attachment]);

  const { callApiWithNotification: callRegisterApi } = useApiWithNotification({
    successMessage: mode === 'create' ? '보고서가 성공적으로 등록되었습니다.' : '보고서가 성공적으로 수정되었습니다.',
    errorMessage: mode === 'create' ? '보고서 등록 실패' : '보고서 수정 실패',
  });

  // FileUpload에서 전달받은 attachId를 상태에 저장
  const handleFileSubmit = useCallback((attachId: number | null) => {
    setUploadedAttachId(attachId);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      setUploadError(null); // 저장 시작 시 오류 상태 초기화      
      if (mode === 'create') {
        // 1. 보고서 생성
        const newReport = {
          baseDate: baseDate.toISOString().split('T')[0], // YYYY-MM-DD 형식으로 변환
          targetInstitution,
        };

        const result = await callRegisterApi(() => submissionReportApi.createSubmissionReport(newReport));

        if (result && result.submissionReportId) {
          // 2. 업로드된 파일이 있다면, 엔티티와 연결
          await fileUploadRef.current?.handleSubmit(result.submissionReportId, 'create');

          if (uploadedAttachId) {
            // TODO: 업로드된 파일을 엔티티와 연결하는 API 호출
            // 예: await linkAttachmentToEntity(uploadedAttachId, 'SUBMISSION_REPORT', result.submissionReportId);
          }

          onSuccess();
          // 성공 후 상태 초기화
          setBaseDate(new Date());
          setTargetInstitution('');
          setUploadedAttachId(null);
          setExistingAttachments([]);
          onClose();
        }
      } else if (mode === 'edit' && reportId) {
        // 수정 모드 (TODO: updateSubmissionReport API 추가 필요)
        const updateReport = {
          baseDate: baseDate.toISOString().split('T')[0], // YYYY-MM-DD 형식으로 변환
          targetInstitution,
        };

        const result = await callRegisterApi(() => submissionReportApi.updateSubmissionReport(reportId, updateReport));

        if (result) {
          // 업로드된 파일이 있다면, 엔티티와 연결
          await fileUploadRef.current?.handleSubmit(result.submissionReportId, 'edit');
          if (uploadedAttachId) {
            // TODO: 업로드된 파일을 엔티티와 연결하는 API 호출
            // 예: await linkAttachmentToEntity(uploadedAttachId, 'SUBMISSION_REPORT', reportId);
            console.log('Linking attachment', uploadedAttachId, 'to report', reportId);
          }

          onSuccess();
          // 성공 후 상태 초기화
          setBaseDate(new Date());
          setTargetInstitution('');
          setUploadedAttachId(null);
          setUploadError(null);
          if (onModeChange) {
            onModeChange('view');
          }
        }
      }
    } catch (error) {
      console.error('Save failed:', error);
      // 에러는 useApiWithNotification에서 처리됨
    }
  }, [mode, baseDate, targetInstitution, uploadedAttachId, callRegisterApi, onSuccess, onClose, reportId, onModeChange]);

  // 모드별 제목 설정
  const getTitle = () => {
    switch (mode) {
      case 'create': return '제출 보고서 등록';
      case 'edit': return '제출 보고서 수정';
      case 'view': return '제출 보고서 상세보기';
      default: return '제출 보고서';
    }
  }

  // 다이얼로그 닫기 핸들러
  const handleClose = () => {
    // 모든 상태 초기화
    setBaseDate(new Date());
    setTargetInstitution('');
    setUploadedAttachId(null);
    setExistingAttachments([]);
    setUploadError(null);
    setAttachment(null);
    setUploadError(null);

    if (mode === 'edit' && onModeChange) {
      onModeChange('view');
    }
    
    onClose();
  }

  const isReadOnly = mode === 'view';

  // 기존 첨부파일 다운로드 핸들러
  const handleDownloadExisting = async (file: AttachmentType) => {
    try {
      const blob = await downloadAttachment(file.attachId);
      // 파일 다운로드
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      setUploadError('파일 다운로드에 실패했습니다.');
    }
  };

  // 기존 첨부파일 삭제 핸들러 (임시)
  const handleDeleteExisting = (id: number) => {
    // TODO: 실제 삭제 로직 구현
    setExistingAttachments(prev => prev.filter(f => f.attachId !== id));
  };

  return (
    <BaseDialog
      open={open}
      mode={mode}
      title={getTitle()}
      maxWidth="sm"
      onClose={handleClose}
      loading={loading}
      onSave={handleSave}
      onModeChange={(m) => onModeChange?.(m as 'create' | 'edit' | 'view')}
    >
      <Box sx={{
        backgroundColor: 'var(--bank-surface)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}>
        <DatePicker
          label="기준일"
          value={baseDate}
          onChange={(date: Date | null) => setBaseDate(date || new Date())}
          fullWidth
          mode={isReadOnly ? 'readonly' : 'editable'}
        />
        <TextField
          label="제출대상"
          value={targetInstitution}
          onChange={(e) => setTargetInstitution(e.target.value)}
          fullWidth
          mode={isReadOnly ? 'readonly' : 'editable'}
        />
        
        {/* 파일 업로드 오류 표시 */}
        {uploadError && (
          <Alert severity="error" onClose={() => setUploadError(null)}>
            {uploadError}
          </Alert>
        )}
        <FileUpload 
          ref={fileUploadRef}
          existingFiles={attachment} 
          onSubmit={handleFileSubmit}
          entityType="SUBMISSION_REPORT"
          uploadedBy="system" // TODO: 실제 사용자 ID로 변경
          entityId={dialogData?.submissionReportId}
          readonly={isReadOnly}
        />
        {/* 나머지 UI는 필요에 따라 수정 */}
      </Box>
    </BaseDialog>
  );
};

export default SubmissionReportDialog;