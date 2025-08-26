/**
 * 책무구조도 제출 관리 페이지
 * 책무구조 원장 관리 - 적부구조도 제출 관리
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { SearchButton, ManagementButtonGroup } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { DatePicker, LedgerOrderSelect } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { useGetCodeName } from '@/shared/utils/codeUtils';
import { AttachmentBadge } from '@/shared/components/ui/badge';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Box, Chip } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import type { RegistrationData, SubmissionHistoryRow } from '../api/SubmissionStatusApi';
import {
  deleteSubmissionHistory,
  fetchSubmissionHistory,
  submitSubmissionHistory,
  updateSubmissionHistory,
} from '../api/SubmissionStatusApi';
import { StructureSubmissionStatusDialog } from '../components';
import { useApiWithNotification } from '@/shared/hooks';

interface IStructureSubmissionStatusPageProps {
  className?: string;
}

// 기본 날짜 계산 (3개월 전 ~ 오늘)
const getDefaultDates = () => {
  const today = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(today.getMonth() - 3);
  return { startDate: threeMonthsAgo, endDate: today };
};


const StructureSubmissionStatusPage: React.FC<IStructureSubmissionStatusPageProps> = (): React.JSX.Element => {
  // API 알림 훅
  const { callApiWithNotification } = useApiWithNotification({
    showSuccessOnLoad: true,
    errorMessage: '데이터를 불러오는 중 오류가 발생했습니다.',
  });

  // 기간 선택 상태
  const [startDate, setStartDate] = useState<Date | null>(getDefaultDates().startDate);
  const [endDate, setEndDate] = useState<Date | null>(getDefaultDates().endDate);
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('ALL');

  // 상태 관리
  const [historyRows, setHistoryRows] = useState<SubmissionHistoryRow[]>([]);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // 다이얼로그 상태
  const [isRegistrationMode, setIsRegistrationMode] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<SubmissionHistoryRow | null>(null);

  // 코드 변환 함수 (공통코드: BANK_CD)
  const getCodeName = useGetCodeName();

  // 직책 렌더링 컴포넌트
  const renderPositionCell = ({ row }: { row: SubmissionHistoryRow }) => (
    <div>
      <div style={{ fontWeight: 'bold' }}>
        {row.positionsNm || row.position || '-'}
      </div>
      {row.positionsNm && (
        <div style={{ fontSize: '0.75rem', color: '#666' }}>
          원장차수: {row.ledgerOrders || '-'}
        </div>
      )}
    </div>
  );

  // 데이터 그리드 컬럼 정의
  const columns: DataGridColumn<SubmissionHistoryRow>[] = [
    { field: 'position', headerName: '직책', width: 200, align: 'center', renderCell: renderPositionCell },
    {
      field: 'bankCd',
      headerName: '제출 기관',
      width: 160,
      align: 'center',
      renderCell: ({ value }) => getCodeName('BANK_CD', String(value ?? '')),
    },
    { field: 'executiveName', headerName: '제출 대상 임원', width: 150, align: 'center' },
    { field: 'submissionDate', headerName: '제출일', width: 150, align: 'center' },
    {
      field: 'attachmentFile',
      headerName: '첨부파일',
      width: 120,
      align: 'center',
      renderCell: ({ row }) => <AttachmentBadge count={row.attachmentCount} />,
    },
  ];

  // 제출 이력 조회
  const handleFetchSubmissionHistory = useCallback(async () => {
    setIsLoading(true);
    
    const data = await callApiWithNotification(
      () => fetchSubmissionHistory(
        startDate, 
        endDate, 
        selectedLedgerOrder !== 'ALL' ? Number(selectedLedgerOrder) : undefined
      ),
      'success_load'
    );
    
    if (data) {
      setHistoryRows(data);
    } else {
      setHistoryRows([]);
    }
    
    setIsLoading(false);
  }, [startDate, endDate, selectedLedgerOrder, callApiWithNotification]);

  // 초기 로드 시 자동 조회
  useEffect(() => {
    handleFetchSubmissionHistory();
  }, [handleFetchSubmissionHistory]);

  // 다이얼로그 관리
  const openDialog = useCallback((mode: 'create' | 'edit' | 'view', item?: SubmissionHistoryRow) => {
    setDialogMode(mode);
    setSelectedItem(item || null);
    setIsRegistrationMode(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsRegistrationMode(false);
    setSelectedItem(null);
    setDialogMode('create');
  }, []);

  // 이벤트 핸들러
  const handleRowSelectionChange = useCallback((selectedRows: (string | number)[]) => {
    setSelectedHistoryIds(selectedRows.map(id => Number(id)));
  }, []);

  const handleRowClick = useCallback((row: SubmissionHistoryRow) => {
    if (!isRegistrationMode) {
      openDialog('view', row);
    }
  }, [isRegistrationMode, openDialog]);

  const handleCreateClick = useCallback(() => {
    openDialog('create');
  }, [openDialog]);

  // 제출 이력 등록/수정
  const handleSubmit = useCallback(async (data: RegistrationData): Promise<{ id: number }> => {
    setIsLoading(true);
    
    try {
      const result = await callApiWithNotification(
        () => dialogMode === 'edit' && selectedItem?.id
          ? updateSubmissionHistory(selectedItem.id, data)
          : submitSubmissionHistory(data),
        'custom'
      );
      
      if (result) {
        // closeDialog(); // 다이얼로그를 닫는 로직을 제거합니다.
        await handleFetchSubmissionHistory();
        return result; // result만 반환합니다.
      }
      
      throw new Error('제출 이력 처리에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [dialogMode, selectedItem?.id, handleFetchSubmissionHistory, callApiWithNotification]);

  // 제출 이력 삭제
  const handleDelete = useCallback(async () => {
    if (!selectedHistoryIds.length) {
      callApiWithNotification(
        () => Promise.reject(new Error('삭제할 제출 이력을 선택해주세요.')),
        'custom'
      );
      return;
    }

    setIsLoading(true);
    
    try {
      await callApiWithNotification(
        () => deleteSubmissionHistory(selectedHistoryIds),
        'custom'
      );
      
      setSelectedHistoryIds([]);
      await handleFetchSubmissionHistory();
    } finally {
      setIsLoading(false);
    }
  }, [selectedHistoryIds, handleFetchSubmissionHistory, callApiWithNotification]);

  // 모드 변경 핸들러
  const handleModeChange = useCallback((mode: 'create' | 'edit' | 'view') => {
    setDialogMode(mode);
  }, []);

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
          <LedgerOrderSelect
            value={selectedLedgerOrder}
            onChange={setSelectedLedgerOrder}
            includeAll={true}
            placeholder="책무번호 선택"
            size="small"
            sx={{ width: '150px' }}
            minWidth="150px"
            maxWidth="150px"
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <DatePicker
              label="시작일"
              value={startDate}
              onChange={setStartDate}
              maxDate={endDate ?? undefined}
              size="small"
              mode="editable"
              sx={{ width: '200px' }}
            />
            <span style={{ color: 'var(--bank-text-primary)' }}>~</span>
            <DatePicker
              label="종료일"
              minDate={startDate ?? undefined}
              value={endDate}
              onChange={setEndDate}
              size="small"
              mode="editable"
              sx={{ width: '200px' }}
            />
          </Box>
          <SearchButton
            onClick={handleFetchSubmissionHistory}
            loading={isLoading}
            disabled={isLoading}
          />
        </Box>

        {/* 버튼 영역 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 0.5,
          alignItems: 'center',
          height: '32px',
          gap: 1,
        }}>
          <ManagementButtonGroup
            onRegister={handleCreateClick}
            onDelete={handleDelete}
            showRegister={true}
            showDelete={true}
            showEdit={false}
            showRefresh={false}
            registerDisabled={isLoading}
            deleteDisabled={!selectedHistoryIds.length || isLoading}
            align="right"
            sx={{
              mb: 0,
            }}
          />
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
            height={600} 
            error={null}
            onRowClick={handleRowClick}
            onRowSelectionChange={handleRowSelectionChange}
            checkboxSelection={true}
            multiSelect={false}
            rowSelectionModel={selectedHistoryIds}
            sx={{
              height: '600px', // 고정 높이로 변경
              '& .MuiDataGrid-virtualScroller': {
                overflow: 'auto' // 스크롤 허용
              }
            }}
          />
        </Box>

        {/* 등록 폼 팝업 */}
        {isRegistrationMode && (
          <StructureSubmissionStatusDialog
            open={isRegistrationMode}
            onClose={closeDialog}
            onSubmit={handleSubmit}
            loading={isLoading}
            mode={dialogMode}
            itemId={selectedItem?.id}
            initialData={selectedItem ? {
              submitHistCd: selectedItem.historyCode,
              execofficerId: selectedItem.execofficerId || null, // 기존 데이터에서 execofficerId 가져오기
              historyCode: { value: selectedItem.historyCode, label: selectedItem.historyCode },
              executiveName: { value: selectedItem.executiveName, label: selectedItem.executiveName },
              position: { value: selectedItem.position, label: selectedItem.position },
              submissionDate: new Date(selectedItem.submissionDate),
              attachmentFile: selectedItem.attachmentFile || '',
              remarks: selectedItem.remarks ? { value: selectedItem.remarks, label: selectedItem.remarks } : null,
              positionsId: selectedItem.positionsId,
              positionsNm: selectedItem.positionsNm,
              ledgerOrders: selectedItem.ledgerOrders
            } : undefined}
            onModeChange={handleModeChange}
          />
        )}
      </PageContent>
    </PageContainer>
  );
};

export default StructureSubmissionStatusPage;
