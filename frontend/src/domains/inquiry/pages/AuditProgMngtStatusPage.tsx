/**
 * 점검계획관리 현황 페이지
 * 점검계획관리 현황을 조회하고 관리합니다.
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { Button, ExcelDownloadButton } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { DateRangeSelector, SearchConditionPanel } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { Search as SearchIcon } from '@mui/icons-material';
import { Box, Chip } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import AuditProgMngtDialog, { type AuditProgramData } from '../components/AuditProgMngtDialog';
import InspectionTargetSelectionDialog, { type InspectionTargetItem } from '../components/InspectionTargetSelectionDialog';
import { 
  getAllAuditProgMngtStatusList, 
  deleteMultipleAuditProgMngt,
  createAuditProgMngt,
  updateAuditProgMngt,
  type AuditProgMngtStatusResponse,
  type AuditProgMngtRequest,
  type TargetItemData
} from '../api/auditProgMngtApi';

// 점검계획관리 현황 데이터 인터페이스
interface AuditProgRow {
  id: string;                 // DataGrid용 고유 식별자 (auditProgMngtCd와 동일)
  auditProgMngtCd: string;    // 점검계획코드
  auditProgName: string;      // 점검계획명
  auditTypeName: string;      // 점검유형명
  ledgerOrdersHod: string;    // 책무번호
  auditTarget: string;        // 점검대상
  auditPeriod: string;        // 점검기간
  auditTeamLeader: string;    // 점검팀장
  auditTeamMembers: string;   // 점검팀원
  targetItemCount: number;    // 대상 점검항목수
  auditStatusCd: string;    // 점검상태명
  remarks?: string;           // 비고
  createdAt: string;          // 등록일자
}

interface IAuditProgMngtStatusPageProps {
  className?: string;
}

/**
 * API 응답을 AuditProgRow로 변환하는 함수
 */
const convertApiResponseToRow = (response: AuditProgMngtStatusResponse): AuditProgRow => {
  return {
    id: response.auditProgMngtCd, // DataGrid용 고유 식별자
    auditProgMngtCd: response.auditProgMngtCd,
    auditProgName: response.auditProgName || '', // null 방지
    auditTypeName: response.auditTypeName || '', // null 방지
    ledgerOrdersHod: response.ledgerOrdersHod || '', // null 방지
    auditTarget: response.auditTarget || '', // null 방지
    auditPeriod: `${response.auditStartDate || ''} ~ ${response.auditEndDate || ''}`,
    auditTeamLeader: response.auditTeamLeader || '', // null 방지
    auditTeamMembers: response.auditTeamMembers || '', // null 방지
    targetItemCount: response.targetItemCount || 0,
    auditStatusCd: response.auditStatusCd || '', // null 방지
    remarks: response.remarks || '',
    createdAt: response.createdAt || '', // null 방지
  };
};

/**
 * 감사기간 문자열을 Date 객체로 파싱하는 함수
 */
const parsePeriod = (periodStr: string): { startDate: Date | null; endDate: Date | null } => {
  try {
    const parts = periodStr.split(' ~ ');
    if (parts.length === 2) {
      return {
        startDate: new Date(parts[0]),
        endDate: new Date(parts[1])
      };
    }
  } catch (error) {
    console.error('날짜 파싱 오류:', error);
  }
  return { startDate: null, endDate: null };
};

/**
 * AuditProgRow를 AuditProgramData로 변환하는 함수
 * 
 * 책임: 기존 데이터 구조와 다이얼로그 데이터 구조 간 변환
 */
const convertToAuditProgramData = (row: AuditProgRow): AuditProgramData => {
  const { startDate, endDate } = parsePeriod(row.auditPeriod);

  return {
    id: 0, // 임시 ID
    planCode: row.auditProgMngtCd,
    ledgerOrdersHod: row.ledgerOrdersHod,
    auditTitle: row.auditTarget, // 감사대상을 점검회차명으로 매핑
    startDate,
    endDate,
    targetSelection: `${row.targetItemCount}개 항목 선정`, // 대상 항목 수를 문자열로 변환
    remarks: row.remarks || '',
    targetItemIds: [], // 빈 배열로 초기화
  };
};


