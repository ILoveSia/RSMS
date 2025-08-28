/**
 * 회의체 검색 다이얼로그 컴포넌트
 * 여러 화면에서 공통으로 사용 가능
 */
import type { MeetingBody } from '@/app/types';
import { Dialog } from '@/shared/components/modal';
import { Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { Alert } from '@/shared/components/ui/feedback';
import type { DataGridColumn } from '@/shared/types/common';
import { Box, CircularProgress } from '@mui/material';
import { SearchBox } from '@/shared/components/ui/form';
import React, { useEffect, useState } from 'react';
import { meetingStatusApi } from '../../../ledgermngt/api/meetingStatusApi';
import { useGetCodeName } from '@/shared/utils/codeUtils';

export interface MeetingBodySearchPopupProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (meetingBody: MeetingBodySearchResult) => void;
  title?: string;
  excludeIds?: string[]; // 제외할 회의체 ID 목록
}

export interface MeetingBodySearchResult {
  id: string;
  code: string;
  name: string;
  period?: string;
  content?: string;
}

const MeetingBodySearchPopup: React.FC<MeetingBodySearchPopupProps> = ({
  open,
  onClose,
  onSelect,
  title = '회의체 검색(팝업)',
  excludeIds = [], // 기본값 빈 배열
}) => {
  const getCodeName = useGetCodeName();
  // 검색어 상태
  const [searchKeyword, setSearchKeyword] = useState('');

  // 회의체 목록 상태
  const [meetingBodies, setMeetingBodies] = useState<MeetingBodySearchResult[]>([]);
  const [filteredMeetingBodies, setFilteredMeetingBodies] = useState<MeetingBodySearchResult[]>([]);

  // 선택된 항목 상태
  const [selectedMeetingBody, setSelectedMeetingBody] = useState<MeetingBodySearchResult | null>(
    null
  );

  // 로딩 및 에러 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 회의체 목록 초기화
  useEffect(() => {
    if (open) {
      loadMeetingBodies();
      setSearchKeyword('');
      setSelectedMeetingBody(null);
      setError(null);
    }
  }, [open]);

  // 회의체 목록 로드
  const loadMeetingBodies = async () => {
    setLoading(true);

    try {
      // 전체 회의체 목록 조회 API 호출
      const meetingBodyList: MeetingBody[] = await meetingStatusApi.getAll();

      // API 응답을 MeetingBodySearchResult 형태로 변환
      const apiMeetingBodies: MeetingBodySearchResult[] = meetingBodyList
        .filter(meeting => !excludeIds.includes(meeting.meetingBodyId)) // 제외할 ID 필터링
        .map(meeting => {
          return {
            id: meeting.meetingBodyId,
            code: meeting.gubun || 'UNKNOWN',
            name: meeting.meetingName,
            period: meeting.meetingPeriod,
            content: meeting.content,
          };
        });

      setMeetingBodies(apiMeetingBodies);
      setFilteredMeetingBodies(apiMeetingBodies);

    } catch (err) {
      console.error('❌ 회의체 목록 로드 실패:', err);
      setError('회의체 목록을 불러오는데 실패했습니다.');

      // API 실패 시 폴백으로 빈 배열 설정
      setMeetingBodies([]);
      setFilteredMeetingBodies([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색 실행 (검색어 인자로도 처리)
  const handleSearch = (q?: string) => {
    const keyword = (q ?? searchKeyword).trim().toLowerCase();
    if (!keyword) {
      setFilteredMeetingBodies(meetingBodies);
      return;
    }

    const filtered = meetingBodies.filter(
      meeting =>
        meeting.name.toLowerCase().includes(keyword) ||
        meeting.code.toLowerCase().includes(keyword)
    );

    setFilteredMeetingBodies(filtered);
  };

  // 회의체 선택
  const handleMeetingBodySelect = (selectedIds: (string | number)[], selectedData: MeetingBodySearchResult[]) => {
    if (selectedData.length > 0) {
      setSelectedMeetingBody(selectedData[0]);
    } else {
      setSelectedMeetingBody(null);
    }
  };

  // DataGrid 컬럼 정의
  const columns: DataGridColumn<MeetingBodySearchResult>[] = [
    {
      field: 'code' as keyof MeetingBodySearchResult,
      align: 'center',
      headerName: '구분',
      width: 120,
      valueFormatter: ({ value }: { value?: string }) => value ? getCodeName('MEETING_BODY', value) : '',
    },
    {
      field: 'name' as keyof MeetingBodySearchResult,
      headerName: '회의체명',
      align: 'center',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'period' as keyof MeetingBodySearchResult,
      headerName: '주기',
      width: 100,
      align: 'center',
      valueFormatter: ({ value }: { value?: string }) => value ? getCodeName('PERIOD', value) : '미정',
    },
    {
      field: 'content' as keyof MeetingBodySearchResult,
      headerName: '주요 의결내용',
      align: 'center',
      width: 250,
      valueFormatter: ({ value }: { value?: string }) => value || '-',
    },
  ];

  // 회의체 선택 확인
  const handleConfirmSelect = () => {
    if (selectedMeetingBody && onSelect) {
      onSelect(selectedMeetingBody);
    }
    onClose();
  };

  // 다이얼로그 액션 버튼
  const renderActions = () => {
    return (
      <>
        <Button
          onClick={handleConfirmSelect}
          variant='contained'
          color='primary'
          disabled={!selectedMeetingBody}
        >
          선택
        </Button>
        <Button onClick={onClose} variant='outlined'>
          닫기
        </Button>
      </>
    );
  };

  return (
    <Dialog open={open} title={title} maxWidth='md' onClose={onClose} actions={renderActions()}>
      <Box sx={{ mt: 2, minHeight: 400 }}>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }} title='오류'>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <SearchBox
              placeholder='회의체명 또는 코드로 검색'
              onSearch={(query: string) => { setSearchKeyword(query); handleSearch(query); }}
              onClear={() => { setSearchKeyword(''); handleSearch(''); }}
            />
          </Box>
        </Box>

          {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <CircularProgress />
            </Box>
          ) : (
          <DataGrid
            data={filteredMeetingBodies}
            columns={columns}
            selectable
            multiSelect={false}
            onRowSelectionChange={handleMeetingBodySelect}
            selectedRows={selectedMeetingBody ? [selectedMeetingBody.id] : []}
            disableColumnSort
            rowIdField='id'
          />
        )}
      </Box>
    </Dialog>
  );
};

export default MeetingBodySearchPopup;