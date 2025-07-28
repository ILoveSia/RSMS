/**
 * 책무구조도 제출 등록/수정/조회 다이얼로그 컴포넌트
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import { deleteAttachment, downloadAttachment, getAttachments, uploadAttachment, type AttachmentInfo } from '@/domains/common/api/attachmentApi';
import { EmployeeSearchPopup, PositionSearchPopup, type EmployeeSearchResult, type PositionSearchResult } from '@/domains/common/components/search';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import TextField from '@/shared/components/ui/data-display/TextField';
import { DatePicker } from '@/shared/components/ui/form';
import type { SelectOption } from '@/shared/types/common';
import { AttachFile as AttachFileIcon, Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import { Box, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';

interface RegistrationData {
  submitHistCd: string;
  execofficerId?: string | null; // 직원 ID 추가
  historyCode: SelectOption | null;
  executiveName: SelectOption | null;
  position: SelectOption | null;
  submissionDate: Date;
  attachmentFile: string;
  remarks: SelectOption | null;

  // positions 테이블 정보
  positionsId?: number | null;
  positionsNm?: string;
  ledgerOrder?: string;
}

interface StructureSubmissionStatusDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RegistrationData) => Promise<{ id: number }>;
  loading: boolean;
  mode?: 'create' | 'edit' | 'view';
  itemId?: number;
  initialData?: RegistrationData;
  onModeChange?: (mode: 'create' | 'edit' | 'view') => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx'];

const StructureSubmissionStatusDialog: React.FC<StructureSubmissionStatusDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
  mode = 'create',
  itemId,
  initialData,
  onModeChange
}) => {
  // 등록 폼 데이터
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    submitHistCd: '',
    execofficerId: null,
    historyCode: null,
    executiveName: null,
    position: null,
    submissionDate: new Date(),
    attachmentFile: '',
    remarks: null,
    positionsId: null,
    positionsNm: '',
    ledgerOrder: ''
  });

  // 첨부파일 관련 상태
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 에러 다이얼로그 상태
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  // 직원 검색 팝업 상태
  const [employeePopupOpen, setEmployeePopupOpen] = useState(false);

  // 직책 검색 팝업 상태
  const [positionPopupOpen, setPositionPopupOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 초기 데이터 설정 및 첨부파일 로드
  useEffect(() => {
    if (initialData) {
      setRegistrationData({
        submitHistCd: initialData.submitHistCd,
        execofficerId: initialData.execofficerId,
        historyCode: initialData.historyCode,
        executiveName: initialData.executiveName,
        position: initialData.position,
        submissionDate: initialData.submissionDate,
        attachmentFile: initialData.attachmentFile,
        remarks: initialData.remarks,
        positionsId: initialData.positionsId,
        positionsNm: initialData.positionsNm,
        ledgerOrder: initialData.ledgerOrder,
      });
    }

    // 기존 데이터의 첨부파일 로드 (edit/view 모드)
    if (itemId && mode !== 'create') {
      loadAttachments();
    }
  }, [initialData, itemId, mode]);

  // 첨부파일 목록 로드
  const loadAttachments = async () => {
    if (!itemId) return;

    try {
      const attachmentList = await getAttachments('LEDGER_MGMT_STRUCTURE_SUBMISSION', itemId);
      setAttachments(attachmentList);
    } catch (error) {
      console.error('첨부파일 목록 로드 실패:', error);
    }
  };


  // 파일 선택 핸들러
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
    setRegistrationData(prev => ({
      ...prev,
      attachmentFile: file.name
    }));
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async () => {
    if (!selectedFile || !itemId) return;

    try {
      setUploadingFile(true);
      console.log("selectedFile",selectedFile);
      await uploadAttachment(selectedFile, {
        entityType: 'audit_prog_mngt_detail',
        entityId: itemId,
        uploadedBy: 'system'
      });

      setSelectedFile(null);
      setRegistrationData(prev => ({ ...prev, attachmentFile: '' }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // 첨부파일 목록 새로고침
      await loadAttachments();
    } catch (error) {
      setErrorMessage('파일 업로드에 실패했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setUploadingFile(false);
    }
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
      await loadAttachments();
    } catch (error) {
      setErrorMessage('파일 삭제에 실패했습니다.');
      setErrorDialogOpen(true);
    }
  };

  // 직원 선택 핸들러
  const handleEmployeeSelect = (employee: EmployeeSearchResult | EmployeeSearchResult[]) => {
    if (!Array.isArray(employee)) {
      setRegistrationData(prev => ({
        ...prev,
        execofficerId: employee.id, // 직원 ID 저장
        executiveName: { value: employee.username, label: employee.username },
        position: { value: employee.jobTitleCd, label: employee.jobTitleCd }
      }));
      setEmployeePopupOpen(false);
    }
  };

  // 직책 선택 핸들러
  const handlePositionSelect = (position: PositionSearchResult) => {
    setRegistrationData(prev => ({
      ...prev,
      position: { value: position.positionsNm, label: position.positionsNm },
      positionsId: position.positionsId,
      positionsNm: position.positionsNm,
      ledgerOrder: position.ledgerOrder
    }));
    setPositionPopupOpen(false);
  };

  // 폼 유효성 검사
  const validateForm = (data: RegistrationData): boolean => {

    if (!data.executiveName) {
      setErrorMessage('제출 대상 임원을 선택해주세요.');
      setErrorDialogOpen(true);
      return false;
    }

    if (!data.position) {
      setErrorMessage('직책을 선택해주세요.');
      setErrorDialogOpen(true);
      return false;
    }

    // if (!data.attachmentFile) {
    //   setErrorMessage('책무구조도 파일을 첨부해주세요.');
    //   setErrorDialogOpen(true);
    //   return false;
    // }

    return true;
  };

  // 제출 핸들러
  const handleSubmit = async () => {
    if (!validateForm(registrationData)) return;

    try {
      // 먼저 기본 데이터 저장하고 생성된 ID 받기
      const result = await onSubmit(registrationData);

      // 새로 선택한 파일이 있으면 첨부파일 업로드
      if (selectedFile && mode !== 'view') {
        const targetEntityId = mode === 'edit' && itemId ? itemId : result?.id;
        
        if (targetEntityId) {
          try {
            await uploadAttachment(selectedFile, {
              entityType: 'LEDGER_MGMT_STRUCTURE_SUBMISSION',
              entityId: targetEntityId,
              uploadedBy: 'system'
            });
          } catch (uploadError) {
            throw uploadError; // 에러를 다시 던져서 전체 처리 실패로 만듦
          }
        }
      }

      onClose(); // 성공 시 다이얼로그 닫기
    } catch (error) {
      console.error('제출 중 오류:', error); // 디버깅용 로그
      setErrorMessage('저장 중 오류가 발생했습니다.');
      setErrorDialogOpen(true);
    }
  };



  // 모드별 제목 설정
  const getTitle = () => {
    switch (mode) {
      case 'create': return '책무구조도 제출 등록';
      case 'edit': return '책무구조도 제출 수정';
      case 'view': return '책무구조도 제출 상세보기';
      default: return '책무구조도 제출 등록';
    }
  };

  // 모드별 버튼 텍스트 설정
  const getButtonText = () => {
    switch (mode) {
      case 'create': return '등록';
      case 'edit': return '수정';
      case 'view': return '닫기';
      default: return '등록';
    }
  };

  const isViewMode = mode === 'view';

  return (
    <BaseDialog
      open={open}
      mode={mode}
      title={getTitle()}
      maxWidth="sm"
      onClose={onClose}
      loading={loading}
      customActions={
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', }}>
          {isViewMode && onModeChange && (
            <Button
              variant="contained"
              size="medium"
              onClick={() => onModeChange('edit')}
              color="primary"
              sx={{ mr: 1 }}
            >
              수정
            </Button>
          )}
          {!isViewMode && (
            <Button
              variant="contained"
              size="medium"
              onClick={handleSubmit}
              color="primary"
              disabled={loading}
              sx={{ mr: 1 }}
            >
              {getButtonText()}
            </Button>
          )}
          <Button
            variant="contained"
            size="medium"
            onClick={onClose}
            color="secondary"
          >
            {isViewMode ? '닫기' : '취소'}
          </Button>
        </Box>
      }
    >
      <Box sx={{

        backgroundColor: '#ffffff',
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '16px',
        alignItems: 'center'
      }}>
        {/* 제출이력 코드 */}
        <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
          제출이력 코드
        </Typography>
        <TextField
          value={registrationData.submitHistCd}
          placeholder="자동생성됩니다"
          size="small"
          disabled={true}
          sx={{ backgroundColor: '#f5f5f5' }}
        />

        {/* 제출 대상 임원 */}
        <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
          제출 대상 임원
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            value={registrationData.executiveName?.label || ''}
            placeholder="제출 대상 임원을 선택하세요"
            size="small"
            disabled={true}
            sx={{ minWidth: '300px', backgroundColor: '#f5f5f5' }}
          />
          {mode !== 'view' && (
            <Button
              variant="contained"
              size="small"
              onClick={() => setEmployeePopupOpen(true)}
            >
              검색
            </Button>
          )}
        </Box>

        {/* 직책 */}
        <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
          제출 대상 임원 직책
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            value={registrationData.position?.label || ''}
            placeholder="직책을 선택하세요"
            size="small"
            disabled={true}
            sx={{ minWidth: '300px', backgroundColor: '#f5f5f5' }}
          />
          {mode !== 'view' && (
            <Button
              variant="contained"
              size="small"
              onClick={() => setPositionPopupOpen(true)}
            >
              검색
            </Button>
          )}
        </Box>

        {/* 책무구조도 제출일 */}
        <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
          책무구조도 제출일
        </Typography>
        <DatePicker
          value={registrationData.submissionDate}
          onChange={(date) => {
            setRegistrationData(prev => ({ ...prev, submissionDate: date || new Date() }));
          }}
          size="small"
        />

        {/* 책무구조도 첨부 */}
        <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
          책무구조도 첨부
        </Typography>
        <Box>
          {/* 새 파일 업로드 (create/edit 모드) */}
          {mode !== 'view' && (
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
                    {itemId && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleFileUpload}
                        disabled={uploadingFile}
                      >
                        {uploadingFile ? '업로드 중...' : '업로드'}
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
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

        {/* 비고 */}
        <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
          비고
        </Typography>
        <TextField
          value={registrationData.remarks?.label || ''}
          onChange={(e) => {
            const value = e.target.value;
            setRegistrationData(prev => ({
              ...prev,
              remarks: value ? { value, label: value } : null
            }));
          }}
          placeholder="비고를 입력하세요"
          multiline
          rows={4}
          disabled={mode === 'view'}
          fullWidth
        />
      </Box>

      {/* 직원 검색 팝업 */}
      <EmployeeSearchPopup
        open={employeePopupOpen}
        onClose={() => setEmployeePopupOpen(false)}
        onSelect={handleEmployeeSelect}
      />

      {/* 직책 검색 팝업 */}
      <PositionSearchPopup
        open={positionPopupOpen}
        onClose={() => setPositionPopupOpen(false)}
        onSelect={handlePositionSelect}
        title="직책 검색"
      />

      {/* 에러 다이얼로그 */}
      <ErrorDialog
        open={errorDialogOpen}
        errorMessage={errorMessage}
        onClose={() => setErrorDialogOpen(false)}
      />
    </BaseDialog>
  );
};

export default StructureSubmissionStatusDialog;
