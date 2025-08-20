/**
 * 항목별 점검 현황 페이지
 * 적부구조도 이력 점검의 항목별 점검 현황 관리 페이지
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { Button, ExcelDownloadButton, SearchButton, ManagementButtonGroup } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import { LedgerOrdersHodSelect, CommonCodeSelect, SearchConditionPanel } from '@/shared/components/ui/form';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { DataGridColumn } from '@/shared/types/common';
import { useReduxState } from '@/app/store/use-store';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Create as CreateIcon
} from '@mui/icons-material';
import { Box, Chip } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { getAuditItemStatusList, type AuditItemStatusResponse } from '../api/auditItemApi';
import { assignAuditor, type AuditorAssignmentRequest } from '../api/auditorApi';
import AuditorAssignmentDialog from '../components/AuditorAssignmentDialog';
import AuditResultDialog, {
  type AuditItemInfo,
  type DialogMode
} from '../components/AuditResultDialog';
import {
  getAuditResultDetail
} from '../api/auditResultApi';
import DepartmentApi from '@/domains/common/api/departmentApi';
import {
  useGetCodeName,
  useGetRoleTypeName,
  getDepartmentNameSync,
  extractCommonCodes,
  type CommonCode,
  type Department
} from '@/shared/utils/codeUtils';

// 항목별 점가 현황 데이터 인터페이스 (그룹화된 버전)
interface AuditItemRow {
  id: string;                           // DataGrid용 고유 식별자 (hodIcItemId)
  hodIcItemId: number;                  // 부서장 내부통제 항목 ID
  auditProgMngtDetailIds: number[];     // 점검 계획관리 상세 ID 배열 (그룹화)
  responsibilityContent: string;        // 책무
  responsibilityDetailContent: string;  // 책무상세내역
  positionsNm: string;                  // 직책명
  deptCd: string;                       // 부서
  fieldTypeCd: string;                  // 항목구분
  roleTypeCd: string;                   // 직무구분
  icTask: string;                       // 내부통제업무
  auditMenIds: string[];                // 점검자 배열 (그룹화)
  auditMenId: string;                   // 점검자 (표시용 - 쉼표로 구분)
  roleSumm: string;                     // 책무 개요
  auditDoneDt: string;                  // 이행완료 예정일자
  auditDetailContent: string;          // 점검 세부내용
  auditResultStatusCd: string;          // 점가결과 (최우선 상태)
  impPlStatusCd: string;                // 이행완료 예정일자
  auditDoneContent: string;             // 이행결과보고
  auditStatusCd: string;                // 점검상태코드
  responsibilityId: number;             // 책무 ID
  detailCount: number;                  // 상세 항목 개수
  auditTitle: string;                   // 점검회차명
  auditStatusCdFromProgMngt: string;    // 점검 계획진행상태
  auditFinalResultYn: string;           // 점검최종결과여부
}

/**
 * 점검결과 상태 우선순위 (높을수록 우선)
 */
const getStatusPriority = (status: string): number => {
  switch (status) {
    case 'INS03': return 4; // 미흡 (가장 높은 우선순위)
    case 'INS02': return 3; // 적정
    case 'INS01': return 2; // 진행중
    case 'INS04': return 1; // 제외
    default: return 0;
  }
};

/**
 * API 응답 배열을 hod_ic_item_id 기준으로 그룹화하여 AuditItemRow 배열로 변환
 */
