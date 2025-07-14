/**
 * 회의체 현황 페이지 컴포넌트
 * MainContent.tsx 스타일과 일관성 있게 구현
 */
import { useReduxState } from '@/app/store/use-store';
import type { MeetingBody } from '@/app/types';
import type { CommonCode } from '@/app/types/common';
import { Confirm } from '@/shared/components/modal';
import { Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { ComboBox, Select } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Box } from '@mui/material';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../../../assets/scss/style.css';
import { meetingStatusApi } from '../api/meetingStatusApi';
import MeetingBodyDialog from '../components/MeetingBodyDialog';

interface IMeetingStatusPageProps {
  className?: string;
}

const MeetingStatusPage: React.FC<IMeetingStatusPageProps> = React.memo((): React.JSX.Element => {
  // 공통코드 Store에서 데이터 가져오기
  const { data: allCodes, setData: setAllCodes } = useReduxState<{
    data: CommonCode[];
    setData: (newData: CommonCode[]) => void;
  }>('codeStore/allCodes');

  // 공통코드 배열 추출 함수
  const getCodesArray = useCallback((): CommonCode[] => {
    if (!allCodes) return [];
    return Array.isArray(allCodes) ? allCodes : allCodes.data || [];
  }, [allCodes]);

  // 공통코드 헬퍼 함수
  const getMeetingBodyCodes = useCallback(() => {
    const codes = getCodesArray();
    return codes
      .filter(code => code.groupCode === 'MEETING_BODY' && code.useYn === 'Y')
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [getCodesArray]);

  const getCodeName = useCallback(
    (groupCode: string, code: string): string => {
      const codes = getCodesArray();
      const found = codes.find(item => item.groupCode === groupCode && item.code === code);
      return found?.codeName || code;
    },
    [getCodesArray]
  );

  const [meetingBodies, setMeetingBodies] = useState<MeetingBody[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filterDivision, setFilterDivision] = useState<string>('전체');

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedMeetingBody, setSelectedMeetingBody] = useState<MeetingBody | null>(null);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 삭제 확인 모달 상태
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);

  // 회의체 현황 컬럼 정의
  const meetingColumns: DataGridColumn<MeetingBody>[] = useMemo(
    () => [
      {
        field: 'gubun',
        headerName: '구분',
        width: 100,
        renderCell: ({ value }) => getCodeName('MEETING_BODY', (value as string) || ''),
      },
      {
        field: 'meetingName',
        headerName: '회의체명',
        width: 200,
        flex: 1,
        renderCell: ({ value, row }) => (
          <span
            style={{ color: 'var(--bank-primary)', textDecoration: 'underline', cursor: 'pointer' }}
            onClick={e => {
              e.stopPropagation(); // row click 이벤트 방지
              const selectedMeetingBody = meetingBodies.find(
                mb => mb.meetingBodyId === row.meetingBodyId
              );
              if (selectedMeetingBody) {
                setDialogMode('view');
                setSelectedMeetingBody(selectedMeetingBody);
                setDialogOpen(true);
              }
            }}
          >
            {String(value)}
          </span>
        ),
      },
      {
        field: 'meetingPeriod',
        headerName: '개최주기',
        width: 120,
        renderCell: ({ value }) => getCodeName('PERIOD', (value as string) || ''),
      },
      { field: 'content', headerName: '주요 심의·의결사항', width: 300, flex: 2 },
    ],
    [getCodeName, meetingBodies]
  );

  // API 호출 함수
  const fetchMeetingBodies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = {
        page: pageInfo.page,
        size: pageInfo.size,
        gubun: filterDivision === '전체' ? undefined : filterDivision,
        sortBy: 'createdAt',
        sortDirection: 'desc',
      };

      const responseData = await meetingStatusApi.search(searchParams);

      // 응답 구조에 따라 데이터 추출
      let meetingBodyData: MeetingBody[] = [];
      let totalElements = 0;
      let totalPages = 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = responseData as any;

      // 경우 1: PageableResponse 형태 ({ content: [], totalElements: 0, totalPages: 0 })
      if (response && response.content && Array.isArray(response.content)) {
        meetingBodyData = response.content;
        totalElements = response.totalElements || 0;
        totalPages = response.totalPages || 0;
      }
      // 경우 2: ApiResponse<PageableResponse> 형태 ({ data: { content: [], ... } })
      else if (
        response &&
        response.data &&
        response.data.content &&
        Array.isArray(response.data.content)
      ) {
        const innerData = response.data;
        meetingBodyData = innerData.content;
        totalElements = innerData.totalElements || 0;
        totalPages = innerData.totalPages || 0;
      }
      // 경우 3: ApiResponse<Array> 형태 ({ data: [] })
      else if (response && response.data && Array.isArray(response.data)) {
        meetingBodyData = response.data;
        totalElements = response.data.length;
        totalPages = 1;
      }
      // 경우 4: 직접 배열 형태 ([])
      else if (Array.isArray(response)) {
        meetingBodyData = response;
        totalElements = response.length;
        totalPages = 1;
      }

      setMeetingBodies(meetingBodyData);
      setPageInfo(prev => ({
        ...prev,
        totalElements: totalElements,
        totalPages: totalPages,
      }));
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: string }).message === 'string'
      ) {
        setError((err as { message: string }).message);
      } else {
        setError('회의체 목록 조회에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [pageInfo.page, pageInfo.size, filterDivision]);

  // 컴포넌트 마운트 시 localStorage에서 공통코드 복원
  useEffect(() => {
    const storedCommonCodes = localStorage.getItem('commonCodes');

    if (
      storedCommonCodes &&
      (!allCodes ||
        (Array.isArray(allCodes) && allCodes.length === 0) ||
        (typeof allCodes === 'object' &&
          'data' in allCodes &&
          (!allCodes.data || allCodes.data.length === 0)))
    ) {
      try {
        const parsedCodes = JSON.parse(storedCommonCodes);
        setAllCodes(parsedCodes);
      } catch {
        localStorage.removeItem('commonCodes');
      }
    }
  }, [allCodes, setAllCodes]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchMeetingBodies();
  }, [filterDivision, pageInfo.page, pageInfo.size, fetchMeetingBodies]);

  // 조회 버튼 클릭 핸들러
  const handleSearch = useCallback(() => {
    setPageInfo(prev => ({ ...prev, page: 0 }));
    fetchMeetingBodies();
  }, [fetchMeetingBodies]);

  // 다이얼로그 핸들러 함수들
  const handleCreateClick = useCallback(() => {
    setDialogMode('create');
    setSelectedMeetingBody(null);
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
    setSelectedMeetingBody(null);
  }, []);

  const handleDialogSave = useCallback(() => {
    // 목록 새로고침
    fetchMeetingBodies();
  }, [fetchMeetingBodies]);

  // 다이얼로그 모드 변경 핸들러
  const handleModeChange = useCallback((newMode: 'create' | 'edit' | 'view') => {
    setDialogMode(newMode);
  }, []);

  // 삭제 버튼 클릭 시: 모달만 띄움
  const handleDelete = useCallback(() => {
    if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
      setError('삭제할 항목을 선택하세요.');
      return;
    }
    setPendingDelete(selectedIds);
    setConfirmOpen(true);
  }, [selectedIds]);

  // 삭제 확인 모달에서 "확인" 클릭 시 실제 삭제
  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete || pendingDelete.length === 0) {
      setConfirmOpen(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await meetingStatusApi.deleteBulk(pendingDelete);
      setSelectedIds([]); // 선택 초기화
      fetchMeetingBodies(); // 목록 새로고침
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'message' in err &&
        typeof (err as { message?: string }).message === 'string'
      ) {
        setError((err as { message: string }).message);
      } else {
        setError('삭제 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  }, [pendingDelete, fetchMeetingBodies]);

  // 엑셀 다운로드 핸들러 (ExcelJS 사용)
  const handleExcelDownload = useCallback(async () => {
    if (!meetingBodies || meetingBodies.length === 0) {
      setError('엑셀로 내보낼 데이터가 없습니다.');
      return;
    }

    try {
      // ExcelJS 워크북 생성
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('회의체 현황');

      // 헤더 설정
      const headers = ['구분', '회의체명', '개최주기', '주요 심의·의결사항'];
      worksheet.addRow(headers);

      // 헤더 스타일 설정
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB0C4DE' }, // lightsteelblue
      };

      // 데이터 추가
      meetingBodies.forEach(row => {
        worksheet.addRow([
          getCodeName('MEETING_BODY', row.gubun),
          row.meetingName,
          getCodeName('PERIOD', row.meetingPeriod),
          row.content,
        ]);
      });

      // 컬럼 너비 자동 조정
      worksheet.columns.forEach(column => {
        column.width = Math.max(column.width || 0, 15);
      });

      // 파일 생성 및 다운로드
      const excelBuffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `회의체_현황_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch {
      setError('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  }, [meetingBodies, getCodeName]);

  return (
    <PageContainer
      sx={{
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <PageHeader
        title=' [100] 회의체 현황'
        icon={<GroupsIcon />}
        description='회의체별 현황 및 주요 심의·의결사항을 조회하고 관리합니다.'
        elevation={false}
        sx={{
          position: 'relative',
          zIndex: 1,
          flexShrink: 0,
        }}
      />

      <PageContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
          position: 'relative',  // 좌우 패딩을 3으로 수정
          py: 1,
          px:0
        }}
      >
        {/* 필터 영역 */}
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            mb: 2,
            alignItems: 'center',
            backgroundColor: 'var(--bank-bg-secondary)',
            border: '1px solid var(--bank-border)',
            p: 1.5,
            borderRadius: 1,
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              fontWeight: 'bold',
              fontSize: '0.9rem',
              color: 'var(--bank-text-primary)',
              minWidth: '40px',
              textAlign: 'right',
            }}
          >
            구분:
          </Box>

          <ComboBox
            value={filterDivision}
            options={getMeetingBodyCodes().map(code => ({
              value: code.code,
              label: code.codeName,
            }))}
            onChange={option => setFilterDivision(option?.value as string)}
            size='small'
            sx={{width: 140}}
          />
          <Button
            variant='contained'
            size='small'
            onClick={handleSearch}
            sx={{
              minWidth: 60,
              px: 2,
              py: 0.5,
              fontSize: '0.875rem',
            }}
          >
            조회
          </Button>
        </Box>

        {/* 버튼 영역 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, flexShrink: 0 }}>
          <Button
            variant='contained'
            color='success'
            size='small'
            onClick={handleExcelDownload}
            sx={{ mr: 1 }}
          >
            엑셀 다운로드
          </Button>
          <Button variant='contained' size='small' onClick={handleCreateClick} sx={{ mr: 1 }}>
            등록
          </Button>
          <Button variant='contained' size='small' color='error' onClick={handleDelete}>
            삭제
          </Button>
        </Box>

        {/* 에러 메시지 */}
        {error && (
          <Box sx={{ color: 'error.main', mb: 1, fontSize: '0.875rem', flexShrink: 0 }}>
            {error}
          </Box>
        )}

        {/* 데이터 그리드 */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0, // flex item이 축소될 수 있도록 설정
            position: 'relative',
            // pb: 2,
          }}
        >
          <DataGrid<MeetingBody>

            data={meetingBodies}
            columns={meetingColumns}
            loading={loading}
            outline={false}
            selectable={true}
            multiSelect
            selectedRows={selectedIds}
            onRowSelectionChange={selectedRowIds => {
              setSelectedIds(selectedRowIds.map(id => String(id)));
            }}
            rowIdField='meetingBodyId'

            serverSide
          />
        </Box>
      </PageContent>

      {/* 회의체 등록/수정/조회 다이얼로그 */}
      <MeetingBodyDialog
        open={dialogOpen}
        mode={dialogMode}
        meetingBody={selectedMeetingBody}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        onModeChange={handleModeChange}
      />

      {/* 삭제 확인 모달 */}
      <Confirm
        open={confirmOpen}
        title='삭제 확인'
        message='정말로 선택한 회의체를 삭제하시겠습니까?'
        confirmText='삭제'
        cancelText='취소'
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDelete(null);
        }}
      />
    </PageContainer>
  );
});

export default MeetingStatusPage;
