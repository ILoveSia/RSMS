/**
 * 임원별 소관부서 이행점검 현황 페이지
 * 임원이 소관하는 부서들의 점검결과 및 개선계획 이행 현황을 분리된 테이블로 표시
 */
import { ModernAlert } from '@/shared/components/modal';
import '@/assets/scss/style.css';
import { SearchButton } from '@/shared/components/ui/button';
import { DataGrid } from '@/shared/components/ui/data-display';
import LedgerOrdersHodSelect from '@/shared/components/ui/form/LedgerOrdersHodSelect';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { SelectOption, DataGridColumn } from '@/shared/types/common';
import { useReduxState } from '@/app/store/use-store';
import { 
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  PendingActions as PendingActionsIcon,
  Groups as GroupsIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { 
  Box, 
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider
} from '@mui/material';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { 
  type DeptAuditResultStatusDto,
  type DeptImprovementPlanStatusDto 
} from '@/domains/inquiry/api/auditProgMngtApi';
import { executiveDashboardApi, type ExecutiveDepartmentInfo } from '@/domains/dashboard/api/executiveDashboardApi';
import AuditResultReportDialog from '@/domains/inquiry/components/AuditResultReportDialog';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import Toast from '@/shared/components/ui/feedback/Toast';
import { getAuditItemStatusList, type AuditItemStatusResponse } from '@/domains/inquiry/api/auditItemApi';

// 임원 정보 타입
interface ExecutiveInfo {
  execofficerId: number;
  empId: string;
  positionsId: number;
  positionsName?: string;
  ledgerOrder: number;
  isExecutive: boolean;
  departmentCount?: number;
}

// 임원 소관부서 현황 타입
interface ExecutiveDepartmentStatusDto {
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

// LoginUser 타입
interface LoginUser {
  userid: string;
  username: string;
  email: string;
  empNo: string;
  deptCd: string;
  positionCode: string;
  role?: string;
  accessibleMenus?: any[];
}

// 조회 필터 인터페이스
interface ExecutiveSearchFilter {
  ledgerOrdersHodId?: number;
}

// 임원 소관부서 점검항목 현황 타입 (AuditItemStatusResponse 기반)
interface ExecutiveAuditItemRow {
  id: string;
  hodIcItemId: number;
  responsibilityDetailContent: string;
  positionsNm: string;
  deptCd: string;
  deptName: string;
  fieldTypeCd: string;
  roleTypeCd: string;
  icTask: string;
  auditMenId: string;
  auditResultStatusCd: string;
  auditDoneDt: string;
  auditDetailContent: string;
  auditFinalResultYn: string;
}

const ExecutiveDashboardStatusPage: React.FC = () => {
  // 로그인 사용자 정보 가져오기
  const { data: loginData } = useReduxState<LoginUser>('loginStore/login');
  const { snackbar, showSuccess, showError, hideSnackbar } = useSnackbar();

  // 상태 관리
  const [filter, setFilter] = useState<ExecutiveSearchFilter>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 임원 정보 상태
  const [executiveInfo, setExecutiveInfo] = useState<ExecutiveInfo | null>(null);
  const [isExecutive, setIsExecutive] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState(true);

  // 테이블 데이터 상태
  const [auditResultRows, setAuditResultRows] = useState<DeptAuditResultStatusDto[]>([]);
  const [improvementPlanRows, setImprovementPlanRows] = useState<DeptImprovementPlanStatusDto[]>([]);
  const [combinedRows, setCombinedRows] = useState<ExecutiveDepartmentStatusDto[]>([]);
  
  // 임원 소관부서 점검항목 현황 상태
  const [auditItemRows, setAuditItemRows] = useState<ExecutiveAuditItemRow[]>([]);
  
  // 임원 소관부서 목록 상태
  const [executiveDepartments, setExecutiveDepartments] = useState<ExecutiveDepartmentInfo[]>([]);

  // 검색 조건 상태
  const [selectedLedgerOrdersHod, setSelectedLedgerOrdersHod] = useState<SelectOption | null>(null);

  // 결과보고서 다이얼로그 상태
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportDialogMode, setReportDialogMode] = useState<'create' | 'edit' | 'view'>('view');
  const [currentAuditProgMngtId, setCurrentAuditProgMngtId] = useState<number | undefined>(undefined);
  const [selectedDeptForReport, setSelectedDeptForReport] = useState<{ deptCd: string; deptName: string } | null>(null);

  /**
   * 원장차수 변경 핸들러
   */
  const handleLedgerOrderChange = useCallback((value: string) => {
    if (value && value !== 'ALL') {
      setSelectedLedgerOrdersHod({ 
        value: String(value), 
        label: String(value)
      });
    } else {
      setSelectedLedgerOrdersHod(null);
    }
  }, []);

  /**
   * 임원 권한 확인 - positionCode 기반 체크
   */
  const checkExecutiveAuth = useCallback(async () => {
    try {
      setAuthLoading(true);
      
      // 실제 임원 권한 체크: positionCode가 "PC05"인지 확인
      const isExecutivePosition = loginData?.positionCode === "PC05";
      
      if (isExecutivePosition) {
        console.log('임원 권한 확인됨:', loginData?.positionCode);
        
        // 임원 소관부서 조회
        try {
          const departments = await executiveDashboardApi.getExecutiveDepartments(loginData?.empNo || '');
          setExecutiveDepartments(departments);
          console.log('임원 소관부서 조회 성공:', departments);
        } catch (error) {
          console.error('임원 소관부서 조회 실패:', error);
          setExecutiveDepartments([]);
        }
        
        const executiveInfo: ExecutiveInfo = {
          execofficerId: 1,
          empId: loginData?.empNo || 'testuser',
          positionsId: 1,
          positionsName: '임원',
          ledgerOrder: 1,
          isExecutive: true,
          departmentCount: 5
        };
        
        setExecutiveInfo(executiveInfo);
        setIsExecutive(true);
      } else {
        console.log('임원 권한 없음:', loginData?.positionCode);
        setIsExecutive(false);
        setExecutiveInfo(null);
        setErrorMessage('임원 권한이 없습니다. 임원만 접근 가능한 페이지입니다.');
        setErrorDialogOpen(true);
      }
      
    } catch (error) {
      console.error('임원 권한 확인 실패:', error);
      setIsExecutive(false);
      setExecutiveInfo(null);
      setErrorMessage('임원 권한 확인 중 오류가 발생했습니다.');
      setErrorDialogOpen(true);
    } finally {
      setAuthLoading(false);
    }
  }, [loginData?.empNo, loginData?.positionCode]);

  /**
   * 소관부서별 점검결과 현황 조회
   */
  const fetchExecutiveAuditResultStatus = useCallback(async () => {
    if (!isExecutive || !executiveInfo) return;

    try {
      setIsLoading(true);
      
      // 실제 임원 소관부서별 점검결과 현황 API 호출
      const data = await executiveDashboardApi.getExecutiveAuditResultStatus(
        executiveInfo.empId, 
        filter.ledgerOrdersHodId
      );
      setAuditResultRows(data);
      
    } catch (err) {
      console.error('소관부서 점검결과 현황 조회 실패:', err);
      setErrorMessage('소관부서 점검결과 현황 조회에 실패했습니다.');
      setErrorDialogOpen(true);
      setAuditResultRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter.ledgerOrdersHodId, isExecutive, executiveInfo]);

  /**
   * 소관부서별 개선계획 이행 현황 조회
   */
  const fetchExecutiveImprovementPlanStatus = useCallback(async () => {
    if (!isExecutive || !executiveInfo) return;

    try {
      setIsLoading(true);
      
      // 실제 임원 소관부서별 개선계획 이행 현황 API 호출
      const data = await executiveDashboardApi.getExecutiveImprovementPlanStatus(
        executiveInfo.empId, 
        filter.ledgerOrdersHodId
      );
      setImprovementPlanRows(data);
      
    } catch (err) {
      console.error('소관부서 개선계획 이행 현황 조회 실패:', err);
      setErrorMessage('소관부서 개선계획 이행 현황 조회에 실패했습니다.');
      setErrorDialogOpen(true);
      setImprovementPlanRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter.ledgerOrdersHodId, isExecutive, executiveInfo]);

  /**
   * 임원 소관부서 점검항목 현황 조회
   */
  const fetchExecutiveAuditItems = useCallback(async () => {
    if (!isExecutive || !executiveInfo || executiveDepartments.length === 0) {
      setAuditItemRows([]);
      return;
    }

    try {
      setIsLoading(true);
      
      // 임원 소관부서 코드 목록 추출
      const executiveDeptCodes = executiveDepartments.map(dept => dept.ownerDeptCd);
      console.log('임원 소관부서 코드들:', executiveDeptCodes);
      
      // 전체 점검항목 조회
      const apiResponse = await getAuditItemStatusList({
        ledgerOrdersHod: filter.ledgerOrdersHodId,
      });

      if (apiResponse && Array.isArray(apiResponse)) {
        // 임원 소관부서의 점검항목만 필터링
        const filteredItems = apiResponse.filter(item => 
          executiveDeptCodes.includes(item.deptCd)
        );
        
        console.log('전체 점검항목 수:', apiResponse.length);
        console.log('임원 소관부서 점검항목 수:', filteredItems.length);
        
        const executiveItems: ExecutiveAuditItemRow[] = filteredItems.map((item, index) => ({
          id: `${item.hodIcItemId}_${index}`,
          hodIcItemId: item.hodIcItemId,
          responsibilityDetailContent: item.responsibilityDetailContent || '',
          positionsNm: item.positionsNm || '',
          deptCd: item.deptCd || '',
          deptName: (item as any).deptName || '',
          fieldTypeCd: item.fieldTypeCd || '',
          roleTypeCd: item.roleTypeCd || '',
          icTask: item.icTask || '',
          auditMenId: item.auditMenId || '미지정',
          auditResultStatusCd: item.auditResultStatusCd || '',
          auditDoneDt: item.auditDoneDt || '',
          auditDetailContent: item.auditDetailContent || '',
          auditFinalResultYn: item.auditFinalResultYn || 'N'
        }));
        
        setAuditItemRows(executiveItems);
      } else {
        setAuditItemRows([]);
      }
      
    } catch (err) {
      console.error('임원 소관부서 점검항목 조회 실패:', err);
      setAuditItemRows([]);
    }
  }, [filter.ledgerOrdersHodId, isExecutive, executiveInfo, executiveDepartments]);

  /**
   * 임원 소관부서 점검항목 DataGrid 컬럼 정의
   */
  const auditItemColumns: DataGridColumn<ExecutiveAuditItemRow>[] = [
    {
      field: 'hodIcItemId',
      headerName: '항목ID',
      width: 100,
    },
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
      field: 'deptName',
      headerName: '부서',
      width: 120,
    },
    {
      field: 'fieldTypeCd',
      headerName: '항목구분',
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
      width: 120,
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
      field: 'auditFinalResultYn',
      headerName: '점검 및 이행완료',
      width: 140,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => {
        return (
          <Chip
            label={value === 'Y' ? '점검완료' : '진행중'}
            color={value === 'Y' ? 'success' : 'warning'}
            size="small"
          />
        );
      },
    }
  ];

  /**
   * 두 데이터를 부서코드 기준으로 통합
   */
  const combineData = useCallback((
    auditData: DeptAuditResultStatusDto[], 
    improvementData: DeptImprovementPlanStatusDto[]
  ): ExecutiveDepartmentStatusDto[] => {
    const deptMap = new Map<string, ExecutiveDepartmentStatusDto>();

    // 점검결과 데이터 추가
    auditData.forEach(audit => {
      deptMap.set(audit.deptCd, {
        deptCd: audit.deptCd,
        deptName: audit.deptName,
        totalCount: audit.totalCount || 0,
        appropriateCount: audit.appropriateCount || 0,
        inadequateCount: audit.inadequateCount || 0,
        excludedCount: audit.excludedCount || 0,
        appropriateRate: audit.appropriateRate || 0,
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
        existing.planCreatedCount = improvement.planCreatedCount || 0;
        existing.resultWrittenCount = improvement.resultWrittenCount || 0;
        existing.resultApprovedCount = improvement.resultApprovedCount || 0;
        existing.completionRate = improvement.completionRate || 0;
      } else {
        deptMap.set(improvement.deptCd, {
          deptCd: improvement.deptCd,
          deptName: improvement.deptName,
          totalCount: 0,
          appropriateCount: 0,
          inadequateCount: improvement.inadequateCount || 0,
          excludedCount: 0,
          appropriateRate: 0,
          planCreatedCount: improvement.planCreatedCount || 0,
          resultWrittenCount: improvement.resultWrittenCount || 0,
          resultApprovedCount: improvement.resultApprovedCount || 0,
          completionRate: improvement.completionRate || 0,
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
    if (!isExecutive) {
      showError('임원 권한이 필요합니다.');
      return;
    }
    
    await Promise.all([
      fetchExecutiveAuditResultStatus(),
      fetchExecutiveImprovementPlanStatus(),
      fetchExecutiveAuditItems()
    ]);
  }, [fetchExecutiveAuditResultStatus, fetchExecutiveImprovementPlanStatus, fetchExecutiveAuditItems, isExecutive, showError]);

  // 검색 조건이 변경될 때 필터만 적용
  useEffect(() => {
    setFilter({
      ledgerOrdersHodId: selectedLedgerOrdersHod ? Number(selectedLedgerOrdersHod.value) : undefined
    });
  }, [selectedLedgerOrdersHod]);

  // 컴포넌트 마운트 시 임원 권한 확인
  useEffect(() => {
    if (loginData?.empNo) {
      checkExecutiveAuth();
    }
  }, [loginData?.empNo, checkExecutiveAuth]);

  // 임원 권한 확인 후 초기 데이터 로드
  useEffect(() => {
    if (isExecutive && !authLoading && executiveDepartments.length > 0) {
      handleSearch();
    }
  }, [isExecutive, authLoading, executiveDepartments.length, handleSearch]);

  const handleErrorDialogClose = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

  /**
   * 부서명 클릭 처리 (보고서 조회)
   */
  const handleDeptNameClick = useCallback((row: ExecutiveDepartmentStatusDto) => {
    if (row.auditResultReportId) {
      setCurrentAuditProgMngtId(row.auditProgMngtId || undefined);
      setSelectedDeptForReport({ deptCd: row.deptCd, deptName: row.deptName });
      setReportDialogMode('view');
      setReportDialogOpen(true);
    }
  }, []);

  /**
   * 결과보고서 저장 완료 후 처리
   */
  const handleReportSaved = () => {
    handleSearch();
    setReportDialogOpen(false);
    setSelectedDeptForReport(null);
  };

  // DataGrid 컬럼 정의는 더 이상 사용하지 않음 (대시보드 카드 형태로 변경)

  /**
   * 통합 데이터 합계 계산
   */
  const calculateTotal = (): ExecutiveDepartmentStatusDto => {
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

  const totalData = useMemo(() => calculateTotal(), [combinedRows]);

  // 로딩 중
  if (authLoading) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  // 임원 권한 없음
  if (!isExecutive) {
    return (
      <PageContainer>
        <PageContent>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Alert severity="warning" sx={{ maxWidth: 400, mx: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                임원 권한이 필요합니다
              </Typography>
              <Typography variant="body2">
                현재 로그인한 계정은 임원 권한이 없습니다.
              </Typography>
            </Alert>
          </Box>
        </PageContent>
      </PageContainer>
    );
  }

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
        title="[650] 임원별 소관부서 이행점검 현황 [DashBord]"
        icon={<BusinessIcon />}
        description={`${executiveInfo?.positionsName || '임원'} 소관부서의 점검결과 및 개선계획 이행 현황을 조회합니다.`}
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
          overflow: 'auto',
          minHeight: 0,
          position: 'relative',
          py: 1,
        }}
      >
        {/* 임원 정보 패널 */}
        {/* {executiveInfo && (
          <Box sx={{ 
            mb: 2, 
            p: 2, 
            backgroundColor: 'var(--bank-bg-secondary)',
            border: '1px solid var(--bank-border)',
            borderRadius: '4px'
          }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <BusinessIcon color="primary" />
              </Grid>
              <Grid item xs>
                <Typography variant="h6" fontWeight="bold">
                  {executiveInfo.positionsName} 소관부서 현황
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  관할 부서: {executiveDepartments.length}개 부서 (점검현황: {combinedRows.length}개 부서)
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )} */}

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
          <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginLeft: '16px' }}>점검회차</span>
          <LedgerOrdersHodSelect
            value={String(selectedLedgerOrdersHod?.value || 'ALL')}
            onChange={handleLedgerOrderChange}
            size="small"
            disabled={isLoading}
            includeAll={true}
            sx={{ minWidth: 150, maxWidth: 200 }}
          />
          
          <SearchButton onClick={handleSearch} loading={isLoading} disabled={isLoading} />
        </Box>

        {/* 소관부서 점검항목 현황 DataGrid */}
        <Box sx={{ mb: 2 }}>
          <Paper sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', fontSize: '1rem' }}>
                <AssignmentIcon color="primary" sx={{ mr: 1, fontSize: '1.2rem' }} />
                소관부서 점검항목 현황
                <Chip 
                  label={`${auditItemRows.length}건`} 
                  color="primary" 
                  size="small" 
                  sx={{ ml: 1, fontWeight: 'bold' }} 
                />
              </Typography>
            </Box>
            
            {executiveDepartments.length === 0 && isExecutive && !authLoading ? (
              <Box sx={{ 
                height: '280px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px'
              }}>
                <Typography variant="body2" color="textSecondary">
                  임원 소관부서 정보를 불러오는 중입니다...
                </Typography>
              </Box>
            ) : (
              <DataGrid
                data={auditItemRows}
                columns={auditItemColumns}
                loading={isLoading}
                error={null}
                selectable={false}
                rowIdField="id"
                sx={{
                  height: '280px',
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'var(--bank-bg-secondary) !important',
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                  },
                  '& .MuiDataGrid-row': {
                    cursor: 'default',
                  },
                  '& .MuiDataGrid-cell': {
                    fontSize: '0.8rem',
                  },
                }}
              />
            )}
          </Paper>
        </Box>

        {/* 대시보드 카드 레이아웃 */}
        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {/* 소관부서 점검현황 카드 */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ 
              minHeight: '250px', 
              maxHeight: '400px',
              height: Math.max(250, Math.min(400, 120 + combinedRows.length * 80)),
              display: 'flex', 
              flexDirection: 'column' 
            }}>
              <CardHeader
                avatar={<AssessmentIcon color="primary" />}
                title="소관부서 점검현황"
                subheader={`총 ${combinedRows.length}개 부서`}
                sx={{
                  pb: 1,
                  '& .MuiCardHeader-title': {
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: 'var(--bank-primary)'
                  }
                }}
              />
              <CardContent sx={{ flex: 1, pt: 0, overflow: 'auto' }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {combinedRows.map((row, index) => (
                      <Paper 
                        key={row.deptCd} 
                        sx={{ 
                          p: 1.5, 
                          border: '1px solid var(--bank-border)',
                          borderRadius: '6px',
                          backgroundColor: index % 2 === 0 ? '#fff' : 'var(--bank-bg-secondary)',
                          cursor: row.auditResultReportId ? 'pointer' : 'default',
                          '&:hover': row.auditResultReportId ? {
                            backgroundColor: 'var(--bank-bg-hover)',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                          } : {}
                        }}
                        onClick={() => row.auditResultReportId && handleDeptNameClick(row)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: row.auditResultReportId ? 'var(--bank-primary)' : '#333',
                              textDecoration: row.auditResultReportId ? 'underline' : 'none'
                            }}
                          >
                            {row.deptName}
                          </Typography>
                          <Chip 
                            label={`${row.appropriateRate.toFixed(1)}%`}
                            color={
                              row.appropriateRate >= 90 ? 'success' :
                              row.appropriateRate >= 70 ? 'warning' : 'error'
                            }
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                                {row.totalCount.toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                전체
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                {row.appropriateCount.toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                적정
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#f44336' }}>
                                {row.inadequateCount.toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                미흡
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1 }}>
                              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#9e9e9e' }}>
                                {row.excludedCount.toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                제외
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* 소관부서 미흡사항현황 카드 */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ 
              minHeight: '250px', 
              maxHeight: '400px',
              height: Math.max(250, Math.min(400, 120 + combinedRows.filter(row => row.inadequateCount > 0).length * 80)),
              display: 'flex', 
              flexDirection: 'column' 
            }}>
              <CardHeader
                avatar={<WarningIcon color="error" />}
                title="소관부서 미흡사항현황"
                subheader={`미흡 총 ${combinedRows.reduce((sum, row) => sum + row.inadequateCount, 0).toLocaleString()}건`}
                sx={{
                  pb: 1,
                  '& .MuiCardHeader-title': {
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    color: '#f44336'
                  }
                }}
              />
              <CardContent sx={{ flex: 1, pt: 0, overflow: 'auto' }}>
                {isLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {combinedRows
                      .filter(row => row.inadequateCount > 0)
                      .sort((a, b) => b.inadequateCount - a.inadequateCount)
                      .map((row, index) => (
                      <Paper 
                        key={row.deptCd} 
                        sx={{ 
                          p: 1.5, 
                          border: '1px solid #ffcdd2',
                          borderRadius: '6px',
                          backgroundColor: index % 2 === 0 ? '#fff' : '#ffeef0',
                          cursor: 'default'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: '#333'
                            }}
                          >
                            {row.deptName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip 
                              label={`미흡 ${row.inadequateCount}건`}
                              color="error"
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                            <Chip 
                              label={`완료율 ${row.completionRate.toFixed(1)}%`}
                              color={
                                row.completionRate >= 80 ? 'success' :
                                row.completionRate >= 50 ? 'warning' : 'error'
                              }
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </Box>
                        </Box>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#856404' }}>
                                {row.planCreatedCount.toLocaleString()}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#856404' }}>
                                계획수립
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#cce5ff', borderRadius: '4px' }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#004085' }}>
                                {row.resultWrittenCount.toLocaleString()}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#004085' }}>
                                이행작성
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#d1e7dd', borderRadius: '4px' }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0a3622' }}>
                                {row.resultApprovedCount.toLocaleString()}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#0a3622' }}>
                                이행완료
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 1, backgroundColor: '#f8d7da', borderRadius: '4px' }}>
                              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#721c24' }}>
                                {(row.inadequateCount - row.resultApprovedCount).toLocaleString()}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#721c24' }}>
                                진행중
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                    {combinedRows.filter(row => row.inadequateCount > 0).length === 0 && (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CheckCircleIcon sx={{ fontSize: 48, color: '#4caf50', mb: 2 }} />
                        <Typography variant="h6" color="success.main" fontWeight="bold">
                          미흡사항이 없습니다
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          모든 부서의 점검결과가 적정입니다.
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 대시보드 요약 통계 카드 */}
        {isExecutive && (
        <Grid container spacing={1.5} sx={{ mt: 1, mb: 2 }}>
          <Grid item xs={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center'
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <GroupsIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  {combinedRows.length}
                </Typography>
                <Typography variant="caption" display="block">
                  관할 부서
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              textAlign: 'center'
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <AssignmentIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  {totalData.totalCount.toLocaleString()}
                </Typography>
                <Typography variant="caption" display="block">
                  전체 점검항목
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              textAlign: 'center'
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <CheckCircleIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  {totalData.appropriateRate}%
                </Typography>
                <Typography variant="caption" display="block">
                  전체 적정율
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              textAlign: 'center'
            }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <TrendingUpIcon sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  {totalData.completionRate}%
                </Typography>
                <Typography variant="caption" display="block">
                  이행완료율
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        )}

        {/* 결과보고서 다이얼로그 */}
        <AuditResultReportDialog
          open={reportDialogOpen}
          mode={reportDialogMode}
          auditProgMngtId={currentAuditProgMngtId}
          deptCd={selectedDeptForReport?.deptCd || loginData?.deptCd}
          deptName={selectedDeptForReport?.deptName || loginData?.deptCd}
          empNo={loginData?.empNo || ''}
          empName={loginData?.username || ''}
          onClose={() => setReportDialogOpen(false)}
          onSave={handleReportSaved}
        />

        {/* 모던 에러 알림 다이얼로그 */}
        <ModernAlert
          open={errorDialogOpen}
          severity="error"
          title="오류"
          message={errorMessage}
          onConfirm={handleErrorDialogClose}
          onClose={handleErrorDialogClose}
        />

        {/* Toast 알림 */}
        <Toast
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={hideSnackbar}
        />
      </PageContent>
    </PageContainer>
  );
};

export default ExecutiveDashboardStatusPage;