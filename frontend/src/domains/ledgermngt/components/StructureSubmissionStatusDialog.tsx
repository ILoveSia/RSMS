/**
 * 책무구조도 제출 등록/수정/조회 다이얼로그 컴포넌트
 */
import { apiClient } from '@/app/common/api/client';
import ErrorDialog from '@/app/components/ErrorDialog';
import { getAttachments } from '@/domains/common/api/attachmentApi';
import { EmployeeSearchPopup, PositionSearchPopup, type EmployeeSearchResult, type PositionSearchResult } from '@/domains/common/components/search';
import type { AttachmentType } from '@/domains/report/pages/types';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';

import TextField from '@/shared/components/ui/data-display/TextField';
import FileUpload, { type FileUploadHandle } from '@/shared/components/ui/form/FileUpload';
import { DatePicker } from '@/shared/components/ui/form';
import type { SelectOption } from '@/shared/types/common';

import { Box, Typography } from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  ledgerOrders?: number;
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



// 임원 정보 인터페이스
interface ExecutiveInfo {
  execofficerId: string;
  empName: string;
  empNo: string;
}

// 직책 ID로 임원 정보 조회 API
const fetchExecutiveByPositionId = async (positionsId: number): Promise<ExecutiveInfo | null> => {
  try {
    const response = await apiClient.get<ExecutiveInfo>(`/positions/${positionsId}/executive`);
    return response || null;
  } catch (error) {
    console.error('임원 정보 조회 오류:', error);
    return null;
  }
};

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
    ledgerOrders: 0
  });

  // 첨부파일 관련 상태
  const [attachments, setAttachments] = useState<AttachmentType | null>(null);
  const fileUploadRef = useRef<FileUploadHandle>(null);
  const [uploadedAttachId, setUploadedAttachId] = useState<number | null>(null);

  // 에러 다이얼로그 상태
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  // 직원 검색 팝업 상태
  const [employeePopupOpen, setEmployeePopupOpen] = useState(false);

  // 직책 검색 팝업 상태
  const [positionPopupOpen, setPositionPopupOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // FileUpload 컴포넌트용 핸들러
  const handleFileSubmit = useCallback((attachId: number | null) => {
    setUploadedAttachId(attachId);
  }, []);

  // readonly 상태 계산
  const isFileUploadReadonly = mode === 'view';

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
        ledgerOrders: initialData.ledgerOrders,
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
      const attachmentList = await getAttachments('structure_submit', itemId);
      setAttachments(attachmentList || null);
      
      // 첨부파일이 있으면 폼 데이터에도 반영
      if (attachmentList) {
        setRegistrationData(prev => ({
          ...prev,
          attachmentFile: attachmentList.originalFilename
        }));
      }
    } catch (error) {
      console.error('첨부파일 목록 로드 실패:', error);
      setAttachments(null);
    }
  };




  // 직원 선택 핸들러
  const handleEmployeeSelect = (employee: EmployeeSearchResult | EmployeeSearchResult[]) => {
    if (!Array.isArray(employee)) {
      setRegistrationData(prev => ({
        ...prev,
        execofficerId: employee.id, // 직원 ID 저장
        executiveName: { value: employee.username, label: employee.username },
        position: { value: employee.jobTitleCode, label: employee.jobTitleCode }
      }));
      setEmployeePopupOpen(false);
    }
  };

  // 직책 선택 핸들러
  const handlePositionSelect = async (position: PositionSearchResult) => {
    try {
      // 선택된 직책의 임원 정보를 조회
      const executiveInfo = await fetchExecutiveByPositionId(position.positionsId);

      setRegistrationData(prev => ({
        ...prev,
        position: { value: position.positionsNm, label: position.positionsNm },
        positionsId: position.positionsId,
        positionsNm: position.positionsNm,
        ledgerOrders: position.ledgerOrders,
        // 임원 정보 자동 설정
        execofficerId: executiveInfo?.execofficerId || null,
        executiveName: executiveInfo?.empName ?
          { value: executiveInfo.empName, label: executiveInfo.empName } : null
      }));
    } catch (error) {
      console.error('임원 정보 조회 실패:', error);
      // 임원 정보 조회 실패 시에도 직책 정보는 설정
      setRegistrationData(prev => ({
        ...prev,
        position: { value: position.positionsNm, label: position.positionsNm },
        positionsId: position.positionsId,
        positionsNm: position.positionsNm,
        ledgerOrders: position.ledgerOrders,
        execofficerId: null,
        executiveName: null
      }));
    }
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

      // FileUpload 컴포넌트를 통한 파일 업로드 처리
      if (mode === 'create' && result?.id) {
        await fileUploadRef.current?.handleSubmit(result.id, 'create');
      } else if (mode === 'edit' && itemId) {
        await fileUploadRef.current?.handleSubmit(itemId, 'edit');
      }
      // 모든 작업이 완료된 후 다이얼로그 닫기
      onClose();
    } catch (error) {
      console.error('제출 중 오류:', error);
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

  // 다이얼로그 닫기 핸들러 - 파일 상태 초기화 포함
  const handleClose = () => {
    // 파일 업로드 관련 상태 초기화
    setUploadedAttachId(null);
    setAttachments(null);

    // 에러 상태 초기화
    setErrorMessage('');
    setErrorDialogOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // 생성 모드일 때만 폼 데이터 초기화
    if (mode === 'create') {
      setRegistrationData({
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
        ledgerOrders: 0
      });
    }

    // 수정 모드에서 취소 시 view 모드로 변경
    if (mode === 'edit' && onModeChange) {
      onModeChange('view');
      return;
    }
    onClose();
  };

  return (
    <BaseDialog
      open={open}
      mode={mode}
      title={getTitle()}
      maxWidth="sm"
      onClose={handleClose}
      loading={loading}
      onSave={handleSubmit}
      onModeChange={(m) => onModeChange?.(m as 'create' | 'edit' | 'view')}
    >
      <Box sx={{

        backgroundColor: 'var(--bank-surface)',
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
          label=" "
          value={registrationData.submitHistCd}
          placeholder="자동생성됩니다"
          size="small"
          mode="readonly"
          sx={{ backgroundColor: '#f5f5f5' }}
        />


        {/* 직책 */}
        <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
          제출 대상 임원 직책
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label=" "
            value={registrationData.position?.label || ''}
            placeholder="직책을 선택하세요"
            size="small"
            mode="readonly"
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

        {/* 제출 대상 임원 */}
        <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
          제출 대상 임원
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label=" "
            value={registrationData.executiveName?.label || ''}
            placeholder="제출 대상 임원을 선택하세요"
            size="small"
            mode="readonly"
            sx={{ minWidth: '300px', backgroundColor: '#f5f5f5', width: '100%' }}
          />
          {/* {mode !== 'view' && (
            <Button
              variant="contained"
              size="small"
              onClick={() => setEmployeePopupOpen(true)}
            >
              검색
            </Button>
          )} */}
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
          mode={mode === 'view' ? 'readonly' : 'editable'}
        />

        {/* 책무구조도 첨부 */}
        <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
          책무구조도 첨부
        </Typography>
        <Box>
          <FileUpload
            ref={fileUploadRef}
            existingFiles={attachments}
            onSubmit={handleFileSubmit}
            entityType="structure_submit"
            uploadedBy="system"
            entityId={itemId}
            readonly={isFileUploadReadonly}
          />
        </Box>

        {/* 비고 */}
        <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
          비고
        </Typography>
        <TextField
          label=" "
          value={registrationData.remarks?.label || ''}
          onChange={(e) => {
            const value = e.target.value;
            setRegistrationData(prev => ({
              ...prev,
              remarks: value ? { value, label: value } : null
            }));
          }}
          mode={mode === 'view' ? 'readonly' : 'editable'}
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
