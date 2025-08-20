/**
 * 점검 현황(부서별) 페이지
 * 2개의 분리된 테이블로 구성:
 * 1) 부서별 점검결과 현황
 * 2) 부서별 개선계획 이행 현황
 */
import ErrorDialog from '@/app/components/ErrorDialog';
import '@/assets/scss/style.css';
import { Button } from '@/shared/components/ui/button';
import SearchButton from '@/shared/components/ui/button/SearchButton';
import ExcelDownloadButton from '@/shared/components/ui/button/ExcelDownloadButton';
import LedgerOrdersHodSelect from '@/shared/components/ui/form/LedgerOrdersHodSelect';
import DepartmentSearchBox from '@/shared/components/ui/form/DepartmentSearchBox';
import { PageContainer } from '@/shared/components/ui/layout/PageContainer';
import { PageContent } from '@/shared/components/ui/layout/PageContent';
import { PageHeader } from '@/shared/components/ui/layout/PageHeader';
import type { SelectOption } from '@/shared/types/common';
import { useReduxState } from '@/app/store/use-store';
import { Groups as GroupsIcon, Clear as ClearIcon, Description as DescriptionIcon } from '@mui/icons-material';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { 
  auditProgMngtApi,
  type DeptAuditResultStatusDto,
  type DeptImprovementPlanStatusDto 
} from '@/domains/inquiry/api/auditProgMngtApi';
import type { Department } from '@/domains/common/components/search/DepartmentSearchPopup';
import AuditResultReportDialog from '../components/AuditResultReportDialog';

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
  
  // 검색 조건 상태
  const [selectedLedgerOrdersHod, setSelectedLedgerOrdersHod] = useState<SelectOption | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  // 결과보고서 다이얼로그 상태
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportDialogMode, setReportDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentAuditProgMngtId, setCurrentAuditProgMngtId] = useState<number | undefined>(undefined);

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
   * 검색 실행
   */
  const handleSearch = useCallback(async () => {
    await Promise.all([
      fetchDeptAuditResultStatus(),
      fetchDeptImprovementPlanStatus()
    ]);
  }, [fetchDeptAuditResultStatus, fetchDeptImprovementPlanStatus]);

  /**
   * 필터 초기화
   */
  const handleClearFilter = () => {
    setFilter({});
    setSelectedLedgerOrdersHod(null);
    setSelectedDepartment(null);
  };

  /**
   * 검색 조건 적용
   */
  const applySearchConditions = () => {
    setFilter({
      ledgerOrdersId: selectedLedgerOrdersHod ? Number(selectedLedgerOrdersHod.value) : undefined,
      deptCd: selectedDepartment?.deptCode || undefined
    });
  };


  // 검색 조건이 변경될 때마다 필터 적용
  useEffect(() => {
    applySearchConditions();
  }, [selectedLedgerOrdersHod, selectedDepartment]);

  // 초기 데이터 로드
  useEffect(() => {
    handleSearch();
  }, []);

  const handleErrorDialogClose = () => {
    setErrorDialogOpen(false);
    setErrorMessage('');
  };

  /**
   * 점검결과 현황 합계 계산
   */
  const calculateAuditResultTotal = (): DeptAuditResultStatusDto => {
    const total = auditResultRows.reduce((acc, row) => {
      acc.totalCount += row.totalCount;
      acc.appropriateCount += row.appropriateCount;
      acc.inadequateCount += row.inadequateCount;
      acc.excludedCount += row.excludedCount;
      return acc;
    }, {
      totalCount: 0,
      appropriateCount: 0,
      inadequateCount: 0,
      excludedCount: 0
    });

    const appropriateRate = total.totalCount > 0 
      ? Math.round((total.appropriateCount / total.totalCount) * 100 * 100) / 100
      : 0;

    return {
      deptCd: '합계',
      deptName: '합계',
      totalCount: total.totalCount,
      appropriateCount: total.appropriateCount,
      inadequateCount: total.inadequateCount,
      excludedCount: total.excludedCount,
      appropriateRate: appropriateRate
    };
  };

  /**
   * 개선계획 이행 현황 합계 계산
   */
  const calculateImprovementPlanTotal = (): DeptImprovementPlanStatusDto => {
    const total = improvementPlanRows.reduce((acc, row) => {
      acc.inadequateCount += row.inadequateCount;
      acc.planCreatedCount += row.planCreatedCount;
      acc.resultWrittenCount += row.resultWrittenCount;
      acc.resultApprovedCount += row.resultApprovedCount;
      return acc;
    }, {
      inadequateCount: 0,
      planCreatedCount: 0,
      resultWrittenCount: 0,
      resultApprovedCount: 0
    });

    const completionRate = total.inadequateCount > 0 
      ? Math.round((total.resultApprovedCount / total.inadequateCount) * 100 * 100) / 100
      : 0;

    return {
      deptCd: '합계',
      deptName: '합계',
      inadequateCount: total.inadequateCount,
      planCreatedCount: total.planCreatedCount,
      resultWrittenCount: total.resultWrittenCount,
      resultApprovedCount: total.resultApprovedCount,
      completionRate: completionRate
    };
  };

  const auditResultTotal = calculateAuditResultTotal();
  const improvementPlanTotal = calculateImprovementPlanTotal();

  /**
   * 결과보고서 작성 버튼 활성화 여부 확인
   * PC03 직급 코드를 가진 사용자만 활성화
   */
  const isReportButtonEnabled = () => {
    return loginData?.positionCode === 'PC03';
  };

  /**
   * 결과보고서 작성 버튼 클릭
   */
  const handleCreateReport = () => {
    // 권한 체크
    if (!isReportButtonEnabled()) {
      setErrorMessage('결과보고서 작성 권한이 없습니다. (PC03 직급만 가능)');
      setErrorDialogOpen(true);
      return;
    }

    // 현재 선택된 원장차수 확인
    const auditProgMngtId = selectedLedgerOrdersHod ? Number(selectedLedgerOrdersHod.value) : undefined;
    
    if (!auditProgMngtId) {
      setErrorMessage('결과보고서를 작성할 원장차수를 선택해주세요.');
      setErrorDialogOpen(true);
      return;
    }

    setCurrentAuditProgMngtId(auditProgMngtId);
    setReportDialogMode('create');
    setReportDialogOpen(true);
  };

  /**
   * 결과보고서 저장 완료 후 처리
   */
  const handleReportSaved = () => {
    // 데이터 새로고침
    handleSearch();
    setReportDialogOpen(false);
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
            value={selectedLedgerOrdersHod?.value || ''}
            onChange={(value, ledgerOrdersHodId, ledgerOrdersHodStatusCd) => {
              if (value && value !== 'ALL') {
                setSelectedLedgerOrdersHod({ 
                  value: String(value), 
                  label: String(value),
                  ledgerOrdersHodId, 
                  ledgerOrdersHodStatusCd 
                });
              } else {
                setSelectedLedgerOrdersHod(null);
              }
            }}
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
          <Button
            startIcon={<ClearIcon />}
            onClick={handleClearFilter}
            variant="outlined"
            size="small"
            sx={{
              height: '32px',
              minWidth: '80px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 1,
            }}
          >
            초기화
          </Button>
        </Box>

        {/* 결과보고서 작성 버튼 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={<DescriptionIcon />}
            onClick={handleCreateReport}
            disabled={!isReportButtonEnabled()}
            sx={{
              height: '32px',
              minWidth: '120px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: 1,
              opacity: isReportButtonEnabled() ? 1 : 0.5,
            }}
            title={!isReportButtonEnabled() ? 'PC03 직급만 결과보고서 작성이 가능합니다.' : ''}
          >
            결과보고서 작성
          </Button>
        </Box>

        <Box sx={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
          
          {/* 첫 번째 테이블: 부서별 점검결과 현황 */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
              p: 2,
              backgroundColor: 'var(--bank-bg-secondary)',
              border: '1px solid var(--bank-border)',
              borderRadius: '4px',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  점검결과 현황
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  총 {auditResultRows.length}개 부서
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <ExcelDownloadButton
                  onDownload={() => {
                    // Excel 다운로드 구현
                    console.log('점검결과 현황 Excel 다운로드');
                  }}
                />
              </Box>
            </Box>
            
            <Paper sx={{ 
              height: 'calc(50vh - 100px)', 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              <TableContainer sx={{ 
                flex: 1,
                overflow: 'auto',
                position: 'relative',
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '4px' },
              }}>
                <Table stickyHeader size="small" sx={{
                  '& .MuiTableHead-root .MuiTableCell-root': {
                    backgroundColor: 'var(--bank-bg-secondary) !important',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    border: '1px solid var(--bank-border)',
                  },
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ minWidth: 120 }}>부서명</TableCell>
                      <TableCell align="center" sx={{ minWidth: 80 }}>전체</TableCell>
                      <TableCell align="center" sx={{ minWidth: 80 }}>적정</TableCell>
                      <TableCell align="center" sx={{ minWidth: 80 }}>미흡</TableCell>
                      <TableCell align="center" sx={{ minWidth: 80 }}>점검제외</TableCell>
                      <TableCell align="center" sx={{ minWidth: 100 }}>적정수행율(%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditResultRows.map((row, index) => (
                      <TableRow 
                        key={`${row.deptCd}-${index}`}
                        hover
                        sx={{ 
                          '& td': { 
                            border: '1px solid var(--bank-border)',
                            fontSize: '0.875rem',
                          }
                        }}
                      >
                        <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'var(--bank-bg-secondary)' }}>
                          {row.deptName}
                        </TableCell>
                        <TableCell align="center">{row.totalCount.toLocaleString()}</TableCell>
                        <TableCell align="center">{row.appropriateCount.toLocaleString()}</TableCell>
                        <TableCell align="center">{row.inadequateCount.toLocaleString()}</TableCell>
                        <TableCell align="center">{row.excludedCount.toLocaleString()}</TableCell>
                        <TableCell align="center">{row.appropriateRate}%</TableCell>
                      </TableRow>
                    ))}
                    
                    {/* 합계 행 */}
                    <TableRow sx={{
                      backgroundColor: 'var(--bank-primary-bg)',
                      '& td': {
                        borderTop: '2px solid var(--bank-primary)',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                      }
                    }}>
                      <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'var(--bank-primary-bg)' }}>
                        {auditResultTotal.deptName}
                      </TableCell>
                      <TableCell align="center">{auditResultTotal.totalCount.toLocaleString()}</TableCell>
                      <TableCell align="center">{auditResultTotal.appropriateCount.toLocaleString()}</TableCell>
                      <TableCell align="center">{auditResultTotal.inadequateCount.toLocaleString()}</TableCell>
                      <TableCell align="center">{auditResultTotal.excludedCount.toLocaleString()}</TableCell>
                      <TableCell align="center">{auditResultTotal.appropriateRate}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>

          {/* 두 번째 테이블: 부서별 개선계획 이행 현황 */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
              p: 2,
              backgroundColor: 'var(--bank-bg-secondary)',
              border: '1px solid var(--bank-border)',
              borderRadius: '4px',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  개선계획 이행 현황
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  총 {improvementPlanRows.length}개 부서
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <ExcelDownloadButton
                  onDownload={() => {
                    // Excel 다운로드 구현
                    console.log('개선계획 이행 현황 Excel 다운로드');
                  }}
                />
              </Box>
            </Box>
            
            <Paper sx={{ 
              height: 'calc(50vh - 100px)', 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden',
            }}>
              <TableContainer sx={{ 
                flex: 1,
                overflow: 'auto',
                position: 'relative',
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#c1c1c1', borderRadius: '4px' },
              }}>
                <Table stickyHeader size="small" sx={{
                  '& .MuiTableHead-root .MuiTableCell-root': {
                    backgroundColor: 'var(--bank-bg-secondary) !important',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    border: '1px solid var(--bank-border)',
                  },
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ minWidth: 120 }}>부서명</TableCell>
                      <TableCell align="center" sx={{ minWidth: 80 }}>미흡사항</TableCell>
                      <TableCell align="center" sx={{ minWidth: 100 }}>개선계획작성</TableCell>
                      <TableCell align="center" sx={{ minWidth: 100 }}>이행결과작성</TableCell>
                      <TableCell align="center" sx={{ minWidth: 120 }}>이행결과결재완료</TableCell>
                      <TableCell align="center" sx={{ minWidth: 100 }}>이행완료율(%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {improvementPlanRows.map((row, index) => (
                      <TableRow 
                        key={`${row.deptCd}-${index}`}
                        hover
                        sx={{ 
                          '& td': { 
                            border: '1px solid var(--bank-border)',
                            fontSize: '0.875rem',
                          }
                        }}
                      >
                        <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'var(--bank-bg-secondary)' }}>
                          {row.deptName}
                        </TableCell>
                        <TableCell align="center">{row.inadequateCount.toLocaleString()}</TableCell>
                        <TableCell align="center">{row.planCreatedCount.toLocaleString()}</TableCell>
                        <TableCell align="center">{row.resultWrittenCount.toLocaleString()}</TableCell>
                        <TableCell align="center">{row.resultApprovedCount.toLocaleString()}</TableCell>
                        <TableCell align="center">{row.completionRate}%</TableCell>
                      </TableRow>
                    ))}
                    
                    {/* 합계 행 */}
                    <TableRow sx={{
                      backgroundColor: 'var(--bank-primary-bg)',
                      '& td': {
                        borderTop: '2px solid var(--bank-primary)',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                      }
                    }}>
                      <TableCell align="center" sx={{ fontWeight: 'bold', backgroundColor: 'var(--bank-primary-bg)' }}>
                        {improvementPlanTotal.deptName}
                      </TableCell>
                      <TableCell align="center">{improvementPlanTotal.inadequateCount.toLocaleString()}</TableCell>
                      <TableCell align="center">{improvementPlanTotal.planCreatedCount.toLocaleString()}</TableCell>
                      <TableCell align="center">{improvementPlanTotal.resultWrittenCount.toLocaleString()}</TableCell>
                      <TableCell align="center">{improvementPlanTotal.resultApprovedCount.toLocaleString()}</TableCell>
                      <TableCell align="center">{improvementPlanTotal.completionRate}%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Box>

        {/* 결과보고서 다이얼로그 */}
        <AuditResultReportDialog
          open={reportDialogOpen}
          mode={reportDialogMode}
          auditProgMngtId={currentAuditProgMngtId}
          deptCd={selectedDepartment?.deptCode || loginData?.deptCd}
          deptName={selectedDepartment?.deptName || loginData?.deptCd}
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