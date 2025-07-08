/**
 * 회의체 검색 다이얼로그 컴포넌트
 * 여러 화면에서 공통으로 사용 가능
 */
import { useReduxState } from '@/app/store/use-store';
import type { MeetingBody } from '@/app/types';
import type { CommonCode } from '@/app/types/common';
import { Dialog } from '@/shared/components/modal';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { meetingStatusApi } from '../../ledgermngt/api/meetingStatusApi';

export interface MeetingBodySearchDialogProps {
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

const MeetingBodySearchDialog: React.FC<MeetingBodySearchDialogProps> = ({
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
      if (foundCode) {
        console.log(`✅ 코드명 발견: ${possibleGroup}.${code} => ${foundCode.codeName}`);
        break;
      }
    }

    if (!foundCode) {
      console.log(`❌ 코드명 못찾음: ${groupCode}.${code}`);
      console.log(
        '🔍 GUBUN01 공통코드:',
        codes.filter(c => c.groupCode === 'GUBUN01')
      );
      console.log(
        '🔍 PID03 공통코드:',
        codes.filter(c => c.groupCode === 'PID03')
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
    const codes = getCodesArray();
    console.log('🔍 전체 공통코드 목록:', codes.length);
    console.log(
      '🔍 GUBUN01 공통코드:',
      codes.filter(c => c.groupCode === 'GUBUN01')
    );
    console.log(
      '🔍 PID03 공통코드:',
      codes.filter(c => c.groupCode === 'PID03')
    );
  }, [allCodes]);

  // 회의체 목록 로드
  const loadMeetingBodies = async () => {
    setLoading(true);

    try {
      // 전체 회의체 목록 조회 API 호출
      const meetingBodyList: MeetingBody[] = await meetingStatusApi.getAll();

      console.log('🔍 API 응답 원본 데이터:', meetingBodyList);

      // API 응답을 MeetingBodySearchResult 형태로 변환 (공통코드명 사용)
      const apiMeetingBodies: MeetingBodySearchResult[] = meetingBodyList
        .filter(meeting => !excludeIds.includes(meeting.meetingBodyId)) // 제외할 ID 필터링
        .map(meeting => {
          console.log(`🔍 변환 중인 회의체:`, meeting);

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

      console.log('✅ 회의체 목록 로드 완료:', apiMeetingBodies.length, '개');
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

  // 검색 실행
  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      setFilteredMeetingBodies(meetingBodies);
      return;
    }

    const filtered = meetingBodies.filter(
      meeting =>
        meeting.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        meeting.code.toLowerCase().includes(searchKeyword.toLowerCase())
    );

    setFilteredMeetingBodies(filtered);
  };

  // 엔터키 검색
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // 회의체 선택
  const handleMeetingBodySelect = (meetingBody: MeetingBodySearchResult) => {
    setSelectedMeetingBody(meetingBody);
  };

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
        <Button onClick={onClose} variant='outlined'>
          취소
        </Button>
        <Button
          onClick={handleConfirmSelect}
          variant='contained'
          disabled={!selectedMeetingBody}
          sx={{
            backgroundColor: 'var(--bank-primary)',
            '&:hover': { backgroundColor: 'var(--bank-primary-dark)' },
            '&:disabled': { backgroundColor: 'var(--bank-border)' },
          }}
        >
          선택
        </Button>
      </>
    );
  };

  return (
    <Dialog open={open} title={title} maxWidth='sm' onClose={onClose} actions={renderActions()}>
      <Box sx={{ mt: 2, minHeight: 400 }}>
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* 검색 영역 */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            size='small'
            placeholder='검색'
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              },
            }}
          />
          <Button
            variant='contained'
            onClick={handleSearch}
            disabled={loading}
            sx={{
              minWidth: 80,
              backgroundColor: 'var(--bank-secondary)',
              '&:hover': {
                backgroundColor: 'var(--bank-secondary-dark)',
              },
            }}
          >
            검색
          </Button>
        </Box>

        {/* 회의체 목록 */}
        <Paper
          variant='outlined'
          sx={{
            height: 320,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <List
              sx={{
                flex: 1,
                overflow: 'auto',
                p: 0,
                '& .MuiListItem-root': {
                  p: 0,
                },
              }}
            >
              {filteredMeetingBodies.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary='검색 결과가 없습니다.'
                    sx={{ textAlign: 'center', color: 'text.secondary' }}
                  />
                </ListItem>
              ) : (
                filteredMeetingBodies.map((meeting, index) => (
                  <React.Fragment key={meeting.id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        selected={selectedMeetingBody?.id === meeting.id}
                        onClick={() => handleMeetingBodySelect(meeting)}
                        sx={{
                          py: 1.5,
                          px: 2,
                          '&.Mui-selected': {
                            backgroundColor: 'var(--bank-primary)',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'var(--bank-primary-dark)',
                            },
                            '& .MuiListItemText-secondary': {
                              color: 'rgba(255, 255, 255, 0.7)',
                            },
                          },
                          '&:hover': {
                            backgroundColor:
                              selectedMeetingBody?.id === meeting.id
                                ? '#1565c0'
                                : 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      >
                        <ListItemText
                          primary={meeting.name}
                          secondary={`${meeting.gubun} | ${meeting.period || '개최주기 미정'}`}
                          primaryTypographyProps={{
                            fontWeight: selectedMeetingBody?.id === meeting.id ? 'bold' : 'normal',
                            fontSize: '0.95rem',
                          }}
                          secondaryTypographyProps={{
                            fontSize: '0.8rem',
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                    {index < filteredMeetingBodies.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              )}
            </List>
          )}
        </Paper>

        {/* 선택된 항목 정보 */}
        {selectedMeetingBody && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Box sx={{ fontWeight: 'bold', fontSize: '0.9rem', mb: 1 }}>
              선택된 회의체: {selectedMeetingBody.name}
            </Box>
            <Box sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              구분: {selectedMeetingBody.gubun} | 개최주기: {selectedMeetingBody.period}
            </Box>
            {selectedMeetingBody.content && (
              <Box sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.5 }}>
                {selectedMeetingBody.content}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default MeetingBodySearchDialog;
