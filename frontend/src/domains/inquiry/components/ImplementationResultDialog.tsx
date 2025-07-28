/**
 * 이행결과 작성 다이얼로그 컴포넌트
 * 미흡상황에 대한 이행결과를 작성하는 팝업
 */
import BaseDialog from '@/shared/components/modal/BaseDialog';
import TextField from '@/shared/components/ui/data-display/TextField';
import { attachmentApi } from '@/shared/api/attachmentApi';
import type { AttachmentResponse } from '@/shared/api/attachmentApi';
import { deleteAttachment, downloadAttachment, getAttachments, uploadAttachment, type AttachmentInfo } from '@/domains/common/api/attachmentApi';
import ErrorDialog from '@/app/components/ErrorDialog';
import { Box, Typography, Divider, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Chip } from '@mui/material';
import { AttachFile as AttachFileIcon, Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import React, { useState, useCallback, useRef, useEffect } from 'react';

// 파일 업로드 관련 상수
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx'];

export interface ImplementationResultData {
  id: number;
  auditProgMngtId: number;  // 점검계획 ID 추가
  deficiencyContent: string;
  improvementPlan: string;
  auditDetailCoantent?: string;
  auditDoneContent?: string;
  auditDoneDt?: string;
  implementationStatus?: string;
  attachments?: AttachmentResponse[];
}

export interface ImplementationResultDialogProps {
  /** 다이얼로그 열림 상태 */
  open: boolean;
  /** 다이얼로그 닫기 핸들러 */
  onClose: () => void;
  /** 선택된 미흡상황 데이터 */
  data?: ImplementationResultData;
  /** 저장 핸들러 */
  onSave: (data: ImplementationResultData) => Promise<void>;
  /** 모드 (create/edit/view) */
  mode?: 'create' | 'edit' | 'view';
}

const ImplementationResultDialog: React.FC<ImplementationResultDialogProps> = ({
  open,
  onClose,
  data,
  onSave,
  mode = 'create',
}) => {
  const [auditDoneContent, setAuditDoneContent] = useState<string>('');
  const [auditDoneDt, setAuditDoneDt] = useState<Date | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  
  // 첨부파일 관련 상태
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);



  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 에러 다이얼로그 상태
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  // 첨부파일 목록 로드
  const loadAttachments = useCallback(async () => {
    if (!data?.auditProgMngtId) {
      return;
    }

    try {
      const attachmentList = await getAttachments('audit_prog_mngt_detail', data.auditProgMngtId);
      setAttachments(attachmentList);
    } catch (error) {
      console.error('첨부파일 목록 로드 실패:', error);
    }
  }, [data?.auditProgMngtId]);

  // 다이얼로그가 열릴 때 데이터 초기화
  React.useEffect(() => {
    if (open && data) {
      setAuditDoneContent(data.auditDoneContent || '');
      setAuditDoneDt(data.auditDoneDt ? new Date(data.auditDoneDt) : null);
    }

    // 기존 데이터의 첨부파일 로드 (edit/view 모드)
    if (data?.auditProgMngtId && mode !== 'create') {
      loadAttachments();
    }

    // 다이얼로그가 닫힐 때 파일 선택 상태 초기화
    if (!open) {
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open, data, mode, loadAttachments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage('파일 크기는 10MB를 초과할 수 없습니다.');
      setErrorDialogOpen(true);
      return;
    }

    // 파일 타입 검증
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
      setErrorMessage('허용된 파일 형식은 PDF, DOC, DOCX입니다.');
      setErrorDialogOpen(true);
      return;
    }

    setSelectedFile(file);
  };



  // 파일 다운로드 핸들러
  const handleFileDownload = async (attachment: AttachmentInfo) => {
    try {
      const blob = await downloadAttachment(attachment.attachId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.originalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setErrorMessage('파일 다운로드에 실패했습니다.');
      setErrorDialogOpen(true);
    }
  };

  // 파일 삭제 핸들러
  const handleFileDelete = async (attachmentId: number) => {
    if (!confirm('첨부파일을 삭제하시겠습니까?')) return;

    try {
      await deleteAttachment(attachmentId, 'system');
      
      // 첨부파일 목록 새로고침
      try {
        await loadAttachments();
        // 파일 삭제 후 선택된 파일도 초기화
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (refreshError) {
        console.error('첨부파일 목록 새로고침 실패:', refreshError);
        setErrorMessage('파일이 삭제되었지만 목록 새로고침에 실패했습니다.');
        setErrorDialogOpen(true);
      }
    } catch (error) {
      setErrorMessage('파일 삭제에 실패했습니다.');
      setErrorDialogOpen(true);
    }
  };
  // 저장 핸들러
  const handleSave = useCallback(async () => {
    if (!data) return;

    if (!auditDoneContent.trim()) {
      setErrorMessage('이행결과를 입력해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    setLoading(true);
    try {
      const updatedData: ImplementationResultData = {
        ...data,
        auditDoneContent: auditDoneContent.trim(),
        auditDoneDt: auditDoneDt ? auditDoneDt.toISOString().split('T')[0] : '',
        implementationStatus: '완료', // 기본값으로 완료 설정
      };

      // 먼저 기본 데이터 저장
      await onSave(updatedData);

      // 새로 선택한 파일이 있고, 기존 파일이 없을 때만 첨부파일 업로드
      if (selectedFile && mode !== 'view' && data.auditProgMngtId && attachments.length === 0) {
        try {
          await uploadAttachment(selectedFile, {
            entityType: 'audit_prog_mngt_detail',
            entityId: data.auditProgMngtId,
            uploadedBy: 'system'
          });
        } catch (uploadError) {
          console.error('첨부파일 업로드 실패:', uploadError);
          setErrorMessage('첨부파일 업로드에 실패했습니다.');
          setErrorDialogOpen(true);
          return;
        }
      }

      // 파일 선택 상태 초기화
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onClose(); // 성공 시 다이얼로그 닫기
    } catch (error) {
      console.error('이행결과 저장 실패:', error);
      setErrorMessage('이행결과 저장에 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setLoading(false);
    }
  }, [data, auditDoneContent, auditDoneDt, onSave, onClose, selectedFile, mode]);

  return (
    <>
      <BaseDialog
        open={open}
        onClose={onClose}
        title="이행결과 작성"
        maxWidth="md"
        mode="create"
        onSave={handleSave}
        disableSave={loading || !auditDoneContent.trim()}
        loading={loading}
      >
        {/* 미흡사항 정보 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            미흡사항
          </Typography>
          <Box sx={{
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.300'
          }}>
            <Typography variant="body2">
              {data?.deficiencyContent || '미흡사항 내용이 없습니다.'}
            </Typography>
          </Box>
        </Box>

        {/* 개선계획 세부내용 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            개선계획 세부내용
          </Typography>
          <Box sx={{
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.300'
          }}>
            <Typography variant="body2">
              {data?.auditDetailCoantent || '개선계획 세부내용이 없습니다.'}
            </Typography>
          </Box>
        </Box>

        {/* 이행완료 예정일자 (읽기 전용) */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            이행완료 예정일자
          </Typography>
          <Box sx={{
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.300'
          }}>
            <Typography variant="body2">
              {auditDoneDt ? auditDoneDt.toLocaleDateString('ko-KR') : '예정일자가 설정되지 않았습니다.'}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 이행결과 입력 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
            이행결과 <span style={{ color: 'red' }}>*</span>
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            value={auditDoneContent}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuditDoneContent(e.target.value)}
            placeholder="이행결과를 상세히 입력해주세요."
            variant="outlined"
            size="small"
          />
        </Box>

        {/* 첨부파일 섹션 */}
        <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
          책무구조도 첨부
        </Typography>
        <Box>
          {/* 새 파일 업로드 (create/edit 모드) - 기존 파일이 없을 때만 표시 */}
          {mode !== 'view' && attachments.length === 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ mb: 1, fontSize: '0.8rem', color: '#666' }}>새 파일 업로드</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={<AttachFileIcon />}
                >
                  파일 선택
                </Button>
                {selectedFile && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '0.8rem' }}>{selectedFile.name}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* 기존 파일이 있을 때 안내 메시지 */}
          {mode !== 'view' && attachments.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                이미 첨부된 파일이 있습니다. 새 파일을 업로드하려면 기존 파일을 먼저 삭제해주세요.
              </Typography>
            </Box>
          )}

          {/* 기존 첨부파일 목록 */}
          {attachments.length > 0 && (
            <Box>
              <Typography sx={{ mb: 1, fontSize: '0.8rem', color: '#666' }}>첨부파일 목록</Typography>
              <List dense>
                {attachments.map((attachment) => (
                  <ListItem key={attachment.attachId} sx={{ px: 0, py: 0.5, border: '1px solid #e0e0e0', borderRadius: 1, mb: 0.5 }}>
                    <ListItemText
                      primary={attachment.originalFilename}
                      secondary={`${(attachment.fileSize / 1024).toFixed(1)} KB • ${new Date(attachment.createdAt).toLocaleDateString()}`}
                      primaryTypographyProps={{ fontSize: '0.8rem' }}
                      secondaryTypographyProps={{ fontSize: '0.7rem' }}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        size="small"
                        onClick={() => handleFileDownload(attachment)}
                        title="다운로드"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      {mode !== 'view' && (
                        <IconButton
                          size="small"
                          onClick={() => handleFileDelete(attachment.attachId)}
                          title="삭제"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {attachments.length === 0 && !selectedFile && (
            <Typography sx={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>
              첨부된 파일이 없습니다.
            </Typography>
          )}
        </Box>
      </BaseDialog>

      {/* 에러 다이얼로그 */}
      <ErrorDialog
        open={errorDialogOpen}
        errorMessage={errorMessage}
        onClose={() => setErrorDialogOpen(false)}
      />
    </>
  );
};

export default ImplementationResultDialog;