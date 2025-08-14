/**
 * 회의체 검색 다이얼로그 컴포넌트
 * 여러 화면에서 공통으로 사용 가능
 */
import { useReduxState } from '@/app/store/use-store';
import type { MeetingBody } from '@/app/types';
import type { CommonCode } from '@/app/types/common';
import { Dialog } from '@/shared/components/modal';
import { Button } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { Alert } from '@/shared/components/ui/feedback';
import type { DataGridColumn } from '@/shared/types/common';
import { Box, CircularProgress } from '@mui/material';
import { SearchBox } from '@/shared/components/ui/form';
import React, { useEffect, useState } from 'react';
import { meetingStatusApi } from '../../../ledgermngt/api/meetingStatusApi';

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
  gubun?: string;
}

const MeetingBodySearchPopup: React.FC<MeetingBodySearchPopupProps> = ({
  open,
  onClose,
  onSelect,
  title = '회의체 검색(팝업)',
  excludeIds = [], // 기본값 빈 배열
}) => {
  // 공통코드 Store에서 데이터 가져오기
  const { data: allCodes } = useReduxState<{ data: CommonCode[] } | CommonCode[]>(
    'codeStore/allCodes'
  );

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

  // 공통코드 배열 추출 함수
  const getCodesArray = (): CommonCode[] => {
    if (!allCodes) return [];
    if (Array.isArray(allCodes)) {
      return allCodes;
    }
    if (typeof allCodes === 'object' && 'data' in allCodes && Array.isArray(allCodes.data)) {
      return allCodes.data;
    }
    return [];
  };

  // 공통코드에서 코드명 조회 함수 (여러 그룹명 시도)
  const getCodeName = (groupCode: string, code: string): string => {
    const codes = getCodesArray();

    // 여러 가능한 그룹코드명들 시도
    const possibleGroupCodes = [
      groupCode,
      groupCode.replace('01', ''), // GUBUN01 -> GUBUN
      groupCode.replace('03', ''), // PID03 -> PID
      `${groupCode}_CD`, // GUBUN01_CD
      `CD_${groupCode}`, // CD_GUBUN01
    ];

    let foundCode = null;
    for (const possibleGroup of possibleGroupCodes) {
      foundCode = codes.find(
        c => c.groupCode === possibleGroup && c.code === code && c.useYn === 'Y'
      );
    }

    return foundCode?.codeName || code;
  };

  // 회의체 목록 초기화
  useEffect(() => {
    if (open) {
      loadMeetingBodies();
      setSearchKeyword('');
      setSelectedMeetingBody(null);
      setError(null);
    }
  }, [open]);

  // 공통코드 디버깅
  useEffect(() => {
    // codes updated; no-op
    void getCodesArray();
  }, [allCodes]);

  // 회의체 목록 로드
  const loadMeetingBodies = async () => {
    setLoading(true);

    try {
      // 전체 회의체 목록 조회 API 호출
      const meetingBodyList: MeetingBody[] = await meetingStatusApi.getAll();


      // API 응답을 MeetingBodySearchResult 형태로 변환 (공통코드명 사용)
      const apiMeetingBodies: MeetingBodySearchResult[] = meetingBodyList
        .filter(meeting => !excludeIds.includes(meeting.meetingBodyId)) // 제외할 ID 필터링
        .map(meeting => {

          const periodName = getCodeName('PID03', meeting.meetingPeriod || '');
          const gubunName = getCodeName('GUBUN01', meeting.gubun || '');

          return {
            id: meeting.meetingBodyId,
            code: meeting.gubun || 'UNKNOWN',
            name: meeting.meetingName,
            period: periodName || meeting.meetingPeriod || '미정',
            content: meeting.content || '상세내용 없음',
            gubun: gubunName || meeting.gubun,
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
      headerName: '회의체 코드',
      width: 120,
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
    },
    {
      field: 'gubun' as keyof MeetingBodySearchResult,
      headerName: '구분',
      align: 'center',
      width: 120,
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
          취소
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