const AuditProgMngtStatusPage: React.FC<IAuditProgMngtStatusPageProps> = (): React.JSX.Element => {
  // 기본 날짜 계산 (3개월 전 ~ 오늘)
  const getDefaultDates = () => {
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    return { startDate: threeMonthsAgo, endDate: today };
  };

  // 기간 선택 상태
  const [startDate, setStartDate] = useState<Date | null>(getDefaultDates().startDate);
  const [endDate, setEndDate] = useState<Date | null>(getDefaultDates().endDate);

  // 점검계획관리 현황 데이터
  const [auditRows, setAuditRows] = useState<AuditProgRow[]>([]);
  const [selectedAuditIds, setSelectedAuditIds] = useState<string[]>([]);

  // 등록 모드
  const [isRegistrationMode, setIsRegistrationMode] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<AuditProgRow | null>(null);

  // 에러 다이얼로그 상태
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 점검 대상 선정 팝업 상태
  const [targetSelectionOpen, setTargetSelectionOpen] = useState(false);
  const [currentLedgerOrdersHod, setCurrentLedgerOrdersHod] = useState<string>('');
  const [selectedTargetItems, setSelectedTargetItems] = useState<InspectionTargetItem[]>([]);

  // 데이터 그리드 컬럼 정의
  const columns: DataGridColumn<AuditProgRow>[] = [
    {
      field: 'auditProgMngtCd',
      headerName: '점검계획코드',
      width: 140,
    },
    {
      field: 'auditProgName',
      headerName: '점검계획명',
      width: 180,
    },
    {
      field: 'auditTypeName',
      headerName: '점검유형',
      width: 100,
    },
    {
      field: 'ledgerOrdersHod',
      headerName: '책무번호',
      width: 120,
    },
    {
      field: 'auditTarget',
      headerName: '점검대상',
      width: 140,
    },
    {
      field: 'auditPeriod',
      headerName: '점검기간',
      width: 180,
    },
    {
      field: 'auditTeamLeader',
      headerName: '점검팀장',
      width: 100,
    },
    {
      field: 'auditTeamMembers',
      headerName: '점검팀원',
      width: 140,
    },
    {
      field: 'targetItemCount',
      headerName: '대상 점검항목수',
      width: 120,
      align: 'center' as const,
    },
    {
      field: 'auditStatusCd',
      headerName: '점검상태',
      width: 90,
      renderCell: ({ value }) => (
        <Chip
          label={
            value === 'AA03' ? '점검마감' :
            value === 'AA02' ? '점검진행' :
            value === 'AA01' ? '점검신청' : value
          }
          color={
            value === 'AA03' ? 'success' :
            value === 'AA02' ? 'primary' :
            value === 'AA01' ? 'default' : 'warning'
          }
          size="small"
        />
      ),
    },
    {
      field: 'remarks',
      headerName: '비고',
      width: 150,
    },
  ];

  // 점검계획관리 현황 조회
  const handleFetchAuditPrograms = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // 날짜를 문자열로 포맷팅
      const formatDate = (date: Date | null): string | undefined => {
        if (!date) return undefined;
        return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
      };
      
      // API 호출
      const apiResponse = await getAllAuditProgMngtStatusList(
        formatDate(startDate),
        formatDate(endDate)
      );
      
      console.log('API Response:', apiResponse);
      console.log('API Response type:', typeof apiResponse);
      console.log('API Response is array:', Array.isArray(apiResponse));
      console.log('API Response length:', apiResponse?.length);
      
      if (apiResponse && Array.isArray(apiResponse)) {
        console.log('First item:', apiResponse[0]);
        
        // API 응답을 화면용 데이터로 변환
        const convertedData = apiResponse.map(convertApiResponseToRow);
        console.log('Converted Data:', convertedData);
        console.log('Converted Data length:', convertedData.length);
        setAuditRows(convertedData);
      } else {
        console.error('API 응답이 배열이 아닙니다:', apiResponse);
        setAuditRows([]);
      }
      
    } catch (error) {
      console.error('점검계획관리 현황 조회 오류:', error);
      setErrorMessage('점검계획관리 현황 조회 중 오류가 발생했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  // 초기 로드 시 자동 조회
  useEffect(() => {
    handleFetchAuditPrograms();
  }, [handleFetchAuditPrograms]);

  // 행 선택 변경 핸들러
  const handleAuditRowSelectionModelChange = (
    selectedRows: (string | number)[]
  ) => {
    setSelectedAuditIds(selectedRows.map(id => String(id)));
  };

  // 행 클릭 핸들러 (상세보기)
  const handleAuditRowClick = (row: AuditProgRow) => {
    if (isRegistrationMode) {
      return;
    }
    setSelectedItem(row);
    setDialogMode('view');
    setIsRegistrationMode(true);
  };

  // 등록 모드 전환
  const handleRegistrationModeToggle = () => {
    setIsRegistrationMode(!isRegistrationMode);
    if (!isRegistrationMode) {
      setDialogMode('create');
      setSelectedItem(null);
      setSelectedTargetItems([]); // 새로운 등록 시 선택된 항목 초기화
    }
  };

  // 모달 닫기 핸들러
  const handleDialogClose = () => {
    setIsRegistrationMode(false);
    setSelectedItem(null);
    setDialogMode('create');
    setSelectedTargetItems([]); // 선택된 점검 대상 항목 초기화
  };

  // 점검계획관리 등록/수정
  const handleSubmit = async (data: AuditProgramData): Promise<void> => {
    try {
      setIsLoading(true);
      
      console.log('=== 점검계획관리 등록/수정 데이터 ===');
      console.log('받은 data:', data);
      console.log('data.targetItemIds:', data.targetItemIds);
      console.log('data.targetItemData:', data.targetItemData);
      console.log('selectedTargetItems (페이지 상태):', selectedTargetItems);
      
      // AuditProgramData를 AuditProgMngtRequest로 변환
      const request: AuditProgMngtRequest = {
        ledgerOrdersHod: data.ledgerOrdersHod,
        auditTitle: data.auditTitle, // 점검회차명 추가
        auditStartDt: data.startDate ? data.startDate.toISOString().split('T')[0] : '',
        auditEndDt: data.endDate ? data.endDate.toISOString().split('T')[0] : '',
        auditStatusCd: 'AA01', // 기본값: 점검신청
        auditContents: data.remarks,
        targetItemIds: data.targetItemIds || [], // 호환성 유지
        targetItemData: data.targetItemData || [] // 새로운 방식
      };
      
      console.log('API 요청 데이터:', request);
      console.log('targetItemIds 길이:', request.targetItemIds?.length);
      console.log('targetItemData 길이:', request.targetItemData?.length);
      console.log('targetItemData 내용:', request.targetItemData);
      
      if (dialogMode === 'create') {
        // 등록 시 auditProgMngtCd는 자동 생성되므로 제외
        await createAuditProgMngt(request);
        console.log('점검계획관리 등록 완료');
      } else if (dialogMode === 'edit' && data.planCode) {
        // 수정 시 auditProgMngtCd 추가
        request.auditProgMngtCd = data.planCode;
        await updateAuditProgMngt(data.planCode, request);
        console.log('점검계획관리 수정 완료');
      }
      
      handleDialogClose();
      handleFetchAuditPrograms();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '오류가 발생했습니다.');
      setErrorDialogOpen(true);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 점검 대상 선정 핸들러
  const handleTargetSelection = useCallback((formData?: AuditProgramData) => {
    // 현재 선택된 항목의 책무번호 또는 전달받은 책무번호 사용
    const ledgerOrdersHod = formData?.ledgerOrdersHod || selectedItem?.ledgerOrdersHod || '';
    setCurrentLedgerOrdersHod(ledgerOrdersHod);
    setTargetSelectionOpen(true);
  }, [selectedItem]);

  // 점검 대상 선정 완료 핸들러
  const handleTargetSelectionComplete = useCallback((selectedItems: InspectionTargetItem[]) => {
    console.log('선택된 점검 대상:', selectedItems);
    console.log('선택된 점검 대상 IDs:', selectedItems.map(item => item.id));
    setSelectedTargetItems(selectedItems);
    setTargetSelectionOpen(false);
  }, []);

  // 모드 변경 핸들러
  const handleModeChange = (mode: 'create' | 'edit' | 'view' | 'onlyRead') => {
    if (mode === 'onlyRead') {
      setDialogMode('view');
    } else {
      setDialogMode(mode);
    }
  };

  // 엑셀 데이터 변환
  const convertToExcelData = (rows: AuditProgRow[]) => {
    return rows.map(row => ({
      '점검계획코드': row.auditProgMngtCd,
      '점검계획명': row.auditProgName,
      '점검유형': row.auditTypeName,
      '책무번호': row.ledgerOrdersHod,
      '점검대상': row.auditTarget,
      '점검기간': row.auditPeriod,
      '점검팀장': row.auditTeamLeader,
      '점검팀원': row.auditTeamMembers,
      '대상점검항목수': row.targetItemCount,
      '점검상태': row.auditStatusCd,
      '비고': row.remarks,
      '등록일자': row.createdAt,
    }));
  };

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = async () => {
    try {
      console.log('점검계획관리 현황 엑셀 다운로드 시작');
      
      // 현재 표시된 데이터를 엑셀 형태로 변환
      const excelData = convertToExcelData(auditRows);
      
      console.log('엑셀 다운로드 데이터:', excelData);
      
      // TODO: 실제 엑셀 파일 생성 및 다운로드 로직 구현
      // 예: XLSX 라이브러리 사용하여 파일 생성 후 다운로드
      
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error);
      setErrorMessage('엑셀 다운로드 중 오류가 발생했습니다.');
      setErrorDialogOpen(true);
      throw error; // ExcelDownloadButton에서 에러 상태 처리
    }
  };

  // 점검계획관리 삭제
  const handleDelete = async () => {
    if (!selectedAuditIds.length) {
      setErrorMessage('삭제할 점검계획관리를 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    try {
      setIsLoading(true);
      
      // API 호출
      await deleteMultipleAuditProgMngt(selectedAuditIds);
      
      setSelectedAuditIds([]);
      handleFetchAuditPrograms();
    } catch (error) {
      console.error('점검계획관리 삭제 오류:', error);
      setErrorMessage(error instanceof Error ? error.message : '삭제 중 오류가 발생했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="[900] 점검계획관리 현황"
        icon={<SearchIcon />}
        description="점검계획관리 현황을 조회하고 관리합니다."
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
        <SearchConditionPanel disabled={isLoading}>
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onSearch={handleFetchAuditPrograms}
            loading={isLoading}
          />
        </SearchConditionPanel>

        {/* 버튼 영역 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
          <ExcelDownloadButton 
            onDownload={handleExcelDownload}
            filename="audit_prog_mngt_status"
            disabled={isLoading}
          />
            <Button
              variant="contained"
              size="small"
              onClick={handleRegistrationModeToggle}
              color="success"
              disabled={isLoading}
            >
              등록
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleDelete}
              disabled={!selectedAuditIds.length || isLoading}
              color="primary"
              style={{ color: 'white' }}
            >
              삭제
            </Button>
          </Box>
        </Box>

        {/* 데이터 그리드 */}
        <Box sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <DataGrid
            data={auditRows}
            columns={columns}
            height={600} 
            loading={isLoading}
            error={null}
            onRowClick={handleAuditRowClick}
            onRowSelectionChange={handleAuditRowSelectionModelChange}
            checkboxSelection={true}
            rowSelectionModel={selectedAuditIds}
            sx={{
              height: '600px',
              '& .MuiDataGrid-virtualScroller': {
                overflow: 'auto'
              }
            }}
          />
        </Box>

        {/* 점검계획관리 등록/수정 다이얼로그 */}
        {isRegistrationMode && (
          <AuditProgMngtDialog
            open={isRegistrationMode}
            mode={dialogMode}
            onClose={handleDialogClose}
            onSave={handleSubmit}
            onModeChange={handleModeChange}
            loading={isLoading}
            initialData={selectedItem ? convertToAuditProgramData(selectedItem) : null}
            onTargetSelection={handleTargetSelection}
            selectedTargetItems={selectedTargetItems}
          />
        )}

        {/* 점검 대상 선정 다이얼로그 */}
        <InspectionTargetSelectionDialog
          open={targetSelectionOpen}
          onClose={() => setTargetSelectionOpen(false)}
          onSelect={handleTargetSelectionComplete}
          ledgerOrdersHod={currentLedgerOrdersHod}
        />

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

export default AuditProgMngtStatusPage;