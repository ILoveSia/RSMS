/**
 * 항목별 점검 현황 페이지
 * 적부구조도 이력 점검의 항목별 점검 현황 관리 페이지
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { Button, ExcelDownloadButton } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { LedgerOrdersHodSelect, CommonCodeSelect } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { 
  Search as SearchIcon,
  Person as PersonIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { Box, Chip } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { getAuditItemStatusList, type AuditItemStatusResponse } from '../api/auditItemApi';
import { assignAuditor, type AuditorAssignmentRequest } from '../api/auditorApi';
import AuditorAssignmentDialog from '../components/AuditorAssignmentDialog';

// 항목별 점검 현황 데이터 인터페이스
interface AuditItemRow {
  id: string;                           // DataGrid용 고유 식별자
  hodIcItemId: number;                  // 부서장 내부통제 항목 ID
  responsibilityContent: string;        // 책무
  positionsNm: string;                  // 직책명
  deptCd: string;                       // 부서
  fieldTypeCd: string;                  // 항목구분
  roleTypeCd: string;                   // 직무구분
  icTask: string;                       // 내부통제업무
  auditMenId: string;                   // 점검자
  auditResultStatusCd: string;          // 점검결과
  impPlStatusCd: string;                // 점검진행상태
}

/**
 * API 응답을 AuditItemRow로 변환하는 함수
 */
const convertApiResponseToRow = (response: AuditItemStatusResponse): AuditItemRow => {
  return {
    id: response.hodIcItemId.toString(), // DataGrid용 고유 식별자
    hodIcItemId: response.hodIcItemId,
    responsibilityContent: response.responsibilityContent || '',
    positionsNm: response.positionsNm || '',
    deptCd: response.deptCd || '',
    fieldTypeCd: response.fieldTypeCd || '',
    roleTypeCd: response.roleTypeCd || '',
    icTask: response.icTask || '',
    auditMenId: response.auditMenId || '',
    auditResultStatusCd: response.auditResultStatusCd || '',
    impPlStatusCd: response.impPlStatusCd || '',
  };
};

interface IAuditItemStatusPageProps {
  className?: string;
}

