/**
 * 책무구조도 제출 관리 페이지
 * 책무구조 원장 관리 - 적부구조도 제출 관리
 */
import { Box, Chip, Typography } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';

import type { EmployeeSearchResult } from '@/app/components/EmployeeSearchPopup';
import EmployeeSearchPopup from '@/app/components/EmployeeSearchPopup';
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { ComboBox, DatePicker } from '@/shared/components/ui/form';
import type { DataGridColumn, SelectOption } from '@/shared/types/common';

interface IStructureSubmissionStatusPageProps {
  className?: string;
}

interface SubmissionHistoryRow {
  id: number;
  historyCode: string;           // 제출이력 코드
  executiveName: string;         // 제출 대상 임원
  position: string;              // 직책
  submissionDate: string;        // 책무구조도 제출일
  isModified: boolean;           // 수정여부
  modificationDate?: string;     // 수정일
  attachmentFile?: string;       // 책무구조도 첨부
  remarks?: string;              // 비고
}

interface RegistrationData {
  historyCode: SelectOption | null;
  executiveName: SelectOption | null;
  position: SelectOption | null;
  submissionDate: Date;
  attachmentFile: string;
  remarks: SelectOption | null;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['.pdf', '.doc', '.docx'];

const StructureSubmissionStatusPage: React.FC<IStructureSubmissionStatusPageProps> = (): React.JSX.Element => {
  // 기간 선택 상태
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [ledgerOrder, setLedgerOrder] = useState<string>('2024-001');

  // 원장차수 옵션
  const ledgerOrderOptions: SelectOption[] = [
    { value: '2024-001', label: '2024-001' },
    { value: '2024-002', label: '2024-002' },
    { value: '2024-003', label: '2024-003' }
  ];

  // 제출 이력 데이터
  const [historyRows, setHistoryRows] = useState<SubmissionHistoryRow[]>([]);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<number[]>([]);

  // 등록 모드
  const [isRegistrationMode, setIsRegistrationMode] = useState(false);

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

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 데이터 그리드 컬럼 정의
  const columns: DataGridColumn<SubmissionHistoryRow>[] = [
    {
      field: 'historyCode',
      headerName: '제출이력 코드',
      width: 150,
    },
    {
      field: 'executiveName',
      headerName: '제출 대상 임원',
      width: 150,
    },
    {
      field: 'position',
      headerName: '직책',
      width: 150,
    },
    {
      field: 'submissionDate',
      headerName: '제출일',
      width: 150,
    },
    {
      field: 'isModified',
      headerName: '수정여부',
      width: 100,
      renderCell: ({ value }) => (
        <Chip
          label={value ? '수정' : '원본'}
          color={value ? 'primary' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'modificationDate',
      headerName: '수정일',
      width: 150,
    },
    {
      field: 'attachmentFile',
      headerName: '첨부파일',
      width: 200,
    },
    {
      field: 'remarks',
      headerName: '비고',
      width: 200,
    },
  ];

  // 제출 이력 조회
  const fetchSubmissionHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (startDate) {
        queryParams.append('startDate', startDate.toISOString().split('T')[0]);
      }
      if (endDate) {
        queryParams.append('endDate', endDate.toISOString().split('T')[0]);
      }
      if (ledgerOrder) {
        queryParams.append('ledgerOrder', ledgerOrder);
      }

      const response = await fetch(`/api/submission-history?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('제출 이력 조회에 실패했습니다.');
      }

      const data = await response.json();
      setHistoryRows(data);
    } catch (error) {
      setErrorMessage('제출 이력 조회 중 오류가 발생했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, ledgerOrder]);

  // 행 선택 변경 핸들러
  const handleHistoryRowSelectionModelChange = (
    selectedRows: (string | number)[],
    selectedData: SubmissionHistoryRow[]
  ) => {
    setSelectedHistoryIds(selectedRows.map(id => Number(id)));
  };

  // ComboBox 값 변경 핸들러
  const handleComboBoxChange = (
    field: keyof RegistrationData,
    value: SelectOption | null,
    setData: React.Dispatch<React.SetStateAction<RegistrationData>>
  ) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 행 클릭 핸들러
  const handleHistoryRowClick = (row: SubmissionHistoryRow) => {
    if (isRegistrationMode) {
      return;
    }
  };

  // 등록 모드 전환
  const handleRegistrationModeToggle = () => {
    setIsRegistrationMode(!isRegistrationMode);
    if (!isRegistrationMode) {
      setRegistrationData({
        historyCode: null,
        executiveName: null,
        position: null,
        submissionDate: new Date(),
        attachmentFile: '',
        remarks: null
      });

      // 등록 폼으로 스크롤
      setTimeout(() => {
        const formSection = document.getElementById('submission-form-section');
        if (formSection) {
          formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
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

    const setData = setRegistrationData;
    setData(prev => ({
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

  // 제출 이력 등록
  const handleSubmit = async () => {
    const data = registrationData;
    if (!validateForm(data)) return;

    try {
      setIsLoading(true);
      const formData = new FormData();

      // null 체크 후 문자열로 변환
      if (data.historyCode?.value) {
        formData.append('historyCode', String(data.historyCode.value));
      }
      if (data.executiveName?.value) {
        formData.append('executiveName', String(data.executiveName.value));
      }
      if (data.position?.value) {
        formData.append('position', String(data.position.value));
      }

      formData.append('submissionDate', data.submissionDate.toISOString().split('T')[0]);

      if (fileInputRef.current?.files?.[0]) {
        formData.append('file', fileInputRef.current.files[0]);
      }

      if (data.remarks?.value) {
        formData.append('remarks', String(data.remarks.value));
      }

      const response = await fetch('/api/submission-history', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('제출 이력 등록에 실패했습니다.');
      }

      // 성공 후 초기화
      handleRegistrationModeToggle();
      fetchSubmissionHistory();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 제출 이력 삭제
  const handleDelete = async () => {
    if (!selectedHistoryIds.length) {
      setErrorMessage('삭제할 제출 이력을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/submission-history`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: selectedHistoryIds,
        }),
      });