const groupAndConvertApiResponse = (responses: AuditItemStatusResponse[]): AuditItemRow[] => {
  // hod_ic_item_id 기준으로 그룹화
  const grouped = responses.reduce((acc, response) => {
    const key = response.hodIcItemId.toString();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(response);
    return acc;
  }, {} as Record<string, AuditItemStatusResponse[]>);

  // 그룹화된 데이터를 AuditItemRow로 변환
  return Object.entries(grouped).map(([hodIcItemId, items]) => {
    // 첫 번째 항목을 기본값으로 사용
    const firstItem = items[0];
    
    // 점검자 목록 (중복 제거)
    const auditMenIds = [...new Set(items
      .map(item => item.auditMenId)
      .filter(id => id && id.trim() !== '')
    )];

    // 점검결과 상태 중 가장 우선순위가 높은 것 선택
    const priorityStatus = items
      .filter(item => item.auditResultStatusCd)
      .sort((a, b) => getStatusPriority(b.auditResultStatusCd) - getStatusPriority(a.auditResultStatusCd))[0];

    return {
      id: hodIcItemId,
      hodIcItemId: parseInt(hodIcItemId),
      auditProgMngtDetailIds: items.map(item => item.auditProgMngtDetailId),
      responsibilityContent: firstItem.responsibilityContent || '',
      responsibilityDetailContent: firstItem.responsibilityDetailContent || '',
      positionsNm: firstItem.positionsNm || '',
      deptCd: firstItem.deptCd || '',
      fieldTypeCd: firstItem.fieldTypeCd || '',
      roleTypeCd: firstItem.roleTypeCd || '',
      icTask: firstItem.icTask || '',
      auditMenIds,
      auditMenId: auditMenIds.join(', '), // 표시용
      roleSumm: firstItem.roleSumm || '',
      auditDoneDt: firstItem.auditDoneDt || '',
      auditDetailContent: firstItem.auditDetailContent || '',
      auditResultStatusCd: priorityStatus?.auditResultStatusCd || firstItem.auditResultStatusCd || '',
      impPlStatusCd: firstItem.impPlStatusCd || '',
      auditDoneContent: firstItem.auditDoneContent || '',
      auditStatusCd: firstItem.auditStatusCd || '',
      responsibilityId: firstItem.responsibilityId || 0,
      detailCount: items.length,
      auditTitle: firstItem.auditTitle || '',
      auditStatusCdFromProgMngt: firstItem.auditStatusCdFromProgMngt || '',
      auditFinalResultYn: firstItem.auditFinalResultYn || 'N',
    };
  });
};

interface IAuditItemStatusPageProps {
  className?: string;
}

