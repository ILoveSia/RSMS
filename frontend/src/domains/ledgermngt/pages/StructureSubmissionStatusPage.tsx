/**
 * 책무구조도 제출 관리 페이지
 * 책무구조 원장 관리 - 적부구조도 제출 관리
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { ComboBox, DatePicker } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn, SelectOption } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Box, Chip } from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';
import type { RegistrationData, SubmissionHistoryRow } from '../api/SubmissionStatusApi';
import {
  deleteSubmissionHistory,
  fetchSubmissionHistory,
  submitSubmissionHistory,
} from '../api/SubmissionStatusApi';
import { StructureSubmissionStatusDialog } from '../components';

interface IStructureSubmissionStatusPageProps {
  className?: string;
}

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

  // 에러 다이얼로그 상태
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  // 파일 입력 참조
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
  const handleFetchSubmissionHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchSubmissionHistory(startDate, endDate, ledgerOrder);
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

  // 행 클릭 핸들러
  const handleHistoryRowClick = (row: SubmissionHistoryRow) => {
    if (isRegistrationMode) {
      return;
    }
  };

  // 등록 모드 전환
  const handleRegistrationModeToggle = () => {
    setIsRegistrationMode(!isRegistrationMode);
  };

  // 제출 이력 등록
  const handleSubmit = async (data: RegistrationData): Promise<void> => {
    try {
      setIsLoading(true);
      let file: File | undefined = undefined;
      if (fileInputRef.current?.files?.[0]) {
        file = fileInputRef.current.files[0];
      }
      await submitSubmissionHistory(data, file);
      handleRegistrationModeToggle();
      handleFetchSubmissionHistory();
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
      await deleteSubmissionHistory(selectedHistoryIds);
      setSelectedHistoryIds([]);
      handleFetchSubmissionHistory();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="[800] 책무구조도 제출 관리"
        icon={<GroupsIcon />}
        description="책무구조도 제출 이력을 조회하고 관리합니다."
        elevation={false}
      />
      <PageContent
      sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
          position: 'relative',
          py: 1,
        }}
        >
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
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>책무번호</span>
          <ComboBox
            options={ledgerOrderOptions}
            onChange={value => setLedgerOrder(value as string)}
            size="small"
            sx={{ width: '130px' }}
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <DatePicker
              label="시작일"
              value={startDate}
              onChange={setStartDate}
              maxDate={endDate ?? undefined}
              size="small"
              sx={{ width: '200px' }}
            />
            <span style={{ color: 'var(--bank-text-primary)' }}>~</span>
            <DatePicker
              label="종료일"
              minDate={startDate ?? undefined}
              value={endDate}
              onChange={setEndDate}
              size="small"
              sx={{ width: '200px' }}
            />
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={handleFetchSubmissionHistory}
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
        <Box sx={{
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
          <DataGrid
            data={historyRows}
            columns={columns}
            loading={isLoading}
            error={null}
            onRowClick={handleHistoryRowClick}
            onRowSelectionChange={handleHistoryRowSelectionModelChange}
          />
        </Box>

        {/* 등록 폼 팝업 */}
        {isRegistrationMode && (
          <StructureSubmissionStatusDialog
            open={isRegistrationMode}
            onClose={handleRegistrationModeToggle}
            onSubmit={handleSubmit}
            loading={isLoading}
          />
        )}

        {/* 에러 다이얼로그 */}
        <ErrorDialog
          open={errorDialogOpen}
          errorMessage={errorMessage}
          onClose={() => setErrorDialogOpen(false)}
        />
      </PageContent>
    </PageContainer>
  );
};

export default StructureSubmissionStatusPage;