      if (!response.ok) {
        throw new Error('제출 이력 삭제에 실패했습니다.');
      }

      setSelectedHistoryIds([]);
      fetchSubmissionHistory();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='main-content'>
      {/* 페이지 제목 */}
      <div className='responsibility-header'>
        <h1 className='responsibility-header__title'>★ [800] 책무구조도 제출 관리</h1>
      </div>

      {/* 노란색 구분선 */}
      <div className='responsibility-divider'></div>

      {/* 메인 콘텐츠 영역 */}
      <div className='responsibility-section' style={{ marginTop: '20px' }}>
        {/* 기간 선택 영역 */}
        <Box sx={{
          display: 'flex',
          gap: '8px',
          padding: '8px 16px',
          mb: 2,
          bgcolor: 'var(--bank-bg-secondary)',
          borderRadius: 1,
          border: '1px solid var(--bank-border)',
          alignItems: 'center'
        }}>
          <ComboBox
            label="원장차수"
            value={ledgerOrder}
            options={ledgerOrderOptions}
            onChange={(value) => setLedgerOrder(value as string)}
            size="small"
            sx={{ minWidth: '200px' }}
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <DatePicker
              label="시작일"
              value={startDate}
              onChange={setStartDate}
              size="small"
              sx={{ width: '200px' }}
            />
            <span style={{ color: 'var(--bank-text-primary)' }}>~</span>
            <DatePicker
              label="종료일"
              value={endDate}
              onChange={setEndDate}
              size="small"
              sx={{ width: '200px' }}
            />
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={fetchSubmissionHistory}
            color="primary"
          >
            조회
          </Button>
        </Box>

        {/* 버튼 영역 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleRegistrationModeToggle}
            color="success"
            sx={{ mr: 1 }}
            disabled={isLoading}
          >
            등록
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleDelete}
            disabled={!selectedHistoryIds.length || isLoading}
            color="primary"
            style={{ color: 'white' }}
          >
            삭제
          </Button>
        </Box>

        {/* 데이터 그리드 */}
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            data={historyRows}
            columns={columns}
            loading={isLoading}
            error={null}
            onRowClick={handleHistoryRowClick}
            onRowSelectionChange={handleHistoryRowSelectionModelChange}
            pagination={{
              page: 1,
              pageSize: 10,
              totalItems: historyRows.length,
              onPageChange: () => {},
              onPageSizeChange: () => {}
            }}
          />
        </Box>

        {/* 등록 폼 영역 */}
        {isRegistrationMode && (
          <Box
            id="submission-form-section"
            sx={{
              marginTop: '20px',
              backgroundColor: 'var(--bank-bg-secondary)',
              border: '1px solid var(--bank-border)',
              borderRadius: '4px',
              padding: '16px'
            }}
          >
            <Typography variant="h6" sx={{
              fontWeight: 'bold',
              marginBottom: '16px',
              fontSize: '0.95rem',
              color: 'var(--bank-text-primary)'
            }}>
              책무구조도 제출 등록
            </Typography>

            {/* 기존 폼 필드들 */}
            <Box sx={{
              border: '1px solid var(--bank-border)',
              borderRadius: '4px',
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
                  value as SelectOption | null,
                  setRegistrationData
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
                    value as SelectOption | null,
                    setRegistrationData
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
                  value as SelectOption | null,
                  setRegistrationData
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
              <ComboBox
                value={registrationData.remarks}
                onChange={(value) => handleComboBoxChange(
                  'remarks',
                  value as SelectOption | null,
                  setRegistrationData
                )}
                options={[]}
                placeholder="비고를 입력하세요"
                size="small"
              />
            </Box>

            {/* 저장/취소 버튼 */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={handleSubmit}
                disabled={isLoading}
                color="success"
              >
                등록
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleRegistrationModeToggle}
                disabled={isLoading}
                color="primary"
              >
                취소
              </Button>
            </Box>
          </Box>
        )}
      </div>

      {/* 에러 다이얼로그 */}
      <ErrorDialog
        open={errorDialogOpen}
        errorMessage={errorMessage}
        onClose={() => setErrorDialogOpen(false)}
      />

      {/* 직원 검색 팝업 */}
      <EmployeeSearchPopup
        open={employeePopupOpen}
        onClose={() => setEmployeePopupOpen(false)}
        onSelect={handleEmployeeSelect}
      />
    </div>
  );
};

export default StructureSubmissionStatusPage;
