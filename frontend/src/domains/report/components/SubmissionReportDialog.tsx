import React, { useState, useCallback, useEffect } from 'react';
import {
  Button,
  TextField,
  Box,
  Alert,
  Typography,
} from '@mui/material';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import DatePicker from '@/shared/components/ui/form/DatePicker';
import { useApiWithNotification } from '@/shared/hooks/useApiWithNotification';
import { submissionReportApi } from '../api/submissionReportApi';
import { uploadAttachment } from '@/domains/common/api/attachmentApi';
import { AttachmentList } from '@/shared/components/ui/data-display';
import type { AttachmentInfo } from '@/domains/common/api/attachmentApi';

interface SubmissionReportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'create' | 'edit' | 'view';
  reportId?: number;
  initialData?: {
    submissionReportId?: number;
    baseDate: string;
    targetInstitution: string;
    attachments?: { originalFilename: string }[];
  };
  onModeChange?: (mode: 'create' | 'edit' | 'view') => void;
  loading?: boolean;
}

const SubmissionReportDialog: React.FC<SubmissionReportDialogProps> = ({
  open,
  onClose,
  onSuccess,
  mode = 'create',
  reportId,
  initialData,
  onModeChange,
  loading = false,
}) => {
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [targetInstitution, setTargetInstitution] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 초기 데이터 설정
  useEffect(() => {
    if (initialData) {
      setBaseDate(initialData.baseDate ? new Date(initialData.baseDate) : new Date());
      setTargetInstitution(initialData.targetInstitution || '');
    } else if (mode === 'create') {
      setBaseDate(new Date());
      setTargetInstitution('');
      setSelectedFile(null);
    }
  }, [initialData, mode]);

  const { callApiWithNotification: callRegisterApi } = useApiWithNotification({
    successMessage: mode === 'create' ? '보고서가 성공적으로 등록되었습니다.' : '보고서가 성공적으로 수정되었습니다.',
    errorMessage: mode === 'create' ? '보고서 등록 실패' : '보고서 수정 실패',
  });

  const uploadFileToEntity = useCallback(async (file: File | null, entityId: number): Promise<boolean> => {
    if (!file) {
      return true; // 성공
    }
    
    setUploadError(null); // 오류 상태 초기화
    
    try {
      await uploadAttachment(file, {
        entityType: 'SUBMISSION_REPORT',
        entityId: entityId,
        uploadedBy: 'system' // TODO: Replace with actual user ID
      });
    } catch (error: any) {
      console.error('File upload failed:', file.name, error);
      
      // 오류 메시지 추출
      let errorMessage = '파일 업로드에 실패했습니다.';
      
      console.log('Upload error details:', {
        error,
        response: error?.response,
        data: error?.response?.data,
        status: error?.response?.status
      });
      
      // HTTP 상태 코드별 오류 메시지 처리
      if (error?.response?.status === 400) {
        // 400 Bad Request - 파일 검증 오류
        if (error?.response?.data?.message) {
          errorMessage = `${file.name}: ${error.response.data.message}`;
        } else if (error?.response?.data?.error) {
          errorMessage = `${file.name}: ${error.response.data.error}`;
        } else {
          errorMessage = `${file.name}: 파일 형식이나 크기가 올바르지 않습니다.`;
        }
      } else if (error?.response?.status === 413) {
        // 413 Payload Too Large - 파일 크기 초과
        errorMessage = `${file.name}: 파일 크기가 너무 큽니다. (최대 10MB)`;
      } else if (error?.response?.data?.message) {
        errorMessage = `${file.name}: ${error.response.data.message}`;
      } else if (error?.response?.data?.error) {
        errorMessage = `${file.name}: ${error.response.data.error}`;
      } else if (error?.response?.message) {
        errorMessage = `${file.name}: ${error.response.message}`;
      } else if (error?.message) {
        errorMessage = `${file.name}: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage = `${file.name}: ${error}`;
      }
      
      setUploadError(errorMessage);
      return false; // 실패
    }
    
    return true; // 성공
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      // 파일 검증
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif'];
      
      // 파일 크기 검증
      if (file.size > maxSize) {
        setUploadError(`${file.name}: 파일 크기가 너무 큽니다. (최대 10MB)`);
        return;
      }
      
      // 파일 확장자 검증
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedTypes.includes(extension)) {
        setUploadError(`${file.name}: 허용되지 않는 파일 형식입니다. 허용 형식: ${allowedTypes.join(', ')}`);
        return;
      }
      
      setUploadError(null); // 검증 통과 시 오류 메시지 초기화
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
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
          // 2. 파일 업로드
          if (selectedFile) {
            const uploadSuccess = await uploadFileToEntity(selectedFile, result.submissionReportId);
            if (!uploadSuccess) {
              return; // 파일 업로드 실패 시 저장 프로세스 중단
            }
          }

          onSuccess();
          // 성공 후 상태 초기화
          setBaseDate(new Date());
          setTargetInstitution('');
          setSelectedFile(null);
          setUploadError(null);
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
          // 파일 업로드
          if (selectedFile) {
            const uploadSuccess = await uploadFileToEntity(selectedFile, reportId);
            if (!uploadSuccess) {
              return; // 파일 업로드 실패 시 저장 프로세스 중단
            }
          }

          onSuccess();
          // 성공 후 상태 초기화
          setBaseDate(new Date());
          setTargetInstitution('');
          setSelectedFile(null);
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
  }, [mode, baseDate, targetInstitution, selectedFile, uploadFileToEntity, callRegisterApi, onSuccess, onClose, reportId, onModeChange]);

  // 모드별 제목 설정
  const getTitle = () => {
    switch (mode) {
      case 'create': return '제출 보고서 등록';
      case 'edit': return '제출 보고서 수정';
      case 'view': return '제출 보고서 상세보기';
      default: return '제출 보고서';
    }
  };

  // 다이얼로그 닫기 핸들러
  const handleClose = () => {
    // 모든 상태 초기화
    setBaseDate(new Date());
    setTargetInstitution('');
    setSelectedFile(null);
    setUploadError(null);
    
    if (mode === 'edit' && onModeChange) {
      onModeChange('view');
      return;
    }
    onClose();
  };

  const isReadOnly = mode === 'view';

  // 선택된 파일을 AttachmentInfo 형식으로 변환
  const selectedFileToAttachment = (): AttachmentInfo | null => {
    if (!selectedFile) return null;
    
    return {
      attachId: 0,
      originalFilename: selectedFile.name,
      storedFilename: '',
      fileSize: selectedFile.size,
      entityType: 'SUBMISSION_REPORT',
      entityId: 0,
      uploadedBy: 'system',
      createdAt: new Date().toISOString(),
    };
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
          disabled={isReadOnly}
        />
        
        {/* 파일 업로드 오류 표시 */}
        {uploadError && (
          <Alert severity="error" onClose={() => setUploadError(null)}>
            {uploadError}
          </Alert>
        )}
        
        {/* 파일 업로드는 생성/수정 모드에서만 */}
        {!isReadOnly && (
          <>
            <Button variant="contained" component="label">
              파일 선택
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
            {selectedFile && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  선택된 파일:
                </Typography>
                <AttachmentList
                  attachments={[selectedFileToAttachment() as AttachmentInfo]}
                  mode="register"
                  onDownload={() => {
                    // 파일 다운로드 로직 (새 파일이라 실제 다운로드 불가능)
                  }}
                  onDelete={() => {
                    setSelectedFile(null);
                  }}
                />
              </Box>
            )}
          </>
        )}

        {/* 기존 첨부파일 표시 (상세보기/수정 모드)
        {(mode === 'view' || mode === 'edit') && initialData?.attachments && initialData.attachments.length > 0 && (
          <Box>
            <strong>첨부파일:</strong>
            <ul>
              {initialData.attachments.map((attachment, index) => (
                <li key={index}>{attachment.originalFilename}</li>
              ))}
            </ul>
          </Box>
        )} */}
      </Box>
    </BaseDialog>
  );
};

export default SubmissionReportDialog;