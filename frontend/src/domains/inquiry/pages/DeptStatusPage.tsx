/**
 * 점검 현황(부서별) 페이지
 * 2개의 분리된 테이블로 구성:
 * 1) 부서별 점검결과 현황
 * 2) 부서별 개선계획 이행 현황
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { Button, SearchButton } from '@/shared/components/ui/button';
import LedgerOrdersHodSelect from '@/shared/components/ui/form/LedgerOrdersHodSelect';
import DepartmentSearchBox from '@/shared/components/ui/form/DepartmentSearchBox';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import DataGrid from '@/shared/components/ui/data-display/DataGrid';
import type { SelectOption, DataGridColumn } from '@/shared/types/common';
import { useReduxState } from '@/app/store/use-store';
import { Groups as GroupsIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { 
  Box, 
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { 
  auditProgMngtApi,
  type DeptAuditResultStatusDto,
  type DeptImprovementPlanStatusDto 
} from '@/domains/inquiry/api/auditProgMngtApi';

// 통합 부서별 현황 타입
interface CombinedDeptStatusDto {
  deptCd: string;
  deptName: string;
  // 점검결과 현황
  totalCount: number;
  appropriateCount: number;
  inadequateCount: number;
  excludedCount: number;
  appropriateRate: number;
  // 개선계획 이행 현황
  planCreatedCount: number;
  resultWrittenCount: number;
  resultApprovedCount: number;
  completionRate: number;
  // audit_result_report 및 approval 정보
  auditProgMngtId?: number;
  auditResultReportId?: number;
  approvalId?: number;
  approvalStatusCd?: string;
  approvalStatusName?: string;
}
import type { Department } from '@/domains/common/components/search/DepartmentSearchPopup';
import AuditResultReportDialog from '../components/AuditResultReportDialog';
import ApprovalActionButton from '@/shared/components/approval/ApprovalActionButton';

// LoginUser 타입 (로그인 API 응답에 맞춤)
interface LoginUser {
  userid: string;
  username: string;  // 직원명 (employee.emp_name)
  email: string;
  empNo: string;     // 사번 (users.emp_no)
  deptCd: string;    // 부서코드 (employee.dept_code)
  positionCode: string; // 직급코드 (employee.position_code)
  role?: string;
  accessibleMenus?: any[];
}

interface IDeptStatusPageProps {
  className?: string;
}

// 조회 필터 인터페이스
interface SearchFilter {
  ledgerOrdersId?: number;   // 원장차수 ID
  deptCd?: string;           // 부서코드
}

const DeptStatusPage: React.FC<IDeptStatusPageProps> = () => {
  // 로그인 사용자 정보 가져오기
  const { data: loginData } = useReduxState<LoginUser>('loginStore/login');
  
  // 상태 관리
  const [filter, setFilter] = useState<SearchFilter>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // 테이블 데이터 상태
  const [auditResultRows, setAuditResultRows] = useState<DeptAuditResultStatusDto[]>([]);
  const [improvementPlanRows, setImprovementPlanRows] = useState<DeptImprovementPlanStatusDto[]>([]);
  const [combinedRows, setCombinedRows] = useState<CombinedDeptStatusDto[]>([]);
  
  // 검색 조건 상태
  const [selectedLedgerOrdersHod, setSelectedLedgerOrdersHod] = useState<SelectOption | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  // 결과보고서 다이얼로그 상태
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportDialogMode, setReportDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentAuditProgMngtId, setCurrentAuditProgMngtId] = useState<number | undefined>(undefined);
  const [selectedDeptForReport, setSelectedDeptForReport] = useState<{ deptCd: string; deptName: string } | null>(null);
  
  // DataGrid 체크박스 선택 상태 (단일 선택)
  const [selectedRow, setSelectedRow] = useState<string | number | null>(null);
  const [selectedData, setSelectedData] = useState<CombinedDeptStatusDto | null>(null);

  /**
   * 부서별 점검결과 현황 조회
   */
  const fetchDeptAuditResultStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const data = await auditProgMngtApi.getDeptAuditResultStatus(filter.ledgerOrdersId, filter.deptCd);
      setAuditResultRows(data);
      
    } catch (err) {
      console.error('부서별 점검결과 현황 조회 실패:', err);
      setErrorMessage('부서별 점검결과 현황 조회에 실패했습니다.');
      setErrorDialogOpen(true);
      setAuditResultRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter.ledgerOrdersId, filter.deptCd]);

  /**
   * 부서별 개선계획 이행 현황 조회
   */
  const fetchDeptImprovementPlanStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const data = await auditProgMngtApi.getDeptImprovementPlanStatus(filter.ledgerOrdersId, filter.deptCd);
      setImprovementPlanRows(data);
      
    } catch (err) {
      console.error('부서별 개선계획 이행 현황 조회 실패:', err);
      setErrorMessage('부서별 개선계획 이행 현황 조회에 실패했습니다.');
      setErrorDialogOpen(true);
      setImprovementPlanRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter.ledgerOrdersId, filter.deptCd]);

  /**
   * 두 데이터를 부서코드 기준으로 통합
   */
  const combineData = useCallback((auditData: DeptAuditResultStatusDto[], improvementData: DeptImprovementPlanStatusDto[]): CombinedDeptStatusDto[] => {
    const deptMap = new Map<string, CombinedDeptStatusDto>();

    // 점검결과 데이터 추가
    auditData.forEach(audit => {
      deptMap.set(audit.deptCd, {
        deptCd: audit.deptCd,
        deptName: audit.deptName,
        totalCount: audit.totalCount,
        appropriateCount: audit.appropriateCount,
        inadequateCount: audit.inadequateCount,
        excludedCount: audit.excludedCount,
        appropriateRate: audit.appropriateRate,
        planCreatedCount: 0,
        resultWrittenCount: 0,
        resultApprovedCount: 0,
        completionRate: 0,
        auditProgMngtId: (audit as any).auditProgMngtId || undefined,
        auditResultReportId: (audit as any).auditResultReportId || undefined,
        approvalId: (audit as any).approvalId || undefined,
        approvalStatusCd: (audit as any).approvalStatusCd || 'NONE',
        approvalStatusName: (audit as any).approvalStatusName || '미결재'
      });
    });

    // 개선계획 데이터 병합
    improvementData.forEach(improvement => {
      const existing = deptMap.get(improvement.deptCd);
      if (existing) {
        existing.planCreatedCount = improvement.planCreatedCount;
        existing.resultWrittenCount = improvement.resultWrittenCount;
        existing.resultApprovedCount = improvement.resultApprovedCount;
        existing.completionRate = improvement.completionRate;
      } else {
        deptMap.set(improvement.deptCd, {
          deptCd: improvement.deptCd,
          deptName: improvement.deptName,
          totalCount: 0,
          appropriateCount: 0,
          inadequateCount: improvement.inadequateCount,
          excludedCount: 0,
          appropriateRate: 0,
          planCreatedCount: improvement.planCreatedCount,
          resultWrittenCount: improvement.resultWrittenCount,
          resultApprovedCount: improvement.resultApprovedCount,
          completionRate: improvement.completionRate,
          auditProgMngtId: undefined,
          auditResultReportId: undefined,
          approvalId: undefined,
          approvalStatusCd: 'NONE',
          approvalStatusName: '미결재'
        });
      }
    });

    return Array.from(deptMap.values()).sort((a, b) => a.deptName.localeCompare(b.deptName));
  }, []);

  // 데이터가 변경될 때마다 통합 데이터 업데이트
  useEffect(() => {
    const combined = combineData(auditResultRows, improvementPlanRows);
    setCombinedRows(combined);
  }, [auditResultRows, improvementPlanRows, combineData]);

  /**
   * 검색 실행
   */
  const handleSearch = useCallback(async () => {
    await Promise.all([
      fetchDeptAuditResultStatus(),
      fetchDeptImprovementPlanStatus()
    ]);
  }, [fetchDeptAuditResultStatus, fetchDeptImprovementPlanStatus]);




  // 검색 조건이 변경될 때 필터만 적용 (자동 검색 방지)
  useEffect(() => {
    setFilter({
      ledgerOrdersId: selectedLedgerOrdersHod ? Number(selectedLedgerOrdersHod.value) : undefined,
      deptCd: selectedDepartment?.deptCode || undefined
    });
  }, [selectedLedgerOrdersHod, selectedDepartment]);

  // 초기 데이터 로드 (한 번만 실행)
  useEffect(() => {
    handleSearch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleErrorDialogClose = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

  /**
   * 통합 데이터 합계 계산
   */
  const calculateCombinedTotal = (): CombinedDeptStatusDto => {
    const total = combinedRows.reduce((acc, row) => {
      acc.totalCount += row.totalCount;
      acc.appropriateCount += row.appropriateCount;
      acc.inadequateCount += row.inadequateCount;
      acc.excludedCount += row.excludedCount;
      acc.planCreatedCount += row.planCreatedCount;
      acc.resultWrittenCount += row.resultWrittenCount;
      acc.resultApprovedCount += row.resultApprovedCount;
      return acc;
    }, {
      totalCount: 0,
      appropriateCount: 0,
      inadequateCount: 0,
      excludedCount: 0,
      planCreatedCount: 0,
      resultWrittenCount: 0,
      resultApprovedCount: 0
    });

    const appropriateRate = total.totalCount > 0 
      ? Math.round((total.appropriateCount / total.totalCount) * 100 * 100) / 100
      : 0;

    const completionRate = total.inadequateCount > 0 
      ? Math.round((total.resultApprovedCount / total.inadequateCount) * 100 * 100) / 100
      : 0;

    return {
      deptCd: '합계',
      deptName: '합계',
      totalCount: total.totalCount,
      appropriateCount: total.appropriateCount,
      inadequateCount: total.inadequateCount,
      excludedCount: total.excludedCount,
      appropriateRate: appropriateRate,
      planCreatedCount: total.planCreatedCount,
      resultWrittenCount: total.resultWrittenCount,
      resultApprovedCount: total.resultApprovedCount,
      completionRate: completionRate
    };
  };

  const combinedTotal = calculateCombinedTotal();

  /**
   * 부서명 클릭 처리 (상세조회)
   */
  const handleDeptNameClick = useCallback((row: CombinedDeptStatusDto) => {
    if (row.auditResultReportId) {
      // 이미 결과보고서가 있으면 조회 모드로 열기
      setCurrentAuditProgMngtId(row.auditProgMngtId || undefined);
      setSelectedDeptForReport({ deptCd: row.deptCd, deptName: row.deptName });
      setReportDialogMode('view');
      setReportDialogOpen(true);
    }
  }, []);

  /**
   * DataGrid 컬럼 정의
   */
  const columns: DataGridColumn<CombinedDeptStatusDto>[] = useMemo(() => [
    {
      field: 'deptName',
      headerName: '부서명',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value, row }) => (
        <Typography 
          variant="body2" 
          fontWeight="bold" 
          sx={{ 
            color: row.auditResultReportId ? 'var(--bank-primary)' : '#333',
            textDecoration: row.auditResultReportId ? 'underline' : 'none',
            cursor: row.auditResultReportId ? 'pointer' : 'default',
            '&:hover': row.auditResultReportId ? {
              color: 'var(--bank-primary-dark)',
            } : {}
          }}
          onClick={(e) => {
            if (row.auditResultReportId) {
              e.stopPropagation(); // 행 클릭 이벤트 방지
              handleDeptNameClick(row);
            }
          }}
        >
          {value}
        </Typography>
      )
    },
    // 점검결과 현황 컬럼들
    {
      field: 'totalCount',
      headerName: '전체',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Typography variant="body2">
          {Number(value).toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'appropriateCount',
      headerName: '적정',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Typography variant="body2">
          {Number(value).toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'inadequateCount',
      headerName: '미흡',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Typography variant="body2">
          {Number(value).toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'excludedCount',
      headerName: '점검제외',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Typography variant="body2">
          {Number(value).toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'appropriateRate',
      headerName: '적정수행율(%)',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Typography variant="body2">
          {Number(value)}%
        </Typography>
      )
    },
    // 개선계획 이행 현황 컬럼들
    {
      field: 'planCreatedCount',
      headerName: '개선계획작성',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Typography variant="body2">
          {Number(value).toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'resultWrittenCount',
      headerName: '이행결과작성',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Typography variant="body2">
          {Number(value).toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'resultApprovedCount',
      headerName: '이행결과결재완료',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Typography variant="body2">
          {Number(value).toLocaleString()}
        </Typography>
      )
    },
    {
      field: 'completionRate',
      headerName: '이행완료율(%)',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Typography variant="body2">
          {Number(value)}%
        </Typography>
      )
    },
    {
      field: 'approvalStatusName',
      headerName: '결재상태',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value, row }) => (
        <Typography
          variant="caption"
          sx={{
            color: row.approvalStatusCd === 'APPROVED' ? 'success.main' : 
                  row.approvalStatusCd === 'IN_PROGRESS' ? 'primary.main' :
                  row.approvalStatusCd === 'SUBMITTED' ? 'info.main' :
                  row.approvalStatusCd === 'REJECTED' ? 'error.main' : 'warning.main',
            fontWeight: 'bold'
          }}
        >
          {value || '미결재'}
        </Typography>
      )
    },
    {
      field: 'approvalAction',
      headerName: '결재상신',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      renderCell: ({ row }) => {
        // 결과보고서가 있는 경우 결재 상태에 관계없이 ApprovalActionButton 표시
        if (row.auditResultReportId) {
          return (
            <ApprovalActionButton
              taskType="audit_result_report"
              taskId={Number(row.auditResultReportId)}
              taskTitle={`부서별 점검 결과보고서 - ${row.deptName}`}
              currentUserId={loginData?.userid || 'unknown'}
              onApprovalStateChange={() => {
                // 결재 상태 변경 시 데이터 새로고침
                handleSearch();
              }}
              size="small"
              variant="contained"
            />
          );
        }
        return null;
      }
    }
  ], [loginData?.userid, handleSearch, handleDeptNameClick]);

  /**
   * 결과보고서 작성 버튼 활성화 여부 확인
   * PC03 직급 코드를 가진 사용자만 활성화
   */
  const isReportButtonEnabled = () => {
    return loginData?.positionCode === 'PC03';
  };


  /**
   * 결과보고서 저장 완료 후 처리
   */
  const handleReportSaved = () => {
    // 데이터 새로고침
    handleSearch();
    setReportDialogOpen(false);
    setSelectedDeptForReport(null);
  };

  /**
   * DataGrid 행 선택 변경 처리 (단일 선택)
   */
  const handleRowSelectionChange = (selectedRowIds: (string | number)[], selectedRowData: CombinedDeptStatusDto[]) => {
    const selectedId = selectedRowIds.length > 0 ? selectedRowIds[0] : null;
    const selectedItem = selectedRowData.length > 0 ? selectedRowData[0] : null;
    
    setSelectedRow(selectedId);
    setSelectedData(selectedItem);
  };

  /**
   * 선택된 부서의 결과보고서 작성
   */
  const handleCreateReportForSelected = () => {
    if (!selectedData) {
      setErrorMessage('결과보고서를 작성할 부서를 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    // 이미 결과보고서가 등록된 부서인지 체크
    if (selectedData.auditResultReportId) {
      setErrorMessage('이미 결과보고서가 등록된 부서입니다. 부서명을 클릭하여 조회하세요.');
      setErrorDialogOpen(true);
      return;
    }

    // 권한 체크
    if (!isReportButtonEnabled()) {
      setErrorMessage('결과보고서 작성 권한이 없습니다. (PC03 직급만 가능)');
      setErrorDialogOpen(true);
      return;
    }

    // 선택된 부서의 auditProgMngtId 사용
    const auditProgMngtId = selectedData.auditProgMngtId;
    
    if (!auditProgMngtId) {
      setErrorMessage('점검계획관리 정보가 없습니다. 원장차수를 다시 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    // 선택된 부서로 다이얼로그 열기
    setCurrentAuditProgMngtId(auditProgMngtId);
    setSelectedDeptForReport({ 
      deptCd: selectedData.deptCd, 
      deptName: selectedData.deptName 
    });
    setReportDialogMode('create');
    setReportDialogOpen(true);
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
        title="[630] 부서별 점검 결과 보고"
        icon={<GroupsIcon />}
        description="부서별 점검결과 및 개선계획 이행 현황을 조회합니다."
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
        {/* 검색 조건 */}
        <Box
          sx={{
            display: 'flex',
            gap: '8px',
            marginBottom: '16px',
            alignItems: 'center',
            backgroundColor: 'var(--bank-bg-secondary)',
            border: '1px solid var(--bank-border)',
            padding: '8px 16px',
            borderRadius: '4px',
          }}
        >
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333' }}>검색조건</span>
          
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>원장차수</span>
          <LedgerOrdersHodSelect
            value={selectedLedgerOrdersHod?.value || 'ALL'}
            onChange={useCallback((value: string) => {
              if (value && value !== 'ALL') {
                setSelectedLedgerOrdersHod({ 
                  value: String(value), 
                  label: String(value)
                });
              } else {
                setSelectedLedgerOrdersHod(null);
              }
            }, [])}
            size="small"
            disabled={isLoading}
            includeAll={true}
            sx={{ minWidth: 150, maxWidth: 200 }}
          />
          
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>부서</span>
          <DepartmentSearchBox
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            size="small"
            disabled={isLoading}
            sx={{ minWidth: 150, maxWidth: 200 }}
          />
          
          <SearchButton onClick={handleSearch} loading={isLoading} disabled={isLoading} />
        </Box>

        {/* 액션 버튼들 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 0.5, 
          gap: 1,
          alignItems: 'center',
          height: '32px',
        }}>
          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={<DescriptionIcon />}
            onClick={handleCreateReportForSelected}
            disabled={!isReportButtonEnabled() || !selectedData || !!selectedData.auditResultReportId}
            sx={{
              height: '32px',
              minWidth: '120px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 1,
            }}
          >
            선택부서 결과보고서 작성
          </Button>
          {selectedData && (
            <Typography variant="body2" sx={{ color: 'text.secondary', ml: 1 }}>
              선택됨: {selectedData.deptName}
            </Typography>
          )}
        </Box>

        <Box sx={{ width: '100%', flex: 1 }}>
          <DataGrid
            data={combinedRows}
            columns={columns}
            loading={isLoading}
            height={600}
            selectable={true}
            multiSelect={false}
            selectedRows={selectedRow ? [selectedRow] : []}
            onRowSelectionChange={handleRowSelectionChange}
            rowIdField="deptCd"
            sx={{
              width: '100%',
              height: '500px',
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'var(--bank-bg-secondary) !important',
                fontWeight: 'bold',
              }
            }}
          />

          {/* 합계 정보 표시 */}
          <Box sx={{ 
            mt: 1,
            p: 1.5,
            backgroundColor: 'var(--bank-bg-secondary)',
            border: '1px solid var(--bank-border)',
            borderRadius: '4px',
          }}>
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="body2" fontWeight="bold" color="primary">
                합계: 총 {combinedRows.length}개 부서
              </Typography>
              <Typography variant="body2">
                전체: <strong>{combinedTotal.totalCount.toLocaleString()}</strong>
              </Typography>
              <Typography variant="body2">
                적정: <strong>{combinedTotal.appropriateCount.toLocaleString()}</strong>
              </Typography>
              <Typography variant="body2">
                미흡: <strong>{combinedTotal.inadequateCount.toLocaleString()}</strong>
              </Typography>
              <Typography variant="body2">
                적정수행율: <strong>{combinedTotal.appropriateRate}%</strong>
              </Typography>
              <Typography variant="body2">
                이행완료율: <strong>{combinedTotal.completionRate}%</strong>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 결과보고서 다이얼로그 */}
        <AuditResultReportDialog
          open={reportDialogOpen}
          mode={reportDialogMode}
          auditProgMngtId={currentAuditProgMngtId}
          deptCd={selectedDeptForReport?.deptCd || selectedDepartment?.deptCode || loginData?.deptCd}
          deptName={selectedDeptForReport?.deptName || selectedDepartment?.deptName || loginData?.deptCd}
          empNo={loginData?.empNo || ''}
          empName={loginData?.username || ''}
          onClose={() => setReportDialogOpen(false)}
          onSave={handleReportSaved}
        />

        {/* 에러 다이얼로그 */}
        <ErrorDialog
          open={errorDialogOpen}
          errorMessage={errorMessage}
          onClose={handleErrorDialogClose}
        />
      </PageContent>
    </PageContainer>
  );
};

export default DeptStatusPage;