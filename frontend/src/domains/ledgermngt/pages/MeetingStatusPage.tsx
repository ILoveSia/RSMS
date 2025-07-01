/**
 * 회의체 현황 페이지 컴포넌트
 * MainContent.tsx 스타일과 일관성 있게 구현
 */
import React, { useState, useEffect } from 'react';
import { Box, Button, Select, MenuItem, FormControl } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRowParams } from '@mui/x-data-grid';
import type { MeetingBody } from '@/app/types';
import type { CommonCode } from '@/app/types/common';
import { useReduxState } from '@/app/store/use-store';
import { meetingBodyApi } from '@/app/services/api';
import MainLayout from '../../../shared/components/layout/MainLayout';
import MeetingBodyDialog from '../components/MeetingBodyDialog';
import '../../../assets/scss/style.css';
import Confirm from '@/app/components/Confirm';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface IMeetingStatusPageProps {
  className?: string;
}

const MeetingStatusPage: React.FC<IMeetingStatusPageProps> = (): React.JSX.Element => {
  // 공통코드 Store에서 데이터 가져오기
  const { data: allCodes, setData: setAllCodes } = useReduxState<{data: CommonCode[]} | CommonCode[]>('codeStore/allCodes');
  
  // 공통코드 배열 추출 함수
  const getCodesArray = (): CommonCode[] => {
    if (!allCodes) return [];
    // allCodes가 {data: CommonCode[]} 형태인지 확인
    if (Array.isArray(allCodes)) {
      return allCodes;
    }
    // allCodes가 {data: CommonCode[]} 형태라면 data 프로퍼티에서 배열 추출
    if (typeof allCodes === 'object' && 'data' in allCodes && Array.isArray(allCodes.data)) {
      return allCodes.data;
    }
    return [];
  };
  
  // 공통코드 헬퍼 함수
  const getMeetingBodyCodes = () => {
    const codes = getCodesArray();
    return codes.filter(code => 
      code.groupCode === 'MEETING_BODY' && code.useYn === 'Y'
    ).sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const getCodeName = (groupCode: string, code: string): string => {
    const codes = getCodesArray();
    const found = codes.find(item => 
      item.groupCode === groupCode && item.code === code
    );
    return found?.codeName || code;
  };
  
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
    totalPages: 0
  });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 삭제 확인 모달 상태
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);

  // 회의체 현황 컬럼 정의
  const meetingColumns: GridColDef[] = [
    { 
      field: 'gubun', 
      headerName: '구분', 
      width: 100,
      renderCell: (params) => getCodeName('MEETING_BODY', params.value)
    },
    { 
      field: 'meetingName', 
      headerName: '회의체명', 
      width: 200, 
      flex: 1,
      renderCell: (params) => (
        <span
          style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation(); // row click 이벤트 방지
            const selectedMeetingBody = meetingBodies.find(mb => mb.meetingBodyId === params.row.meetingBodyId);
            if (selectedMeetingBody) {
              setDialogMode('view');
              setSelectedMeetingBody(selectedMeetingBody);
              setDialogOpen(true);
            }
          }}
        >
          {params.value}
        </span>
      )
    },

    { 
      field: 'meetingPeriod', 
      headerName: '개최주기', 
      width: 120,
      renderCell: (params) => getCodeName('PERIOD', params.value)
    },
    { field: 'content', headerName: '주요 심의·의결사항', width: 300, flex: 2 }
  ];

  // API 호출 함수
  const fetchMeetingBodies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const searchParams = {
        gubun: filterDivision === '전체' ? undefined : filterDivision,
        page: pageInfo.page,
        size: pageInfo.size,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      };

      const responseData = await meetingBodyApi.search(searchParams);
      
      setMeetingBodies(responseData.content);
      setPageInfo(prev => ({
        ...prev,
        totalElements: responseData.totalElements,
        totalPages: responseData.totalPages
      }));
    } catch (err) {
      console.error('회의체 목록 조회 실패:', err);
      setError('회의체 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 localStorage에서 공통코드 복원
  useEffect(() => {
    const storedCommonCodes = localStorage.getItem('commonCodes');
    console.log('🔍 [MeetingStatusPage] localStorage 공통코드 확인:', !!storedCommonCodes);
    
    if (storedCommonCodes && (!allCodes || (Array.isArray(allCodes) && allCodes.length === 0) || (typeof allCodes === 'object' && 'data' in allCodes && (!allCodes.data || allCodes.data.length === 0)))) {
      try {
        const parsedCodes = JSON.parse(storedCommonCodes);
        console.log('✅ [MeetingStatusPage] localStorage에서 공통코드 복원:', parsedCodes.length, '개');
        setAllCodes(parsedCodes);
      } catch (error) {
        console.error('❌ [MeetingStatusPage] localStorage 공통코드 복원 실패:', error);
        localStorage.removeItem('commonCodes');
      }
    }
  }, [allCodes, setAllCodes]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchMeetingBodies();
  }, [filterDivision, pageInfo.page, pageInfo.size]); // eslint-disable-line react-hooks/exhaustive-deps

  // 조회 버튼 클릭 핸들러
  const handleSearch = () => {
    setPageInfo(prev => ({ ...prev, page: 0 }));
    fetchMeetingBodies();
  };

  // 다이얼로그 핸들러 함수들
  const handleCreateClick = () => {
    setDialogMode('create');
    setSelectedMeetingBody(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedMeetingBody(null);
  };

  const handleDialogSave = () => {
    // 목록 새로고침
    fetchMeetingBodies();
  };

  // 다이얼로그 모드 변경 핸들러
  const handleModeChange = (newMode: 'create' | 'edit' | 'view') => {
    setDialogMode(newMode);
  };

  // 행 클릭 핸들러 (상세조회)
  const handleRowClick = (params: GridRowParams) => {
    const selectedMeetingBody = meetingBodies.find(mb => mb.meetingBodyId === params.id);
    if (selectedMeetingBody) {
      setDialogMode('view');
      setSelectedMeetingBody(selectedMeetingBody);
      setDialogOpen(true);
    }
  };

  // 삭제 버튼 클릭 시: 모달만 띄움
  const handleDelete = () => {
    if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
      setError('삭제할 항목을 선택하세요.');
      return;
    }
    setPendingDelete(selectedIds);
    setConfirmOpen(true);
  };

  // 삭제 확인 모달에서 "확인" 클릭 시 실제 삭제
  const handleConfirmDelete = async () => {
    if (!pendingDelete || pendingDelete.length === 0) {
      setConfirmOpen(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await meetingBodyApi.deleteBulk(pendingDelete);
      setSelectedIds([]); // 선택 초기화
      fetchMeetingBodies(); // 목록 새로고침
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message?: string }).message === 'string') {
        setError((err as { message: string }).message);
      } else {
        setError('삭제 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
      setConfirmOpen(false);
      setPendingDelete(null);
    }
  };

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = () => {
    if (!meetingBodies || meetingBodies.length === 0) {
      setError('엑셀로 내보낼 데이터가 없습니다.');
      return;
    }
    // 화면 컬럼 헤더와 매핑 (한글)
    const headerMap: Record<string, string> = {
      gubun: '구분',
      meetingName: '회의체명',
      meetingPeriod: '개최주기',
      content: '주요 심의·의결사항',
    };
    // 데이터 변환 (한글 헤더, 코드값은 한글명으로 변환)
    const excelData = meetingBodies.map(row => ({
      [headerMap.gubun]: getCodeName('MEETING_BODY', row.gubun),
      [headerMap.meetingName]: row.meetingName,
      [headerMap.meetingPeriod]: getCodeName('PERIOD', row.meetingPeriod),
      [headerMap.content]: row.content,
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '회의체 현황');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `회의체_현황_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <MainLayout>
      <div className="main-content">
        {/* 페이지 제목 */}
        <div className="responsibility-header">
          <h1 className="responsibility-header__title">★ [100] 회의체 현황</h1>
        </div>

        {/* 노란색 구분선 */}
        <div className="responsibility-divider"></div>

        {/* 메인 콘텐츠 영역 */}
        <div className="responsibility-section" style={{ marginTop: '20px' }}>
          {/* 필터 영역 */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '16px', 
            alignItems: 'center',
            backgroundColor: '#f8f9fa',
            border: '1px solid #e9ecef',
            padding: '8px 16px',
            borderRadius: '4px'
          }}>
            <span style={{ 
              fontWeight: 'bold',
              fontSize: '0.9rem',
              color: '#333'
            }}>
              구분
            </span>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={filterDivision}
                onChange={(e) => setFilterDivision(e.target.value)}
                sx={{ 
                  backgroundColor: 'white',
                  fontSize: '0.85rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#ccc',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#999',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1976d2',
                  }
                }}
              >
                <MenuItem value="전체" sx={{ fontSize: '0.85rem' }}>전체</MenuItem>
                {getMeetingBodyCodes().map((code) => (
                  <MenuItem key={code.code} value={code.code} sx={{ fontSize: '0.85rem' }}>
                    {code.codeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button 
              variant="contained"
              size="small"
              onClick={handleSearch}
              sx={{ 
                backgroundColor: '#333',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: '500',
                '&:hover': {
                  backgroundColor: '#555'
                }
              }}
            >
              조회
            </Button>
          </div>

          {/* 버튼 영역 */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
            <Button variant="contained" color="success" size="small" onClick={handleExcelDownload} sx={{ mr: 1 }}>엑셀 다운로드</Button>
            <Button variant="contained" size="small" onClick={handleCreateClick}  sx={{ mr: 1 }}>등록</Button>
            <Button variant="contained" color="error" size="small" onClick={handleDelete}>삭제</Button>
          </Box>
          
          {/* 데이터 그리드 */}
          <Box sx={{ height: 'calc(100vh - 400px)', width: '100%' }}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <DataGrid
              rows={meetingBodies}
              columns={meetingColumns}
              loading={loading}
              // onRowClick={handleRowClick} // "회의체명" 셀 클릭만 상세조회로 제한
              getRowId={(row) => row.meetingBodyId}
              pagination
              paginationMode="server"
              checkboxSelection // 필요시만 사용
              rowCount={pageInfo.totalElements}
              pageSizeOptions={[10, 20, 50]}
              paginationModel={{
                page: pageInfo.page,
                pageSize: pageInfo.size
              }}
              onPaginationModelChange={(model) => setPageInfo(prev => ({ ...prev, page: model.page, size: model.pageSize }))}
              rowSelectionModel={selectedIds as any}
              onRowSelectionModelChange={(newSelectionModel) => {
                let stringIds: string[] = [];
                if (Array.isArray(newSelectionModel)) {
                  stringIds = newSelectionModel.map(id => String(id));
                } else if (
                  newSelectionModel &&
                  typeof newSelectionModel === 'object' &&
                  'ids' in newSelectionModel &&
                  newSelectionModel.ids instanceof Set
                ) {
                  stringIds = Array.from(newSelectionModel.ids).map(String);
                }
                setSelectedIds(stringIds);
              }}
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: '#b0c4de !important',
                  fontWeight: 'bold',
                },
                '& .MuiDataGrid-row': {
                  cursor: 'pointer'
                }
              }}
            />
          </Box>
        </div>

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
          title="삭제 확인"
          message="정말로 선택한 회의체를 삭제하시겠습니까?"
          confirmText="삭제"
          cancelText="취소"
          onConfirm={handleConfirmDelete}
          onCancel={() => { setConfirmOpen(false); setPendingDelete(null); }}
        />
      </div>
    </MainLayout>
  );
};

export default MeetingStatusPage; 