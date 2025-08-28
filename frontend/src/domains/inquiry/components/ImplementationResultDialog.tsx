/**
 * 이행결과 작성 다이얼로그
 * AuditResultDialog 기반으로 "6. 이행결과 섹션" 추가하여 개선
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  IconButton,
  List,
  ListItem,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { TextField } from '@/shared/components/ui/data-display';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';

// 파일 업로드 관련 상수
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx'];

// 첨부파일 타입 (새로 업로드할 파일)
export interface AttachmentFile {
  id: string;
  file: File;
  name: string;
  size: number;
}

// 통합 첨부파일 타입 (기존 + 새로 업로드)
export interface UnifiedAttachment {
  id: string;
  name: string;
  size: number;
  isExisting: boolean;
  file?: File;              // 새로 업로드할 파일인 경우
  attachId?: number;        // 기존 파일인 경우
  uploadDt?: string;        // 기존 파일인 경우
}

// 이행결과 데이터 타입
export interface ImplementationResultData {
  id: string | number;
  auditProgMngtId: number;
  deficiencyContent: string;    // 미흡사항
  improvementPlan: string;      // 개선계획
  auditDetailContent: string;   // 개선계획 세부내용
  auditDoneContent: string;     // 이행결과 내용 (새로 추가)
  auditDoneDt: string;         // 작성일자
  implementationStatus: string; // 이행상태
  implementationAttachments?: UnifiedAttachment[]; // 이행결과 증빙자료
}

export type DialogMode = 'create' | 'view' | 'edit';

interface ImplementationResultDialogProps {
  open: boolean;
  mode: DialogMode;
  onClose: () => void;
  onSave?: (data: ImplementationResultData) => Promise<void>;
  data?: ImplementationResultData;
  loading?: boolean;
}

const ImplementationResultDialog: React.FC<ImplementationResultDialogProps> = ({
  open,
  mode = 'edit',
  onClose,
  onSave,
  data,
  loading = false,
}) => {
  // 폼 데이터 상태
  const [formData, setFormData] = useState<ImplementationResultData>({
    id: '',
    auditProgMngtId: 0,
    deficiencyContent: '',
    improvementPlan: '',
    auditDetailContent: '',
    auditDoneContent: '',
    auditDoneDt: '',
    implementationStatus: '완료',
    implementationAttachments: [],
  });

  // 첨부파일 관련 상태
  const [attachmentError, setAttachmentError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 유효성 검사 상태
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // 다이얼로그가 열릴 때 데이터 로드
  useEffect(() => {
    if (open && data) {
      setFormData({
        ...data,
        implementationAttachments: data.implementationAttachments || [],
      });
    } else if (open) {
      // create 모드인 경우 폼 초기화
      setFormData({
        id: '',
        auditProgMngtId: 0,
        deficiencyContent: '',
        improvementPlan: '',
        auditDetailContent: '',
        auditDoneContent: '',
        auditDoneDt: '',
        implementationStatus: '완료',
        implementationAttachments: [],
      });
    }
  }, [open, data]);

  // 폼 데이터 변경 처리
  const handleFormChange = (field: keyof ImplementationResultData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // 에러 메시지 클리어
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  // 첨부파일 추가
  const handleFileAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setAttachmentError('');

    // 최대 3개 제한 확인
    const currentAttachments = formData.implementationAttachments || [];
    if (currentAttachments.length + files.length > 3) {
      setAttachmentError('첨부파일은 최대 3개까지 등록 가능합니다.');
      return;
    }

    const newAttachments: UnifiedAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setAttachmentError(`${file.name}은 10MB를 초과할 수 없습니다.`);
        continue;
      }

      newAttachments.push({
        id: `${Date.now()}_${i}`,
        name: file.name,
        size: file.size,
        isExisting: false,
        file,
      });
    }

    setFormData(prev => ({
      ...prev,
      implementationAttachments: [...(prev.implementationAttachments || []), ...newAttachments],
    }));

    // input 초기화
    event.target.value = '';
  };

  // 첨부파일 삭제
  const handleFileRemove = (id: string) => {
    setFormData(prev => ({
      ...prev,
      implementationAttachments: (prev.implementationAttachments || []).filter(att => att.id !== id),
    }));
    setAttachmentError('');
  };



  // 기존 첨부파일 다운로드
  const handleFileDownload = async (attachment: UnifiedAttachment) => {
    if (!attachment.isExisting || !attachment.attachId) {
      console.error('다운로드할 수 없는 파일입니다.');
      return;
    }

    try {
      // TODO: 파일 다운로드 API 구현 필요
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
    }
  };

  // 유효성 검사
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.auditDoneContent.trim()) {
      newErrors.auditDoneContent = '이행결과 내용을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 저장/수정 처리
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // 사용자 정의 onSave 콜백 호출
      if (onSave) {
        await onSave(formData);
      }
      handleClose();
    } catch (error) {
      console.error('이행결과 저장/수정 오류:', error);
      // 에러를 상위로 전파하지 않고 여기서 처리
    }
  };

  // 다이얼로그 닫기
  const handleClose = () => {
    setFormData({
      id: '',
      auditProgMngtId: 0,
      deficiencyContent: '',
      improvementPlan: '',
      auditDetailContent: '',
      auditDoneContent: '',
      auditDoneDt: '',
      implementationStatus: '완료',
      implementationAttachments: [],
    });
    setErrors({});
    setAttachmentError('');
    onClose();
  };

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 모드별 제목 설정
  const getDialogTitle = () => {
    switch (mode) {
      case 'view': return '이행결과 상세조회';
      case 'edit': return '이행결과 수정';
      default: return '이행결과 작성';
    }
  };

  // 저장 가능 여부
  const canSave = mode !== 'view' && formData.auditDoneContent.trim() !== '';

  return (
    <BaseDialog
      open={open}
      mode={mode}
      onClose={handleClose}
      onSave={handleSave}
      title={getDialogTitle()}
      maxWidth="lg"
      fullWidth
      loading={loading}
      showEditButton={false}
      disableSave={loading || !canSave}
      contentSx={{
        p: 0,
        overflow: 'hidden',
        height: 'calc(90vh - 180px)',
      }}
    >
      <Box sx={{ 
        p: 2, 
        height: '100%',
        overflow: 'auto',
        '&::-webkit-scrollbar': { width: '8px' },
        '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
        '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '4px' }
      }}>
        
        {/* 1. 미흡사항 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" component="div" gutterBottom>
            1. 미흡사항
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="미흡사항"
                value={formData.deficiencyContent}
                fullWidth
                multiline
                rows={3}
                size="small"
                mode="readonly"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* 2. 개선계획 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" component="div" gutterBottom>
            2. 개선계획
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="개선계획 세부내용"
                value={formData.auditDetailContent}
                fullWidth
                multiline
                rows={4}
                size="small"
                mode="readonly"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* 3. 점검 수행 증빙자료 (기존) - 읽기전용 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" component="div" gutterBottom>
            3. 점검 수행 증빙자료
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="body2" color="text.secondary">
            기존 점검 시 첨부된 증빙자료 (읽기 전용)
          </Typography>
          {/* TODO: 기존 첨부파일 목록 표시 */}
        </Paper>

        {/* 4. 개선계획 (기존) - 읽기전용 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" component="div" gutterBottom>
            4. 개선계획 (승인됨)
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="승인된 개선계획"
                value={formData.auditDetailContent}
                fullWidth
                multiline
                rows={3}
                size="small"
                mode="readonly"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* 5. 개선계획 (참조용) - 읽기전용 */}
        <Paper sx={{ 
          p: 2, 
          mb: 3, 
          opacity: 0.7,
          backgroundColor: '#f5f5f5'
        }}>
          <Typography variant="h6" component="div" gutterBottom>
            5. 개선계획 (참조용)
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="개선계획 세부내용"
                value={formData.auditDetailContent}
                fullWidth
                multiline
                rows={3}
                size="small"
                mode="readonly"
                disabled
              />
            </Grid>
          </Grid>
        </Paper>

        {/* 6. 이행결과 섹션 (새로 추가) */}
        <Paper sx={{ p: 2, mb: 3, border: '2px solid', borderColor: 'primary.main' }}>
          <Typography variant="h6" component="div" gutterBottom color="primary">
            6. 이행결과
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="이행결과 내용 *"
                value={formData.auditDoneContent}
                onChange={(e) => {
                  handleFormChange('auditDoneContent', e.target.value);
                }}
                fullWidth
                multiline
                rows={5}
                error={!!errors.auditDoneContent}
                helperText={errors.auditDoneContent}
                mode={mode === 'view' ? 'readonly' : 'editable'}
                placeholder="개선계획의 이행 결과를 구체적으로 작성해주세요."
              />
            </Grid>
          </Grid>

          {/* 이행결과 증빙자료 */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" component="div" gutterBottom>
              이행결과 증빙자료
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 2 }}>
              <input
                accept="*/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                multiple
                type="file"
                onChange={handleFileAdd}
              />
              <Button
                variant="outlined"
                startIcon={<AttachFileIcon />}
                disabled={(formData.implementationAttachments || []).length >= 3 || mode === 'view'}
                onClick={() => {
                  fileInputRef.current?.click();
                }}
              >
                파일 첨부 ({(formData.implementationAttachments || []).length}/3)
              </Button>
              {attachmentError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {attachmentError}
                </Alert>
              )}
            </Box>

            {(formData.implementationAttachments || []).length > 0 && (
              <List dense>
                {(formData.implementationAttachments || []).map((attachment) => (
                  <ListItem key={attachment.id} divider>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="body2" component="span">
                            {attachment.name}
                          </Typography>
                          {attachment.isExisting && (
                            <Typography variant="caption" component="span" color="primary" sx={{ fontSize: '0.75rem' }}>
                              (기존파일)
                            </Typography>
                          )}
                          {!attachment.isExisting && (
                            <Typography variant="caption" component="span" color="secondary" sx={{ fontSize: '0.75rem' }}>
                              (새파일)
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" component="span">
                            {formatFileSize(attachment.size)}
                          </Typography>
                          {attachment.isExisting && attachment.uploadDt && (
                            <Typography variant="caption" component="span" color="text.secondary">
                              업로드: {attachment.uploadDt}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {attachment.isExisting && (
                          <IconButton
                            size="small"
                            onClick={() => handleFileDownload(attachment)}
                            title="다운로드"
                          >
                            <DownloadIcon />
                          </IconButton>
                        )}
                        <IconButton
                          edge="end"
                          onClick={() => handleFileRemove(attachment.id)}
                          size="small"
                          disabled={mode === 'view'}
                          title="삭제"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Paper>

      </Box>
    </BaseDialog>
  );
};

export default ImplementationResultDialog;