const AuditItemStatusPage: React.FC<IAuditItemStatusPageProps> = (): React.JSX.Element => {
  
  // 검색 조건 상태
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('ALL');
  const [selectedImpPlStatus, setSelectedImpPlStatus] = useState<string>('ALL');


  // 항목별 점검 현황 데이터
  const [auditItemRows, setAuditItemRows] = useState<AuditItemRow[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // 에러 다이얼로그 상태
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // 점검자 지정 다이얼로그 상태
  const [auditorDialogOpen, setAuditorDialogOpen] = useState(false);

  // 데이터 그리드 컬럼 정의
  const columns: DataGridColumn<AuditItemRow>[] = [
    {
      field: 'hodIcItemId',
      headerName: '부서장\n내부통제 항목ID',
      width: 180,
    },
    {
      field: 'responsibilityContent',
      headerName: '책무',
      width: 200,
    },
    {
      field: 'positionsNm',
      headerName: '책무별 직책',
      width: 120,
    },
    {
      field: 'deptCd',
      headerName: '부서',
      width: 100,
    },
    {
      field: 'fieldTypeCd',
      headerName: '항목구분',
      width: 100,
    },
    {
      field: 'roleTypeCd',
      headerName: '직무구분',
      width: 100,
    },
    {
      field: 'icTask',
      headerName: '내부통제업무',
      width: 180,
    },
    {
      field: 'auditMenId',
      headerName: '점검자',
      width: 100,
    },
    {
      field: 'auditResultStatusCd',
      headerName: '점검결과',
      width: 100,
      renderCell: ({ value }) => (
        <Chip
          label={
            value === 'SUITABLE' ? '적정' :
            value === 'INADEQUATE' ? '미흡' :
            value === 'EXCLUDED' ? '제외' :
            value === 'IN_PROGRESS' ? '진행중' : value
          }
          color={
            value === 'SUITABLE' ? 'success' :
            value === 'INADEQUATE' ? 'error' :
            value === 'EXCLUDED' ? 'default' : 'primary'
          }
          size="small"
        />
      ),
    },
    {
      field: 'impPlStatusCd',
      headerName: '점검진행상태',
      width: 120,
      renderCell: ({ value }) => (
        <Chip
          label={
            value === 'PLAN_WRITE' ? '계획작성' :
            value === 'PLAN_APPROVAL_REQ' ? '계획결재요청' :
            value === 'PLAN_APPROVAL_COMP' ? '계획결재완료' :
            value === 'IMPL_WRITE' ? '이행작성' :
            value === 'IMPL_APPROVAL_REQ' ? '이행결재요청' :
            value === 'IMPL_APPROVAL_COMP' ? '이행결재완료' : value
          }
          color={
            value === 'IMPL_APPROVAL_COMP' ? 'success' :
            value === 'PLAN_APPROVAL_COMP' ? 'primary' :
            value === 'PLAN_WRITE' ? 'default' : 'warning'
          }
          size="small"
        />
      ),
    },
  ];

  // 항목별 점검 현황 조회
  const handleFetchAuditItems = useCallback(async () => {
    try {
      setIsLoading(true);
      
      console.log('검색 조건:', { selectedLedgerOrder, selectedImpPlStatus });
      
      // 실제 API 호출
      const apiResponse = await getAuditItemStatusList({
        ledgerOrdersHod: selectedLedgerOrder === 'ALL' ? '' : selectedLedgerOrder,
        auditResultStatusCd: selectedImpPlStatus === 'ALL' ? '' : selectedImpPlStatus
      });
      
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
        setAuditItemRows(convertedData);
      } else {
        console.error('API 응답이 배열이 아닙니다:', apiResponse);
        setAuditItemRows([]);
      }
      
    } catch (error) {
      console.error('항목별 점검 현황 조회 오류:', error);
      setErrorMessage('항목별 점검 현황 조회 중 오류가 발생했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLedgerOrder, selectedImpPlStatus, selectedImpPlStatus]);

  // 초기 로드 시 자동 조회
  useEffect(() => {
    handleFetchAuditItems();
  }, [handleFetchAuditItems]);

  // 행 선택 변경 핸들러
  const handleItemRowSelectionModelChange = (
    selectedRows: (string | number)[]
  ) => {
    setSelectedItemIds(selectedRows.map(id => String(id)));
  };

  // 엑셀 다운로드 핸들러
  const handleExcelDownload = async () => {
    try {
      console.log('항목별 점검 현황 엑셀 다운로드 시작');
      
      // 현재 표시된 데이터를 엑셀 형태로 변환
      const excelData = auditItemRows.map(row => ({
        '부서장내부통제항목ID': row.hodIcItemId,
        '책무': row.responsibilityContent,
        '책무별직책': row.positionsNm,
        '부서': row.deptCd,
        '항목구분': row.fieldTypeCd,
        '직무구분': row.roleTypeCd,
        '내부통제업무': row.icTask,
        '점검자': row.auditMenId,
        '점검결과': row.auditResultStatusCd,
        '점검진행상태': row.impPlStatusCd,
      }));
      
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

  // 점검자 지정 핸들러
  const handleAssignAuditor = () => {
    if (!selectedItemIds.length) {
      setErrorMessage('점검자를 지정할 항목을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }
    console.log('점검자 지정:', selectedItemIds);
    setAuditorDialogOpen(true);
  };

  // 점검자 지정 저장 핸들러
  const handleAuditorAssignment = async (auditorEmpNo: string, auditorName: string): Promise<void> => {
    try {
      setIsLoading(true);

      // API 요청 데이터 구성
      const assignmentRequest: AuditorAssignmentRequest = {
        hodIcItemIds: selectedItemIds,
        auditorEmpNo,
        auditorName
      };

      console.log('점검자 지정 요청:', assignmentRequest);

      // 점검자 지정 API 호출
      const result = await assignAuditor(assignmentRequest);

      console.log('점검자 지정 완료:', result);

      // 성공 메시지 표시
      alert(result.message || '점검자 지정이 완료되었습니다.');

      // 다이얼로그 닫기
      setAuditorDialogOpen(false);
      setSelectedItemIds([]);

      // 데이터 새로고침
      await handleFetchAuditItems();

    } catch (error) {
      console.error('점검자 지정 오류:', error);
      setErrorMessage('점검자 지정 중 오류가 발생했습니다.');
      setErrorDialogOpen(true);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 점검 결과 작성 핸들러
  const handleWriteAuditResult = () => {
    if (!selectedItemIds.length) {
      setErrorMessage('점검 결과를 작성할 항목을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }
    console.log('점검 결과 작성:', selectedItemIds);
    // TODO: 점검 결과 작성 다이얼로그 열기
  };

  return (
    <PageContainer>
      <PageHeader
        title="[901] 점검 현황(항목별)"
        icon={<SearchIcon />}
        description="적부구조도 이력 점검의 항목별 점검 현황을 조회하고 관리합니다."
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
        {/* 검색 조건 영역 */}
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
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <LedgerOrdersHodSelect
              value={selectedLedgerOrder}
              onChange={setSelectedLedgerOrder}
              size='small'
              sx={{ minWidth: 150, maxWidth: 200 }}
            />
            <CommonCodeSelect
              groupCode="PLAN_IMP"
              value={selectedImpPlStatus}
              onChange={setSelectedImpPlStatus}
              size="small"
              sx={{ width: '200px' }}
            />
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={handleFetchAuditItems}
            color="primary"
          >
            조회
          </Button>
        </Box>

        {/* 버튼 영역 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5, gap: 1 }}>
          <ExcelDownloadButton
            onDownload={handleExcelDownload}
            filename="audit_item_status"
            disabled={isLoading}
            loading={isLoading}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleAssignAuditor}
            disabled={!selectedItemIds.length || isLoading}
            color="secondary"
            startIcon={<PersonIcon />}
            sx={{ 
              color: 'white !important', 
              '& .MuiSvgIcon-root': { color: 'white' },
              '& .MuiButton-root': { color: 'white !important' }
            }}
          >
            점검자지정
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleWriteAuditResult}
            disabled={!selectedItemIds.length || isLoading}
            color="success"
            startIcon={<EditIcon />}
            sx={{ 
              color: 'white !important', 
              '& .MuiSvgIcon-root': { color: 'white' },
              '& .MuiButton-root': { color: 'white !important' }
            }}
          >
            점검결과작성
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
            data={auditItemRows}
            columns={columns}
            loading={isLoading}
            error={null}
            onRowSelectionChange={handleItemRowSelectionModelChange}
            checkboxSelection={true}
            rowSelectionModel={selectedItemIds}
            sx={{
              height: '650px',
              '& .MuiDataGrid-virtualScroller': {
                overflow: 'auto'
              },
              '& .MuiDataGrid-columnHeaders': {
                minHeight: '80px !important'
              },
              '& .MuiDataGrid-columnHeader[data-field="hodIcItemId"]': {
                '& .MuiDataGrid-columnHeaderTitle': {
                  whiteSpace: 'pre-line',
                  lineHeight: '1.3',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  wordBreak: 'keep-all'
                }
              }
            }}
          />
          
          {/* 디버깅 정보 */}
          {!isLoading && (
            <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', fontSize: '12px', color: '#666' }}>
              <div>Grid 데이터 개수: {auditItemRows.length}</div>
              <div>선택된 항목: {selectedItemIds.length}개</div>
            </Box>
          )}
        </Box>

        {/* 점검자 지정 다이얼로그 */}
        <AuditorAssignmentDialog
          open={auditorDialogOpen}
          onClose={() => setAuditorDialogOpen(false)}
          onAssign={handleAuditorAssignment}
          selectedItemIds={selectedItemIds}
          loading={isLoading}
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

export default AuditItemStatusPage;