const AuditItemStatusPage: React.FC<IAuditItemStatusPageProps> = (): React.JSX.Element => {

  // 검색 조건 상태
  const [selectedLedgerOrder, setSelectedLedgerOrder] = useState<string>('ALL');
  const [selectedImpPlStatus, setSelectedImpPlStatus] = useState<string>('ALL');

  // Redux에서 공통코드 가져오기
  const { data: allCodesData } = useReduxState<{ data: CommonCode[] } | CommonCode[]>('codeStore/allCodes');

  // 공통코드 배열 추출
  const allCodes = extractCommonCodes(allCodesData);

  // 부서 정보 상태
  const [departments, setDepartments] = useState<Department[]>([]);

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

  // 점검결과작성 다이얼로그 상태
  const [auditResultDialogOpen, setAuditResultDialogOpen] = useState(false);
  const [auditResultDialogMode, setAuditResultDialogMode] = useState<DialogMode>('create');

  // 부서 정보 로드
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const deptList = await DepartmentApi.getAll();
        setDepartments(deptList);
      } catch (error) {
        console.error('부서 정보 로드 실패:', error);
      }
    };
    loadDepartments();
  }, []);
  // Hook을 컴포넌트 레벨에서 호출
  const getCodeNameFn = useGetCodeName();
  const getRoleTypeNameFn = useGetRoleTypeName();

  // 데이터 그리드 컬럼 정의
  const columns: DataGridColumn<AuditItemRow>[] = [
    {
      field: 'hodIcItemId',
      headerName: '항목ID',
      width: 100,
    },
    {
      field: 'auditTitle',
      headerName: '점검회차명',
      width: 150,
    },
    // {
    //   field: 'auditStatusCdFromProgMngt',
    //   headerName: '점검진행상태',
    //   width: 120,
    //   renderCell: ({ value }) => {
    //     if (!value) return null;
    //     return (
    //       <Chip
    //         label={
    //           value === 'AA03' ? '점검마감' :
    //             value === 'AA02' ? '점검진행' :
    //               value === 'AA01' ? '점검신청' : value
    //         }
    //         color={
    //           value === 'AA03' ? 'success' :
    //             value === 'AA02' ? 'primary' :
    //               value === 'AA01' ? 'default' : 'warning'
    //         }
    //         size="small"
    //       />
    //     );
    //   },
    // },
    // {
    //   field: 'responsibilityContent',
    //   headerName: '책무',
    //   width: 200,
    // },
    {
      field: 'responsibilityDetailContent',
      headerName: '책무상세내역',
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
      width: 120,
      renderCell: ({ value }) => getDepartmentNameSync(departments, value as string),
    },
    {
      field: 'fieldTypeCd',
      headerName: '항목구분',
      width: 120,
      renderCell: ({ value }) => getCodeNameFn('FIELD_TYPE', value as string),
    },
    {
      field: 'roleTypeCd',
      headerName: '직무구분',
      width: 120,
      renderCell: ({ value }) => getRoleTypeNameFn(value as string),
    },
    {
      field: 'icTask',
      headerName: '내부통제업무',
      width: 180,
    },
    {
      field: 'auditMenId',
      headerName: '점검자',
      width: 150,
      renderCell: ({ row }) => {
        const { auditMenId, detailCount } = row;
        return (
          <Box>
            <div>{auditMenId || '미지정'}</div>
            {detailCount > 1 && (
              <div style={{ fontSize: '0.75rem', color: '#666' }}>
                ({detailCount}개 항목)
              </div>
            )}
          </Box>
        );
      },
    },
    {
      field: 'auditResultStatusCd',
      headerName: '점검결과',
      width: 100,
      renderCell: ({ value }) => {
        if (!value) return null;
        return (
          <Chip
            label={
              value === 'INS02' ? '적정' :
                value === 'INS03' ? '미흡' :
                  value === 'INS04' ? '제외' :
                    value === 'INS01' ? '진행중' : value
            }
            color={
              value === 'INS02' ? 'success' :
                value === 'INS03' ? 'error' :
                  value === 'INS01' ? 'default' : 'primary'
            }
            size="small"
          />
        );
      },
    },
    
    {
      field: 'auditDoneDt',
      headerName: '이행완료 예정일자',
      width: 180,
    },
    {
      field: 'auditDetailContent',
      headerName: '점검 세부내용',
      width: 180,
    },
    {
      field: 'auditFinalResultYn',
      headerName: '점검 및 이행완료',
      width: 130,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => {
        return (
          <Chip
            label={value === 'Y' ? '완료' : '진행중'}
            color={value === 'Y' ? 'success' : 'warning'}
            size="small"
          />
        );
      },
    }

  ];

  // 항목별 점검 현황 조회
  const handleFetchAuditItems = useCallback(async () => {
    try {
      setIsLoading(true);

      // 실제 API 호출
      const apiResponse = await getAuditItemStatusList({
        ledgerOrdersHod: selectedLedgerOrder === 'ALL' ? undefined : Number(selectedLedgerOrder),
        auditResultStatusCd: selectedImpPlStatus === 'ALL' ? undefined : selectedImpPlStatus
      });

      if (apiResponse && Array.isArray(apiResponse)) {
        // console.log('First item:', apiResponse[0]);

        // API 응답을 hod_ic_item_id 기준으로 그룹화하여 변환
        const groupedData = groupAndConvertApiResponse(apiResponse);
        setAuditItemRows(groupedData);
      } else {
        // console.error('API 응답이 배열이 아닙니다:', apiResponse);
        setAuditItemRows([]);
      }

    } catch (error) {
      // console.error('항목별 점검 현황 조회 오류:', error);
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
      // 현재 표시된 그룹화된 데이터를 엑셀 형태로 변환
      const excelData = auditItemRows.map(row => ({
        '부서장내부통제항목ID': row.hodIcItemId,
        '책무': row.responsibilityContent,
        '책무상세내역': row.responsibilityDetailContent,
        '책무별직책': row.positionsNm,
        '부서': row.deptCd,
        '항목구분': row.fieldTypeCd,
        '직무구분': row.roleTypeCd,
        '내부통제업무': row.icTask,
        '점검자': row.auditMenId,
        '점검결과': row.auditResultStatusCd,
        '책무 개요': row.roleSumm,
        '이행완료 예정일자': row.auditDoneDt,
        '점검 세부내용': row.auditDetailContent,
        '상세항목수': row.detailCount,
        '상세ID목록': row.auditProgMngtDetailIds.join(', '),
      }));


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
    // 1. 선택된 행이 없는 경우
    if (!selectedItemIds.length) {
      setErrorMessage('점검자를 지정할 항목을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    // 2. 선택된 행이 1개가 아닌 경우
    if (selectedItemIds.length !== 1) {
      setErrorMessage('점검자 지정은 한 번에 하나의 항목만 선택할 수 있습니다.');
      setErrorDialogOpen(true);
      return;
    }

    // 선택된 행 데이터 가져오기
    const selectedRow = auditItemRows.find(row => selectedItemIds.includes(row.id));
    if (!selectedRow) {
      setErrorMessage('선택된 항목을 찾을 수 없습니다.');
      setErrorDialogOpen(true);
      return;
    }

    // 3. 점검자가 "미지정"이 아닌 경우
    if (selectedRow.auditMenId && selectedRow.auditMenId.trim() !== '' && selectedRow.auditMenId !== '미지정') {
      setErrorMessage('이미 점검자가 지정된 항목입니다.');
      setErrorDialogOpen(true);
      return;
    }

    // 4. 점검결과가 이미 있는 경우
    if (selectedRow.auditResultStatusCd && selectedRow.auditResultStatusCd.trim() !== '') {
      setErrorMessage('점검결과가 이미 있는 항목은 점검자를 지정할 수 없습니다.');
      setErrorDialogOpen(true);
      return;
    }

    // 모든 조건을 만족하는 경우 점검자 지정 다이얼로그 열기
    setAuditorDialogOpen(true);
  };

  // 점검자 지정 저장 핸들러
  const handleAuditorAssignment = async (auditorEmpNo: string, auditorName: string): Promise<void> => {
    try {
      setIsLoading(true);

      // 선택된 항목의 hodIcItemId 가져오기 (그룹화된 행에서)
      const selectedRows = auditItemRows.filter(row => selectedItemIds.includes(row.id));
      const hodIcItemIds = selectedRows.map(row => row.hodIcItemId);

      console.log('점검자 지정 요청 데이터:', {
        hodIcItemIds,
        auditorEmpNo,
        auditorName,
        selectedRows: selectedRows.map(r => ({ id: r.id, hodIcItemId: r.hodIcItemId, detailCount: r.detailCount }))
      });

      // API 요청 데이터 구성 (hodIcItemId 사용)
      const assignmentRequest: AuditorAssignmentRequest = {
        hodIcItemIds: hodIcItemIds.map(id => id.toString()), // hod_ic_item_id를 문자열로 변환
        auditorEmpNo,
        auditorName
      };
      // 점검자 지정 API 호출
      const result = await assignAuditor(assignmentRequest);
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

  // 점검 결과 작성/수정 통합 핸들러
  const handleAuditResult = async () => {
    if (!selectedItemIds.length) {
      setErrorMessage('점검 결과를 작성할 항목을 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    // 선택된 항목들의 점검결과 상태 검증
    const selectedRows = auditItemRows.filter(row => selectedItemIds.includes(row.id));
    
    // auditResultStatusCd가 INS01(진행중)이 아닌 항목 체크
    const invalidRows = selectedRows.filter(row => row.auditResultStatusCd !== 'INS01');
    
    if (invalidRows.length > 0) {
      setErrorMessage('점검결과 작성은 진행중(INS01) 상태인 항목만 가능합니다.');
      setErrorDialogOpen(true);
      return;
    }

    try {

      // 선택된 항목들의 모든 auditProgMngtDetailIds 추출 (그룹화된 데이터)
      const auditProgMngtDetailIds = selectedRows.flatMap(row => row.auditProgMngtDetailIds);

      const existingResults = await getAuditResultDetail(auditProgMngtDetailIds);

      // 🚨 단순화된 모드 결정 로직
      let hasExistingData = false;

      // 단순한 조건: API 응답에 데이터가 있으면 edit, 없으면 create
      if (existingResults && Array.isArray(existingResults) && existingResults.length > 0) {
        hasExistingData = true;
      }

      const selectedMode = hasExistingData ? 'edit' : 'create';

      setAuditResultDialogMode(selectedMode);
      setAuditResultDialogOpen(true);

    } catch (error) {
      console.error('오류 상세:', {
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        stack: error instanceof Error ? error.stack : null,
        type: typeof error,
        errorObject: error
      });
      setAuditResultDialogMode('create');
      setAuditResultDialogOpen(true);
    }
  };

  // 선택된 항목들을 AuditItemInfo 형태로 변환 (그룹화된 데이터 처리)
  const getSelectedAuditItems = (): AuditItemInfo[] => {
    return auditItemRows
      .filter(row => selectedItemIds.includes(row.id))
      .flatMap(row => 
        // 각 그룹화된 행에 대해 모든 auditProgMngtDetailIds를 개별 AuditItemInfo로 변환
        row.auditProgMngtDetailIds.map(detailId => ({
          hodIcItemId: row.hodIcItemId,
          auditProgMngtDetailId: detailId,
          responsibilityContent: row.responsibilityContent,
          responsibilityDetailContent: row.responsibilityDetailContent,
          positionsNm: row.positionsNm,
          deptCd: row.deptCd,
          fieldTypeCd: row.fieldTypeCd,
          roleTypeCd: row.roleTypeCd,
          icTask: row.icTask,
        }))
      );
  };


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
        title="[1000] 점검 현황(항목별)"
        icon={<SearchIcon />}
        description="적부구조도 이력 점검의 항목별 점검 현황을 조회하고 관리합니다."
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
          position: 'relative',
          py: 1,
        }}
      >
        {/* 검색 조건 영역 */}
        <SearchConditionPanel disabled={isLoading}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', whiteSpace: 'nowrap' }}>점검회차</span>
            <LedgerOrdersHodSelect
              value={selectedLedgerOrder}
              onChange={setSelectedLedgerOrder}
              size='small'
              disabled={isLoading}
              sx={{ minWidth: 150, maxWidth: 200 }}
            />
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px', whiteSpace: 'nowrap' }}>진행상태</span>
            <CommonCodeSelect
              groupCode="INSPEC_RESULT"
              value={selectedImpPlStatus}
              onChange={setSelectedImpPlStatus}
              size="small"
              disabled={isLoading}
              sx={{ width: '200px' }}
            />
          </Box>
          <SearchButton
            onClick={handleFetchAuditItems}
            loading={isLoading}
          />
        </SearchConditionPanel>

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
              height: '32px',
              minWidth: '80px',
              fontSize: '0.875rem',
              fontWeight: 600,
              px: 1.5,
              lineHeight: 1,
              borderRadius: 1,
              ...((!selectedItemIds.length || isLoading) ? {
                color: 'var(--bank-text-primary) !important',
                '& .MuiSvgIcon-root': { color: 'var(--bank-text-primary)' }
              } : {
                color: 'white !important',
                '& .MuiSvgIcon-root': { color: 'white' }
              })
            }}
          >
            점검자지정
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleAuditResult}
            disabled={!selectedItemIds.length || isLoading}
            color="success"
            startIcon={<CreateIcon />}
            sx={{
              height: '32px',
              minWidth: '80px',
              fontSize: '0.875rem',
              fontWeight: 600,
              px: 1.5,
              lineHeight: 1,
              borderRadius: 1,
              ...((!selectedItemIds.length || isLoading) ? {
                color: 'var(--bank-text-primary) !important',
                '& .MuiSvgIcon-root': { color: 'var(--bank-text-primary)' }
              } : {
                color: 'white !important',
                '& .MuiSvgIcon-root': { color: 'white' }
              })
            }}
          >
            점검결과작성
          </Button>
        </Box>

        {/* 데이터 그리드 */}
        <Box sx={{
          width: '100%',
          flex: 1
        }}>
          <DataGrid
            data={auditItemRows}
            columns={columns}
            loading={isLoading}
            error={null}
            selectable={true}
            multiSelect={false}
            selectedRows={selectedItemIds}
            onRowSelectionChange={handleItemRowSelectionModelChange}
            rowIdField='id'
            sx={{
              width: '100%',
              height: '600px',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'var(--bank-bg-secondary) !important',
                fontWeight: 'bold',
              },
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
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

        </Box>

        {/* 점검자 지정 다이얼로그 */}
        <AuditorAssignmentDialog
          open={auditorDialogOpen}
          onClose={() => setAuditorDialogOpen(false)}
          onAssign={handleAuditorAssignment}
          selectedItemIds={selectedItemIds}
          loading={isLoading}
        />

        {/* 점검결과작성 다이얼로그 */}
        <AuditResultDialog
          open={auditResultDialogOpen}
          mode={auditResultDialogMode}
          onClose={() => {
            setAuditResultDialogOpen(false);
            setSelectedItemIds([]);
            // 저장 후 데이터 새로고침
            handleFetchAuditItems();
          }}
          selectedItems={getSelectedAuditItems()}
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
