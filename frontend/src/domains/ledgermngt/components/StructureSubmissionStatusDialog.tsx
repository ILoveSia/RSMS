/**
 * 책무구조도 제출 등록/수정/조회 다이얼로그 컴포넌트
 */
import type { EmployeeSearchResult } from '@/app/components/EmployeeSearchPopup';
import EmployeeSearchPopup from '@/app/components/EmployeeSearchPopup';
import ErrorDialog from '@/app/components/ErrorDialog';
import BaseDialog from '@/shared/components/modal/BaseDialog';
import { Button } from '@/shared/components/ui/button';
import { ComboBox, DatePicker } from '@/shared/components/ui/form';
import type { SelectOption } from '@/shared/types/common';
import { Box, Typography } from '@mui/material';
import React, { useRef, useState } from 'react';
import TextField from '@/shared/components/ui/data-display/textfield';
interface RegistrationData {
  historyCode: SelectOption | null;
  executiveName: SelectOption | null;
  position: SelectOption | null;
  submissionDate: Date;
  attachmentFile: string;
  remarks: SelectOption | null;
}

interface StructureSubmissionStatusDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RegistrationData) => Promise<void>;
  loading: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx'];

const StructureSubmissionStatusDialog: React.FC<StructureSubmissionStatusDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading
}) => {
  // 등록 폼 데이터
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    historyCode: null,
    executiveName: null,
    position: null,
    submissionDate: new Date(),
    attachmentFile: '',
    remarks: null
  });

  // 에러 다이얼로그 상태
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  // 직원 검색 팝업 상태
  const [employeePopupOpen, setEmployeePopupOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ComboBox 값 변경 핸들러
  const handleComboBoxChange = (
    field: keyof RegistrationData,
    value: SelectOption | null
  ) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
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

    setRegistrationData(prev => ({
      ...prev,
      attachmentFile: file.name
    }));
  };

  // 직원 선택 핸들러
  const handleEmployeeSelect = (employee: EmployeeSearchResult | EmployeeSearchResult[]) => {
    if (!Array.isArray(employee)) {
      setRegistrationData(prev => ({
        ...prev,
        executiveName: { value: employee.username, label: employee.username },
        position: { value: employee.jobTitleCd, label: employee.jobTitleCd }
      }));
      setEmployeePopupOpen(false);
    }
  };

  // 폼 유효성 검사
  const validateForm = (data: RegistrationData): boolean => {
    if (!data.historyCode) {
      setErrorMessage('제출이력 코드를 선택해주세요.');
      setErrorDialogOpen(true);
      return false;
    }

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

    if (!data.attachmentFile) {
      setErrorMessage('책무구조도 파일을 첨부해주세요.');
      setErrorDialogOpen(true);
      return false;
    }

    return true;
  };

  // 제출 핸들러
  const handleSubmit = async () => {
    if (!validateForm(registrationData)) return;
    await onSubmit(registrationData);
  };

  // 옵션 데이터
  const historyCodeOptions: SelectOption[] = [
    { value: 'SUB001', label: 'SUB001' },
    { value: 'SUB002', label: 'SUB002' },
    { value: 'SUB003', label: 'SUB003' },
  ];

  const positionOptions: SelectOption[] = [
    { value: '부장', label: '부장' },
    { value: '차장', label: '차장' },
    { value: '과장', label: '과장' },
  ];

  return (
    <BaseDialog
      open={open}
      mode="create"
      title="책무구조도 제출 등록"
      maxWidth="md"
      onClose={onClose}
      loading={loading}
      customActions={
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', }}>
          <Button
            variant="contained"
            size="medium"
            onClick={handleSubmit}
            color="primary"
            disabled={loading}
            sx={{ mr: 1 }}
          >
            등록
          </Button>
          <Button
            variant="contained"
            size="medium"
            onClick={onClose}
            color="secondary"
          >
            취소
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
        <ComboBox
          value={registrationData.historyCode}
          onChange={(value) => handleComboBoxChange(
            'historyCode',
            value as SelectOption | null
          )}
          options={historyCodeOptions}
          placeholder="제출이력 코드를 선택하세요"
          size="small"
        />

        {/* 제출 대상 임원 */}
        <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
          제출 대상 임원
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ComboBox
            value={registrationData.executiveName}
            onChange={(value) => handleComboBoxChange(
              'executiveName',
              value as SelectOption | null
            )}
            options={[]}
            placeholder="제출 대상 임원을 선택하세요"
            size="small"
            disabled={true}
            sx={{ minWidth: '300px' }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={() => setEmployeePopupOpen(true)}
          >
            검색
          </Button>
        </Box>

        {/* 직책 */}
        <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
          제출 대상 임원 직책
        </Typography>
        <ComboBox
          value={registrationData.position}
          onChange={(value) => handleComboBoxChange(
            'position',
            value as SelectOption | null
          )}
          options={positionOptions}
          placeholder="제출 대상 임원 직책을 입력하세요"
          size="small"
          disabled={true}
        />

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
          <Typography sx={{ mb: 1 }}>첨부파일</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              size="small"
              onClick={() => fileInputRef.current?.click()}
            >
              파일 선택
            </Button>
          </Box>
        </Box>

        {/* 비고 */}
        <Typography sx={{ fontSize: '0.85rem', color: 'var(--bank-text-primary)', fontWeight: 'bold' }}>
          비고
        </Typography>
        <TextField
          placeholder="비고를 입력하세요"
          size="small"
        />
      </Box>

      {/* 직원 검색 팝업 */}
      <EmployeeSearchPopup
        open={employeePopupOpen}
        onClose={() => setEmployeePopupOpen(false)}
        onSelect={handleEmployeeSelect}
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
