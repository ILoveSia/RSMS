import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { DataGrid } from '@/shared/components/ui';
import ManagementButtonGroup from '@/shared/components/ui/button/ManagementButtonGroup';
import TitleSearch from '@/domains/admin/components/TitleSearch';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { Description as DescriptionIcon } from '@mui/icons-material';
import type { DataGridColumn } from '@/shared/types/common';
import { submissionReportApi } from '../api/submissionReportApi';
import { getAttachments } from '@/domains/common/api/attachmentApi';
import type { AttachmentInfo } from '@/domains/common/api/attachmentApi';
import { useApiWithNotification } from '@/shared/hooks/useApiWithNotification';
import { useDialog } from '@/shared/hooks/useDialog';
import SubmissionReportDialog from '../components/SubmissionReportDialog';

// submission_reports 테이블과 연결될 데이터 타입 정의
export interface SubmissionReportRow {
  submissionReportId: number;
  baseDate: string;
  targetInstitution: string;
  attachments?: { originalFilename: string }[]; // AttachmentDto.Response와 일치
}

const SubmissionReportPage: React.FC = () => {
  const { callApiWithNotification } = useApiWithNotification({
    successMessage: '보고서 목록을 성공적으로 불러왔습니다.',
    errorMessage: '보고서 목록 로드 중 오류가 발생했습니다.',
  });

  // 데이터 상태
  const [rows, setRows] = useState<SubmissionReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // 다이얼로그 상태 - useDialog 훅 사용
  const {
    dialogOpen: isDialogOpen,
    dialogMode,
    dialogData: selectedReport,
    openDialog,
    closeDialog,
    setDialogMode
  } = useDialog<SubmissionReportRow>();

  const [initialData, setInitialData] = useState<AttachmentInfo[] | undefined>(undefined);

  // 검색 상태
  const [query, setQuery] = useState('');

  // 첨부파일 정보 조회 함수
  const getReportAttachments = useCallback(async (reportId: number): Promise<AttachmentInfo[] | undefined> => {
    try {
      const attachments = await getAttachments('SUBMISSION_REPORT', reportId);
      return attachments;
    } catch (error) {
      console.error('첨부파일 정보 조회 실패:', error);
      return undefined;
    }
  }, []);

  // 다이얼로그에 전달할 초기 데이터 생성
  const getInitialData = useCallback(async (): Promise<any> => {
    if (!selectedReport) return undefined;
    
    // 첨부파일 정보가 필요한 경우에만 조회
    let attachments: AttachmentInfo[] | undefined;
    if (selectedReport.submissionReportId && (dialogMode === 'view' || dialogMode === 'edit')) {
      attachments = await getReportAttachments(selectedReport.submissionReportId);
    }
    console.log("attachments",attachments);
    console.log("typeof attachments",typeof attachments);
    return attachments;
  }, [selectedReport, dialogMode, getReportAttachments]);

  // 다이얼로그가 열릴 때 initialData를 가져옴
  useEffect(() => {
    if (isDialogOpen) {
      getInitialData().then(data => setInitialData(data));
    }
  }, [isDialogOpen, getInitialData]);

  // 데이터 조회 함수
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null); // Keep this for DataGrid error prop
    const data = await callApiWithNotification(() => submissionReportApi.getSubmissionReports());
    if (data) {
      setRows(data);
      console.log(data);
    }
    setIsLoading(false);
  }, [callApiWithNotification]);

  // 초기 데이터 로드
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 데이터 필터링
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !rows) return rows || [];
    return rows.filter(r => {
      const fields = [
        r.baseDate,
        r.targetInstitution,
        r.attachments?.map(att => att.originalFilename).join(' '),
      ];
      return fields.some(v => (v || '').toLowerCase().includes(q));
    });
  }, [rows, query]);

  const handleRegister = useCallback(() => {
    openDialog('create');
  }, [openDialog]);

  // 행 클릭 핸들러 (상세보기)
  const handleRowClick = useCallback((report: SubmissionReportRow) => {
    openDialog('view', report);
  }, [openDialog]);

  const { callApiWithNotification: callDeleteApi } = useApiWithNotification({
    successMessage: '보고서가 성공적으로 삭제되었습니다.',
    errorMessage: '보고서 삭제 실패',
  });

  const handleDelete = useCallback(async () => {
    if (selectedIds.length === 0) {
      window.alert('삭제할 보고서를 선택해주세요.');
      return;
    }
    if (window.confirm(`${selectedIds.length}개의 보고서를 삭제하시겠습니까?`)) {
      try {
        // 각 보고서를 순차적으로 삭제
        for (const id of selectedIds) {
          try {
            await callDeleteApi(() => submissionReportApi.deleteSubmissionReport(id));
          } catch (error) {
          }
        }
        
        // 선택된 ID 초기화
        setSelectedIds([]);
        await fetchData();
        
      } catch (error) {
        setSelectedIds([]);
        await fetchData();
      }
    }
  }, [selectedIds, fetchData, callDeleteApi]);

  const columns: DataGridColumn<SubmissionReportRow>[] = [
    { field: 'baseDate', headerName: '기준일', width: 180, align: 'center', headerAlign: 'center' },
    { field: 'targetInstitution', headerName: '제출대상', width: 250, headerAlign: 'center' },
    {
      field: 'attachments',
      headerName: '파일명',
      flex: 1,
      renderCell: ({ value }) => {
        const attachments = value as { originalFilename: string }[] | undefined;
        if (!attachments || attachments.length === 0) return '첨부파일 없음';
        return attachments.map(att => att.originalFilename).join(', ');
      },
    },
  ];
 
  return (
    <PageContainer>
      <PageHeader
        title="제출 보고서 관리"
        description="기관별 제출 보고서 및 첨부파일을 관리합니다."
        icon={<DescriptionIcon />}
        elevation={false}
      />
      <PageContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
          py: 1,
        }}
      >
        <TitleSearch
          value={query}
          onChange={setQuery}
          onEnter={() => {}}
          right={
            <ManagementButtonGroup
              onRegister={handleRegister}
              onDelete={handleDelete}
              showRegister
              showDelete
              showEdit={false}
              showSave={false}
              showCancel={false}
              showRefresh={false}
              showExcelDownload={false}
              deleteDisabled={selectedIds.length === 0}
              align="right"
            />
          }
        />
        <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
          <DataGrid
            data={filteredRows}
            columns={columns}
            height={520}
            checkboxSelection
            selectable
            rowIdField="submissionReportId"
            loading={isLoading}
            error={error}
            onRowSelectionChange={(selectedRows, selectedData) => setSelectedIds(selectedRows as number[])}
            onRowClick={handleRowClick}
          />
        </Box>
      </PageContent>

      <SubmissionReportDialog
        open={isDialogOpen}
        mode={dialogMode}
        reportId={selectedReport?.submissionReportId}
        dialogData={selectedReport}
        initialData={initialData}
        onClose={closeDialog}
        onSuccess={async () => {
          closeDialog();
          await fetchData(); // Refresh data after successful operation
        }}
        onModeChange={setDialogMode}
        loading={isLoading}
      />
    </PageContainer>
  );
};

export default SubmissionReportPage;


